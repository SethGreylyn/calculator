import { isMainThread, parentPort } from 'worker_threads';

if (isMainThread) {
    throw new Error('Main thread is not a worker');
}

const calculate = (decimalPlaces: number): string => {
    return `I LIKE PI to ${decimalPlaces} decimal places`;
};

parentPort?.on('message', (decimalPlaces: number) => {
    const pi = calculate(decimalPlaces);
    parentPort?.postMessage(pi);
});
