/**
 * EscenaIluminada.js
 * 
 * Practica AGM #3. Escena basica con interfaz, animacion e iluminacion
 * Se trata de añadir luces a la escena y diferentes materiales
 * 
 * @author 
 * 
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
let video;

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
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1,1000);
    camera.position.set( 0.5, 2, 7 );
    /*******************
    * TO DO: Añadir manejador de camara (OrbitControls)
    *******************/
    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,1,0);
    camera.lookAt( new THREE.Vector3(0,1,0) );

    // Luces
    /*******************
     * TO DO: Añadir luces y habilitar sombras
     * - Una ambiental
     * - Una direccional
     * - Una focal
     *******************/
    const ambiental = new THREE.AmbientLight(0x222222);
    scene.add(ambiental);
    const direccional = new THREE.DirectionalLight(0xFFFFFF,0.3);
    direccional.position.set(-1,1,-1);
    direccional.castShadow = true;
    scene.add(direccional);
    const focal = new THREE.SpotLight(0xFFFFFF,0.3);
    focal.position.set(-2,7,4);
    focal.target.position.set(0,0,0);
    focal.angle= Math.PI/7;
    focal.penumbra = 0.3;
    focal.castShadow= true;
    focal.shadow.camera.far = 20;
    focal.shadow.camera.fov = 80;
    scene.add(focal);
    scene.add(new THREE.CameraHelper(focal.shadow.camera));
}

function loadScene()
{
    // Texturas
    /*******************
     * TO DO: Cargar texturas
     * - De superposición
     * - De entorno
     *******************/
    const path ="./images/";
    const texcubo = new THREE.TextureLoader().load(path+"wood512.jpg");
    const texsuelo = new THREE.TextureLoader().load(path+"r_256.jpg");
    texsuelo.repeat.set(4,3);
    texsuelo.wrapS= texsuelo.wrapT = THREE.MirroredRepeatWrapping;
    const entorno = [ path+"posx.jpg", path+"negx.jpg",
                      path+"posy.jpg", path+"negy.jpg",
                      path+"posz.jpg", path+"negz.jpg"];
    const texesfera = new THREE.CubeTextureLoader().load(entorno);

    // Materiales
    /*******************
     * TO DO: Crear materiales y aplicar texturas
     * - Uno basado en Lambert
     * - Uno basado en Phong
     * - Uno basado en Basic
     *******************/

    const matLambert = new THREE.MeshLambertMaterial({color:'yellow',map:texcubo});
    const matPhong = new THREE.MeshPhongMaterial({color:'white',
                                                   specular:'gray',
                                                   shininess: 30,
                                                   envMap: texesfera });
    const matBasic = new THREE.MeshBasicMaterial({color:"rgb(150,150,150)",map:texsuelo});
    /*******************
    * TO DO: Misma escena que en la practica anterior
    * cambiando los materiales y activando las sombras
    *******************/
    const geoCubo = new THREE.BoxGeometry( 2,2,2 );
    const geoEsfera = new THREE.SphereGeometry( 1, 20,20 );
    const geoCono = new THREE.ConeGeometry();
    const geoKnot = new THREE.TorusKnotGeometry();
    const geoCapsula = new THREE.CapsuleGeometry();
    cubo = new THREE.Mesh( geoCubo, matPhong );
    esfera = new THREE.Mesh( geoEsfera, matPhong );
    cono = new THREE.Mesh( geoCono, matPhong );
    knot = new THREE.Mesh( geoKnot, matPhong );
    capsula = new THREE.Mesh ( geoCapsula, matPhong );

    cubo.castShadow = cubo.receiveShadow = true;
    esfera.castShadow = esfera.receiveShadow = true;
    cono.castShadow = cono.receiveShadow = true;
    knot.castShadow = knot.receiveShadow = true;
    capsula.castShadow = capsula.receiveShadow = true;

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

    /******************
     * TO DO: Crear una habitacion de entorno
     ******************/
    const paredes = [];
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"posx.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"negx.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"posy.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"negy.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"posz.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"negz.jpg")}) );
    const habitacion = new THREE.Mesh( new THREE.BoxGeometry(40,40,40),paredes);
    scene.add(habitacion);
    /******************
     * TO DO: Asociar una textura de vídeo al suelo
     ******************/
    video = document.createElement('video');
    video.src = "./videos/Pixar.mp4";
    video.load();
    video.muted = true;
    video.play();
    const texvideo = new THREE.VideoTexture(video);
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(10,10, 10,10), new THREE.MeshBasicMaterial({map:texvideo}) );
    suelo.receiveShadow = true;
    scene.add(suelo);
    suelo.rotation.x = -Math.PI / 2;
}

function loadGUI()
{
    // Interfaz de usuario
    effectController = {
        mensaje: 'Pentagono Animado',
        radiopentagono: 3,
        wireframe: false,
        sombras: true,
        colorMaterial: "rgb(255,255,0)",
        mute: true,
        play: function(){video.play();},
        pause: function(){video.pause();},
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
    
    h.add(effectController, "sombras")
        .name("Sombras")
        .onChange((value) => {
            [cubo, esfera, cono, knot, capsula].forEach(obj => {
                obj.castShadow = value;
                obj.receiveShadow = value;
            });
        });

    h.addColor(effectController, "colorMaterial")
        .name("Color Material")
        .onChange((value) => {
            [cubo, esfera, cono, knot, capsula].forEach(obj => {
                obj.material.color.set(value);
            });
        });
    
    h.add(effectController, "animationStart").name("Animar");

    // Control de video
    const videoFolder = gui.addFolder("Control Video");
    videoFolder.add(effectController, "mute")
        .name("Silenciar")
        .onChange((value) => {
            video.muted = value;
        });
    videoFolder.add(effectController, "play").name("Reproducir");
    videoFolder.add(effectController, "pause").name("Pausar");
}

function update(delta)
{
    TWEEN.update();
}

function render(delta)
{
    requestAnimationFrame( render );
    update(delta);
    renderer.render( scene, camera );
}
