class ChessBoard {
    constructor(scene, materials) {
        this.scene = scene;
        this.materials = materials;
        this.squares = [];
        this.pieces = [];
        this.selectedSquare = null;
        this.pieceModels = {};
        
        // Load the chess pieces model first
        const loader = new THREE.GLTFLoader();
        loader.load('assets/chess_pieces/scene.gltf', (gltf) => {
            console.log('GLTF loaded:', gltf);
            // Clone the scene to avoid modifying the original
            const modelScene = gltf.scene.clone();
            this.pieceModels = this.processPieceModels(modelScene);
            this.createBoard();
            this.createPieces();
        }, 
        // Progress callback
        (xhr) => {
            console.log('Loading model:', (xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // Error callback
        (error) => {
            console.error('Error loading model:', error);
        });
    }

    createBoard() {
        const boardGeometry = new THREE.BoxGeometry(1, 0.1, 1);
        
        for (let x = 0; x < 8; x++) {
            for (let z = 0; z < 8; z++) {
                const isLight = (x + z) % 2 === 0;
                const square = new THREE.Mesh(
                    boardGeometry,
                    this.materials.getMaterial('wood', 'board', isLight ? 'light' : 'dark')
                );
                
                square.position.set(
                    x - 3.5,
                    0,
                    z - 3.5
                );
                
                square.userData.materialInfo = {
                    component: 'board',
                    color: isLight ? 'light' : 'dark'
                };
                
                square.receiveShadow = true;
                this.squares.push(square);
                this.scene.add(square);
            }
        }
    }

    processPieceModels(scene) {
        console.log('Processing scene:', scene);
        
        const models = {
            pawn: null,
            rook: null,
            knight: null,
            bishop: null,
            queen: null,
            king: null
        };

        // Map piece types to their corresponding nodes in the GLTF
        const pieceMapping = {
            pawn: ['Vert004', 'Vert004'],
            rook: ['Vert', 'Vert006'],
            knight: ['Vert002', 'Vert008'],
            bishop: ['Vert003', 'Vert009'],
            queen: ['Vert004', 'Vert010'],
            king: ['Vert005', 'Vert011']
        };

        // Find parent objects that contain the piece meshes
        scene.traverse((node) => {
            if (node.type === 'Object3D' || node.type === 'Group') {
                const name = node.name;
                for (const [pieceType, nodeNames] of Object.entries(pieceMapping)) {
                    if (nodeNames.includes(name) && !models[pieceType]) {
                        console.log('Found piece parent:', name, 'for', pieceType);
                        models[pieceType] = node;
                    }
                }
            }
        });

        return models;
    }

    createPieces() {
        if (!this.pieceModels || Object.keys(this.pieceModels).length === 0) {
            return; // Wait for models to load
        }

        const initialPositions = [
            ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
            Array(8).fill('pawn')
        ];

        const pieceHeights = {
            pawn: 0.3,
            rook: 0.4,
            knight: 0.4,
            bishop: 0.4,
            queen: 0.45,
            king: 0.5
        };

        // Create pieces for both colors
        ['white', 'black'].forEach((color, colorIndex) => {
            initialPositions.forEach((row, rowIndex) => {
                const z = color === 'white' ? rowIndex : 7 - rowIndex;
                row.forEach((type, x) => {
                    const piece = this.createPiece(
                        type,
                        color,
                        new THREE.Vector3(x - 3.5, pieceHeights[type], z - 3.5)
                    );
                    if (piece) this.pieces.push(piece);
                });
            });
        });
    }

    createPiece(type, color, position) {
        const sourceObject = this.pieceModels[type];
        if (!sourceObject) return null;

        // Create a new group to hold the piece
        const piece = new THREE.Group();
        
        // Clone the source object and its children
        const modelClone = sourceObject.clone();
        
        // Create materials for the piece
        const whiteMaterial = new THREE.MeshPhongMaterial({
            color: 0xf0d9b5,
            shininess: 30,
            side: THREE.DoubleSide
        });
        
        const blackMaterial = new THREE.MeshPhongMaterial({
            color: 0x946f51,
            shininess: 30,
            side: THREE.DoubleSide
        });
        
        // Apply materials and shadows to all meshes
        modelClone.traverse((node) => {
            if (node.isMesh) {
                node.material = color === 'white' ? whiteMaterial : blackMaterial;
                node.castShadow = true;
            }
        });
        
        // Add the model to our group
        piece.add(modelClone);
        
        // Set up the piece's transform
        const baseScale = 0.004;
        const scaleMultiplier = {
            pawn: 1,
            rook: 1.2,
            knight: 1.1,
            bishop: 1.2,
            queen: 1.3,
            king: 1.4
        };
        
        // Reset transformations
        piece.position.set(0, 0, 0);
        piece.rotation.set(0, 0, 0);
        piece.scale.set(1, 1, 1);
        
        // Apply transformations in order
        modelClone.rotation.x = -Math.PI / 2;
        modelClone.rotation.y = color === 'black' ? Math.PI : 0;
        
        // Scale and position the group
        const scale = baseScale * scaleMultiplier[type];
        piece.scale.setScalar(scale);
        piece.position.copy(position);
        piece.castShadow = true;
        piece.userData.materialInfo = {
            component: 'pieces',
            color: color
        };
        piece.userData.color = color;
        piece.userData.originalPosition = position.clone();
        
        // Add hover effect
        piece.userData.defaultY = position.y;
        piece.userData.hoverY = position.y + 0.3;
        
        this.scene.add(piece);
        return piece;
    }

    highlightPiece(piece) {
        if (piece) {
            new TWEEN.Tween(piece.position)
                .to({ y: piece.userData.hoverY }, 200)
                .easing(t => t * (2 - t))
                .start();
        }
    }

    unhighlightPiece(piece) {
        if (piece) {
            new TWEEN.Tween(piece.position)
                .to({ y: piece.userData.defaultY }, 200)
                .easing(t => t * (2 - t))
                .start();
        }
    }

    movePiece(piece, targetPosition) {
        // Store the current position
        const startPosition = piece.position.clone();
        
        // Calculate exact grid position
        const gridPosition = new THREE.Vector3(
            Math.round(targetPosition.x),
            piece.userData.defaultY,
            Math.round(targetPosition.z)
        );

        // First move up
        new TWEEN.Tween(piece.position)
            .to({ y: piece.userData.hoverY }, 200)
            .easing(t => t * (2 - t))
            .onComplete(() => {
                // Then move to target
                new TWEEN.Tween(piece.position)
                    .to({
                        x: gridPosition.x,
                        z: gridPosition.z
                    }, 300)
                    .easing(t => t * t * (3 - 2 * t))
                    .onComplete(() => {
                        // Finally move down
                        new TWEEN.Tween(piece.position)
                            .to({ y: gridPosition.y }, 200)
                            .easing(t => t * t)
                            .onComplete(() => {
                                // Update the piece's original position for future moves
                                piece.userData.originalPosition = gridPosition.clone();
                            })
                            .start();
                    })
                    .start();
            })
            .start();

        // Update spotlight to follow the piece
        this.scene.traverse((obj) => {
            if (obj.isSpotLight && obj !== this.boardLight) {
                new TWEEN.Tween(obj.target.position)
                    .to({ x: gridPosition.x, z: gridPosition.z }, 500)
                    .easing(t => t * (2 - t))
                    .start();
            }
        });
    }

    getSquareAtPosition(x, z) {
        return this.squares.find(square => 
            Math.abs(square.position.x - x) < 0.5 &&
            Math.abs(square.position.z - z) < 0.5
        );
    }
}
