var fs = require('fs');
var path = require('path');
var dirname = "./jsonschema/schemas/";
var commons = require("./commons.js");

fs.readdir(dirname, function (err, filenames) {
    if (err) {
        console.log(err);
    }

    var renameHref = function (theObject, prop) {
        var ref = theObject[prop];
        if (ref.includes("http")) {
            commons.renameRefInternals(theObject, prop)            
        }
    }
    
    //This function will go through all objects existing in the json, recursively for nested objects 
    var getObjectRecursive = function (theObject, currentObjectName) {
        var result = null;
        if (theObject instanceof Array) {
            for (var i = 0; i < theObject.length; i++) {
                result = getObjectRecursive(theObject[i], prop);
                if (result) {
                    break;
                }
            }
        } else {
            for (var prop in theObject) {
                if (prop == '$ref') {
                    renameHref(theObject, prop);
                }
                if (theObject[prop] instanceof Object || theObject[prop] instanceof Array) {
                    result = getObjectRecursive(theObject[prop], prop);
                    if (result) {
                        break;
                    }
                }
            }
        }
    }

    filenames.forEach(function (filename) {
        if (filename.includes(".json") && !filename.includes("package")) {
            let openAPIPath = path.join(dirname, filename);
            var file = fs.readFileSync(openAPIPath, {
                encoding: 'utf-8'
            });
            parsedSchema = JSON.parse(file);
            commons.renameRefInternals(parsedSchema, "$schema")
            getObjectRecursive(parsedSchema);
            stringSchema = JSON.stringify(parsedSchema, null, '\t');
            fs.writeFileSync(dirname + filename, stringSchema);
        }
    });  
});