import * as THREE from 'three';
import $ from 'jquery';
import Delaunator from 'delaunator';
import OrbitControls from 'three-orbitcontrols';
import { WIDTH, HEIGHT, VIEW_ANGLE, ASPECT, NEAR, FAR } from './constants';
import { passportIdx as passportData } from './routes';


export const scene = new THREE.Scene();

export function init() {
    let TRIANGULATION_DENSITY = 20; // make it smaller for more dense mesh

    function verts2array(coords) {
        let flat = [];
        for (let k = 0; k < coords.length; k++) {
            flat.push(coords[k][0], coords[k][1]);
        }
        return flat;
    }

    function array2verts(arr) {
        let coords = [];
        for (let k = 0; k < arr.length; k += 2) {
            coords.push([arr[k], arr[k + 1]]);
        }
        return coords;
    }

    function findBBox(points) {
        let min = {
            x: 1e99,
            y: 1e99
        };
        let max = {
            x: -1e99,
            y: -1e99
        };
        for (var point_num = 0; point_num < points.length; point_num++) {
            if (points[point_num][0] < min.x) {
                min.x = points[point_num][0];
            }
            if (points[point_num][0] > max.x) {
                max.x = points[point_num][0];
            }
            if (points[point_num][1] < min.y) {
                min.y = points[point_num][1];
            }
            if (points[point_num][1] > max.y) {
                max.y = points[point_num][1];
            }
        }
        return {
            min: min,
            max: max
        };
    }

    function isInside(point, vs) {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

        var x = point[0],
            y = point[1];

        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0],
                yi = vs[i][1];
            var xj = vs[j][0],
                yj = vs[j][1];

            var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    }

    function genInnerVerts(points) {
        let res = [];
        for (let k = 0; k < points.length; k++) {
            res.push(points[k]);
        }

        let bbox = findBBox(points);

        let step = TRIANGULATION_DENSITY;
        let k = 0;
        for (let x = bbox.min.x + step / 2; x < bbox.max.x; x += step) {
            for (let y = bbox.min.y + step / 2; y < bbox.max.y; y += step) {
                let newp = [x, y];
                if (isInside(newp, points)) {
                    res.push(newp);
                }
                k++;
            }
        }

        return res;
    }

    function removeOuterTriangles(delaunator, points) {
        let newTriangles = [];
        for (let k = 0; k < delaunator.triangles.length; k += 3) {
            let t0 = delaunator.triangles[k];
            let t1 = delaunator.triangles[k + 1];
            let t2 = delaunator.triangles[k + 2];

            let x0 = delaunator.coords[2 * t0];
            let y0 = delaunator.coords[2 * t0 + 1];

            let x1 = delaunator.coords[2 * t1];
            let y1 = delaunator.coords[2 * t1 + 1];

            let x2 = delaunator.coords[2 * t2];
            let y2 = delaunator.coords[2 * t2 + 1];

            let midx = (x0 + x1 + x2) / 3;
            let midy = (y0 + y1 + y2) / 3;

            let midp = [midx, midy];

            if (isInside(midp, points)) {
                newTriangles.push(t0, t1, t2);
            }
        }
        delaunator.triangles = newTriangles;
    }

    var x_values = [];
    var y_values = [];
    var z_values = [];

    var progressEl = $("#progress");
    var clickableObjects = [];
    var someColors = [0x000000];
    
    var loader = new THREE.AnimationLoader();
    // drawThreeGeo credit: Jared Dominguez, github:@jdomingu 
    function drawThreeGeo(json, radius, shape, options) {
        
        var json_geom = createGeometryArray(json);
        var json_name = createNameArray(json);
        
        // var json_geom = json_geom_name[0][0];
        var convertCoordinates = getConversionFunctionName(shape);
       
        for (var geom_num = 0; geom_num < json_geom.length; geom_num++) {
            console.log("Processing " + geom_num + " of " + json_geom.length + " shapes");

            if (geom_num === 254) {
                $('.loader').css('visibility', 'hidden')
            }

            if (json_geom[geom_num].type == 'Point') {
                convertCoordinates(json_geom[geom_num].coordinates, radius);
                drawParticle(y_values[0], z_values[0], x_values[0], options);

            } else if (json_geom[geom_num].type == 'MultiPoint') {
                for (let point_num = 0; point_num < json_geom[geom_num].coordinates.length; point_num++) {
                    convertCoordinates(json_geom[geom_num].coordinates[point_num], radius);
                    drawParticle(y_values[0], z_values[0], x_values[0], options);
                }

            } else if (json_geom[geom_num].type == 'LineString') {

                for (let point_num = 0; point_num < json_geom[geom_num].coordinates.length; point_num++) {
                    convertCoordinates(json_geom[geom_num].coordinates[point_num], radius);
                }
                drawLine(y_values, z_values, x_values, options);

            } else if (json_geom[geom_num].type == 'Polygon') {
                let group = createGroup(json_name[geom_num]);
                
                let randomColor = someColors[Math.floor(someColors.length * Math.random())];

                for (let segment_num = 0; segment_num < json_geom[geom_num].coordinates.length; segment_num++) {

                    let coords = json_geom[geom_num].coordinates[segment_num];
                    let refined = genInnerVerts(coords);
                    let flat = verts2array(refined);
                    let d = new Delaunator(flat);
                    removeOuterTriangles(d, coords);

                    let delaunayVerts = array2verts(d.coords);
                    for (let point_num = 0; point_num < delaunayVerts.length; point_num++) {
                        // convertCoordinates(refined[point_num], radius);
                        convertCoordinates(delaunayVerts[point_num], radius);
                    }
                    // drawLine(y_values, z_values, x_values, options);
                    drawMesh(group, y_values, z_values, x_values, d.triangles, randomColor);
                }

            } else if (json_geom[geom_num].type == 'MultiLineString') {
                
                for (let segment_num = 0; segment_num < json_geom[geom_num].coordinates.length; segment_num++) {
                    let coords = json_geom[geom_num].coordinates[segment_num];
                    for (let point_num = 0; point_num < coords.length; point_num++) {
                        convertCoordinates(json_geom[geom_num].coordinates[segment_num][point_num], radius);
                    }
                    drawLine(y_values, z_values, x_values);
                }

            } else if (json_geom[geom_num].type == 'MultiPolygon') {
                
                let group = createGroup(json_name[geom_num]);
                let randomColor = someColors[Math.floor(someColors.length * Math.random())];

                for (let polygon_num = 0; polygon_num < json_geom[geom_num].coordinates.length; polygon_num++) {
                    for (let segment_num = 0; segment_num < json_geom[geom_num].coordinates[polygon_num].length; segment_num++) {

                        let coords = json_geom[geom_num].coordinates[polygon_num][segment_num];
                        let refined = genInnerVerts(coords);
                        let flat = verts2array(refined);
                        let d = new Delaunator(flat);
                        removeOuterTriangles(d, coords);

                        let delaunayVerts = array2verts(d.coords);
                        for (let point_num = 0; point_num < delaunayVerts.length; point_num++) {
                            // convertCoordinates(refined[point_num], radius);
                            convertCoordinates(delaunayVerts[point_num], radius);
                        }
                        // drawLine(y_values, z_values, x_values, options);
                        
                        drawMesh(group, y_values, z_values, x_values, d.triangles, randomColor)
                        
                    }
                }
            } else {
                throw new Error('The geoJSON is not valid.');
            }

        }

        progressEl.text("Complete!");
    }

    function createNameArray(json) {
        
        var nameArray = [];
        if (json.type == 'FeatureCollection') {
            for (var feature_num = 0; feature_num < json.features.length; feature_num++) {
                nameArray.push([json.features[feature_num].properties.ADMIN]);
            }
        }
        return nameArray;
    }

    function createGeometryArray(json) {
        
        var geometry_array = [];
        if (json.type == 'Feature') {
            geometry_array.push(json.geometry);
        } else if (json.type == 'FeatureCollection') {
            for (var feature_num = 0; feature_num < json.features.length; feature_num++) {
                geometry_array.push(json.features[feature_num].geometry);
            }
        } else if (json.type == 'GeometryCollection') {
            for (var geom_num = 0; geom_num < json.geometries.length; geom_num++) {
                geometry_array.push(json.geometries[geom_num]);
            }
        } else {
            throw new Error('The geoJSON is not valid.');
        }
        
        return geometry_array;
    }

    function getConversionFunctionName(shape) {
        
        var conversionFunctionName;

        if (shape == 'sphere') {
            conversionFunctionName = convertToSphereCoords;
        } else if (shape == 'plane') {
            conversionFunctionName = convertToPlaneCoords;
        } else {
            throw new Error('The shape that you specified is not valid.');
        }
        return conversionFunctionName;
    }


    function convertToSphereCoords(coordinates_array, sphere_radius) {
        
        var lon = coordinates_array[0];
        var lat = coordinates_array[1];


        x_values.push(Math.cos(lat * Math.PI / 180) * Math.cos(lon * Math.PI / 180) * sphere_radius);

        y_values.push(Math.cos(lat * Math.PI / 180) * Math.sin(lon * Math.PI / 180) * sphere_radius);

        z_values.push(Math.sin(lat * Math.PI / 180) * sphere_radius);


    }

    function convertToPlaneCoords(coordinates_array, radius) {
        
        var lon = coordinates_array[0];
        var lat = coordinates_array[1];
        var plane_offset = radius / 2;

        z_values.push((lat / 180) * radius);
        y_values.push((lon / 180) * radius);

    }


    function drawParticle(x, y, z, options) {
        
        var particle_geom = new THREE.Geometry();
        particle_geom.vertices.push(new THREE.Vector3(x, y, z));

        var particle_material = new THREE.ParticleSystemMaterial(options);

        var particle = new THREE.ParticleSystem(particle_geom, particle_material);
        scene.add(particle);

        clearArrays();
    }

    function drawLine(x_values, y_values, z_values, options) {
        
        var line_geom = new THREE.Geometry();
        createVertexForEachPoint(line_geom, x_values, y_values, z_values);

        var line_material = new THREE.LineBasicMaterial(options);
        var line = new THREE.Line(line_geom, line_material);
        scene.add(line);

        clearArrays();
    }

    function createGroup(name) {
        var group = new THREE.Group();
        
        group.userData.userText = name;
        scene.add(group);
        return group;
        
    }

    function drawMesh(group, x_values, y_values, z_values, triangles, color) {
        var geometry = new THREE.Geometry();
        for (let k = 0; k < x_values.length; k++) {
            geometry.vertices.push(
                new THREE.Vector3(x_values[k], y_values[k], z_values[k])
            );
        }

        for (let k = 0; k < triangles.length; k += 3) {
            geometry.faces.push(new THREE.Face3(triangles[k], triangles[k + 1], triangles[k + 2]));
        }

        geometry.computeVertexNormals()

        var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: 0x00FFFF,
            wireframe: false,
            opacity: 1,
        }));
        clickableObjects.push(mesh);
        group.add(mesh);
        clearArrays();
    }

    function createVertexForEachPoint(object_geometry, values_axis1, values_axis2, values_axis3) {
        for (var i = 0; i < values_axis1.length; i++) {
            object_geometry.vertices.push(new THREE.Vector3(values_axis1[i],
                values_axis2[i], values_axis3[i]));
        }
    }

    function clearArrays() {
        x_values.length = 0;
        y_values.length = 0;
        z_values.length = 0;
    }


    const raycaster = new THREE.Raycaster();

    // new THREE.PerspectiveCamera(30, width / height, 1, 10000);
    const camera =
        new THREE.PerspectiveCamera(
            VIEW_ANGLE,
            ASPECT,
            NEAR,
            FAR
        );
    const radius = 200;

    camera.position.set(0, 0, 750);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // var domEvents = new THREEx.DomEvents(camera, renderer.domElement)

    var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(light);

    var light = new THREE.AmbientLight(0x505050); // soft white light
    scene.add(light);

    const geometry = new THREE.SphereGeometry(radius, 100, 100);

    let material = new THREE.MeshPhongMaterial({
        color: 0xe43c59,
        transparent: true,
        opacity: 0.5,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);



    $.getJSON("data/countries.json", function (data) {
        drawThreeGeo(data, radius, 'sphere', {
            color: 0x80FF80,
            opacity: 1,
        })

    });



    const video = document.getElementById('video');
    scene.background = new THREE.VideoTexture(video);

    const controls = new OrbitControls(camera);
    controls.rotateSpeed += 0.1;
    controls.zoomSpeed += 0.1;
    controls.panSpeed += 0.1;
    controls.minDistance = 10;
    controls.maxDistance = 5000;

    function render() {
        controls.update();
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        scene.rotation.y += .005;
    }

    render()


    // function convert_lat_lng(lat, lng, radius) {
    //     const phi = (90 - lat) * Math.PI / 180,
    //         theta = (180 - lng) * Math.PI / 180,
    //         position = new THREE.Vector3(0, 0, 0);

    //     position.x = radius * Math.sin(phi) * Math.cos(theta);
    //     position.y = radius * Math.cos(phi);
    //     position.z = radius * Math.sin(phi) * Math.sin(theta);

    //     return position;
    // }



    // this will be 2D coordinates of the current mouse position, [0,0] is middle of the screen.
    let mouse = new THREE.Vector2();

    let hoveredObj; // this objects is hovered at the moment
    let latestMouseProjection;
    let clickedObj1;
    let clickedObj2;
    // Following two functions will convert mouse coordinates
    // from screen to three.js system (where [0,0] is in the middle of the screen)
    function updateMouseCoords(event, coordsObj) {
        coordsObj.x = ((event.clientX - renderer.domElement.offsetLeft + 0.5) / window.innerWidth) * 2 - 1;
        coordsObj.y = -((event.clientY - renderer.domElement.offsetTop + 0.5) / window.innerHeight) * 2 + 1;
    }

    // function onMouseMove(event) {


    //     updateMouseCoords(event, mouse);
    //     // var divElement = $("#country");

    //     raycaster.setFromCamera(mouse, camera); {
    //         const intersects = raycaster.intersectObjects(clickableObjects);

    //         let setGroupColor = function (group, colorHex) {
    //             for (let i = 0; i < group.children.length; i++) {
    //                 if (!group.children[i].userData.color) {
    //                     group.children[i].userData.color = hoveredObj.parent.children[i].material.color.clone();
    //                     group.children[i].material.color.set(colorHex);
    //                     group.children[i].material.needsUpdate = true;
    //                 }
    //             }
    //         }

    //         let resetGroupColor = function (group) {
    //             // set all shapes of the group to initial color
    //             for (let i = 0; i < group.children.length; i++) {
    //                 if (group.children[i].userData.color) {
    //                     group.children[i].material.color = group.children[i].userData.color;
    //                     delete group.children[i].userData.color;
    //                     group.children[i].material.needsUpdate = true;
    //                 }
    //             }
    //         }

    //         if (intersects.length > 0) {
    //             latestMouseProjection = intersects[0].point;
    //             $('html,body').css('cursor', 'pointer');
    //             // reset colors for previously hovered group
    //             if (hoveredObj) {
    //                 resetGroupColor(hoveredObj.parent);
    //             }

    //             hoveredObj = intersects[0].object;
    //             if (!hoveredObj.parent || (hoveredObj === clickedObj) ) return;
    //             // set colors for hovered group
    //             // 
    //             setGroupColor(hoveredObj.parent, 0x80FF80);
    //         }
    //         else {
    //             $('html,body').css('cursor', 'default');
    //             if (!hoveredObj || !hoveredObj.parent) return;

    //             // nothing is hovered => just reset colors on the last group
    //             resetGroupColor(hoveredObj.parent);
    //             hoveredObj = undefined;
    //             console.log("deselected");
    //         }
    //     }
    // }

    function fetchCountries(originCountry) {
       
        const passData = passportData();
        let allowedCountries = passData[originCountry];
        if (allowedCountries) {
            $('#destinations').text(allowedCountries.join(" \u2708\ufe0f "));
        for (let i = 0; i < clickableObjects.length; i++) {
           
            let aCC = clickableObjects[i];
            for (let i = 0; i < allowedCountries.length; i++) {
                let oneCountry = allowedCountries[i];
                
                
            if (aCC.parent.userData["userText"].toString() === oneCountry) {
                    
                    for (let i = 0; i < aCC.parent.children.length; i++) {
                        
                        if (!aCC.parent.children[i].userData.color) {
                            aCC.parent.children[i].userData.color = aCC.parent.children[i].material.color.clone();
                            aCC.parent.children[i].material.color.set(0x800080);
                            aCC.parent.children[i].material.needsUpdate = true;
                        }
                    }
                } 
                // else {
                // for (let i = 0; i < aCC.parent.children.length; i++) {
                //     if (aCC.parentchildren[i].userData.color) {
                //         aCC.parent.children[i].material.color = aCC.parent.children[i].userData.color;
                //         delete aCC.parent.children[i].userData.color;
                //         aCC.parent.children[i].material.needsUpdate = true;
                //     }
                //     }
                // }
            }
        }
    } else {
            $('#destinations').text("no data");
    }
}

function resetCountryColors() {
    for (let i = 0; i < clickableObjects.length; i++) {
        let oneClickableObj = clickableObjects[i];
    for (let i = 0; i < oneClickableObj.children.length; i++) {
        if (oneClickableObj.children[i].userData.color) {
            oneClickableObj.children[i].material.color = oneClickableObj.children[i].userData.color;
            delete oneClickableObj.children[i].userData.color;
            oneClickableObj.children[i].material.needsUpdate = true;
        }
    }
}
}



    function onMouseClick(event) {
       

        updateMouseCoords(event, mouse);


        raycaster.setFromCamera(mouse, camera); {
            const intersects = raycaster.intersectObjects(clickableObjects);
            
            let setGroupColor = function (group, colorHex) {
                
                for (let i = 0; i < group.children.length; i++) {

                    if (!group.children[i].userData.color) {
                        group.children[i].userData.color = clickedObj1.parent.children[i].material.color.clone();
                        group.children[i].material.color.set(colorHex);
                        group.children[i].material.needsUpdate = true;
                    }
                }
            }

            let resetGroupColor = function (group) {
                
                // set all shapes of the group to initial color
                for (let i = 0; i < group.children.length; i++) {
                    if (group.children[i].userData.color) {
                        group.children[i].material.color = group.children[i].userData.color;
                        delete group.children[i].userData.color;
                        group.children[i].material.needsUpdate = true;
                    }
                }
            }

            if (intersects.length > 0) {
                latestMouseProjection = intersects[0].point;
                $('html,body').css('cursor', 'pointer');
                // reset colors for previously hovered group
                // if (clickedObj) {
                //     resetGroupColor(clickedObj.parent);
                // }

                clickedObj1 = intersects[0].object;
                clickedObj2 = intersects[0].object
                // if (!clickedObj.parent) return;
                // set colors for hovered group
                // 
                if (clickedObj1 !== clickedObj2) {
                    clickedObj1 = clickedObj2;
                    return clickedObj1;
                }
                        
                setGroupColor(clickedObj1.parent, 0x800080);
                $('#click').css('display', 'none');
                $('#country').css('display', 'block');
                $('#destinations').css('display', 'flex')
                // $('#country').text("Nope, that's " + clickedObj.parent.userData["userText"].toString());
                let clickedCountry = clickedObj1.parent.userData["userText"];
            
                $('#country').text("Your country:      " + clickedCountry);
                fetchCountries(clickedCountry).then(() => {
                    setInterval(() => { resetCountryColors(); }, 10000);
                })
            }
            else  {
                $('html,body').css('cursor', 'default');
                // if (!clickedObj || !clickedObj.parent) return;
                
                // nothing is hovered => just reset colors on the last group
                resetGroupColor(clickedObj1.parent);
                clickedObj1 = undefined;
            }
        }
    }


    window.addEventListener('resize', function () {
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = ASPECT;
        camera.updateProjectionMatrix();
    });

    // window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('click', onMouseClick, false);

}