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
    //http://bl.ocks.org/zanarmstrong/ddff7cd0b1220bc68a58

    var isInitilaized = false;

    topic.subscribe("application/d3slider/initialize", function () {
        if (!isInitilaized) {
            console.log("received:", arguments);
            var startDate = arguments[0];
            var endDate = arguments[1];

            var formatDate = d3.time.format("%Y-%m-%d");
            var timer;
            // parameters
            var margin = {
                    top: 10,
                    right: 50,
                    bottom: 50,
                    left: 50
                },
                width = 800 - margin.left - margin.right,
                height = 150 - margin.bottom - margin.top;


            // scale function
            var timeScale = d3.time.scale()
                .domain([startDate, endDate])
                .range([0, width])
                .clamp(true);


            // initial value
            var startValue = timeScale(new Date('2012-03-20'));
            startingValue = new Date('2012-03-20');

            //////////

            // defines brush
            var brush = d3.svg.brush()
                .x(timeScale)
                .extent([startingValue, startingValue])
                .on("brush", brushed);

            var svg = d3.select("#d3timeSliderDiv").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                // classic transform to position g
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.on("mousedown", function (data) {
                var value = brush.extent()[0];

                if (d3.event.sourceEvent) { // not a programmatic event
                    value = timeScale.invert(d3.mouse(this)[0]);
                    brush.extent([value, value]);
                }
                console.log(formatDate(value));
            });

            svg.append("g")
                .attr("class", "x axis")
                // put in middle of screen
                .attr("transform", "translate(0," + height / 2 + ")")
                // inroduce axis
                .call(d3.svg.axis()
                    .scale(timeScale)
                    .orient("bottom")
                    .tickFormat(function (d) {
                        return formatDate(d);
                    })
                    .tickSize(0)
                    .tickPadding(12)
                    .tickValues([timeScale.domain()[0], timeScale.domain()[1]]))
                .select(".domain")
                .select(function () {
                    console.log(this);
                    return this.parentNode.appendChild(this.cloneNode(true));
                })
                .attr("class", "halo");

            var slider = svg.append("g")
                .attr("class", "slider")
                .call(brush);

            slider.selectAll(".extent,.resize")
                .remove();

            slider.select(".background")
                .attr("height", height);

            var handle = slider.append("g")
                .attr("class", "handle");

            handle.append("path")
                .attr("transform", "translate(0," + height / 2 + ")")
                .attr("d", "M 0 -20 V 20");

            handle.append('text')
                .text(startingValue)
                .attr("transform", "translate(" + (-45) + " ," + (height / 2 - 25) + ")");

            slider.call(brush.event);

            function brushed() {
                var value = brush.extent()[0];

                if (d3.event.sourceEvent) { // not a programmatic event
                    value = timeScale.invert(d3.mouse(this)[0]);
                    brush.extent([value, value]);
                }

                handle.attr("transform", "translate(" + timeScale(value) + ",0)");
                handle.select('text').text(formatDate(value));
                var reqValue = formatDate(value);

                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function () {
                    //alert(reqValue);
                    topic.publish("application/d3slider/timeChanged", value);
                }, 500);

            }
            isInitilaized = true;
        }
    });





});