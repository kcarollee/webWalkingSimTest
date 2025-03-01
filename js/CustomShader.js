const CustomShader = {
    uniforms: {
        tDiffuse: { type: "t", value: null },
        texDiv: { type: "f", value: 170.0 },
        colorMode: { type: "f", value: 0.0 },
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
        
        float getQuantizedRed(vec4 textureIn, vec2 coord, int offsetX, int offsetY){
            ivec2 pixelPos = ivec2(coord);
            pixelPos.x += offsetX;
            pixelPos.y += offsetY;
            float ditherValue = getDitherValue(pixelPos);
            float ditherScale = 0.9;
            float threshold = ditherValue * ditherScale;
            float ditheredRed = textureIn.r + threshold;
            // Quantize to nearest intensity step
            float quantizedRed = step(0.75, ditheredRed);

            return quantizedRed;
        }
       
        void main() {
            vec4 textureIn = texture2D(tDiffuse, vUv);
            vec4 textureIn2 = texture2D(tDiffuse, vec2(vUv.x - 0.001, vUv.y));
            vec4 textureIn3 = texture2D(tDiffuse, vec2(vUv.x + 0.001, vUv.y));
            vec3 outCol = vec3(.0);
            vec2 fc = gl_FragCoord.xy;
            float q1 = getQuantizedRed(textureIn, fc, 0, 0);
            float q2 = getQuantizedRed(textureIn2, fc, 0, 0);
            float q3 = getQuantizedRed(textureIn, fc, 0, 0);
            outCol.r += q1;
            outCol.g += q2;
            outCol.b += q3;
           
            // outCol *= textureIn.rgb;
            
            gl_FragColor = vec4( outCol , 1.0 );
        }
    `,
    ].join("\n"),
};
