require([
	"dojo/ready",
	"dojo/parser",
	"esri/map",
	"application/bootstrapmap",
	"esri/geometry/Extent",
	"esri/dijit/Legend",
	"esri/config",
	"esri/layers/ArcGISDynamicMapServiceLayer",
	"esri/layers/FeatureLayer",
    "esri/renderers/SimpleRenderer",
    "esri/renderers/UniqueValueRenderer",
    "esri/renderers/ClassBreaksRenderer",
    "esri/renderers/HeatmapRenderer",
    "esri/renderers/DotDensityRenderer",
    "esri/Color",
    "esri/InfoTemplate",
	"dojo/domReady!"
],
    function (
        ready,
        parser,
        Map,
        BootstrapMap,
        Extent,
        Legend,
        esriConfig,
        ArcGISDynamicMapServiceLayer,
        FeatureLayer,
        SimpleRenderer,
        UniqueValueRenderer,
        ClassBreaksRenderer,
        HeatmapRenderer,
        DotDensityRenderer,
        Color,
        InfoTemplate
    ) {
        'use strict';
        ready(function () {

            esriConfig.defaults.io.proxyUrl = "/proxy/proxy.ashx";
            esriConfig.defaults.io.alwaysUseProxy = true;

            parser.parse();
            var map = BootstrapMap.create("mapDiv", {
                basemap: "dark-gray",
                showAttribution: false,
                wrapAround180: true
            });
            var streamLyrURL = "http://livefeeds.arcgis.com/arcgis/rest/services/LiveFeeds/StreamGauge/MapServer/0";

            var content = "<b>GAUGELID</b>: ${GAUGELID}" +
                          "<br><b>FLOOD</b>: ${FLOOD}";
            var infoTemplate = new InfoTemplate("${GAUGELID}", content);

            var streamLyr = new FeatureLayer(streamLyrURL, {
                mode: FeatureLayer.MODE_ONSELECTION,
                outFields : ["*"],
                infoTemplate: infoTemplate
            });

            map.setExtent(new Extent({
                "type": "extent",
                "xmin": -16916431.6038445,
                "ymin": 395608.46657766233,
                "xmax": -3551570.082241555,
                "ymax": 6432299.212426137,
                "spatialReference": {
                    "wkid": 102100,
                    "latestWkid": 3857
                }
            }));

            map.addLayers([streamLyr]);

            $(document).ready(function () {
                $("#panelMenuItems li").click(function (e) {
                var rendererJson = null;
                switch (e.target.text) {
                    case "Simple Renderer":

                        var rendererJson = {
                            "type": "simple",
                            "label": "",
                            "description": "",
                            "symbol": {
                                "color": [210, 105, 30, 191],
                                "size": 6,
                                "angle": 0,
                                "xoffset": 0,
                                "yoffset": 0,
                                "type": "esriSMS",
                                "style": "esriSMSCircle",
                                "outline": {
                                    "color": [0, 0, 128, 255],
                                    "width": 0,
                                    "type": "esriSLS",
                                    "style": "esriSLSSolid"
                                }
                            }
                        };
                        var renderer = new SimpleRenderer(rendererJson);
                        break;
                    case "Unique Value Renderer":
                        var rendererJson = {
                            "type": "uniqueValue",
                            "field1": "STAGE",
                            "defaultSymbol": {},
                            "uniqueValueInfos": [{
                                "value": "major",
                                "symbol": {
                                    "color": [163,193,163, 191],
                                    "size": 6,
                                    "type": "esriSMS",
                                    "style": "esriSMSCircle"
                                }
                                        }, {
                                "value": "moderate",
                                "symbol": {
                                    "color": [253,237,178, 191],
                                    "size": 6,
                                    "type": "esriSMS",
                                    "style": "esriSMSCircle"
                                }
                                        }, {
                                "value": "minor",
                                "symbol": {
                                    "color": [242,226,206, 191],
                                    "size": 6,
                                    "type": "esriSMS",
                                    "style": "esriSMSCircle"
                                }
                                        }, {
                                "value": "action",
                                "symbol": {
                                    "color": [210, 105, 30, 191],
                                    "size": 6,
                                    "type": "esriSMS",
                                    "style": "esriSMSCircle"
                                }
                                        }]
                        };
                        var renderer = new UniqueValueRenderer(rendererJson);
                        break;
                    case "Class Breaks Renderer":
                        var rendererJson = {
                            "type": "classBreaks",
                            "field": "FLOOD",
                            "defaultSymbol": {
                                "color": [210, 105, 30, 5],
                                "size": 6,
                                "type": "esriSMS",
                                "style": "esriSMSCircle"
                            },
                            "defaultLabel": "Nothing",
                            "classBreakInfos": [{
                                "classMinValue": 0,
                                "classMaxValue": 1000,
                                "label": "0-1000",
                                "symbol": {
                                    "color": [163, 193, 163, 191],
                                    "size": 6,
                                    "type": "esriSMS",
                                    "style": "esriSMSCircle"
                                }
                                        }, {
                                "classMinValue": 1000,
                                "classMaxValue": 3000,
                                "label": "1000-3000",
                                "symbol": {
                                    "color": [253, 237, 178, 191],
                                    "size": 6,
                                    "type": "esriSMS",
                                    "style": "esriSMSCircle"
                                }
                                        }, {
                                "classMinValue": 3000,
                                "classMaxValue": 5000,
                                "label": "3000-5000",
                                "symbol": {
                                    "color": [242, 226, 206, 191],
                                    "size": 6,
                                    "type": "esriSMS",
                                    "style": "esriSMSCircle"
                                }
                                        }, {
                                "classMinValue": 6000,
                                "classMaxValue": 10000,
                                "label": "6000-10000",
                                "symbol": {
                                    "color": [210, 105, 30, 191],
                                    "size": 6,
                                    "type": "esriSMS",
                                    "style": "esriSMSCircle"
                                }
                                        }]
                        };
                        var renderer = new ClassBreaksRenderer(rendererJson);
                        break;
                    case "Heatmap Renderer":
                        var renderer = new HeatmapRenderer({
                            colors: ["rgba(0, 0, 250, 0)", "rgb(0, 0, 250)", "rgb(250, 0, 250)", "rgb(250, 0, 0)"],
                            blurRadius: 10,
                            maxPixelIntensity: 230,
                            minPixelIntensity: 8
                        });
                        break;
                    case "Dot Density Renderer":
                        var renderer = new DotDensityRenderer({
                        fields: [{
                                name: "FLOOD",
                                color: new Color([210, 105, 30, 25])
                                    }],
                            dotValue: 500,
                            dotSize: 2
                        });
                        break;
                }
                streamLyr.setRenderer(renderer);
                streamLyr.redraw();
                legend.refresh();
            });

                
                $('.clickable').on('click', function () {
                    var effect = $(this).data('effect');
                    $(this).closest('.panel')[effect]();
                });


                $("#toolsMenu li").click(function (e) {
                    $(".panelCon").each(function () {
                        if ($($(this).find(".panel-titletext")[0]).text() === e.target.text) {
                            $(this).show();
                            $(this).fadeTo("slow", 1);
                        }
                    });
                });

                var legendParams = {
                        map: map
                    },
                legend = new Legend(legendParams, 'legend');
                legend.startup();
            });
        });
    });