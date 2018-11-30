var fs = require('fs');
var path = require('path');
var dirname = "./jsonschema/apis/";
    fs.readdir(dirname, function (err, filenames) {
      if (err) {
        console.log(err);
      }

      filenames.forEach(function (filename) {
        if (filename.includes(".json") && !filename.includes("package")) {
          let openAPIPath = path.join(dirname, filename);
          var file = fs.readFileSync(openAPIPath, {
            encoding: 'utf-8'
          });
          parsedOpenAPI = JSON.parse(file);
          parsedOpenAPI.servers[0].url = "changedConditional";
          stringOpenAPI = JSON.stringify(parsedOpenAPI, null, '\t');
          // for (var pathkey in parsedOpenAPI.paths) {
          // }
          console.log(dirname + filename);
          fs.writeFileSync(dirname + filename, stringOpenAPI);
        }
    })
})