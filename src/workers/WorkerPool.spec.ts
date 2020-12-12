import { WorkerPool } from './WorkerPool';

import * as original from './FlexibleWorker';
jest.mock('./FlexibleWorker');

const mocked = original as jest.Mocked<typeof original>;
const FlexibleWorker = mocked.FlexibleWorker;

describe('The worker pool', () => {
    beforeEach(() => {
        FlexibleWorker.mockClear();
    });
    test('Creates the desired number of workers', () => {
        new WorkerPool('no source', 10);
        expect(FlexibleWorker).toHaveBeenCalledTimes(10);
    });
});
