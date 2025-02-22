/**
 * Ajedrez.js
 * 
 * Trabajo AGM #1. Ajedrez 3D con interaccion y animacion
 * Se trata de añadir un interfaz de usuario que permita 
 * cambiar el aspecto del tablero y las piezas, posicion de la camara de distintas vistas y etc
 * 
 * @author 
 * Zhen Feng
 */


// Modulos necesarios
/*******************
 * TO DO: Cargar los modulos necesarios
 *******************/
import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";
// Variables de consenso
let renderer, scene, camera;

// Otras globales
/*******************
 * TO DO: Variables globales de la aplicacion
 *******************/
let cameraControls, effectController;


// Acciones
init();
loadScene();
//loadGUI();
render();

function init()
{
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    /*******************
    * TO DO: Completar el motor de render, el canvas y habilitar
    * el buffer de sombras
    *******************/
    document.getElementById('container').appendChild( renderer.domElement );
    renderer.antialias = true;
    renderer.shadowMap.enabled = true;

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5,0.5,0.5);
    // Camara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(5, 4, 5);
    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    
    // Set some constraints on the controls
    cameraControls.maxPolarAngle = Math.PI/2 - 0.1; // Prevent going below the board
    cameraControls.minDistance = 3;
    cameraControls.maxDistance = 10;

    // Luces
    /*******************
     * TO DO: Añadir luces y habilitar sombras
     * - Una ambiental
     * - Una direccional
     * - Una focal
     *******************/
    // Enhanced lighting setup
    const ambiental = new THREE.AmbientLight(0x808080, 0.6);
    scene.add(ambiental);
    
    const direccional = new THREE.DirectionalLight(0xFFFFFF, 0.7);
    direccional.position.set(4, 6, 4);
    direccional.castShadow = true;
    direccional.shadow.mapSize.width = 2048;
    direccional.shadow.mapSize.height = 2048;
    direccional.shadow.camera.near = 0.1;
    direccional.shadow.camera.far = 20;
    direccional.shadow.camera.left = -5;
    direccional.shadow.camera.right = 5;
    direccional.shadow.camera.top = 5;
    direccional.shadow.camera.bottom = -5;
    scene.add(direccional);
    
    const focal1 = new THREE.SpotLight(0xFFFFFF, 0.3);
    focal1.position.set(-3, 6, -3);
    focal1.target.position.set(0, 0, 0);
    focal1.angle = Math.PI/4;
    focal1.penumbra = 0.3;
    focal1.castShadow = true;
    focal1.shadow.mapSize.width = 1024;
    focal1.shadow.mapSize.height = 1024;
    scene.add(focal1);

    const focal2 = new THREE.SpotLight(0xFFFFFF, 0.2);
    focal2.position.set(3, 6, 3);
    focal2.target.position.set(0, 0, 0);
    focal2.angle = Math.PI/4;
    focal2.penumbra = 0.3;
    focal2.castShadow = true;
    focal2.shadow.mapSize.width = 1024;
    focal2.shadow.mapSize.height = 1024;
    scene.add(focal2);
}

function loadScene()
{
    // Load chessboard texture
    const textureLoader = new THREE.TextureLoader();
    const chessboardTexture = textureLoader.load('images/chessboard.jpg');
    chessboardTexture.wrapS = THREE.RepeatWrapping;
    chessboardTexture.wrapT = THREE.RepeatWrapping;
    
    const floorMaterial = new THREE.MeshStandardMaterial({
        map: chessboardTexture,
        roughness: 0.8,
        metalness: 0.1
    });
    
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), floorMaterial);
    suelo.rotation.x = -Math.PI / 2;
    suelo.receiveShadow = true;
    scene.add(suelo);

    scene.add(new THREE.AxesHelper(3));

    // Enhanced materials for chess pieces
    const whiteMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        metalness: 0.3,
        roughness: 0.4,
        envMapIntensity: 1.0
    });
    
    const blackMaterial = new THREE.MeshStandardMaterial({
        color: 0x202020,
        metalness: 0.3,
        roughness: 0.4,
        envMapIntensity: 1.0
    });

    // Function to get board position
    function getBoardPosition(row, col) {
        const squareSize = 1; // Size of each board square
        const boardOffset = 3.5; // Half the board size (8/2 - 0.5) to center
        return {
            x: (col - boardOffset) * squareSize,
            z: (row - boardOffset) * squareSize
        };
    }

    // Function to create and position a piece
    function createPiece(mesh, material, row, col, pieceType) {
        const piece = mesh.clone();
        
        // Adjust scale based on piece type
        let scale = 0.7;
        piece.scale.set(scale, scale, scale);
        
        const pos = getBoardPosition(row, col);
        // Add a small elevation to prevent z-fighting with the board
        const elevation = 0.01;
        piece.position.set(pos.x, elevation, pos.z);
        piece.rotation.x = -Math.PI / 2;
        // Apply material and shadows
        piece.traverse((child) => {
            if (child.isMesh) {
                child.material = material;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        return piece;
    }

    const loader = new GLTFLoader();
    loader.load('chess/assets/chess_pieces/scene.gltf', function(gltf) {
        // Find individual piece meshes
        let pieceMeshes = {};
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                if (child.name.includes('Vert004')) {
                    pieceMeshes.pawn = child.parent;
                } else if (child.name.includes('Vert005')) {
                    pieceMeshes.rook = child.parent;
                } else if (child.name.includes('Vert003')) {
                    pieceMeshes.knight = child.parent;
                } else if (child.name.includes('Vert002')) {
                    pieceMeshes.bishop = child.parent;
                } else if (child.name.includes('Vert001')) {
                    pieceMeshes.queen = child.parent;
                } else if (child.name.includes('Vert006')) {
                    pieceMeshes.king = child.parent;
                }
            }
        });

        // Create and position white pieces
        const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        
        // White back row
        for (let i = 0; i < 8; i++) {
            const piece = createPiece(pieceMeshes[pieceOrder[i]], whiteMaterial, 7, i, pieceOrder[i]);
            scene.add(piece);
        }

        // White pawns
        for (let i = 0; i < 8; i++) {
            const pawn = createPiece(pieceMeshes.pawn, whiteMaterial, 6, i, 'pawn');
            scene.add(pawn);
        }

        // Black back row
        for (let i = 0; i < 8; i++) {
            const piece = createPiece(pieceMeshes[pieceOrder[i]], blackMaterial, 0, i, pieceOrder[i]);

            scene.add(piece);
        }

        // Black pawns
        for (let i = 0; i < 8; i++) {
            const pawn = createPiece(pieceMeshes.pawn, blackMaterial, 1, i, 'pawn');
            scene.add(pawn);
        }

    }, undefined, function(error) {
        console.error("Failed to load GLTF model:", error);
    });


}

/*function loadGUI()
{
}*/

function update(delta)
{

}

function render(delta)
{
    requestAnimationFrame( render );
    update();
    renderer.render( scene, camera );
}
