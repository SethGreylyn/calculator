import { FlexibleWorker, Task } from './FlexibleWorker';

export class WorkerPool<T, N> {
    private tasks: Task<T, N>[] = [];
    private pool: FlexibleWorker[] = [];

    constructor(public workerSource: string, public poolSize: number) {
        if (this.poolSize < 1) {
            return;
        }

        this.pool = Array(this.poolSize)
            .fill(null)
            .map(() => new FlexibleWorker(this.workerSource));
    }

    private getIdleWorker(): FlexibleWorker | undefined {
        return this.pool.filter(({ getIsIdle }) => !getIsIdle())[0];
    }

    async run(getData: () => T): Promise<N> {
        return new Promise<N>((resolve, reject) => {
            const idleWorker = this.getIdleWorker();

            const task: Task<T, N> = {
                getData,
                callback: (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(result);
                },
            };

            this.tasks.push(task);

            if (idleWorker) {
                idleWorker.employ(this.tasks);
            }
        });
    }
}
