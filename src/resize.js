const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// node filesystem reference: https://nodejs.org/api/fs.html
// node path reference: https://nodejs.org/api/path.html
// sharp image library reference: https://sharp.pixelplumbing.com/

async function resizeImage(originalFilePath, thumbnailFilePath) {  
  let image = sharp(originalFilePath);

  // resize image to auto-width (first 'null' arg) given height of 100
  await image.resize(null, 100, (err) => {
    console.log("resize error", err)
  }); 

  // save image as jpg
  await image.jpeg({ mozjpeg:true }).toFile(thumbnailFilePath);
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

async function processImages(inputDirectory, outputDirectory) {
  if (!fs.existsSync(inputDirectory)) {
    console.log("Input directory does not exist: " + inputDirectory)
    return;
  }

  if (!fs.existsSync(outputDirectory)) {
    console.log("Output directory does not exist: " + outputDirectory)
    return;
  }

  console.log("Processing images in '" + inputDirectory + "', thumbnails will be in '" + outputDirectory + "'");

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

    console.log("Processing '" + originalFilePath + "' -> '" + thumbnailFilePath + "'");

    // copy input file to gallery directory
    let copiedFilePath = outputDirectory + "/" + originalFile;
    await fs.copyFileSync(originalFilePath, copiedFilePath);

    // create resized thumbnail in gallery directory
    await resizeImage(copiedFilePath, thumbnailFilePath);

    // save image metadata
    let imageMetaData = await getImageMetaData(copiedFilePath, thumbnailFilePath);
    imageMetaDatas.push(imageMetaData);
  }

  let jsonFile = outputDirectory + "/" + "galleries.json";

  await writeJSON(jsonFile, imageMetaDatas);

  console.log("Wrote galleries JSON file:"  + jsonFile);
}

if (process.argv.length < 3) {
  console.log("USAGE: node resize.js [input directory] [output directory]")
  return;
}

var inputDirectory = process.argv[2];
var outputDirectory = process.argv[3];

if (!fs.existsSync(inputDirectory)) {
  console.log("Input directory does not exist: " + inputDirectory)
  return;
}

if (!fs.existsSync(outputDirectory)) {
  console.log("Output directory does not exist: " + outputDirectory)
  return;
}

processImages(inputDirectory, outputDirectory);



