var fs = require('fs');
var path = require('path');
var dirnames = ["./jsonschema/apis/", "./jsonschema/apis/types/"];
var commons = require("./commons.js");
var multiContentHelper = require("../helper/multicontentHelper.js");


dirnames.forEach(function (dirname) {

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
          if (parsedOpenAPI.components) {
            renameComponentParameters();
          }
          stringOpenAPI = JSON.stringify(parsedOpenAPI, null, '\t');
          fs.writeFileSync(dirname + filename, stringOpenAPI);
        }

      }
    })
  })
})

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
      const contentType = multiContentHelper.getContentType(responseRequest.content);
      if (responseRequest.content[contentType].schema) {
        var refObj = responseRequest.content[contentType].schema;
        if (refObj.$ref) {
          commons.renameRefInternals(refObj, "$ref");
        } else {
          lookForRefLevel(responseRequest, refObj);
        }
      }
    }
  }
}

function renameComponentParameters() {
  let parameters = parsedOpenAPI.components.parameters;
  for (var parameterKey in parameters) {
    if (parameters[parameterKey].schema) {
      let schema = parameters[parameterKey].schema;
      if (schema) {
        if (schema.$ref) {
          commons.renameRefInternals(schema, "$ref");
        }
      }
    }
  }
}

function lookForRefLevel(responseRequest, refObj) {
  const contentType = multiContentHelper.getContentType(responseRequest.content);
  if (responseRequest.content[contentType].schema.items) {
    renameSchemaItemsRef(refObj, responseRequest);
  } else {
    lookForAllOfAndOneOf(responseRequest);
  }
}

function renameSchemaItemsRef(refObj, responseRequest) {
  const contentType = multiContentHelper.getContentType(responseRequest.content);
  refObj = responseRequest.content[contentType].schema.items;
  commons.renameRefInternals(refObj, "$ref");
}

function lookForAllOfAndOneOf(responseRequest) {
  const contentType = multiContentHelper.getContentType(responseRequest.content);
  let oneOfAllOfList = responseRequest.content[contentType].schema.oneOf ? responseRequest.content[contentType].schema.oneOf :
    (responseRequest.content[contentType].schema.allOf ?
      responseRequest.content[contentType].schema.allOf : []);
  for (var i in oneOfAllOfList) {
    commons.renameRefInternals(oneOfAllOfList[i], "$ref");
  }
}