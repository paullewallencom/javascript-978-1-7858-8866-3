define([
    //class
    "dojo/_base/declare"
], function (declare) {
    return declare(null, {
        prop1: 500,
        prop2: "Class Property 2",
        constructor: function(name){
            console.log(name);
        },
        myMethod: function () {
            return 'Class method';
        }
    });
});