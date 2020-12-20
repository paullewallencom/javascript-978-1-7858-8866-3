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
	"esri/symbols/SimpleLineSymbol",
	"esri/symbols/CartographicLineSymbol",
	"esri/symbols/PictureMarkerSymbol",
	"esri/symbols/SimpleFillSymbol",
	"esri/renderers/SimpleRenderer",
	"esri/renderers/UniqueValueRenderer",
	"esri/geometry/webMercatorUtils",
	"esri/Color",
	"esri/InfoTemplate",
    "dojo/on",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojox/charting/Chart",
	"dojox/charting/themes/Bahamation",
    "dojo/_base/array",
    "dojo/promise/all",
    "dojo/topic",
    "appWidgets/HurricaneWidget/ActiveHurricaneDetails",
	"appWidgets/WeatherWidget/CurrentWeatherDetails",
	"esri/dijit/Gauge",
    "esri/geometry/geometryEngine",
    "dojo/domReady!"],
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
		SimpleLineSymbol,
		CartographicLineSymbol,
		PictureMarkerSymbol,
		SimpleFillSymbol,
		SimpleRenderer,
		UniqueValueRenderer,
		webMercatorUtils,
		Color,
		InfoTemplate,
		on,
		domClass,
		domConstruct,
		Chart,
		theme,
		array,
		all,
		topic,
		ActiveHurricaneWidget,
		CurrentWeatherDetails,
		Gauge,
         geometryEngine
	) {
		ready(function () {

			esriConfig.defaults.io.proxyUrl = "/proxy/proxy.ashx";
			esriConfig.defaults.io.alwaysUseProxy = true;

			parser.parse();

			var hurricaneWidget = new ActiveHurricaneWidget({}, "hurricaneWidgetCon");


			var fill = new SimpleFillSymbol("solid", null, new Color("#A4CE67"));
			var windDataURL = "http://livefeeds.arcgis.com/arcgis/rest/services/LiveFeeds/NOAA_METAR_current_wind_speed_direction/MapServer";

			var activeHurricaneURL = "http://livefeeds.arcgis.com/arcgis/rest/services/LiveFeeds/Hurricane_Active/MapServer";
			
			var map = BootstrapMap.create("mapDiv", {
				basemap: "dark-gray",
				showAttribution: false,
				wrapAround180: true
			});

			//Get the extent
			var queryTask = new QueryTask("http://livefeeds.arcgis.com/arcgis/rest/services/LiveFeeds/Hurricane_Active/MapServer/4");
			var query = new Query();

            query.returnGeometry = true;
			var num = Math.random();
			var _bust_cache_query_string = "(" + num.toString() + "=" + num.toString() + ")";

			query.where = "1=1 AND " + _bust_cache_query_string;

			queryTask.execute(query, function (result) {
                var geometries = [];
                array.forEach(result.features, function(feature){
                    geometries.push(feature.geometry);
                });
                var union_geom = geometryEngine.union(geometries);
                map.setExtent(union_geom.getExtent().expand(5));
				console.log(result);
			});


			map.setExtent(new Extent({
				type: "extent",
				xmin: 100187507373310.45,
				ymin: -6731350.458904011,
				xmax: 100187534103033.48,
				ymax: 5342031.032792939,
				"spatialReference": {
					"wkid": 102100,
					"latestWkid": 3857
				}
			}));

			var center = map.extent.getCenter();
			var normalizedVal = webMercatorUtils.xyToLngLat(center.x, center.y);
			console.log(normalizedVal);
            
            on(map, "load", function(){
                var weatherWidget = new CurrentWeatherDetails({
                    lon: normalizedVal[0],
                    lat: normalizedVal[1],
                    map: map
                }, "weatherWidgetCon");
            });


			map.infoWindow.resize(430, 280);

			$(document).ready(function () {

				$('.clickable').on('click', function () {
					var effect = $(this).data('effect');
					$(this).closest('.panel')[effect]();
				});

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



				$("#liveStatusMenu li").click(function (e) {
					$(".panelCon").each(function () {
						if ($($(this).find(".panel-titletext")[0]).text() === e.target.text) {
							$(this).show();
						}
					});
				});

				/*
						Forecast Positions (0)
						Past Positions (1)
						Forecast Track (2)
						Observed Track (3)
						Forecast Error Cone (4)
						Watches and Warnings (5)
						*/

				var layerDict = [
					{
						title: "Forecast Error Cone",
						URL: activeHurricaneURL + "/4"
					},
					{
						title: "Forecast Tracks",
						URL: activeHurricaneURL + "/2"
					},
					{
						title: "Observed Track",
						URL: activeHurricaneURL + "/3"
					},
					{
						title: "Watches and Warnings",
						URL: activeHurricaneURL + "/5"
					},
					{
						title: "Forecast Positions",
						URL: activeHurricaneURL + "/0"
					},
					{
						title: "Past Positions",
						URL: activeHurricaneURL + "/1"
					},
					{
						title: "Wind Data",
						URL: windDataURL + "/0"
					}
				];

				layerDict = array.map(layerDict, function (item) {
					var featLayer = new FeatureLayer(item.URL, {
						mode: FeatureLayer.MODE_ONDEMAND,
						outFields: ["*"]
							//infoTemplate: infoTemplate
					});
					map.addLayer(featLayer);
					item.layer = featLayer;
					return item;
				});
				var legendParams = {
					map: map
				};

				var legend = new Legend(legendParams, 'legend');
				legend.startup();


				var defaultSymbol = new SimpleFillSymbol().setStyle(SimpleFillSymbol.STYLE_NULL);
				defaultSymbol.outline.setStyle(SimpleLineSymbol.STYLE_NULL);
				var renderer = new UniqueValueRenderer(defaultSymbol, "FCSTPRD");

				//add symbol for each possible value
				renderer.addValue('72', new SimpleFillSymbol().setColor(new Color([255, 0, 0, 0.5])));
				renderer.addValue('120', new SimpleFillSymbol().setColor(new Color([255, 255, 0, 0.5])));

				var foreCastErrorConeFeatureLayer = array.filter(layerDict, function (item) {
					return item.title === "Forecast Error Cone";
				})[0].layer;

				var forecastTrackLayer = array.filter(layerDict, function (item) {
					return item.title === "Forecast Tracks";
				})[0].layer;

				var windFeatureLayer = array.filter(layerDict, function (item) {
					return item.title === "Wind Data";
				})[0].layer;

				var pastPositionLayer = array.filter(layerDict, function (item) {
					return item.title === "Past Positions";
				})[0].layer;


				var pastPositionSymbol = new PictureMarkerSymbol({
					"angle": 0,
					"type": "esriPMS",
					"url": "http://static.arcgis.com/images/Symbols/Basic/RedFlag.png",
					"contentType": "image/png",
					"width": 12,
					"height": 12
				});

				var pastPositionRenderer = new SimpleRenderer(pastPositionSymbol);
				pastPositionLayer.setRenderer(pastPositionRenderer);

				var windGaugeParams = {
					caption: "Wind Speed Meter",
					dataFormat: "value",
					dataField: 'WIND_SPEED',
					dataLabelField: "STATION_NAME",
					layer: windFeatureLayer,
					color: "#F00",
					maxDataValue: 80,
					title: 'Station Name',
					unitLabel: " mph"
				};
				var windGauge = new Gauge(windGaugeParams, "gauge");
				windGauge.startup();

				// lineSymbol used for freehand polyline, polyline and line. 
				var lineSymbol = new CartographicLineSymbol(
					CartographicLineSymbol.STYLE_DASHDOT,
					new Color([255, 255, 0]), 5,
					CartographicLineSymbol.CAP_ROUND,
					CartographicLineSymbol.JOIN_MITER, 5
				);
				var CartoLineRenderer = new SimpleRenderer(lineSymbol);


				console.log(foreCastErrorConeFeatureLayer);
				foreCastErrorConeFeatureLayer.setRenderer(renderer);
				forecastTrackLayer.setRenderer(CartoLineRenderer);

				var scalebar = new Scalebar({
					map: map,
					scalebarUnit: "dual"
				});
			});
		});
	});