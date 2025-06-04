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
    };

    gui.add(controls, "outputObj");
    gui.add(debugSettings, "shaderViewOn");
    gui.add(debugSettings, "debugPathViewOn").onChange((value) => {
        sceneLoader.playerPathColliderDebugMaterial.visible = value;
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
    sound.setLoop(true);
    sound.setVolume(0);
    camera.add(audioListener);

    // CONTROLS
    const playerControls = new PointerLockControls(camera, document.body);
    const overlay = document.querySelector(".temp-overlay");

    const loadingManager = new THREE.LoadingManager();

    const gltfLoader = new GLTFLoader(loadingManager);
    const sceneLoader = new SceneLoader();
    const playerCollider = new PlayerCollider(new THREE.Vector3(0.6, 0.01, -0.1));

    loadingManager.onLoad = function () {
        console.log("HUH");
        sceneLoader.connectPlayerCollider(playerCollider);
        // render();
    };

    let currentTrackNumber = -1;
    document.querySelectorAll(".number-link").forEach((link) => {
        link.addEventListener("click", function (event) {
            event.preventDefault();

            if (!allTrackListStringsLoaded()) return;
            const number = this.getAttribute("data-number");
            if (currentTrackNumber == number) {
                console.log("RESUME");
                playerControls.lock();
                sound.play();
                return;
            }

            // if there is a scene and physics body to be cleared
            if (currentTrackNumber != -1) {
                console.log("CLEAR SCENE");
                sound.stop();
                sceneLoader.clearScene();
                sceneLoader.clearPhysicsBody();
            }

            currentTrackNumber = parseInt(number);
            console.log("CURRENT SCENE: ", currentTrackNumber);
            const currentSceneDef = sceneDef[currentTrackNumber - 1];
            const pathColliderURL = currentSceneDef.pathColliderURL;
            const pathModelURL = currentSceneDef.pathModelURL;
            const modelURLArr = currentSceneDef.modelURLArr;
            const trackURL = currentSceneDef.trackURL;

            sceneLoader.buildScene(currentTrackNumber - 1);
            sceneLoader.loadModels(modelURLArr, gltfLoader);
            sceneLoader.loadPathModel(pathModelURL, gltfLoader);
            sceneLoader.loadPathColliderModel(pathColliderURL, gltfLoader);

            const initPos = currentSceneDef.initPos;
            playerCollider.setPosition(initPos[0], initPos[1], initPos[2]);

            audioLoader.load(trackURL, (buffer) => {
                sound.setBuffer(buffer);
                sound.setLoop(true);
                sound.setVolume(0.0);
                sound.play();
            });
            playerControls.lock();
            // document.body.requestPointerLock();
        });
    });

    playerControls.addEventListener("lock", () => {
        overlay.style.display = "none";
    });

    playerControls.addEventListener("unlock", () => {
        sound.pause();
        resetTrackListStrings();
        overlay.style.display = "flex";
    });

    function updatePhysics(deltaTime) {
        sceneLoader.updatePhysics(deltaTime);
        sceneLoader.updateScene();
        playerCollider.movePlayer(camera);
        playerCollider.updatePlayer(camera);
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

    const clock = new THREE.Clock();

    function render() {
        let deltaTime = clock.getDelta();
        updatePhysics(deltaTime);

        if (resizeRenderToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        // renderer.render(sceneLoader.getScene(), camera);

        if (debugSettings.shaderViewOn) composer.render();
        else renderer.render(sceneLoader.getScene(), camera);

        requestAnimationFrame(render);
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
