What?
=====

This is some old source code for the original version of the `Coder Cowboy Gallery` when I first built the project in 2018 or so. It's basically hand-written vanilla [javascript](https://www.w3schools.com/js/), [html](https://www.w3schools.com/html/default.asp), and [css](https://www.w3schools.com/css/default.asp), with some simple [php](https://www.w3schools.com/php/default.asp) and [imagemagick](https://imagemagick.org) build-time wrappers to automate building image thumbnails in `prod/img/gallery/` and inlining image metadata in the `prod/imagegallery.js` file. 

Disclaimer about shitty code
============================

When I wrote this a decade or so ago, the code was never meant to be public, and I'm pretty sure [javascript es6 modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) didn't even exist yet, so it was the wildwest of class-like javascript hacks. 

Since I had no intention of ever publishing this code, nor did I ever plan to do anything more with this version of my [personal website](https://www.onejasonforsale.com), and because I was lazy: the javascript pollutes the [global namespace](https://www.w3schools.com/js/js_scope.asp) in terrible ways such as completely overriding `window.onload` vs adding event listeners, adding global variables and methods, has zero comments (!!!), and other bad hygiene. Don't do things this way in your own projects, ever. 

Building this old version of the gallery
========================================

1. The install assumes MacOS
2. Install [imagemagick](https://imagemagick.org), [php](https://www.w3schools.com/php/default.asp), and [python](https://www.w3schools.com/python/default.asp) via [homebrew](https://brew.sh/).
   - Open terminal
   - install `homebrew` w/ instructions [here](https://brew.sh/)
   - Find [imagemagick](https://imagemagick.org) with `brew search image`, find the proper name of what you'd like to install (probably `imagemagick`, but others such as `imagemagick-full` exist too)
   - Install the `imagemagick` package you want with something like `brew install imagemagick`
   - Find a version of [python](https://www.w3schools.com/python/default.asp) that you like with `brew search python`, note that there are all kinds of very particular versions of `python` available due to a lack of planning on the part of the people who make `python`, for usage here any version is probably fine, but many other projects out there require very specific versions of `python` (such as 3.11 being okay but 3.13 being not okay for one project vs opposite for another).
   - Install the version of `python` you like with something like `brew install python@3.13`
   - Do the same as above for installing `php` with `homebrew`, search, then install it
3. Put images in `src/images` folder.
4. Run [src/build.sh](src/build.sh) in a terminal from within the [src](src) folder.
5. Note that running `src/build.sh` overwrote some files over in the `prod` folder.
6. In a terminal in the `prod` folder, run a quick python web server with: `python -m http.server 8070`
7. See the gallery in your browser here: [http://localhost:8070/](http://localhost:8070/)
8. Re-run `src/build.sh` until you're happy with your gallery, then put the contents of the [prod](prod) folder on your website somewhere with a [sftp](https://en.wikipedia.org/wiki/SSH_File_Transfer_Protocol) program like [FileZilla](https://filezilla-project.org/).

How the code works
==================

## How [src/build.sh](src/build.sh) works

`build.sh` does the following:

#### `build.sh` Step 1: Process images in [src/images](src/images) with [src/buildimages.sh](src/buildimages.sh).

`buildimages.sh` examines images, copies them to `prod/img/gallery/` and also makes 100-pixel-tall thumbnails of the images in `prod/img/gallery/`. Finally, `buildimages.sh` outputs some json-like information about the images in [prod/imginfo.txt](prod/imginfo.txt), that looks like this:

`prod/imginfo.txt` example:

```
"w":133, "h":100, "ow":960, "oh":720, "f":"20171009 214330JB IMG_9946.JPG" 
"w":75, "h":100, "ow":720, "oh":960, "f":"20190626 190000J IMG_1135.JPG" 
"w":164, "h":100, "ow":2048, "oh":1248, "f":"10373124_10107292700371870_7985420549300873511_o.jpg" 
```

#### `build.sh` Step 2: Run [src/imagejs.php](src/imagejs.php) to create [prod/imagegallery.js](prod/imagegallery.js)

`build.sh` executes `php -q imagejs.php > ../prod/imagegallery.js`, this tells `php` to execute quietly (no meta processing output) and directs the php output to `prod/imagegallery.js`. 

`src/imagejs.php` looks an awful lot like a standard javascript file, because it is with a small block of php in it:

```
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
```

That code block from `src/imagesjs.php` above is creating an inline array of json objects read from `prod/imginfo.txt` and turns them into the variable `images` in the final javascript file. 

We can see the `images` output in `prod/imagegallery.js` here:

```
var images = [
    { "w":133, "h":100, "ow":960, "oh":720, "f":"20171009 214330JB IMG_9946.JPG" },
    { "w":75, "h":100, "ow":720, "oh":960, "f":"20190626 190000J IMG_1135.JPG" },
    ... more lines from prod/imageinfo.txt here ...
];
```

The remaining javascript in `prod/imagegallery.js` does all of the gallery magic more or less. It makes use of `jquery` (included as `prod/jquery-1.11.3.min.js`) animations here and there. 

#### `build.sh` Step 3: Run [src/index.php](src/index.php) to create [prod/index.html](prod/index.html)

`build.sh` executes `php -q index.php > ../prod/index.html`, this tells `php` to execute quietly (no meta processing output) and directs the php output to `prod/index.html`. 

For legacy reasons, there used to be some `php` code in the `src/index.php` file, but there isn't any more, so this is essentially just copying `src/index.php` to `prod/index.html` here. 

## How the gallery works

[prod/index.html](prod/index.html) references [prod/imagegallery.js](prod/imagegallery.js), which contains the list of image metadata and gallery javascript code as shown above. `prod/index.html` also makes use of the [prod/stylesheet.css](prod/stylesheet.css) and [prod/jquery-1.11.3.min.js](prod/jquery-1.11.3.min.js). 

`prod/index.html` has all of the html that `prod/imagegallery.js` assumes is in place. 

As `prod/imagegallery.js` loads, it sets these toward the bottom of the file:

```
window.onload = resetImages;
window.onresize = resetImages;
```

#### `prod/imagegallery.js::resetImages()`

These cause the browser to call the `resetImages()` method when the page first loads and each time the browser window is resized. 

The `resetImages()` method in `prod/imagegallery.js` finds the `bg` div inside the `prod/index.html` file, removes all of its children elements, then dynamically builds `img` dom elements based on the `images` metadata. The dynamically added `img` child elements for `bg` have their `onload` set to the `imgOnLoad()` method in `prod/imagegallery.js`, and on non-mobile, some mouse-related events are added to the `img` child element as well. The `img` elements point to the *thumbnail* versions of the image in question. 

#### `prod/imagegallery.js::imgOnLoad()`

This method is attached to dynamic `img` elements' `onload` event in `resetImages()`. Once the image's thumbnail loads, `imgOnLoad()` is called, and it animates the thumbnail's opacity from 0 to 100, effectively making the thumbnail appear to fade in. 

#### `prod/imagegallery.js::imgOnClick()`

This method is attached to dynamic `img` elements `onclick` event in `resetImages()` *on non-mobile browsers*. When the user clicks the thumbnail the `img` tag is showing, `imgOnClick()` does some math to figure out how to show the *non-thumbnail* original image in the middle of the screen, then adds a dynamic new `img` element to the `bg` div from `prod/index.html`. 

The new `img` element has id attribute of `scaledImage` which will later be used by `hideBigImage()` when the user dismisses the larger version of the image. 

The new `img` element also has an `onload` event set to show the `photooverlay` loading div from `prod/index.html` via `showLoading()` then call `loadBigImage()` After the *non-thumbnail* larger original image is loaded.

#### `prod/imagegallery.js::loadBigImage()`

`loadBigImage()` will swap the newly loaded *non-thumbnail* image into a second new `img` child of the `bg` element, and fade `photooverlay` out via a `jquery` animation in `hideLoading()` once the image is loaded.

The new `img` child for the big image will have its `onclick` event set to call `hideBigImage()`

#### `prod/imagegallery.js::hideBigImage()`

`hideBigImage()` removes up the big image's dom elements such as the `img` element created by `loadBigImage()`, the other `img` element that was created by `imgOnClick()`, then fades the `photooverlay` div that contained the big image. 

#### Other stuff in `prod/imageGallery.js`

Other methods in `prod/imageGallery.js` are fairly self-explanatory, except maybe `imgMouseOver` and `imgMouseOut` which cause the fun (and accidental!) small scaling-up/down animation when the mouse hovers over a thumbnail on a non-mobile browser. Good stuff!

Photo Licensing
===============

All photos in the [src/images](src/images) and the root [example-images](../example-images) folders are licensed under the `Creative Commons Attribution 4.0 International License`, which is a great license for photos and other creative works because it:

* a) allows you to *share* the photos: copy and redistribute the material in any medium or format for any purpose, even commercially.
* b) allows you to *adapt* the photos: remix, transform, and build upon the material for any purpose, even commercially.
* c) is [non-viral](http://en.wikipedia.org/wiki/Viral_license), that is, your derivative works do not *have to be*open source or similarly licensed to use these works
* d) requires attribution to this project in derivative projects

See the [CC-LICENSE](../CC-LICENSE) file for details. 

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
