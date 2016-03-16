window.addEventListener("load", function () {

    const vjs = new VegasJSSearch3("#flickrSearchWidget");
    vjs.initialize();

});


// define the shape of a gallery photo
interface IGalleryPhoto3 {
    title: string;
    imageURL:string;
}


class VegasJSSearch3 {

    //text

    containerNode:JQuery;

    // user interface DOM elements
    input:JQuery;
    action:JQuery;
    output:JQuery;


    // model  of results
    modelResults:Array<IGalleryPhoto3>;

    // search engine
    searchEngine:FlickrAPI3;

    constructor(containerSelector:string) {
        this.containerNode = $(containerSelector);
        // setup Flickr
        this.searchEngine = new FlickrAPI3();

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

        this.outputContainerChange();
    }

    // update the view state of the output ( has results  or is empty )
    outputContainerChange() {

        // was anything found from the search results
        // decorate the container of the output
        this.output.toggleClass("active", (this.modelResults && this.modelResults.length > 0)?true:false );

    }

    // user clicked search
    onSearchClickEvent(event:JQueryEventObject) {

        var url = this.searchEngine.location;

        // todo: -- REVIEW --  :: private accessors
        //console.log("secret password is", this.searchEngine.secretParameters);

        // generate request to Flickr server with the proper API constructs and our search term
        $.getJSON(url, this.searchEngine.generateSearchParameters(this.input.val()), (data) => this.resolveSearchEngineResponse(data));

    }


    // processes the data by deferring to a custom parse routine
    resolveSearchEngineResponse(data) {

        this.outputContainerChange(); // reset

        this.modelResults = this.parsePhotoMetadataResults(data);

        this.updateView();
        this.outputContainerChange();
    }


    // parse logic, delegates field extraction to the Flickr handler
    parsePhotoMetadataResults(data):Array<IGalleryPhoto3> {

        let results:Array<IGalleryPhoto3> = [];

        // ~~~~~~ loop over metadata from search results ~~~~~~~~~
        const photosMetadataCollection = this.searchEngine.deriveDatasetCollection(data);
        for (let i in photosMetadataCollection) {

            const record:FlickrAPIRecordJSON3 = photosMetadataCollection[i];

            //console.log("got", url);
            let galleryPhotoItem:IGalleryPhoto3 = {
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
    }



    // refresh and build a simple photo gallery result set
    updateView():void {
        this.output.empty(); // reset

        for(let i in this.modelResults) {
            const galleryPhotoStructure:IGalleryPhoto3 = this.modelResults[i];


            //todo: REVIEW - talk about inline template features
            // HTML markup generation with templates.. JSX has more advanced capabilities compared to this simpleton JQuery
            const itemLayout = $(
                `
                <div class="item">
                    <div class="photo"><img src="${galleryPhotoStructure.imageURL}"/></div>
                    <div class="title"><span>${galleryPhotoStructure.title}</span></div>
                </div>
                `
            );


            this.output.append(itemLayout); // each photo
        }

    }


}


// ~~~~~~~~~~~~~ general interfaces used ~~~~~~~~~~~~~~~~~~
interface FlickrAPIRecordJSON3 {
    farm:number;
    id:string;
    isfamily:number;
    isfriend:number;
    ispublic:number;
    owner:string;
    secret:string;
    server:string;
    title:string;
}


interface FlickrAPISearchParameters3 {
    method: string;
    format: string;
    lat?: number;
    lon?: number;
    radius?: number;
    sort?: string;
    per_page: number;
    nojsoncallback: boolean;
    text: string; // search term
}

// ~~~~~~~~~~~~~~~~~~~~~ plug in a flickr Search service ~~~~~~~~~~~~~~~~~~~~
class FlickrAPI3 {

    location:string = "https://www.flickr.com/services/rest";
    method = "GET";

    serviceParameters:FlickrAPISearchParameters3 = {
        method: "flickr.photos.search",
        format: "json",
        //lat: 36.1, // Vegas BABY!
        //lon: 115.17,
        //radius: 10, // kinda big area
        sort: "date-posted-desc", // give newest
        per_page: 50, // limit
        nojsoncallback: true,
        text: null // search term
    };


    // keep key secret
    private secretParameters:any = {
        api_key: null // supply your Flickr key
    };

    constructor() {

    }

    // mix in service and secret parameters as this getter routine
    // of JS is not really private, but TS will respect the private nature only during development
    get parameters():any {

        let params = {};

        for (let k in this.serviceParameters) {
            params[k] = this.serviceParameters[k];
        }

        for (let k in this.secretParameters) {
            params[k] = this.secretParameters[k];
        }

        return params;
    }


    generateSearchParameters(searchTerm:string) {
        let contractParameters:FlickrAPISearchParameters3 = this.parameters;
        // additive Flickr Search term
        contractParameters.text = searchTerm;

        return contractParameters;
    }

    // generate a URL for the image
    deriveImageURL(record:FlickrAPIRecordJSON3):string {
        // flickr notation for images hosted on their server infrastructure
        var url = `http://farm${record.farm}.staticflickr.com/${record.server}/${record.id}_${record.secret}.jpg`;
        return url;
    }

    // generate a URL for the image
    deriveTitle(record:FlickrAPIRecordJSON3):string {
        // flickr notation field for title
        return record.title;
    }

    // extract the array set
    deriveDatasetCollection(data):Array<any> {
        return data.photos.photo;
    }

}

