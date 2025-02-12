/**
 * Escena.js
 * 
 * Practica AGM #1. Escena basica en three.js
 * Seis objetos organizados en un grafo de escena con
 * transformaciones, animacion basica y modelos importados
 * 
 * @author 
 * Zhen Feng
 */

// Modulos necesarios
/*******************
 * TO DO: Cargar los modulos necesarios
 *******************/
import * as THREE from "../lib/three.module.js";

// Variables de consenso
let renderer, scene, camera;

// Otras globales
/*******************
 * TO DO: Variables globales de la aplicacion
 *******************/
let pentagonoObj;
let knot;
let cubo;
let esfera;
let cono;
let capsula;
let angulo = 0;
let anguloPropio = 0;
let r = 3;
let xObj1 = r * Math.cos(2 * Math.PI * 1 / 5);
let yObj1 = r * Math.sin(2 * Math.PI * 1 / 5);
let xObj2 = r * Math.cos(2 * Math.PI * 2 / 5);
let yObj2 = r * Math.sin(2 * Math.PI * 2 / 5);
let xObj3 = r * Math.cos(2 * Math.PI * 3 / 5);
let yObj3 = r * Math.sin(2 * Math.PI * 3 / 5);
let xObj4 = r * Math.cos(2 * Math.PI * 4 / 5);
let yObj4 = r * Math.sin(2 * Math.PI * 4 / 5);
let xObj5 = r * Math.cos(2 * Math.PI * 5 / 5);
let yObj5 = r * Math.sin(2 * Math.PI * 5 / 5);
// Acciones
init();
loadScene();
render();

function init()
{
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    /*******************
    * TO DO: Completar el motor de render y el canvas
    *******************/
    document.getElementById('container').appendChild( renderer.domElement );
    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5,0.5,0.5);
    // Camara
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1,1000);
    camera.position.set( 0.5, 2, 7 );
    camera.lookAt( new THREE.Vector3(0,1,0) );
}

function loadScene()
{
    // var chessboard = new THREE.TextureLoader().load( 'images/chess.png' );
    // var materialSuelo = new THREE.MeshLambertMaterial( { vertexColors: true, map: chessboard, side: THREE.DoubleSide } );
    const material = new THREE.MeshNormalMaterial( {} );
    const geoCubo = new THREE.BoxGeometry( 2,2,2 );
    const geoEsfera = new THREE.SphereGeometry( 1, 20,20 );
    const geoCono = new THREE.ConeGeometry();
    const geoKnot = new THREE.TorusKnotGeometry();
    const geoCapsula = new THREE.CapsuleGeometry();
    cubo = new THREE.Mesh( geoCubo, material );
    esfera = new THREE.Mesh( geoEsfera, material );
    cono = new THREE.Mesh( geoCono, material );
    knot = new THREE.Mesh( geoKnot, material );
    capsula = new THREE.Mesh ( geoCapsula, material );
    /*******************
    * TO DO: Construir un suelo en el plano XZ
    *******************/
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(10,10, 10,10), material );
    scene.add(suelo);
    suelo.rotation.x = -Math.PI / 2;
    
    /*******************
    * TO DO: Construir una escena con 5 figuras diferentes posicionadas
    * en los cinco vertices de un pentagono regular alredor del origen
    *******************/
    pentagonoObj = new THREE.Object3D();
    const loader = new THREE.ObjectLoader();



    cubo.position.x = xObj1;
    cubo.position.y = yObj1;
    
    esfera.position.x = xObj2;
    esfera.position.y = yObj2;

    cono.position.x = xObj3;
    cono.position.y = yObj3;

    knot.position.x = xObj4;
    knot.position.y = yObj4;

    capsula.position.x = xObj5;
    capsula.position.y = yObj5;

    scene.add(pentagonoObj);

    pentagonoObj.add(cubo);
    pentagonoObj.add(esfera);
    pentagonoObj.add(cono);
    pentagonoObj.add(knot);
    pentagonoObj.add(capsula);


    /*******************
    * TO DO: Añadir a la escena un modelo importado en el centro del pentagono
    *******************/
    loader.load( 'models/soldado/soldado.json', 
        function(objeto){
            pentagonoObj.add(objeto);
            objeto.position.x = 0;
            objeto.position.y = 0;
            objeto.rotation.x = Math.PI / 2;
        }
    )

    pentagonoObj.rotation.x = -Math.PI / 2;
    pentagonoObj.position.y = 2;
    /*******************
    * TO DO: Añadir a la escena unos ejes
    *******************/
    scene.add( new THREE.AxesHelper(3) );
    cubo.add( new THREE.AxesHelper(3) );
    esfera.add( new THREE.AxesHelper(3) );
    cono.add( new THREE.AxesHelper(3) );
    knot.add( new THREE.AxesHelper(3) );
    capsula.add( new THREE.AxesHelper(3) );
}

function update()
{
    /*******************
    * TO DO: Modificar el angulo de giro de cada objeto sobre si mismo
    * y del conjunto pentagonal sobre el objeto importado
    *******************/
    angulo += 0.01;
    anguloPropio -= 0.01;
    pentagonoObj.rotation.z = angulo;

    cubo.rotation.x = anguloPropio;
    esfera.rotation.x = anguloPropio;
    cono.rotation.x = anguloPropio;
    knot.rotation.x = anguloPropio;
    capsula.rotation.x = anguloPropio;
    cubo.rotation.z = anguloPropio;
    esfera.rotation.z = anguloPropio;
    cono.rotation.z = anguloPropio;
    knot.rotation.z = anguloPropio;
    capsula.rotation.z = anguloPropio;
}

function render()
{
    requestAnimationFrame( render );
    update();
    renderer.render( scene, camera );
}