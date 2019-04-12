// const THREE = require('three');
// const d3 = require('d3');
// import globe from './globe';
// import World from './world';


// document.addEventListener('DOMContentLoaded', () => {
//     const scene = new THREE.Scene();
//     const container = document.querySelector('#container');

//     const width = window.innerWidth;
//     const height = window.innerHeight;
//     const globeRadius = 180;

//     const earth = new World(scene, container, globeRadius, height, width);
//     earth.animate();

// });

import { scene, camera, renderer } from './scene';
import { setEvents } from './setEvents';
import { convertToXYZ, getEventCenter, geodecoder } from './countryGeo';
import { mapTexture } from './texture';
import { getTween, memoize } from './utils';
import { feature as topojsonFeature } from 'topojson';
import * as THREE from 'three';
import * as d3 from 'd3';

d3.json('../data/world.json', function (err, data) {

    d3.select("#loading").transition().duration(500)
        .style("opacity", 0).remove();

    let currentCountry, overlay;

    const RADIUS = 200;
    const SEGMENTS = 200;
    const RINGS = 100;

    // Setup cache for country textures
    var countries = topojsonFeature(data, data.objects.countries);
    var geo = geodecoder(countries.features);

    var textureCache = memoize(function (cntryID, color) {
        var country = geo.find(cntryID);
        return mapTexture(country, color);
    });

    // Base globe with blue "water"
    let blackMaterial = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 });
    let sphere = new THREE.SphereGeometry(RADIUS, SEGMENTS, RINGS);
    let baseGlobe = new THREE.Mesh(sphere, blackMaterial);
    baseGlobe.rotation.y = Math.PI;
    baseGlobe.addEventListener('click', onGlobeClick);
    baseGlobe.addEventListener('mousemove', onGlobeMousemove);

    // add base map layer with all countries
    let worldTexture = mapTexture(countries, '#647089');
    let mapMaterial = new THREE.MeshPhongMaterial({ map: worldTexture, transparent: true });
    var baseMap = new THREE.Mesh(new THREE.SphereGeometry(RADIUS, SEGMENTS, RINGS), mapMaterial);
    baseMap.rotation.y = Math.PI;

    // create a container node and add the two meshes
    var root = new THREE.Object3D();
    root.scale.set(2.5, 2.5, 2.5);
    root.add(baseGlobe);
    root.add(baseMap);
    scene.add(root);

    function onGlobeClick(event) {

        // Get pointc, convert to latitude/longitude
        var latlng = getEventCenter.call(this, event);

        // Get new camera position
        var temp = new THREE.Mesh();
        temp.position.copy(convertToXYZ(latlng, 900));
        temp.lookAt(root.position);
        temp.rotateY(Math.PI);

        for (let key in temp.rotation) {
            if (temp.rotation[key] - camera.rotation[key] > Math.PI) {
                temp.rotation[key] -= Math.PI * 2;
            } else if (camera.rotation[key] - temp.rotation[key] > Math.PI) {
                temp.rotation[key] += Math.PI * 2;
            }
        }

        var tweenPos = getTween.call(camera, 'position', temp.position);
        d3.timer(tweenPos);

        var tweenRot = getTween.call(camera, 'rotation', temp.rotation);
        d3.timer(tweenRot);
    }

    function onGlobeMousemove(event) {
        var map, material;

        // Get pointc, convert to latitude/longitude
        var latlng = getEventCenter.call(this, event);

        // Look for country at that latitude/longitude
        var country = geo.search(latlng[0], latlng[1]);

        if (country !== null && country.code !== currentCountry) {

            // Track the current country displayed
            currentCountry = country.code;

            // Update the html
            d3.select("#msg").html(country.code);

            // Overlay the selected country
            map = textureCache(country.code, '#CDC290');
            material = new THREE.MeshPhongMaterial({ map: map, transparent: true });
            if (!overlay) {
                overlay = new THREE.Mesh(new THREE.SphereGeometry(201, 40, 40), material);
                overlay.rotation.y = Math.PI;
                root.add(overlay);
            } else {
                overlay.material = material;
            }
        }
    }

    setEvents(camera, [baseGlobe], 'click');
    setEvents(camera, [baseGlobe], 'mousemove', 10);
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
