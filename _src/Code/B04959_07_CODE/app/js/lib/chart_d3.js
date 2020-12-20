define([
        "dojo/_base/declare",
        "d3",
        "dojo/topic",
        "dojo/_base/array",
        "dojo/domReady!"
], function (
	declare,
	d3,
	topic,
	array) {
	//http://d3js.org/
	//http://jsfiddle.net/jSAH9/
	//http://codepen.io/girliemac/pen/cDfmb
	//http://bost.ocks.org/mike/nations/
	//https://live2.zoomdata.com/zoomdata/visualization?__target=embedded&key=546ca53ae4b0f6e2257e3295#54292b07e4b011a99e1252ba-5411ace4e4b065842f0df36e


	var data = [
		{
			"label": "Top 2.5%ile",
			"Income": 70818
        },
		{
			"label": "Bottom 2.5%ile",
			"Income": 21568
        },
		{
			"label": "National Avg",
			"Income": 46193
        },
		{
			"label": "Selected Value",
			"Income": 0
        }
    ];
	drawChart();

	topic.subscribe("app/feature/selected", function () {
		var val = arguments[0].attributes.MEDHINC_CY;
		var title = arguments[0].attributes.NAME + ', ' + arguments[0].attributes.STATE_NAME;;
		array.forEach(data, function (item) {
			if (item.label === "Selected Value") {
				item.Income = val;
			}
		});

		drawChart(title);
		console.log(JSON.stringify(data));
	});

	function drawChart(title) {
		var margin = {
				top: 50,
				right: 20,
				bottom: 30,
				left: 60
			},
			width = 400 - margin.left - margin.right,
			height = 400 - margin.top - margin.bottom;

		var x = d3.scale.ordinal()
			.rangeRoundBands([0, width], .1);

		var y = d3.scale.linear()
			.range([height, 0]);

		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(10);

		//clear existing 
		d3.select(".chart").selectAll("*").remove();
		var svg = d3.select(".chart").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		svg.append("g")
			.append("text")
			.attr("transform", "translate(80, -30)")
			.text(title);

		x.domain(data.map(function (d) {
			return d.label;
		}));
		y.domain([0, d3.max(data, function (d) {
			return d.Income;
		})]);

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "translate(-60, 150) rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Income");

		svg.selectAll(".bar")
			.data(data)
			.enter().append("rect")
			.attr("class", "bar")
			.style("fill", function (d) {
				if (d.label == "Selected Value")
					return "yellowgreen";
			})
			.attr("x", function (d) {
				return x(d.label);
			})
			.attr("width", x.rangeBand())
			.attr("y", function (d) {
				return y(d.Income);
			})
			.attr("height", function (d) {
				return height - y(d.Income);
			});
	}
});