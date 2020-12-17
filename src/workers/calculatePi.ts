import { isMainThread, parentPort } from 'worker_threads';

if (isMainThread) {
    throw new Error('Main thread is not a worker');
}

/**
 * An algorithm for printing pi, based on the spigot algorithm of
 * Rabinowitz and Wagon, described here: https://www.cut-the-knot.org/Curriculum/Algorithms/SpigotForPi.shtml
 * @param decimalPlaces
 */
const calculate = (decimalPlaces: number): string => {
    const nativePiArrayLength = Math.floor((10 * decimalPlaces) / 3) + 1;
    let nativePiArray = Array.from({ length: nativePiArrayLength }).map(
        () => 2
    );

    for (let i = 0; i < decimalPlaces; i++) {
        nativePiArray = nativePiArray.map((nativeDigit) => nativeDigit * 10);
    }

    return `I LIKE PI to ${decimalPlaces} decimal places`;
};

parentPort?.on('message', (decimalPlaces: number) => {
    const pi = calculate(decimalPlaces);
    parentPort?.postMessage(pi);
});
