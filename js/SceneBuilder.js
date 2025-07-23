import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { Reflector } from "three/addons/objects/Reflector.js";

export default class SceneBuilder {
    constructor() {
        this.scene = null;
        this.sceneDefined = false;
        this.frameCount = 0;
        this.textureLoader = new THREE.TextureLoader();

        this.fbxLoader = new FBXLoader();
        this.gltfLoader = new GLTFLoader();
    }

    setScene(scene) {
        this.scene = scene;
    }

    setPlayerCollider(playerCollider) {
        this.playerCollider = playerCollider;
    }

    // for scene13
    createTextOverlay(text) {
        // Check if one already exists
        if (document.getElementById("textOverlay")) return;

        const overlay = document.createElement("div");
        overlay.id = "textOverlay";
        overlay.innerText = text;

        this.overlay = overlay;
        // Style it
        Object.assign(overlay.style, {
            position: "fixed",
            top: "20px",
            left: "20px",

            justifyContent: "center",
            alignItems: "center",
            color: "red",
            fontSize: "5rem",
            fontFamily: "ChosunSM",
            fontWeight: "700",
            backgroundColor: "rgba(0, 0, 0, 0)",
            zIndex: "9999",
            pointerEvents: "none",
            transform: "scaleY(1.5)",
        });

        document.body.appendChild(overlay);
    }

    // lights, background color, etc
    defineScene() {}

    // transformations
    updateScene() {}
}

// speed value: 0~4
function setSpeedSliderValue(newVal) {
    const speedSlider = document.getElementById("speed-slider");
    const speedValueDisplay = document.getElementById("speed-value");
    speedValueDisplay.textContent = Math.round((newVal / 10.0) * 100) + "%";
    speedSlider.value = newVal / 10.0;
}

// TRACK 1: GREENLIGHT
const scene1 = new SceneBuilder();
scene1.defineScene = function (sceneModelArr, shaderPass, playerPath) {
    // BACKGROUND
    this.scene.background = new THREE.Color(0x000000);

    // LIGHTS
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);

    // PATH MATERIAL OVERRIDE/RESET
    playerPath.material.color = new THREE.Color(0x00ff00);
    playerPath.material.wireframe = true;
    playerPath.scale.set(0, 0, 0);

    // SET REFERENCES
    this.sceneModelArr = sceneModelArr;
    this.shaderPass = shaderPass;
    this.playerPath = playerPath;

    // SET stageNumber SHADER UNIFROM
    this.shaderPass.uniforms.stageNumber.value = 1.0;

    // VIDEO TEXTURE (if applicable)
    const video = document.createElement("video");
    video.src = "./assets/video/demo4.mov";
    video.loop = true;
    video.muted = true;
    video.play();

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;

    // BG SPHERE
    this.sphereGeom = new THREE.SphereGeometry(100, 100, 100);
    this.sphereMat = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide, map: videoTexture });
    this.sphereMesh = new THREE.Mesh(this.sphereGeom, this.sphereMat);
    //this.scene.add(this.sphereMesh);

    // STAGE-SPECIFIC MODELS IMPORT/SETUP
    this.stageModelArr = [];
    this.stageModelNum = 5;
    let scene = this.scene;
    let stageModelArr = this.stageModelArr;
    this.modelPath = "./assets/chapter_1/stage_1/";
    // TEXTURE IMPORT / SETUP
    //console.log(gsap);
    for (let i = 0; i < this.stageModelNum; i++) {
        let modelName = "polyreduce" + (i + 1) + ".fbx";
        let url = this.modelPath + modelName;

        const texture = this.textureLoader.load(this.modelPath + "tex" + (i + 1) + ".png");
        let objMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: false, map: videoTexture });

        this.fbxLoader.load(url, function (object) {
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.material = objMaterial;
                }
            });
            object.scale.set(0.005, 0.005, 0.005);
            // object.position.set(
            //     (Math.random() - 0.5) * 2 * 20,
            //     (Math.random() - 0.5) * 2 * 20,
            //     (Math.random() - 0.5) * 2 * 20
            // );
            scene.add(object);
            stageModelArr.push(object);
        });
    }

    this.playerCollider.moveSpeed = 1.0;
    setSpeedSliderValue(1);
};

scene1.updateScene = function (camera, songProgress) {
    this.frameCount += 1;
    let scale = 11 + Math.sin(this.frameCount * 0.01);
    this.playerPath.scale.set(10, 10, 10);
    this.playerPath.rotateY(0.01);

    let visibleModelIndex = Math.floor(this.frameCount * 0.005) % this.stageModelNum;

    if (this.frameCount > 100) {
        this.stageModelArr.forEach((model, i) => {
            if (i == visibleModelIndex) {
                gsap.to(model.scale, {
                    duration: 1,
                    x: 0.005,
                    y: 0.005,
                    z: 0.005,
                    ease: "power2.out",
                });
            } else {
                gsap.to(model.scale, {
                    duration: 1,
                    x: 0.0001,
                    y: 0.0001,
                    z: 0.0001,
                    ease: "power2.out",
                });
            }
        });
    }
};

// TRACK 2: LEMON TEA
const scene2 = new SceneBuilder();
scene2.defineScene = function (sceneModelArr, shaderPass, playerPath) {
    // ENVMAP
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const envMap = cubeTextureLoader.load([
        "./assets/cubeMaps/cubeMap3/nx.png",
        "./assets/cubeMaps/cubeMap3/ny.png",
        "./assets/cubeMaps/cubeMap3/nz.png",
        "./assets/cubeMaps/cubeMap3/px.png",
        "./assets/cubeMaps/cubeMap3/py.png",
        "./assets/cubeMaps/cubeMap3/pz.png",
    ]);
    envMap.mapping = THREE.CubeRefractionMapping;
    this.scene.environment = envMap;
    let metallicMat = new THREE.MeshStandardMaterial({
        envMap: envMap,
        side: THREE.DoubleSide,
        roughness: 0.1,
        metalness: 0.8,
    });

    // BACKGROUND
    this.scene.background = new THREE.Color(0xeea500);

    // LIGHTS
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);

    // PATH MATERIAL OVERRIDE/RESET

    playerPath.material.color = new THREE.Color(0x0000ff);
    playerPath.material.wireframe = true;

    // SET REFERENCES
    this.sceneModelArr = sceneModelArr;
    this.shaderPass = shaderPass;
    this.playerPath = playerPath;

    // VIDEO TEXTURE (if applicable)
    const video = document.createElement("video");
    video.src = "./assets/chapter_1/stage_2/waterTex.mov";
    video.loop = true;
    video.muted = true;
    video.play();

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;

    const video2 = document.createElement("video");
    video2.src = "./assets/chapter_1/stage_2/tongue2.mov";
    video2.loop = true;
    video2.muted = true;
    video2.play();

    const videoTexture2 = new THREE.VideoTexture(video2);
    videoTexture2.colorSpace = THREE.SRGBColorSpace;
    videoTexture2.minFilter = THREE.LinearFilter;
    videoTexture2.magFilter = THREE.LinearFilter;
    videoTexture2.generateMipmaps = false;

    // SET stageNumber SHADER UNIFROM
    this.shaderPass.uniforms.stageNumber.value = 2;

    // STAGE-SPECIFIC MODELS IMPORT/SETUP

    let stageModelNum = 2;
    let scene = this.scene;
    this.modelPath = "./assets/chapter_1/stage_2/";
    this.stageModelArr = [];
    let stageModelArr = this.stageModelArr;
    this.stageModelGroup = new THREE.Group();
    let stageModelGroup = this.stageModelGroup;
    for (let j = 0; j < 20; j++) {
        for (let i = 0; i < 2; i++) {
            // TEXTURE IMPORT / SETUP
            const texture = this.textureLoader.load(this.modelPath + "tex" + (i + 1) + ".png");
            let objMaterial;
            if (i == 1) {
                objMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    wireframe: false,
                    map: videoTexture2,
                    side: THREE.DoubleSide,
                });
            } else {
                objMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    wireframe: true,
                    //map: texture,
                    side: THREE.DoubleSide,
                });
            }

            let modelName = "mesh" + (i + 1) + ".fbx";

            let url = this.modelPath + modelName;

            this.fbxLoader.load(url, function (object) {
                object.traverse(function (child) {
                    if (child.isMesh) {
                        child.material = objMaterial;
                    }
                });

                object.scale.set(0.25, 0.25, 0.25);
                let x = Math.random() * 20 - 10;
                let y = Math.random() * 20 - 10;
                let z = Math.random() * 20 - 10;
                object.position.set(x, y, z);
                object.rotateX(Math.random() * Math.PI * 2);
                object.rotateY(Math.random() * Math.PI * 2);
                object.rotateZ(Math.random() * Math.PI * 2);
                //scene.add(object);
                stageModelGroup.add(object);
            });
            scene.add(this.stageModelGroup);
        }
    }

    this.gltfModelNum = 2;
    this.animationMixerArr = [];
    this.gltfModelArr = [];
    let animationMixerArr = this.animationMixerArr;
    let gltfModelArr = this.gltfModelArr;
    for (let i = 0; i < this.gltfModelNum; i++) {
        // TEXTURE IMPORT / SETUP
        //const texture = this.textureLoader.load(this.modelPath + "tex" + (i + 1) + ".png");
        //let objMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false, map: texture });
        let objMaterial;
        if (i == 0) {
            objMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                wireframe: false,
                side: THREE.DoubleSide,
                opacity: 0.8,
                map: videoTexture,
            });
        } else {
            objMaterial = metallicMat;
        }

        let modelName = "sea.gltf";
        let url = this.modelPath + modelName;

        // FOR ANIMATED MODELS, EXPORT FROM HOUDINI AS GLTF, BUT THERE SHOULD BE NO CHANGE TO THE NUMBER OF
        // VERTICES
        this.gltfLoader.load(url, function (gltf) {
            gltf.scene.traverse(function (child) {
                if (child.isMesh) {
                    child.material = objMaterial;
                }
            });
            // //console.log("ANIMATION LANGTH : ", object.animations.length);
            // const mixer = new THREE.AnimationMixer(object);
            // const action = mixer.clipAction(object.animations[0]);
            // action.play();

            //object.scale.set(1, 1, 1);
            if (i == 0) {
                gltf.scene.scale.set(100, 10, 100);

                gltf.scene.position.set(0, -10, 0);
            } else {
                gltf.scene.scale.set(200, 200, 200);
            }
            gltfModelArr.push(gltf.scene);
            scene.add(gltf.scene);
            const mixer = new THREE.AnimationMixer(gltf.scene);
            const action = mixer.clipAction(gltf.animations[0]);
            animationMixerArr.push(mixer);
            action.play();
        });
    }

    this.playerCollider.moveSpeed = 1;
    setSpeedSliderValue(1);
};
// songprogress: 0~1
scene2.updateScene = function (camera, songProgress) {
    this.frameCount += 1;
    if (this.gltfModelArr.length > 0) {
        this.gltfModelArr[0].position.y = -10 * (1 - songProgress * 2);
        ////console.log(this.gltfModelArr[0].position.y);
    }

    // let scale = 0.9 + 0.05 * Math.sin(this.frameCount * 0.01);
    // this.playerPath.scale.set(scale, scale, scale);
    // this.playerPath.rotateY(scale * 0.001);
    this.animationMixerArr.forEach((mixer, i) => {
        mixer.update(0.01 * (i + 1));
    });

    this.stageModelGroup.rotateX(songProgress * 0.05);
    this.stageModelGroup.rotateY(songProgress * 0.05);
    this.stageModelGroup.rotateZ(songProgress * 0.05);
};

// TRACK 3: VARIOUS THINGS
const scene3 = new SceneBuilder();
scene3.defineScene = function (sceneModelArr, shaderPass, playerPath) {
    // VIDEO TEXTURE (if applicable)
    const video = document.createElement("video");
    video.src = "./assets/chapter_1/stage_3/bg2.mov";
    video.loop = true;
    video.muted = true;
    video.play();

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;
    // BACKGROUND
    this.scene.background = videoTexture;

    // LIGHTS
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);

    // ENVMAP
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const envMap = cubeTextureLoader.load([
        "./assets/cubeMaps/cubeMap1/nx.png",
        "./assets/cubeMaps/cubeMap1/ny.png",
        "./assets/cubeMaps/cubeMap1/nz.png",
        "./assets/cubeMaps/cubeMap1/px.png",
        "./assets/cubeMaps/cubeMap1/py.png",
        "./assets/cubeMaps/cubeMap1/pz.png",
    ]);
    envMap.mapping = THREE.CubeRefractionMapping;
    this.scene.environment = envMap;
    let metallicMat = new THREE.MeshStandardMaterial({
        envMap: envMap,
        side: THREE.DoubleSide,
        roughness: 0.1,
        metalness: 0.25,
    });
    // PATH MATERIAL OVERRIDE/RESET
    playerPath.material = metallicMat;
    playerPath.material.color = new THREE.Color(0xffffff);
    playerPath.material.wireframe = false;
    playerPath.material.opacity = 0.5;

    playerPath.scale.set(10, 1, 10);

    //console.log(playerPath);

    this.pathClone = playerPath.clone();
    this.pathClone.material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    this.scene.add(this.pathClone);

    // SET REFERENCES
    this.sceneModelArr = sceneModelArr;
    this.shaderPass = shaderPass;
    this.playerPath = playerPath;

    // SET stageNumber SHADER UNIFROM
    this.shaderPass.uniforms.stageNumber.value = 3;

    // STAGE-SPECIFIC MODELS IMPORT/SETUP
    let stageModelNum = 1;
    let scene = this.scene;
    this.modelPath = "./assets/chapter_1/stage_3/";
    this.stageModelArr = [];
    let stageModelArr = this.stageModelArr;
    for (let i = 0; i < stageModelNum; i++) {
        // TEXTURE IMPORT / SETUP
        //const texture = this.textureLoader.load(this.modelPath + "tex" + (i + 1) + ".png");
        //let objMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false, map: texture });

        let objMaterial = metallicMat;
        let objMaterial2 = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        let modelName = "mesh" + (i + 1) + ".fbx";
        let url = this.modelPath + modelName;

        this.fbxLoader.load(url, function (object) {
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.material = objMaterial;
                }
            });
            object.scale.set(1, 1, 1);
            scene.add(object);
            stageModelArr.push(object);
        });

        this.fbxLoader.load(url, function (object) {
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.material = objMaterial2;
                }
            });
            object.scale.set(1, 1, 1);
            scene.add(object);
            stageModelArr.push(object);
        });
    }

    this.playerCollider.moveSpeed = 2;
    setSpeedSliderValue(2);
};

scene3.updateScene = function () {
    this.frameCount += 1;
    // let scale = 0.9 + 0.05 * Math.sin(this.frameCount * 0.01);

    this.playerPath.rotateY(0.001);
    this.pathClone.rotateY(0.001);
    if (this.stageModelArr.length > 0) this.stageModelArr[0].rotateY(-0.001);
};

// TRACK 4: SIGYEOL
const scene4 = new SceneBuilder();
scene4.defineScene = function (sceneModelArr, shaderPass, playerPath) {
    // BACKGROUND
    this.scene.background = new THREE.Color(0x000000);

    // LIGHTS
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);

    // ENVMAP
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const envMap = cubeTextureLoader.load([
        "./assets/cubeMaps/cubeMap1/nx.png",
        "./assets/cubeMaps/cubeMap1/ny.png",
        "./assets/cubeMaps/cubeMap1/nz.png",
        "./assets/cubeMaps/cubeMap1/px.png",
        "./assets/cubeMaps/cubeMap1/py.png",
        "./assets/cubeMaps/cubeMap1/pz.png",
    ]);
    envMap.mapping = THREE.CubeRefractionMapping;
    this.scene.environment = envMap;
    let metallicMat = new THREE.MeshStandardMaterial({
        envMap: envMap,
        side: THREE.DoubleSide,
        roughness: 0.1,
        metalness: 0.25,
    });
    // PATH MATERIAL OVERRIDE/RESET
    playerPath.material = metallicMat;
    playerPath.material.color = new THREE.Color(0xffffff);
    playerPath.material.wireframe = false;
    playerPath.material.opacity = 0.5;

    playerPath.scale.set(1, 1, 1);

    //console.log(playerPath);

    this.pathClone = playerPath.clone();
    this.pathClone.material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    this.scene.add(this.pathClone);

    // SET REFERENCES
    this.sceneModelArr = sceneModelArr;
    this.shaderPass = shaderPass;
    this.playerPath = playerPath;

    // SET stageNumber SHADER UNIFROM
    this.shaderPass.uniforms.stageNumber.value = 4;

    // STAGE-SPECIFIC MODELS IMPORT/SETUP
    let stageModelNum = 1;
    let scene = this.scene;
    this.modelPath = "./assets/chapter_1/stage_4/";
    this.stageModelArr = [];
    let stageModelArr = this.stageModelArr;

    this.animationMixerArr = [];
    let animationMixerArr = this.animationMixerArr;
    for (let i = 0; i < stageModelNum; i++) {
        // TEXTURE IMPORT / SETUP
        //const texture = this.textureLoader.load(this.modelPath + "tex" + (i + 1) + ".png");
        //let objMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false, map: texture });
        let objMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });

        let modelName = "mesh" + (i + 1) + ".gltf";
        let url = this.modelPath + modelName;

        // FOR ANIMATED MODELS, EXPORT FROM HOUDINI AS GLTF, BUT THERE SHOULD BE NO CHANGE TO THE NUMBER OF
        // VERTICES
        this.gltfLoader.load(url, function (gltf) {
            gltf.scene.traverse(function (child) {
                if (child.isMesh) {
                    child.material = objMaterial;
                }
            });
            // //console.log("ANIMATION LANGTH : ", object.animations.length);
            // const mixer = new THREE.AnimationMixer(object);
            // const action = mixer.clipAction(object.animations[0]);
            // action.play();

            //object.scale.set(1, 1, 1);
            scene.add(gltf.scene);
            stageModelArr.push(gltf.scene);

            const mixer = new THREE.AnimationMixer(gltf.scene);
            const action = mixer.clipAction(gltf.animations[0]);
            animationMixerArr.push(mixer);
            action.play();
        });
    }

    this.playerCollider.moveSpeed = 2;
    setSpeedSliderValue(2);
};

scene4.updateScene = function () {
    this.frameCount += 1;
    // let scale = 0.9 + 0.05 * Math.sin(this.frameCount * 0.01);

    this.playerPath.rotateX(0.001);
    this.pathClone.rotateZ(0.001);

    this.animationMixerArr.forEach((mixer) => {
        mixer.update(0.01);
    });
};

// TRACK 5: TAILBONE
const scene5 = new SceneBuilder();
scene5.defineScene = function (sceneModelArr, shaderPass, playerPath) {
    // VIDEO TEXTURE (if applicable)
    // const video = document.createElement("video");
    // video.src = "./assets/chapter_1/stage_3/bg.mov";
    // video.loop = true;
    // video.muted = true;
    // video.play();

    // const videoTexture = new THREE.VideoTexture(video);
    // videoTexture.colorSpace = THREE.SRGBColorSpace;
    // videoTexture.minFilter = THREE.LinearFilter;
    // videoTexture.magFilter = THREE.LinearFilter;
    // videoTexture.generateMipmaps = false;
    // BACKGROUND
    this.scene.background = new THREE.Color(0x000000);

    // LIGHTS
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);

    // ENVMAP
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const envMap = cubeTextureLoader.load([
        "./assets/cubeMaps/cubeMap1/nx.png",
        "./assets/cubeMaps/cubeMap1/ny.png",
        "./assets/cubeMaps/cubeMap1/nz.png",
        "./assets/cubeMaps/cubeMap1/px.png",
        "./assets/cubeMaps/cubeMap1/py.png",
        "./assets/cubeMaps/cubeMap1/pz.png",
    ]);
    envMap.mapping = THREE.CubeRefractionMapping;
    this.scene.environment = envMap;
    let metallicMat = new THREE.MeshStandardMaterial({
        envMap: envMap,
        side: THREE.DoubleSide,
        roughness: 0.1,
        metalness: 0.25,
    });
    // PATH MATERIAL OVERRIDE/RESET
    playerPath.material = metallicMat;
    playerPath.material.color = new THREE.Color(0xffffff);
    playerPath.material.wireframe = false;
    playerPath.material.opacity = 0.5;

    playerPath.scale.set(0.1, 0.1, 0.1);

    //console.log(playerPath);

    this.pathClone = playerPath.clone();
    this.pathClone.material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    this.scene.add(this.pathClone);

    // SET REFERENCES
    this.sceneModelArr = sceneModelArr;
    this.shaderPass = shaderPass;
    this.playerPath = playerPath;

    // SET stageNumber SHADER UNIFROM
    this.shaderPass.uniforms.stageNumber.value = 3;

    // STAGE-SPECIFIC MODELS IMPORT/SETUP
    let stageModelNum = 2;
    let scene = this.scene;
    this.modelPath = "./assets/chapter_1/stage_5/";
    this.stageModelArr = [];
    let stageModelArr = this.stageModelArr;

    this.animationMixerArr = [];
    let animationMixerArr = this.animationMixerArr;
    for (let i = 0; i < stageModelNum; i++) {
        // TEXTURE IMPORT / SETUP
        //const texture = this.textureLoader.load(this.modelPath + "tex" + (i + 1) + ".png");
        //let objMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false, map: texture });
        let objMaterial = metallicMat;

        let modelName = "mesh" + (i + 1) + ".gltf";
        let url = this.modelPath + modelName;

        // FOR ANIMATED MODELS, EXPORT FROM HOUDINI AS GLTF, BUT THERE SHOULD BE NO CHANGE TO THE NUMBER OF
        // VERTICES
        this.gltfLoader.load(url, function (gltf) {
            gltf.scene.traverse(function (child) {
                if (child.isMesh) {
                    child.material = objMaterial;
                }
            });
            // //console.log("ANIMATION LANGTH : ", object.animations.length);
            // const mixer = new THREE.AnimationMixer(object);
            // const action = mixer.clipAction(object.animations[0]);
            // action.play();

            //object.scale.set(1, 1, 1);
            if (i == 1) {
                gltf.scene.rotateX(Math.PI * 0.5);
                gltf.scene.translateY(-50);
            }
            scene.add(gltf.scene);
            stageModelArr.push(gltf.scene);

            const mixer = new THREE.AnimationMixer(gltf.scene);
            const action = mixer.clipAction(gltf.animations[0]);
            animationMixerArr.push(mixer);
            action.play();
        });
    }

    this.playerCollider.moveSpeed = 1.5;
    setSpeedSliderValue(1.5);
};

scene5.updateScene = function () {
    this.frameCount += 1;
    // let scale = 0.9 + 0.05 * Math.sin(this.frameCount * 0.01);

    this.playerPath.rotateY(0.001);
    this.pathClone.rotateY(0.001);

    this.animationMixerArr.forEach((mixer, i) => {
        if (i == 1) mixer.update(0.01);
        else mixer.update(0.001);
    });
};

// TRACK 6: GIRL
const scene6 = new SceneBuilder();
scene6.defineScene = function (sceneModelArr, shaderPass, playerPath) {
    // VIDEO TEXTURE (if applicable)
    const bgVideo = document.createElement("video");
    bgVideo.src = "./assets/chapter_2/stage_6/bg.mov";
    bgVideo.loop = true;
    bgVideo.muted = true;
    bgVideo.play();

    const bgVideoTexture = new THREE.VideoTexture(bgVideo);
    bgVideoTexture.colorSpace = THREE.SRGBColorSpace;
    bgVideoTexture.minFilter = THREE.LinearFilter;
    bgVideoTexture.magFilter = THREE.LinearFilter;
    bgVideoTexture.generateMipmaps = false;

    const videoTexNum = 3;
    const videoTextureArr = [];
    const spriteMaterialArr = [];
    for (let i = 0; i < videoTexNum; i++) {
        const video = document.createElement("video");
        video.src = "./assets/chapter_2/stage_6/tex" + (i + 1) + ".mov";
        video.loop = true;
        video.muted = true;
        video.play();

        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.colorSpace = THREE.SRGBColorSpace;
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.generateMipmaps = false;
        videoTextureArr.push(videoTexture);

        // SPRITE MATERIALS
        const spriteMaterial = new THREE.SpriteMaterial({ map: videoTexture });
        spriteMaterialArr.push(spriteMaterial);
    }

    // DEFAULT MODELS FOR CHAPTER 2
    const columnGroup = sceneModelArr.find((group) => group.name === "COLUMNS");
    const domeGroup = sceneModelArr.find((group) => group.name === "DOME");
    const statueGroup = sceneModelArr.find((group) => group.name === "STATUES");

    columnGroup.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        }
    });
    domeGroup.visible = false;

    // domeGroup.traverse((child) => {
    //     if (child.isMesh) {
    //         child.material = new THREE.MeshBasicMaterial({
    //             color: 0xffffff,
    //             //map: videoTexture,
    //             side: THREE.BackSide,
    //         });
    //     }
    // });
    // domeGroup.position.y += 0.01;

    statueGroup.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        }
    });

    // BACKGROUND
    this.scene.background = bgVideoTexture;

    // LIGHTS
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);

    // ENVMAP
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const envMap = cubeTextureLoader.load([
        "./assets/cubeMaps/cubeMap1/nx.png",
        "./assets/cubeMaps/cubeMap1/ny.png",
        "./assets/cubeMaps/cubeMap1/nz.png",
        "./assets/cubeMaps/cubeMap1/px.png",
        "./assets/cubeMaps/cubeMap1/py.png",
        "./assets/cubeMaps/cubeMap1/pz.png",
    ]);
    envMap.mapping = THREE.CubeRefractionMapping;
    this.scene.environment = envMap;
    let metallicMat = new THREE.MeshStandardMaterial({
        envMap: envMap,
        side: THREE.DoubleSide,
        roughness: 0.1,
        metalness: 0.25,
    });
    // PATH MATERIAL OVERRIDE/RESET
    playerPath.material = metallicMat;
    playerPath.material.color = new THREE.Color(0xffffff);
    playerPath.material.wireframe = false;
    playerPath.material.opacity = 0.5;

    playerPath.scale.set(1, 1, 1);

    //console.log(playerPath);

    this.pathClone = playerPath.clone();
    this.pathClone.material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    this.scene.add(this.pathClone);

    // SET REFERENCES
    this.sceneModelArr = sceneModelArr;
    this.shaderPass = shaderPass;
    this.playerPath = playerPath;

    // SET stageNumber SHADER UNIFROM
    this.shaderPass.uniforms.stageNumber.value = 6;

    // STAGE-SPECIFIC MODELS IMPORT/SETUP
    let stageModelNum = 1;
    let scene = this.scene;
    this.modelPath = "./assets/chapter_2/stage_6/";
    this.stageModelArr = [];
    let stageModelArr = this.stageModelArr;

    this.animationMixerArr = [];
    let animationMixerArr = this.animationMixerArr;

    for (let i = 0; i < stageModelNum; i++) {
        // TEXTURE IMPORT / SETUP
        //const texture = this.textureLoader.load(this.modelPath + "tex" + (i + 1) + ".png");
        //let objMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false, map: texture });
        let objMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });

        let modelName = "mesh" + (i + 1) + ".fbx";
        let url = this.modelPath + modelName;

        this.fbxLoader.load(url, function (object) {
            object.scale.set(0.25, 0.25, 0.25);
            //object.translateZ(5.0);
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.material = objMaterial;

                    const geometry = child.geometry;
                    const positionAttribute = geometry.attributes.position;
                    for (let i = 0; i < positionAttribute.count; i++) {
                        const x = positionAttribute.getX(i);
                        const y = positionAttribute.getY(i);
                        const z = positionAttribute.getZ(i);

                        let spriteMaterialIndex = Math.floor(Math.random() * 3);
                        const sprite = new THREE.Sprite(spriteMaterialArr[spriteMaterialIndex]);
                        const localPos = new THREE.Vector3(x, y, z);
                        const worldPos = child.localToWorld(localPos.clone());
                        sprite.position.copy(worldPos);
                        sprite.scale.set(0.15, 0.15, 0.15);
                        scene.add(sprite);
                    }
                }
            });

            // object.position.set(
            //     (Math.random() - 0.5) * 2 * 20,
            //     (Math.random() - 0.5) * 2 * 20,
            //     (Math.random() - 0.5) * 2 * 20
            // );
            scene.add(object);
            stageModelArr.push(object);
        });

        // FOR ANIMATED MODELS, EXPORT FROM HOUDINI AS GLTF, BUT THERE SHOULD BE NO CHANGE TO THE NUMBER OF
        // VERTICES
        // this.gltfLoader.load(url, function (gltf) {
        //     gltf.scene.traverse(function (child) {
        //         if (child.isMesh) {
        //             child.material = objMaterial;
        //         }
        //     });
        //     // //console.log("ANIMATION LANGTH : ", object.animations.length);
        //     // const mixer = new THREE.AnimationMixer(object);
        //     // const action = mixer.clipAction(object.animations[0]);
        //     // action.play();

        //     //object.scale.set(1, 1, 1);
        //     if (i == 1) {
        //         gltf.scene.rotateX(Math.PI * 0.5);
        //         gltf.scene.translateY(-50);
        //     }
        //     scene.add(gltf.scene);
        //     stageModelArr.push(gltf.scene);

        //     const mixer = new THREE.AnimationMixer(gltf.scene);
        //     const action = mixer.clipAction(gltf.animations[0]);
        //     animationMixerArr.push(mixer);
        //     action.play();
        // });
    }

    this.playerCollider.moveSpeed = 2;
    setSpeedSliderValue(2);
};

scene6.updateScene = function () {
    this.frameCount += 1;
    // let scale = 0.9 + 0.05 * Math.sin(this.frameCount * 0.01);

    // this.playerPath.rotateY(0.001);
    // this.pathClone.rotateY(0.001);

    // this.animationMixerArr.forEach((mixer, i) => {
    //     if (i == 1) mixer.update(0.01);
    //     else mixer.update(0.001);
    // });
};

function createVideoTexture(url) {
    const video = document.createElement("video");
    video.src = url;
    video.loop = true;
    video.muted = true;
    video.play();

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;
    return videoTexture;
}
// TRACK 7: MUNG
const scene7 = new SceneBuilder();
scene7.defineScene = function (sceneModelArr, shaderPass, playerPath) {
    // VIDEO TEXTURE (if applicable)
    const statueVideoTexture = createVideoTexture("./assets/chapter_2/stage_7/tex1.mov");

    // DEFAULT MODELS FOR CHAPTER 2
    const columnGroup = sceneModelArr.find((group) => group.name === "COLUMNS");
    const domeGroup = sceneModelArr.find((group) => group.name === "DOME");
    const statueGroup = sceneModelArr.find((group) => group.name === "STATUES");

    columnGroup.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({
                color: 0x0000ff,
                wireframe: true,
            });
        }
    });
    domeGroup.visible = true;

    domeGroup.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                map: statueVideoTexture,
                side: THREE.DoubleSide,
            });
        }
    });
    domeGroup.position.y += 0.01;

    statueGroup.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });
        }
    });

    // REFLECTOR
    const reflectorGeom = new THREE.PlaneGeometry(50, 50);
    this.mirror = new Reflector(reflectorGeom, {
        clipBias: 0.003,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
        color: 0x889999,
    });
    this.mirror.position.y = 4.0;
    this.mirror.rotateX(Math.PI / 2);
    this.scene.add(this.mirror);

    // BACKGROUND
    this.scene.background = new THREE.Color(0x000000);

    // LIGHTS
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);

    // ENVMAP
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const envMap = cubeTextureLoader.load([
        "./assets/cubeMaps/cubeMap1/nx.png",
        "./assets/cubeMaps/cubeMap1/ny.png",
        "./assets/cubeMaps/cubeMap1/nz.png",
        "./assets/cubeMaps/cubeMap1/px.png",
        "./assets/cubeMaps/cubeMap1/py.png",
        "./assets/cubeMaps/cubeMap1/pz.png",
    ]);
    envMap.mapping = THREE.CubeRefractionMapping;
    this.scene.environment = envMap;
    let metallicMat = new THREE.MeshStandardMaterial({
        envMap: envMap,
        side: THREE.DoubleSide,
        roughness: 0.1,
        metalness: 0.25,
    });
    // PATH MATERIAL OVERRIDE/RESET
    playerPath.material = metallicMat;
    playerPath.material.color = new THREE.Color(0xffffff);
    playerPath.material.wireframe = false;
    playerPath.material.opacity = 0.5;

    playerPath.scale.set(1, 1, 1);

    //console.log(playerPath);

    this.pathClone = playerPath.clone();
    this.pathClone.material = new THREE.MeshBasicMaterial({ color: 0x00a2ff, wireframe: true });
    this.scene.add(this.pathClone);

    // SET REFERENCES
    this.sceneModelArr = sceneModelArr;
    this.shaderPass = shaderPass;
    this.playerPath = playerPath;

    // SET stageNumber SHADER UNIFROM
    this.shaderPass.uniforms.stageNumber.value = 7;

    // STAGE-SPECIFIC MODELS IMPORT/SETUP
    let stageModelNum = 0;
    let scene = this.scene;
    this.modelPath = "./assets/chapter_2/stage_6/";
    this.stageModelArr = [];
    let stageModelArr = this.stageModelArr;

    this.animationMixerArr = [];
    let animationMixerArr = this.animationMixerArr;

    for (let i = 0; i < stageModelNum; i++) {
        // TEXTURE IMPORT / SETUP
        //const texture = this.textureLoader.load(this.modelPath + "tex" + (i + 1) + ".png");
        //let objMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false, map: texture });
        let objMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });

        let modelName = "mesh" + (i + 1) + ".fbx";
        let url = this.modelPath + modelName;

        this.fbxLoader.load(url, function (object) {
            object.scale.set(0.25, 0.25, 0.25);
            //object.translateZ(5.0);
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.material = objMaterial;

                    const geometry = child.geometry;
                    const positionAttribute = geometry.attributes.position;
                    for (let i = 0; i < positionAttribute.count; i++) {
                        const x = positionAttribute.getX(i);
                        const y = positionAttribute.getY(i);
                        const z = positionAttribute.getZ(i);

                        let spriteMaterialIndex = Math.floor(Math.random() * 3);
                        const sprite = new THREE.Sprite(spriteMaterialArr[spriteMaterialIndex]);
                        const localPos = new THREE.Vector3(x, y, z);
                        const worldPos = child.localToWorld(localPos.clone());
                        sprite.position.copy(worldPos);
                        sprite.scale.set(0.15, 0.15, 0.15);
                        scene.add(sprite);
                    }
                }
            });

            // object.position.set(
            //     (Math.random() - 0.5) * 2 * 20,
            //     (Math.random() - 0.5) * 2 * 20,
            //     (Math.random() - 0.5) * 2 * 20
            // );
            scene.add(object);
            stageModelArr.push(object);
        });
    }

    this.playerCollider.moveSpeed = 0.25;
    setSpeedSliderValue(0.25);
};

scene7.updateScene = function () {
    this.frameCount += 1;
    // let scale = 0.9 + 0.05 * Math.sin(this.frameCount * 0.01);

    // this.playerPath.rotateY(0.001);
    // this.pathClone.rotateY(0.001);

    // this.animationMixerArr.forEach((mixer, i) => {
    //     if (i == 1) mixer.update(0.01);
    //     else mixer.update(0.001);
    // });
    this.mirror.position.y = 3 + Math.sin(this.frameCount * 0.005);
};

// TRACK 8: ETAN
const scene8 = new SceneBuilder();
scene8.defineScene = function (sceneModelArr, shaderPass, playerPath) {
    // VIDEO TEXTURE (if applicable)
    this.videoTextureArr = [];
    this.videoTextureNum = 3;
    for (let i = 0; i < this.videoTextureNum; i++) {
        let url = "./assets/chapter_2/stage_8/tex" + (i + 1) + ".mov";
        const spriteVideoTexture = createVideoTexture(url);
        this.videoTextureArr.push(spriteVideoTexture);
    }

    this.eyeVideoTexture = createVideoTexture("./assets/chapter_2/stage_8/eyeTex.mov");

    const bgVideoTexture = createVideoTexture("./assets/chapter_2/stage_8/bg.mov");

    // SPRITES
    this.spriteMaterialArr = [];
    for (let i = 0; i < this.videoTextureNum; i++) {
        const spriteMaterial = new THREE.SpriteMaterial({ map: this.videoTextureArr[i] });
        this.spriteMaterialArr.push(spriteMaterial);
    }
    this.spriteNum = 300;
    this.spriteArr = [];
    let randomRange = 10;
    for (let i = 0; i < this.spriteNum; i++) {
        let spriteMaterialIndex = Math.floor(Math.random() * 3);
        const sprite = new THREE.Sprite(this.spriteMaterialArr[spriteMaterialIndex]);
        let x = Math.random() * randomRange * 2 - randomRange;
        let y = Math.random() * randomRange * 2 - randomRange;
        let z = Math.random() * randomRange * 2 - randomRange;
        sprite.position.set(x, y, z);
        sprite.scale.set(0.5, 0.5, 0.5);
        this.scene.add(sprite);
        this.spriteArr.push(sprite);
    }

    // static sprites
    const spriteTexture = this.textureLoader.load("./assets/chapter_2/stage_8/eye.png");
    const staticSpriteMaterial = new THREE.SpriteMaterial({ map: spriteTexture });
    let staticSpriteNum = 100;
    randomRange = 20;
    for (let i = 0; i < staticSpriteNum; i++) {
        const sprite = new THREE.Sprite(staticSpriteMaterial);
        let x = Math.random() * randomRange * 2 - randomRange;
        let y = Math.random() * randomRange * 2 - randomRange;
        let z = Math.random() * randomRange * 2 - randomRange;
        sprite.position.set(x, y, z);
        sprite.scale.set(2, 2, 2);
        this.scene.add(sprite);
    }

    // DEFAULT MODELS FOR CHAPTER 2
    const columnGroup = sceneModelArr.find((group) => group.name === "COLUMNS");
    const domeGroup = sceneModelArr.find((group) => group.name === "DOME");
    const statueGroup = sceneModelArr.find((group) => group.name === "STATUES");

    columnGroup.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                wireframe: true,
            });
        }
    });
    domeGroup.visible = true;

    domeGroup.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                map: bgVideoTexture,
                side: THREE.DoubleSide,
            });
        }
    });
    domeGroup.position.y += 0.01;

    statueGroup.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        }
    });
    statueGroup.scale.set(1, 5, 1);

    // // REFLECTOR
    // const reflectorGeom = new THREE.PlaneGeometry(50, 50);
    // this.mirror = new Reflector(reflectorGeom, {
    //     clipBias: 0.003,
    //     textureWidth: window.innerWidth * window.devicePixelRatio,
    //     textureHeight: window.innerHeight * window.devicePixelRatio,
    //     color: 0x889999,
    // });
    // this.mirror.position.y = 4.0;
    // this.mirror.rotateX(Math.PI / 2);
    // this.scene.add(this.mirror);

    // BACKGROUND
    this.scene.background = new THREE.Color(0x000000);

    // LIGHTS
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);

    // ENVMAP
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const envMap = cubeTextureLoader.load([
        "./assets/cubeMaps/cubeMap1/nx.png",
        "./assets/cubeMaps/cubeMap1/ny.png",
        "./assets/cubeMaps/cubeMap1/nz.png",
        "./assets/cubeMaps/cubeMap1/px.png",
        "./assets/cubeMaps/cubeMap1/py.png",
        "./assets/cubeMaps/cubeMap1/pz.png",
    ]);
    envMap.mapping = THREE.CubeRefractionMapping;
    this.scene.environment = envMap;
    let metallicMat = new THREE.MeshStandardMaterial({
        envMap: envMap,
        side: THREE.DoubleSide,
        roughness: 0.1,
        metalness: 0.25,
    });
    // PATH MATERIAL OVERRIDE/RESET
    playerPath.visible = false;

    //console.log(playerPath);

    this.pathClone = playerPath.clone();
    this.pathClone.material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    this.scene.add(this.pathClone);

    // SET REFERENCES
    this.sceneModelArr = sceneModelArr;
    this.shaderPass = shaderPass;
    this.playerPath = playerPath;

    // SET stageNumber SHADER UNIFROM
    this.shaderPass.uniforms.stageNumber.value = 8;

    // STAGE-SPECIFIC MODELS IMPORT/SETUP
    let stageModelNum = 30;
    let scene = this.scene;
    this.modelPath = "./assets/chapter_2/stage_8/";
    this.stageModelArr = [];
    let stageModelArr = this.stageModelArr;
    let eyeTexture = this.textureLoader.load("./assets/chapter_2/stage_8/eyeTex.png");
    let objMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false, map: eyeTexture });

    for (let i = 0; i < stageModelNum; i++) {
        // TEXTURE IMPORT / SETUP
        //const texture = this.textureLoader.load(this.modelPath + "tex" + (i + 1) + ".png");
        //let objMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false, map: texture });

        let modelName = "eye.gltf";
        let url = this.modelPath + modelName;

        this.gltfLoader.load(url, function (gltf) {
            // gltf.scene.traverse(function (child) {
            //     if (i % 2 == 0)
            //         if (child.isMesh) {
            //             //child.material = objMaterial;
            //         }
            // });
            let x = Math.random() - 0.5;
            let y = Math.random() - 0.5 + 1;
            let z = Math.random() - 0.5;

            //object.scale.set(1, 1, 1);
            gltf.scene.position.set(x, y, z);
            let scale = Math.random() * 0.2 + 0.2;
            gltf.scene.scale.set(scale, scale, scale);
            gltf.scene.rotateX(Math.random() * Math.PI * 2.0);
            gltf.scene.rotateY(Math.random() * Math.PI * 2.0);
            gltf.scene.rotateZ(Math.random() * Math.PI * 2.0);
            scene.add(gltf.scene);

            stageModelArr.push(gltf.scene);
        });
    }
    noise.seed(Math.random());
    this.playerCollider.moveSpeed = 0.25;
    setSpeedSliderValue(0.25);
};

scene8.updateScene = function (camera, songProgress) {
    this.frameCount += 1;
    const currentPos = new THREE.Vector3();
    currentPos.copy(camera.position);
    this.spriteArr.forEach((sprite, i) => {
        let noiseAmplitude = 10.0;
        const noise = new THREE.Vector3(
            Math.sin(this.frameCount * 0.1 * 0.5 + i * 100) * noiseAmplitude,
            Math.sin(this.frameCount * 0.1 * 0.8 + i * 2.0) * noiseAmplitude,
            Math.cos(this.frameCount * 0.1 * 0.3 + i * 1.5) * noiseAmplitude
        );
        sprite.position.lerp(currentPos.add(noise), 0.00025);
    });

    let frameCount = this.frameCount;
    this.stageModelArr.forEach((model, i) => {
        model.lookAt(camera.position);
        const freq = 0.1; // noise frequency
        const amp = 2; // movement amplitude

        const t = frameCount * 0.01; // time scaling
        const nx = noise.perlin3(model.position.x * freq, model.position.y * freq, t + i * 10);
        const ny = noise.perlin3(model.position.y * freq, model.position.z * freq, t + 100 + i * 10);
        const nz = noise.perlin3(model.position.z * freq, model.position.x * freq, t + 200 + i * 10);

        model.position.set(nx * amp, ny * amp + 1.5, nz * amp);
    });
    // let scale = 0.9 + 0.05 * Math.sin(this.frameCount * 0.01);

    // this.playerPath.rotateY(0.001);
    // this.pathClone.rotateY(0.001);

    // this.animationMixerArr.forEach((mixer, i) => {
    //     if (i == 1) mixer.update(0.01);
    //     else mixer.update(0.001);
    // });
    //this.mirror.position.y = 3 + Math.sin(this.frameCount * 0.005);
};

// TRACK 9: SOGAK
const scene9 = new SceneBuilder();
scene9.defineScene = function (sceneModelArr, shaderPass, playerPath) {
    // ENVMAP
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const envMap = cubeTextureLoader.load([
        "./assets/cubeMaps/cubeMap2/nx.png",
        "./assets/cubeMaps/cubeMap2/ny.png",
        "./assets/cubeMaps/cubeMap2/nz.png",
        "./assets/cubeMaps/cubeMap2/px.png",
        "./assets/cubeMaps/cubeMap2/py.png",
        "./assets/cubeMaps/cubeMap2/pz.png",
    ]);
    envMap.mapping = THREE.CubeRefractionMapping;
    this.scene.environment = envMap;
    let metallicMat = new THREE.MeshStandardMaterial({
        envMap: envMap,
        side: THREE.DoubleSide,
        roughness: 0.05,
        metalness: 0.9,
    });

    // VIDEO TEXTURE (if applicable)
    this.videoTextureArr = [];
    this.videoTextureNum = 3;
    for (let i = 0; i < this.videoTextureNum; i++) {
        let url = "./assets/chapter_2/stage_8/tex" + (i + 1) + ".mov";
        const spriteVideoTexture = createVideoTexture(url);
        this.videoTextureArr.push(spriteVideoTexture);
    }

    const bgVideoTexture = createVideoTexture("./assets/chapter_2/stage_9/bg.mov");

    // DEFAULT MODELS FOR CHAPTER 2
    const columnGroup = sceneModelArr.find((group) => group.name === "COLUMNS");
    const domeGroup = sceneModelArr.find((group) => group.name === "DOME");
    const statueGroup = sceneModelArr.find((group) => group.name === "STATUES");

    columnGroup.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                wireframe: true,
            });
        }
    });
    domeGroup.visible = true;

    domeGroup.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                map: bgVideoTexture,
                side: THREE.DoubleSide,
            });
        }
    });
    domeGroup.position.y += 0.01;

    domeGroup.visible = false;

    statueGroup.traverse((child) => {
        if (child.isMesh) {
            child.material = metallicMat;
        }
    });
    statueGroup.scale.set(1, 1, 1);

    this.cubeMeshArr = [];
    this.cubeMeshRotateVal = [];
    this.cubeGeom = new THREE.BoxGeometry(1, 1, 1);
    this.cubeNum = 20;
    for (let i = 0; i < this.cubeNum; i++) {
        if (i < 10) {
            let cubeMat = new THREE.MeshBasicMaterial({
                //color: 0xffffff * Math.random(),
                map: bgVideoTexture,
                side: THREE.DoubleSide,
                wireframe: false,
            });

            let cubeMesh = new THREE.Mesh(this.cubeGeom, cubeMat);
            cubeMesh.rotateX(Math.random() * Math.PI);
            cubeMesh.rotateY(Math.random() * Math.PI);
            cubeMesh.rotateZ(Math.random() * Math.PI);
            cubeMesh.scale.set(5, 5, 5);
            this.scene.add(cubeMesh);
            this.cubeMeshArr.push(cubeMesh);
            this.cubeMeshRotateVal.push(Math.random() * 2 - 1);
        } else {
            let cubeMat = metallicMat;

            let cubeMesh = new THREE.Mesh(this.cubeGeom, cubeMat);
            cubeMesh.rotateX(Math.random() * Math.PI);
            cubeMesh.rotateY(Math.random() * Math.PI);
            cubeMesh.rotateZ(Math.random() * Math.PI);
            cubeMesh.scale.set(30, 30, 30);
            this.scene.add(cubeMesh);
            this.cubeMeshArr.push(cubeMesh);
            this.cubeMeshRotateVal.push(Math.random() * 2 - 1);
        }
    }

    // // REFLECTOR
    // const reflectorGeom = new THREE.PlaneGeometry(50, 50);
    // this.mirror = new Reflector(reflectorGeom, {
    //     clipBias: 0.003,
    //     textureWidth: window.innerWidth * window.devicePixelRatio,
    //     textureHeight: window.innerHeight * window.devicePixelRatio,
    //     color: 0x889999,
    // });
    // this.mirror.position.y = 4.0;
    // this.mirror.rotateX(Math.PI / 2);
    // this.scene.add(this.mirror);

    // BACKGROUND
    this.scene.background = new THREE.Color(0xffffff);

    // LIGHTS
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);

    // PATH MATERIAL OVERRIDE/RESET
    playerPath.visible = true;

    this.pathClone = playerPath.clone();
    this.pathClone.material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    this.scene.add(this.pathClone);

    // SET REFERENCES
    this.sceneModelArr = sceneModelArr;
    this.shaderPass = shaderPass;
    this.playerPath = playerPath;

    // SET stageNumber SHADER UNIFROM
    this.shaderPass.uniforms.stageNumber.value = 9;

    // STAGE-SPECIFIC MODELS IMPORT/SETUP
    let stageModelNum = 2;
    let scene = this.scene;
    this.modelPath = "./assets/chapter_2/stage_9/";
    this.stageModelArr = [];
    let stageModelArr = this.stageModelArr;

    this.animationMixerArr = [];
    let animationMixerArr = this.animationMixerArr;

    for (let i = 0; i < stageModelNum; i++) {
        // TEXTURE IMPORT / SETUP
        //const texture = this.textureLoader.load(this.modelPath + "tex" + (i + 1) + ".png");
        //let objMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false, map: texture });
        let objMaterial = metallicMat;

        let modelName = "mesh" + (i + 1) + ".gltf";
        let url = this.modelPath + modelName;

        this.gltfLoader.load(url, function (gltf) {
            gltf.scene.traverse(function (child) {
                if (child.isMesh) {
                    if (i == 0) child.material = objMaterial;
                    else child.material = new THREE.MeshNormalMaterial({ wireframe: true });
                }
            });
            // //console.log("ANIMATION LANGTH : ", object.animations.length);
            // const mixer = new THREE.AnimationMixer(object);
            // const action = mixer.clipAction(object.animations[0]);
            // action.play();

            //object.scale.set(1, 1, 1);
            scene.add(gltf.scene);
            if (i == 0) {
                gltf.scene.scale.set(20, 20, 20);
                gltf.scene.position.set(0, -70, -60);
            } else if (i == 1) {
                gltf.scene.scale.set(1, 0.5, 1);
                gltf.scene.position.set(0, 0, 0);
            }

            stageModelArr.push(gltf.scene);
        });
    }

    this.playerCollider.moveSpeed = 4;
    setSpeedSliderValue(4);
};

scene9.updateScene = function (camera, songProgress) {
    this.frameCount += 1;

    // let scale = 0.9 + 0.05 * Math.sin(this.frameCount * 0.01);

    // this.playerPath.rotateY(0.001);
    // this.pathClone.rotateY(0.001);

    // this.animationMixerArr.forEach((mixer, i) => {
    //     if (i == 1) mixer.update(0.01);
    //     else mixer.update(0.001);
    // });
    //this.mirror.position.y = 3 + Math.sin(this.frameCount * 0.005);
    let cubeMeshRotateVal = this.cubeMeshRotateVal;
    this.cubeMeshArr.forEach((cubeMesh, i) => {
        cubeMesh.rotateX(cubeMeshRotateVal[i] * 0.01);
        cubeMesh.rotateY(cubeMeshRotateVal[i] * 0.01);
        cubeMesh.rotateZ(cubeMeshRotateVal[i] * 0.01);
    });
};

// TRACK 10: RUSH HOUR
const scene10 = new SceneBuilder();
scene10.defineScene = function (sceneModelArr, shaderPass, playerPath) {
    shaderPass.uniforms.stageNumber.value = 10;

    this.scene.background = new THREE.Color(0xaa0000);
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);

    this.pointLight = new THREE.PointLight();
    this.scene.add(this.pointLight);

    const buildingModel = sceneModelArr.find((group) => group.name === "BUILDINGS");
    const roadModel = sceneModelArr.find((group) => group.name === "ROADS");
    //console.log(buildingModel);

    const video = document.createElement("video");
    video.src = "./assets/video/demo4.mov";
    video.loop = true;
    video.muted = true;
    video.play();

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;

    buildingModel.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide });
        }
        //child.material.needsUpdate = true;
    });
    // hdri texture test

    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const envMap = cubeTextureLoader.load([
        "./assets/cubeMaps/cubeMap1/nx.png",
        "./assets/cubeMaps/cubeMap1/ny.png",
        "./assets/cubeMaps/cubeMap1/nz.png",
        "./assets/cubeMaps/cubeMap1/px.png",
        "./assets/cubeMaps/cubeMap1/py.png",
        "./assets/cubeMaps/cubeMap1/pz.png",
    ]);
    envMap.mapping = THREE.CubeRefractionMapping;
    this.scene.environment = envMap;

    const roadTexture = this.textureLoader.load("./assets/chapter_3/stage_1/roadNormal.png");
    roadModel.material = new THREE.MeshStandardMaterial({
        envMap: envMap,
        normalMap: roadTexture,
        map: roadTexture,
        //normalScale: 2.0,
        side: THREE.DoubleSide,
        roughness: 0.0,
        metalness: 0.65,
    });

    const loader = new GLTFLoader();
    let scene = this.scene;
    let textureLoader = this.textureLoader;
    let carMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        map: this.textureLoader.load("./assets/chapter_3/stage_1/textures/carMaterial_diffuse.png"),
    });

    this.carMeshArr = [];
    this.carMeshGroup = new THREE.Group();
    let carMeshArr = this.carMeshArr;
    let carMeshGroup = this.carMeshGroup;
    loader.load("./assets/chapter_3/stage_1/scene.gltf", function (gltf) {
        gltf.scene.material = carMat;
        gltf.scene.scale.set(2, 2, 2);

        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                //console.log(child);
                child.material = carMat;
            } else {
                child.material = carMat;
            }
            child.material.needsUpdate = true;
        });
        scene.add(gltf.scene);

        for (let i = 0; i < 200; i++) {
            const clone = gltf.scene.clone();
            clone.position.set(Math.random() * 30 - 15, Math.random() * 30 - 15, Math.random() * 30 - 15);
            clone.rotation.set(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            clone.scale.set(0.5, 0.5, 0.5);
            carMeshArr.push(clone);
            scene.add(clone);
            //carMeshGroup.add(clone);
        }

        //scene.add(carMeshGroup);
    });

    const bgSphereGeo = new THREE.SphereGeometry(100, 10, 10, 10);
    const bgSphereMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, wireframe: true });
    const bgSphereMesh = new THREE.Mesh(bgSphereGeo, bgSphereMat);

    this.scene.add(bgSphereMesh);
    this.playerCollider.moveSpeed = 10;
    setSpeedSliderValue(10);
};
scene10.updateScene = function (camera) {
    this.pointLight.position.copy(camera.position);
    //this.carMeshGroup.rotateX(0.01);

    this.carMeshArr.forEach((mesh, i) => {
        // let noiseAmplitude = 10.0;
        // const noise = new THREE.Vector3(
        //     Math.sin(this.frameCount * 0.1 * 0.5 + i * 100) * noiseAmplitude,
        //     Math.sin(this.frameCount * 0.1 * 0.8 + i * 2.0) * noiseAmplitude,
        //     Math.cos(this.frameCount * 0.1 * 0.3 + i * 1.5) * noiseAmplitude
        // );
        // sprite.position.lerp(currentPos.add(noise), 0.0001);
        if (camera.position.distanceTo(mesh.position) < 5) {
            mesh.position.lerp(camera.position, 0.025);
        }
        mesh.rotateX(0.01);
        mesh.rotateY(0.01);
        mesh.rotateZ(0.01);
    });

    this.frameCount++;
};

// TRACK 11: KTM
const scene11 = new SceneBuilder();
scene11.defineScene = function (sceneModelArr, shaderPass, playerPath) {
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const envMap = cubeTextureLoader.load([
        "./assets/cubeMaps/cubeMap1/nx.png",
        "./assets/cubeMaps/cubeMap1/ny.png",
        "./assets/cubeMaps/cubeMap1/nz.png",
        "./assets/cubeMaps/cubeMap1/px.png",
        "./assets/cubeMaps/cubeMap1/py.png",
        "./assets/cubeMaps/cubeMap1/pz.png",
    ]);
    envMap.mapping = THREE.CubeRefractionMapping;
    this.scene.environment = envMap;
    const metallicMat = new THREE.MeshStandardMaterial({
        envMap: envMap,
        side: THREE.DoubleSide,
        roughness: 0.1,
        metalness: 1.0,
    });

    shaderPass.uniforms.stageNumber.value = 11;

    this.scene.background = new THREE.Color(0xff5c00);
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);

    this.pointLight = new THREE.PointLight();
    this.scene.add(this.pointLight);

    const buildingModel = sceneModelArr.find((group) => group.name === "BUILDINGS");
    const roadModel = sceneModelArr.find((group) => group.name === "ROADS");
    this.buildingModelClone = buildingModel.clone();
    // this.roadModelClone = roadModel.clone();
    buildingModel.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        }
    });

    this.buildingModelClone.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
        }
    });
    this.scene.add(this.buildingModelClone);

    roadModel.visible = false;

    // VIDEO TEXTURE (if applicable)
    this.videoTextureArr = [];
    this.videoTextureNum = 0;
    for (let i = 0; i < this.videoTextureNum; i++) {
        let url = "./assets/chapter_3/stage_4/tex" + (i + 1) + ".mov";
        const spriteVideoTexture = createVideoTexture(url);
        this.videoTextureArr.push(spriteVideoTexture);
    }

    // STAGE-SPECIFIC MODELS IMPORT/SETUP
    let stageModelNum = 10;
    let scene = this.scene;
    this.modelPath = "./assets/chapter_3/stage_2/";
    this.stageModelArr = [];
    let stageModelArr = this.stageModelArr;

    this.animationMixerArr = [];
    this.actionArr = [];
    this.modelInitialPosArr = [];
    this.animationDuration = 0;
    let animationMixerArr = this.animationMixerArr;
    let actionArr = this.actionArr;
    let animationDuration = this.animationDuration;
    let modelInitialPosArr = this.modelInitialPosArr;
    for (let i = 0; i < stageModelNum; i++) {
        // TEXTURE IMPORT / SETUP
        //const texture = this.textureLoader.load(this.modelPath + "tex" + (i + 1) + ".png");
        //let objMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false, map: texture });
        //let objMaterial = new THREE.MeshNormalMaterial();
        let objMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setRGB(
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5
            ),
        });

        let modelName = "mesh" + 1 + ".gltf";
        let url = this.modelPath + modelName;

        // FOR ANIMATED MODELS, EXPORT FROM HOUDINI AS GLTF, BUT THERE SHOULD BE NO CHANGE TO THE NUMBER OF
        // VERTICES
        this.gltfLoader.load(url, function (gltf) {
            gltf.scene.traverse(function (child) {
                if (child.isMesh) {
                    child.material = objMaterial;
                }
            });
            // //console.log("ANIMATION LANGTH : ", object.animations.length);
            // const mixer = new THREE.AnimationMixer(object);
            // const action = mixer.clipAction(object.animations[0]);
            // action.play();

            //object.scale.set(1, 1, 1);
            scene.add(gltf.scene);

            let x = Math.random() * 20 - 10;
            let y = 0;
            let z = Math.random() * 20 - 10;

            gltf.scene.scale.set(3, 3, 3);
            gltf.scene.position.set(x, y, z);
            gltf.scene.rotateY(Math.random() * Math.PI * 2);

            gltf.scene.rotateDeg = Math.random() * 0.1 - 0.05;
            gltf.scene.posChangeInterval = Math.floor(Math.random() * 200 + 200);

            modelInitialPosArr.push(new THREE.Vector3(x, y, z));
            stageModelArr.push(gltf.scene);

            const mixer = new THREE.AnimationMixer(gltf.scene);
            const animationClip = gltf.animations[0];
            const action = mixer.clipAction(animationClip);
            animationDuration = animationClip.duration;

            animationMixerArr.push(mixer);
            actionArr.push(action);
            action.play();
            action.paused = true;
        });
    }

    this.playerCollider.moveSpeed = 3;
    setSpeedSliderValue(3);
};
scene11.updateScene = function (camera, songProgress) {
    this.pointLight.position.copy(camera.position);

    this.frameCount++;

    const currentPos = new THREE.Vector3();
    currentPos.copy(camera.position);
    let actionArr = this.actionArr;
    let modelInitialPosArr = this.modelInitialPosArr;
    this.animationMixerArr.forEach((mixer, i) => {
        mixer.update(0.01);

        const minDist = 1;
        const maxDist = 6;

        const distance = currentPos.distanceTo(modelInitialPosArr[i]);
        const t = THREE.MathUtils.clamp((distance - minDist) / (maxDist - minDist), 0, 1);

        actionArr[i].time = t * 2.74;
        mixer.update(0);
    });

    let stageModelArr = this.stageModelArr;
    let frameCount = this.frameCount;
    this.modelInitialPosArr.forEach((posVec, i) => {
        if (frameCount % stageModelArr[i].posChangeInterval == 0) {
            gsap.to(posVec, {
                duration: 1,
                x: Math.random() * 20 - 10,
                z: Math.random() * 20 - 10,
                ease: "power2.out",
            });
        }
    });

    this.stageModelArr.forEach((model, i) => {
        model.position.copy(this.modelInitialPosArr[i]);
        model.rotateY(model.rotateDeg);
    });
};

// track 12: KKB
const scene12 = new SceneBuilder();
scene12.defineScene = function (sceneModelArr, shaderPass, playerPath) {
    // const cubeTextureLoader = new THREE.CubeTextureLoader();
    // const envMap = cubeTextureLoader.load([
    //     "./assets/cubeMaps/cubeMap1/nx.png",
    //     "./assets/cubeMaps/cubeMap1/ny.png",
    //     "./assets/cubeMaps/cubeMap1/nz.png",
    //     "./assets/cubeMaps/cubeMap1/px.png",
    //     "./assets/cubeMaps/cubeMap1/py.png",
    //     "./assets/cubeMaps/cubeMap1/pz.png",
    // ]);
    // envMap.mapping = THREE.CubeRefractionMapping;
    // this.scene.environment = envMap;
    // const metallicMat = new THREE.MeshStandardMaterial({
    //     envMap: envMap,
    //     side: THREE.DoubleSide,
    //     roughness: 0.1,
    //     metalness: 1.0,
    // });

    shaderPass.uniforms.stageNumber.value = 12;

    this.scene.background = new THREE.Color(0x000000);
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);

    this.pointLight = new THREE.PointLight();
    this.scene.add(this.pointLight);

    const buildingModel = sceneModelArr.find((group) => group.name === "BUILDINGS");
    const roadModel = sceneModelArr.find((group) => group.name === "ROADS");
    roadModel.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });
        }
    });
    this.roadModelCloneArr = [];
    this.roadModelCloneNum = 6;
    for (let i = 0; i < this.roadModelCloneNum; i++) {
        let x = Math.random() * 10 - 5;
        let y = Math.random() * 5;
        let z = Math.random() * 10 - 5;
        const roadModelClone = roadModel.clone();

        roadModelClone.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });
            }
        });
        roadModelClone.position.set(x, y, z);
        roadModelClone.rotateX(Math.random() * Math.PI * 2.0);
        roadModelClone.rotateY(Math.random() * Math.PI * 2.0);
        roadModelClone.rotateZ(Math.random() * Math.PI * 2.0);
        this.scene.add(roadModelClone);
        this.roadModelCloneArr.push(roadModelClone);
    }

    buildingModel.visible = false;

    // VIDEO TEXTURE (if applicable)
    this.videoTextureArr = [];
    this.videoTextureNum = 0;
    for (let i = 0; i < this.videoTextureNum; i++) {
        let url = "./assets/chapter_3/stage_4/tex" + (i + 1) + ".mov";
        const spriteVideoTexture = createVideoTexture(url);
        this.videoTextureArr.push(spriteVideoTexture);
    }

    // STAGE-SPECIFIC MODELS IMPORT/SETUP
    let stageModelNum = 5;
    let scene = this.scene;
    this.modelPath = "./assets/chapter_3/stage_3/";
    this.stageModelArr = [];
    let stageModelArr = this.stageModelArr;

    this.animationMixerArr = [];

    let animationMixerArr = this.animationMixerArr;
    let actionArr = this.actionArr;

    for (let i = 0; i < stageModelNum; i++) {
        // TEXTURE IMPORT / SETUP
        //const texture = this.textureLoader.load(this.modelPath + "tex" + (i + 1) + ".png");
        //let objMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false, map: texture });
        let objMaterial = new THREE.MeshNormalMaterial();

        let modelName = "mesh" + 1 + ".gltf";
        let url = this.modelPath + modelName;

        // FOR ANIMATED MODELS, EXPORT FROM HOUDINI AS GLTF, BUT THERE SHOULD BE NO CHANGE TO THE NUMBER OF
        // VERTICES
        this.gltfLoader.load(url, function (gltf) {
            gltf.scene.traverse(function (child) {
                if (child.isMesh) {
                    child.material = objMaterial;
                }
            });
            // //console.log("ANIMATION LANGTH : ", object.animations.length);
            // const mixer = new THREE.AnimationMixer(object);
            // const action = mixer.clipAction(object.animations[0]);
            // action.play();

            //object.scale.set(1, 1, 1);
            scene.add(gltf.scene);

            let x, y, z;
            if (i == 0) {
                x = y = z = 0;
            } else {
                x = Math.random() * 10 - 5;
                y = Math.random() * 5;
                z = Math.random() * 10 - 5;
            }
            gltf.scene.position.set(x, y, z);
            stageModelArr.push(gltf.scene);

            const mixer = new THREE.AnimationMixer(gltf.scene);
            const animationClip = gltf.animations[0];
            const action = mixer.clipAction(animationClip);

            animationMixerArr.push(mixer);
            action.startAt(Math.random() * 2.6);
            action.play();
        });
    }

    this.playerCollider.moveSpeed = 2;
    setSpeedSliderValue(2);
};
scene12.updateScene = function (camera, songProgress) {
    this.pointLight.position.copy(camera.position);

    this.frameCount++;

    const currentPos = new THREE.Vector3();
    currentPos.copy(camera.position);
    let actionArr = this.actionArr;
    let modelInitialPosArr = this.modelInitialPosArr;
    this.animationMixerArr.forEach((mixer, i) => {
        mixer.update(0.01);
    });
    this.roadModelCloneArr.forEach((model) => {
        model.rotateX(0.001);
        model.rotateY(0.001);
        model.rotateZ(0.001);
    });
};

// track 13 982
const scene13 = new SceneBuilder();
scene13.defineScene = function (sceneModelArr, shaderPass, playerPath) {
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const envMap = cubeTextureLoader.load([
        "./assets/cubeMaps/cubeMap1/nx.png",
        "./assets/cubeMaps/cubeMap1/ny.png",
        "./assets/cubeMaps/cubeMap1/nz.png",
        "./assets/cubeMaps/cubeMap1/px.png",
        "./assets/cubeMaps/cubeMap1/py.png",
        "./assets/cubeMaps/cubeMap1/pz.png",
    ]);
    envMap.mapping = THREE.CubeRefractionMapping;
    this.scene.environment = envMap;
    const metallicMat = new THREE.MeshStandardMaterial({
        envMap: envMap,
        side: THREE.DoubleSide,
        roughness: 0.1,
        metalness: 1.0,
    });

    const creditTexture = this.textureLoader.load("./assets/chapter_3/stage_4/credits.png");

    shaderPass.uniforms.stageNumber.value = 10;

    this.scene.background = new THREE.Color(0xffffff);
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);

    this.pointLight = new THREE.PointLight();
    this.scene.add(this.pointLight);

    const buildingModel = sceneModelArr.find((group) => group.name === "BUILDINGS");
    const roadModel = sceneModelArr.find((group) => group.name === "ROADS");
    this.buildingModelClone = buildingModel.clone();
    this.roadModelClone = roadModel.clone();
    buildingModel.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
        }
    });

    roadModel.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        }
    });

    //this.buildingModelClone.rotateX(Math.PI);
    this.buildingModelClone.translateY(10);
    this.buildingModelClone.scale.y = 4;
    this.buildingModelClone.rotateX(Math.PI);
    this.buildingModelClone.material = metallicMat;
    this.roadModelClone.material = metallicMat;
    this.scene.add(this.buildingModelClone);
    this.scene.add(this.roadModelClone);

    const creditPanelGeom = new THREE.CylinderGeometry(1, 1, 0.2, 30, 1, true);
    const creditPanelMaterial = new THREE.MeshBasicMaterial({ map: creditTexture, side: THREE.DoubleSide });
    let creditPanelNum = 30;
    let heightOffset = 2.5;
    this.creditPanelMeshArr = [];
    for (let i = 0; i < creditPanelNum; i++) {
        const creditPanelMesh = new THREE.Mesh(creditPanelGeom, creditPanelMaterial);
        //creditPanelMesh.rotateX(Math.PI * 0.5);
        let x = 0;
        let y = i * 0.25 + heightOffset;
        let z = 0;
        creditPanelMesh.position.set(x, y, z);
        creditPanelMesh.rotateY(i);
        creditPanelMesh.offset = i;
        this.scene.add(creditPanelMesh);
        this.creditPanelMeshArr.push(creditPanelMesh);
    }

    const roadTexture = this.textureLoader.load("./assets/chapter_3/stage_1/roadNormal.png");
    roadModel.material = new THREE.MeshStandardMaterial({
        envMap: envMap,
        normalMap: roadTexture,
        map: roadTexture,
        //normalScale: 2.0,
        side: THREE.DoubleSide,
        roughness: 0.0,
        metalness: 0.65,
    });

    // VIDEO TEXTURE (if applicable)
    this.videoTextureArr = [];
    this.videoTextureNum = 7;
    for (let i = 0; i < this.videoTextureNum; i++) {
        let url = "./assets/chapter_3/stage_4/tex" + (i + 1) + ".mov";
        const spriteVideoTexture = createVideoTexture(url);
        this.videoTextureArr.push(spriteVideoTexture);
    }

    // SPRITES
    this.spriteMaterialArr = [];
    for (let i = 0; i < this.videoTextureNum; i++) {
        const spriteMaterial = new THREE.SpriteMaterial({ map: this.videoTextureArr[i] });
        this.spriteMaterialArr.push(spriteMaterial);
    }
    this.spriteNum = 300;
    this.spriteArr = [];
    let randomRange = 10;
    for (let i = 0; i < this.spriteNum; i++) {
        let spriteMaterialIndex = Math.floor(Math.random() * 3);
        const sprite = new THREE.Sprite(this.spriteMaterialArr[spriteMaterialIndex]);
        let x = Math.random() * randomRange * 2 - randomRange;
        let y = Math.random() * randomRange * 2 - randomRange;
        let z = Math.random() * randomRange * 2 - randomRange;
        sprite.position.set(x, y, z);
        sprite.scale.set(0.5, 0.5, 0.5);
        this.scene.add(sprite);
        this.spriteArr.push(sprite);
    }

    this.playerCollider.moveSpeed = 2;
    setSpeedSliderValue(2);

    this.createTextOverlay("READY??");
    this.catchCount = 0;
};
scene13.updateScene = function (camera, songProgress) {
    this.pointLight.position.copy(camera.position);

    this.frameCount++;

    this.creditPanelMeshArr.forEach((panel, i) => {
        panel.rotateY(0.002);
        panel.position.y = 5 + 2.5 * Math.sin(this.frameCount * 0.001 + i * 2);
        panel.scale.x = 1.5 + Math.sin(this.frameCount * 0.001 + i);
        panel.scale.z = 1.5 + Math.sin(this.frameCount * 0.001 + i);
    });

    const currentPos = new THREE.Vector3();
    currentPos.copy(camera.position);
    let randomRange = 10;
    ////console.log(camera.position, this.spriteArr[0].position);
    this.spriteArr.forEach((sprite, i) => {
        if (currentPos.distanceTo(sprite.position) < 1) {
            let x = Math.random() * randomRange * 2 - randomRange;
            let y = Math.random() * randomRange * 2 - randomRange;
            let z = Math.random() * randomRange * 2 - randomRange;
            //console.log("WHY ARE YOU READING THIS?? GET OUT");
            sprite.position.set(x, y, z);

            this.catchCount += 1;
            if (this.catchCount < 100) {
                this.overlay.innerHTML = "WHO IS THIS MAN?? " + this.catchCount;
            } else if (this.catchCount < 200) {
                this.overlay.innerHTML = "GUESS YOU'LL NEVER KNOW!! " + this.catchCount;
            } else if (this.catchCount < 500) {
                this.overlay.innerHTML = "CATCH THEM ALL AHHH!! " + this.catchCount;
            } else if (this.catchCount < 982) {
                this.overlay.innerHTML = "982982982982982 " + this.catchCount;
            } else if (this.catchCount < 2000) {
                this.overlay.innerHTML = "YOU CAN'T CATCH THEM ALL SORRY " + this.catchCount;
            }
        } else {
            let noiseAmplitude = 10.0;
            const noise = new THREE.Vector3(
                Math.sin(this.frameCount * 0.1 * 0.5 + i * 100) * noiseAmplitude,
                Math.sin(this.frameCount * 0.1 * 0.8 + i * 2.0) * noiseAmplitude,
                Math.cos(this.frameCount * 0.1 * 0.3 + i * 1.5) * noiseAmplitude
            );

            // Make a separate target position without mutating currentPos
            const noisyTarget = currentPos.clone().add(noise);
            sprite.position.lerp(noisyTarget, 0.001);
        }
    });

    if (this.catchCount > 500) {
        this.spriteMaterialArr[0].map = this.videoTextureArr[3];
        this.spriteMaterialArr[1].map = this.videoTextureArr[4];
        this.spriteMaterialArr[2].map = this.videoTextureArr[5];
    }

    if (this.catchCount > 100) {
        this.buildingModelClone.rotateY(0.01);
    }

    if (this.catchCount > 200) {
        this.roadModelClone.scale.set(1, 5 * Math.sin(this.frameCount * 0.05), 1);
    }

    if (this.catchCount > 1000) {
        this.scene.background = this.videoTextureArr[6];
    }
};

SceneBuilder.sceneBuilderArr = [
    // chapter 1
    scene1,
    scene2,
    scene3,
    scene4,
    scene5,
    // chapter 2
    scene6,
    scene7,
    scene8,
    scene9,
    // chapter 3
    scene10,
    scene11,
    scene12,
    scene13,
];
