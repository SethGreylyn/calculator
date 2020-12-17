import { AsyncResource } from 'async_hooks';
import { Worker } from 'worker_threads';

export type PoolCallback<Result> = (err: unknown, result: Result) => void;

export class WorkerPoolTaskInfo<N> extends AsyncResource {
    constructor(private callback: PoolCallback<N>) {
        super('WorkerPoolTaskInfo');
    }

    done(err: unknown, result: N): void {
        this.runInAsyncScope(this.callback, null, err, result);
        this.emitDestroy();
    }
}

export class FlexibleWorker<N> extends Worker {
    taskInfo?: WorkerPoolTaskInfo<N>;
}
