//@flow

export interface Storage {
    save(value: any): void,
    load<T>(): ?T,
    clear(): void
}

export class LocalStorage implements Storage {
    key: string

    constructor(key: string) {
        this.key = key;
    }

    save(value: any) {
        window.localStorage.setItem(this.key, JSON.stringify(value));
    }

    load<T>() {
        return JSON.parse(window.localStorage.getItem(this.key));
    }

    clear() {
        window.localStorage.removeItem(this.key);
    }
}
