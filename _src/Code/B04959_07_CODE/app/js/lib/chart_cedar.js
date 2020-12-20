define([
        "dojo/_base/declare",
        "cedar",
        "esri/tasks/query",
        "esri/tasks/QueryTask",
	    "esri/config",
        "dojo/domReady!"
], function (
    declare,
    Cedar,
    Query,
    QueryTask,
    esriConfig) {
    //https://github.com/Esri/cedar
    //http://esri.github.io/cedar/tutorial/
    //http://geoservices.github.io/

    var chart = new Cedar({
        "type": "bar",
        "dataset": {
            "url": "/proxy/proxy.ashx?http://demographics5.arcgis.com/arcgis/rest/services/USA_Demographics_and_Boundaries_2015/MapServer/15",
            "query": {
                "groupByFieldsForStatistics": "ST_ABBREV",
                "outStatistics": [{
                    "statisticType": "avg",
                    "onStatisticField": "MEDHINC_CY",
                    "outStatisticFieldName": "AVG_MEDHINC_CY"
                }]
            },
            "mappings": {
                "sort": "AVG_MEDHINC_CY",
                "x": {
                    "field": "ST_ABBREV",
                    "label": "State"
                },
                "y": {
                    "field": "AVG_MEDHINC_CY",
                    "label": "Avg. Median Household Income"
                }
            }
        }
    });

    chart.tooltip = {
        "title": "{ST_ABBREV}",
        "content": "{AVG_MEDHINC_CY} population in {ST_ABBREV}"
    }


    //show the chart
    chart.show({
        elementId: "#cedarchartdiv",
        width: 900
    });

    esriConfig.defaults.io.proxyUrl = "/proxy/proxy.ashx";
    esriConfig.defaults.io.alwaysUseProxy = true;
    var query = new Query();
    var queryTask = new QueryTask("http://demographics5.arcgis.com/arcgis/rest/services/USA_Demographics_and_Boundaries_2015/MapServer/21");
    query.where = "1 = 1";
    query.returnGeometry = false;
    query.outFields = ["MEDHINC_CY", "DIVINDX_CY", "NAME", "TOTPOP_CY"];
    queryTask.execute(query).then(function (data) {
        /*scatter*/
        var scatter_chart = new Cedar({
            "type": "scatter",
            "dataset": {
                "data": data,
                "mappings": {
                    "x": {
                        "field": "MEDHINC_CY",
                        "label": "Median Houseold Income"
                    },
                    "y": {
                        "field": "DIVINDX_CY",
                        "label": "Diversity Index"
                    },
                    "color": {
                        "field": "NAME",
                        "label": "State"
                    }
                }
            }
        });

        scatter_chart.show({
            elementId: "#cedarScatterPlotDiv",
            width:900,
            height:650
        });



        /*bubble*/
        var bubble_chart = new Cedar({
            "type": "bubble",
            "dataset": {
                "data": data,
                "mappings": {
                    "x": {
                        "field": "MEDHINC_CY",
                        "label": "Median Houseold Income"
                    },
                    "y": {
                        "field": "DIVINDX_CY",
                        "label": "Diversity Index"
                    },
                    "size": {
                        "field": "TOTPOP_CY",
                        "label": "Population"
                    }
                }
            }
        });

        bubble_chart.show({
            elementId: "#cedarBubblePlotDiv"
        });

    }, function (err) {
        console.log(err);
    });
});