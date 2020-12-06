import { Worker } from 'worker_threads';

type TaskCallback<N> = (err: unknown, result?: N) => void;

export interface Task<T, N> {
    callback: TaskCallback<N>;
    getData: () => T;
}

export class FlexibleWorker extends Worker {
    private isIdle: boolean;

    constructor(private workerSource: string) {
        super(workerSource);
        this.isIdle = false;
    }

    public employ<T, N>(tasks: Task<T, N>[]): void {
        this.isIdle = false;

        const task = tasks.shift();

        const messageCallback = (result: N) => {
            task.callback(null, result);
            finishTask();
        };

        const errorCallback = (error: unknown) => {
            task.callback(error);
            finishTask();
        };

        const finishTask = () => {
            this.removeAllListeners('message');
            this.removeAllListeners('error');

            if (tasks.length > 0) {
                this.employ(tasks);
            } else {
                this.isIdle = true;
            }
        };

        this.once('message', messageCallback);
        this.once('error', errorCallback);
        this.postMessage(task.getData());
    }

    public getIsIdle(): boolean {
        return this.isIdle;
    }
}
