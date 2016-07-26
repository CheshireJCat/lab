if ("import" in document.createElement("link")) {
	var moduleHeader = document.getElementById("moudleHeader");
	document.getElementsByTagName("body")[0].replaceChild(moduleHeader.import.getElementsByTagName("header")[0], moduleHeader);
	document.getElementById('commonHeaderTitle').innerHTML = document.title;
}