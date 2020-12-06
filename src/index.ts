import express from 'express';

const app = express();
const port = 9001;

app.get('/', (req, res) => {
    res.send('Hallo Welt!');
});

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
