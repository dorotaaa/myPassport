import * as d3 from 'd3';

export default d3.csv("data/passport.csv").then(data => {
    data.forEach(function (d) {
        d.Value = +d.Value;
    });
    const COUNTRIES_DATA = data.map(Object.values);

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
    // console.log(countries);
    // console.log(Object.keys(countries["Afghanistan"]));
});



