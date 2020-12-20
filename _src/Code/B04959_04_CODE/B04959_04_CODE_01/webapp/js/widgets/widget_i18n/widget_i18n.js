define([
    //class
    "dojo/_base/declare",
    "dojo/_base/lang",

    //widgit class
    "dijit/_WidgetBase",

    //templated widgit
    "dijit/_TemplatedMixin",

    // localization
    "dojo/i18n!app_widgets/widget_i18n/nls/strings",

    //loading template file
    "dojo/text!app_widgets/widget_i18n/template/_widget.html",

    "dojo/domReady!"
], function (
    declare, lang,
    _WidgetBase,
    _TemplatedMixin,
    nls,
    dijitTemplate
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        //assigning html template to template string
        templateString: dijitTemplate,
        constructor: function (options, srcRefNode) {
            console.log('constructor called');
            // widget node
            this.domNode = srcRefNode;
            this.nls = nls;
        },
        // start widget. called by user
        startup: function () {
            console.log('startup called');
        }
    });
});