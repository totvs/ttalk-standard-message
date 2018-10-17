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

var checkXtotvs = function (theObject, prop, parentObjectName) {
    if (parentObjectName != "info") { //Skip INFO x-totvs
        var xTotvs = theObject[prop];
        if (results.useXTotvsAsArray != false) {
            if (Array.isArray(xTotvs)) {
                results.useXTotvsAsArray = true
            } else {
                results.useXTotvsAsArray = false;
                results.wrongXTotvs = "Object with invalid x-totvs: '" + parentObjectName + "'";
            }
        }
    }
};

var getObjectRecursive = function (theObject, parentObjectName) {
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
                checkIfObjectIsValid(theObject, prop);
            }
            if (prop == 'x-totvs') {
                checkXtotvs(theObject, prop, parentObjectName);
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

var getAllHrefs = function () {

}

var checkIfReferenceIsValid = function () {

}

exports.validateSchema = function (_parsedSchema) {
    parsedSchema = _parsedSchema;
    getObjectRecursive(parsedSchema);
    return results;
}

exports.clear = function () {
    results = {};
}