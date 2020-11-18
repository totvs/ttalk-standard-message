var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

exports.getNoVersionToCompareOkResponse = function () {
	return {
		isBackwardCompatible: true,
		hadChanges: true
	};
}

exports.getApisDiff = function (newerApi, olderApi) {
	var requestObject = {
		"newerVersion": JSON.stringify(newerApi),
		"olderVersion": JSON.stringify(olderApi)
	}
	return doHttpRequest(requestObject);
}

var doHttpRequest = function (requestObject) {
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		var _strReturn;
		xhr.open("POST", "https://oa3diff.totvs.io/totvseai/openapicomparator/v1/json", true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.onload = function () {
			if (xhr.status === 200 || xhr.status == 0) {
				_strReturn = xhr.responseText;
			} else {
				_strReturn = '{"isBackwardCompatible": false, "consoleRender":"Validator error: Comparator API returned an http error: ' + xhr.status + ' - ' + xhr.statusText + '"}';
			}
			resolve(JSON.parse(_strReturn));
		}
		xhr.onerror = function () {
			_strReturn = '{"isBackwardCompatible": false, "consoleRender":"Validator error: Comparator API seems not to be responding"}';
			resolve(JSON.parse(_strReturn));
		}
		xhr.send(JSON.stringify(requestObject)); 		
	});
}