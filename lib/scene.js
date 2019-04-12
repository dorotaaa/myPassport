import * as THREE from 'three';
import * as d3 from 'd3';

const container = document.querySelector('#container');
export const canvas = d3.select('#container').append('canvas')
 const WIDTH = window.innerWidth;
 const HEIGHT = window.innerHeight;

canvas.node().getContext("webgl");

export const renderer = new THREE.WebGLRenderer({ canvas: canvas.node(), antialias: true });
renderer.setSize(WIDTH, HEIGHT);
container.appendChild(renderer.domElement);

const VIEW_ANGLE = 45;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 10000;

export const camera =
    new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR
    );
camera.position.set(0, 0, 500);

export const scene = new THREE.Scene();

export const light = new THREE.AmbientLight(0xffffff, 5000); // soft white light
scene.add(light);

