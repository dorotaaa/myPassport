import * as THREE from 'three';
import * as d3 from 'd3';

let projection = d3.geoEquirectangular()
    .translate([1024, 512])
    .scale(325);

export function mapTexture(geojson, color) {
    let loader, context, canvas;

    canvas = d3.select("container").append("canvas")
        .style("display", "none")
        .attr("width", "2048px")
        .attr("height", "1024px");

    context = canvas.node().getContext("2d");

    let path = d3.path()
        .projection(projection)
        .context(context);

    context.strokeStyle = "#333";
    context.lineWidth = 1;
    context.fillStyle = color || "#CDB380";

    context.beginPath();

    path(geojson);

    if (color) {
        context.fill();
}
    context.stroke();

    // DEBUGGING - Really expensive, disable when done.
    // console.log(canvas.node().toDataURL());

    loader = new THREE.Texture(canvas.node());
    loader.load('earth.png', function (texture) {


        // let sphere = new THREE.SphereGeometry(RADIUS, SEGMENTS, RINGS);

        // let material = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 });

        // let mesh = new THREE.Mesh(sphere, material);
    });

    loader.needsUpdate = true;

    canvas.remove();

    return loader;
}