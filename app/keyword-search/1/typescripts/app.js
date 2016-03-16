// bootstrap the class at page load time
window.addEventListener("load", function () {
    var vjs = new VegasJSSearch1("#component");
    vjs.initialize();
});
var VegasJSSearch1 = (function () {
    function VegasJSSearch1(containerSelector) {
        // model  of results
        this.modelResults = [];
        this.containerNode = $(containerSelector);
    }
    // bind to the demo code's form elements
    VegasJSSearch1.prototype.initialize = function () {
        var _this = this;
        // check the boundaries
        this.input = this.containerNode.find(".input"); // textbox
        this.output = this.containerNode.find(".output"); // just a container
        this.action = this.containerNode.find(".action"); // button to start search
        // events -- notice the lexical binding to work around JQuery's event dispatching system where 'this'
        // would be the BUTTON DOM element
        this.action.on("click", function (event) { return _this.onSearchClickEvent(event); });
    };
    // user clicked search
    VegasJSSearch1.prototype.onSearchClickEvent = function (event) {
        console.log("button ", this.action, " was clicked in VegasJSSearch object");
        console.log("input entered ", this.input.val());
    };
    return VegasJSSearch1;
})();
//# sourceMappingURL=app.js.map