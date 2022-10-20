interface IGAUSSIAN_VALUES {
    [x: number]: number[];
}

const GAUSSIAN_VALUES: IGAUSSIAN_VALUES = {
    5: [0.153388, 0.221461, 0.250301],
    7: [0.071303, 0.131514, 0.189879, 0.214607],
    9: [0.028532, 0.067234, 0.124009, 0.179044, 0.20236],
    11: [0.0093, 0.028002, 0.065984, 0.121703, 0.175713, 0.198596],
    13: [0.002406, 0.009255, 0.027867, 0.065666, 0.121117, 0.174868, 0.197641],
    15: [0.000489, 0.002403, 0.009246, 0.02784, 0.065602, 0.120999, 0.174697, 0.197448],
};

const fragTemplate = [
    'varying vec2 vBlurTexCoords[%size%];',
    'uniform sampler2D uSampler, backdropSampler;',
    'uniform highp vec4 inputSize;',
    'uniform highp vec4 outputFrame;',
    'varying vec2 vTextureCoord;',
    'uniform vec2 backdropSampler_flipY;',

    'void main(void)',
    '{',
    '    vec4 overlay = texture2D(uSampler, vTextureCoord);',
    '    vec2 coord = vTextureCoord;',
    '    coord.y = coord.y * backdropSampler_flipY.y + backdropSampler_flipY.x;',
    '    if(overlay.a < 0.001) {',
    '      gl_FragColor = vec4(0.0);',
    '      return;',
    '     }',
    '     vec4 bg = vec4(0.0);',
    '     %blur%',
    '     gl_FragColor =  vec4(bg.xyz, %alpha%);',
    '}',

].join('\n');

export function generateBlurFragSource(kernelSize: number, fromBackdrop: boolean): string {
    const kernel = GAUSSIAN_VALUES[kernelSize];
    const halfLength = kernel.length;

    let fragSource = fragTemplate;

    let blurLoop = '';
    const template = `bg += texture2D(${fromBackdrop ? 'backdropSampler' : 'uSampler'}, ${fromBackdrop ? 'coord' : 'vTextureCoord'} + vBlurTexCoords[%index%] * inputSize.zw) * %value%;`;
    let value: number;

    for (let i = 0; i < kernelSize; i++) {
        let blur = template.replace('%index%', i.toString());

        value = i;

        if (i >= halfLength) {
            value = kernelSize - i - 1;
        }

        blur = blur.replace('%value%', kernel[value].toString());

        blurLoop += blur;
        blurLoop += '\n';
    }

    fragSource = fragSource.replace('%blur%', blurLoop);
    fragSource = fragSource.replace('%size%', kernelSize.toString());
    fragSource = fragSource.replaceAll('%alpha%', fromBackdrop ? '1.0' : 'overlay.a')


    return fragSource;
}
