class Lighting {
    constructor(scene) {
        this.scene = scene;
        this.setupLighting();
    }

    setupLighting() {
        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.ambientLight);

        // Main board spotlight
        this.boardLight = new THREE.SpotLight(0xffffff, 1.0);
        this.boardLight.position.set(0, 15, 0);
        this.boardLight.angle = Math.PI / 4;
        this.boardLight.penumbra = 0.4;
        this.boardLight.decay = 1.5;
        this.boardLight.distance = 40;
        this.boardLight.castShadow = true;
        
        // Improve shadow quality
        this.boardLight.shadow.mapSize.width = 1024;
        this.boardLight.shadow.mapSize.height = 1024;
        this.boardLight.shadow.camera.near = 1;
        this.boardLight.shadow.camera.far = 50;
        this.boardLight.shadow.bias = -0.001;
        this.scene.add(this.boardLight);

        // Player spotlight
        this.playerSpotlight = new THREE.SpotLight(0xffffff, 1.5);
        this.playerSpotlight.position.set(0, 10, 0);
        this.playerSpotlight.angle = Math.PI / 8;
        this.playerSpotlight.penumbra = 0.2;
        this.playerSpotlight.decay = 1.2;
        this.playerSpotlight.distance = 15;
        this.playerSpotlight.visible = false;
        this.playerSpotlight.castShadow = true;
        
        // Improve player spotlight shadow quality
        this.playerSpotlight.shadow.mapSize.width = 512;
        this.playerSpotlight.shadow.mapSize.height = 512;
        this.playerSpotlight.shadow.camera.near = 1;
        this.playerSpotlight.shadow.camera.far = 20;
        this.playerSpotlight.shadow.bias = -0.001;
        this.scene.add(this.playerSpotlight);
    }

    setSpotlight(position) {
        this.playerSpotlight.position.set(position.x, 10, position.z);
        this.playerSpotlight.visible = true;
        
        // Create a target for the spotlight
        if (!this.playerSpotlight.target.parent) {
            this.scene.add(this.playerSpotlight.target);
        }
        this.playerSpotlight.target.position.copy(position);
    }

    setAmbientIntensity(value) {
        this.ambientLight.intensity = value;
    }

    setBoardLightIntensity(value) {
        this.boardLight.intensity = value;
    }
}
