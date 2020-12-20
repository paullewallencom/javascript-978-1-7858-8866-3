require([
    "app_widgets/widgettemplate/widgettemplate",
    "dojo/domReady!"
        ],
    function (widgettemplate) {
        var templateWidget = new widgettemplate({}, /* Pass an empty object */
            'templatedWidgetDiv' /*Reference to the dom element where the widget shall be placed */
        );
        templateWidget.startup();
    });