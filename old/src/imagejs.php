var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

console.log("isMobile: " + isMobile);

var onImageLoadOpacity = isMobile ? 1.0 : 0.5;
var bigImageOffset = isMobile ? 0 : 50;

var images = [
<?php
	
$lines = file("../prod/imginfo.txt");

// Loop through our array, show HTML source as HTML source; and line numbers too.
foreach ($lines as $line_num => $line) {
	if (strpos($line, "DS_Store") !== false) {
		continue;
	}
    echo "\t\t{ " . trim($line) . " }";
    if (!($line_num + 1 == count($lines))) {
    	echo ",";
    }
    echo "\n";
}

?>
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