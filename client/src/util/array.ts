export interface ListLike<T> {
    readonly length: number;
    readonly lastIndex: number | undefined;
    readonly firstIndex: number | undefined;

    clear(): void;

    get(index: number): T | undefined;

    set(index: number, value: T): void;

    insert(index: number, ...items: T[]): void;

    push(...items: T[]): void;

    pop(): T | undefined;

    unshift(...items: T[]): void;

    shift(): T | undefined;

    toArray(): T[];
}

export class ArrayList<T> implements ListLike<T> {

    #array: (T | undefined)[];
    #length = 0

    set growSize(value: number) {
        if (value < 1)
            throw Error('Grow size must be at least 1')
    }

    get length() {
        return this.#length
    }

    get lastIndex() {
        if (this.length > 0)
            return this.#length - 1
        return undefined
    }

    get firstIndex() {
        if (this.length > 0)
            return 0
        return undefined
    }


    constructor(readonly initialCapacity: number = 0) {
        this.#array = Array.from({length: initialCapacity}, () => undefined)
    }

    clear() {
        this.#array = Array.from({length: this.initialCapacity}, () => undefined)
        this.#length = 0
    }

    get(index: number): T | undefined {
        if (index < 0 || index >= this.#length) return undefined
        return this.#array[index]
    }

    set(index: number, value: T): void {
        if (index < 0 || index >= this.#length) throw new Error(`index out of bounds: tried to access value at index ${index} of ArrayList with length ${this.length}`)
        this.#array[index] = value
    }

    insert(index: number, ...items: T[]) {
        this.#length += items.length
        this.#array.splice(index, 0, ...items)
    }

    push() {
        const newLength = this.#length + arguments.length
        const offset = this.#length

        this.resize(newLength)

        for (let i = 0; i < arguments.length; i++) {
            this.#array[i + offset] = arguments[i]
        }
    }

    pop(): T | undefined {
        const index = this.lastIndex
        if (index !== undefined) {
            const item = this.#array[index]
            this.resize(this.length - 1)
            return item
        }
        return undefined
    }

    unshift(...items: T[]) {
        this.insert(0, ...items)
    }

    shift(): T | undefined {
        if (this.length > 0) {
            this.#length--

            //just using real shift here cuz I don't see a point in optimizing this
            return this.#array.shift()
        }

        return undefined
    }

    private resize(targetSize: number) {
        let currentCapacity = this.#array.length

        if (targetSize > currentCapacity) {
            let newCapacity = currentCapacity + Math.ceil(currentCapacity * 0.5)
            while (newCapacity < targetSize) {
                newCapacity = newCapacity + Math.ceil(newCapacity * 0.5)
            }
            this.#array.push(...Array.from({length: newCapacity - currentCapacity}, () => undefined))
        } else if (targetSize < currentCapacity / 2) {
            let newCapacity = Math.floor(currentCapacity / 2)
            while (newCapacity > targetSize * 2) {
                newCapacity = Math.floor(newCapacity / 2)
            }
            this.#array.splice(newCapacity)
        }
    }

    toArray(): T[] {
        return this.#array.slice(0, this.length) as T[]
    }

}


export class Float32List implements ListLike<number> {

    #array: Float32Array;
    #length = 0

    set growSize(value: number) {
        if (value < 1)
            throw Error('Grow size must be at least 1')
    }

    get length() {
        return this.#length
    }

    get lastIndex() {
        if (this.length > 0)
            return this.#length - 1
        return undefined
    }

    get firstIndex() {
        if (this.length > 0)
            return 0
        return undefined
    }

    constructor(readonly initialCapacity: number = 0) {
        this.#array = new Float32Array(initialCapacity)
    }

    clear() {
        this.#array = new Float32Array(this.initialCapacity)
        this.#length = 0
    }

    get(index: number): number | undefined {
        if (index < 0 || index >= this.#length) return undefined
        return this.#array[index]
    }

    set(index: number, value: number): void {
        if (index < 0 || index >= this.#length) throw new Error(`index out of bounds: tried to access value at index ${index} of ArrayList with length ${this.length}`)
        this.#array[index] = value
    }

    insert(index: number, ...items: number[]) {
        this.#length += items.length
        this.resize(this.#length)

        this.#array.set(this.#array.slice(index), index + items.length)
        this.#array.set(items, index)
    }

    push(...items: number[]) {
        const newLength = this.#length + items.length
        const offset = this.#length
        this.resize(newLength)

        this.#array.set(items, offset)
        this.#length = newLength
    }

    pop(): number | undefined {
        const index = this.lastIndex
        if (index !== undefined) {
            const item = this.#array[index]
            this.#length--
            return item
        }
        return undefined
    }

    unshift(...items: number[]) {
        this.insert(0, ...items)
    }

    shift(): number | undefined {
        if (this.length > 0) {
            this.#length--
            const item = this.#array[0]
            this.#array.set(this.#array.slice(1))
            return item
        }

        return undefined
    }

    private resize(targetSize: number) {
        let currentSize = this.#array.length

        if (targetSize > currentSize) {
            let newSize = Math.max(currentSize + Math.ceil(currentSize * 0.5), 1)
            while (newSize < targetSize) {
                newSize = newSize + Math.ceil(newSize * 0.5)
            }
            const arr = new Float32Array(newSize)
            arr.set(this.#array)
            this.#array = arr
        } else if (targetSize < currentSize / 2) {
            let newSize = Math.ceil(currentSize / 2)
            while (newSize > targetSize * 2) {
                newSize = Math.ceil(newSize / 2)
            }

            this.#array = this.#array.slice(0, newSize)
        }
        this.#length = targetSize
    }

    toArray(): number[] {
        return [...this.#array.slice(0, this.length)]
    }


    toFloat32Array(): Float32Array {
        return this.#array.slice(0, this.length)
    }

}


export class Int32List implements ListLike<number> {

    #array: Int32Array;
    #length = 0

    set growSize(value: number) {
        if (value < 1)
            throw Error('Grow size must be at least 1')
    }

    get length() {
        return this.#length
    }

    get lastIndex() {
        if (this.length > 0)
            return this.#length - 1
        return undefined
    }

    get firstIndex() {
        if (this.length > 0)
            return 0
        return undefined
    }


    constructor(readonly initialCapacity: number = 0) {
        this.#array = new Int32Array(initialCapacity)
    }

    clear() {
        this.#array = new Int32Array(this.initialCapacity)
        this.#length = 0
    }

    get(index: number): number | undefined {
        if (index < 0 || index >= this.#length) return undefined
        return this.#array[index]
    }

    set(index: number, value: number): void {
        if (index < 0 || index >= this.#length) throw new Error(`index out of bounds: tried to access value at index ${index} of ArrayList with length ${this.length}`)
        this.#array[index] = value
    }

    insert(index: number, ...items: number[]) {
        this.#length += items.length
        this.resize(this.#length)

        this.#array.set(this.#array.slice(index), index + items.length)
        this.#array.set(items, index)
    }

    push(...items: number[]) {
        const newLength = this.#length + items.length
        const offset = this.#length
        this.resize(newLength)

        this.#array.set(items, offset)
        this.#length = newLength
    }

    pop(): number | undefined {
        const index = this.lastIndex
        if (index !== undefined) {
            const item = this.#array[index]
            this.#length--
            return item
        }
        return undefined
    }

    unshift(...items: number[]) {
        this.insert(0, ...items)
    }

    shift(): number | undefined {
        if (this.length > 0) {
            this.#length--
            const item = this.#array[0]
            this.#array.set(this.#array.slice(1))
            return item
        }

        return undefined
    }

    private resize(targetSize: number) {
        let currentSize = this.#array.length

        if (targetSize > currentSize) {
            let newSize = Math.max(currentSize + Math.ceil(currentSize * 0.5), 1)
            while (newSize < targetSize) {
                newSize = newSize + Math.ceil(newSize * 0.5)
            }
            const arr = new Int32Array(newSize)
            arr.set(this.#array)
            this.#array = arr
        } else if (targetSize < currentSize / 2) {
            let newSize = Math.ceil(currentSize / 2)
            while (newSize > targetSize * 2) {
                newSize = Math.ceil(newSize / 2)
            }

            this.#array = this.#array.slice(0, newSize)
        }
        this.#length = targetSize
    }

    toArray(): number[] {
        return [...this.#array.slice(0, this.length)]
    }


    toInt32Array(): Int32Array {
        return this.#array.slice(0, this.length)
    }

}

export function pairwise<T>(array: T[], func: (curr: T, next: T, index: number) => void) {
    for (let i = 0; i < array.length - 1; i++) {
        func(array[i], array[i + 1], i)
    }
}