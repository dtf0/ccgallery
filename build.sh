#!/bin/bash

PROJECT_HOME=$(dirname "${0}")
DIST_FOLDER="${PROJECT_HOME}/dist"
WEB_SRC_FOLDER="${PROJECT_HOME}/src/web"

echo "Project home: ${PROJECT_HOME}"

if [ ! -e "${DIST_FOLDER}" ]; then
	echo "Creating dist: ${DIST_FOLDER}"
	mkdir -p ${DIST_FOLDER}
fi

echo "Copying src/web to dist/ (${WEB_SRC_FOLDER}/* -> ${DIST_FOLDER})"
cp -r "${WEB_SRC_FOLDER}/" "${DIST_FOLDER}/"