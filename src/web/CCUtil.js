export default class CCUtil {
	static async loadJSON(file) {
	  try {
	    console.log("Fetching json file: " + file);
	    // let jsonData = require(file);
	    const response = await fetch(file); // Adjust the path as needed
	    if (!response.ok) {
	      console.log("Error fetching json '" + file + "'", response);
	    }
	    const jsonData = await response.json(); // Parses the JSON data into a JS object
	    //console.log({ json: jsonData });
	    return jsonData;
	  } catch (error) {
	    console.error("Error fetching JSON file: "+ file, error);
	  }	  
	}

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

	static removeElement(elementId) {
		if (elementId == null) {
			return;
		}
		let element = document.getElementById(elementId);
		if (element == null) {
			return;
		}

		if (element.parentNode == null) {
			return;
		}

		let parentNode = element.parentNode;
		parentNode.removeChild(element);
	}

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

	static centerElement(element) {
		if (element == null) {
			return;
		}
		console.log("height: " + element.clientHeight);
		let top = ((window.innerHeight - element.clientHeight) / 2);
		let left = ((window.innerWidth - element.clientWidth) / 2);
		element.style.left = left + "px";
		element.style.top = top + "px";
	}
}