/* 
 * HYPERION - Audio Visualizer
 * -------------------
 * Written by J.C. Leyba, s0ftwave.com, 2016
 * Written with three.js and the web audio api
 * Uses GLSL shaders to make an audio-reactive sphere
 * -------------------
 * LICENSE->
 * My code is public domain, libraries and the Audio.js file are copyright of their 
 * respective authors (mostly MIT). Hyperion is my music, do what you want with it.
 *
 * This file is free and unencumbered software released into the public domain.
 *
 * Anyone is free to copy, modify, publish, use, compile, sell, or
 * distribute this software, either in source code form or as a compiled
 * binary, for any purpose, commercial or non-commercial, and by any
 * means.
 * 
 * In jurisdictions that recognize copyright laws, the author or authors
 * of this software dedicate any and all copyright interest in the
 * software to the public domain. We make this dedication for the benefit
 * of the public at large and to the detriment of our heirs and
 * successors. We intend this dedication to be an overt act of
 * relinquishment in perpetuity of all present and future rights to this
 * software under copyright law.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 * 
 * For more information, please refer to <http://unlicense.org/>
 */

var camera, scene, renderer, container;

var stats;
var controls;
var clock;

var controlsEnabled = true;
var statsEnabled = true;

var mesh, uniforms;
var material, shaderMaterial;
var displacement;


//GUI
var guiParams = {
    rotateX: 0.005,
    rotateY: 0.005, 
    rotateZ: 0.005,
    displacement: 1.0,
    amplitude: 1.8,
    wireframe: false
};
var gui = new dat.GUI();
gui.add(guiParams, 'rotateX', 0.0, 0.1).name('rotX');
gui.add(guiParams, 'rotateY', 0.0, 0.1).name('rotY');
gui.add(guiParams, 'rotateZ', 0.0, 0.1).name('rotZ');
gui.add(guiParams, 'displacement', -2.0, 2.0).name('displacement');
gui.add(guiParams, 'amplitude', 0.1, 10.0).name('amplitude');
gui.add(guiParams, 'wireframe');
gui.close();

document.addEventListener("DOMContentLoaded", startApp, false);

function startApp() {
    init();
    animate();
}

function init() {
    //Setup clock
    clock = new THREE.Clock();

    //Audio player
    audioPlayer = new AudioClass();

    //Setup Container
    container = document.getElementById('container');
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    //Scene
    scene = new THREE.Scene();

    //Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
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

    //Uniforms
    uniforms = {
        time: { type: "f", value: 0.0 },
        displacement: { type: "f", value: 1.0 },
        amplitude: { type: "f", value: 1.0 }
    };

    //Geometry and material
    var geometry = new THREE.SphereGeometry(60, 40, 40);
    material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        shading: THREE.FlatShading,
        wireframe: true
    });
    shaderMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader:document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,
        wireframe: false
    });

    //Add the mesh 
    mesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(mesh);

    //Window resize
    window.addEventListener('resize', onWindowResize, false);
}

function animate() {
    requestAnimationFrame(animate);

    mesh.rotation.x += guiParams.rotateX;
    mesh.rotation.y += guiParams.rotateY;
    mesh.rotation.z += guiParams.rotateZ;

    if (guiParams.wireframe) {
        mesh.material.wireframe = true;
    } else {
        mesh.material.wireframe = false;
    }

    if (controlsEnabled) {
        controls.update();
    }

    if (statsEnabled) {
        stats.update();
    }

    render();
}

function render() {
    uniforms.time.value += clock.getDelta() / 10;
    var time = clock.getDelta() / 20;

    var audioData = audioPlayer.getAudioData();
    uniforms.amplitude.value = guiParams.amplitude * Math.sin(mesh.rotation.y * 0.125);
    displacement = audioData[0];
    uniforms.displacement.value = displacement * guiParams.displacement;
    
    mesh.geometry.verticesNeedUpdate = true;

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
