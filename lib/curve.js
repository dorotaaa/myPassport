import * as THREE from 'three';
import { getSplineFromCoords } from './utils';


export default function Curve(coords, material) {
    const { spline } = getSplineFromCoords(coords);

    // add curve geometry
    const curveGeometry = new THREE.BufferGeometry();
    const points = new Float32Array(32 * 3);
    const vertices = spline.getPoints(32 - 1);

    for (let i = 0, j = 0; i < vertices.length; i++) {
        const vertex = vertices[i];
        points[j++] = vertex.x;
        points[j++] = vertex.y;
        points[j++] = vertex.z;
    }

    curveGeometry.addAttribute('position', new THREE.BufferAttribute(points, 3));
    curveGeometry.setDrawRange(0, 32);

    this.mesh = new THREE.Line(curveGeometry, material);
}