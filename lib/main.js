const THREE = require('three');
const container = document.querySelector('#container');

debugger
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
scene.background = new THREE.Color(0x000);
scene.add(camera);

container.appendChild(renderer.domElement);

const RADIUS = 200;
const SEGMENTS = 50;
const RINGS = 50;

const globe = new THREE.Group();
scene.add(globe);

var loader = new THREE.TextureLoader();
debugger
loader.load('earth.png', function (texture) {

    
    var sphere = new THREE.SphereGeometry(RADIUS, SEGMENTS, RINGS);

    
    var material = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 });

    var mesh = new THREE.Mesh(sphere, material);

    
    globe.add(mesh);
});

globe.position.z = -300;


const pointLight =
    new THREE.PointLight(0xFFFFFF);


pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 400;


scene.add(pointLight);


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



var lastMove = [window.innerWidth / 2, window.innerHeight / 2];


function rotateOnMouseMove(e) {
    e = e || window.event;

    
    const moveX = (e.clientX - lastMove[0]);
    const moveY = (e.clientY - lastMove[1]);

   
    globe.rotation.y += (moveX * .005);
    globe.rotation.x += (moveY * .005);

   
    lastMove[0] = e.clientX;
    lastMove[1] = e.clientY;
}

document.addEventListener('mousemove', rotateOnMouseMove);