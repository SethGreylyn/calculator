import { Worker } from 'worker_threads';
import { Talent } from './Talent';

type QueueCallback<N> = (err: unknown, result?: N) => void;

interface QueueItem<T, N> {
    callback: QueueCallback<N>;
    getData: () => T;
}

export class TalentPool<T, N> {
    private queue: QueueItem<T, N>[] = [];
    private pool: Talent[] = [];

    constructor(public workerSource: string, public poolSize: number) {
        if (this.poolSize < 1) {
            return;
        }

        this.pool = Array(this.poolSize).map(
            () => new Talent(this.workerSource)
        );
    }

    private getIdleTalent(): Talent | undefined {
        return this.pool.filter(({ getIsIdle }) => !getIsIdle())[0];
    }

    private async employTalent(talent: Talent, queueItem: QueueItem<T, N>) {
        talent.employ();
        const worker = talent.worker;

        const messageCallback = (result: N) => {
            queueItem.callback(null, result);
            cleanup();
        };

        const errorCallback = (error: unknown) => {
            queueItem.callback(error);
            cleanup();
        };

        const cleanup = () => {
            worker.removeAllListeners('message');
            worker.removeAllListeners('error');
            talent.setIdle();
            const nextItem = this.queue.shift();
            if (nextItem) {
                this.employTalent(talent, nextItem);
            }
        };

        worker.once('message', messageCallback);
        worker.once('error', errorCallback);
        worker.postMessage(await queueItem.getData());
    }

    async run(getData: () => T): Promise<N> {
        return new Promise<N>((resolve, reject) => {
            const availableTalent = this.getIdleTalent();

            const queueItem: QueueItem<T, N> = {
                getData,
                callback: (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(result);
                },
            };

            if (availableTalent) {
                this.employTalent(availableTalent, queueItem);
            } else {
                this.queue.push(queueItem);
            }
        });
    }
}
