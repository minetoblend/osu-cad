export interface Disposable {

    dispose(): void

}

export type IntoDisposable = (() => void);

export class DisposableObject implements Disposable {

    #disposables: Disposable[] = []

    addDisposable(...disposables: (Disposable | IntoDisposable)[]) {
        this.#disposables.push(...disposables.map(it => {
            if (typeof it === "function")
                return disposable(it)
            return it
        }))
    }

    dispose() {
        this.#disposables.forEach(it => it.dispose())
        this.#disposables = []
    }

}

export class Lifetime implements Disposable {

    #disposables: Disposable[] = []

    add(...disposables: (Disposable | IntoDisposable)[]) {
        this.#disposables.push(...disposables.map(it => {
            if (typeof it === "function")
                return disposable(it)
            return it
        }))
    }

    dispose() {
        this.#disposables.forEach(it => it.dispose())
        this.#disposables = []
    }

}

export function disposable(disposeFunction: () => void): Disposable {
    return {
        dispose: () => disposeFunction()
    }
}