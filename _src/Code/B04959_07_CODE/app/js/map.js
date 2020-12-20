require([
  "dojo/ready",
	"dojo/parser",
	"esri/map",
	"esri/dijit/Legend",
	"esri/config",
    "esri/layers/FeatureLayer",
	"esri/plugins/FeatureLayerStatistics",
    "esri/tasks/QueryTask",
    "esri/tasks/query",
	"esri/geometry/Extent",
    "esri/tasks/StatisticDefinition",
    "esri/dijit/Scalebar",
    "application/bootstrapmap",
	"esri/renderers/SimpleRenderer",
    "esri/renderers/ClassBreaksRenderer",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/renderers/smartMapping",
    "esri/styles/choropleth",
    "esri/Color",
	"esri/dijit/Popup",
	"esri/dijit/PopupTemplate",
    "dojo/on",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojox/charting/Chart",
	"dojox/charting/themes/Bahamation",
    "dojo/_base/array",
    "dojo/promise/all",
    "dojo/topic",
    "dojo/domReady!",
    "application/chart_d3",
    "application/chart_cedar"],
function (
    ready,
    parser,
    Map,
    Legend,
    esriConfig,
    FeatureLayer,
    FeatureLayerStatistics,
    QueryTask,
    Query,
    Extent,
    StatisticDefinition,
    Scalebar,
    BootstrapMap,
    SimpleRenderer,
    ClassBreaksRenderer,
    SimpleFillSymbol,
    SimpleLineSymbol,
    SmartMapping,
    esriStylesChoropleth,
    Color,
    Popup,
    PopupTemplate,
    on,
    domClass,
    domConstruct,
    Chart,
    theme,
    array,
    all,
    topic
) {
    ready(function () {

            esriConfig.defaults.io.proxyUrl = "/proxy/proxy.ashx";
            esriConfig.defaults.io.alwaysUseProxy = true;

            parser.parse();

            var stats = {};
            var demoGrpahicsURL = "http://demographics5.arcgis.com/arcgis/rest/services/USA_Demographics_and_Boundaries_2015/MapServer";

            var BlockLevelFeatureLayerURL = demoGrpahicsURL + "/15";

            var fill = new SimpleFillSymbol("solid", null, new Color("#A4CE67"));
            var popup = new Popup({
                fillSymbol: fill,
                titleInBody: false
            }, domConstruct.create("div"));
            //Add the dark theme which is customized further in the <style> tag at the top of this page
            domClass.add(popup.domNode, "dark");

            // Get a reference to the ArcGIS Map class
            var map = BootstrapMap.create("mapDiv", {
                basemap: "dark-gray",
                infoWindow: popup
            });

            map.setExtent(new Extent({
                "type": "extent",
                "xmin": -17707437.64043806,
                "ymin": 1951618.8831517182,
                "xmax": -4342576.118835116,
                "ymax": 7988309.629000194,
                "spatialReference": {
                    "wkid": 102100,
                    "latestWkid": 3857
                }
            }));

            map.infoWindow.resize(430, 280);

            $(document).ready(function () {

                    $('.clickable').on('click', function () {
                        var effect = $(this).data('effect');
                        $(this).closest('.panel')[effect]();
                    })

                    $("#basemapList li").click(function (e) {
                        switch (e.target.text) {
                        case "Streets":
                            map.setBasemap("streets");
                            break;
                        case "Imagery":
                            map.setBasemap("hybrid");
                            break;
                        case "National Geographic":
                            map.setBasemap("national-geographic");
                            break;
                        case "Topographic":
                            map.setBasemap("topo");
                            break;
                        case "Gray":
                            map.setBasemap("gray");
                            break;
                        case "Dark Gray":
                            map.setBasemap("dark-gray");
                            break;
                        case "Open Street Map":
                            map.setBasemap("osm");
                            break;
                        }
                    });
                    $("#classificationMethod li").click(function (e) {
                        switch (e.target.text) {
                        case "Equal Interval":
                            applySelectedRenderer('equal-interval');
                            break;
                        case "Natural Breaks":
                            applySelectedRenderer('natural-breaks');
                            break;
                        case "Quantile":
                            applySelectedRenderer('quantile');
                            break;
                        case "Standard Deviation":
                            applySelectedRenderer('standard-deviation');
                            break;
                        }
                    });

                    $("#smartMapping li").click(function (e) {
                        switch (e.target.text) {
                        case "Equal Interval":
                            applySmartRenderer('equal-interval');
                            break;
                        case "Natural Breaks":
                            applySmartRenderer('natural-breaks');
                            break;
                        case "Quantile":
                            applySmartRenderer('quantile');
                            break;
                        case "Standard Deviation":
                            applySmartRenderer('standard-deviation');
                            break;
                        }

                    });

                    $("#menuChart li").click(function (e) {
                            $(".chartCon").each(function (i) {
                                if ($($(this).find(".panel-titletext")[0]).text() === e.target.text) {
                                    $(this).show()
                                }
                            });
                    });


            });



        var queryTask = new QueryTask(BlockLevelFeatureLayerURL);
        var query = new Query();
        var maxStatDef = new StatisticDefinition(); maxStatDef.onStatisticField = 'MEDHINC_CY'; maxStatDef.outStatisticFieldName = 'MAX_MEDHINC_CY'; maxStatDef.statisticType = 'max';

        var minStatDef = new StatisticDefinition(); minStatDef.onStatisticField = 'MEDHINC_CY'; minStatDef.outStatisticFieldName = 'MIN_MEDHINC_CY'; minStatDef.statisticType = 'min';

        var stdDevStatDef = new StatisticDefinition(); stdDevStatDef.onStatisticField = 'MEDHINC_CY'; stdDevStatDef.outStatisticFieldName = 'STDDEV_MEDHINC_CY'; stdDevStatDef.statisticType = 'stddev';

        var avgDevStatDef = new StatisticDefinition(); avgDevStatDef.onStatisticField = 'MEDHINC_CY'; avgDevStatDef.outStatisticFieldName = 'AVG_MEDHINC_CY'; avgDevStatDef.statisticType = 'avg';


        console.log([maxStatDef, minStatDef, stdDevStatDef]); query.returnGeometry = false; query.where = "1=1"; query.outStatistics = [maxStatDef, minStatDef, stdDevStatDef, avgDevStatDef]; queryTask.execute(query, handleQueryResult, errorHandler);

        function handleQueryResult(results) {
            if (!results.hasOwnProperty("features") || results.features.length === 0) {
                console.log('No features, something went wrong');
                return;
            }
            var statsObj = results.features[0].attributes;
            console.log(statsObj);
            stats.Plus1StdDev = statsObj.AVG_MEDHINC_CY + 1 * statsObj.STDDEV_MEDHINC_CY;
            stats.Plus2StdDev = statsObj.AVG_MEDHINC_CY + 2 * statsObj.STDDEV_MEDHINC_CY;
            stats.Plus3StdDev = statsObj.AVG_MEDHINC_CY + 3 * statsObj.STDDEV_MEDHINC_CY;
            stats.Minus1StdDev = statsObj.AVG_MEDHINC_CY - 1 * statsObj.STDDEV_MEDHINC_CY;
            stats.Mius2StdDev = statsObj.AVG_MEDHINC_CY - 2 * statsObj.STDDEV_MEDHINC_CY;
            stats.Minus3StdDev = statsObj.AVG_MEDHINC_CY - 3 * statsObj.STDDEV_MEDHINC_CY;
            console.log(stats);
        }

        function errorHandler(err) {
            console.log('Oops, error: ', err);
        };

        var template = new PopupTemplate({
            title: "USA Demogrpahics",
            description: "Median household income at {NAME}, {STATE_NAME} is ${MEDHINC_CY}",
            fieldInfos: [{ //define field infos so we can specify an alias
                    fieldName: "WHITE_CY",
                    label: "White Americans"
					},
                { //define field infos so we can specify an alias
                    fieldName: "BLACK_CY",
                    label: "Blacks"
          			},
                { //define field infos so we can specify an alias
                    fieldName: "AMERIND_CY",
                    label: "American Indians"
          			},
                { //define field infos so we can specify an alias
                    fieldName: "ASIAN_CY",
                    label: "Asians"
          			},
                { //define field infos so we can specify an alias
                    fieldName: "PACIFIC_CY",
                    label: "Pacific Islanders"
          			},
                { //define field infos so we can specify an alias
                    fieldName: "OTHRACE_CY",
                    label: "Other Race Count"
          			}
				],
            mediaInfos: [{ //define the bar chart
                caption: "",
                type: "piechart", // image, piechart, barchart,columnchart,linechart
                value: {
                    theme: "Bahamation",
                    fields: ["WHITE_CY", "BLACK_CY", "AMERIND_CY", "ASIAN_CY", "PACIFIC_CY", "OTHRACE_CY"]
                }
          }]
        });


        var CountyDemogrpahicsLayer = new FeatureLayer(BlockLevelFeatureLayerURL, {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["NAME", "STATE_NAME", "TOTPOP_CY", "MEDHINC_CY", "DIVINDX_CY", "WHITE_CY", "BLACK_CY", "AMERIND_CY", "ASIAN_CY", "PACIFIC_CY", "OTHRACE_CY"],
            infoTemplate: template

        });

        map.addLayer(CountyDemogrpahicsLayer);


        var legendParams = {
            map: map,
            layerInfos: [{
                layer: CountyDemogrpahicsLayer,
                title: 'County Demogrpahics'
				}]
        };
        var legendSrcNode = 'legend';
        var legend = new Legend(legendParams, legendSrcNode); legend.startup();


        var scalebar = new Scalebar({
            map: map,
            scalebarUnit: "dual"
        });



        var featureLayerStatsParams = {
            field: "MEDHINC_CY",
            classificationMethod: 'standard-deviation' //standard-deviation, equal-interval, natural-breaks, quantile and standard-deviation
        };


        on(CountyDemogrpahicsLayer, "load", function (evt) {
            evt.layer.setMaxScale(0);
            evt.layer.setMinScale(0);
        });

        on(CountyDemogrpahicsLayer, "click", function(evt){
            topic.publish("app/feature/selected", evt.graphic);
        });

        /* 
            function getRandomColor() {
                var letters = '0123456789ABCDEF'.split('');
                var color = '#';
                for (var i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            }
            
            
            */
        var featureLayerStats = new FeatureLayerStatistics({
            layer: CountyDemogrpahicsLayer

        });

        function applySmartRenderer(selectedClassificationMethod) {

            var schemes = esriStylesChoropleth.getSchemes({
                theme: "high-to-low", //high-to-low, above-and-below, centered-on, or extremes.
                basemap: map.getBasemap(),
                geometryType: "polygon"
            });
            console.log(JSON.stringify(schemes));
            var classedColorRenderParams = {
                basemap: map.getBasemap(),
                classificationMethod: selectedClassificationMethod,
                field: 'MEDHINC_CY',
                layer: CountyDemogrpahicsLayer,
                scheme: schemes.primaryScheme,
                numClasses: 5
            };

            SmartMapping.createClassedColorRenderer(classedColorRenderParams).then(function (result) {
                CountyDemogrpahicsLayer.setRenderer(result.renderer);
                CountyDemogrpahicsLayer.redraw();
                legend.refresh();
            }).otherwise(function (error) {
                console.log("An error occurred while performing%s, Error: %o", "Smart Mapping", error);
            });
        };
        
        
        function applySelectedRenderer(selectedClassificationMethod) {
            var featureLayerStatsParams_color = {
                field: "MEDHINC_CY",
                classificationMethod: selectedClassificationMethod, //standard-deviation, equal-interval, natural-breaks, quantile and standard-deviation
                numClasses: 5
            };
            var featureLayerStatsParams_opacity = {
                field: "DIVINDX_CY",
                classificationMethod: selectedClassificationMethod, //standard-deviation, equal-interval, natural-breaks, quantile and standard-deviation
                numClasses: 5,
                //normalizationField: 'TOTPOP_CY'
            };

            var color_stats_promise = featureLayerStats.getClassBreaks(featureLayerStatsParams_color);
            var opacity_stats_promise = featureLayerStats.getClassBreaks(featureLayerStatsParams_opacity);
            all([color_stats_promise, opacity_stats_promise]).then(function (results) {
                var color_stat_result = results[0];
                var opacity_stat_result = results[1];
                
                var colorStops = [];
                var colors = ['#d7191c', '#fdae61', '#ffffbf', '#abd9e9', '#2c7bb6'];
                array.forEach(color_stat_result.classBreakInfos, function (classBreakInfo, i) {
                    colorStops.push({
                        value: classBreakInfo.minValue,
                        color: new Color(colors[i])
                            //label: classBreakInfo.label
                    });
                });
                var opacityStops = [];
                array.forEach(opacity_stat_result.classBreakInfos, function (classBreakInfo, i) {
                    var minOpacity = 0;
                    var maxOpacity = 1;
                    var opacity = minOpacity + i * maxOpacity / (opacity_stat_result.classBreakInfos.length - 1);
                    opacityStops.push({
                        value: classBreakInfo.minValue,
                        opacity: opacity
                    });
                });

                var visualVariables = [
                    {
                        "type": "colorInfo",
                        "field": "MEDHINC_CY",
                        "stops": colorStops
                        },
                    {
                        "type": "opacityInfo",
                        "field": "DIVINDX_CY",
                        "stops": opacityStops
                        }
                      ];
                console.log(JSON.stringify(visualVariables));
                var symbol = new SimpleFillSymbol();
                symbol.setColor(new Color([0, 255, 0]));
                symbol.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0]), 0.1));

                var colorBreakRenderer = new SimpleRenderer(symbol);
                console.log(colorStops);

                colorBreakRenderer.setVisualVariables(visualVariables);
                CountyDemogrpahicsLayer.setRenderer(colorBreakRenderer);
                CountyDemogrpahicsLayer.redraw();
                legend.refresh();

            });
        }




        /*
        featureLayerStats.getClassBreaks(featureLayerStatsParams).then(function (result) {
            console.log("Successfully calculated %s for field %s, %o", "class breaks", featureLayerStatsParams["field"], JSON.stringify(result));
            //Set the renderer
            
            
            
            //var symbol = new SimpleFillSymbol();
            //symbol.setColor(new Color([150, 150, 150, 0.5]));
            //
            //var classBreakRenderer = new ClassBreaksRenderer(symbol, "MEDHINC_CY");
            //array.forEach(result.classBreakInfos, function(classBreakInfo){
            //    classBreakRenderer.addBreak(classBreakInfo.minValue, classBreakInfo.maxValue, new SimpleFillSymbol().setColor(new Color(getRandomColor())));
            //});
            //
            //
            //
            //continuousRenderer.setColorInfo({
            //     field: "MEDHINC_CY",
            //     stops: [
            //       new Color([0, 255, 0]),
            //       new Color([255, 0, 0])
            //     ]
            //    });
            
            
            //var colorBreakRenderer = new ClassBreaksRenderer(symbol);
            //var stops = [];
            //var colors = ['#feebe2','#fbb4b9','#f768a1','#c51b8a','#7a0177'];
            //array.forEach(result.classBreakInfos, function(classBreakInfo, i){
            //    stops.push({ value: classBreakInfo.maxValue, color: new Color(colors[i]) });
            //});
            //colorBreakRenderer.setColorInfo({
            //     field:"MEDHINC_CY",
            //     stops: stops
            //});

            
            var symbol = new SimpleFillSymbol();
            symbol.setColor(new Color([255, 0, 0]));
            
            var opacityBreakRenderer = new ClassBreaksRenderer(symbol);
            var stops = [];
            array.forEach(result.classBreakInfos, function(classBreakInfo, i){
                var opacity = 1-((result.classBreakInfos.length -i)/result.classBreakInfos.length);
                stops.push({ value: classBreakInfo.maxValue, opacity: opacity });
            });
            console.log(stops);
            opacityBreakRenderer.setOpacityInfo({
                 field:"MEDHINC_CY",
                 stops: stops
            });
           
            //CountyDemogrpahicsLayer.setRenderer(classBreakRenderer);
            //CountyDemogrpahicsLayer.setRenderer(continuousRenderer);
            //CountyDemogrpahicsLayer.setRenderer(colorBreakRenderer);
            CountyDemogrpahicsLayer.setRenderer(opacityBreakRenderer);
        }).otherwise(function (error) {
            console.log("An error occurred while calculating %s, Error: %o", "class breaks", error);
        });
        */
    });
});