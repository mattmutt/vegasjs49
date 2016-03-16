window.addEventListener("load", function () {
    var vjs = new VegasJSSearch3("#flickrSearchWidget");
    vjs.initialize();
});
var VegasJSSearch3 = (function () {
    function VegasJSSearch3(containerSelector) {
        this.containerNode = $(containerSelector);
        // setup Flickr
        this.searchEngine = new FlickrAPI3();
    }
    // bind to the demo code's form elements
    VegasJSSearch3.prototype.initialize = function () {
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
    VegasJSSearch3.prototype.outputContainerChange = function () {
        // was anything found from the search results
        // decorate the container of the output
        this.output.toggleClass("active", (this.modelResults && this.modelResults.length > 0) ? true : false);
    };
    // user clicked search
    VegasJSSearch3.prototype.onSearchClickEvent = function (event) {
        var _this = this;
        var url = this.searchEngine.location;
        // todo: -- REVIEW --  :: private accessors
        //console.log("secret password is", this.searchEngine.secretParameters);
        // generate request to Flickr server with the proper API constructs and our search term
        $.getJSON(url, this.searchEngine.generateSearchParameters(this.input.val()), function (data) { return _this.resolveSearchEngineResponse(data); });
    };
    // processes the data by deferring to a custom parse routine
    VegasJSSearch3.prototype.resolveSearchEngineResponse = function (data) {
        this.outputContainerChange(); // reset
        this.modelResults = this.parsePhotoMetadataResults(data);
        this.updateView();
        this.outputContainerChange();
    };
    // parse logic, delegates field extraction to the Flickr handler
    VegasJSSearch3.prototype.parsePhotoMetadataResults = function (data) {
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
        return results;
    };
    // refresh and build a simple photo gallery result set
    VegasJSSearch3.prototype.updateView = function () {
        this.output.empty(); // reset
        for (var i in this.modelResults) {
            var galleryPhotoStructure = this.modelResults[i];
            //todo: REVIEW - talk about inline template features
            // HTML markup generation with templates.. JSX has more advanced capabilities compared to this simpleton JQuery
            var itemLayout = $("\n                <div class=\"item\">\n                    <div class=\"photo\"><img src=\"" + galleryPhotoStructure.imageURL + "\"/></div>\n                    <div class=\"title\"><span>" + galleryPhotoStructure.title + "</span></div>\n                </div>\n                ");
            this.output.append(itemLayout); // each photo
        }
    };
    return VegasJSSearch3;
})();
// ~~~~~~~~~~~~~~~~~~~~~ plug in a flickr Search service ~~~~~~~~~~~~~~~~~~~~
var FlickrAPI3 = (function () {
    function FlickrAPI3() {
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
    Object.defineProperty(FlickrAPI3.prototype, "parameters", {
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
    FlickrAPI3.prototype.generateSearchParameters = function (searchTerm) {
        var contractParameters = this.parameters;
        // additive Flickr Search term
        contractParameters.text = searchTerm;
        return contractParameters;
    };
    // generate a URL for the image
    FlickrAPI3.prototype.deriveImageURL = function (record) {
        // flickr notation for images hosted on their server infrastructure
        var url = "http://farm" + record.farm + ".staticflickr.com/" + record.server + "/" + record.id + "_" + record.secret + ".jpg";
        return url;
    };
    // generate a URL for the image
    FlickrAPI3.prototype.deriveTitle = function (record) {
        // flickr notation field for title
        return record.title;
    };
    // extract the array set
    FlickrAPI3.prototype.deriveDatasetCollection = function (data) {
        return data.photos.photo;
    };
    return FlickrAPI3;
})();
//# sourceMappingURL=app.js.map