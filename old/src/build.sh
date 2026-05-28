#!/bin/bash

echo "### 'build.sh' now running 'buildimages.sh' to create thumbnails"

chmod +x *.sh
./buildimages.sh

echo "### 'build.sh' now using 'imagejs.php' to create prod/imagegallery.js"
php -q imagejs.php > ../prod/imagegallery.js

echo "### 'build.sh' now using 'index.php' to create prod/index.html"
php -q index.php > ../prod/index.html

echo "### All done!"
echo ""
echo "If you'd like, run a webserver in ../prod directory with 'python -m http.server 8070'"
echo "After the server is running, you can view your gallery here: http://localhost:8070"