/* 
 * DIASPORA
 * -------------------
 * A simple scene based on the 
 * cover to 'Diaspora' by Greg Egan
 */

var camera, scene, renderer, container, composer;

var stats;
var controls;
var clock;
var stars = [];

var controlsEnabled = true;
var statsEnabled = true;

var mesh;

document.addEventListener("DOMContentLoaded", startApp, false);

function startApp() {
    init();
    animate();
}

function init() {
    //Clock
    clock = new THREE.Clock();

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
    //controls = new THREE.TrackballControls(camera, renderer.domElement);
    //controls.rotateSpeed = 0.4;
    //controls.noZoom = false; 
    //controls.noPan = false;
    //controls.staticMoving = false;
    //controls.minDistance = 10;
    //controls.maxDistance = 4000;
    //controls.dynamicDampingFactor = 0.2; 

    //Lights
    var ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

    //Geometry and material
    var geometry = new THREE.OctahedronGeometry(20, 0);
    var material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        shading: THREE.FlatShading,
        wireframe: true
    });

    //Add the mesh 
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    //Post processing
    composer = new THREE.EffectComposer(renderer);
    var renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    var glitchPass = new THREE.GlitchPass();
    composer.addPass(glitchPass);

    var effectShift = new THREE.ShaderPass(THREE.RGBShiftShader);
    effectShift.uniforms['amount'].value = 0.0015;
    composer.addPass(effectShift);

    var effectVignette = new THREE.ShaderPass(THREE.VignetteShader);
    composer.addPass(effectVignette);
    
    var effectFilm = new THREE.FilmPass(0.2, 0.325, 512, false);
    effectFilm.renderToScreen = true;
    composer.addPass(effectFilm);

    addStar();

    //Window resize
    window.addEventListener('resize', onWindowResize, false);
}

function animate() {
    requestAnimationFrame(animate);

    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.005;

    if (statsEnabled) {
        stats.update();
    }

    render();
}

function render() {
    renderer.render(scene, camera);
    animateStars();
    var delta = clock.getDelta();
    composer.render(delta);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function addStar() {
    for (var i = -1000; i < 1000; i+=20) {
        var geometry = new THREE.SphereGeometry(0.5, 32, 32);
        var material = new THREE.MeshBasicMaterial({color: 0xffffff});
        var sphere = new THREE.Mesh(geometry, material);

        sphere.position.x = Math.random() * 1000 - 500;
        sphere.position.y = Math.random() * 1000 - 500;

        sphere.position.z = i;

        sphere.scale.x = sphere.scale.y = 2;

        scene.add(sphere);
        stars.push(sphere);
    }
}

function animateStars() {
    for (var i = 0; i < stars.length; i++) {
        star = stars[i];
        star.position.z += i / 10;
        if (star.position.z > 1000) {
            star.position.z -= 2000;
        }
    }
}
