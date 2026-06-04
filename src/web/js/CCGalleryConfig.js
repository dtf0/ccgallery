/*
	CCGalleryConfig.js - a collection of config classes for CCGallery
	Copyright 2026, Jason Baker (jason@onejasonforsale.com)
	Github for this project: https://github.com/codercowboy/ccgallery
*/

export class CCGalleryConfig {
	galleryParentId = "ccGallery";
	allGalleryEnabled = false;
	rowHeightPixels = 50;
	thumbnailBorderPixels = 2;
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

	logToConsole(asJSON) {
		let itemToLog = this;
		if (asJSON == true) {
			itemToLog = JSON.stringify(itemToLog, null, "  ");
		}
		console.log("CCGalleryConfig logging itself via CCGalleryConfig.logToConsole()\n\n", itemToLog);
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

export class CCMenuConfig {
	enabled = true;
	buttonContent = "&#9776;";
	galleriesTitle = "Albums";
	menuContainerId = "ccGalleryMenuButton";
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
