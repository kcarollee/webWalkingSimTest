import * as THREE from "three";
import * as CANNON from "https://cdn.skypack.dev/cannon-es";

export default class PlayerCollider {
    constructor(initPosVec) {
        this.initPos = initPosVec;
        this.moveDirection = {
            forward: 0,
            right: 0,
        };
        this.moveSpeed = 0.1;

        this.playerPhysicsBody = null;
        this.playerPhysicsMaterial = null;
        this._createPlayerCollider();
    }

    _createPlayerCollider() {
        const radius = 0.01;
        const height = 0.01;

        // Create a cylinder and spheres for capsule shape
        const cylinder = new CANNON.Cylinder(radius, radius, height, 8);
        const sphereTop = new CANNON.Sphere(radius);
        const sphereBottom = new CANNON.Sphere(radius);

        this.playerPhysicsBody = new CANNON.Body({ mass: 1 });

        // Add shapes
        this.playerPhysicsBody.addShape(cylinder, new CANNON.Vec3(0, 0, 0));
        this.playerPhysicsBody.addShape(sphereTop, new CANNON.Vec3(0, height / 2, 0));
        this.playerPhysicsBody.addShape(sphereBottom, new CANNON.Vec3(0, -height / 2, 0));

        // Set initial position
        this.playerPhysicsBody.position.set(this.initPos.x, this.initPos.y, this.initPos.z);
        //this.physicsWorld.addBody(this.playerPhysicsBody);

        this.playerPhysicsMaterial = new CANNON.Material("playerMaterial");
        this.playerPhysicsBody.material = this.playerPhysicsMaterial;

        // const groundMaterial = new CANNON.Material("groundMaterial");

        // // Set friction between player and the ground
        // const contactMaterial = new CANNON.ContactMaterial(this.playerPhysicsBody.material, groundMaterial, {
        //     friction: 1.0, // Increase friction to prevent sliding
        //     restitution: 0.0, // No bounciness
        // });

        // this.physicsWorld.addContactMaterial(contactMaterial);
    }

    getPlayerPhysicsBody() {
        return this.playerPhysicsBody;
    }

    movePlayer(camera) {
        let forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0; // Keep movement horizontal
        forward.normalize();

        let right = new THREE.Vector3();
        right.crossVectors(camera.up, forward).normalize();

        let velocity = new CANNON.Vec3(0, 0, 0);
        if (PlayerCollider.moveDirection.forward !== 0) {
            velocity.vadd(
                forward.multiplyScalar(PlayerCollider.moveDirection.forward * PlayerCollider.moveSpeed),
                velocity
            );
        }
        if (PlayerCollider.moveDirection.right !== 0) {
            velocity.vadd(
                right.multiplyScalar(PlayerCollider.moveDirection.right * PlayerCollider.moveSpeed),
                velocity
            );
        }

        this.playerPhysicsBody.velocity.set(velocity.x, this.playerPhysicsBody.velocity.y, velocity.z);
    }

    updatePlayer(camera) {
        camera.position.copy(this.playerPhysicsBody.position);
    }
}

PlayerCollider.moveDirection = {
    forward: 0,
    right: 0,
};
PlayerCollider.moveSpeed = 0.1;

document.addEventListener("keydown", (event) => {
    if (event.code === "KeyW") PlayerCollider.moveDirection.forward = 1;
    if (event.code === "KeyS") PlayerCollider.moveDirection.forward = -1;
    if (event.code === "KeyA") PlayerCollider.moveDirection.right = 1;
    if (event.code === "KeyD") PlayerCollider.moveDirection.right = -1;
});

document.addEventListener("keyup", (event) => {
    if (event.code === "KeyW" || event.code === "KeyS") PlayerCollider.moveDirection.forward = 0;
    if (event.code === "KeyA" || event.code === "KeyD") PlayerCollider.moveDirection.right = 0;
});
