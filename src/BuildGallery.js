const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// node filesystem reference: https://nodejs.org/api/fs.html
// node path reference: https://nodejs.org/api/path.html
// sharp image library reference: https://sharp.pixelplumbing.com/

async function resizeImage(originalFilePath, thumbnailFilePath, maxHeight) { 
  //resize image to auto-width (first 'null' arg) given height of maxHeight 
  await sharp(originalFilePath)
    .resize(null, maxHeight, (err) => {
      console.log("resize error", err)
    })
    .autoOrient()
    .jpeg({ mozjpeg:true })
    .toFile(thumbnailFilePath);
};

async function getImageDims(file) {
  let imageDims = {};
  let image = sharp(file);
  await image.autoOrient().metadata().then((metadata) => {
    imageDims.height = metadata.height;
    imageDims.width = metadata.width;
  });
  return imageDims;
}

async function writeJSON(file, object) {
  const jsonString = JSON.stringify(object, null, 1);
  fs.writeFileSync(file, jsonString);
}

function isSupportedImageFile(file) {
  if (!fs.existsSync(file)) {
    return false;
  }
  let fileLowerCase = file.toLowerCase();
  if (fileLowerCase.endsWith(".jpg")
    || fileLowerCase.endsWith(".jpeg")
    || fileLowerCase.endsWith(".png")) {
    return true;
  }
  return false;
}

function isDirectory(path) {
  try {
    if (fs.existsSync(path)) {
      return fs.statSync(path).isDirectory();
    }    
  } catch (error) {
    console.log("error checking if dir: " + path, error)
  }
  return false;
}

function makeDirectory(path) {
  try {
    if (isDirectory(path)) {
      return;
    }
    fs.mkdirSync(path, { "recursive":true });
  } catch (error) {
    console.log("error making dir: " + path, error)
  }
}

async function getImageMetaData(bigFilePath, thumbnailFilePath) {
  let bigMetaData = await getImageDims(bigFilePath);
  bigMetaData.file = path.parse(bigFilePath).base;

  let thumbnailMetaData = await getImageDims(thumbnailFilePath);
  thumbnailMetaData.file = path.parse(thumbnailFilePath).base;

  let imageMetaData = {
    "big": bigMetaData,
    "thumbnail": thumbnailMetaData
  }

  return imageMetaData;
}

async function processGalleryImages(galleryName, inputDirectory, outputDirectory) {
  console.log("Processing images for gallery '" + galleryName + "'",  { "inputDirectory":inputDirectory, "outputDirectory":outputDirectory });
  
  if (!fs.existsSync(inputDirectory)) {
    console.log("Input directory does not exist: " + inputDirectory)
    return;
  }

  if (!fs.existsSync(outputDirectory)) {
    console.log("Output directory does not exist: " + outputDirectory)
    return;
  }

  const inputFiles = fs.readdirSync(inputDirectory);
  // console.log("input files", inputFiles);  

  let imageMetaDatas = [];

  for (originalFile of inputFiles) {
    let originalFilePath = inputDirectory + "/" + originalFile;
    if (!isSupportedImageFile(originalFilePath)) {
      console.log("Skipping non-image: " + originalFilePath);
      continue;
    }

    let originalFilePathInfo = path.parse(originalFilePath);

    console.log("Processing '" + galleryName + "/" + originalFile + "'");

    let bigFile = originalFilePathInfo.name + "_big" + originalFilePathInfo.ext;
    let bigFilePath = outputDirectory + "/" + bigFile;

    // create big version in gallery directory, resizing if needed
    let originalMetaData = await getImageDims(originalFilePath);
    if (originalMetaData.height > 2000) {            
      await resizeImage(originalFilePath, bigFilePath, 2000);  
    } else {
      fs.copyFileSync(originalFilePath, bigFilePath);
    } 

    // create resized thumbnail in gallery directory
    let thumbnailFile = originalFilePathInfo.name + "_tn" + originalFilePathInfo.ext;
    let thumbnailFilePath = outputDirectory + "/" + thumbnailFile;
    await resizeImage(originalFilePath, thumbnailFilePath, 200);

    // save image metadata
    let imageMetaData = await getImageMetaData(bigFilePath, thumbnailFilePath);
    imageMetaDatas.push(imageMetaData);
  }

  let jsonFile = outputDirectory + "/" + "gallery.json";

  let galleryMetaData = { "name":galleryName, "images":imageMetaDatas };

  await writeJSON(jsonFile, galleryMetaData);

  console.log("Wrote gallery JSON file:"  + jsonFile);

  return galleryMetaData;
}

async function findGalleries(inputDirectory) {
  let galleries = [];
  const inputFiles = fs.readdirSync(inputDirectory);

  let rootGalleryExists = false;

  for (file of inputFiles) {
    let filePath = inputDirectory + "/" + file;
    if (isSupportedImageFile(filePath)) {
      rootGalleryExists = true;
    } else if (isDirectory(filePath)) {
      galleries.push({ "name":file, "path":filePath })
    }
  }

  if (rootGalleryExists) {
    galleries.push({ "name":".", "path":inputDirectory + "/." })
  }
  return galleries;
}

async function processGalleries(inputDirectory, outputDirectory) {
  console.log("Processing Galleries", { "inputDirectory":inputDirectory, "outputDirectory":outputDirectory });

  if (!fs.existsSync(inputDirectory)) {
    console.log("Input directory does not exist: " + inputDirectory)
    return;
  }

  let galleryNames = [];
  let galleryMetaDatas = [];
  let galleries = await findGalleries(inputDirectory);
  console.log("galleries", galleries);
  for (gallery of galleries) {
    let galleryOutputDirectory = outputDirectory + "/" + gallery.name;
    console.log("Now processing gallery: '" + gallery.name + "', path: " + galleryOutputDirectory);
    if (!isDirectory(galleryOutputDirectory)) {
      makeDirectory(galleryOutputDirectory);
    }
    let galleryMetaData = await processGalleryImages(gallery.name, gallery.path, galleryOutputDirectory);
    galleryMetaDatas.push(galleryMetaData);
    galleryNames.push(gallery.name);
  }

  // create 'all' gallery
  let allGalleryMetaData = { "name":"All", "images":[] };
  for (let galleryMetaData of galleryMetaDatas) {
    for (let image of galleryMetaData.images) {
      let allImage = structuredClone(image);
      allImage.big.file = "../" + galleryMetaData.name + "/" + image.big.file;
      allImage.thumbnail.file = "../" + galleryMetaData.name + "/" + image.thumbnail.file;
      allGalleryMetaData.images.push(allImage);
    }
  }
  let allGalleryOutputDirectory = outputDirectory + "/" + "All";
  if (!isDirectory(allGalleryOutputDirectory)) {
      makeDirectory(allGalleryOutputDirectory);
    }
  let allJsonFile = allGalleryOutputDirectory + "/" + "gallery.json";
  await writeJSON(allJsonFile, allGalleryMetaData);
  console.log("Wrote galleries JSON file:"  + allJsonFile);

  galleryNames.unshift("All");

  let jsonFile = outputDirectory + "/" + "gallery-index.json";
  let galleryIndexMetaData = { "galleryNames":galleryNames };
  await writeJSON(jsonFile, galleryIndexMetaData);
  console.log("Wrote galleries index JSON file:"  + jsonFile);
}

if (process.argv.length < 3) {
  console.log("USAGE: node resize.js [input directory] [output directory]")
  return;
}

var inputDirectory = process.argv[2];
var outputDirectory = process.argv[3];

processGalleries(inputDirectory, outputDirectory);



