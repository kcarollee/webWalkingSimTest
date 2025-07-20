import * as THREE from "three";
import * as CANNON from "https://cdn.skypack.dev/cannon-es";
import SceneBuilder from "./SceneBuilder.js";
import NPCCollider from "./NPCCollider.js";

export default class SceneLoader {
    constructor() {
        this.scene = new THREE.Scene();

        this.sceneModelArr = [];
        this.sceneBuilder = null;
        this.shaderPass = null;
        // this.scene.background = new THREE.Color(0xffffff);
        // this.ambientLight = new THREE.AmbientLight(0xffffff);
        // this.scene.add(this.ambientLight);

        // this.pointLight = new THREE.PointLight();
        // this.scene.add(this.pointLight);
        this.physicsWorld = new CANNON.World();
        // this.playerCollider;
        // this.playerPathCollider;

        this.playerCollider = null;
        this.playerPath = null;

        this.pathPhysicsBody = null;
        this.pathPhysicsMaterial = null;

        this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
        this.cubeCamera = new THREE.CubeCamera(0.1, 500, this.cubeRenderTarget);
        this.scene.add(this.cubeCamera);

        this.playerPathColliderDebugMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,

            side: THREE.DoubleSide,
            wireframe: true,
            visible: true,
        });

        this.playerPathMaterial = new THREE.MeshPhongMaterial({
            color: 0xff00ff,
            side: THREE.DoubleSide,
            wireframe: true,
            opacity: 1,
        });

        this.modelDefaultMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide,
            // wireframe: true,
        });

        this._initPhysics();
    }

    setPostProcessingShader(shaderPass) {
        this.shaderPass = shaderPass;
    }

    buildScene(sceneNumber, playerCollider) {
        this.sceneBuilder = SceneBuilder.sceneBuilderArr[sceneNumber];
        this.sceneBuilder.setScene(this.scene);
        this.playerCollider = playerCollider;
        ////console.log("SETTING PLAYER COLLIDER TO SCENE", this.playerCollider);
        this.sceneBuilder.setPlayerCollider(this.playerCollider);
        //console.log(this.sceneBuilder);
        this.sceneBuilder.defineScene(this.sceneModelArr, this.shaderPass, this.playerPath);
    }

    updateScene(camera, songProgress) {
        if (this.sceneBuilder == null) return;
        this.sceneBuilder.updateScene(camera, songProgress);
    }

    loadModels(modelURLArr, gltfLoader, modelNameArr) {
        if (gltfLoader === undefined) {
            throw new Error("gltfLoader is not defined.");
        }
        const sceneRef = this.scene;
        const defaultMaterial = this.modelDefaultMaterial;
        const sceneModelArrRef = this.sceneModelArr;
        modelURLArr.forEach((modelURL, i) => {
            const modelName = modelNameArr[i];
            gltfLoader.load(modelURL, function (gltf) {
                gltf.scene.name = modelName;
                sceneRef.add(gltf.scene);

                sceneModelArrRef.push(gltf.scene);
                gltf.scene.traverse((child) => {
                    // child.rotation.set(-Math.PI * 0.5, 0, 0);
                    if (child.isMesh) {
                        if (!child.material || child.material === null) {
                            //console.log("Mesh has no material. Assigning a default one.");
                            child.material = defaultMaterial;
                        }
                        // child.material = defaultMaterial;
                        //child.scale.set(1, 5, 1);
                        child.material.needsUpdate = true;
                    }
                });
            });
        });
    }

    loadPathModel(pathModelURL, gltfLoader) {
        if (gltfLoader === undefined) {
            throw new Error("gltfLoader is not defined.");
        }

        if (pathModelURL === "") {
            //console.log("NOT PATH MODEL FOUND");
            return;
        }

        gltfLoader.load(pathModelURL, (gltf) => {
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    ////console.log(child);
                    this.playerPath = child;
                    //console.log(this.playerPath);
                    child.material = this.playerPathMaterial;
                }
            });

            this.scene.add(gltf.scene);
        });
    }

    // NOT USED ANYMORE
    loadPathColliderModel(pathColliderModelURL, gltfLoader) {
        if (gltfLoader === undefined) {
            throw new Error("gltfLoader is not defined.");
        }
        if (pathColliderModelURL === "") {
            //console.log("NO PAH COLLIDER MODEL FOUND");
            return;
        }
        gltfLoader.load(pathColliderModelURL, (gltf) => {
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    child.material = this.playerPathColliderDebugMaterial;
                }
            });
            // this.playerPathCollider = gltf.scene;
            const playerPathColliderMesh = gltf.scene.children[0];
            this._createPathPhysics(playerPathColliderMesh);
            //console.log("path mesh created");
            this.scene.add(gltf.scene);
        });
    }

    _createPathPhysics(mesh) {
        //console.log("CREATING NEW PATH PHYSICS");
        const geometry = mesh.geometry;
        const vertices = geometry.attributes.position.array;
        const indices = geometry.index.array;

        const shape = new CANNON.Trimesh(vertices, indices);
        this.pathPhysicsBody = new CANNON.Body({ mass: 0, shape: shape });
        this.pathPhysicsMaterial = new CANNON.Material("groundMaterial");

        this.pathPhysicsBody.material = this.pathPhysicsMaterial;
        this.pathPhysicsBody.position.set(0, 0, 0);

        this.physicsWorld.addBody(this.pathPhysicsBody);
    }

    connectPlayerCollider(playerCollider) {
        this.physicsWorld.addBody(playerCollider.getPlayerPhysicsBody());
        this.playerCollider = playerCollider;
    }

    connectNPCCollider(NPCCollider) {
        this.physicsWorld.addBody(playerCollider.getPlayerPhysicsBody());
        this.playerCollider = playerCollider;
    }

    _initPhysics() {
        // this.physicsWorld.gravity.set(0, -5, 0);
        this.physicsWorld.gravity.set(0, 0, 0);
        this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);
        this.physicsWorld.solver.iterations = 100;
    }

    updatePhysics(deltaTime) {
        this.physicsWorld.step(deltaTime);
    }

    getScene() {
        return this.scene;
    }

    clearScene() {
        this.scene.clear();
        this.sceneModelArr = [];

        const overlay = document.getElementById("textOverlay");
        if (overlay) overlay.remove();
    }

    clearModelsOnly() {
        this.sceneModelArr.forEach((model) => {
            this.scene.remove(model);
        });
        this.sceneModelArr = [];
    }

    getPathPhysicsBody() {
        return this.pathPhysicsBody;
    }

    clearPhysicsBody() {
        if (typeof this.pathPhysicsBody !== "undefined") {
            const bodies = this.physicsWorld.bodies.slice();

            for (let i = 0; i < bodies.length; i++) {
                this.physicsWorld.removeBody(bodies[i]);
            }
            //console.log("REMOVE PATH PHYSICS BODY");
            //this.physicsWorld.removeBody(this.pathPhysicsBody);
        }
        //console.log("REMOVE PLAYER PHYSICS BODY");
        this.physicsWorld.removeBody(this.playerCollider.getPlayerPhysicsBody());
        this.pathPhysicsBody = undefined;
        //console.log(this.physicsWorld);
        //console.log("PHYSICS BODY CLEARED");
    }
}
