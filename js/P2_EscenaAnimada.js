/**
 * EscenaAnimada.js
 * 
 * Practica AGM #2. Escena basica con interfaz y animacion
 * Se trata de añadir un interfaz de usuario que permita 
 * disparar animaciones sobre los objetos de la escena con Tween
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
let pentagonoObj;
let knot,cubo,esfera,cono,capsula;
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
loadGUI();
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
    /*******************
    * TO DO: Añadir manejador de camara (OrbitControls)
    *******************/
    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,1,0);
    camera.lookAt( new THREE.Vector3(0,1,0) );

    // Eventos
    //renderer.domElement.addEventListener('dblclick', animate );
}

function loadScene()
{
    const material = new THREE.MeshNormalMaterial( {wireframe:false} );

    /*******************
    * TO DO: Misma escena que en la practica anterior
    *******************/
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

    // Plano XZ
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(10,10, 10,10), material );
    scene.add(suelo);
    suelo.rotation.x = -Math.PI / 2;

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


    //Añadir a la escena un modelo importado en el centro del pentagono

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
    //Añadir a la escena unos ejes
    scene.add( new THREE.AxesHelper(3) );
    cubo.add( new THREE.AxesHelper(3) );
    esfera.add( new THREE.AxesHelper(3) );
    cono.add( new THREE.AxesHelper(3) );
    knot.add( new THREE.AxesHelper(3) );
    capsula.add( new THREE.AxesHelper(3) );

}

function loadGUI()
{
    // Interfaz de usuario
    /*******************
    * TO DO: Crear la interfaz de usuario con la libreria lil-gui.js
    * - Funcion de disparo de animaciones. Las animaciones deben ir
    *   encadenadas
    * - Slider de control de radio del pentagono
    * - Checkbox para alambrico/solido
    *******************/
    // Definicion de los controles
    effectController = {
        mensaje: 'Pentagono Animado',
        radiopentagono: 3,
        wireframe: false,
        animationStart: function() {
            // Reset rotations first
            pentagonoObj.rotation.z = 0;
            [cubo, esfera, cono, knot, capsula].forEach(obj => {
                obj.rotation.y = 0;
            });

            // Animación del pentágono completo
            new TWEEN.Tween(pentagonoObj.rotation)
                .to({ z: Math.PI * 2 }, 2000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(() => {
                    // Reset pentagon rotation
                    pentagonoObj.rotation.z = 0;

                    // Animación de rotación individual de cada objeto
                    const rotationTweens = [cubo, esfera, cono, knot, capsula].map(obj => 
                        new TWEEN.Tween(obj.rotation)
                            .to({ y: Math.PI * 2 }, 1500)
                            .easing(TWEEN.Easing.Cubic.InOut)
                            .onComplete(() => {
                                // Reset individual object rotation
                                obj.rotation.y = 0;
                            })
                    );
                    
                    // Iniciar todas las rotaciones individuales
                    rotationTweens.forEach(tween => tween.start());
                })
                .start();
        }
    };

    // Creacion interfaz
    const gui = new GUI();

    // Construccion del menu
    const h = gui.addFolder("Control Pentagono");
    h.add(effectController, "mensaje").name("Aplicacion");
    h.add(effectController, "radiopentagono", 1, 5, 0.1)
        .name("Radio Pentagono")
        .onChange((value) => {
            r = value;
            // Actualizar posiciones
            xObj1 = r * Math.cos(2 * Math.PI * 1 / 5);
            yObj1 = r * Math.sin(2 * Math.PI * 1 / 5);
            xObj2 = r * Math.cos(2 * Math.PI * 2 / 5);
            yObj2 = r * Math.sin(2 * Math.PI * 2 / 5);
            xObj3 = r * Math.cos(2 * Math.PI * 3 / 5);
            yObj3 = r * Math.sin(2 * Math.PI * 3 / 5);
            xObj4 = r * Math.cos(2 * Math.PI * 4 / 5);
            yObj4 = r * Math.sin(2 * Math.PI * 4 / 5);
            xObj5 = r * Math.cos(2 * Math.PI * 5 / 5);
            yObj5 = r * Math.sin(2 * Math.PI * 5 / 5);

            // Actualizar objetos
            cubo.position.set(xObj1, yObj1, 0);
            esfera.position.set(xObj2, yObj2, 0);
            cono.position.set(xObj3, yObj3, 0);
            knot.position.set(xObj4, yObj4, 0);
            capsula.position.set(xObj5, yObj5, 0);
        });
    
    h.add(effectController, "wireframe")
        .name("Wireframe")
        .onChange((value) => {
            cubo.material.wireframe = value;
            esfera.material.wireframe = value;
            cono.material.wireframe = value;
            knot.material.wireframe = value;
            capsula.material.wireframe = value;
        });
    
    h.add(effectController, "animationStart").name("Animar");
}

function update(delta)
{
    /*******************
    * TO DO: Actualizar tween
    *******************/
    TWEEN.update();
}

function render(delta)
{
    requestAnimationFrame( render );
    update(delta);
    renderer.render( scene, camera );
}
