var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

console.log("isMobile: " + isMobile);

var onImageLoadOpacity = isMobile ? 1.0 : 0.5;
var bigImageOffset = isMobile ? 0 : 50;

var images = [
		{ "w":133, "h":100, "ow":960, "oh":720, "f":"20171009 214330JB IMG_9946.JPG" },
		{ "w":75, "h":100, "ow":720, "oh":960, "f":"20190301 095437J IMG_4593.JPG" },
		{ "w":133, "h":100, "ow":960, "oh":720, "f":"IMG_5421.JPG" },
		{ "w":178, "h":100, "ow":960, "oh":539, "f":"43CBD242-0E7F-468A-94C8-8DDA60DF745E.JPG" },
		{ "w":178, "h":100, "ow":960, "oh":539, "f":"20181010 172900JB IMG_0024.JPG" },
		{ "w":133, "h":100, "ow":960, "oh":720, "f":"IMG_5806.JPG" },
		{ "w":75, "h":100, "ow":720, "oh":960, "f":"20180304 090402JB IMG_4766.JPG" },
		{ "w":133, "h":100, "ow":2048, "oh":1536, "f":"1559381_10104576637558520_6675672940515010632_o.jpg" },
		{ "w":74, "h":100, "ow":710, "oh":960, "f":"10424315_10106296658083600_5492889673950027115_n.jpg" },
		{ "w":71, "h":100, "ow":685, "oh":960, "f":"20181008 214123J 01A517D2-DBBD-4559-8F6B-3516925DB937a.JPG" },
		{ "w":133, "h":100, "ow":960, "oh":720, "f":"20180610 055057J IMG_9341.JPG" },
		{ "w":135, "h":100, "ow":960, "oh":710, "f":"10482344_10105961075289210_6738968415843633999_n.jpg" },
		{ "w":130, "h":100, "ow":960, "oh":740, "f":"10885095_10105514194531830_1229895107915387346_n.jpg" },
		{ "w":135, "h":100, "ow":2048, "oh":1516, "f":"11958269_10106620915294550_9173353462311355042_o.jpg" },
		{ "w":76, "h":100, "ow":730, "oh":960, "f":"11034298_10105821786649760_136648158321771197_n.jpg" },
		{ "w":75, "h":100, "ow":720, "oh":960, "f":"20190209 160853JB IMG_4277.JPG" },
		{ "w":207, "h":100, "ow":1326, "oh":640, "f":"11958073_10106894234131410_718149436825486351_o.jpg" },
		{ "w":151, "h":100, "ow":2048, "oh":1360, "f":"11157572_10106084842643440_6985572891163706419_o.jpg" },
		{ "w":100, "h":100, "ow":960, "oh":960, "f":"163571_10103126862045270_2096238287_n.jpg" },
		{ "w":75, "h":100, "ow":720, "oh":960, "f":"20180517 200146J IMG_8521.JPG" },
		{ "w":74, "h":100, "ow":710, "oh":960, "f":"12191416_10106826845139490_7566875118536514554_n.jpg" },
		{ "w":133, "h":100, "ow":960, "oh":720, "f":"20181223 173452JB IMG_2974.JPG" },
		{ "w":178, "h":100, "ow":960, "oh":539, "f":"20180608 181930J IMG_1051.JPG" },
		{ "w":135, "h":100, "ow":960, "oh":710, "f":"11898618_10106536610047940_3298903106150354117_n.jpg" },
		{ "w":135, "h":100, "ow":960, "oh":710, "f":"10906585_10105516505620390_9067839815475931756_n.jpg" },
		{ "w":75, "h":100, "ow":720, "oh":960, "f":"20190528 143217J IMG_8913.JPG" },
		{ "w":107, "h":100, "ow":960, "oh":899, "f":"20190323 231213J IMG_5810.JPG" },
		{ "w":67, "h":100, "ow":640, "oh":960, "f":"1915451_10107037055356530_4157151236548316452_n.jpg" },
		{ "w":141, "h":100, "ow":2048, "oh":1453, "f":"12182622_10106807015827590_8728893030926876525_o.jpg" },
		{ "w":135, "h":100, "ow":960, "oh":710, "f":"10389285_10106427472710040_902155966910300848_n.jpg" },
		{ "w":110, "h":100, "ow":960, "oh":870, "f":"10464163_10106106268765320_7565139823425743022_n.jpg" },
		{ "w":75, "h":100, "ow":720, "oh":960, "f":"20190627 213703J IMG_1317.JPG" },
		{ "w":143, "h":100, "ow":2048, "oh":1432, "f":"1410731_10107321316929060_6785482319201575871_o.jpg" },
		{ "w":133, "h":100, "ow":960, "oh":720, "f":"11390029_10106338057279280_8813070980387906772_n.jpg" },
		{ "w":74, "h":100, "ow":710, "oh":960, "f":"11425061_10106296658253260_5565497977374987109_n.jpg" },
		{ "w":151, "h":100, "ow":2048, "oh":1360, "f":"10259294_10107209170551300_7539659466145041046_o.jpg" },
		{ "w":180, "h":100, "ow":960, "oh":533, "f":"12033109_10106706127673260_4491096237992755929_n.jpg" },
		{ "w":178, "h":100, "ow":960, "oh":540, "f":"20190519 175509J IMG_8563.JPG" },
		{ "w":75, "h":100, "ow":720, "oh":960, "f":"20190519 113916J IMG_8230.JPG" },
		{ "w":135, "h":100, "ow":960, "oh":710, "f":"11013583_10106546644034750_1539930543499363417_n.jpg" },
		{ "w":74, "h":100, "ow":710, "oh":960, "f":"12243089_10106894126701700_3447478982673683930_n.jpg" },
		{ "w":178, "h":100, "ow":960, "oh":540, "f":"20190407 173040J IMG_6268.JPG" },
		{ "w":161, "h":100, "ow":960, "oh":595, "f":"970895_10103197470874610_1293513551_n.jpg" },
		{ "w":140, "h":100, "ow":960, "oh":685, "f":"2028D25B-5C0D-4A28-A9FD-4C9A029B80AB.JPG" },
		{ "w":137, "h":100, "ow":960, "oh":700, "f":"12250177_10106864398142970_2638676994657572317_n.jpg" },
		{ "w":135, "h":100, "ow":960, "oh":710, "f":"11800432_10106449081905040_6739149444608978235_n.jpg" },
		{ "w":62, "h":100, "ow":595, "oh":960, "f":"20181115 105633JB BB98CDE6-89D5-44C7-866C-07DDE11926A0.JPG" },
		{ "w":133, "h":100, "ow":960, "oh":720, "f":"11247714_10106221839720200_6733034632502736226_n.jpg" },
		{ "w":75, "h":100, "ow":720, "oh":960, "f":"20190324 134801J IMG_5862.JPG" },
		{ "w":177, "h":100, "ow":960, "oh":542, "f":"486680_10103128300562470_1167035811_n.jpg" },
		{ "w":205, "h":100, "ow":960, "oh":468, "f":"20180504 112316JB IMG_8222.JPG" },
		{ "w":75, "h":100, "ow":720, "oh":960, "f":"20171213 174243JB IMG_2009.JPG" }
];

function imgHoverOver() {
	console.log(this.data.f);
	this.animate({
    	left: '250px',
    	height: '+=150px',
    	width: '+=150px'
	});
}

var imgOnLoad = function() {
	var randomDelay = 100 * (Math.floor(Math.random() * 10)+1);
	$(this).animate( {
		opacity: onImageLoadOpacity,
		}, randomDelay);
}

var imgMouseOver = function() {
	$(this).animate( {
		opacity: '1.0',
		width: "+=16px",
		height: "+=16px",
		left: "-=8px",
		top: "-=8px",
		zIndex: 20,
		}, 200);
}

var imgMouseOut = function() {
	$(this).animate( {
		opacity: '0.5',
		width: "-=16px",
		height: "-=16px",
		left: "+=8px",
		top: "+=8px",
		zIndex: 10,
		}, "slow");
}

function showLoading() {
	$("#preloader").animate( {
		opacity: '1.0',
		}, "slow");
}

function hideLoading() {
	$("#preloader").stop();
	document.getElementById("preloader").style.opacity = "0.0";
}

var imgOnClick = function() {
	hideBigImage();
	var bg = document.getElementById("bg");
	var img = document.createElement('img');
	img.id = "scaledImage";
	img.style.width = this.data.w + "px";
	img.style.height = this.data.h + "px";
	img.style.left = this.originalX + "px";
	img.style.top = this.originalY + "px";
	img.style.zIndex = 60;		
	img.style.opacity = "0.0";
	img.data = this.data;		
	bg.appendChild(img);
	img.src = this.src;
	img.onclick = function() {
		hideLoading();
		var bg = document.getElementById("bg");
		bg.removeChild(this);
	}
	
	var maxH = bg.clientHeight - 100;
	var maxW = bg.clientWidth - 100;
	var ow = this.data.ow;
	var oh = this.data.oh;
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

	console.log("Original dims: " + this.data.ow + "x" + this.data.oh + ", Scaled: " + newW + "x" + newH);

	var newX = Math.floor((bg.clientWidth - newW) / 2.0);
	var newY = Math.floor((bg.clientHeight - newH) / 2.0) - 25;

	console.log("New placement: " + newX + "x" + newY);

	img.onload = function() {
		$(this).animate( {
		opacity: '1.0',
		width: newW + "px",
		height: newH + "px",
		left: newX + "px",
		top: newY + "px",
		}, 200, function() {
			showLoading();
			var overlay = document.getElementById("photooverlay");
			overlay.style.width = newW + "px";
			overlay.style.height = newH + "px";
			overlay.style.left = (newX - bigImageOffset) + "px";
			overlay.style.top = (newY - bigImageOffset) + "px";
			overlay.style.opacity = "0.0";
			overlay.style.zIndex = 200;
			loadBigImage(this.data, newX, newY, newW, newH, img);
		});
	}
}

function loadBigImage(imgData, newX, newY, newW, newH, scaledImage) {	
	var img = document.createElement('img');
	img.id = "bigImage";
	img.style.width = newW + "px";
	img.style.height = newH + "px";
	img.style.left = newX + "px";
	img.style.top = newY + "px";
	img.style.zIndex = 70;		
	img.data = imgData;		
	bg.appendChild(img);
	img.src = "img/gallery/" + imgData.f;
	img.style.opacity = "0.0";
	img.onclick = function() {
		hideBigImage();
	}
	img.onload = function() {
		hideLoading();
		img.style.opacity = "1.0";
	}
}

function hideBigImage() {
	hideLastFloatingContent();
	hideLoading();
	var bg = document.getElementById("bg");
	var scaledImage = document.getElementById("scaledImage");
	if (scaledImage) {			
		bg.removeChild(scaledImage);	
	}
	var bigImage = document.getElementById("bigImage");
	if (scaledImage) {			
		bg.removeChild(bigImage);	
	}
	var overlay = document.getElementById("photooverlay");
	overlay.style.opacity = "0.0";
	overlay.style.zIndex = 0;		
}

function resetImages() {
	hideLastFloatingContent()
	var bg = document.getElementById("bg");
	while (bg.firstChild) {
		bg.removeChild(bg.firstChild);
	}
	var overlay = document.getElementById("photooverlay");
	overlay.onclick = function() {
		hideBigImage();
	}
	var preloader = document.getElementById("preloader");
	preloader.style.left = ((window.innerWidth - 32) / 2) + "px";
	preloader.style.top = ((window.innerHeight - 32) / 2) + "px";
	
	var bgHeight = bg.clientHeight;
	var bgWidth = bg.clientWidth;
	var x = -50; 
	var y = -50;
	var imagesToUse = images.slice();

	while (y < (bgHeight + 50)) {
		while (x < bgWidth) {
			var imgIndex = Math.floor(Math.random() * (imagesToUse.length));
			var imgData = imagesToUse[imgIndex];
			imagesToUse.splice(imgIndex, 1);
			if (imagesToUse.length == 0) {
				imagesToUse = images.slice();
			}
			var img = document.createElement('img');				
			img.style.width = imgData.w + "px";
			img.style.height = imgData.h + "px";
			img.style.left = x + "px";
			img.style.top = y + "px";
			img.style.opacity = "0.0";
			img.style.zindex = 10;
			img.data = imgData;	
			img.originalX = x;
			img.originalY = y;			
			
			img.onload = imgOnLoad;
			if (!isMobile) {
				img.onmouseover = imgMouseOver;
				img.onmouseout = imgMouseOut;
			}
			img.onclick = imgOnClick;			

			bg.appendChild(img);				
			img.src = "img/gallery/thumb-" + imgData.f;

			x += imgData.w + 4;
		}
		y += 104;
		x = -50;
	}
}

window.onload = resetImages;
window.onresize = resetImages;

var lastFloatingContentId = null;

function hideLastFloatingContent() {
	if (lastFloatingContentId != null) {
		var content = document.getElementById(lastFloatingContentId);	
		content.style.bottom = "-100%";
	}
}

function showFloatingContent(contentId) {
	hideBigImage();
	lastFloatingContentId = contentId;
	var content = document.getElementById(contentId);
	$("#" + contentId).animate({ bottom:35 + "px" }, {duration: 1500 });		
}