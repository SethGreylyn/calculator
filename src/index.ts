import express from 'express';
import path from 'path';
import { WorkerPool } from './workers/WokerPool';

const app = express();
const port = 9001;

const piPool = new WorkerPool(
    path.join(__dirname, './workers/calculatePi.js'),
    10
);

app.get('/', (_, res) => {
    res.send('Hallo Welt!');
});

app.get('/pi', (_, res) => {
    await piPool.run();
});

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
