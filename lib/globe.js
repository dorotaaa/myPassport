import * as THREE from 'three';
import $ from 'jquery';
import drawThreeGeo from './geo';
import countries from './countries';



export default function globe() {

// const container = document.querySelector('#container');

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
renderer.setSize(WIDTH, HEIGHT);


const VIEW_ANGLE = 70;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 10000;
const camera =
    new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR
    );

camera.position.set(0, 0, 500);


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1000);
scene.add(camera);

document.body.appendChild(renderer.domElement);

const RADIUS = 200;
const SEGMENTS = 100;
const RINGS = 100;

const planet = new THREE.Group();
let sphere = new THREE.SphereGeometry(RADIUS, SEGMENTS, RINGS);
let material = new THREE.MeshBasicMaterial({ 
    color: 0X333333,
    wireframe: true,
    transparent: true
});
let mesh = new THREE.Mesh(sphere, material);

planet.add(mesh);

$.getJSON("../data/countries.json", function (data) {
    drawThreeGeo(data, 200, 'sphere', {
        color: 0x80FF80,
    }, planet);

});

scene.add(planet)

// planet.rotation.x = Math.PI;


const light = new THREE.AmbientLight(0xffffff, 5000); // soft white light
scene.add(light);


    // const controls = new THREE.TrackballControls(camera);
    // // Slow down zooming
    // controls.zoomSpeed = 0.1;

function render() {
    requestAnimationFrame(render);
    planet.rotation.z += .005;
    renderer.render(scene, camera);
}

render()


var lastMove = [window.innerWidth / 2, window.innerHeight / 2];
function rotateOnMouseMove(e) {
    e = e || window.event;


    const moveX = (e.clientX - lastMove[0]);
    const moveY = (e.clientY - lastMove[1]);


    planet.rotation.y += (moveX * .005);
    planet.rotation.x += (moveY * .005);


    lastMove[0] = e.clientX;
    lastMove[1] = e.clientY;
}

document.addEventListener('mousemove', rotateOnMouseMove);



function onGlobeClick(e){
    e = e || window.event;
    document.removeEventListener('mousemove', rotateOnMouseMove);
}

document.addEventListener('click', onGlobeClick);

}