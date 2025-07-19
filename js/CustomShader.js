const CustomShader = {
    uniforms: {
        tDiffuse: { type: "t", value: null },
        texDiv: { type: "f", value: 170.0 },
        colorMode: { type: "f", value: 0.0 },
        resolution: { type: "v", value: { x: 0, y: 0 } },
        pixelSize: { type: "f", value: 1 },
        time: { type: "f", value: 0 },
        frameCount: { type: "f", value: 0 },
        transition: { type: "f", value: 0 },
        stageNumber: { type: "i", value: 1 },
    },

    // 0.2126 R + 0.7152 G + 0.0722 B
    // vertexshader is always the same for postprocessing steps
    vertexShader: [
        `
        varying vec2 vUv;

        void main() {

            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    
        }
    `,
    ].join("\n"),

    fragmentShader: [
        `
        #ifdef GL_ES
        precision highp float;
        #endif
       

        // pass in the image/texture we'll be modifying
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform float pixelSize;
        uniform float time;
        uniform float frameCount;
        uniform float transition;

        uniform int stageNumber;

        const float MASK_BORDER = .9;

        const float ditherMatrix[16] = float[16](
            1.0,  9.0,  3.0, 11.0,
            13.0,  5.0, 15.0,  7.0,
            4.0, 12.0,  2.0, 10.0,
            16.0,  8.0, 14.0,  6.0
        );

        // Function to get the dither value based on screen position
        float getDitherValue(ivec2 pixelPos) {
            int index = (pixelPos.y % 4) * 4 + (pixelPos.x % 4); // 4x4 matrix indexing
            return ditherMatrix[index] / 17.0;                  // Normalize to [0, 1]
        }


        // used to determine the correct texel we're working on
        varying vec2 vUv;

        float rand(float n){return fract(sin(n) * 43758.5453123);}
        float rand(vec2 n) { 
	        return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }
        float noise(float p){
            float fl = floor(p);
            float fc = fract(p);
            return mix(rand(fl), rand(fl + 1.0), fc);
        }
            
        float noise(vec2 n) {
            const vec2 d = vec2(0.0, 1.0);
            vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
            return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
        }
        
        float getQuantizedRed(vec4 textureIn, vec2 coord, int offsetX, int offsetY){
            ivec2 pixelPos = ivec2(coord);
            pixelPos.x += offsetX;
            pixelPos.y += offsetY;
            float ditherValue = getDitherValue(pixelPos);
            float ditherScale = 0.7;
            float threshold = ditherValue * ditherScale;
            float ditheredRed = textureIn.r + threshold;
            // Quantize to nearest intensity step
            float quantizedRed = step(0.75, ditheredRed);

            return quantizedRed;
        }

        vec3 getQuantizedVec(vec4 textureIn, vec2 coord, int offsetX, int offsetY){
            ivec2 pixelPos = ivec2(coord);
            pixelPos.x += offsetX;
            pixelPos.y += offsetY;
            float ditherValue = getDitherValue(pixelPos);
            float ditherScale = 0.7;
            float threshold = ditherValue * ditherScale;
            
            float ditheredRed = textureIn.r + threshold;
            float ditheredGreen = textureIn.g + threshold;
            float ditheredBlue = textureIn.b + threshold;
            // Quantize to nearest intensity step
            float qr = step(0.75, ditheredRed);
            float qg = step(0.75, ditheredGreen);
            float qb = step(0.75, ditheredBlue);
            vec3 qVec = vec3(qr, qg, qb);
            return qVec;
        }

        vec3 dither(vec2 uv){
            vec2 pixel = uv * resolution;
            float newPixelSize = pixelSize + transition;
            vec2 coord = pixel / newPixelSize;
            vec2 subcoord = coord * vec2(3.0, 1.0);
            vec2 cellOffset = vec2(0, mod(floor(coord.x), 3.0) * 0.5);
            float ind = mod(floor(subcoord.x), 3.0);
            vec3 maskColor = vec3(ind == 0.0, ind == 1.0, ind == 2.0);

            vec2 cellUv = fract(subcoord + cellOffset) * 2.0 - 1.0;
            vec2 border = 1.0 - cellUv * cellUv * MASK_BORDER;
            maskColor.rgb *= border.x * border.y;

            vec2 rgbCellUV = floor(coord + cellOffset) * newPixelSize / resolution ;
           
            vec4 textureIn = texture2D(tDiffuse, rgbCellUV);
            vec4 textureInOrig = texture2D(tDiffuse, uv);
            vec3 outCol = vec3(.0);
            vec2 fc = gl_FragCoord.xy * 1.0;
            float q1 = getQuantizedRed(textureIn, fc, 0, 0);
            vec3 qVec = getQuantizedVec(textureIn, fc, 0, 0);
            outCol = qVec;
            outCol *= vec3(1.0 - transition / 200.0);

            //outCol.rgb *= 1.0 + (maskColor);
            //outCol *= maskColor;
            
            //float lines = sin(uv.y * 2150.0 + time * 100.0);
            //outCol *= lines + 2.0;
            //outCol += textureIn.rgb * 2.0;

            return outCol;
        }

        vec3 dither2(vec2 uv){
            vec2 pixel = uv * resolution;
            float newPixelSize = pixelSize + transition;
            newPixelSize *= 2.0;
            vec2 coord = pixel  / newPixelSize;
            vec2 subcoord = coord * vec2(3.0, 1.0);
            vec2 cellOffset = vec2(0, mod(floor(coord.x), 3.0) * 0.5);
            float ind = mod(floor(subcoord.x), 3.0);
            vec3 maskColor = vec3(ind == 0.0, ind == 1.0, ind == 2.0);

            vec2 cellUv = fract(subcoord + cellOffset) * 2.0 - 1.0;
            vec2 border = 1.0 - cellUv * cellUv * MASK_BORDER;
            maskColor.rgb *= border.x * border.y;

            vec2 rgbCellUV = floor(coord + cellOffset) * newPixelSize / resolution ;
           
            vec4 textureIn = texture2D(tDiffuse, rgbCellUV);
            vec4 textureInOrig = texture2D(tDiffuse, uv);
            vec3 outCol = vec3(.0);
            vec2 fc = gl_FragCoord.xy * 1.0;
            float q1 = getQuantizedRed(textureIn, fc, 0, 0);
            vec3 qVec = getQuantizedVec(textureIn, fc, 0, 0);
            outCol = qVec;
            outCol *= vec3(1.0 - transition / 200.0);

            outCol.rgb *= 1.0 + (maskColor);
            outCol *= maskColor;
            
            float lines = sin(uv.y * 2150.0 + frameCount );
            outCol *= lines + 2.0;
            outCol += textureIn.rgb * 2.0;

            return outCol;
        }

        vec2 pc(vec2 d){
            vec2 uv = (gl_FragCoord.xy - d) / resolution.xy;
            //uv.y = 1.0 - uv.y;   
            return uv;
        }
        vec3 bloom(){
            float bloomStrength = 10.0;
            float bloomIntensity = 10.0;
            float d = 10.0;
            float bloomCoef = 2.0;
            vec3 sum = vec3(.0);

            for (float i = 1.0; i < 10000.0; i++){
                if (i > bloomStrength) break;
                sum += texture2D(tDiffuse, pc(vec2(i * d, .0))).rgb / (bloomIntensity * i * bloomCoef);
                sum += texture2D(tDiffuse, pc(vec2(-i * d, .0))).rgb / (bloomIntensity * i * bloomCoef);
                sum += texture2D(tDiffuse, pc(vec2(.0, i * d))).rgb / (bloomIntensity * i * bloomCoef);
                sum += texture2D(tDiffuse, pc(vec2(.0, -i * d))).rgb / (bloomIntensity * i * bloomCoef);
                sum += texture2D(tDiffuse, pc(vec2(i * d, -i * d))).rgb / (bloomIntensity * i * bloomCoef);
                sum += texture2D(tDiffuse, pc(vec2(-i * d, i * d))).rgb / (bloomIntensity * i * bloomCoef);
                sum += texture2D(tDiffuse, pc(vec2(i * d, i * d))).rgb / (bloomIntensity * i * bloomCoef);
                sum += texture2D(tDiffuse, pc(vec2(-i * d, -i * d))).rgb / (bloomIntensity * i * bloomCoef);
            }
            return sum;
        }
       
        void main() {
            vec2 uv = vUv.xy;
            vec3 outCol = vec3(.0);
            vec3 sceneTex = texture2D(tDiffuse, uv).rgb;
            vec2 newUV = vec2(.0);
            vec3 newSceneTex = vec3(.0);

            switch(stageNumber){
                // track 1 
                case 1:
                    outCol += sceneTex;
                    outCol += 7.0 * bloom();
                    break;
                // track 2
                case 2:
                    outCol += dither(uv);
                    break;
                case 3:
                    outCol += dither(uv);
                    break;
                case 4:
                    newUV = vUv.xy;
                    newUV.x += noise(newUV * 100.0) * 0.01;
                    newSceneTex = texture2D(tDiffuse, newUV).rgb;

                    outCol.r += newSceneTex.r;

                    newUV = vUv.xy;
                    newUV.x += noise(newUV * 150.0) * 0.015;
                    newSceneTex = texture2D(tDiffuse, newUV).rgb;

                    outCol.g += newSceneTex.g;

                    newUV = vUv.xy;
                    newUV.x += noise(newUV * 120.0) * 0.02;
                    newSceneTex = texture2D(tDiffuse, newUV).rgb;

                    outCol.b += newSceneTex.b;
                    break;
                case 5:
                    break;
                case 6:
                    outCol += dither(uv);
                    break;
                case 7:
                    if (sin(frameCount * 0.01 + length(uv - vec2(0.5)) * 25.0) < 0.25) outCol += bloom() * 5.0;
                    else outCol += dither(uv);
               
                    break;
                case 8:
                    outCol += dither(uv);
                    
                    break;
                case 9:
                    newUV = vUv.xy;
                    newUV.x += noise(newUV.x * 50.0 + frameCount) * 0.005;
                    outCol += dither2(newUV);
                    break;
                default:
                    outCol = sceneTex;
            }
            

            
            gl_FragColor = vec4( outCol , 1.0 );
        }
    `,
    ].join("\n"),
};
