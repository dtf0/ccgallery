ccgallery
=========

*Coder Cowboy Gallery* - A simple web gallery generator. Generates static html/js/css that does not require your web host to run any other software. 

<img style='width:300px' src="readme-files/ccgallery-demo-small.gif"></img>

If you're not reading this document on github, the repo for this project is [https://github.com/codercowboy/ccgallery]().

Demos
=====

See an in-browser demo of ccgallery in action [here](https://onejasonforsale.com/gallery/).

Alternatively, there's a fun youtube video demo [here](https://www.youtube.com/watch?v=QKietZJdj4s).

Run the demo on your own machine (Installation)
===============================================

1. Install [nodejs](https://nodejs.org/en) and [npm](https://www.npmjs.com/) with your package manager (such as [Homebrew](https://brew.sh/) for MacOS)
2. Run `npm install` in the root folder of this project to have npm install dependencies (just sharp, so far) forthe project
3. Run `npm run build` to build the example gallery in the `dist`, copy static web assets to the `dist` folder, and start a web server for you to run the demo locally
4. After the web server is running from the step above, open your browser to [http://localhost:8070]() to view the demo. 

Upload ccgallery to your web host
=================================

To deploy the demo galleries to your own web host (such as [Dreamhost](https://www.dreamhost.com/), which I use), simply upload the contents of the `dist` directory with something like [Filezilla](https://filezilla-project.org/) or [scp](https://unix.stackexchange.com/questions/413840/how-do-i-scp-via-ssh).

Customize CCGallery for your own needs
======================================

After you've run the demo on your own machine, you'd probably like to put your own images into the galleries. 

### Customization Step 1: Build your own galleries

Galleries are built with the [BuildGallery.js](src/BuildGallery.js) script. An example usage of this script runs when the `npm run build` command was run to setup the demo, in that example, the tool was used like this:

```
node src/BuildGallery.js example-images dist/gallery
```

When `BuildGallery.js` is run, it creates a thumbnail-sized and a large-sized version of each of your source images in the output gallery directory, and it also creates some [JSON](https://en.wikipedia.org/wiki/JSON) files in the various gallery directory's subfolders (such as `gallery.json` and `gallery-index.json` files). 

If you're curious, the `JSON` files contain metadata about the thumbnails and large-size images, like this:

```
{
	"name": "Nature",
	"images": [
		{
			"big": { "height": 1360, "width": 2048, "file": "123_big.jpg"},
			"thumbnail": { "height": 200, "width": 301, "file": "123_tn.jpg" }
		},
		{
			"big": { "height": 1360, "width": 2048, "file": "abc_big.jpg"},
			"thumbnail": { "height": 200, "width": 301, "file": "abc_tn.jpg" }
		}
	]
}
```

To use `BuildGallery.js` for your own albums, create a folder on your computer and put your original source images into that folder, then run something like this within the ccgallery project's folder:

```
node src/BuildGallery.js "~/Desktop/my images" dist/gallery
```

The example above would work if your images are in a folder called `my images` on your desktop on a mac.

Note that when you run `BuildGallery.js`, it does not alter your source images in any way, nor does it delete previously built images in your output directory (`dist/gallery` in this example).

*Add more of your own albums*

If you'd like to add more albums to your galleries, simply make subfolders of your source directory. For example in this project's [example-images](example-images) directory, you see this:

```
example-images/More
example-images/Nature
```

Each of those subfolders will show up as galleries automatically if your images are organized that way. Don't worry about having spaces in the names of the album folders, `BuildGallery.js` can handle that. 

### Customization Step 2: Advanced: Customize `index.html` (if you want)

If you'd like to customize the way ccgallery works, take a look at the [src/web/index.html](src/web/index.html) file. When you ran `npm run build` earlier, the second step was npm automatically running the [build_web.sh](build_web.sh) script for you, which is just an extremely simple script to copy files from [src/web](src/web) to the `dist` folder - including the `index.html` file.

Let's examine some important parts of `index.html`:

```
<body id="body">
	<div id="ccGallery"></div>
</body>
```

Your `index.html` (or other html file of your choosing) doesn't need a lot to host a ccgallery, just a div that'll be the parent of the automatically generated html for the gallery, here, it's the div with the id `ccGallery`.

Next, here's the part that initializes the ccgallery on your page:

```
<script type="module">
	// load ccgallery code from the javascript files
	import { CCGalleryConfig } from './js/CCGalleryConfig.js';
	import { CCGalleryManager } from './js/CCGallery.js';

	// create a CCGalleryConfig configuration object that we'll customize to 
	// have ccgallery behave how we would prefer
	var galleryConfig = new CCGalleryConfig();
	
	// this is the name of the div that the gallery will be created in, 'gallery' in this index.html example
	galleryConfig.galleryParentId = "ccGallery";		

	// now that configurtion is ready, start our gallery
	var galleryManager = new CCGalleryManager(galleryConfig);
	galleryManager.initializePageHandlers();

	// if for some reason you're creating this gallery after page load has happened, you'll still
	// need to call initializePageHandlers() above, but then also call this:
	//galleryManager.initialize();
</script>
```

There's a bit to break down here about this portion of `index.html`. First, we have the part that makes your browser load ccgallery code from javascript files:

```
// load ccgallery code from the javascript files
import { CCGalleryConfig } from './js/CCGalleryConfig.js';
import { CCGalleryManager } from './js/CCGallery.js';
```

If you want to include ccgallery in your own html file, you may need to adjust the path (the `./js`) a bit depending on where you place those files on your webhost.

Next, we create a [CCGalleryConfig](src/web/js/CCGalleryConfig.js) configuration object:

```
// create a CCGalleryConfig configuration object that we'll customize to 
// have ccgallery behave how we would prefer
var galleryConfig = new CCGalleryConfig();
	
// this is the name of the div that the gallery will be created in, 'ccGallery' in this index.html example
galleryConfig.galleryParentId = "ccGallery";
```

`CCGalleryConfig` objects tell the ccgallery software what to do. See the `configuration` section later in this document to see details on various options.

Almost all of the properties on `CCGalleryConfig` have sensible default settings, but, as shown above, many users will probably customize the `galleryParentId` property if their gallery container div isn't named "ccGallery". 

Lastly, the `index.html` file's script section starts the ccgallery running with this:

```
// now that configurtion is ready, start our gallery
var galleryManager = new CCGalleryManager(galleryConfig);
galleryManager.initializePageHandlers();

// if for some reason you're creating this gallery after page load has happened, you'll still
// need to call initializePageHandlers() above, but then also call this:
//galleryManager.initialize();
```

As noted in the comment toward the end of that code block, if you're not creating the [CCGalleryManager](src/web/js/CCGallery.js) before the page fully loads (before [window.onload](https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event) runs), you might need to have that last line (`galleryManager.initialize()`) in your html file's `script` block.

### Customization Step 3: Advanced: Customize `CCGallery.css`

[index.html](src/web/index.html) includes the [CCGallery.css](src/web/CCGallery.css), which specifies the various [CSS](https://www.w3schools.com/css/) styles that control the look of the gallery. 

Because ccgallery dynamically creates various DOM elements in your page, `CCGallery.css` contains inline documentation of what the various styles are, paraphrased here:

```
/* git hub link on the ccGallery menu popup */
A.ccGalleryGithubLink

/* the container for the gallery, this is in the index.html file */
#ccGallery

/* this container is dynamically generated, it wraps the gallery images */
#ccGalleryContainer

/* dynamically generated child of 'gallery' div, 
   loading spinner that's shown when big images are being loaded */
#ccGalleryPreloader

/* dynamically generated child of 'gallery' div, 
   a small overlay on the big image if specified in config */
#ccGalleryPhotoOverlay
#ccGalleryPhotoOverlay .footer

/* dynamically generated child of 'gallery' div, 
   the menu button div in the bottom right corner of the screen */
#ccGalleryMenuButton

/* dynamically generated child of 'gallery' div, 
   the menu window that lists albums */
#ccGalleryMenuWindowBackground
#ccGalleryMenuWindow
```

For reference, here's the various dynamic dom elements that ccgallery will create within your gallery container, note that many of them are not styled in `CCGallery.css`:

```
<!-- the container that's in your html file -->
<div id="ccGallery">

	<! -- the gallery images container -->
	<div id="ccGalleryContainer">
		<!-- thumbnails will have css class 'ccGalleryThumbnail' -->
		<img class='ccGalleryThumbnail' src="gallery/Nature/123_tn.jpg" />
		<img class='ccGalleryThumbnail' src="gallery/Nature/abc_tn.jpg" />

		...

		<img class='ccGalleryThumbnail' src="gallery/Nature/xyz_tn.jpg" />

		<!-- this is the thumbnail that animates to become the 'big' 
		     image while the large image is loading for the image the user selected -->
		<img id="scaledImage" src="gallery/Nature/123_tn.jpg" />

		<!-- the 'big' image, that is, the large version of the image the user selected -->
		<img id="bigImage" src="gallery/Nature/123_big.jpg" />

	</div>

	<!-- the spinner that shows up while a large image loading --> 
	<img id="ccGalleryPreloader" src="img/loading.gif" />

	<!-- the menu button shown in the bottom-right corner -->
	<div id="ccGalleryMenuButton" class="ccGalleryMenuButton"><a>☰</a></div>

	<!-- the popup menu window background (a slightly translucent full-screen div 
		 that dismisses menu when user clicks) -->
	<div id="ccGalleryMenuWindowBackground" class="ccGalleryMenuWindowBackground"></div>

	<!-- the popup menu window that contains album links -->
	<div id="ccGalleryMenuWindow" class="ccGalleryMenuWindow>
		<h1 class="ccGalleryMenuTitle">Albums</h1>
		<a class="ccGalleryMenuListAlbumLink">All</a>
		<a class="ccGalleryMenuListAlbumLink">Nature</a>
		<a class="ccGalleryMenuListAlbumLink">Buildings</a>
	</div>

</div>
```

Configuration
=============

### Configuration Overview

If you'd like to further customize the way ccgallery works, it supports a number of options such as:

- Enable or disable the menu
- Enable or disable the screen saver mode
- Customize the row height for the images in the gallery
- Customize the white border shown between images
- Change how long the screen saver's animations run
- and more.

In your `<script>` block, you can invoke the `logToConsole()` method on your [CCGalleryConfig](src/web/js/CCGalleryConfig.js) object to log the full configuration to the [javascript console](https://developer.chrome.com/docs/devtools/console) in your browser.

```
// log the full config to js console with this helper if you want
// it'll show you all possible configuration properties
// those properties are documented here: https://github.com/codercowboy/ccgallery
// pass in 'true' if you want json string version of the config logged
galleryConfig.logToConsole(true); 
```

Here's a simplified example output from `logToConsole()`:

```
{
  "galleryParentId": "ccGallery",
  "rowHeightPixels": 50,
  "thumbnailBorderPixels": 2,
  "photoOverlayContent": null,
  "screenSaverConfig": {
    "enabled": true,
    "runIntervalMillis": 2000,
  },
  "menuConfig": {
    "enabled": true,
    "buttonContent": "&#9776;",
    "galleriesTitle": null
  },
  "advancedConfig": {
    "isMobile": false,
    "preloaderImageURL": "img/loading.gif",
    "galleryUrlPrefix": "gallery",
    "gallerySpecificRowHeightsPixels": {
      "Misc": 100,
      "More": 150,
      "Nature": 150
    }
  }
}
```

Configuring any given option is fairly straight forward, consider this example from [index.html](src/web/index.html):

```
var galleryConfig = new CCGalleryConfig();
	
// this is the name of the div that the gallery will be created in, 'gallery' in this index.html example
galleryConfig.galleryParentId = "ccGallery";

// set this to 'false' to disable the menu popup, useful if you have a single gallery
galleryConfig.menuConfig.enabled = true;
```

### Configuration Options 

*Basic configuration*

`myConfig.galleryParentId` (string, default: "ccGallery")

The div in your html file that'll contain the ccgallery images/menus/etc.

`myConfig.rowHeightPixels` (number, default: 50)

Controls the height of the images shown in the gallery. Note that widths for the images will be automatically scaled and cannot be configured.

`myConfig.thumbnailBorderPixels` (number, default: 2)

Controls the border shown between images in the gallery.

`myConfig.photoOverlayContent` (string, default: -nothing- )

Content that'll be shown at the bottom of the 'big' images.

Example:

```
myConfig.photoOverlayContent = "<div class='footer'><a href='#''>order a print</a></div>";
```

`myConfig.menuConfig.enabled` (boolean, default: true)

Enable or disable the ccgallery menu. Note that the menu is not shown if your gallery instance only has one album, so setting this to `false` is only useful on a gallery with multiple albums.

`myConfig.screenSaverConfig.enabled` (boolean, default: true)

Enable or disable the `screen saver` mode, which periodically highlights random images in the gallery by slowly enlarging and shrinking them.

*Advanced menu configuration*

`myConfig.menuConfig.enabled` (boolean, default: true)

Enable or disable the ccgallery menu. Note that the menu is not shown if your gallery instance only has one album, so setting this to `false` is only useful on a gallery with multiple albums.

`myConfig.menuConfig.buttonContent` (string, default: "&#9776;")

Specifies the content of the menu button. This can be html such as:

```
myConfig.menuConfig.buttonContent = "<img src='someimage.jpg />";
```

`myConfig.menuConfig.galleriesTitle` (string, default: "Albums")

Specifies the title at the top of the menu album list popup window. Set to `null` to remove the title.

*Advanced screen saver configuration*

`myConfig.screenSaverConfig.enabled` (boolean, default: true)

Enable or disable the `screen saver` mode, which periodically highlights random images in the gallery by slowly enlarging and shrinking them.

`myConfig.screenSaverConfig.runIntervalMillis` (number, default: 2000)

Controls how often the screen saver will start highlighting an image in the gallery. Set to smaller values (such as `500`) to highlight more images on screen at once.

*Advanced general configuration*

`myConfig.advancedConfig.isMobile` (boolean, default: false)

This is automatically set to signify the device is a mobile device when the `CCGalleryConfig` object is created. 

On mobile devices, the menu button is always on screen, and `isMobile` controls that.

`myConfig.advancedConfig.preloaderImageURL` (string, default: "img/loading.gif")

Controls the 'loading' spinner image that's shown while the large image is loading.

`myConfig.advancedConfig.galleryUrlPrefix` (string, default: "gallery")

Tells ccgallery the path to the images from the location of the html file. If you have your gallery files in a folder other than `gallery` on your web host, change this to match that folder. 

`myConfig.advancedConfig.gallerySpecificRowHeightsPixels` (object, default: -nothing-)

Per-album overrides of the row height in pixels. Configure a custom height for your albums like so:

```
// if you want different height rows per gallery, you can specify those like this
// this first one means when the 'Misc' gallery album is shown, the row height for 
// the images in that album will be 100 pixels tall
galleryConfig.advancedConfig.gallerySpecificRowHeightsPixels["Misc"] = 100;
galleryConfig.advancedConfig.gallerySpecificRowHeightsPixels["More"] = 150;
galleryConfig.advancedConfig.gallerySpecificRowHeightsPixels["Nature"] = 150;
```

How The Code Works
==================

[package.json](package.json) - standard NPM build config, there are a couple of convenience run modes:

```
"scripts": {
	"build": "npm run build_example_gallery && npm run build_web && npm run start_web_server",
	"build_web": "./build_web.sh",
	"build_example_gallery": "node src/BuildGallery.js example-images dist/gallery",
	"start_web_server": "./run_server.sh dist/"
},
```

*Various scripts:*

- [backup.sh](backup.sh) - simple backup script that'll tar the project folder automatically
- [build_web.sh](build_web.sh) - copies `src/web` contents to `dist`
- [run_server.sh](run_server.sh) - runs a simple python web server for you 
- [BuildGallery.js](src/BuildGallery.js) - nodejs script that resizes source images and creates .json files with metadata about the album images.

*Web code:*

- [index.html](src/web/index.html) - sample index html file used in demo
- [CCGallery.css](src/web/index.html) - sample css file used in demo
- [CCUtil.js](src/web/js/CCUtil.js) - utility methods used in ccgallery
- [CCGalleryConfig.js](src/web/js/CCGalleryConfig.js) - configuration objects, very simple stuf fhere
- [CCGallery.js](src/web/js/CCGallery.js) - ccgallery code, explained more below

*`CCGallery.js` explained:*

I've added inline documentation to [CCGallery.js](src/web/js/CCGallery.js), but here's an overview of the various classes in the file:

`CCGalleryManager` - manages the galleries (instances of `CCGallery`).

`CCGallery` - manages one of the user's images in albums

`CCGalleryThumbnail` - manages a given thumbnail image's behavior

`CCGalleryBigImage` - manages the 'big' image that pops up when a user clicks on a thumbnail

`CCMenuManager` - manages the menu that allows the user to change albums

`CCScreenSaver` - manages the screen saver behavior that periodically highlights thumbnails

Contributing
============

If you'd like to contribute to ccgallery, contact me ([jason@onejasonforsale.com]()) and/or fork the github repo and make it better on your own. [Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) are welcome, as are any [github issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues) for features requests or bugs that you find. 

Some ideas to improve ccgallery that you could consider:

- Convert various parts of ccgallery to be a published npm module (I don't have time to manage this.)
- Add support for a column mode in addition to the current row mode
- More documentation is always great
- More examples could be created that demonstrate various configuration options 

I'm happy to credit you for your contributions here in the readme!

Photo Licensing
===============

All photos in the [old/src/images](old/src/images) and the [example-images](example-images) folders are licensed under the `Creative Commons Attribution 4.0 International License`, which is a great license for photos and other creative works because it:

* a) allows you to *share* the photos: copy and redistribute the material in any medium or format for any purpose, even commercially.
* b) allows you to *adapt* the photos: remix, transform, and build upon the material for any purpose, even commercially.
* c) is [non-viral](http://en.wikipedia.org/wiki/Viral_license), that is, your derivative works do not *have to be*open source or similarly licensed to use these works
* d) requires attribution to this project in derivative projects

See the [CC-LICENSE](CC-LICENSE) file for details. 

Note that other versions of the Creative Commons licenses exist, such as versions that do not allow commercial use, and more, look into them [here](https://creativecommons.org/licenses/).

If you'd like bigger versions of any image, [email me](mailto:jason@onejasonforsale.com). 

Code Licensing
==============

All code is licensed with the [Apache License](http://en.wikipedia.org/wiki/Apache_license), which is a great license for code because it:

* a) covers liability - my code should work, but I'm not liable if you do something stupid with it
* b) allows you to copy, fork, and use the code, even commercially
* c) is [non-viral](http://en.wikipedia.org/wiki/Viral_license), that is, your derivative code doesn't *have to be* open source to use it
* d) requires attribution to this project in derivative projects

Other great licensing options for your own code: the BSD License, or the MIT License.

Here's the Apache License:

Copyright (c) 2026, Coder Cowboy, LLC. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
* 1. Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.
* 2. Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation
and/or other materials provided with the distribution.
  
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  
The views and conclusions contained in the software and documentation are those
of the authors and should not be interpreted as representing official policies,
either expressed or implied.

Author
======

- **Jason Baker** — [jason@onejasonforsale.com](mailto:jason@onejasonforsale.com)

Credits
=======

- [CloudConvert's video to gif converter](https://cloudconvert.com/mov-to-gif) was used to make the demo gif
- [Sharp image processing library](https://sharp.pixelplumbing.com/) is used to resize images
- [Jquery](https://jquery.com/) ([jquery-1.11.3.min.js](src/web/js/jquery-1.11.3.min.js) in the project) animates images
- [Edent's Super Tiny Icons](https://github.com/edent/supertinyicons) provided tiny github icon
- [W3Schools](https://www.w3schools.com/) js / css reference was used heavily
- [Mozillas' MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript) js / css reference was used heavily