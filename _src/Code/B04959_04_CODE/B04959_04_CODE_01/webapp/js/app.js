require(["dojo/dom",

         "app_widgets/widgetmin/widgetmin",

         "dojo/domReady!"], function (dom, widgetmin, ) {

	var templateWidget = new widgetmin({}, 'templatedWidgetDiv');
	templateWidget.startup();

});