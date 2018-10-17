var results;
var parsedSchema;


var checkIfObjectIsValid = function (theObject, prop) {
    if (results.validObject != false) {
        var ref = theObject[prop];
        if (ref.includes("#/definitions/") && !ref.includes("http")) {
            var objectName = ref.slice(ref.indexOf("definitions/") + 12, ref.length);
            results.validObject = (parsedSchema.definitions[objectName] != undefined &&
                parsedSchema.definitions[objectName] != null);
            if (results.validObject == false) {
                results.erroredObjectName = objectName;
            }
        }
    }
}

var getObject = function (theObject) {
    var result = null;
    if (theObject instanceof Array) {
        for (var i = 0; i < theObject.length; i++) {
            result = getObject(theObject[i]);
            if (result) {
                break;
            }
        }
    } else {
        for (var prop in theObject) {
            //console.log(prop + ': ' + theObject[prop]);
            if (prop == '$ref') {
                checkIfObjectIsValid(theObject, prop);
            }
            if (theObject[prop] instanceof Object || theObject[prop] instanceof Array) {
                result = getObject(theObject[prop]);
                if (result) {
                    break;
                }
            }
        }
    }
    return result;
}

var getAllHrefs = function () {

}

var checkIfReferenceIsValid = function () {

}

exports.validateSchema = function (_parsedSchema) {
    parsedSchema = _parsedSchema;
    getObject(parsedSchema);
    return results;
}

exports.clear = function () {
    results = {};
}