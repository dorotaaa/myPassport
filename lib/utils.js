import * as THREE from 'three';
import { geoInterpolate } from 'd3-geo';
import { GLOBE_RADIUS, CURVE_MIN_ALTITUDE, CURVE_MAX_ALTITUDE, DEGREE_TO_RADIAN } from './constants';


export function clamp(num, min, max) {
    return num <= min ? min : (num >= max ? max : num);
}

// export function coordinateToPosition(lat, lng, radius) {
//     const phi = (90 - lat) * DEGREE_TO_RADIAN;
//     const theta = (lng + 180) * DEGREE_TO_RADIAN;

//     return new THREE.Vector3(
//         - radius * Math.sin(phi) * Math.cos(theta),
//         radius * Math.cos(phi),
//         radius * Math.sin(phi) * Math.sin(theta)
//     );
// }


export function coordinateToPosition(lat, lng, radius) {
    const phi = (90 - lat) * DEGREE_TO_RADIAN,
        theta = (lng + -270) * DEGREE_TO_RADIAN,
        position = new THREE.Vector3(0, 0, 0);

    position.x = - radius * Math.sin(phi) * Math.cos(theta);
    position.y = radius * Math.cos(phi);
    position.z = radius * Math.sin(phi) * Math.sin(theta);

    return position;
}


export function getSplineFromCoords(coords) {
    debugger
    const startLat = coords[0];
    const startLng = coords[1];
    const endLat = coords[2];
    const endLng = coords[3];

    // spline vertices
    const start = coordinateToPosition(startLat, startLng, GLOBE_RADIUS);
    const end = coordinateToPosition(endLat, endLng, GLOBE_RADIUS);
    const altitude = clamp(start.distanceTo(end) * .75, CURVE_MIN_ALTITUDE, CURVE_MAX_ALTITUDE);
    const interpolate = geoInterpolate([startLng, startLat], [endLng, endLat]);
    const midCoord1 = interpolate(0.25);
    const midCoord2 = interpolate(0.75);
    const mid1 = coordinateToPosition(midCoord1[1], midCoord1[0], GLOBE_RADIUS + altitude);
    const mid2 = coordinateToPosition(midCoord2[1], midCoord2[0], GLOBE_RADIUS + altitude);

    return {
        start,
        end,
        spline: new THREE.CubicBezierCurve3(start, mid1, mid2, end)
    };
}