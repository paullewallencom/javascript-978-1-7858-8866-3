define([
    //class
    "dojo/_base/declare",
    "dojo/_base/lang",

    //widgit class
    "dijit/_WidgetBase",

    //templated widgit
    "dijit/_TemplatedMixin",

    //loading template file
    "dojo/text!appWidgets/SpatialQuery/template/_spatialquery.html",

    "dojo/on",
	"dijit/a11yclick",
    "dojo/dom-style",
    "esri/toolbars/draw",
    "esri/tasks/query",
	"esri/tasks/QueryTask",
	"esri/layers/FeatureLayer",
"esri/InfoTemplate",
    "dojo/dom-class",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
	"esri/symbols/PictureMarkerSymbol",
    "esri/graphic",
    "dojo/_base/Color",

    "dojo/domReady!"
], function (
	declare,
	lang,
	_WidgetBase,
	_TemplatedMixin,
	dijitTemplate,
	on,
	a11yclick,
	domStyle,
	Draw,
	Query,
	QueryTask,
	FeatureLayer,
	InfoTemplate,
	domClass,
	SimpleFillSymbol,
	SimpleLineSymbol,
	PictureMarkerSymbol,
	Graphic, Color) {
	return declare("hazardeventwidget", [_WidgetBase, _TemplatedMixin], {
		//assigning html template to template string
		templateString: dijitTemplate,
		isDrawActive: false,
		map: null,
		tbDraw: null,
		wildFireActivityURL: 'http://livefeeds.arcgis.com/arcgis/rest/services/LiveFeeds/Wildfire_Activity/MapServer/0',
		constructor: function (options, srcRefNode) {
			this.map = options.map;
		},
		startup: function () {},
		postCreate: function () {
			this.inherited(arguments);
			// events
			this.own(
				/* setup an event handler (automatically remove() when destroyed) */
				on(this.btndrawpoly, 'click', lang.hitch(this, this.toggleDraw)),
				on(this.btnclear, 'click', lang.hitch(this, function () {
					this.map.graphics.clear();
					this.tbcontent.innerHTML = '';
				}))
			);
			this.tbDraw = new Draw(this.map);
			this.tbDraw.on("draw-end", lang.hitch(this, this.querybyGeometry));
		},
		toggleDraw: function () {
			domClass.toggle(this.btndrawpoly, "btn-danger");
			if (!this.isDrawActive) {
				this.tbDraw.activate(Draw.POLYGON);
				this.isDrawActive = true;
			} else {
				this.tbDraw.deactivate();
				this.isDrawActive = false;
			}
		},
		querybyGeometry: function (evt) {
			this.tbDraw.deactivate();
			this.toggleDraw();
			this.isDrawActive = false;
			this.isBusy(true);

			var geometryInput = evt.geometry;
			var tbDrawSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 255, 0]), 2), new Color([255, 255, 0, 0.2]));

			this.map.graphics.clear();
			var graphicPolygon = new Graphic(geometryInput, tbDrawSymbol);

			this.map.graphics.add(graphicPolygon);
			//Getting the data
			var queryTask = new QueryTask(this.wildFireActivityURL);
			var query = new Query();
			query.where = "1=1";
			query.geometry = geometryInput;
			query.returnGeometry = true;
			query.outFields = ["FIRE_NAME", "STATE", "AREA_", "AREA_MEAS"];
			var queryDeferred = queryTask.execute(query);
			var symbolSelected = new PictureMarkerSymbol({
				"angle": 0,
				"xoffset": 0,
				"yoffset": 0,
				"type": "esriPMS",
				"url": "images/fire_sel.png",
				"contentType": "image/png",
				"width": 24,
				"height": 24
			});
			queryDeferred.then(lang.hitch(this,
					function (result) {
						this.map.graphics.clear();
						var str = '';
						for (var i = 0; i < result.features.length; i++) {
							var featAttr = result.features[i].attributes;
							var featGeom = result.features[i].geometry;
							var infoTemplate = new InfoTemplate(featAttr.FIRE_NAME, "Area:" + featAttr.AREA_);
							var selectionGraphic = new Graphic(featGeom, symbolSelected, null, infoTemplate);
							this.map.graphics.add(selectionGraphic);
							str = str + '<tr><th scope="row">' + (i + 1) + '</th><td>' + featAttr.FIRE_NAME + '</td><td>' + featAttr.STATE + '</td><td>' + featAttr.AREA_ + " " + featAttr.AREA_MEAS + '</td></tr>';
						}
						this.map.infoWindow.show();
						this.tbcontent.innerHTML = str;
						this.isBusy(false);
					}),
				function (err) {
					/*Error handler*/
					console.log(err);
					this.isBusy(false);
				});
		},
		isBusy: function (isBusy) {
			if (isBusy) {
				domStyle.set(this.loadingdiv, 'display', 'block');
			} else {
				domStyle.set(this.loadingdiv, 'display', 'none');
			}

		}
	});
});