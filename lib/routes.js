import * as d3 from 'd3';

function parse() {
var COUNTRIES_DATA = d3.csv("data/passport.csv").then(data => {
    data.forEach(function (d) {
        d.Value = +d.Value;
    });
    return data.map(Object.values);
});

// console.log(COUNTRIES_DATA);


debugger

const countries = {};

 for (let i = 0; i < COUNTRIES_DATA.length; i++) {
     if ((countries[COUNTRIES_DATA[i][0]] === undefined) && (((COUNTRIES_DATA[i][2] === -1) || (COUNTRIES_DATA[i][2] === 3)))) {
         countries[COUNTRIES_DATA[i][0]] = {
             [COUNTRIES_DATA[i][1]]: COUNTRIES_DATA[i][2]
         };
     } else if ((COUNTRIES_DATA[i][2] === -1) || (COUNTRIES_DATA[i][2] === 3)) {
         Object.assign(countries[COUNTRIES_DATA[i][0]], {
             [COUNTRIES_DATA[i][1]]: COUNTRIES_DATA[i][2]
         });
        }
    }
    debugger
    return countries;
}

debugger
console.log(parse());

