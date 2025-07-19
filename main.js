import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { CopyShader } from "three/addons/shaders/CopyShader.js";

import SceneLoader from "./js/SceneLoader.js";
import PlayerCollider from "./js/PlayerCollider.js";

function main() {
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    //GUI
    const gui = new dat.GUI();
    let shaderViewOn = true;
    const controls = new (function () {
        this.outputObj = function () {
            scene.children.forEach((c) => console.log(c));
        };
    })();

    const debugSettings = {
        shaderViewOn: true,
        debugPathViewOn: false,
        pathPhysicsTest: false,
    };

    gui.add(controls, "outputObj");

    gui.add(debugSettings, "shaderViewOn");
    gui.add(debugSettings, "debugPathViewOn").onChange((value) => {
        sceneLoader.playerPathColliderDebugMaterial.visible = value;
    });
    gui.add(debugSettings, "pathPhysicsTest").onChange((value) => {
        console.log(sceneLoader.getPathPhysicsBody());
    });

    //CAMERA
    const fov = 90;
    const aspect = 2; // display aspect of the canvas
    const near = 0.0001;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    const initPlayerPos = new THREE.Vector3(0.6, 0.01, -0.1);
    camera.position.copy(initPlayerPos);

    // AUDIO
    // load sound files
    const audioListener = new THREE.AudioListener();
    const audioLoader = new THREE.AudioLoader();
    const sound = new THREE.Audio(audioListener);
    const audioAnalyzer = new THREE.AudioAnalyser(sound, 64);
    const ctxCanvas = document.getElementById("spectrumCanvas");
    const ctx = ctxCanvas.getContext("2d");
    ctxCanvas.width = 256;
    ctxCanvas.height = 64;

    const canvasTexture = new THREE.CanvasTexture(ctxCanvas);
    const audioMaterial = new THREE.SpriteMaterial({ map: canvasTexture, transparent: true });
    const audioSprite = new THREE.Sprite(audioMaterial);
    audioSprite.scale.set(2, 2, 1);
    audioSprite.position.set(0, -1, -2);

    camera.add(audioListener);
    camera.add(audioSprite);

    function updateCanvas() {
        ctx.clearRect(0, 0, ctxCanvas.width, ctxCanvas.height);

        // Get frequency data
        const data = audioAnalyzer.getFrequencyData();
        const newDataNum = data.length * 0.75;
        // console.log(data.length);
        ctx.fillStyle = "black";
        const width = ctxCanvas.width / newDataNum;
        for (let i = 0; i < newDataNum; i++) {
            const height = (data[i] / 256) * ctxCanvas.height;
            ctx.fillRect(width * i, (ctxCanvas.height - height) * 0.5, width * 0.75, height);
        }

        canvasTexture.needsUpdate = true;
        requestAnimationFrame(updateCanvas);
    }
    updateCanvas();

    // CONTROLS
    const playerControls = new PointerLockControls(camera, document.body);
    const overlay = document.querySelector(".temp-overlay");

    const loadingManager = new THREE.LoadingManager();

    const gltfLoader = new GLTFLoader(loadingManager);
    const sceneLoader = new SceneLoader();
    const playerCollider = new PlayerCollider(new THREE.Vector3(0.6, 0.01, -0.1));

    loadingManager.onLoad = function () {
        console.log("ASSETS LOADED");
        const currentSceneDef = sceneDef[currentTrackNumber];
        const initPos = currentSceneDef.initPos;
        playerCollider.reset();
        playerCollider.setPosition(initPos[0], initPos[1], initPos[2]);
        sceneLoader.buildScene(currentTrackNumber, playerCollider);
        // the time out is a must to ensure that all physics bodies are created for collision
        setTimeout(() => {
            sceneLoader.connectPlayerCollider(playerCollider);
        }, 1000);
    };

    // INTRO SCENE
    const mouse = new THREE.Vector2();
    const easeMouse = new THREE.Vector2();
    const prevMouse = new THREE.Vector2();
    const actualMousePoint = new THREE.Vector2(); // mouse point raycasted onto an invisible plane
    let mouseVel = 0;
    window.addEventListener("mousemove", (event) => {
        prevMouse.copy(mouse);
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        mouseVel = prevMouse.distanceTo(mouse);
    });

    const introScene = new THREE.Scene();
    let introSceneMode = true;
    const introCamera = new THREE.PerspectiveCamera();
    const raycaster = new THREE.Raycaster();
    introCamera.position.set(0, 0, 0);
    gsap.to(introCamera.position, {
        duration: 3,
        z: 1.5,
        ease: "power2.out",
    });

    const testGeo = new THREE.PlaneGeometry(5, 5);
    const testMat = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 1.0 });
    const testMesh = new THREE.Mesh(testGeo, testMat);
    testMesh.visible = false;
    introScene.add(testMesh);

    const introLight = new THREE.PointLight();
    const introLight2 = new THREE.PointLight();
    const introLight3 = new THREE.PointLight();

    introLight.position.set(0, 0, 0.5);
    introLight2.position.set(-0.5, 0, 0.5);
    introLight3.position.set(0.5, 0, 0.5);

    introLight.intensity = 2;
    introScene.add(introLight);
    introScene.add(introLight2);
    introScene.add(introLight3);

    introScene.background = new THREE.Color(0x000000);

    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const envMap = cubeTextureLoader.load([
        "./assets/cubeMaps/cubeMap1/px.png",
        "./assets/cubeMaps/cubeMap1/py.png",
        "./assets/cubeMaps/cubeMap1/pz.png",
        "./assets/cubeMaps/cubeMap1/nx.png",
        "./assets/cubeMaps/cubeMap1/ny.png",
        "./assets/cubeMaps/cubeMap1/nz.png",
    ]);
    const loadingManager2 = new THREE.LoadingManager();
    const gltfLoader2 = new GLTFLoader(loadingManager2);

    loadingManager2.onLoad = function () {
        introMeshArr.forEach((mesh) => {
            mesh.geometry.setDrawRange(0);
        });
        introModelsLoaded = true;
    };

    const introModelMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        metalness: 0.8,
        roughness: 0.0,
        envMap: envMap,
        wireframe: false,
    });

    const introModelMaterial2 = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
    });

    const introMeshArr = [];

    let introMesh;
    let introModelsLoaded = false;

    let introMeshInitialPositions = [];
    let introSphereMeshArr = [];

    gltfLoader2.load("./assets/introModels/output.gltf", function (gltf) {
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = introModelMaterial2;
                child.material.needsUpdate = true;
                introMesh = child;

                const geometry = child.geometry;
                const positionAttribute = geometry.attributes.position;

                const sphereGeometry = new THREE.SphereGeometry(0.025, 15, 15); // Small sphere
                const sphereMaterial = introModelMaterial;

                for (let i = 0; i < positionAttribute.count; i++) {
                    const x = positionAttribute.getX(i);
                    const y = positionAttribute.getY(i);
                    const z = positionAttribute.getZ(i);

                    introMeshInitialPositions.push([x, y, z]);

                    // const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

                    // sphere.position.set(x, y, z);
                    // sphere.scale.set(0, 0, 0);
                    // sphere.visible = false;
                    // introSphereMeshArr.push(sphere);
                    // introScene.add(sphere);
                }
            }
        });

        //gltf.scene.position.set(0, 0.1, 0);
        introScene.add(gltf.scene);
    });

    function updateRaycaster() {
        easeMouse.x += (mouse.x - easeMouse.x) * 0.1;
        easeMouse.y += (mouse.y - easeMouse.y) * 0.1;
        raycaster.setFromCamera(easeMouse, introCamera);
        const intersects = raycaster.intersectObject(testMesh);

        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            // If the ray intersects the plane, we can extract the point
            if (intersects.length > 0) {
                const point = intersects[0].point;
                actualMousePoint.x = point.x;
                actualMousePoint.y = point.y;
            }
        }
    }
    function updateMeshPositions() {
        if (introMesh.geometry) {
            const geometry = introMesh.geometry;
            const positionAttribute = geometry.attributes.position;

            for (let i = 0; i < positionAttribute.count; i++) {
                const initialPosition = introMeshInitialPositions[i];
                const ix = initialPosition[0];
                const iy = initialPosition[1];

                const x = positionAttribute.getX(i);
                const y = positionAttribute.getY(i);
                const z = positionAttribute.getZ(i);
                const dist = actualMousePoint.distanceTo(new THREE.Vector2(x, y));

                if (dist < 0.1) continue;
                const newX = ((actualMousePoint.x - ix) * 0.05) / dist;
                const newY = ((actualMousePoint.y - iy) * 0.05) / dist;

                // Update the vertex positions
                positionAttribute.setXYZ(i, ix + newX, iy + newY, z);
                //introSphereMeshArr[i].position.set(ix + newX, iy + newY, z);
            }

            positionAttribute.needsUpdate = true;
        }
    }

    let currentTrackNumber = -1;
    let nextTrackNumber = -1;
    let currentSceneDef = null;
    let currentTrackElement = null;
    let currentChapter = 1;
    let previousChapter = currentChapter;

    let trackListOpen = false;

    let pause = false;

    document.querySelectorAll(".track").forEach((link) => {
        link.addEventListener("click", function (event) {
            // stage status check
            let cleared = this.getAttribute("data-status");
            if (cleared === "UNCLEARED") return;

            if (!allTrackListStringsLoaded()) return;

            const sceneNumber = this.getAttribute("data-scene");
            const nextSceneNumber = this.getAttribute("data-next");

            if (currentTrackNumber == sceneNumber) {
                console.log("RESUME");
                playerControls.lock();
                sound.play();
                pause = false;
                return;
            }

            // avoid shader transition on the very first scene selected
            // if (currentTrackNumber !== -1) {
            //     shaderPass.uniforms.transition.value = 0;
            //     gsap.to(shaderPass.uniforms.transition, {
            //         duration: 1,
            //         value: 200,
            //         yoyo: true,
            //         repeat: 1,
            //     });
            // }

            soundContextOffset = sound.context.currentTime;
            //transitionTriggered = false;
            // turn on shader
            debugSettings.shaderViewOn = true;
            previousChapter = currentChapter;
            currentChapter = Number(this.getAttribute("data-chapter"));
            currentTrackElement = this;

            event.preventDefault();
            introSceneMode = false;

            // if there is a scene and physics body to be cleared
            if (currentTrackNumber != -1) {
                sound.stop();

                // if chapter is different, clearScene + clearPhysicsBody
                if (currentChapter !== previousChapter) {
                    console.log("DIFFERENT CHAPTER");
                    sceneLoader.clearScene();
                    sceneLoader.clearPhysicsBody();
                }
                // else claerModelsOnly + clearPhysicsBody
                else {
                    console.log("SAME CHAPTER");
                    sceneLoader.clearScene();
                    sceneLoader.clearModelsOnly();
                    sceneLoader.clearPhysicsBody();
                }
            }

            currentTrackNumber = parseInt(sceneNumber);
            nextTrackNumber = parseInt(nextSceneNumber);

            loadStage(currentTrackNumber);
            // sceneLoader.buildScene(currentTrackNumber);

            playerControls.lock();
            pause = false;
            // document.body.requestPointerLock();
        });
    });

    // document.addEventListener("keydown", function (event) {
    //     if (event.key === "Escape") {
    //         console.log("RESUME");
    //         if (!playerControls.isLocked) {
    //             console.log("NOT LOCKED TO LOCK");
    //             playerControls.lock();
    //             sound.play();
    //         }
    //     }
    // });

    function loadStage(trackNumber) {
        currentSceneDef = sceneDef[trackNumber];
        const pathColliderURL = currentSceneDef.pathColliderURL;
        const pathModelURL = currentSceneDef.pathModelURL;
        const modelURLArr = currentSceneDef.modelURLArr;
        const modelNameArr = currentSceneDef.modelNameArr;
        const trackURL = currentSceneDef.trackURL;

        //sceneLoader.loadPathColliderModel(pathColliderURL, gltfLoader);
        sceneLoader.loadModels(modelURLArr, gltfLoader, modelNameArr);
        sceneLoader.loadPathModel(pathModelURL, gltfLoader);

        audioLoader.load(trackURL, (buffer) => {
            sound.setBuffer(buffer);
            sound.setLoop(false);
            sound.setVolume(1);
            sound.play();
        });
    }

    // TO DO
    /*
    - FIGURE OUT HOW TO CLEAR SCENE WITHOUT CLEARING THE PATH MODELS
    - FIGURE OUT HOW TO SET DIFFERENT GRAVITY PER CHAPTER
    - NOTE THAT THE FIRST CHAPTER DOESN"T HAVE ANY PHYSICS BODIES, WHICH MEANS THAT THE physicsWorld is undefined
    */

    let soundContextOffset = 0;
    let transitionTriggered = false;
    let songProgress = 0;
    function checkTrackTime() {
        if (sound.isPlaying) {
            const duration = sound.buffer.duration;
            const triggerTime = duration - 0.1;

            const currentTime = sound.context.currentTime - soundContextOffset;
            songProgress = currentTime / duration;
            //console.log(currentTime, triggerTime, transitionTriggered);
            // if (currentTime > triggerTime && !transitionTriggered) {
            //     gsap.to(shaderPass.uniforms.transition, {
            //         duration: 0.5,
            //         value: 200,
            //         yoyo: true,
            //         repeat: 1,
            //     });
            //     transitionTriggered = true;
            //     console.log("TRANSITION UPON TRACK ENDING");
            // }
        }
    }

    sound.onEnded = function () {
        this.stop();

        soundContextOffset = this.context.currentTime;
        //transitionTriggered = false;
        sceneLoader.clearScene();
        sceneLoader.clearModelsOnly();
        sceneLoader.clearPhysicsBody();
        currentTrackNumber = currentSceneDef.nextSceneNumber;
        const currentTrackDiv = document.querySelector(`.track[data-scene="${currentTrackNumber}"]`);
        currentTrackDiv.setAttribute("data-status", "CLEARED");
        currentTrackDiv.style.color = "white";

        // changing cleared status of the next chapter.
        // note that the indices may have to be changed depending on the number of songs per chapter
        if (currentTrackNumber === 0) {
            const chapterDiv = document.querySelector(`.number-link[data-chapter="2"]`);
            chapterDiv.style.color = "white";
            const trackDiv = document.querySelector(`.track[data-scene="5"]`);
            trackDiv.setAttribute("data-status", "CLEARED");
            trackDiv.style.color = "white";
        } else if (currentTrackNumber === 5) {
            const chapterDiv = document.querySelector(`.number-link[data-chapter="3"]`);
            chapterDiv.style.color = "white";
            const trackDiv = document.querySelector(`.track[data-scene="9"]`);
            trackDiv.setAttribute("data-status", "CLEARED");
            trackDiv.style.color = "white";
        }
        loadStage(currentTrackNumber);
    };

    playerControls.addEventListener("lock", () => {
        overlay.style.display = "none";
    });

    playerControls.addEventListener("unlock", () => {
        pause = true;
        //sound.pause();
        resetTrackListStrings();
        overlay.style.display = "flex";
    });

    function updatePhysics(deltaTime) {
        sceneLoader.updatePhysics(deltaTime);

        sceneLoader.updateScene(camera, songProgress, playerCollider);

        if (!pause) {
            playerCollider.movePlayer(camera);
            playerCollider.updatePlayer(camera);
        }
    }

    // POST-PROCESSING
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(sceneLoader.getScene(), camera);
    const shaderPass = new ShaderPass(CustomShader);

    composer.setSize(window.innerWidth, window.innerHeight);
    composer.setPixelRatio(window.devicePixelRatio);

    composer.addPass(renderPass);
    composer.addPass(shaderPass);
    composer.addPass(new ShaderPass(CopyShader));

    sceneLoader.setPostProcessingShader(shaderPass);

    const clock = new THREE.Clock();
    let tick = 0;
    let tick2 = 0;
    let startOffset = 100;
    function render() {
        runGameLogic();
        requestAnimationFrame(render);
    }

    let frameCount = 0;
    function runGameLogic() {
        let deltaTime = clock.getDelta();
        frameCount += 1;
        updatePhysics(deltaTime);
        checkTrackTime();
        if (resizeRenderToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();

            introCamera.aspect = canvas.clientWidth / canvas.clientHeight;
            introCamera.updateProjectionMatrix();
        }

        // renderer.render(sceneLoader.getScene(), camera);

        if (introSceneMode) {
            if (introModelsLoaded) {
                introMeshArr.forEach((mesh) => {
                    if (mesh.geometry) mesh.geometry.setDrawRange(0, tick * 50);
                });

                if (tick > startOffset) {
                    if (tick - startOffset < introSphereMeshArr.length) {
                        const sphere = introSphereMeshArr[tick - startOffset];
                        sphere.visible = true;
                        gsap.to(sphere.scale, {
                            duration: 2,
                            x: 1,
                            y: 1,
                            z: 1,
                            ease: "power2.out",
                        });
                    }
                }

                updateMeshPositions();
                updateRaycaster();
                if (tick2 % 3 == 0) tick += 1;
                tick2 += 1;
            }
            if (debugSettings.shaderViewOn) {
                renderPass.scene = introScene;
                renderPass.camera = introCamera;
                composer.render();
            } else {
                renderer.render(introScene, introCamera);
            }

            //renderer.render(introScene, introCamera);
        } else {
            if (debugSettings.shaderViewOn) {
                renderPass.camera = camera;
                renderPass.scene = sceneLoader.getScene();
                composer.render();

                shaderPass.uniforms.resolution.value = new THREE.Vector2(window.innerWidth, window.innerHeight);
                shaderPass.uniforms.time.value = deltaTime * 10.0;
                shaderPass.uniforms.frameCount.value = frameCount;
            } else {
                renderer.render(sceneLoader.getScene(), camera);
            }
        }
    }

    function resizeRenderToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width = (canvas.clientWidth * pixelRatio) | 0; // or 0
        const height = (canvas.clientHeight * pixelRatio) | 0; // 0
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    requestAnimationFrame(render);
}
main();
