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
	"esri/dijit/FeatureTable",
	"esri/tasks/QueryTask",
	"esri/tasks/query",
	"esri/tasks/IdentifyTask",
	"esri/tasks/IdentifyParameters",
	"esri/tasks/FindTask",
	"esri/tasks/FindParameters",
    "appWidgets/SpatialQuery/spatialquery",
    "esri/InfoTemplate",
	"dojo/dom",
	"dojo/on",
    "dojo/dom-class",
    "dojo/dom-style",
	"dojo/_base/array",
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
        FeatureTable,
        QueryTask,
        Query,
        IdentifyTask,
        IdentifyParameters,
        FindTask,
        FindParameters,
        Spatialquery,
        InfoTemplate,
        dom,
        on,
        domClass,
        domStyle,
        array
    ) {
        'use strict';
        ready(function () {

            esriConfig.defaults.io.proxyUrl = "/proxy/proxy.ashx";
            esriConfig.defaults.io.alwaysUseProxy = true;

            parser.parse();
            // Get a reference to the ArcGIS Map class
            var map = BootstrapMap.create("mapDiv", {
                basemap: "dark-gray",
                showAttribution: false,
                wrapAround180: true
            });
            var wildfirePotentialURL = "http://maps7.arcgisonline.com/arcgis/rest/services/USDA_USFS_2014_Wildfire_Hazard_Potential/MapServer";
            var wildFirePotentialLyr = new ArcGISDynamicMapServiceLayer(wildfirePotentialURL);
            var wildFireActivityURL = "http://livefeeds.arcgis.com/arcgis/rest/services/LiveFeeds/Wildfire_Activity/MapServer/0";
            
            //var infoTemplate = new InfoTemplate("${FIRE_NAME}", "${*}");
            var content = "<b>STATE</b>: ${STATE}" +
                          "<br><b>FireName</b>: ${FIRE_NAME}" + 
                          "<br><b>Area</b>: ${AREA_} ${AREA_MEAS}";
            var infoTemplate = new InfoTemplate("${FIRE_NAME}", content);
            
            var wildFireActivityLyr = new FeatureLayer(wildFireActivityURL, {
                mode: FeatureLayer.MODE_ONSELECTION,
                infoTemplate: infoTemplate,
                outFields: ["*"]
            });
            var find = new FindTask("http://livefeeds.arcgis.com/arcgis/rest/services/LiveFeeds/Wildfire_Activity/MapServer");

            var params = new FindParameters();
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



            map.addLayers([wildFirePotentialLyr, wildFireActivityLyr]);

            var identifyHandle = null;
            on(dom.byId("btnIdentify"), "click", function () {
                if (domClass.contains(this, "btn-default")) {
                    domClass.remove(this, "btn-default");
                    domClass.add(this, "btn-primary");

                    //do identify
                    identifyHandle = map.on("click", function (evt) {
                        var identifyParams = new IdentifyParameters();
                        identifyParams.geometry = evt.mapPoint;
                        identifyParams.tolerance = 1;
                        identifyParams.mapExtent = map.extent;
                        var identifyDeferred = identifyTask.execute(identifyParams);
                        identifyDeferred.then(function (result) {
                            dom.byId("idResults").innerHTML = result.length ? (result[0].feature.attributes.CLASS_DESC ? 'Wildfire Potential: <br/>' + result[0].feature.attributes.CLASS_DESC.split(':')[1] : '') : '';
                        }, function (err) {
                            console.log(err);
                        });
                    });
                    map.setMapCursor("pointer");
                    domStyle.set(dom.byId("idResults"), "display", "block");
                } else {
                    domClass.remove(this, "btn-primary");
                    domClass.add(this, "btn-default");

                    identifyHandle.remove();
                    map.setMapCursor("default");
                    domStyle.set(dom.byId("idResults"), "display", "none");
                }
            });


            on(dom.byId("findBtn"), "click", function () {
                params.layerIds = [0];
                params.searchFields = ["STATE", "Fire Name"];
                params.searchText = dom.byId("findTxt").value;
                var findTaskDeferred = find.execute(params);
                findTaskDeferred.then(function (result) {
                    var tblString = '<table class="table table-striped table-hover">';
                    tblString += '<thead><tr><th>FIRE NAME</th>';
                    tblString += '<th>STATE</th>';
                    tblString += '<th>LOCATION</th>';
                    array.forEach(result, function (searchitem) {
                        tblString += '<tr><td>' + searchitem.feature.attributes["Fire Name"] + '</td>';
                        tblString += '<td>' + searchitem.feature.attributes["State"] + '</td>';
                        tblString += '<td> (' + searchitem.feature.attributes["Longitude"] + ',' + searchitem.feature.attributes["Latitude"] + ')</td> </tr>';
                    });
                    tblString += '</tbody> </table > ';
                    dom.byId("FindTbl").innerHTML = tblString;
                }, function (err) {
                    console.log(err);
                });
            });


            var queryTask = new QueryTask(wildFireActivityURL);
            var query = new Query();
            var identifyTask = new IdentifyTask(wildfirePotentialURL);
            var featureTable = new FeatureTable({
                    featureLayer: wildFireActivityLyr,
                    map: map,
                    gridOptions: {
                        allowSelectAll: true,
                        allowTextSelection: true
                    },
                    zoomToSelection: true,
                    outFields: ["FIRE_NAME", "STATE", "LATITUDE", "LONGITUDE"]
                }, 'featTbl');

            featureTable.startup();
            
            on(map, "load", function(){
                var spatialquery = new Spatialquery({
                    map: map
                }, "spatialqueryspan");
                spatialquery.startup();
            });
            
            on(dom.byId("queryTxt"), "keypress", function () {
                dom.byId("FeatCountDiv").style.display = "none";
                dom.byId("QueryTbl").innerHTML = '';
            });
            on(dom.byId("queryBtn"), "click", function () {
                query.outFields = ["FIRE_NAME", "STATE", "LATITUDE", "LONGITUDE"];
                query.returnGeometry = false;
                query.geometry = map.extent;
                query.where = dom.byId("queryTxt").value || "1=1";
                var queryCountDeferred = queryTask.executeForCount(query);
                queryCountDeferred.then(function (count) {
                    dom.byId("FeatCountDiv").style.display = "block";
                    dom.byId("featCountLbl").innerHTML = "Result: " + count + " Features";
                }, function (err) {
                    console.log(err);
                });

            });

            on(dom.byId("execQueryBtn"), "click", function () {
                var queryDeferred = queryTask.execute(query);
                queryDeferred.then(function (result) {
                    var tblString = '<table class="table table-striped table-hover">';
                    tblString += '<thead><tr><th>FIRE NAME</th>';
                    tblString += '<th>STATE</th>';
                    tblString += '<th>LOCATION</th>';
                    array.forEach(result.features, function (feature) {
                        tblString += '<tr><td>' + feature.attributes.FIRE_NAME + '</td>';
                        tblString += '<td>' + feature.attributes.STATE + '</td>';
                        tblString += '<td> (' + feature.attributes.LONGITUDE + ',' + feature.attributes.LATITUDE + ')</td> </tr>';
                    });
                    tblString += '</tbody> </table > ';
                    dom.byId("QueryTbl").innerHTML = tblString;
                }, function (err) {
                    dom.byId("QueryTbl").innerHTML = err;
                });
            });



            $(document).ready(function () {

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