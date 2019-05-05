import globe from './globe';
// import axios from 'axios';


document.addEventListener('DOMContentLoaded', () => {
        globe();
        // axios.get('https://ecomfe.github.io/echarts-examples/public/data/asset/data/flights.json')
        //         .then(res => {
        //                 const routes = res.data.routes.slice(0, 10000);
        //                 console.log(routes);
        //                 const airports = res.data.airports;
        //                 console.log(airports);
        //                 const coords = routes.map(route => {
        //                         const startAirport = airports[route[1]];
        //                         console.log(startAirport);
        //                         const endAirport = airports[route[2]];
        //                         const startLat = startAirport[4];
        //                         const startLng = startAirport[3];
        //                         const endLat = endAirport[4];
        //                         const endLng = endAirport[3];
        //                         return [startLat, startLng, endLat, endLng];
        //                 });
        //                 console.log(coords);
        //         })
});