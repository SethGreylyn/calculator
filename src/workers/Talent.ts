import { Worker } from 'worker_threads';

export class Talent {
    worker: Worker;
    private isIdle: boolean;

    constructor(workerSource: string) {
        this.worker = new Worker(workerSource);
        this.isIdle = false;
    }

    public employ(): void {
        this.isIdle = false;
    }

    public setIdle(): void {
        this.isIdle = true;
    }

    public getIsIdle(): boolean {
        return this.isIdle;
    }
}
