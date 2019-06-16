import * as THREE from 'three';
import _ from 'lodash';
import Curve from './curve';
import { CURVE_COLOR } from './constants';
import { scene } from './globe';


export function init(allCoords) {
    
    const material = new THREE.MeshBasicMaterial({
        blending: THREE.AdditiveBlending,
        opacity: 0.6,
        transparent: true,
        color: CURVE_COLOR
    });
    const curveMesh = new THREE.Mesh();

    allCoords.forEach(coords => {
        const curve = new Curve(coords, material);
        curveMesh.add(curve.mesh);
    });

    scene.add(curveMesh);
}