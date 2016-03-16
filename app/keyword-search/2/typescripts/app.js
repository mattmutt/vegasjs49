window.addEventListener("load", function () {
    var vjs = new VegasJSSearch2("#component");
    vjs.initialize();
});
var VegasJSSearch2 = (function () {
    function VegasJSSearch2(containerSelector) {
        this.containerNode = $(containerSelector);
        // setup Flickr
        this.searchEngine = new FlickrAPI2();
    }
    // bind to the demo code's form elements
    VegasJSSearch2.prototype.initialize = function () {
        var _this = this;
        // check the boundaries
        this.input = this.containerNode.find(".input"); // textbox
        this.output = this.containerNode.find(".output"); // just a container
        this.action = this.containerNode.find(".action"); // button to start search
        // events -- notice the lexical binding to work around JQuery's event dispatching system where 'this'
        // would be the BUTTON DOM element
        this.action.on("click", function (event) { return _this.onSearchClickEvent(event); });
        this.outputContainerChange();
    };
    // update the view state of the output ( has results  or is empty )
    VegasJSSearch2.prototype.outputContainerChange = function () {
        // was anything found from the search results
        if (this.modelResults && this.modelResults.length > 0) {
        }
    };
    // user clicked search
    VegasJSSearch2.prototype.onSearchClickEvent = function (event) {
        var _this = this;
        var url = this.searchEngine.location;
        // todo: -- REVIEW --  :: private accessors
        //console.log("secret password is", this.searchEngine.secretParameters);
        // generate request to Flickr server with the proper API constructs and our search term
        $.getJSON(url, this.searchEngine.generateSearchParameters(this.input.val()), function (data) { return _this.resolveSearchEngineResponse(data); });
    };
    // processes the data by deferring to a custom parse routine
    VegasJSSearch2.prototype.resolveSearchEngineResponse = function (data) {
        this.outputContainerChange(); // reset
        this.modelResults = this.parsePhotoMetadataResults(data);
    };
    // parse logic, delegates field extraction to the Flickr handler
    VegasJSSearch2.prototype.parsePhotoMetadataResults = function (data) {
        var results = [];
        // ~~~~~~ loop over metadata from search results ~~~~~~~~~
        var photosMetadataCollection = this.searchEngine.deriveDatasetCollection(data);
        for (var i in photosMetadataCollection) {
            var record = photosMetadataCollection[i];
            //console.log("got", url);
            var galleryPhotoItem = {
                title: this.searchEngine.deriveTitle(record),
                imageURL: this.searchEngine.deriveImageURL(record)
            };
            // --------- REVIEW -------------
            // show Javascript runtime error with Typescript source map
            // record=null; // error cannot modify const
            // galleryPhotoItem.title = this.searchEngine["noSuchMethod"]();
            results.push(galleryPhotoItem); // retain valid photos
        }
        console.log("found records", results);
        return results;
    };
    return VegasJSSearch2;
})();
// ~~~~~~~~~~~~~~~~~~~~~ plug in a flickr Search service ~~~~~~~~~~~~~~~~~~~~
var FlickrAPI2 = (function () {
    function FlickrAPI2() {
        this.location = "https://www.flickr.com/services/rest";
        this.method = "GET";
        this.serviceParameters = {
            method: "flickr.photos.search",
            format: "json",
            //lat: 36.1, // Vegas BABY!
            //lon: 115.17,
            //radius: 10, // kinda big area
            sort: "date-posted-desc",
            per_page: 50,
            nojsoncallback: true,
            text: null // search term
        };
        // keep key secret
        this.secretParameters = {
            api_key: null // supply your Flickr key
        };
    }
    Object.defineProperty(FlickrAPI2.prototype, "parameters", {
        // mix in service and secret parameters as this getter routine
        // of JS is not really private, but TS will respect the private nature only during development
        get: function () {
            var params = {};
            for (var k in this.serviceParameters) {
                params[k] = this.serviceParameters[k];
            }
            for (var k in this.secretParameters) {
                params[k] = this.secretParameters[k];
            }
            return params;
        },
        enumerable: true,
        configurable: true
    });
    FlickrAPI2.prototype.generateSearchParameters = function (searchTerm) {
        var contractParameters = this.parameters;
        // additive Flickr Search term
        contractParameters.text = searchTerm;
        return contractParameters;
    };
    // generate a URL for the image
    FlickrAPI2.prototype.deriveImageURL = function (record) {
        // flickr notation for images hosted on their server infrastructure
        var url = "http://farm" + record.farm + ".staticflickr.com/" + record.server + "/" + record.id + "_" + record.secret + ".jpg";
        return url;
    };
    // generate a URL for the image
    FlickrAPI2.prototype.deriveTitle = function (record) {
        // flickr notation field for title
        return record.title;
    };
    // extract the array set
    FlickrAPI2.prototype.deriveDatasetCollection = function (data) {
        return data.photos.photo;
    };
    return FlickrAPI2;
})();
//# sourceMappingURL=app.js.map