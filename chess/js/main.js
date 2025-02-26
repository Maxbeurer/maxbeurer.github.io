class ChessApp {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        document.body.appendChild(this.renderer.domElement);

        // Initialize managers
        this.materials = new Materials();
        this.lighting = new Lighting(this.scene);
        this.cameraManager = new CameraManager(this.scene);
        this.chessBoard = new ChessBoard(this.scene, this.materials);
        this.gui = new ChessGUI(this);

        // Setup initial state
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.hoveredPiece = null;

        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize(), false);
        this.renderer.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseHover(e), false);
        
        // Start animation loop
        this.animate();
    }

    onWindowResize() {
        this.cameraManager.camera.aspect = window.innerWidth / window.innerHeight;
        this.cameraManager.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseHover(event) {
        if (this.selectedPiece) return;

        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.cameraManager.camera);

        const intersects = raycaster.intersectObjects(this.chessBoard.pieces, true);

        if (intersects.length > 0) {
            const piece = intersects[0].object;
            if (piece !== this.hoveredPiece) {
                if (this.hoveredPiece) {
                    this.chessBoard.unhighlightPiece(this.hoveredPiece);
                }
                if (piece.userData.color === this.currentPlayer) {
                    this.hoveredPiece = piece;
                    this.chessBoard.highlightPiece(piece);
                }
            }
        } else if (this.hoveredPiece) {
            this.chessBoard.unhighlightPiece(this.hoveredPiece);
            this.hoveredPiece = null;
        }
    }

    onMouseDown(event) {
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.cameraManager.camera);

        // Create a plane at y=0 for intersection
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersectPoint);

        // First, check for piece intersections
        const pieceIntersects = raycaster.intersectObjects(this.chessBoard.pieces, true);

        if (this.selectedPiece) {
            // If we already have a selected piece, this click is for the destination
            const gridX = Math.round(intersectPoint.x);
            const gridZ = Math.round(intersectPoint.z);
            
            // Check if the destination is within the board bounds
            if (gridX >= -3.5 && gridX <= 3.5 && gridZ >= -3.5 && gridZ <= 3.5) {
                this.chessBoard.movePiece(
                    this.selectedPiece,
                    new THREE.Vector3(gridX, this.selectedPiece.position.y, gridZ)
                );
                
                // Switch players
                this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
                
                // Update camera for current player if in player view
                if (this.cameraManager.currentMode === 'player') {
                    this.cameraManager.setPlayerView(this.currentPlayer);
                }
            } else {
                // Return to original position if clicked outside board
                this.chessBoard.movePiece(
                    this.selectedPiece,
                    this.selectedPiece.userData.originalPosition
                );
            }
            
            // Clear selection
            this.selectedPiece = null;
            this.lighting.playerSpotlight.visible = false;
            
        } else if (pieceIntersects.length > 0) {
            // This is the first click - selecting a piece
            const piece = pieceIntersects[0].object;
            if (piece.userData.color === this.currentPlayer) {
                this.selectedPiece = piece;
                this.lighting.setSpotlight(piece.position);
                this.chessBoard.highlightPiece(piece);
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        TWEEN.update();
        this.cameraManager.update();
        this.renderer.render(this.scene, this.cameraManager.camera);
    }
}

// Start the application
window.addEventListener('load', () => {
    new ChessApp();
});
