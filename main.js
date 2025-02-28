import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

import SceneLoader from "./js/SceneLoader.js";
import PlayerCollider from "./js/PlayerCollider.js";

function main() {
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // AUDIO
    // load sound files
    const audioLoader = new THREE.AudioLoader();

    //GUI
    const gui = new dat.GUI();
    const controls = new (function () {
        this.outputObj = function () {
            scene.children.forEach((c) => console.log(c));
        };
    })();
    gui.add(controls, "outputObj");
    //CAMERA
    const fov = 90;
    const aspect = 2; // display aspect of the canvas
    const near = 0.0001;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    const initPlayerPos = new THREE.Vector3(0.6, 0.01, -0.1);
    camera.position.copy(initPlayerPos);

    // CONTROLS
    const playerControls = new PointerLockControls(camera, document.body);
    const overlay = document.querySelector(".temp-overlay");

    const loadingManager = new THREE.LoadingManager();

    const gltfLoader = new GLTFLoader(loadingManager);
    const sceneLoader = new SceneLoader();
    const playerCollider = new PlayerCollider(new THREE.Vector3(0.6, 0.01, -0.1));

    loadingManager.onLoad = function () {
        sceneLoader.connectPlayerCollider(playerCollider);
        render();
    };

    let currentTrackNumber;
    document.querySelectorAll(".number-link").forEach((link) => {
        link.addEventListener("click", function (event) {
            event.preventDefault();

            const number = this.getAttribute("data-number");
            currentTrackNumber = parseInt(number);
            const currentSceneDef = sceneDef[currentTrackNumber - 1];
            const pathColliderURL = currentSceneDef.pathColliderURL;
            const pathModelURL = currentSceneDef.pathModelURL;
            const modelURLArr = currentSceneDef.modelURLArr;

            sceneLoader.loadModels(modelURLArr, gltfLoader);
            sceneLoader.loadPathModel(pathModelURL, gltfLoader);
            sceneLoader.loadPathColliderModel(pathColliderURL, gltfLoader);

            playerControls.lock();
        });
    });

    playerControls.addEventListener("lock", () => {
        overlay.style.display = "none";
    });

    playerControls.addEventListener("unlock", () => {
        overlay.style.display = "flex";
    });

    // let testPathColliderURL = "./assets/stage_1/player path collider/output2.gltf";
    // let testPathModelURL = "./assets/stage_1/player path/stage_1_path.gltf";
    // let testModelUrlArr = ["./assets/stage_1/models/output_3.gltf", "./assets/stage_1/models/output_4.gltf"];

    // const playerCollider = new PlayerCollider(new THREE.Vector3(0.6, 0.01, -0.1));
    // sceneLoader.loadModels(testModelUrlArr, gltfLoader);
    // sceneLoader.loadPathModel(testPathModelURL, gltfLoader);
    // sceneLoader.loadPathColliderModel(testPathColliderURL, gltfLoader);

    function updatePhysics(deltaTime) {
        sceneLoader.updatePhysics(deltaTime);
        playerCollider.movePlayer(camera);
        playerCollider.updatePlayer(camera);
    }

    const clock = new THREE.Clock();

    function render() {
        let deltaTime = clock.getDelta();
        updatePhysics(deltaTime);

        if (resizeRenderToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(sceneLoader.getScene(), camera);

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
