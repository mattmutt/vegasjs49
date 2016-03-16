// bootstrap the class at page load time
window.addEventListener("load", function () {

    const vjs = new VegasJSSearch1("#component");
    vjs.initialize();

});


class VegasJSSearch1 {

    //text

    containerNode:JQuery;

    // user interface DOM elements
    input:JQuery;
    action:JQuery;
    output:JQuery;


    // model  of results
    modelResults:any = [];

    constructor(containerSelector:string) {
        this.containerNode = $(containerSelector);
    }


    // bind to the demo code's form elements
    initialize() {

        // check the boundaries
        this.input = this.containerNode.find(".input"); // textbox
        this.output = this.containerNode.find(".output"); // just a container
        this.action = this.containerNode.find(".action"); // button to start search

        // events -- notice the lexical binding to work around JQuery's event dispatching system where 'this'
        // would be the BUTTON DOM element
        this.action.on("click", (event:JQueryEventObject) => this.onSearchClickEvent(event));

    }

    // user clicked search
    onSearchClickEvent(event:JQueryEventObject) {

        console.log("button ", this.action, " was clicked in VegasJSSearch object");
        console.log("input entered ", this.input.val());

    }


}

