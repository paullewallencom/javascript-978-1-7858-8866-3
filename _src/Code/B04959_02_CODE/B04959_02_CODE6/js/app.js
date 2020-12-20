require([
        "esri/map",
        "esri/dijit/BasemapGallery",
        "esri/dijit/Legend",
        "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/FeatureLayer",
        "dojo/on",
        "dojo/domReady!"],
	function (
        Map,
		BasemapGallery,
		Legend,
		ArcGISTiledMapServiceLayer,
		ArcGISDynamicMapServiceLayer,
		FeatureLayer,
		on) {
		var map = new Map("mapDiv", {
			showAttribution: false,
			logo: false
		});
		var tileMap = new ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer");
		var worldCities = new ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/SampleWorldCities/MapServer", {
			"id": "worldCities",
			"opacity": 0.5,

		});
		worldCities.setVisibleLayers([0]);
		worldCities.setLayerDefinitions(["POP > 1000000"]);
		var earthQuakeLayerURL = 'http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/hazards/MapServer/5';
		var earthQuakeLayer = new FeatureLayer(earthQuakeLayerURL, {
			id: "Earthquake Layer",
			outFields: ["EQ_MAGNITUDE", "INTENSITY", "COUNTRY", "LOCATION_NAME", "DAMAGE_DESCRIPTION", "DATE_STRING"],
			opacity: 0.5,
			mode: FeatureLayer.MODE_ONDEMAND,
			definitionExpression: "EQ_MAGNITUDE > 6",
		});
		map.addLayers([tileMap, worldCities, earthQuakeLayer]);
		on(map, "layers-add-result", function (evt) {
			var basemapGallery = new BasemapGallery({
				showArcGISBasemaps: true,
				map: map
			}, "basemapGalleryDiv");
			basemapGallery.startup();

			var legendDijit = new Legend({
				map: map,
			}, "legendDiv");
			legendDijit.startup();
		});



	});

//topo - http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer