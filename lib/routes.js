import * as d3 from 'd3';

export default d3.csv("../data/passport.csv").then(function (data) {
    data.forEach(function (d) {
        d.Value = +d.Value;
    });
    console.log(data);
});

