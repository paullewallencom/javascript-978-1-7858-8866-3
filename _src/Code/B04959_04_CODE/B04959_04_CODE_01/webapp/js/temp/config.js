define(function () {
    /* Private variables*/
    var baseMapUrl = "http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer";
    var NOAAMapService = "http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/hazards/MapServer";
    var earthquakeLayerId = 5;
    var volcanoLayerId = 6;
    /*publicly accessible object returned by the COnfig module */
    return {
        app: {
            currentVersion: "1.0.0"
        },

        // valid themes: "claro", "nihilo", "soria", "tundra", "bootstrap", "metro"
        theme: "bootstrap",

        // url to your proxy page, must be on same machine hosting you app. See proxy folder for readme.
        proxy: {
            url: "proxy/proxy.ashx",
            alwaysUseProxy: false,
            proxyRuleUrls: [NOAAMapService]
        },

        map: {

            // basemap: valid options: "streets", "satellite", "hybrid", "topo", "gray", "oceans", "national-geographic", "osm"
            defaultBasemap: "streets",
            visibleLayerId: [this.earthquakeLayerId, this.volcanoLayerId];

            earthQuakeLayerURL: this.NOAAMapService + "/" + this.earthquakeLayerId,
            volcanoLayerURL: this.NOAAMapService + "/" + this.volcanoLayerId
        }
    }
});