/*
	CCGallery.js - ccgallery's main implementation classes
	Copyright 2026, Jason Baker (jason@onejasonforsale.com)
	Github for this project: https://github.com/codercowboy/ccgallery

	This file contains a number of classes: 

		`CCGalleryManager` - manages the galleries (instances of `CCGallery`)

		`CCGallery` - manages one of the user's albums

		`CCGalleryThumbnail` - manages a given thumbnail image's behavior

		`CCGalleryBigImage` - manages the 'big' image that pops up when a user clicks on a thumbnail

		`CCMenuManager` - manages the menu that allows the user to change albums

		`CCScreenSaver` - manages the screen saver behavior that periodically highlights thumbnails
*/

import CCUtil from "./CCUtil.js";

/* 
	`CCGalleryThumbnail` - manages a given thumbnail image's behavior

	When a user selects an album, a `CCGallery` object is created, and that makes 
	`CCGalleryThumbnail` images, one per thumbnail shown on the screen.

	Specific positioning of the thumbnail is calculated in `CCGallery.resetImages()`
	before the `CCGalleryThumbnail` is created.

	After the `CCGalleryThumbnail` object is instantiated, `CCGallery.resetImages()`
	will call `CCGalleryThumbnail.createThumbnailImageElement()` to create this
	thumbnail's <img> element.

	`createThumbnailImageElement()` configures the thumbnail <img> element's
		various css styles, and, importantly, it assigns the following callbacks
		on the image:

		// when the thumbnail image loads, execute `handleOnLoad()`
		thumbnailImg.onload = this.handleOnLoad;

		// when the user clicks the thumbnail, execute `handleOnClick()`
		thumbnailImg.onclick = this.handleOnClick;

		// when the user's mouse moves over the thumbnail, it's enlarged
		// with `enlarge()`
		thumbnailImg.onmouseover = () => { this.enlarge(200, 200, 15); };

		// when the user's mouse stops hovering over the thumbnail, it's shrunk
		// with `shrink()`
		thumbnailImg.onmouseout = () => { this.shrink(400); };

	`handleOnLoad()` fades the thumbnail image in with an animation after the
		thumbnail image loads.

	`handleOnClick()` calls parent `CCGallery.showBigImage(this)` which orchestrates
		showing the large version of the image.

	`enlarge()` enlarges the thumbnail with a jquery animation, this method is 
		a bit complex, so see inline comments for details

	`shrink()` shrinks the thumbnail with a jquery animation, this method is 
		a bit complex, so see inline comments for details

*/
export class CCGalleryThumbnail {
	ccGallery = null;
	imgData = null;
	x = null;
	y = null;
	width = null;
	height = null;
	thumbnailImg = null;
	enlarged = false;

	constructor(ccGallery, imgData, x, y, rowHeightPixels) {
		this.ccGallery = ccGallery;
		this.imgData = imgData;
		this.x = x;
		this.y = y;

		this.height = rowHeightPixels;

		// scale width the same scale as height pixels
		let oh = imgData.thumbnail.height;
		let ow = imgData.thumbnail.width;

		let ratioFloat = parseFloat(this.height) / parseFloat(oh);
		this.width = Math.floor(parseFloat(ow) * ratioFloat);		
	}

	destroy() {
		this.ccGallery = null;
		this.imgData = null;
	}

	/* create the <img> element for the thumbnail */
	createThumbnailImageElement() {
		let ccThumbnail = this;

		// create the thumbnail <img> element
		let thumbnailImg = document.createElement('img');
		thumbnailImg.classList.add("ccGalleryThumbnail");		
		thumbnailImg.ccThumbnail = this;

		// start the thumbnail image loading
		thumbnailImg.src = this.imgData.thumbnailImgSrc;

		// setup various event handlers for the image
		thumbnailImg.onload = this.handleOnLoad;
		if (!this.ccGallery.config.advancedConfig.isMobile) {
			thumbnailImg.onmouseover = () => { 
				this.ccGallery.lastHoveredThumbnail = this;
				this.enlarge(200, 200, 15); 
			};
			thumbnailImg.onmouseout = () => { this.shrink(400); };
		}
		thumbnailImg.onclick = this.handleOnClick;

		// position the thumbnail
		thumbnailImg.style.width = this.width + "px";		
		thumbnailImg.style.height = this.height + "px";
		thumbnailImg.style.left = this.x + "px";
		thumbnailImg.style.top = this.y + "px";
		thumbnailImg.style.opacity = "0.0";
		thumbnailImg.style.zindex = 10;

		this.thumbnailImg = thumbnailImg;

		return thumbnailImg;
	}

	/* after thumbnail image loads, animate it fading in */
	handleOnLoad() {
		let ccGallery = this.ccThumbnail.ccGallery;
		// random delay here helps the thumbnails subtly
		// fade in out of sync with others
		let randomDelay = 100 * (Math.floor(Math.random() * 10)+1);
		$(this).animate({ opacity:0.5 }, randomDelay);
	}

	/* show the large version of the image when user clicks on the thumbnail */
	handleOnClick() {		
		this.ccThumbnail.ccGallery.showBigImage(this.ccThumbnail);
	}

	/* 
		enlarge the thumbnail via jquery animation 
		argument: animationTimeMillis - number, animation time in millis
		argument: zIndexOffset - number, offset to add to zindex
		argument: percentageIncrease - percentage of original thumbnail size to increas

			Example: 

			enlarge(2000, 5, 15);

			this says show a 2000 millisecond-long enlarging animation, with
			the thumbnail's zindexoffset being +5, and the final enlarged thumbnial 
			will be 15% larger, for example a 100-pixel-tall thumbnail will be 
			115 pixels tall after the enlargement.

	*/
	enlarge(animationTimeMillis, zIndexOffset, percentageIncrease) {
		if (this.thumbnailImg == null) {
			return;
		}

		// set the thumbnail's zindex which controls how the
		// thumbnail is layered above/below other thumbnails
		// in the browser
		if (zIndexOffset == null) {
			zIndexOffset = 0;
		}
		this.thumbnailImg.style.zIndex = 20 + zIndexOffset;	

		// calculate the target wdith/height of the enlarged thumbnail

		let widthOffSet = Math.floor((this.width / 100) * percentageIncrease);
		let targetWidth = this.width + widthOffSet; 

		let heightOffSet = Math.floor((this.height / 100) * percentageIncrease);
		let targetHeight = this.height + heightOffSet; 

		// calculate the target position of the elarged thumbnail
		// in particular here, we want the thumbnail to be centered as
		// it animates, so, for example if the width enlargement is 20 pixels
		// we want the enlarged thumbnail to be moved 10 pixels to the left
		// which happens by setting the 'left' attribute to the initial
		// x position subtracted by 10
		let left = this.x - Math.floor(widthOffSet / 2);
		let top = this.y - Math.floor(heightOffSet / 2);

		// configuration for the animation
		// this tells jquery what our target final
		// state is for the thumbnail
		let sizeAnimationConfig = {
			"width": targetWidth + "px",
			"height": targetHeight + "px",
			"left": left + "px",
			"top": top + "px",
			"easing": "swing"
		}

		// stop current animation if any
		$(this.thumbnailImg).stop(); 

		// fully show the thumbnail before we enlarge
		this.thumbnailImg.style.opacity = 1.0;

		// run the animation
		$(this.thumbnailImg).animate(sizeAnimationConfig, 
			animationTimeMillis);	
	}

	/* 
		shrink the thumbnail via jquery animation 
		argument: animationTimeMillis - number, animation time in millis
	*/
	shrink(animationTimeMillis) {
		if (this.thumbnailImg == null || this.enlarged == true) {
			return;
		}

		// configuration for the animation
		// this tells jquery what our target final
		// state is for the thumbnail
		// here we are just setting the thumbnail
		// size/position to the original state 
		// before enlarging
		let sizeAnimationConfig = {
			"width": this.width + "px",
			"height": this.height + "px",
			"left": this.x + "px",
			"top": this.y + "px",
			"easing": "linear"
		}

		// this function will be called when animations finish
		let finishedCallback = () => { 
			this.enlarged = false; 
			this.thumbnailImg.style.zIndex = 10;
		}

		if (animationTimeMillis < 500) {
			// for quick animations (less than 500 ms) set opacity to 50% immediately
			sizeAnimationConfig.opacity = "0.5";
			
			$(this.thumbnailImg).stop(); 
			// run the animation
			$(this.thumbnailImg).animate(sizeAnimationConfig, 
				animationTimeMillis, 
				finishedCallback);
		} else {
			// configuration to tell jquery
			// to fade the thumbnail to 50% opacity
			let opacityAnimationConfig = {
				"opacity": "0.5",
				"easing": "linear"
			}

			let opacityAnimationTime = 1000;
			
			// when opacity-adjusting animation finishes, jquery
			// will call this function, so we can kick off
			// the size-adjusting animation
			let sizeAnimationFinishedCallback = () => {
				// run the size-adjusting animation
				$(this.thumbnailImg).animate(opacityAnimationConfig, 
					opacityAnimationTime, 
					finishedCallback);
			}
			// stop current animation if any
			$(this.thumbnailImg).stop();

			// run the opacity-adjusting animation
			$(this.thumbnailImg).animate(sizeAnimationConfig, 
				animationTimeMillis, 
				sizeAnimationFinishedCallback);
		}
	}
}

/* 
	`CCGalleryBigImage` - manages the 'big' image that pops up when a user clicks on a thumbnail 

	When a user clicks on a thumbnail, `CCGalleryThumbnail.handleOnClick()` is called, which calls
	its parent `CCGallery.showBigImage()` which creates a `CCGalleryBigImage` and then kicks off
	the large image lifecycle via `CCGalleryBigImage.showedScaledImage()`

	The big image's lifecycle:

		1. thumbnail is clicked
		2. CCGallery creates CCGalleryBigImage
		3. CCGallery calls CCGalleryBigImage.showedScaledImage()
		4. showedScaledImage() loads an <img> the size of the thumbnail
		5. after the scaled image loads, handleScaledImageLoad() is called, which 
				animates the scaled image enlarging to the size of the eventual big image
		6. scaled image finishes animating, showBigImage() is called
		7. showBigImage() creates the <img> that loads the large version of the image
		8. sometime later, the user clicks the big image or another thumbnail, and
				CCGallery.hideBigImage() is called, which calls hide() on the
				CCGalleryBigImage, which removes the scaled and big images from 
				the page's dom

*/
export class CCGalleryBigImage {
	ccGallery = null;
	ccThumbnail = null;
	bigImageConfig = null;
	scaledImage = null;
	bigImage = null;

	constructor(ccGallery, ccThumbnail) {
		this.ccGallery = ccGallery;
		this.ccThumbnail = ccThumbnail;
		this.bigImageConfig = this.calculateBigImageConfig(ccGallery, ccThumbnail.imgData);
	}

	destroy() {
		this.ccGallery = null;
		this.ccThumbnail = null;
		this.bigImageConfig = null;
		this.scaledImage = null;
		this.bigImage = null;
	}

	/*
		create a <img> the same size and position as the originating 
		thumbnail that user clicked, add it to the DOM.
	*/
	showScaledImage() {
		let scaledImage = document.createElement('img');
		scaledImage.id = "scaledImage";
		scaledImage.ccBigImage = this;

		// image in the scaled image is same as thumbnail's
		scaledImage.src = this.ccThumbnail.imgData.thumbnailImgSrc;

		scaledImage.onload = this.handleScaledImageLoad;
		scaledImage.onclick = () => { this.ccBigImage.ccGallery.hideBigImage; };
		
		scaledImage.style.zIndex = 500;		
		scaledImage.style.opacity = "0.0";
		scaledImage.style.width = this.ccThumbnail.width + "px";
		scaledImage.style.height = this.ccThumbnail.height + "px";
		scaledImage.style.left = this.ccThumbnail.x + "px";
		scaledImage.style.top = this.ccThumbnail.y + "px";		
		
		this.ccGallery.galleryContainer.appendChild(scaledImage);		

		this.scaledImage = scaledImage;
	}

	/* 
		when scaled image loads, animate it enlarging to the 
		eventual size and position of the 'big' image
	*/
	handleScaledImageLoad() {
		let ccBigImage = this.ccBigImage;
		let ccGallery = this.ccBigImage.ccGallery;
		ccGallery.showLoading();		

		let bigImageConfig = this.ccBigImage.bigImageConfig;		
		let animationConfig = {
			"opacity": "1.0",
			"width": bigImageConfig.w + "px",
			"height": bigImageConfig.h + "px",
			"left": bigImageConfig.x + "px",
			"top": bigImageConfig.y + "px",
		};
		
		let animationCallback = () => { ccBigImage.showBigImage(); };

		$(this).animate(animationConfig, 200, animationCallback);
	}

	/*
		after scaled image enlarging animation finishes,
		load the big image as a new <img> dom element that
		perfectly matches the scaled image's size and position
		but sits above it in the z-index layer
	*/
	showBigImage() {
		this.ccGallery.showPhotoOverlay(this.bigImageConfig);

		let bigImage = document.createElement('img');
		bigImage.id = "bigImage";
		bigImage.ccBigImage = this;

		bigImage.src = this.ccThumbnail.imgData.bigImageFileSrc;

		bigImage.onload = this.handleBigImageLoad;
		bigImage.onclick = () => { this.ccGallery.hideBigImage(); };
		
		bigImage.style.zIndex = 510;
		bigImage.style.opacity = "0.0";
		bigImage.style.width = this.bigImageConfig.w + "px";
		bigImage.style.height = this.bigImageConfig.h + "px";
		bigImage.style.left = this.bigImageConfig.x + "px";
		bigImage.style.top = this.bigImageConfig.y + "px";

		this.ccGallery.galleryContainer.appendChild(bigImage);

		this.bigImage = bigImage;	
	}

	handleBigImageLoad() {
		let ccGallery = this.ccBigImage.ccGallery;
		ccGallery.hideLoading();
		this.style.opacity = "1.0";
	}

	hide() {
		CCUtil.removeElement(this.scaledImage);
		CCUtil.removeElement(this.bigImage);
	}	

	/*
		utility method that calculates the big image's scaled size 
		and centered position on the screen.
	*/
	calculateBigImageConfig(ccGallery, imgData) {	
		let galleryContainer = ccGallery.galleryContainer;
		
		var maxH = galleryContainer.clientHeight - 100;
		var maxW = galleryContainer.clientWidth - 100;
		var ow = imgData.big.width;
		var oh = imgData.big.height;
		var newW = ow;
		var newH = oh;

		if (ow > oh) { // image is wider than tall
			if (newW > maxW) {
				var ratio = parseFloat(oh) / parseFloat(ow);
				newW = maxW;
				newH = maxW * ratio;
			}
			if (newH > maxH) { //if we're still too tall, let's scale the other way then
				var ratio = parseFloat(ow) / parseFloat(oh);
				newH = maxH;
				newW = maxH * ratio;	
			}
		} else { //image is square or taller than wide
			if (newH > maxH) {
				var ratio = parseFloat(ow) / parseFloat(oh);
				newH = maxH;
				newW = maxH * ratio;	
			}
			if (newW > maxW) { //if we're too wide, let's scale the other way then
				var ratio = parseFloat(oh) / parseFloat(ow);
				newW = maxW;
				newH = maxW * ratio;
			}
		}
		newW = Math.floor(newW);
		newH = Math.floor(newH);

		var newX = Math.floor((galleryContainer.clientWidth - newW) / 2.0);
		var newY = Math.floor((galleryContainer.clientHeight - newH) / 2.0);
		// our container window is purposely off center by 50 pixels
		// so on mobile move the image up 50 pixels to match the container window's
		newY -= this.ccGallery.config.advancedConfig.centeredBigImageYOffset;

		// console.log("Original dims: " + ow + "x" + oh + ", Scaled: " + newW + "x" + newH);
		// console.log("New placement: " + newX + "x" + newY);

		return { "x":newX, "y":newY, "w":newW, "h":newH };
	}
}

/* 
	`CCGallery` - manages one of the user's albums 

	The `CCGalleryManager` creates one `CCGallery` object per image album
	that's loaded from the web. This object creates and manages the thumbnails 
	and big images that are shown on the screen for this album.

	When this gallery is to be loaded, `CCGalleryManager` calls `CCGallery.load()`

	`load()` create's various container DOM elements such as the preloader spinner
	and the div the thumbnails will be in, then calls `resetImages()`

	`resetImages()` calculates the positions of the thumbnails and creates a
	`CCGalleryThumbnail` object for each thumbnail.

	`unload()` is called by `CCGalleryManager` to unload this gallery's thumbnails 
	and other various metadata when this gallery is being unloaded in preparation 
	for showing the other gallery the user has selected

	other various operations on `CCGallery` are fairly straight forward such as
	`showBigImage()` and `hideBigImage()`
*/
export class CCGallery {
	config = null;
	galleryName = null;
	
	urlPrefix = null;
	galleryJsonFileURL = null;	
	lastBigImage = null;
	thumbnails = [];
	galleryParentContainer = null;
	galleryContainer = null;
	preloader = null;
	photoOverlay = null;
	images = [];
	imagesLoaded = false;
	lastHoveredThumbnail = null;

	constructor(galleryConfig, galleryName) {
		this.config = galleryConfig;
		this.galleryName = galleryName;
		this.urlPrefix = this.config.advancedConfig.galleryUrlPrefix + "/" + galleryName;
		this.galleryJsonFileURL = this.urlPrefix + "/" + this.config.advancedConfig.galleryJSONFile;		
	}

	/* load the gallery / show the thumbnails on screen */
	async load() {
		// create the dom element that'll contain the thumbnails
		this.galleryContainer = CCUtil.createElementChild(this.config.galleryParentId, "div", this.config.advancedConfig.galleryContainerId);

		// if a preloading spinner image is specified, load the preloader
		if (this.config.advancedConfig.preloaderImageURL != null) {
			this.preloader = CCUtil.createElementChild(this.config.galleryParentId, "img", this.config.advancedConfig.preloaderId);
			this.preloader.src = this.config.advancedConfig.preloaderImageURL;
		}

		// if the user has specified photo overlay content, create
		// the dom element to hold that
		if (this.config.photoOverlayContent != null) {
			this.photoOverlay = CCUtil.createElementChild(this.config.galleryParentId, "div", this.config.advancedConfig.photoOverlayId);
			this.photoOverlay.innerHTML = this.config.photoOverlayContent;
		}	

		// show thumbnails
		this.resetImages();
	}

	/* load the images metadata via fetching the galleries.json file for this gallery */
	async loadImages() {
		if (this.imagesLoaded == true) {
			return;
		}
		this.imagesLoaded = true;
		let data = await CCUtil.loadJSON(this.galleryJsonFileURL);
		let tmpImages = [];
		if (data != null && data.images != null) {
			for (let imgData of data.images) {
				imgData.bigImageFileSrc = this.urlPrefix + "/" + imgData.big.file;
				imgData.thumbnailImgSrc = this.urlPrefix + "/" + imgData.thumbnail.file;
				tmpImages.push(imgData);
			}
		}
		this.images = tmpImages;
	}

	/* discard the image metadata for this gallery */
	unloadImages() {
		this.images = [];
		this.imagesLoaded = false;
	}

	/* unload this gallery from the screen, and other
		various metadata */
	unload() {
		this.hideBigImage();
		for (let thumbnail of this.thumbnails) {
			thumbnail.destroy();
		}
		this.thumbnails = [];
		CCUtil.removeElement(this.galleryContainer);
		CCUtil.removeElement(this.preloader);
		CCUtil.removeElement(this.photoOverlay);
		this.unloadImages();
	}

	/* show the 'big' image for a given thumbnail */
	showBigImage(ccThumbnail) {
		this.hideBigImage();
		let bigImage = new CCGalleryBigImage(this, ccThumbnail);
		bigImage.showScaledImage();
		this.lastBigImage = bigImage;
	}

	/* dismiss the currently shown 'big' image */
	hideBigImage() {
		this.hideLoading();
		if (this.lastBigImage) {
			this.lastBigImage.hide();
			this.lastBigImage.destroy();
			this.lastBigImage = null;
		}		
		this.hidePhotoOverlay();		
	}		

	/* show loading spinner, this shows while the 
		big image's large image file is loading */
	showLoading() {
		if (this.preloader == null) {
			return;
		}
		$(this.preloader).animate( { "opacity":'1.0' }, "slow");
	}

	/* hide loading spinner */
	hideLoading() {
		if (this.preloader == null) {
			return;
		}
		$(this.preloader).stop();
		this.preloader.style.opacity = "0.0";
	}	

	/* position and show the user's custom overlay content on the big image */
	showPhotoOverlay(bigImageConfig) {
		if (this.photoOverlay == null) {
			return;
		}
		let topStyle = (bigImageConfig.y + bigImageConfig.h) - this.photoOverlay.offsetHeight;
		
		this.photoOverlay.style.width = bigImageConfig.w + "px";
		this.photoOverlay.style.left = bigImageConfig.x + "px";		
		this.photoOverlay.style.top = topStyle + "px";
		this.photoOverlay.style.zIndex = 501;
		this.photoOverlay.onclick = () => { this.hideBigImage; };

		$(this.photoOverlay).animate( { "opacity":'1.0' }, "slow");
	}

	/* hide the user's custom overlay content */
	hidePhotoOverlay(bigImageConfig) {
		if (this.photoOverlay == null) {
			return;
		}
		this.photoOverlay.style.opacity = "0.0";
		this.photoOverlay.style.zIndex = 0;		
	}

	/* calculate positions and show thumbnails on the screen */
	async resetImages() {
		// discard previously loaded thumbnails
		CCUtil.removeElementChildren(this.config.advancedConfig.galleryContainerId);
		this.thumbnails = [];		

		if (this.preloader != null) {			
			// re-center preloader in case browser resized
			CCUtil.centerElement(this.preloader);
		}
		
		let containerHeight = this.galleryContainer.clientHeight;
		let containerWidth = this.galleryContainer.clientWidth;
		let currentThumbnailX = -50; 
		let currentThumbnailY = -50;

		// load images if needed
		await this.loadImages();
		let imagesCopy = this.images;
		let imagesToUse = imagesCopy.slice();

		// determine the height to use for thumbnails
		let rowHeightPixels = this.config.rowHeightPixels;
		let gallerySpecificRowHeightPixels = this.config.advancedConfig.gallerySpecificRowHeightsPixels[this.galleryName];
		if (gallerySpecificRowHeightPixels != null) {
			rowHeightPixels = gallerySpecificRowHeightPixels;
		}
		
		let thumbnailBorderPixels = this.config.thumbnailBorderPixels;

		// place the thumbnails on the screen
		while (currentThumbnailY < (containerHeight + 50)) {
			while (currentThumbnailX < containerWidth) {				
				// get a random image's metadata
				let randomImgIndex = Math.floor(Math.random() * (imagesToUse.length));
				let imgData = imagesToUse[randomImgIndex];
				imagesToUse.splice(randomImgIndex, 1);
				if (imagesToUse.length == 0) {
					imagesToUse = imagesCopy.slice();
				}

				// show the thumbnail
				let ccThumbnail = new CCGalleryThumbnail(this, imgData, currentThumbnailX, currentThumbnailY, rowHeightPixels);
				this.galleryContainer.appendChild(ccThumbnail.createThumbnailImageElement());				
				this.thumbnails.push(ccThumbnail);

				// calculate the next thumbnail's x position
				currentThumbnailX += ccThumbnail.width + thumbnailBorderPixels;
			}
			// calculate the next thumbnail row's y position
			currentThumbnailY += rowHeightPixels + thumbnailBorderPixels;
			currentThumbnailX = -50;
		}
	}
}

/* 
	`CCScreenSaver` - manages the screen saver behavior that periodically highlights thumbnails 

	`CCScreenSaver` uses its parent `CCGalleryMaanger` to orchestrate occasionally enlarging and
	shrinking random thumbnails for the currently shown gallery, similar to the animations shown
	when the user hovers their mouse over thumbnails
*/
export class CCScreenSaver {
	galleryManager = null;
	running = false;
	lastThumbnail = null;
	config = null;
	zIndexOffset = 10;
	mouseMoveTimer = null;

	constructor(ccGalleryManager, ccScreenSaverConfig) {
		this.galleryManager = ccGalleryManager;
		this.config = ccScreenSaverConfig;
	}

	/* start the screensaver */
	start() {
		this.running = true;
		this.run();
		this.initializeMouseMoveHandler();
	}

	/* automatically hide the user's mouse when the user is idle */
	initializeMouseMoveHandler() {
		// don't auto-hide cursor on mobile
		if (this.galleryManager.config.advancedConfig.isMobile == true) {
			return;
		} 

		// if user is idle for 3 seconds and we have screensaver, hide the mouse cursor
		let mouseMoveHandler = () => {
			// when mouse moves, cancel previous timer
			if (this.mouseMoveTimer != null) {
				clearTimeout(this.mouseMoveTimer);
			}
			
			// mouse is moving, show default cursor
			document.body.style.cursor = 'default';

			// create timer to hide the mouse after 3 seconds
			// (timer will be canceled above if user moves mouse
			// before the 3 seconds elapse)
			this.mouseMoveTimer = setTimeout(() => {
				// when the timer elapses, hide the cursor
				document.body.style.cursor = 'none';

				// if the mouse was hovering over a thumbnail, shrink it back down to size
				let currentGallery = this.galleryManager.currentGallery;
				if (currentGallery != null) {
					let lastHoveredThumbnail = currentGallery.lastHoveredThumbnail; 
					if (lastHoveredThumbnail != null) {
						lastHoveredThumbnail.shrink(400);
					}
				}
			}, 3000);
		};

		// add the mouse moving listener function to execute
		// every time the user's mouse moves anywhere in the document
		document.addEventListener("mousemove", mouseMoveHandler);
	}

	/* stop the screen saver */
	stop() {
		this.running = false;
	}

	/* animate a single thumbnail enlarging / shrinking */
	run() {
		if (this.running == false) {
			return;
		}

		try {
			// try to find a thumbnail to animate that's far enough away from
			// our previous thumbnail
			let thumbnailIndex = null;
			for (let i = 0; i < 10; i++) {
				thumbnailIndex = this.getNextThumbnailIndexToAnimate();
				if (thumbnailIndex != null) {
					break;
				}
			}

			if (thumbnailIndex == null) {
				// couldn't find a thumbnail to highlight
				// this time, skip this run()			
				return;
			}

			// make the newly highlighted thumbnail animate
			// higher in the zindex layers than any previous
			// thumbnails
			this.zIndexOffset += 10;
			if (this.zIndexOffset > 50) {
				this.zIndexOffset = 10;
			}

			// animate the thumbnail after a random amount of time up to 1 second
			const randomWaitTime = Math.floor(Math.random() * 1000);			
			setTimeout(() => { this.animateThumbnail(this.zIndexOffset, thumbnailIndex); }, randomWaitTime);
		} catch (ex) {
			console.log("Error while running screensaver", ex);
		} finally {		
			// schedule next run() call that'll animate the next thumbnail
			setTimeout(() => { this.run(); }, this.config.runIntervalMillis);
		}
	}

	/* find the next thumbnail to highlight */
	getNextThumbnailIndexToAnimate() {
		let thumbnailIndex = this.getRandomThumbnailIndex();
		if (thumbnailIndex == null) {
			return null;
		}

		let currentThumbnail = this.getThumbnail(thumbnailIndex);
		if (currentThumbnail == null) {
			return null;
		}

		// if the thumbnail is too close to the last one we animated
		// then skip this one
		if (this.lastThumbnail != null) {
			let xDistance = Math.abs(this.lastThumbnail.x - currentThumbnail.x);
			let yDistance = Math.abs(this.lastThumbnail.y - currentThumbnail.y);
			if (xDistance < this.config.minXDistanceFromLastThumbnail 
				|| yDistance < this.config.minYDistanceFromLastThumbnail) {
				return null;
			}
		}

		this.lastThumbnail = currentThumbnail;

		return thumbnailIndex;
	}

	/* 
		get the thumbnails from the current `CCGallery`, filtering
		out thumbnails that are partially off screen
	*/
	getThumbnails() {
		let gallery = this.galleryManager.currentGallery;
		if (gallery == null) {
			return null;
		}

		let thumbnails = gallery.thumbnails;
		if (thumbnails == null || thumbnails.length == 0) {
			return null;
		}

		let galleryContainer = gallery.galleryContainer;
		if (galleryContainer == null) {
			return null;
		}

		let containerHeight = galleryContainer.clientHeight;
		let containerWidth = galleryContainer.clientWidth;

		// filter out partially off-screen thumbails
		let tmpThumbnails = [];
		for (let thumbnail of thumbnails) {
			if (thumbnail.x < 0 
				|| thumbnail.y < 0
				|| (thumbnail.x + thumbnail.width) > containerWidth
				|| (thumbnail.y + thumbnail.height) > containerHeight) {
				continue;
			}
			tmpThumbnails.push(thumbnail);
		}
		thumbnails = tmpThumbnails;

		return thumbnails;
	}

	/* get a random thumbnail */
	getRandomThumbnail() {
		let thumbnailIndex = this.getRandomThumbnailIndex();
		let thumbnail = this.getThumbnail(thumbnailIndex);
		return thumbnail;
	}

	/* get the index for a random thumbnail */
	getRandomThumbnailIndex() {		
		let thumbnails = this.getThumbnails();
		if (thumbnails != null && thumbnails.length != 0) {
			let randomThumbNailIndex = Math.floor(Math.random() * thumbnails.length);
			return randomThumbNailIndex;
		}
		return null;
	}

	/* get the `CCGalleryThumbnail` for the given thumbnailIndex */
	getThumbnail(thumbnailIndex) {
		if (thumbnailIndex == null) {
			return null;
		}
		let thumbnails = this.getThumbnails();
		if (thumbnails == null || thumbnails.length == 0 || thumbnailIndex >= thumbnails.length) {
			return null;
		}
		let thumbnail = thumbnails[thumbnailIndex];
		return thumbnail;
	}

	/* highlight the thumbnail for the given thumbnailIndex */
	animateThumbnail(zIndexOffset, thumbnailIndex) {
		let ccThumbnail = this.getThumbnail(thumbnailIndex);
		if (ccThumbnail != null) {
			let enlargeTimeMillis = this.config.enlargeTimeMillis;
			let pauseTimeMillis = this.config.pauseTimeMillis;
			let shrinkTimeMillis = this.config.shrinkTimeMillis;
			ccThumbnail.enlarge(enlargeTimeMillis, zIndexOffset, 50);			
			setTimeout(() => { ccThumbnail.shrink(shrinkTimeMillis); }, pauseTimeMillis);
		}
	}
}

/* 
	`CCMenuManager` - manages the menu that allows the user to change albums 

	`CCGalleryManager` calls `CCMenuManager.initialize()`, which calls:

		`initializeMenuActivationLinkDOM()` creates the menu button 
			on the bottom right side of the screen. 

		`initializeMenuListDOM()` creates the menu popup window that lists
			the albums for the user to select an album to view

		`initializeMouseMoveHandler()` creates a timer that'll auto-hide
			the menu button when the user is idle for a while
*/
export class CCMenuManager {
	config = null;
	galleryNames = [];
	galleryManager = null;
	currentGalleryIndex = 0;	
	menuListWindow = null;
	mouseMoveTimer = null;

	menuActivationLinkContainer = null;
	menuActivationLink = null;
	menuListWindowBackground = null;
	menuListWindow = null;
	
	constructor(ccGalleryManager, ccMenuConfig, galleryNames) {
		this.galleryManager = ccGalleryManager;
		this.config = ccMenuConfig;
		if (galleryNames != null) {
			this.galleryNames = galleryNames;
		}
	}

	initialize() {				
		this.initializeMenuActivationLinkDOM();
		this.initializeMenuListDOM();
		this.initializeMouseMoveHandler();	
	}

	/* create the menu button on the bottom-right side of the screen */
	initializeMenuActivationLinkDOM() {
		this.menuActivationLinkContainer = document.createElement("div");
		this.menuActivationLinkContainer.id = this.config.menuConfig.menuContainerId;
		this.menuActivationLinkContainer.classList.add(this.config.menuConfig.menuContainerId);

		let menuActivationLink = document.createElement("a");
		menuActivationLink.innerHTML = this.config.menuConfig.buttonContent;
		menuActivationLink.onclick = () => { this.showMenuList(); };
		this.menuActivationLinkContainer.appendChild(menuActivationLink);
		let parentNode = document.getElementById(this.config.galleryParentId);
		parentNode.appendChild(this.menuActivationLinkContainer);
	}

	/* create the popup menu window that contains album links */
	initializeMenuListDOM() {
		this.menuListWindowBackground = document.createElement("div");
		this.menuListWindowBackground.id = "ccGalleryMenuWindowBackground";
		this.menuListWindowBackground.classList.add("ccGalleryMenuWindowBackground");
		this.menuListWindowBackground.onclick = () => { this.hideMenuList(); };

		this.menuListWindow = document.createElement("div");
		this.menuListWindow.id = "ccGalleryMenuWindow";
		this.menuListWindow.classList.add("ccGalleryMenuWindow");

		if (this.config.menuConfig.galleriesTitle != null) {
			let menuListWindowTitle = document.createElement("h1");
			menuListWindowTitle.classList.add("ccGalleryMenuTitle");
			menuListWindowTitle.innerHTML = this.config.menuConfig.galleriesTitle;
			this.menuListWindow.appendChild(menuListWindowTitle);
		}

		for (let galleryName of this.galleryNames) {
			let menuListAlbumLink = document.createElement("a");
			menuListAlbumLink.classList.add("ccGalleryMenuListAlbumLink");
			menuListAlbumLink.innerHTML = galleryName;
			if ("." == galleryName) {
				menuListAlbumLink.innerHTML = "Main";
			}
			menuListAlbumLink.onclick = () => { this.showGallery(galleryName); };
			this.menuListWindow.appendChild(menuListAlbumLink);
		}

		if (this.config.advancedConfig.showGithubLink == true) {
			let githubLink = document.createElement("a");
			githubLink.classList.add("ccGalleryGithubLink");
			githubLink.href = "https://github.com/codercowboy/ccgallery";
			githubLink.innerHTML = "<img src='img/github.png' />";
			this.menuListWindow.appendChild(githubLink);
		}

		let parentNode = document.getElementById(this.config.galleryParentId);
		parentNode.appendChild(this.menuListWindowBackground);
		parentNode.appendChild(this.menuListWindow);
		CCUtil.centerElement(this.menuListWindow);	
	}

	/* creates a listener that auto-hides the menu button when user is idle */
	initializeMouseMoveHandler() {
		// don't auto-hide menu on mobile
		if (this.galleryManager.config.advancedConfig.isMobile == true) {
			return;
		} 
		this.hideMenuActivationLink(true);

		// if user is idle for 3 seconds hide the menu
		let mouseMoveHandler = () => {
			if (this.mouseMoveTimer != null) {
				clearTimeout(this.mouseMoveTimer);
			}
			this.showMenuActivationLink();
			this.mouseMoveTimer = setTimeout(() => {				
				this.hideMenuList();
				this.hideMenuActivationLink(false);
			}, 3000);
		};

		document.addEventListener("mousemove", mouseMoveHandler);
	}

	/* show the menu button */
	showMenuActivationLink() {
		$(this.menuActivationLinkContainer).stop(); // stop current animation if any
		this.menuActivationLinkContainer.style.opacity = "1.0";
	}

	/* hide the menu button */
	hideMenuActivationLink(immediately) {		
		$(this.menuActivationLinkContainer).stop(); // stop current animation if any
		if (immediately) {
			this.menuActivationLinkContainer.style.opacity = "0.0";
		} else {
			$(this.menuActivationLinkContainer).animate( { "opacity":'0.0' }, "slow");
		}
	}

	/* show the menu popup window */
	showMenuList() {
		CCUtil.centerElement(this.menuListWindow);
		this.menuListWindowBackground.style.zIndex = 200;
		this.menuListWindowBackground.style.opacity = "0.0";
		this.menuListWindow.style.opacity = "0.0";
		this.menuListWindow.style.zIndex = 201;
		$(this.menuListWindowBackground).animate( { "opacity":'0.25' }, "slow");
		$(this.menuListWindow).animate( { "opacity":'1.0' }, "slow");
	}

	/* hide the menu popup window */
	hideMenuList() {
		this.menuListWindowBackground.style.opacity = "0.0";
		this.menuListWindowBackground.style.zIndex = 0;		
		this.menuListWindow.style.opacity = "0.0";
		this.menuListWindow.style.zIndex = 0;
	}

	/* called when user clicks an album link on the popup window */
	showGallery(galleryName) {
		this.hideMenuList();
		this.galleryManager.showGallery(galleryName);
	}
}

/* 
	`CCGalleryManager` - manages the galleries (instances of `CCGallery`)

	The `CCGalleryManager` brings all of ccgallery together. It manages
	the per-album `CCGallery` objects, the `CCScreenSaver`, and the 
	`CCMenuManager`.
*/
export class CCGalleryManager {
	config = null;
	
	galleryJsonFileURL = null;
	galleries = [];
	galleryNames = [];
	currentGallery = null;
	menuManager = null;
	screenSaver = null;
	
	constructor(ccGalleryConfig) {
		if (ccGalleryConfig == null) {
			ccGalleryConfig = new CCGalleryConfig();
		}		
		this.config = ccGalleryConfig;
		this.galleryJsonFileURL = this.config.advancedConfig.galleryUrlPrefix + "/" + this.config.advancedConfig.galleryIndexJSONFile;	
	}

	/* register listeners that'll initailize this on page load, 
		and reset the thumbnails when browser resize */
	initializePageHandlers() {
		window.ccGalleryManager = this;
		window.addEventListener("load", () => { this.initialize(); });
		window.addEventListener("resize", () => { this.currentGallery.resetImages(); });
	}	

	async initialize() {
		await this.initializeGalleries();
		this.initializeMenu();
		this.initializeScreenSaver();
	}

	/* load `gallery-index.json` from the web, get gallery names
		from within that index, create `CCGallery` objects for 
		each gallery */
	async initializeGalleries() {
		let galleriesIndex = await CCUtil.loadJSON(this.galleryJsonFileURL);
		this.galleryNames = [];		
		for (let galleryName of galleriesIndex.galleryNames) {
			console.log("Loading gallery '" + galleryName + "'");
			let ccGallery = new CCGallery(this.config, galleryName);
			this.galleries.push(ccGallery);
			this.galleryNames.push(galleryName);
		}		
		if (this.config.allGalleryEnabled == true) {
			let allGallery = await this.createAllGallery();
			this.galleries.unshift(allGallery);
			this.galleryNames.unshift("All");
		}
		if (this.galleries.length > 0) {
			this.showGallery(this.galleries[0].galleryName);
		}
	}

	/* initialize the CCMenuManager, if it's enabled */
	initializeMenu() {
		if (this.config.menuConfig == null || this.config.menuConfig.enabled == false) {
			console.log("Menu is disabled");
			return;
		}

		let galleryCount = this.galleryNames == null ? 0 : this.galleryNames.length;
		if (galleryCount < 2) {
			console.log("Menu is disabled (only " + galleryCount + " gallery configured)");
			return;
		}

		console.log("Menu is enabled");
		this.menuManager = new CCMenuManager(this, this.config, this.galleryNames);
		this.menuManager.initialize();
	}

	/* initialize the CCScreenSaver, if it's enabled */
	initializeScreenSaver() {
		if (this.config.screenSaverConfig == null || this.config.screenSaverConfig.enabled == false) {
			console.log("Screensaver is disabled");
			return;
		}
		console.log("Screensaver is enabled, starting it");
		this.screenSaver = new CCScreenSaver(this, this.config.screenSaverConfig);
		setTimeout(() => { this.screenSaver.start(); }, 1000);		
	}

	/* create the magical 'All' gallery that shows images from all of the
		user's albums */
	async createAllGallery() {
		const start = performance.now();
		console.log("Creating 'all' gallery");
		let allGallery = new CCGallery(this.config, "All");
		let tmpImages = [];
		for (let gallery of this.galleries) {
			const loadStart = performance.now();				
			await gallery.loadImages();			
			const loadEnd = performance.now();
			console.log("Loaded images for '" + gallery.galleryName + "' gallery in " + (loadEnd - loadStart) + "ms");
			tmpImages = tmpImages.concat(gallery.images);
		}
		allGallery.imagesLoaded = true;
		allGallery.images = tmpImages;
		// don't let the 'all' gallery load the images list from the web
		allGallery.loadImages = async () => {};
		allGallery.unloadImages = async () => {};
		const end = performance.now();
		console.log("Finished creating 'all' gallery in " + (end - start) + "ms");
		return allGallery;
	}

	/* show the given gallery */
	showGallery(galleryName) {
		for (let gallery of this.galleries) {
			if (gallery.galleryName == galleryName) {
				console.log("Showing gallery: " + galleryName);
				if (this.currentGallery != null) {
					this.currentGallery.unload();
				}
				this.currentGallery = gallery;
				this.currentGallery.load();
			}
		}
	}
}
