import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

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

    // lights, background color, etc
    defineScene() {}

    // transformations
    updateScene() {}
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

    // SET REFERENCES
    this.sceneModelArr = sceneModelArr;
    this.shaderPass = shaderPass;
    this.playerPath = playerPath;

    // SET stageNumber SHADER UNIFROM
    this.shaderPass.uniforms.stageNumber.value = 1.0;

    // VIDEO TEXTURE (if applicable)
    const video = document.createElement("video");
    video.src = "./assets/video/demo3.mov";
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
    this.scene.add(this.sphereMesh);

    // STAGE-SPECIFIC MODELS IMPORT/SETUP
    this.stageModelArr = [];
    this.stageModelNum = 5;
    let scene = this.scene;
    let stageModelArr = this.stageModelArr;
    this.modelPath = "./assets/chapter_1/stage_1/";
    // TEXTURE IMPORT / SETUP
    console.log(gsap);
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
};

scene1.updateScene = function (camera, songProgress) {
    this.frameCount += 1;
    let scale = 0.9 + 0.05 * Math.sin(this.frameCount * 0.01);
    this.playerPath.scale.set(scale, scale, scale);
    this.playerPath.rotateY(scale * 0.01);

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
    // BACKGROUND
    this.scene.background = new THREE.Color(0xffa500);

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
    video.src = "./assets/chapter_1/stage_2/waterTex3.mov";
    video.loop = true;
    video.muted = true;
    video.play();

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;

    const video2 = document.createElement("video");
    video2.src = "./assets/chapter_1/stage_2/tongue.mp4";
    video2.loop = true;
    video2.muted = true;
    video2.play();

    const videoTexture2 = new THREE.VideoTexture(video2);
    videoTexture2.colorSpace = THREE.SRGBColorSpace;
    videoTexture2.minFilter = THREE.LinearFilter;
    videoTexture2.magFilter = THREE.LinearFilter;
    videoTexture2.generateMipmaps = false;

    // "WATER" EFFECT BOX MESH
    this.boxGeom = new THREE.BoxGeometry(100, 10, 100);
    this.boxMat = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide, map: videoTexture });
    this.boxMesh = new THREE.Mesh(this.boxGeom, this.boxMat);
    this.scene.add(this.boxMesh);

    this.boxMesh.position.y = -10;

    // SET stageNumber SHADER UNIFROM
    this.shaderPass.uniforms.stageNumber.value = 2;

    // STAGE-SPECIFIC MODELS IMPORT/SETUP
    let stageModelNum = 3;
    let scene = this.scene;
    this.modelPath = "./assets/chapter_1/stage_2/";

    for (let i = 0; i < stageModelNum; i++) {
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
            objMaterial = new THREE.MeshNormalMaterial({
                color: 0xffffff,
                wireframe: false,
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
            object.scale.set(0.5, 0.5, 0.5);
            if (i == 2) {
                object.rotateX(180);
                object.rotateY(-90);

                object.scale.set(-0.5, -0.5, -0.5);
            }
            scene.add(object);
        });
    }
};
// songprogress: 0~1
scene2.updateScene = function (camera, songProgress) {
    this.frameCount += 1;
    this.boxMesh.position.y = -10 * (1 - songProgress);
    // let scale = 0.9 + 0.05 * Math.sin(this.frameCount * 0.01);
    // this.playerPath.scale.set(scale, scale, scale);
    // this.playerPath.rotateY(scale * 0.001);
};

// TRACK 3: VARIOUS THINGS
const scene3 = new SceneBuilder();
scene3.defineScene = function (sceneModelArr, shaderPass, playerPath) {
    // VIDEO TEXTURE (if applicable)
    const video = document.createElement("video");
    video.src = "./assets/chapter_1/stage_3/bg.mov";
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

    console.log(playerPath);

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

    console.log(playerPath);

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
            // console.log("ANIMATION LANGTH : ", object.animations.length);
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

// TRACK 3: VARIOUS THINGS
const scene5 = new SceneBuilder();
scene5.defineScene = function (sceneModelArr, shaderPass, playerPath) {
    // VIDEO TEXTURE (if applicable)
    const video = document.createElement("video");
    video.src = "./assets/chapter_1/stage_3/bg.mov";
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

    console.log(playerPath);

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
};

scene5.updateScene = function () {
    this.frameCount += 1;
    // let scale = 0.9 + 0.05 * Math.sin(this.frameCount * 0.01);

    this.playerPath.rotateY(0.001);
    this.pathClone.rotateY(0.001);
    if (this.stageModelArr.length > 0) this.stageModelArr[0].rotateY(-0.001);
};

const sceneBuilder1 = new SceneBuilder();
sceneBuilder1.defineScene = function (sceneModelArr) {
    this.scene.background = new THREE.Color(0xaa0000);
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);

    this.pointLight = new THREE.PointLight();
    this.scene.add(this.pointLight);

    const buildingModel = sceneModelArr[1].children[0];
    const roadModel = sceneModelArr[0].children[0];
    console.log(buildingModel);

    const video = document.createElement("video");
    video.src = "./assets/video/demo3.mov";
    video.loop = true;
    video.muted = true;
    video.play();

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;

    buildingModel.material = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide });

    // hdri texture test

    const envMap = this.textureLoader.load([
        "./assets/cubeMaps/cubeMap1/nx.png",
        "./assets/cubeMaps/cubeMap1/ny.png",
        "./assets/cubeMaps/cubeMap1/nz.png",
        "./assets/cubeMaps/cubeMap1/px.png",
        "./assets/cubeMaps/cubeMap1/py.png",
        "./assets/cubeMaps/cubeMap1/pz.png",
    ]);
    envMap.mapping = THREE.CubeRefractionMapping;
    this.scene.environment = envMap;

    const roadTexture = this.textureLoader.load("./assets/chapter_1/stage_1/roadNormal.png");
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
        map: this.textureLoader.load("./assets/chapter_1/stage_1/textures/carMaterial_diffuse.png"),
    });

    this.carMeshArr = [];
    this.carMeshGroup = new THREE.Group();
    let carMeshArr = this.carMeshArr;
    let carMeshGroup = this.carMeshGroup;
    loader.load("./assets/chapter_1/stage_1/scene.gltf", function (gltf) {
        gltf.scene.material = carMat;
        gltf.scene.scale.set(2, 2, 2);

        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                console.log(child);
                child.material = carMat;
            } else {
                child.material = carMat;
            }
            child.material.needsUpdate = true;
        });
        scene.add(gltf.scene);

        for (let i = 0; i < 100; i++) {
            const clone = gltf.scene.clone();
            clone.position.set(Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50);
            clone.rotation.set(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            clone.scale.set(0.5, 0.5, 0.5);
            carMeshArr.push(clone);
            carMeshGroup.add(clone);
        }

        scene.add(carMeshGroup);
    });

    const bgSphereGeo = new THREE.SphereGeometry(100, 10, 10, 10);
    const bgSphereMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, wireframe: true });
    const bgSphereMesh = new THREE.Mesh(bgSphereGeo, bgSphereMat);

    this.scene.add(bgSphereMesh);
};
sceneBuilder1.updateScene = function (camera) {
    this.pointLight.position.copy(camera.position);
    this.carMeshGroup.rotateX(0.01);
    this.frameCount++;
};

const sceneBuilder4 = new SceneBuilder();
sceneBuilder4.defineScene = function (sceneModelArr) {
    this.scene.background = new THREE.Color(0x0000000);
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);

    this.pointLight = new THREE.PointLight();
    this.scene.add(this.pointLight);
};
sceneBuilder4.updateScene = function () {};

const sceneBuilder3 = new SceneBuilder();
sceneBuilder3.defineScene = function () {
    this.scene.background = new THREE.Color(0x000000);
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.pointLight = new THREE.PointLight(0xffffff);
    this.pointLight.position.set(0, 4, 0);

    this.pointLight2 = new THREE.PointLight(0xffffff);
    this.pointLight2.position.set(3, 4, 3);

    this.pointLight3 = new THREE.PointLight(0xffffff);
    this.pointLight3.position.set(3, 4, -3);

    this.pointLight4 = new THREE.PointLight(0xffffff);
    this.pointLight4.position.set(-3, 4, 3);

    this.pointLight.power = 20;
    this.pointLight2.power = 20;
    this.pointLight3.power = 20;
    this.pointLight4.power = 20;
    this.scene.add(this.ambientLight);
    this.scene.add(this.pointLight);
    this.scene.add(this.pointLight2);
    this.scene.add(this.pointLight3);
    this.scene.add(this.pointLight4);

    this.pointLight = new THREE.PointLight();
    this.scene.add(this.pointLight);
};

sceneBuilder3.updateScene = function () {
    this.pointLight.position.y = 5 + Math.sin(this.frameCount * 0.05);
    this.pointLight.position.x = Math.sin(this.frameCount * 0.05);
    this.pointLight.position.z = Math.cos(this.frameCount * 0.05);
    this.frameCount += 1;
};

const sceneBuilder2 = new SceneBuilder();
sceneBuilder2.defineScene = function (sceneModelArr) {
    this.scene.background = new THREE.Color(0x0000ff);

    this.pointLight = new THREE.PointLight(0xffffff);
    this.pointLight.position.set(0, 2, 5);
    this.pointLight.power = 100;

    this.scene.add(this.pointLight);

    // video texture test
    const video = document.createElement("video");
    video.src = "./assets/video/demo.mov";
    video.loop = true;
    video.muted = true;
    video.play();

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;

    // hdri texture test
    const textureLoader = new THREE.CubeTextureLoader();
    const envMap = textureLoader.load([
        "./assets/cubeMaps/cubeMap1/nx.png",
        "./assets/cubeMaps/cubeMap1/ny.png",
        "./assets/cubeMaps/cubeMap1/nz.png",
        "./assets/cubeMaps/cubeMap1/px.png",
        "./assets/cubeMaps/cubeMap1/py.png",
        "./assets/cubeMaps/cubeMap1/pz.png",
    ]);
    envMap.mapping = THREE.CubeRefractionMapping;
    this.scene.environment = envMap;
    sceneModelArr.forEach((obj, i) => {
        let newMaterial;
        switch (i) {
            case 0:
                newMaterial = new THREE.MeshStandardMaterial({
                    side: THREE.DoubleSide,
                    roughness: 0.0,
                    metalness: 0.1,
                    envMap: envMap,
                });
                break;
            case 1:
                newMaterial = new THREE.MeshStandardMaterial({
                    side: THREE.DoubleSide,
                    roughness: 0.0,
                    metalness: 0.1,
                    envMap: envMap,
                });
                break;
            case 2:
                newMaterial = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide });
                break;
        }
        obj.traverse((child) => {
            child.material = newMaterial;
            child.material.needsUpdate = true;
        });
    });
};

SceneBuilder.sceneBuilderArr = [
    scene1,
    scene2,
    scene3,
    scene4,
    scene5,
    sceneBuilder4,
    sceneBuilder4,
    sceneBuilder4,
    sceneBuilder4,
    sceneBuilder1,
    sceneBuilder2,
    sceneBuilder3,
    sceneBuilder4,
];
