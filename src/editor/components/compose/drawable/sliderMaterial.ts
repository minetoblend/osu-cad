import {Program, Shader, Texture} from "pixi.js";

const vertexSrc = `

    precision mediump float;

    attribute vec3 aVertexPosition;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    varying vec2 vUvs;

    void main() {

        vUvs = vec2(1.0 - aVertexPosition.z, 0);
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition.xy, 1.0)).xy, aVertexPosition.z, 1.0);

    }`;

const fragmentSrc = `

    precision mediump float;

    varying vec2 vUvs;

    uniform sampler2D uSampler2;
    uniform float time;

    void main() {

        gl_FragColor = texture2D(uSampler2, vUvs);
    }`;

export class SliderMaterial extends Shader {

    constructor(texture: Texture) {

        const uniforms = {
            uSampler2: texture,
        }

        super(Program.from(vertexSrc, fragmentSrc), uniforms)

    }
}
