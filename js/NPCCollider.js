import * as THREE from "three";
import * as CANNON from "https://cdn.skypack.dev/cannon-es";
import PlayerCollider from "./PlayerCollider.js";

export default class NPCCollider extends PlayerCollider {
    constructor(initPosVec) {
        super(initPosVec);

        this.geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        this.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    applyRandomForce() {
        const force = new CANNON.Vec3((Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10);
        this.playerPhysicsBody.applyForce(force, this.playerPhysicsBody.position);
        const pos = this.playerPhysicsBody.position;
        this.mesh.position.set(pos.x, pos.y, pos.z);
    }

    addToScene(scene) {
        scene.add(this.mesh);
    }
}

NPCCollider.moveDirection = {
    forward: 0,
    right: 0,
};
NPCCollider.moveSpeed = 0.1;
