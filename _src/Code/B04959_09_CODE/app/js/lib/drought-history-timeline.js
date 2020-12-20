define([
        "dojo/_base/declare",
        "cedar",
        "esri/tasks/query",
        "esri/tasks/QueryTask",
	    "esri/config",
    "dojo/topic",
        "dojo/domReady!"
], function (
    declare,
    Cedar,
    Query,
    QueryTask,
    esriConfig,
    topic) {


    topic.subscribe("some/topic", function () {
            var data = arguments[0];
            var chart = new Cedar({
                "type": "time"
            });
            var dataset = {
                "data": data,
                "mappings": {
                    "time": {
                        "field": "countycategories_date",
                        "label": "Date"
                    },
                    "value": {
                        "field": "countycategories_d0",
                        "label": "Countycategories D0"
                    },
                    "sort": "countycategories_date"
                }
            };

            chart.tooltip = {
                "title": "Countycategories D0",
                "content": "{countycategories_d0}"
            };
        

        chart.dataset = dataset;
        //chart.dataset.mappings.sort = "DATE";
        chart.show({
            elementId: "#droughtHistoryMap",
            autolabels: true,
            height:150,
            width:800
        });
        chart.on('click', function(event,data){
            console.log(event,data);
            topic.publish("application/d3slider/timeChanged", new Date(data.countycategories_date));
        });
    });


});