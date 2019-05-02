import * as d3 from 'd3';
export default d3.csv("data/passport.csv").then(data => {
    data.forEach(function (d) {
        d.Value = +d.Value;
    });
    const COUNTRIES_DATA = data.map(Object.values);
    // console.log(COUNTRIES_DATA)
    // console.log(COUNTRIES_DATA[1][0]);


    const countries = {};

    for (let i = 0; i < COUNTRIES_DATA.length; i++) {
        if (countries[COUNTRIES_DATA[i][0]] === undefined) {
            countries[COUNTRIES_DATA[i][0]] = {
                [COUNTRIES_DATA[i][1]]: COUNTRIES_DATA[i][2]
            };
        } else {
            Object.assign(countries[COUNTRIES_DATA[i][0]], {
                [COUNTRIES_DATA[i][1]]: COUNTRIES_DATA[i][2]
            });
        }
        
    }
    console.log(countries);
});
