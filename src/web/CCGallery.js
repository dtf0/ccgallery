import CCUtil from "./CCUtil.js";

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

	createThumbnailImageElement() {
		let ccThumbnail = this;

		let thumbnailImg = document.createElement('img');		
		thumbnailImg.ccThumbnail = this;

		thumbnailImg.src = this.imgData.thumbnailImgSrc;

		thumbnailImg.onload = this.handleOnLoad;
		if (!this.ccGallery.config.advancedConfig.isMobile) {
			thumbnailImg.onmouseover = () => { this.enlarge(200, 200, 15);} ;
			thumbnailImg.onmouseout = () => { this.shrink(400); };
		}
		thumbnailImg.onclick = this.handleOnClick;

		thumbnailImg.style.width = this.width + "px";		
		thumbnailImg.style.height = this.height + "px";
		thumbnailImg.style.left = this.x + "px";
		thumbnailImg.style.top = this.y + "px";
		thumbnailImg.style.opacity = "0.0";
		thumbnailImg.style.zindex = 10;

		this.thumbnailImg = thumbnailImg;

		return thumbnailImg;
	}

	handleOnLoad() {
		let ccGallery = this.ccThumbnail.ccGallery;
		let randomDelay = 100 * (Math.floor(Math.random() * 10)+1);
		$(this).animate({ opacity:0.5 }, randomDelay);
	}

	handleOnClick() {		
		this.ccThumbnail.ccGallery.showBigImage(this.ccThumbnail);
	}

	enlarge(animationTimeMillis, zIndexOffset, percentageIncrease) {
		if (this.thumbnailImg == null) {
			return;
		}
		if (zIndexOffset == null) {
			zIndexOffset = 0;
		}
		this.thumbnailImg.style.zIndex = 20 + zIndexOffset;	

		let widthOffSet = Math.floor((this.width / 100) * percentageIncrease);
		let targetWidth = this.width + widthOffSet; 

		let heightOffSet = Math.floor((this.height / 100) * percentageIncrease);
		let targetHeight = this.height + heightOffSet; 

		let left = this.x - Math.floor(widthOffSet / 2);
		let top = this.y - Math.floor(heightOffSet / 2);

		let sizeAnimationConfig = {
			"width": targetWidth + "px",
			"height": targetHeight + "px",
			"left": left + "px",
			"top": top + "px",
			"easing": "swing"
		}

		$(this.thumbnailImg).stop(); // stop current animation if any
		this.thumbnailImg.style.opacity = 1.0;
		$(this.thumbnailImg).animate(sizeAnimationConfig, animationTimeMillis);	
	}

	shrink(animationTimeMillis) {
		if (this.thumbnailImg == null || this.enlarged == true) {
			return;
		}
		let sizeAnimationConfig = {
			"width": this.width + "px",
			"height": this.height + "px",
			"left": this.x + "px",
			"top": this.y + "px",
			"easing": "linear"
		}

		let finishedCallback = () => { 
			this.enlarged = false; 
			this.thumbnailImg.style.zIndex = 10;
		}

		if (animationTimeMillis < 500) {
			sizeAnimationConfig.opacity = "0.5";
			$(this.thumbnailImg).stop(); // stop current animation if any
			$(this.thumbnailImg).animate(sizeAnimationConfig, animationTimeMillis, finishedCallback);
		} else {
			let opacityAnimationConfig = {
				"opacity": "0.5",
				"easing": "linear"
			}
			let opacityAnimationTime = 1000;
			
			let sizeAnimationFinishedCallback = () => {
				$(this.thumbnailImg).animate(opacityAnimationConfig, opacityAnimationTime, finishedCallback);
			}

			$(this.thumbnailImg).stop(); // stop current animation if any			
			$(this.thumbnailImg).animate(sizeAnimationConfig, animationTimeMillis, sizeAnimationFinishedCallback);
		}
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
	images = [];
	imagesLoaded = false;

	constructor(galleryConfig, galleryName) {
		this.config = galleryConfig;
		this.galleryName = galleryName;
		this.urlPrefix = this.config.advancedConfig.galleryUrlPrefix + "/" + galleryName;
		this.galleryJsonFileURL = this.urlPrefix + "/" + this.config.advancedConfig.galleryJSONFile;		
	}

	async load() {
		CCUtil.removeElementChildren(this.config.galleryParentId);
		this.galleryContainer = CCUtil.createElementChild(this.config.galleryParentId, "div", this.config.advancedConfig.galleryContainerId);
		if (this.config.advancedConfig.preloaderImageURL != null) {
			this.preloader = CCUtil.createElementChild(this.config.galleryParentId, "img", this.config.advancedConfig.preloaderId);
			this.preloader.src = this.config.advancedConfig.preloaderImageURL;
		}
		if (this.config.photoOverlayContent != null) {
			this.photoOverlay = CCUtil.createElementChild(this.config.galleryParentId, "div", this.config.advancedConfig.photoOverlayId);
			this.photoOverlay.innerHTML = this.config.photoOverlayContent;
		}	

		this.resetImages();
	}

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

	unloadImages() {
		this.images = [];
		this.imagesLoaded = false;
	}

	unload() {
		this.hideBigImage();
		for (let thumbnail of this.thumbnails) {
			thumbnail.destroy();
		}
		this.thumbnails = [];
		CCUtil.removeElementChildren(this.config.galleryParentId);
		this.unloadImages();
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
		if (this.preloader == null) {
			return;
		}
		$(this.preloader).animate( { "opacity":'1.0' }, "slow");
	}

	hideLoading() {
		if (this.preloader == null) {
			return;
		}
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
		this.photoOverlay.style.zIndex = 501;
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

	async resetImages() {
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
		await this.loadImages();
		let imagesCopy = this.images;
		let imagesToUse = imagesCopy.slice();

		let rowHeightPixels = this.config.rowHeightPixels;
		let gallerySpecificRowHeightPixels = this.config.advancedConfig.gallerySpecificRowHeightsPixels[this.galleryName];
		if (gallerySpecificRowHeightPixels != null) {
			rowHeightPixels = gallerySpecificRowHeightPixels;
		}
		let thumbnailBorderPixels = this.config.thumbnailBorderPixels;

		while (currentThumbnailY < (containerHeight + 50)) {
			while (currentThumbnailX < containerWidth) {
				let imgIndex = Math.floor(Math.random() * (imagesToUse.length));
				let imgData = imagesToUse[imgIndex];
				imagesToUse.splice(imgIndex, 1);
				if (imagesToUse.length == 0) {
					imagesToUse = imagesCopy.slice();
				}

				let ccThumbnail = new CCGalleryThumbnail(this, imgData, currentThumbnailX, currentThumbnailY, rowHeightPixels);
				this.galleryContainer.appendChild(ccThumbnail.createThumbnailImageElement());				
				this.thumbnails.push(ccThumbnail);

				currentThumbnailX += ccThumbnail.width + thumbnailBorderPixels;
			}
			currentThumbnailY += rowHeightPixels + thumbnailBorderPixels;
			currentThumbnailX = -50;
		}
	}
}

export class CCScreenSaverConfig {
	// is screensaver enabled? note: checked at system boot time, not runtime configurable
	enabled = true;
	// how long do we delay before animating next thumbnail?
	runIntervalMillis = 5000;
	// min x-coord pixel distance from previous thumbnail when choosing next thumbnail
	minXDistanceFromLastThumbnail = 150;
	// min y-coord pixel distance from previous thumbnail when choosing next thumbnail
	minYDistanceFromLastThumbnail = 150;
	// how long should the enlarging resize animation last?
	enlargeTimeMillis = 3000;
	// how long should we delay after enlarge and before shrink?
	pauseTimeMillis = 5000;
	// how long should the shrinking resize animation last?
	shrinkTimeMillis = 2000;	
}

export class CCScreenSaver {
	galleryManager = null;
	running = false;
	lastThumbnail = null;
	config = null;
	zIndexOffset = 10;
	menuManager = null;
	mouseMoveTimer = null;

	constructor(ccGalleryManager, ccScreenSaverConfig, ccMenuManager) {
		this.galleryManager = ccGalleryManager;
		this.config = ccScreenSaverConfig;
		this.menuManager = ccMenuManager;
	}

	start() {
		this.running = true;
		this.run();
		this.initializeMouseMoveHandler();
	}

	initializeMouseMoveHandler() {
		// don't auto-hide menu/cursor on mobile
		if (this.galleryManager.config.advancedConfig.isMobile == true) {
			return;
		} 
		if (this.menuManager != null) {
			this.menuManager.hideMenuActivationLink(true);
		}

		// if user is idle for 3 seconds and we have screensaver, hide the menu
		let mouseMoveHandler = () => {
			if (this.mouseMoveTimer != null) {
				clearTimeout(this.mouseMoveTimer);
			}
			document.body.style.cursor = 'default';
			if (this.menuManager != null) {
				this.menuManager.showMenuActivationLink();
			}			
			this.mouseMoveTimer = setTimeout(() => {				
				if (this.menuManager != null) {
					this.menuManager.hideMenuList();
					this.menuManager.hideMenuActivationLink(false);
				}
				document.body.style.cursor = 'none';
			}, 3000);
		};

		document.addEventListener("mousemove", mouseMoveHandler);
	}

	stop() {
		this.running = false;
	}

	// animate a single thumbnail enlarging / shrinking
	run() {
		if (this.running == false) {
			return;
		}

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
			setTimeout(() => { this.run(); }, this.config.runIntervalMillis);
			return;
		}

		this.zIndexOffset += 10;
		if (this.zIndexOffset > 50) {
			this.zIndexOffset = 10;
		}

		const randomWaitTime = Math.floor(Math.random() * 1000);			
		setTimeout(() => { this.animateThumbnail(this.zIndexOffset, thumbnailIndex); }, randomWaitTime);

		setTimeout(() => { this.run(); }, this.config.runIntervalMillis);
	}

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

	getThumbnails() {
		let gallery = this.galleryManager.currentGallery;
		if(gallery == null) {
			return null;
		}

		let thumbnails = gallery.thumbnails;
		if (thumbnails == null || thumbnails.length == 0) {
			return null;
		}

		let containerHeight = gallery.galleryContainer.clientHeight;
		let containerWidth = gallery.galleryContainer.clientWidth;

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

	getRandomThumbnail() {
		let thumbnailIndex = this.getRandomThumbnailIndex();
		let thumbnail = this.getThumbnail(thumbnailIndex);
		return thumbnail;
	}

	getRandomThumbnailIndex() {		
		let thumbnails = this.getThumbnails();
		if (thumbnails != null && thumbnails.length != 0) {
			let randomThumbNailIndex = Math.floor(Math.random() * thumbnails.length);
			return randomThumbNailIndex;
		}
		return null;
	}

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

export class CCMenuConfig {
	enabled = true;
	buttonContent = "&#9776;";
	galleriesTitle = "Galleries";
	menuContainerId = "ccGalleryMenu";
}

export class CCMenuManager {
	config = null;
	galleryNames = [];
	galleryManager = null;
	currentGalleryIndex = 0;	
	menuListWindow = null;
	mouseMoveTimer = null;
	
	constructor(ccGalleryManager, ccMenuConfig, galleryNames) {
		this.galleryManager = ccGalleryManager;
		this.config = ccMenuConfig;
		if (galleryNames != null) {
			this.galleryNames = galleryNames;
		}
	}

	initializeMenu() {				
		this.initializeMenuActivationLinkDOM();
		this.initializeMenuListDOM();
		this.initializeMouseMoveHandler();	
	}

	initializeMenuActivationLinkDOM() {
		this.menuActivationLinkContainer = document.createElement("div");
		this.menuActivationLinkContainer.id = this.config.menuConfig.menuContainerId;

		let menuActivationLink = document.createElement("a");
		menuActivationLink.innerHTML = this.config.menuConfig.buttonContent;
		menuActivationLink.onclick = () => { this.showMenuList(); };
		this.menuActivationLinkContainer.appendChild(menuActivationLink);
		let parentNode = document.getElementById(this.config.galleryParentId).parentNode;
		parentNode.appendChild(this.menuActivationLinkContainer);
	}

	initializeMenuListDOM() {
		this.menuListWindowHolder = document.createElement("div");
		this.menuListWindowHolder.id = "ccGalleryMenuWindowHolder";
		this.menuListWindowHolder.classList.add("ccGalleryMenuWindowHolder");
		this.menuListWindowHolder.onclick = () => { this.hideMenuList(); };

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
			menuListAlbumLink.classList.add("menuListAlbumLink");
			menuListAlbumLink.innerHTML = galleryName;
			if ("." == galleryName) {
				menuListAlbumLink.innerHTML = "Main";
			}
			menuListAlbumLink.onclick = () => { this.showGallery(galleryName); };
			this.menuListWindow.appendChild(menuListAlbumLink);
		}

		if (this.config.advancedConfig.showGithubLink == true) {
			let githubLink = document.createElement("a");
			githubLink.classList.add("githubLink");
			githubLink.href = "https://github.com/codercowboy/ccgallery";
			githubLink.innerHTML = "<img src='img/github.png' />";
			this.menuListWindow.appendChild(githubLink);
		}

		let parentNode = document.getElementById(this.config.galleryParentId).parentNode;
		parentNode.appendChild(this.menuListWindowHolder);
		parentNode.appendChild(this.menuListWindow);
		CCUtil.centerElement(this.menuListWindow);	
	}

	initializeMouseMoveHandler() {
		// don't auto-hide menu/cursor on mobile
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

	showMenuActivationLink() {
		$(this.menuActivationLinkContainer).stop(); // stop current animation if any
		this.menuActivationLinkContainer.style.opacity = "1.0";
	}

	hideMenuActivationLink(immediately) {		
		$(this.menuActivationLinkContainer).stop(); // stop current animation if any
		if (immediately) {
			this.menuActivationLinkContainer.style.opacity = "0.0";
		} else {
			$(this.menuActivationLinkContainer).animate( { "opacity":'0.0' }, "slow");
		}
	}

	showMenuList() {
		CCUtil.centerElement(this.menuListWindow);
		this.menuListWindowHolder.style.zIndex = 200;
		this.menuListWindowHolder.style.opacity = "0.0";
		this.menuListWindow.style.opacity = "0.0";
		this.menuListWindow.style.zIndex = 201;
		$(this.menuListWindowHolder).animate( { "opacity":'0.25' }, "slow");
		$(this.menuListWindow).animate( { "opacity":'1.0' }, "slow");
	}

	hideMenuList() {
		this.menuListWindowHolder.style.opacity = "0.0";
		this.menuListWindowHolder.style.zIndex = 0;		
		this.menuListWindow.style.opacity = "0.0";
		this.menuListWindow.style.zIndex = 0;
	}

	showGallery(galleryName) {
		this.hideMenuList();
		this.galleryManager.showGallery(galleryName);
	}
}

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

	initializePageHandlers() {
		window.ccGalleryManager = this;
		window.addEventListener("load", () => { this.pageLoadHandler(); });
		window.addEventListener("resize", () => { this.currentGallery.resetImages(); });
	}	

	async pageLoadHandler() {
		await this.initializeGalleries();
		this.initializeMenu();
		this.initializeScreenSaver();
	}

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
		this.menuManager.initializeMenu();
	}

	initializeScreenSaver() {
		if (this.config.screenSaverConfig == null || this.config.screenSaverConfig.enabled == false) {
			console.log("Screensaver is disabled");
			return;
		}
		console.log("Screensaver is enabled, starting it");
		this.screenSaver = new CCScreenSaver(this, this.config.screenSaverConfig, this.menuManager);
		setTimeout(() => { this.screenSaver.start(); }, 1000);		
	}

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

export class CCAdvancedConfig {
	isMobile = false;
	galleryContainerId = "ccGalleryContainer";
	preloaderId = "ccGalleryPreloader";
	preloaderImageURL = "img/loading.gif";
	photoOverlayId = "ccGalleryPhotoOverlay";
	galleryJSONFile = "gallery.json"
	galleryIndexJSONFile = "gallery-index.json"
	centeredBigImageYOffset = 0;
	galleryUrlPrefix = "gallery"
	gallerySpecificRowHeightsPixels = {};
	showGithubLink = false;
	constructor() {
		this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);		
		this.centeredBigImageYOffset = this.isMobile ? 50 : 0;
	}
}

export class CCGalleryConfig {
	galleryParentId = "gallery";
	allGalleryEnabled = true;
	rowHeightPixels = 100;
	thumbnailBorderPixels = 4;
	photoOverlayContent = null;			
	screenSaverConfig = null;
	menuConfig = null;
	advancedConfig = null;

	constructor() {
		this.screenSaverConfig = new CCScreenSaverConfig();
		this.screenSaverConfig.enabled = true;
		this.menuConfig = new CCMenuConfig();
		this.menuConfig.enabled = true;
		this.advancedConfig = new CCAdvancedConfig();
	}
}
