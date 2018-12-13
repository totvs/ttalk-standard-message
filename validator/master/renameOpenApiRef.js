var fs = require('fs');
var path = require('path');
var dirname = "./jsonschema/apis/";
var commons = require("./commons.js");

fs.readdir(dirname, function (err, filenames) {
  if (err) {
    console.log(err);
  }

//TODO: Run Through components/parameters looking for schema/$ref

  filenames.forEach(function (filename) {
    if (filename.includes(".json") && !filename.includes("package")) {
      let openAPIPath = path.join(dirname, filename);
      var file = fs.readFileSync(openAPIPath, {
        encoding: 'utf-8'
      });
      parsedOpenAPI = JSON.parse(file);
      for (var pathkey in parsedOpenAPI.paths) {
        var httpVerbsList = parsedOpenAPI.paths[pathkey]
        for (var httpVerbkey in httpVerbsList) {
          if (httpVerbkey == "parameters") {
            runThroughGeneralParams(httpVerbsList[httpVerbkey]);
          } else {
            var parameters = parsedOpenAPI.paths[pathkey][httpVerbkey].parameters;
            runThroughHttpVerbParams(parameters);
            var httpVerbInfo = parsedOpenAPI.paths[pathkey][httpVerbkey];
            var request = httpVerbInfo.requestBody;
            if (request) {
              renameRequestResponseHref(request);
            }
            var responses = httpVerbInfo.responses;
            if (responses) {
              for (var responseKey in responses) {
                var response = responses[responseKey];
                if (response.content) {
                  renameRequestResponseHref(response);
                }
              }
            }
          }
        }
        stringOpenAPI = JSON.stringify(parsedOpenAPI, null, '\t');
        fs.writeFileSync(dirname + filename, stringOpenAPI);
      }
    }
  })
});

var runThroughGeneralParams = function (parameters) {
  runThroughParamsInternal(parameters);
}

var runThroughHttpVerbParams = function (parameters) {
  runThroughParamsInternal(parameters);
}

var runThroughParamsInternal = function (parameters) {
  for (var parameterKey in parameters) {
    var parameter = parameters[parameterKey];
    commons.renameRefInternals(parameter, "$ref");
  }
}

var renameRequestResponseHref = function (responseRequest) {
  if (responseRequest) {
    if (responseRequest.content) {
      if (responseRequest.content["application/json"].schema) {
        var refObj = responseRequest.content["application/json"].schema;
        if (refObj.$ref) {
          commons.renameRefInternals(refObj, "$ref");
        } else {
          if (responseRequest.content["application/json"].schema.items) {
            refObj = responseRequest.content["application/json"].schema.items;
            commons.renameRefInternals(refObj, "$ref");
          }
          else {
            let oneOfAllOfList = responseRequest.content["application/json"].schema.oneOf ? responseRequest.content["application/json"].schema.oneOf :
             (responseRequest.content["application/json"].schema.allOf? 
             responseRequest.content["application/json"].schema.allOf : []); 
            for(var i in oneOfAllOfList){
              commons.renameRefInternals(oneOfAllOfList[i], "$ref");
            }
          }
        }
      }
    }
  }
};