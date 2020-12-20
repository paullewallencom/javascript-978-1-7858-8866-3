require(["esri/map",
        "esri/dijit/Scalebar",
        "application/bootstrapmap",
         "esri/layers/ArcGISDynamicMapServiceLayer",
         "esri/config",
         "dojo/on",
         "esri/geometry/Extent",
         "esri/TimeExtent", "esri/dijit/TimeSlider",
         "dojo/dom",
         "dojo/_base/array",
         "dojo/topic",
         "esri/tasks/IdentifyTask",
        "esri/tasks/IdentifyParameters",
         "esri/tasks/QueryTask",
        "esri/tasks/query",
        "dojo/domReady!",
        "application/d3-slider",
        "application/drought-history-timeline"],
    function (Map, Scalebar, BootstrapMap, ArcGISDynamicMapServiceLayer, esriConfig, on, Extent, TimeExtent, TimeSlider, dom, array, topic, IdentifyTask, IdentifyParameters,QueryTask, Query) {

        var map = BootstrapMap.create("mapDiv", {
            basemap: "dark-gray",
            extent: new esri.geometry.Extent({
                "xmin": -17599814.30461256,
                "ymin": 1061280.3776862216,
                "xmax": -4234952.783009613,
                "ymax": 6863156.572642697,
                "spatialReference": {
                    "wkid": 102100
                }
            })

        });
        esriConfig.defaults.io.proxyUrl = "/proxy/proxy.ashx";
        esriConfig.defaults.io.alwaysUseProxy = true;

        var droughtcMapServiceLayer = new ArcGISDynamicMapServiceLayer("http://earthobs1.arcgis.com/arcgis/rest/services/US_Drought/MapServer");

        map.addLayer(droughtcMapServiceLayer);

        /*
        on(map, "extent-change", function (evt) {
            console.log(evt.extent);
        });
        */

        topic.subscribe("application/d3slider/timeChanged", function () {
            console.log("received:", arguments);
            var startDate = arguments[0];
            if (startDate) {
                var timeExtent = new TimeExtent();
                timeExtent.startTime = startDate;
                map.setTimeExtent(timeExtent);
            }
        });

        on(droughtcMapServiceLayer, "load", function (evt) {
            var start = evt.layer.timeInfo.timeExtent.startTime;
            var end = evt.layer.timeInfo.timeExtent.endTime;
            _createEsriTimeSlider(evt);

            //setting th initial text
            var startValString = start.getUTCFullYear();
            var endValString = end.getUTCFullYear();
            dom.byId("daterange").innerHTML = "<i>" + startValString + " and " + endValString + "<\/i>";

            topic.publish("application/d3slider/initialize", start, end);
        });
           
        function doIdentify (event) {
            map.graphics.clear();
            identifyParams.geometry = event.mapPoint;
            identifyParams.mapExtent = map.extent;
            identifyTask.execute(identifyParams, function (results) {
            console.log(results[0].feature.attributes);
            var queryTask = new QueryTask("http://earthobs1.arcgis.com/arcgis/rest/services/US_Drought_by_County/FeatureServer/0");
            var query = new Query();
  query.returnGeometry = true;
  query.outFields = ["*"];
                query.where = "countycategories_admin_fips = '"+results[0].feature.attributes.ID+"'";
                query.orderByFields = ["countycategories_date"];
                queryTask.execute(query).then(function(qresult){
                    console.log(qresult);
                    topic.publish("some/topic", qresult);
                });

            });
          }

    function initIdentify () {
            map.on("click", doIdentify);
            
            //http://www.arcgis.com/home/item.html?id=c7b42e6032074cecae8e1c4a4feacbc7
            identifyTask = new IdentifyTask("http://server.arcgisonline.com/arcgis/rest/services/Demographics/USA_1990-2000_Population_Change/MapServer");

            identifyParams = new IdentifyParameters();
            identifyParams.tolerance = 1;
            identifyParams.layerIds = [3];
            identifyParams.returnGeometry = true;
            identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
            identifyParams.width = map.width;
            identifyParams.height = map.height;
    }
    initIdentify();
    
        function _createEsriTimeSlider(evt) {
            /*Time Slider*/
            var timeSlider = new TimeSlider({
                style: "width: 100%;"
            }, dom.byId("timeSliderDiv"));
            map.setTimeSlider(timeSlider);

            /*
            var timeExtent = new TimeExtent();
            timeExtent.startTime = start;
            timeExtent.endTime = end;
            */
            var layerTimeExtent = evt.layer.timeInfo.timeExtent;

            timeSlider.setThumbCount(1);
            timeSlider.createTimeStopsByTimeInterval(layerTimeExtent, 1, "esriTimeUnitsYears");
            //timeSlider.setThumbIndexes([0, 1]);
            timeSlider.setThumbMovingRate(2000);
            timeSlider.startup();

            //add labels for every other time stop
            var labels = array.map(timeSlider.timeStops, function (timeStop, i) {
                if (i % 2 === 0) {
                    return timeStop.getUTCFullYear();
                } else {
                    return "";
                }
            });

            timeSlider.setLabels(labels);

            timeSlider.on("time-extent-change", function (evt) {
                //update the text
                //var startValString = evt.startTime.getUTCFullYear();
                var endValString = evt.endTime.getUTCFullYear();
                dom.byId("daterange").innerHTML = "<i>" + endValString + "<\/i>";


            });
            /*
			on(droughtcMapServiceLayer, "update-start", function (evt) {
				timeSlider.pause();


			});
			on(droughtcMapServiceLayer, "update-end", function (evt) {
				timeSlider.play()

			});
            */

        }


        //_createEsriTimeSlider(new Date("1/4/2000 UTC"), new Date("2/31/2016 UTC"));


        var scalebar = new Scalebar({
            map: map,
            scalebarUnit: "dual"
        });

        $(document).ready(function () {
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
                case "Open Street Map":
                    map.setBasemap("osm");
                    break;
                }
            });

            $('.clickable').on('click', function () {
                var effect = $(this).data('effect');
                $(this).closest('.panel')[effect]();
            })

            $("#panelMenuItems li").click(function (e) {
                $(".custom_panel").each(function (i) {
                    if ($($(this).find(".panel-titletext")[0]).text() === e.target.text) {
                        $(this).show()
                    }
                });
            });
        });
    });