#!/bin/bash

# run_server.sh - a generic script that starts the simple webserver that ships with python
# Copyright 2026, Jason Baker (jason@onejasonforsale.com)
# Github for this project: https://github.com/codercowboy/ccgallery


PROJECT_HOME=$(dirname "${0}")

if [ -z "${1}" ]; then
	echo "USAGE: run_server.sh [directory] (port)"
	echo "  directory - where to host the web server"
	echo "  port - optional, which port to host the server on"
	exit 1
fi

HOST_DIR="${1}"
if [ ! -d "${HOST_DIR}" ]; then
	echo "Error: Host directory doesn't exist or isn't directory: ${HOST_DIR}"
	exit 1
fi

PORT="8070"
if [ ! -z ${2} ]; then
	PORT="${2}"
fi

# check for python -- command -v exits non-zero if the executable isn't on PATH.
PYTHON="$(command -v python3 || command -v python)"
if [ -z "${PYTHON}" ]; then
	echo "Python isn't installed or accessible, can't host web server."
	echo "Install it via something like apt on linux, homebrew on macos, or cygwin on windows"
	exit 1
fi


echo "Running simple python web server in ${HOST_DIR} on port ${PORT}"
echo
echo "NOTE: Python web server isn't meant for proper production uses!"
echo "      Read about it here: https://docs.python.org/3/library/http.server.html"
echo 
echo "When server is running, view it with this in your browser:"
echo
echo "http://localhost:${PORT}/"
echo

cd "${HOST_DIR}" && "${PYTHON}" -m http.server "${PORT}"
