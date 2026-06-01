import CCUtil from "./CCUtil.js";

export class CCGalleryThumbnail {
	ccGallery = null;
	imgData = null;
	x = null;
	y = null;

	constructor(ccGallery, imgData, x, y) {
		this.ccGallery = ccGallery;
		this.imgData = imgData;
		this.x = x;
		this.y = y;		
	}

	destroy() {
		this.ccGallery = null;
		this.imgData = null;
	}

	createThumbnailImageElement() {
		let ccThumbnail = this;

		let thumbnailImg = document.createElement('img');		
		thumbnailImg.ccThumbnail = this;

		thumbnailImg.src = this.ccGallery.urlPrefix + "/" + this.imgData.thumbnail.file;

		thumbnailImg.onload = this.handleOnLoad;
		if (!this.ccGallery.config.isMobile) {
			thumbnailImg.onmouseover = this.handleMouseOver;
			thumbnailImg.onmouseout = this.handleMouseOut;
		}
		thumbnailImg.onclick = this.handleOnClick;

		thumbnailImg.style.width = this.imgData.thumbnail.width + "px";
		thumbnailImg.style.height = this.imgData.thumbnail.height + "px";
		thumbnailImg.style.left = this.x + "px";
		thumbnailImg.style.top = this.y + "px";
		thumbnailImg.style.opacity = "0.0";
		thumbnailImg.style.zindex = 10;

		return thumbnailImg;
	}

	handleOnLoad() {
		let ccGallery = this.ccThumbnail.ccGallery;
		let randomDelay = 100 * (Math.floor(Math.random() * 10)+1);
		$(this).animate({ opacity:ccGallery.config.onImageLoadOpacity }, randomDelay);
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
		this.ccGallery.showPhotoOverlay(this.bigImageConfig);

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

	constructor(galleryConfig, galleryName) {
		this.config = galleryConfig;
		this.galleryName = galleryName;
		this.urlPrefix = this.config.galleryUrlPrefix + "/" + galleryName;
		this.galleryJsonFileURL = this.urlPrefix + "/" + this.config.galleryJSONFile;		
	}

	async load() {
		let data = await CCUtil.loadJSON(this.galleryJsonFileURL);
		this.name = data.name;
		this.images = data.images;	

		CCUtil.removeElementChildren(this.config.galleryParentId);
		this.galleryContainer = CCUtil.createElementChild(this.config.galleryParentId, "div", this.config.containerId);
		this.preloader = CCUtil.createElementChild(this.config.galleryParentId, "div", this.config.preloaderId);
		if (this.config.photoOverlayContent != null) {
			this.photoOverlay = CCUtil.createElementChild(this.config.galleryParentId, "div", this.config.photoOverlayId);
			this.photoOverlay.innerHTML = this.config.photoOverlayContent;
		}	

		this.resetImages();
	}

	unload() {
		this.hideBigImage();
		for (let thumbnail of this.thumbnails) {
			thumbnail.destroy();
		}
		this.thumbnails = [];		
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
			this.lastBigImage.destroy();
			this.lastBigImage = null;
		}		
		this.hidePhotoOverlay();		
	}		

	showLoading() {
		$(this.preloader).animate( { "opacity":'1.0' }, "slow");
	}

	hideLoading() {
		$(this.preloader).stop();
		this.preloader.style.opacity = "0.0";
	}	

	showPhotoOverlay(bigImageConfig) {
		if (this.photoOverlay == null) {
			return;
		}
		let topStyle = (bigImageConfig.y + bigImageConfig.h) - this.photoOverlay.offsetHeight;
		
		this.photoOverlay.style.width = bigImageConfig.w + "px";
		this.photoOverlay.style.left = bigImageConfig.x + "px";		
		this.photoOverlay.style.top = topStyle + "px";
		this.photoOverlay.style.zIndex = 200;
		this.photoOverlay.ccGallery = this;
		this.photoOverlay.onclick = () => { this.hideBigImage; };

		$(this.photoOverlay).animate( { "opacity":'1.0' }, "slow");
	}

	hidePhotoOverlay(bigImageConfig) {
		if (this.photoOverlay == null) {
			return;
		}
		this.photoOverlay.style.opacity = "0.0";
		this.photoOverlay.style.zIndex = 0;		
	}

	resetImages() {
		CCUtil.removeElementChildren(this.config.containerId);		

		// re-center preloader in case browser resized
		this.preloader.style.left = ((window.innerWidth - 32) / 2) + "px";
		this.preloader.style.top = ((window.innerHeight - 32) / 2) + "px";
		
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
				this.galleryContainer.appendChild(ccThumbnail.createThumbnailImageElement());				
				this.thumbnails.push(ccThumbnail);

				currentThumbnailX += imgData.thumbnail.width + 4;
			}
			currentThumbnailY += 104;
			currentThumbnailX = -50;
		}
	}
}

export class CCGalleryConfig {
	galleryParentId = "gallery";
	downloadsEnabled = true;
	containerId = "ccGalleryContainer";
	preloaderId = "ccGalleryPreloader";
	photoOverlayId = "ccGalleryPhotoOverlay";
	isMobile = null;
	onImageLoadOpacity = 1.0;
	galleryUrlPrefix = "gallery"
	galleryJSONFile = "gallery.json"
	galleryIndexJSONFile = "gallery-index.json"
	phootOverlayContent = null;

	constructor() {
		this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);		
		this.onImageLoadOpacity = this.isMobile ? 1.0 : 0.5;
	}
}

export class CCGalleryManager {
	config = null;
	
	galleryJsonFileURL = null;
	galleries = [];
	currentGallery = null;
	currentGalleryIndex = 0;
	
	constructor(ccGalleryConfig) {
		if (ccGalleryConfig == null) {
			ccGalleryConfig = new CCGalleryConfig();
		}		
		this.config = ccGalleryConfig;

		this.galleryJsonFileURL = this.config.galleryUrlPrefix + "/" + this.config.galleryIndexJSONFile;	
	}

	initializePageHandlers() {
		window.ccGalleryManager = this;
		window.onload = () => { this.firstLoadHandler(); };
		window.onresize = () => { this.currentGallery.resetImages(); }
	}

	async firstLoadHandler() {
		let galleriesIndex = await CCUtil.loadJSON(this.galleryJsonFileURL);
		// console.log("galleriesIndex", galleriesIndex);
		for (let galleryName of galleriesIndex.galleryNames) {
			console.log("Loading gallery '" + galleryName + "'");
			let ccGallery = new CCGallery(this.config, galleryName);
			if (this.currentGallery == null) {
				this.currentGallery = ccGallery;
				ccGallery.load();
			}
			this.galleries.push(ccGallery);
		}
		this.initializeMenu();
	}

	initializeMenu() {
		let menuButton = document.getElementById("menuButton");
		menuButton.onclick = () => {
			if (this.currentGallery != null) {
				this.currentGallery.unload();
			}
			if (this.galleries.length > 0) {
				this.currentGalleryIndex += 1;
				if (this.currentGalleryIndex == this.galleries.length) {
					this.currentGalleryIndex = 0;
				}
				this.currentGallery = this.galleries[this.currentGalleryIndex];
				this.currentGallery.load();
				console.log("Loading gallery: " + this.currentGallery.galleryName);
			}
		};
	}
}