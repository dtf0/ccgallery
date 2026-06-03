#!/bin/bash

PROJECT_HOME=$(dirname "${0}")
DIST_FOLDER="${PROJECT_HOME}/dist"
WEB_SRC_FOLDER="${PROJECT_HOME}/src/web"

echo "Building ccgallery (copying src/web/ to dist/ in ${PROJECT_HOME})"

echo "Project home: ${PROJECT_HOME}"

if [ ! -e "${DIST_FOLDER}" ]; then
	echo "Creating dist: ${DIST_FOLDER}"
	mkdir -p ${DIST_FOLDER}
fi

cp -r "${WEB_SRC_FOLDER}/" "${DIST_FOLDER}/"

echo "All done! Run 'npm run start_web_server' or './run_server.sh dist' to start a web server!"