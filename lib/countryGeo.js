export function getPoint(event) {

    // vertices
    let a = this.geometry.vertices[event.face.a];
    let b = this.geometry.vertices[event.face.b];
    let c = this.geometry.vertices[event.face.c];

    //avg
    let point = {
        x: (a.x + b.x + c.x) / 3,
        y: (a.y + b.y + c.y) / 3,
        z: (a.z + b.z + c.z) / 3
    };

    return point;
}

export function getEventCenter(event, radius) {
    radius = radius || 200;

    const point = getPoint.call(this, event);

    const latRad = Math.acos(point.y / radius);
    const lonRad = Math.atan2(point.z, point.x);
    const lat = (Math.PI / 2 - latRad) * (180 / Math.PI);
    const lon = (Math.PI - lonRad) * (180 / Math.PI);

    return [lat, lon - 180];
}

export function convertToXYZ(point, radius) {
    radius = radius || 200;

    const latRad = (90 - point[0]) * Math.PI / 180;
    const lonRad = (180 - point[1]) * Math.PI / 180;

    const x = radius * Math.sin(latRad) * Math.cos(lonRad);
    const y = radius * Math.cos(latRad);
    const z = radius * Math.sin(latRad) * Math.sin(lonRad);

    return { x: x, y: y, z: z };
}

export const geodecoder = function (features) {

    let store = {};

    for (let i = 0; i < features.length; i++) {
        store[features[i].id] = features[i];
    }

    return {
        find: function (id) {
            return store[id];
        },
        search: function (lat, lon) {

            let match = false;

            let country, coords;

            for (let i = 0; i < features.length; i++) {
                country = features[i];
                if (country.geometry.type === 'Polygon') {
                    match = pointInPolygon(country.geometry.coordinates[0], [lon, lat]);
                    if (match) {
                        return {
                            code: features[i].id,
                            name: features[i].properties.name
                        };
                    }
                } else if (country.geometry.type === 'MultiPolygon') {
                    coords = country.geometry.coordinates;
                    for (let j = 0; j < coords.length; j++) {
                        match = pointInPolygon(coords[j][0], [lon, lat]);
                        if (match) {
                            return {
                                code: features[i].id,
                                name: features[i].properties.name
                            };
                        }
                    }
                }
            }

            return null;
        }
    };
};

const pointInPolygon = function (poly, point) {

    let x = point[0];
    let y = point[1];

    let inside = false, xi, xj, yi, yj, xk;

    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        xi = poly[i][0];
        yi = poly[i][1];
        xj = poly[j][0];
        yj = poly[j][1];

        xk = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (xk) {
            inside = !inside;
        }
    }

    return inside;
};