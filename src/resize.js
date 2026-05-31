const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// node filesystem reference: https://nodejs.org/api/fs.html
// node path reference: https://nodejs.org/api/path.html
// sharp image library reference: https://sharp.pixelplumbing.com/

async function resizeImage(originalFilePath, thumbnailFilePath) { 
  //resize image to auto-width (first 'null' arg) given height of 100 
  console.log("b:" + originalFilePath)
  await sharp(originalFilePath)
    .resize(null, 100, (err) => {
      console.log("resize error", err)
    })
    .jpeg({ mozjpeg:true })
    .toFile(thumbnailFilePath);
  console.log("c:" + originalFilePath)
};

async function getImageDims(file) {
  let imageDims = {};
  let image = sharp(file);
  await image.metadata().then((metadata) => {
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
    if (fs.existsSync(inputDirectory)) {
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

async function getImageMetaData(originalFilePath, thumbnailFilePath) {
  let originalMetaData = await getImageDims(originalFilePath);
  originalMetaData.file = path.parse(originalFilePath).base;

  let thumbnailMetaData = await getImageDims(thumbnailFilePath);
  thumbnailMetaData.file = path.parse(thumbnailFilePath).base;

  let imageMetaData = {
    "original": originalMetaData,
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

    let thumbnailFile = originalFilePathInfo.name + "_tn" + originalFilePathInfo.ext;
    let thumbnailFilePath = outputDirectory + "/" + thumbnailFile;

    console.log("Processing '" + galleryName + "/" + originalFile + "'");

    // copy input file to gallery directory
    let copiedFilePath = outputDirectory + "/" + originalFile;
    fs.copyFileSync(originalFilePath, copiedFilePath);

    // create resized thumbnail in gallery directory
    console.log("a:" + copiedFilePath)
    await resizeImage(copiedFilePath, thumbnailFilePath);
    console.log("d:" + copiedFilePath)

    // save image metadata
    let imageMetaData = await getImageMetaData(copiedFilePath, thumbnailFilePath);
    imageMetaDatas.push(imageMetaData);
  }

  let jsonFile = outputDirectory + "/" + "galleries.json";

  let galleryMetaData = { "name":galleryName, "images":imageMetaDatas };

  await writeJSON(jsonFile, galleryMetaData);

  console.log("Wrote galleries JSON file:"  + jsonFile);
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
  let galleries = await findGalleries(inputDirectory);
  console.log("galleries", galleries);
  for (gallery of galleries) {
    let galleryOutputDirectory = outputDirectory + "/" + gallery.name;
    console.log("Now processing gallery: '" + gallery.name + "', path: " + galleryOutputDirectory);
    if (!isDirectory(galleryOutputDirectory)) {
      makeDirectory(galleryOutputDirectory);
    }
    await processGalleryImages(gallery.name, gallery.path, galleryOutputDirectory);
    galleryNames.push(gallery.name);
  }

  let jsonFile = outputDirectory + "/" + "galleries-index.json";
  let galleryMetaData = { "galleryNames":galleryNames };
  await writeJSON(jsonFile, galleryMetaData);
  console.log("Wrote galleries index JSON file:"  + jsonFile);
}

if (process.argv.length < 3) {
  console.log("USAGE: node resize.js [input directory] [output directory]")
  return;
}

var inputDirectory = process.argv[2];
var outputDirectory = process.argv[3];

processGalleries(inputDirectory, outputDirectory);



