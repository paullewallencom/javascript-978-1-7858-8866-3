define([
'dojo/text!./templates/CurrentWeatherDetails.html',

'dojo/_base/declare',
'dojo/dom-attr',
'esri/request',
'dojo/date/locale',
'dijit/_WidgetBase',
'dijit/_TemplatedMixin',
"dojo/_base/lang",
"esri/geometry/geometryEngine",
    "esri/geometry/Point",
    "esri/SpatialReference",
    "esri/symbols/SimpleFillSymbol",
    "esri/Color",
    "esri/graphic",
    "esri/geometry/webMercatorUtils"
], function (
	template,
	declare,
	domAttr,
	esriRequest,
	dateLocale,
	_WidgetBase,
	_TemplatedMixin,
	lang,
     geometryEngine,
     Point,
     SpatialReference,
     SimpleFillSymbol,
     Color,
     Graphic,
     webMercatorUtils
) {
	return declare([_WidgetBase, _TemplatedMixin], {
		// description:
		//    Active Hurricane Details
		url: "http://api.openweathermap.org/data/2.5/weather?",
		apikey: "e453908c8f549931c01cbd2744ba51af",
		lon: 0,
		lat: 0,

		templateString: template,
		//baseClass: 'active-hurricane-details',

		// Properties to be sent into constructor

		getLocation: function () {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(lang.hitch(this, this.showPosition));
			} else {
				console.log("Geolocation is not supported by this browser.");
			}
		},

		showPosition: function (position) {
			console.log(position);
			this.accuracy = position.coords.accuracy;
			this.lat = position.coords.latitude;
			this.lon = position.coords.longitude;
            
            //error circle
            var location_geom = new Point(this.lon, this.lat, new SpatialReference({ wkid: 4326 }));
            var loc_geom_proj = webMercatorUtils.geographicToWebMercator(location_geom);
            var location_buffer = geometryEngine.geodesicBuffer(loc_geom_proj, this.accuracy, "meters", false);
            
            console.log(location_buffer);
            var symbol = new SimpleFillSymbol().setColor(new Color([255, 0, 0, 0.5]));
            this.map.graphics.add(new Graphic(location_buffer, symbol));
            //this.map.setExtent(location_buffer.getExtent());
			this.getWeatherData();
            
		},

		constructor: function (options, srcRefNode) {
			this.domNode = srcRefNode;
			this.lon = options.lon;
			this.lat = options.lat;
            this.map = options.map;
            
            this.getLocation();
		},

		/*
		{"coord":{"lon":138.93,"lat":34.97},
		"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],
		"base":"cmc stations","main":{"temp":282.343,"pressure":1033.99,"humidity":100,"temp_min":282.343,"temp_max":282.343,"sea_level":1043.96,"grnd_level":1033.99},"wind":{"speed":5.66,"deg":78.0013},"clouds":{"all":68},"dt":1456093822,"sys":{"message":0.0109,"country":"JP","sunrise":1456003419,"sunset":1456043556},"id":1851632,"name":"Shuzenji","cod":200}
				weather
				windSpeed
				cloudiness
				pressure
				humidity
				sunrise
				sunset
				coords
		*/
		getWeatherData: function () {
			var that = this;

			var request = esriRequest({
				// Location of the data
				url: this.url + 'lat=' + this.lat + '&lon=' + this.lon + '&appid=' + this.apikey,
				// Service parameters if required, sent with URL as key/value pair
				// Data format
				handleAs: "json"
			});

			request.then(function (data) {
					console.log("Data: ", data);
					that.weather.innerHTML = Math.round(data.main.temp - 270) + " deg C " +
						data.weather[0].main + ' (' + data.weather[0].description + ')';
					var imagePath = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
					// Set the image 'src' attribute
					domAttr.set(that.weatherIcon, "src", imagePath);
					that.windSpeed.innerHTML = data.wind.speed + ' kmph';
					that.cloudiness.innerHTML = data.clouds.all + ' %';
					that.pressure.innerHTML = data.main.pressure;
					that.humidity.innerHTML = data.main.humidity + ' %';
					that.pressure.innerHTML = data.main.pressure + ' Pa'
					that.sunrise.innerHTML = that._processDate(data.sys.sunrise);
					that.sunset.innerHTML = that._processDate(data.sys.sunset);
					that.coords.innerHTML = data.coord.lon + ', ' + data.coord.lat;

				},
				function (error) {
					console.log("Error: ", error.message);
				});

		},

		_processDate: function (dateStr) {
			if (dateStr == null) {
				return "";
			}
			var a = new Date(dateStr * 1000);
			return dateLocale.format(a, {
				selector: "date",
				datePattern: "yyyy-MM-dd HH.mm v"
			});
			var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			var year = a.getFullYear();
			var month = months[a.getMonth()];
			var date = a.getDate();
			var hour = a.getHours();
			var min = a.getMinutes();
			var sec = a.getSeconds();
			var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec + ' GMT';
			//return time;
		},
		postCreate: function () {
			//console.log('app.ActiveHurricaneDetails::postCreate', arguments);
			this.inherited(arguments);

			this._events();
		},
		_events: function () {
			this.updateTimmer = setInterval(lang.hitch(this, this.getWeatherData), 30000);
			this.getWeatherData();
		},
		startup: function () {

		},
		destroy: function () {
			window.clearInterval(this.updateTimmer);
		}
	});
});