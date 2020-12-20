define([
  'dojo/text!./templates/ActiveHurricaneDetails.html',

  'dojo/_base/declare',

  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
   "esri/tasks/query", "esri/tasks/QueryTask",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/on"
], function (
    template,

    declare,

    _WidgetBase,
    _TemplatedMixin,
    Query, QueryTask,
    array,
    lang,
    on
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //    Active Hurricane Details

        templateString: template,
        baseClass: 'active-hurricane-details',

        // Properties to be sent into constructor


        constructor: function (options, srcRefNode) {
            this.domNode = srcRefNode;
        },

        postCreate: function () {
            this._events();

            console.log('app.ActiveHurricaneDetails::postCreate', arguments);
            this.inherited(arguments);
        },

        _events: function () {
            //initialize query task
            var queryTask = new QueryTask("http://livefeeds.arcgis.com/arcgis/rest/services/LiveFeeds/Hurricane_Active/MapServer/1");

            //initialize query
            var query = new Query();
            query.returnGeometry = false;
            query.where = "1=1 AND " + this._bust_cache_query_string();
            query.outFields = ["STORMNAME"];
            query.returnDistinctValues = true;
            var that = this;
            queryTask.execute(query, function (result) {
                console.log(result);
                
                var i;
                for (i = that.cbxactiveHurricane.options.length - 1; i >= 0; i--) {
                    that.cbxactiveHurricane.remove(i);
                }
                
                array.forEach(result.features, function (feature) {
                    console.debug(feature.attributes.STORMNAME);
                    that.cbxactiveHurricane.options[that.cbxactiveHurricane.options.length] = new Option(feature.attributes.STORMNAME, feature.attributes.STORMNAME);
                });
                that._update_hutticane_details();
            });

            this.updateTimmer = setInterval(lang.hitch(this, this._update_hutticane_details), 30000);

            
        },
        _onHurricane_Selection_Changed: function(e){
            //console.log(e);
            this._update_hutticane_details();
        },
        _bust_cache_query_string: function () {
            var num = Math.random();
            return "(" + num.toString() + "=" + num.toString() + ")";
        },
        _update_hutticane_details: function () {
            var selected_hurricane = this.cbxactiveHurricane.value;
            
            var queryTask = new QueryTask("http://livefeeds.arcgis.com/arcgis/rest/services/LiveFeeds/Hurricane_Active/MapServer/1");
            var query = new Query();
            query.returnGeometry = true;
            query.where = "STORMNAME='"+ selected_hurricane +"' AND " + this._bust_cache_query_string();
            query.outFields = ["*"];
            query.orderByFields = ["DTG DESC"];
            var that = this;
            queryTask.execute(query, function (result) {
                console.log(result);
                if (result.features.length>0){
                    that._mslp.innerHTML = result.features[0].attributes.MSLP;
                    that._basin.innerHTML = result.features[0].attributes.BASIN;
                    that._stormnum.innerHTML = result.features[0].attributes.STORMNUM;
                    that._stormtype.innerHTML = result.features[0].attributes.STORMTYPE;
                    that._intensity.innerHTML = result.features[0].attributes.INTENSITY;
                    that._ss.innerHTML = result.features[0].attributes.SS;
                }
            });
        },
        startup: function () {

        },
        destroy: function () {
            window.clearInterval(this.updateTimmer);
        }
    });
});