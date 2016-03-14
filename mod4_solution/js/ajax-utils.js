(function(global){
var ajaxUtils = {};

// Returns an HTTP request Object
function getRequestObject() {
	if (window.XMLHttpRequest) {
		return( new XMLHttpRequest() );
	} else if (window.ActiveXObject) {
		return(new ActiveXObject("Microsoft.XMLHTTP") );
	} else {
		global.alert("Ajax is not Supported");
		return(null);
	}
}

// Makes an Ajax GET Request to 'requestUrl' and call the requestHandler
ajaxUtils.sendGetRequest = function(requestUrl, responseHandler, isJsonResponse) {
	var request = getRequestObject();
	request.onreadystatechange = function() {
		handleResponse(request, responseHandler, isJsonResponse);
	};
	request.open("GET", requestUrl, true);
	request.send(null);
};

// Only calls user provided 'responseHandler'
// function if response is ready and not an error
function handleResponse(request, responseHandler, isJsonResponse) {
	if (request.readyState == 4 && request.status == 200) {
		if (isJsonResponse == undefined) {
			isJsonResponse = true;
		}

		if (isJsonResponse) {
			responseHandler(JSON.parse(request.responseText));
		} else {
			responseHandler(request.responseText);
		}
	}
}

global.$ajaxUtils = ajaxUtils;

})(window);
