import * as THREE from "three";
import * as CANNON from "https://cdn.skypack.dev/cannon-es";

class SceneBuilder {
    constructor() {
        this.scene = null;
    }

    setScene(scene) {
        this.scene = scene;
    }

    // lights, background color, etc
    defineScene() {}

    // transformations
    updateScene() {}
}

const sceneBuilder1 = new SceneBuilder();
sceneBuilder1.defineScene = function () {
    this.scene.background = new THREE.Color(0xffffff);
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);

    this.pointLight = new THREE.PointLight();
    this.scene.add(this.pointLight);
};
sceneBuilder1.updateScene = () => {};

const sceneBuilderArr = [
    sceneBuilder1,
    sceneBuilder1,
    sceneBuilder1,
    sceneBuilder1,
    sceneBuilder1,
    sceneBuilder1,
    sceneBuilder1,
    sceneBuilder1,
    sceneBuilder1,
    sceneBuilder1,
    sceneBuilder1,
    sceneBuilder1,
];

export default class SceneLoader {
    constructor() {
        this.scene = new THREE.Scene();
        this.sceneBuilder = null;
        // this.scene.background = new THREE.Color(0xffffff);
        // this.ambientLight = new THREE.AmbientLight(0xffffff);
        // this.scene.add(this.ambientLight);

        // this.pointLight = new THREE.PointLight();
        // this.scene.add(this.pointLight);
        this.physicsWorld = new CANNON.World();
        // this.playerCollider;
        // this.playerPathCollider;

        this.playerCollider;
        this.playerPath;

        this.pathPhysicsBody;
        this.pathPhysicsMaterial;

        this.playerPathColliderDebugMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide,
            wireframe: true,
            visible: false,
        });

        this.playerPathMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide,
            wireframe: true,
        });

        this.modelDefaultMaterial = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            side: THREE.DoubleSide,
            wireframe: true,
        });

        this._initPhysics();
    }

    buildScene(sceneNumber) {
        this.sceneBuilder = sceneBuilderArr[sceneNumber];
        this.sceneBuilder.setScene(this.scene);
        console.log(this.sceneBuilder);
        this.sceneBuilder.defineScene();
    }

    updateScene() {
        if (this.sceneBuilder == null) return;
        this.sceneBuilder.updateScene();
    }

    loadModels(modelURLArr, gltfLoader) {
        if (gltfLoader === undefined) {
            throw new Error("gltfLoader is not defined.");
        }
        const sceneRef = this.scene;
        const defaultMaterial = this.modelDefaultMaterial;
        modelURLArr.forEach((modelURL) => {
            gltfLoader.load(modelURL, function (gltf) {
                sceneRef.add(gltf.scene);
                gltf.scene.traverse((child) => {
                    // child.rotation.set(-Math.PI * 0.5, 0, 0);
                    if (child.isMesh) {
                        if (!child.material || child.material === null) {
                            console.log("Mesh has no material. Assigning a default one.");
                            child.material = defaultMaterial;
                        }

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

        gltfLoader.load(pathModelURL, (gltf) => {
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    child.material = this.playerPathMaterial;
                }
            });

            this.scene.add(gltf.scene);
        });
    }

    loadPathColliderModel(pathColliderModelURL, gltfLoader) {
        if (gltfLoader === undefined) {
            throw new Error("gltfLoader is not defined.");
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

            this.scene.add(gltf.scene);
        });
    }

    _createPathPhysics(mesh) {
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

    _initPhysics() {
        this.physicsWorld.gravity.set(0, -9.81, 0);
        this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);
        this.physicsWorld.solver.iterations = 50;
    }

    updatePhysics(deltaTime) {
        this.physicsWorld.step(deltaTime);
    }

    getScene() {
        return this.scene;
    }

    clearScene() {
        this.scene.clear();
    }

    clearPhysicsBody() {
        this.physicsWorld.removeBody(this.pathPhysicsBody);
        this.physicsWorld.removeBody(this.playerCollider.getPlayerPhysicsBody());
    }
}
