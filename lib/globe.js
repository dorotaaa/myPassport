import * as THREE from 'three';
import $ from 'jquery';
import drawThreeGeo from './geo';
import GlobeControls from './controls';

export default function globe() {

// const container = document.querySelector('#container');

const renderer = new THREE.WebGLRenderer();
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
renderer.setSize(WIDTH, HEIGHT);


const VIEW_ANGLE = 45;
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
// scene.add(camera);

document.body.appendChild(renderer.domElement);

const RADIUS = 200;
const SEGMENTS = 100;
const RINGS = 100;

const planet = new THREE.Object3D();
let sphere = new THREE.SphereGeometry(RADIUS, SEGMENTS, RINGS);
let material = new THREE.MeshBasicMaterial({ 
    color: 0x333333,
    wireframe: true,
    transparent: true
});
let mesh = new THREE.Mesh(sphere, material);

planet.add(mesh);

$.getJSON("../data/countries.json", function (data) {
    drawThreeGeo(data, 200, 'sphere', {
        color: 0x80FF80
    }, planet);
});

scene.add(planet)

planet.rotation.y = Math.PI;


// planet.position.z = -500;
// const loader = new THREE.TextureLoader();
// loader.load('earth.png', function (texture) {


//     let sphere = new THREE.SphereGeometry(RADIUS, SEGMENTS, RINGS);

//     let material = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 });

//     let mesh = new THREE.Mesh(sphere, material);

//     globe.add(mesh);
// });

// globe.position.z = -500;


const pointLight =
    new THREE.PointLight(0xFFFFFF, 1);
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 400;
scene.add(pointLight);



const light = new THREE.AmbientLight(0xffffff, 5000); // soft white light
scene.add(light);

    // let controls = new GlobeControls(camera);
    // function render() {
    //     controls.update();
    //     requestAnimationFrame(render);
    //     renderer.render(scene, camera);
    // }
    // render();



function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render()


// function update() {

//     renderer.render(scene, camera);
//     requestAnimationFrame(update);
// }


// requestAnimationFrame(update);


// function animationBuilder(direction) {
//     return function animateRotate() {

//         switch (direction) {
//             case 'up':
//                 planet.rotation.x -= 0.2;
//                 break;
//             case 'down':
//                 planet.rotation.x += 0.2;
//                 break;
//             case 'left':
//                 planet.rotation.y -= 0.2;
//                 break;
//             case 'right':
//                 planet.rotation.y += 0.2;
//                 break;
//             default:
//                 break;
//         }
//     }
// }


// var animateDirection = {
//     up: animationBuilder('up'),
//     down: animationBuilder('down'),
//     left: animationBuilder('left'),
//     right: animationBuilder('right')
// }


// function checkKey(e) {

//     e = e || window.event;

//     e.preventDefault();

//     if (e.keyCode == '38') {
//         animateDirection.up();
//     }
//     else if (e.keyCode == '40') {
//         animateDirection.down();
//     }
//     else if (e.keyCode == '37') {
//         animateDirection.left();
//     }
//     else if (e.keyCode == '39') {
//         animateDirection.right();
//     }
// }

// document.onkeydown = checkKey;





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
}