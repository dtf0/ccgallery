#!/bin/bash

OJFS_HOME=`dirname "${0}"`
OJFS_HOME="${OJFS_HOME}/.."
OJFS_HOME=`cd "${OJFS_HOME}" && pwd -P`
echo "OJFS_HOME is ${OJFS_HOME}"
OJFS_SRC="${OJFS_HOME}/src"
OJFS_SRC_IMAGES="${OJFS_HOME}/src/images"
OJFS_PROD="${OJFS_HOME}/prod"

mkdir -p "${OJFS_PROD}/img/gallery"

#make for's argument seperator newline only
IFS=$'\n'

rm "${OJFS_PROD}/imginfo.txt"

for FILE in `find ${OJFS_SRC_IMAGES} -type f`
do
	echo "Now processing image '${FILE}'"
	FILENAME=`basename ${FILE}`
	cp "${FILE}" "${OJFS_PROD}/img/gallery/"
	THUMB_FILE="${OJFS_PROD}/img/gallery/thumb-${FILENAME}"	
	magick "${FILE}" -resize 10000x100 -quality 92 "${THUMB_FILE}"
	THUMB_WIDTH=`identify -format "%[w]" "${THUMB_FILE}"`
	THUMB_HEIGHT=`identify -format "%[h]" "${THUMB_FILE}"`
	ORIG_WIDTH=`identify -format "%[w]" "${FILE}"`
	ORIG_HEIGHT=`identify -format "%[h]" "${FILE}"`
	echo -n "\"w\":${THUMB_WIDTH}, " >> "${OJFS_PROD}/imginfo.txt"
	echo -n "\"h\":${THUMB_HEIGHT}, " >> "${OJFS_PROD}/imginfo.txt"
	echo -n "\"ow\":${ORIG_WIDTH}, " >> "${OJFS_PROD}/imginfo.txt"
	echo -n "\"oh\":${ORIG_HEIGHT}, " >> "${OJFS_PROD}/imginfo.txt"
	echo "\"f\":\"${FILENAME}\" " >> "${OJFS_PROD}/imginfo.txt"
done

echo "Thumbnails and images were placed in '../prod/img/gallery/'"
echo "Image metadata was placed in ../prod/imginfo.txt"
echo "Don't forget to run 'php -q imagejs.php > ../prod/imagegallery.js' to rebuild imagegallery.js! (note: build.sh already does this for you)"