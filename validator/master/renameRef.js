var fs = require('fs');
var path = require('path');
var dirname = "./jsonschema/apis/";
fs.readdir(dirname, function (err, filenames) {
  if (err) {
    console.log(err);
  }

  console.log(filenames)
  filenames.forEach(function (filename) {
    if (filename.includes(".json") && !filename.includes("package")) {
      let openAPIPath = path.join(dirname, filename);
      var file = fs.readFileSync(openAPIPath, {
        encoding: 'utf-8'
      });
      parsedOpenAPI = JSON.parse(file);
      parsedOpenAPI.servers[0].url = "44remote";
      stringOpenAPI = JSON.stringify(parsedOpenAPI, null, '\t');
      // for (var pathkey in parsedOpenAPI.paths) {
      //   var httpVerbsList = parsedOpenAPI.paths[pathkey]
      //   for (var httpVerbkey in httpVerbsList) {
      //     var httpVerbInfo = parsedOpenAPI.paths[pathkey][httpVerbkey];
      //     var request = httpVerbInfo.requestBody;
      //     renameHref(request);
      //     for (var responseKey in responses) {
      //       var response = responses[responseKey];
      //       if (response.content) {
      //         checkCommonErrorSchema(response, responseKey);
      //         checkIfSchemaIsSettedToExternaFile(response, true);
      //         if (responseKey < 400) //Only success response
      //           renameHref(response);
      //       }
      //     }
      //   }
      //   //console.log(dirname + filename);
      fs.writeFileSync(dirname + filename, stringOpenAPI);
      // }
    }
  })

  // console.log("Reading changed files")
  // filenames.forEach(function (filename) {
  //   if (filename.includes(".json") && !filename.includes("package")) {
  //     let openAPIPath = path.join(dirname, filename);
  //     var file = fs.readFileSync(openAPIPath, {
  //       encoding: 'utf-8'
  //     });
  //     parsedOpenAPI = JSON.parse(file);
  //     console.log(parsedOpenAPI)
  //   }
  // })
});


var renameHref = function (responseRequest) {
  if (responseRequest) {
    if (responseRequest.content) {
      if (responseRequest.content["application/json"].schema) {
        var ref = responseRequest.content["application/json"].schema.$ref;
        if (!ref) {
          if (responseRequest.content["application/json"].schema.items) {
            ref = responseRequest.content["application/json"].schema.items.$ref;
          }
        }
        if (ref) {
          //TODO: Renaming
        }
      }
    }
  }
};