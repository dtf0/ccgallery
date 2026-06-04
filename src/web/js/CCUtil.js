/*
	CCUtil.js - a collection of generic js utilities
	Copyright 2026, Jason Baker (jason@onejasonforsale.com)
	Github for this project: https://github.com/codercowboy/ccgallery
*/

export default class CCUtil {
	/*
		Load a JSON file from the specified location

		argument 'file': string, file to load, example: "http://www.mydomain.com/file.json"
		return: js object that was deserialized from loaded file
	*/
	static async loadJSON(file) {
	  try {
	    console.log("Fetching json file: " + file);
	    // let jsonData = require(file);
	    const response = await fetch(file); // Adjust the path as needed
	    if (!response.ok) {
	      console.log("Error fetching json file '" + file + "'", response);
	    }
	    const jsonData = await response.json(); // Parses the JSON data into a JS object
	    //console.log({ json: jsonData });
	    return jsonData;
	  } catch (error) {
	    console.error("Error fetching JSON file: "+ file, error);
	  }	  
	}

	/*
		Remove all DOM children from an element

		argument 'elementId': string, id of the DOM element to remove children from
		return: nothing
	*/
	static removeElementChildren(elementId) {
		if (elementId == null) {
			return;
		}
		let element = document.getElementById(elementId);
		if (element == null) {
			return;
		}
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
	}

	/*
		Remove specified DOM element from parent element

		argument 'elementId': string, id of the DOM element to remove
		return: nothing
	*/
	static removeElementById(elementId) {
		if (elementId == null) {
			return;
		}
		let element = document.getElementById(elementId);
		CCUtil.removeElement(element);
	}

	/*
		Remove specified DOM element from parent element

		argument 'element': DOM element, the element to remove from parent
		return: nothing
	*/
	static removeElement(element) {
		if (element == null) {
			return;
		}

		if (element.parentNode == null) {
			return;
		}

		let parentNode = element.parentNode;
		parentNode.removeChild(element);
	}

	/*
		Create a DOM element that's a child of the element with id 'elementId'

		argument 'elementId': string, id of the DOM element to add child to
		argument 'childElementName': string, child element type example: "div" or "a"
		argument 'childElementId': string, optional, id to set on the child element
		return: the child element
	*/
	// returns childElement
	static createElementChild(elementId, childElementName, childElementId) {
		if (elementId == null) {
			return;
		}
		let element = document.getElementById(elementId);
		if (element == null) {
			return;
		}
		let childElement = document.createElement(childElementName);
		childElement.id = childElementId;
		element.appendChild(childElement);
		return childElement;
	}

	/*
		Center the specified DOM element within its parent container

		NOTE: this may not work well if the 'position' styles of the specified
		      element and/or its parent don't work. for example the specified element
		      may need to be 'position:absolute;' while the parent is 'position:relative;'

		argument 'element': DOM element, the element to center
		return: nothing
	*/
	static centerElement(element) {
		if (element == null) {
			return;
		}
		let top = ((window.innerHeight - element.clientHeight) / 2);
		let left = ((window.innerWidth - element.clientWidth) / 2);
		element.style.left = left + "px";
		element.style.top = top + "px";
	}
}