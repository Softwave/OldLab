/* 
 * PROGRAM NAME
 * -------------------
 * PROGRAM DESCRIPTION
 *
 *
 * PROGRAM LICENSE
 */

var camera, scene, renderer, container;

var stats;
var controls;
var clock;

var controlsEnabled = true;
var statsEnabled = true;

var mesh;

//GUI
var guiParams = {
    rotateX: 0.005,
    rotateY: 0.005, 
    rotateZ: 0.005
};
var gui = new dat.GUI();
gui.add(guiParams, 'rotateX', 0.0, 0.1).name('rotX');
gui.add(guiParams, 'rotateY', 0.0, 0.1).name('rotY');
gui.add(guiParams, 'rotateZ', 0.0, 0.1).name('rotZ');
gui.close();

document.addEventListener("DOMContentLoaded", startApp, false);

function startApp() {
    init();
    animate();
}

function init() {
    //Setup Container
    container = document.getElementById('container');
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    //Scene
    scene = new THREE.Scene();

    //Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 80;

    //Stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);
    document.body.appendChild(renderer.domElement);

    //Controls
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 0.4;
    controls.noZoom = false; 
    controls.noPan = false;
    controls.staticMoving = false;
    controls.minDistance = 10;
    controls.maxDistance = 4000;
    controls.dynamicDampingFactor = 0.2; 

    //Lights
    var ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

    //Geometry and material
    var geometry = new THREE.BoxGeometry(10, 10, 10);
    var material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        shading: THREE.FlatShading,
        wireframe: true
    });

    //Add the mesh 
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    //Window resize
    window.addEventListener('resize', onWindowResize, false);
}

function animate() {
    requestAnimationFrame(animate);

    mesh.rotation.x += guiParams.rotateX;
    mesh.rotation.y += guiParams.rotateY;
    mesh.rotation.z += guiParams.rotateZ;

    if (controlsEnabled) {
        controls.update();
    }

    if (statsEnabled) {
        stats.update();
    }

    render();
}

function render() {
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
