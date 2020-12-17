import e from 'express';
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
    let predigits: number[] = [];
    const trueDigits: number[] = [];

    for (let i = 0; i < decimalPlaces; i++) {
        nativePiArray = nativePiArray.map((nativeDigit) => nativeDigit * 10);

        for (let j = nativePiArrayLength - 1; j > 1; j--) {
            const nativeEntry = nativePiArray[j];
            const dividend = 2 * j - 1;
            const remainder = nativeEntry % dividend;
            const quotient = Math.floor(nativeEntry / dividend);
            nativePiArray[j] = remainder;
            nativePiArray[j - 1] = nativePiArray[j - 1] + quotient * (j - 1);
        }

        const predigitQuotient = nativePiArray[0] / 10;
        const predigitRemainder = nativePiArray[0] % 10;

        nativePiArray[0] = predigitRemainder;

        if (predigitQuotient !== 9 && predigitQuotient !== 10) {
            trueDigits.push(...predigits);
            predigits = [predigitQuotient];
        } else if (predigitQuotient === 9) {
            predigits.push(predigitQuotient);
        } else if (predigitQuotient === 10) {
            predigits = predigits.map((predigit) => (predigit + 1) % 10);
            trueDigits.push(...predigits);
            predigits = [0];
        }
    }

    return trueDigits.join('');
};

parentPort?.on('message', (decimalPlaces: number) => {
    const pi = calculate(decimalPlaces);
    parentPort?.postMessage(pi);
});
