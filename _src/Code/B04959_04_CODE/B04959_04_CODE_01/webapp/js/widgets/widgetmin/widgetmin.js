define([
    //class
    "dojo/_base/declare",

    //widgit class
    "dijit/_WidgetBase",

    "dojo/domReady!"
], function (
    declare,
    _WidgetBase
) {
    return declare([_WidgetBase], {

        constructor: function (options, srcNode) {
			this.domNode = srcNode;
		},
        
        postCreate: function(){
            this.inherited(arguments);
        },

        startup: function () {
			console.log(this.domNode);
		},

        destroy: function () {}
    });
});