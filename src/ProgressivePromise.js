//@flow

type WorkerFn<T> = (resolve: (T) => void, reject: (Error) => void, progress: (T) => void) => ?T;
type CallbackFn<T> = (T) => ?T;

function ProgressivePromise<T>(worker: WorkerFn<T>) {
    const p = new Promise<T>((resolve, reject) => {

    });

    p.progress
}

export default ProgressivePromise;

export class ProgressivePromise<T> {
    

    constructor(worker: WorkerFn<T>) {

    }

    each() {

    }

    then() {

    }

    catch() {

    }
}