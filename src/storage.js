//@flow

export interface Storage<T> {
    save(value: any): void,
    load(): ?T,
    clear(): void
}

export class LocalStorage<T> implements Storage<T> {
    key: string

    constructor(key: string) {
        this.key = key;
    }

    save(value: mixed) {
        window.localStorage.setItem(this.key, JSON.stringify(value));
    }

    load(): ?T {
        return JSON.parse(window.localStorage.getItem(this.key));
    }

    clear() {
        window.localStorage.removeItem(this.key);
    }
}

export default LocalStorage;
