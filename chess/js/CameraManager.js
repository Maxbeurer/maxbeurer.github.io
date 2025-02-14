class CameraManager {
    constructor(scene) {
        this.scene = scene;
        this.setupCamera();
        this.currentMode = 'referee';
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        // Initialize camera controls
        this.controls = new THREE.OrbitControls(this.camera, document.querySelector('canvas'));
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Set initial referee position
        this.setRefereeView();
    }

    setRefereeView() {
        this.camera.position.set(0, 12, 8);
        this.camera.lookAt(0, 0, 0);
        this.controls.enabled = false;
        this.currentMode = 'referee';
    }

    setPlayerView(color) {
        const position = color === 'white' ? [0, 5, 12] : [0, 5, -12];
        this.camera.position.set(...position);
        this.camera.lookAt(0, 0, 0);
        this.controls.enabled = false;
        this.currentMode = 'player';
    }

    setFreeView() {
        this.camera.position.set(10, 10, 10);
        this.camera.lookAt(0, 0, 0);
        this.controls.enabled = true;
        this.currentMode = 'free';
    }

    update() {
        if (this.controls.enabled) {
            this.controls.update();
        }
    }
}
