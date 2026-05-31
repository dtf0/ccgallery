class CCUtil {
	static async loadJSON(file) {
	  try {
	    console.log("Fetching json file: " + file);
	    // let jsonData = require(file);
	    const response = await fetch(file); // Adjust the path as needed
	    if (!response.ok) {
	      console.log("Error fetching json '" + file + "'", response);
	    }
	    const jsonData = await response.json(); // Parses the JSON data into a JS object
	    //console.log({ json: jsonData });
	    return jsonData;
	  } catch (error) {
	    console.error("Error fetching JSON file: "+ file, error);
	  }
	}
}

class CCGalleryThumbnail {
	ccGallery = null;
	imgData = null;
	x = null;
	y = null;
	thumbnailImage = null;

	constructor(ccGallery, imgData, x, y) {
		this.ccGallery = ccGallery;
		this.imgData = imgData;
		this.x = x;
		this.y = y;
		
		this.thumbnailImage = this.createThumbnailImageElement(imgData, x, y);
	}

	createThumbnailImageElement(imgData, x, y) {
		let ccThumbnail = this;

		let thumbnailImg = document.createElement('img');		
		thumbnailImg.ccThumbnail = this;

		thumbnailImg.src = this.ccGallery.urlPrefix + "/" + imgData.thumbnail.file;
		thumbnailImg.onload = this.handleOnLoad;
		if (!ccGallery.isMobile) {
			thumbnailImg.onmouseover = this.handleMouseOver;
			thumbnailImg.onmouseout = this.handleMouseOut;
		}
		thumbnailImg.onclick = this.handleOnClick;

		thumbnailImg.style.width = imgData.thumbnail.width + "px";
		thumbnailImg.style.height = imgData.thumbnail.height + "px";
		thumbnailImg.style.left = x + "px";
		thumbnailImg.style.top = y + "px";
		thumbnailImg.style.opacity = "0.0";
		thumbnailImg.style.zindex = 10;

		this.thumbnailImg = thumbnailImg;

		return thumbnailImg;
	}

	handleOnLoad() {
		let ccGallery = this.ccThumbnail.ccGallery;
		let randomDelay = 100 * (Math.floor(Math.random() * 10)+1);
		$(this).animate({ opacity:ccGallery.onImageLoadOpacity }, randomDelay);
	}

	handleOnClick() {		
		this.ccThumbnail.ccGallery.showBigImage(this.ccThumbnail);
	}

	handleMouseOver() {
		let animationConfig = {
			"opacity": "1.0",
			"width": "+=16px",
			"height": "+=16px",
			"left": "-=8px",
			"top": "-=8px",
			"zIndex": 20,
		}
		$(this).animate(animationConfig, 200);
	}

	handleMouseOut() {
		let animationConfig = {
			"opacity": "0.5",
			"width": "-=16px",
			"height": "-=16px",
			"left": "+=8px",
			"top": "+=8px",
			"zIndex": 10,
		}
		$(this).animate(animationConfig, "slow");
	}	
}

class CCGalleryBigImage {
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

	// first we show a image scaling operation that's just the 
	// thumbnail scaling up to the "big image" size
	showScaledImage() {
		let scaledImage = document.createElement('img');
		scaledImage.id = "scaledImage";
		scaledImage.ccBigImage = this;

		scaledImage.src = this.ccGallery.urlPrefix + "/" + this.ccThumbnail.imgData.thumbnail.file;
		scaledImage.onload = this.handleScaledImageLoad;
		scaledImage.onclick = () => { this.ccBigImage.ccGallery.hideBigImage; };
		
		scaledImage.style.zIndex = 60;		
		scaledImage.style.opacity = "0.0";
		scaledImage.style.width = this.ccThumbnail.imgData.thumbnail.width + "px";
		scaledImage.style.height = this.ccThumbnail.imgData.thumbnail.height + "px";
		scaledImage.style.left = this.ccThumbnail.x + "px";
		scaledImage.style.top = this.ccThumbnail.y + "px";		
		
		this.ccGallery.galleryContainer.appendChild(scaledImage);		

		this.scaledImage = scaledImage;
	}

	handleScaledImageLoad() {
		let ccBigImage = this.ccBigImage;
		let ccGallery = this.ccBigImage.ccGallery;
		ccGallery.showLoading();
		ccGallery.showPhotoOverlay(this.ccBigImage.bigImageConfig);

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

	showBigImage() {
		let bigImage = document.createElement('img');
		bigImage.id = "bigImage";
		bigImage.ccBigImage = this;

		bigImage.src = this.ccGallery.urlPrefix + "/" + this.ccThumbnail.imgData.original.file;
		bigImage.onload = this.handleBigImageLoad;
		bigImage.onclick = () => { this.ccGallery.hideBigImage(); };
		
		bigImage.style.zIndex = 70;
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
		if (this.scaledImage) {			
			this.ccGallery.galleryContainer.removeChild(this.scaledImage);	
		}
		if (this.bigImage) {			
			this.ccGallery.galleryContainer.removeChild(this.bigImage);	
		}
	}	

	calculateBigImageConfig(ccGallery, imgData) {	
		let galleryContainer = ccGallery.galleryContainer;
		
		var maxH = galleryContainer.clientHeight - 100;
		var maxW = galleryContainer.clientWidth - 100;
		var ow = imgData.original.width;
		var oh = imgData.original.height;
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

		console.log("Original dims: " + ow + "x" + oh + ", Scaled: " + newW + "x" + newH);
		console.log("New placement: " + newX + "x" + newY);

		return { "x":newX, "y":newY, "w":newW, "h":newH };
	}
}

class CCGallery {
	containerId = null;
	preloaderId = null;
	photoOverlayId = null;

	isMobile = null;
	onImageLoadOpacity = 1.0;
	urlPrefix = null;	
	
	lastBigImage = null;
	thumbnails = [];

	constructor(containerId, preloaderId, photoOverlayId) {
		this.containerId = containerId;
		this.preloaderId = preloaderId;
		this.photoOverlayId = photoOverlayId;

		this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);		
		this.onImageLoadOpacity = this.isMobile ? 1.0 : 0.5;
		this.urlPrefix = "gallery"
		console.log("isMobile: " + CCGallery.isMobile);
	}

	initializePageHandlers() {
		window.ccGallery = this;
		window.onload = this.firstLoadHandler;
		window.onresize = this.resetImages;
	}

	showBigImage(ccThumbnail) {
		this.hideBigImage();
		let bigImage = new CCGalleryBigImage(this, ccThumbnail);
		bigImage.showScaledImage();
		this.lastBigImage = bigImage;
	}	

	hideBigImage() {
		this.hideLoading();
		if (this.lastBigImage) {
			this.lastBigImage.hide();
			this.lastBigImage = null;
		}		
		this.hidePhotoOverlay();		
	}	

	async firstLoadHandler() {
		let ccGallery = window.ccGallery;
		ccGallery.galleryContainer = document.getElementById(ccGallery.containerId);
		
		let data = await CCUtil.loadJSON(ccGallery.urlPrefix + "/galleries.json");
		ccGallery.name = data.name;
		ccGallery.images = data.images;
		console.log("gallery name: " + ccGallery.name + ", images:", ccGallery.images);
		
		ccGallery.resetImages();
	}

	showLoading() {
		$("#" + this.preloaderId).animate( { "opacity":'1.0' }, "slow");
	}

	hideLoading() {
		$("#" + this.preloaderId).stop();
		document.getElementById(this.preloaderId).style.opacity = "0.0";
	}	

	showPhotoOverlay(bigImageConfig) {
		let overlay = document.getElementById(this.photoOverlayId);
		overlay.style.width = bigImageConfig.w + "px";
		overlay.style.left = bigImageConfig.x + "px";
		overlay.style.top = (bigImageConfig.y + bigImageConfig.h) + "px";
		overlay.style.opacity = "1.0";
		overlay.style.zIndex = 200;
		overlay.ccGallery = this;
		overlay.onclick = () => { this.ccGallery.hideBigImage; };
	}

	hidePhotoOverlay(bigImageConfig) {
		let overlay = document.getElementById(this.photoOverlayId);
		overlay.style.opacity = "0.0";
		overlay.style.zIndex = 0;		
	}

	resetImages() {
		// remove all children of container		
		while (this.galleryContainer.firstChild) {
			this.galleryContainer.removeChild(this.galleryContainer.firstChild);
		}

		// re-center preloader in case browser resized
		let preloader = document.getElementById(this.preloaderId);
		preloader.style.left = ((window.innerWidth - 32) / 2) + "px";
		preloader.style.top = ((window.innerHeight - 32) / 2) + "px";
		
		let containerHeight = this.galleryContainer.clientHeight;
		let containerWidth = this.galleryContainer.clientWidth;
		let currentThumbnailX = -50; 
		let currentThumbnailY = -50;
		let imagesToUse = this.images.slice();

		while (currentThumbnailY < (containerHeight + 50)) {
			while (currentThumbnailX < containerWidth) {
				let imgIndex = Math.floor(Math.random() * (imagesToUse.length));
				let imgData = imagesToUse[imgIndex];
				imagesToUse.splice(imgIndex, 1);
				if (imagesToUse.length == 0) {
					imagesToUse = this.images.slice();
				}

				let ccThumbnail = new CCGalleryThumbnail(this, imgData, currentThumbnailX, currentThumbnailY);
				this.galleryContainer.appendChild(ccThumbnail.thumbnailImage);				
				this.thumbnails.push(ccThumbnail);

				currentThumbnailX += imgData.thumbnail.width + 4;
			}
			currentThumbnailY += 104;
			currentThumbnailX = -50;
		}
	}
}

class CCGalleryInfo {
	constructor(name, images) {
		this.name = name;
		this.images = images;
	}
}

var gallery = new CCGallery("bg", "preloader", "photooverlay");
gallery.initializePageHandlers();
