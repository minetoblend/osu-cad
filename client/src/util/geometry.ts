import {Float32List} from "@/util/array";

export class GeometryBuilder {

    #positions = new Float32List(5000)
    #uvs = new Float32List(2000)
    #indices: number[] = []

    #cursor = 0

    constructor() {
    }

    get cursor() {
        return this.#cursor
    }

    addTriangle(
        x1: number, y1: number, z1: number,
        x2: number, y2: number, z2: number,
        x3: number, y3: number, z3: number,
        uvx1: number, uvy1: number,
        uvx2: number, uvy2: number,
        uvx3: number, uvy3: number,
    ) {
        this.#positions.push(
            x1, y1, z1,
            x2, y2, z2,
            x3, y3, z3,
        )

        this.#uvs.push(
            uvx1, uvy1,
            uvx2, uvy2,
            uvx3, uvy3,
        )

        const cursor = this.#cursor

        this.#indices.push(cursor, cursor + 1, cursor + 2)

        this.#cursor += 3
    }

    addQuad(
        x1: number, y1: number, z1: number,
        x2: number, y2: number, z2: number,
        x3: number, y3: number, z3: number,
        x4: number, y4: number, z4: number,
        uvx1: number, uvy1: number,
        uvx2: number, uvy2: number,
        uvx3: number, uvy3: number,
        uvx4: number, uvy4: number,
    ) {
        this.#positions.push(
            x1, y1, z1,
            x2, y2, z2,
            x3, y3, z3,
            x4, y4, z4,
        )

        this.#uvs.push(
            uvx1, uvy1,
            uvx2, uvy2,
            uvx3, uvy3,
            uvx4, uvy4,
        )

        const cursor = this.#cursor

        this.#indices.push(
            cursor, cursor + 1, cursor + 2,
            cursor, cursor + 3, cursor + 4
        )

        this.#cursor += 4
    }

    addQuadAlongLine(fromX: number, fromY: number, toX: number, toY: number, width: number) {

    }

    addTriangleFan(positions: number[] | Float32Array, uvs: number[] | Float32Array) {
        const indices: number[] = []
        const numPoints = positions.length / 3

        for (let i = 1; i < numPoints - 1; i++) {
            indices.push(0, i, i + 1)
        }


        this.addGeometry(positions, uvs, indices)
    }

    addPositionsUvs(positions: number[] | Float32Array, uvs: number[] | Float32Array) {
        this.#positions.push(...positions)
        this.#uvs.push(...uvs)
        this.#cursor += uvs.length >> 1
    }

    addGeometry(positions: number[] | Float32Array, uvs: number[] | Float32Array, indices: number[], absolute = false) {
        if (!absolute) {
            const cursor = this.#cursor
            indices = indices.map(it => it + cursor)
        }
        this.#positions.push(...positions)
        this.#uvs.push(...uvs)
        this.#indices.push(...indices)
        this.#cursor += uvs.length >> 1
    }

    get positions() {
        return this.#positions.toFloat32Array()
    }

    get uvs() {
        return this.#uvs.toFloat32Array()
    }

    get indices() {
        return this.#indices
    }
}