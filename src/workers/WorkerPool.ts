import { EventEmitter } from 'events';
import {
    FlexibleWorker,
    PoolCallback,
    WorkerPoolTaskInfo,
} from './FlexibleWorker';

const workerFreedEvent = Symbol('kWorkerFreedEvent');

export class WorkerPool<T, N> extends EventEmitter {
    private workers: FlexibleWorker<N>[] = [];
    constructor(private workerSource: string, poolSize: number) {
        super();
        this.workers = Array.from({ length: poolSize }).map(() =>
            this.addNewWorker()
        );
    }

    private addNewWorker(): FlexibleWorker<N> {
        const worker = new FlexibleWorker(this.workerSource);
        worker.on('message', (result) => {
            // In case of success: Call the callback that was passed to `runTask`,
            // remove the `TaskInfo` associated with the Worker, and mark it as free
            // again.
            worker.taskInfo?.done(null, result);
            worker.taskInfo = undefined;
            this.emit(workerFreedEvent);
        });
        worker.on('error', (err) => {
            // In case of an uncaught exception: Call the callback that was passed to
            // `runTask` with the error.
            if (worker.taskInfo) worker.taskInfo.done(err, null);
            else this.emit('error', err);
            // Remove the worker from the list and start a new Worker to replace the
            // current one.
            this.workers.splice(this.workers.indexOf(worker), 1);
            this.addNewWorker();
        });
        this.emit(workerFreedEvent);
        return worker;
    }

    private getIdleWorker(): FlexibleWorker<N> | undefined {
        return this.workers.find(({ taskInfo }) => !taskInfo);
    }

    runTask(task: T, callback: PoolCallback<N>): void {
        const worker = this.getIdleWorker();
        if (!worker) {
            // No free threads, wait until a worker thread becomes free.
            this.once(workerFreedEvent, () => this.runTask(task, callback));
            return;
        }

        worker.taskInfo = new WorkerPoolTaskInfo(callback);
        worker.postMessage(task);
    }

    close(): void {
        for (const worker of this.workers) worker.terminate();
    }
}
