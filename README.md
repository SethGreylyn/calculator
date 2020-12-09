# calculator

An API for calculating mathematical constants which are quite computationally expensive, as an exposition of the power of worker threads for not blocking I/O in Node.

## WorkerPool

The powerhouse of the API is the custom `WorkerPool` module, adapted from the [Async Hooks](https://nodejs.org/dist/latest-v14.x/docs/api/async_hooks.html#async-resource-worker-pool) guide in the Node docs. In particular, the module incorporates Typescript, some cleaner OOP encapsulation, and more modern ES patterns.

## Endpoints

-   `/pi` calculates Pi to a given number of decimal places
