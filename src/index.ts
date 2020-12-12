import express from 'express';
import { WorkerPool } from './workers/WorkerPool';

const app = express();
const port = 9001;

const piPool = new WorkerPool<unknown, string>(
    './build/workers/calculatePi.js',
    10
);

app.get('/', (_, res) => {
    res.send('Hallo Welt!');
});

app.get('/pi', (_, res) => {
    piPool.runTask(10, (err, result) => {
        if (err) {
            throw new Error('ERROR');
        }
        res.send(result);
    });
});

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
