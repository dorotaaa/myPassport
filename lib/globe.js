const THREE = require('three');

export default function globe() {

const container = document.querySelector('#container');

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
scene.add(camera);

container.appendChild(renderer.domElement);

const RADIUS = 200;
const SEGMENTS = 200;
const RINGS = 100;

const globe = new THREE.Group();
scene.add(globe);

const loader = new THREE.TextureLoader();
loader.load('earth.png', function (texture) {


    let sphere = new THREE.SphereGeometry(RADIUS, SEGMENTS, RINGS);

    let material = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 });

    let mesh = new THREE.Mesh(sphere, material);

    globe.add(mesh);
});

globe.position.z = -500;


// const pointLight =
//     new THREE.PointLight(0xFFFFFF, 1);
// pointLight.position.x = 10;
// pointLight.position.y = 50;
// pointLight.position.z = 400;
// scene.add(pointLight);



const light = new THREE.AmbientLight(0xffffff, 5000); // soft white light
scene.add(light);

// let halo = new THREE.Mesh(sphere, material);
// halo.scale.set(1.2, 1.2, 1.2);
// scene.add(halo);


function update() {

    renderer.render(scene, camera);
    requestAnimationFrame(update);
}


requestAnimationFrame(update);


function animationBuilder(direction) {
    return function animateRotate() {

        switch (direction) {
            case 'up':
                globe.rotation.x -= 0.2;
                break;
            case 'down':
                globe.rotation.x += 0.2;
                break;
            case 'left':
                globe.rotation.y -= 0.2;
                break;
            case 'right':
                globe.rotation.y += 0.2;
                break;
            default:
                break;
        }
    }
}


var animateDirection = {
    up: animationBuilder('up'),
    down: animationBuilder('down'),
    left: animationBuilder('left'),
    right: animationBuilder('right')
}


function checkKey(e) {

    e = e || window.event;

    e.preventDefault();

    if (e.keyCode == '38') {
        animateDirection.up();
    }
    else if (e.keyCode == '40') {
        animateDirection.down();
    }
    else if (e.keyCode == '37') {
        animateDirection.left();
    }
    else if (e.keyCode == '39') {
        animateDirection.right();
    }
}

document.onkeydown = checkKey;



// var lastMove = [window.innerWidth / 2, window.innerHeight / 2];


// function rotateOnMouseMove(e) {
//     e = e || window.event;


//     const moveX = (e.clientX - lastMove[0]);
//     const moveY = (e.clientY - lastMove[1]);


//     globe.rotation.y += (moveX * .005);
//     globe.rotation.x += (moveY * .005);


//     lastMove[0] = e.clientX;
//     lastMove[1] = e.clientY;
// }

// document.addEventListener('mousemove', rotateOnMouseMove);
}