import { AsyncResource } from 'async_hooks';
import { EventEmitter } from 'events';
import path from 'path';
import { Worker } from 'worker_threads';

const kWorkerFreedEvent = Symbol('kWorkerFreedEvent');

class FlexibleWorker<N> extends Worker {
    private isIdle = true;

    kTaskInfo?: WorkerPoolTaskInfo<N>;

    constructor(source: string) {
        super(source);
    }

    employ() {
        this.isIdle = false;
    }

    unemploy() {
        this.isIdle = true;
    }

    getIsIdle() {
        return this.isIdle;
    }
}

class WorkerPoolTaskInfo<N> extends AsyncResource {
    constructor(private callback: () => void) {
        super('WorkerPoolTaskInfo');
    }

    done(err: unknown, result: N) {
        this.runInAsyncScope(this.callback, null, err, result);
        this.emitDestroy(); // `TaskInfo`s are used only once.
    }
}

export class WorkerPool<T, N> extends EventEmitter {
    private workers: FlexibleWorker<N>[] = [];
    constructor(private poolSize: number) {
        super();
        this.workers = Array.from({ length: poolSize }).map(() =>
            this.addNewWorker()
        );
    }

    addNewWorker(): FlexibleWorker<N> {
        const worker = new FlexibleWorker(
            path.resolve(__dirname, 'task_processor.js')
        );
        worker.on('message', (result) => {
            // In case of success: Call the callback that was passed to `runTask`,
            // remove the `TaskInfo` associated with the Worker, and mark it as free
            // again.
            worker.kTaskInfo?.done(null, result);
            worker.kTaskInfo = undefined;
            this.emit(kWorkerFreedEvent);
        });
        worker.on('error', (err) => {
            // In case of an uncaught exception: Call the callback that was passed to
            // `runTask` with the error.
            if (worker.kTaskInfo) worker.kTaskInfo.done(err, null);
            else this.emit('error', err);
            // Remove the worker from the list and start a new Worker to replace the
            // current one.
            this.workers.splice(this.workers.indexOf(worker), 1);
            this.addNewWorker();
        });
        this.emit(kWorkerFreedEvent);
        return worker;
    }

    getIdleWorker(): FlexibleWorker<N> | undefined {
        return this.workers.filter(({ getIsIdle }) => !getIsIdle())[0];
    }

    runTask(task: T, callback: () => void): void {
        const worker = this.getIdleWorker();
        if (!worker) {
            // No free threads, wait until a worker thread becomes free.
            this.once(kWorkerFreedEvent, () => this.runTask(task, callback));
            return;
        }

        worker.kTaskInfo = new WorkerPoolTaskInfo(callback);
        worker.postMessage(task);
    }

    close(): void {
        for (const worker of this.workers) worker.terminate();
    }
}
