define([
    //Modules for Class declaration
    "dojo/_base/declare",
    "dojo/_base/lang",

    //widget class
    "dijit/_WidgetBase",

    //Module for loading templated widget
    "dijit/_TemplatedMixin",

    //Plugin to load HTML Template file
    "dojo/text!app_widgets/widgettemplate/template/_widget.html",

    "dojo/domReady!"
], function (
    declare,
    lang,
    _WidgetBase,
    _TemplatedMixin,
    dijitTemplate
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        //assigning html template to template string
        templateString: dijitTemplate,
        constructor: function (options, srcRefNode) {
            this.domNode = srcRefNode;
        },
        postCreate: function () {
            this.inherited(arguments);
        },
        startup: function () {

        },
        destroy: function () {

        }
    });
});