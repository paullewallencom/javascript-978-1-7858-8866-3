require(["dojo/dom",
        "app_widgets/widgettemplate/widgettemplate",
        "utils/myClass",
        "app_widgets/widget_i18n/widget_i18n",
         "dojo/domReady!"], function (dom, WidgetTemplate, MyClass, Widget_i18n) {
    var msgDiv = dom.byId("msgDiv");
    /* Instantiate MyClass module */
    var myClass = new MyClass('const param');
    msgDiv.innerHTML += '<br>Property 1: ' + myClass.prop1;
    msgDiv.innerHTML += '<br>Property 2: ' + myClass.prop2;
    msgDiv.innerHTML += '<br>Class Method: ' + myClass.myMethod();

    /* Instantiate WidgetTemplate widget */
    var templateWidget = new WidgetTemplate({}, 'templatedWidgetDiv');
    templateWidget.startup();

    /* Instantiate Widget_i18n */
    var s = new Widget_i18n({}, 'widgetlocal');
    s.startup();
});