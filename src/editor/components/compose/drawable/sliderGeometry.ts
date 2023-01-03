import {Vector2} from "osu-classes";


function getTheta(from: Vector2, to: Vector2) {
    return Math.atan2(
        to.y - from.y,
        to.x - from.x,
    )
}

class GeoBuilder {

    readonly vertices = [] as number[][]
    readonly indices = [] as number[]

    get cursor() {
        return this.vertices.length
    }

    addJoin(position: Vector2, theta: number, thetaDiff: number, radius: number) {
        let step = Math.PI / 24.0;

        let dir = Math.sign(thetaDiff);

        let absThetaDiff = Math.abs(thetaDiff);

        let amountPoints = Math.ceil(absThetaDiff / step);


        if (dir < 0.0) {
            theta += Math.PI;
        }

        let vertices = [
            [position.x, position.y, 0]
        ];

        for (let i = 0; i <= amountPoints; i++) {
            let angularOffset = Math.min(i * step, absThetaDiff);
            let angle = theta + dir * angularOffset;

            let pos = position.add(new Vector2(
                Math.sin(angle) * radius,
                -Math.cos(angle) * radius,
            ));

            vertices.push([
                pos.x, pos.y, 1
            ]);
        }

        this.addTriangleStrip(vertices);
    }

    addStraightSegment(from: Vector2, to: Vector2, radius: number) {
        let direction = to.subtract(from).normalize();
        let dirL = new Vector2(-direction.y * radius, direction.x * radius);

        let cursor = this.cursor;

        this.vertices.push(
            [from.x + dirL.x, from.y + dirL.y, 1.0],
            [from.x, from.y, 0.0],
            [from.x - dirL.x, from.y - dirL.y, 1.0],
            [to.x + dirL.x, to.y + dirL.y, 1.0],
            [to.x, to.y, 0.0],
            [to.x - dirL.x, to.y - dirL.y, 1.0],
        );

        this.indices.push(
            cursor,
            cursor + 3,
            cursor + 1,
            cursor + 3,
            cursor + 4,
            cursor + 1,
            cursor + 1,
            cursor + 4,
            cursor + 5,
            cursor + 5,
            cursor + 2,
            cursor + 1,
        );
    }

    private addTriangleStrip(vertices: number[][]) {
        let cursor = this.cursor

        this.vertices.push(...vertices);
        let num_pts = this.cursor - cursor;
        let indices = [];

        for (let i = 1; i < num_pts - 1; i++) {
            indices.push(cursor);
            indices.push(cursor + i);
            indices.push(cursor + i + 1);
        }

        this.indices.push(...indices);
    }
}

function md(a: number, n: number): number {
    return ((a % n) + n) % n
}


export function createSliderGeometry(points: Vector2[], radius: number) {
    const geo = new GeoBuilder();

    for (let i = 1; i < points.length; i++) {
        const curr = points[i];
        const prev = points[i - 1];
        const theta = getTheta(prev, curr);


        if (i === 1)
            geo.addJoin(prev, theta + Math.PI, Math.PI, radius)


        geo.addStraightSegment(prev, curr, radius)

        const next = points[i + 1];
        if (next) {
            const thetaNext = getTheta(curr, next);
            const thetaDiff = md(thetaNext - theta + Math.PI, Math.PI * 2) - Math.PI;

            geo.addJoin(curr, theta, thetaDiff, radius)
        } else {
            geo.addJoin(curr, theta, Math.PI, radius)
        }
    }

    return geo
}
