import * as THREE from 'three';
import _ from 'lodash';
import Curve from './curve';


export function init(allCoords) {
    const material = new THREE.MeshBasicMaterial({
        blending: THREE.AdditiveBlending,
        opacity: 0.6,
        transparent: true,
        color: 0xe43c59,
    });
    const curveMesh = new THREE.Mesh();

    allCoords.forEach(coords => {
        const curve = new Curve(coords, material);
        curveMesh.add(curve.mesh);
    });
    const rootMesh = new THREE.Mesh(new THREE.Geometry());
    rootMesh.add(curveMesh);
}