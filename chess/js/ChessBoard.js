class ChessBoard {
    constructor(scene, materials) {
        this.scene = scene;
        this.materials = materials;
        this.squares = [];
        this.pieces = [];
        this.selectedSquare = null;
        
        this.createBoard();
        this.createPieces();
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

    createPieces() {
        const pieceDefinitions = {
            pawn: {
                geometry: new THREE.CylinderGeometry(0.2, 0.2, 0.6, 16),
                height: 0.3
            },
            rook: {
                geometry: new THREE.BoxGeometry(0.3, 0.8, 0.3),
                height: 0.4
            },
            knight: {
                geometry: this.createKnightGeometry(),
                height: 0.4
            },
            bishop: {
                geometry: new THREE.ConeGeometry(0.2, 0.8, 16),
                height: 0.4
            },
            queen: {
                geometry: new THREE.SphereGeometry(0.25, 16, 16),
                height: 0.4
            },
            king: {
                geometry: this.createKingGeometry(),
                height: 0.4
            }
        };

        const initialPositions = [
            ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
            Array(8).fill('pawn')
        ];

        // Create pieces for both colors
        ['white', 'black'].forEach((color, colorIndex) => {
            initialPositions.forEach((row, rowIndex) => {
                const z = color === 'white' ? rowIndex : 7 - rowIndex;
                row.forEach((type, x) => {
                    const piece = this.createPiece(
                        pieceDefinitions[type],
                        color,
                        new THREE.Vector3(x - 3.5, pieceDefinitions[type].height, z - 3.5)
                    );
                    this.pieces.push(piece);
                });
            });
        });
    }

    createKnightGeometry() {
        const points = [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(0.2, 0),
            new THREE.Vector2(0.2, 0.4),
            new THREE.Vector2(0.1, 0.6),
            new THREE.Vector2(0.3, 0.8),
            new THREE.Vector2(0.1, 0.8),
            new THREE.Vector2(0, 0.6)
        ];
        return new THREE.LatheGeometry(points, 16);
    }

    createKingGeometry() {
        const points = [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(0.25, 0),
            new THREE.Vector2(0.25, 0.6),
            new THREE.Vector2(0.2, 0.7),
            new THREE.Vector2(0.3, 0.8),
            new THREE.Vector2(0.2, 0.9),
            new THREE.Vector2(0.2, 1.0),
            new THREE.Vector2(0, 1.0)
        ];
        return new THREE.LatheGeometry(points, 16);
    }

    createPiece(definition, color, position) {
        const piece = new THREE.Mesh(
            definition.geometry,
            this.materials.getMaterial('wood', 'pieces', color)
        );
        
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
