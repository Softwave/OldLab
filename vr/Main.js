/* 
 * VR Test
 * -------------------
 * Simple Google Cardboard test
 *
 *
 * MIT
 * -------------------
 * Used MIT licensed example code from the three.js examples
 */

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var camera, scene, renderer;
var clock = new THREE.Clock();

var container, stats;
var effect;
var controls;

var light;

var mesh;
var plane;

var vector;

var isFullScreen = false;
var mouseDown = false;

//
var dae;
var loader = new THREE.ColladaLoader();
loader.load('assets/ground.dae', function(collada) {
    dae = collada.scene;
    dae.scale.x = dae.scale.y = dae.scale.z = 100;
    dae.updateMatrix();
    startApp();
});

//
var sky, sunSphere;
var uniforms;
uniforms = {
    luminance:   { type: "f", value: 1 },
    turbidity:   { type: "f", value: 2 },
    reileigh:    { type: "f", value: 1 },
    mieCoefficient:  { type: "f", value: 0.005 },
    mieDirectionalG: { type: "f", value: 0.8 },
    sunPosition:     { type: "v3", value: new THREE.Vector3() }
};

var textureLoader = new THREE.TextureLoader();

var statsEnabled = true;
var controlsEnabled = true;

//document.addEventListener("DOMContentLoaded", startApp, false);

function startApp() {
    init();
    animate();
}

function init() {
    // Container
    container = document.getElementById('container');

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x202020);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000000);
    //camera.position.z = 80;
    camera.position.y = 10;

    // Controls
    controls = new THREE.MouseControls(camera);

    function setOrientationControls(e) {
        if (!e.alpha) {
            return;
        }

        controls = new THREE.DeviceOrientationControls(camera, true);
        controls.connect();
        controls.update();

        container.addEventListener('click', fullscreen, false);
        window.removeEventListener('deviceorientation',
            setOrientationControls, true);
    }
    window.addEventListener('deviceorientation', setOrientationControls, true);
    //

    // Scene 
    scene = new THREE.Scene();
    scene.add(camera);

    // Effect
    effect = new THREE.CardboardEffect(renderer);

    // Lights
    var ambientLight = new THREE.AmbientLight(0x444444);
    scene.add(ambientLight);
    light = new THREE.HemisphereLight(0x777777, 0x000000, 0.6);
    scene.add(light);

    scene.add(dae);

    initSky();
    //controls.addEventListener( 'change', render );

    // Listeners
    window.addEventListener('resize', resize, false);
    setTimeout(resize, 1);
}

function animate() {
    requestAnimationFrame(animate);

    update(clock.getDelta());
    render(clock.getDelta());
}

function update(dt) {
    resize();
    var delta = dt;

    if (mouseDown) {
    vector = new THREE.Vector3( 0, 0, - 1 );
    vector.applyQuaternion( camera.quaternion );
    vector.x = vector.x * 100;
    vector.z = vector.z * 100;
    camera.position.add(vector);
    }

    controls.update(dt);
}

function render(dt) {
    effect.render(scene, camera);
}



function resize(event) {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;

    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    effect.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();
}

    function fullscreen() {
        if (!isFullScreen) {
            if (container.requestFullscreen) {
              container.requestFullscreen();
            } else if (container.msRequestFullscreen) {
              container.msRequestFullscreen();
            } else if (container.mozRequestFullScreen) {
              container.mozRequestFullScreen();
            } else if (container.webkitRequestFullscreen) {
              container.webkitRequestFullscreen();
            }
            isFullScreen = true;
        }



      //alert("test");
    }


function initSky() {

    // Add Sky Mesh
    sky = new THREE.Sky();
    scene.add( sky.mesh );

    // Add Sun Helper
    sunSphere = new THREE.Mesh(
        new THREE.SphereBufferGeometry( 20000, 16, 8 ),
        new THREE.MeshBasicMaterial( { color: 0xffffff } )
    );
    sunSphere.position.y = - 700000;
    sunSphere.visible = false;
    scene.add( sunSphere );

    /// GUI

    var effectController  = {
        turbidity: 10,
        reileigh: 2,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.8,
        luminance: 1,
        inclination: 0.44, // elevation / inclination
        azimuth: 0.25, // Facing front,
        sun: ! true
    };

    var distance = 400000;

    function setSky() {
        uniforms = sky.uniforms;
        uniforms.turbidity.value = effectController.turbidity;
        uniforms.reileigh.value = effectController.reileigh;
        uniforms.luminance.value = effectController.luminance;
        uniforms.mieCoefficient.value = effectController.mieCoefficient;
        uniforms.mieDirectionalG.value = effectController.mieDirectionalG;

        var theta = Math.PI * ( effectController.inclination - 0.5 );
        var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

        sunSphere.position.x = distance * Math.cos( phi );
        sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
        sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );

        light.position.x = distance * Math.cos( phi );
        light.position.y = distance * Math.sin( phi ) * Math.sin( theta );
        light.position.z = distance * Math.sin( phi ) * Math.cos( theta );

        sunSphere.visible = effectController.sun;

        sky.uniforms.sunPosition.value.copy( sunSphere.position );

        renderer.render( scene, camera );
    }

    function guiChanged() {

        uniforms = sky.uniforms;
        uniforms.turbidity.value = effectController.turbidity;
        uniforms.reileigh.value = effectController.reileigh;
        uniforms.luminance.value = effectController.luminance;
        uniforms.mieCoefficient.value = effectController.mieCoefficient;
        uniforms.mieDirectionalG.value = effectController.mieDirectionalG;

        var theta = Math.PI * ( effectController.inclination - 0.5 );
        var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

        sunSphere.position.x = distance * Math.cos( phi );
        sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
        sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );

        sunSphere.visible = effectController.sun;

        sky.uniforms.sunPosition.value.copy( sunSphere.position );

        renderer.render( scene, camera );

    }

    setSky();

}


document.body.onmousedown = function() { 
    mouseDown = !mouseDown;
    //alert("test");
}
document.body.onmouseup = function() {
    //mouseDown = 0;
}
