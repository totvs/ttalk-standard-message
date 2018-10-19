var results;
var parsedSchema;

var checkIfObjectIsValid = function (theObject, prop) {
    if (results.validObject != false) {
        var ref = theObject[prop];
        if (ref.includes("#/definitions/") && !ref.includes("http")) { //TODO: Else checking if is possible to GET the file and external object is valid (Types)
            var objectName = ref.slice(ref.indexOf("definitions/") + 12, ref.length);
            results.validObject = (parsedSchema.definitions[objectName] != undefined &&
                parsedSchema.definitions[objectName] != null);
            if (results.validObject == false) {
                results.erroredObjectName = objectName;
            }
        }
    }
}

var checkXtotvs = function (theObject, prop, currentObjectName) {
    if (currentObjectName != "info") { //Skip INFO x-totvs
        var xTotvs = theObject[prop];
        CheckIfXTotvsIsArray(xTotvs, currentObjectName);
        CheckIfXTotvsContainRequiredProperties(xTotvs, currentObjectName);
    }
};

var CheckIfXTotvsIsArray = function (xTotvs, currentObjectName) {
    if (results.useXTotvsAsArray != false) {
        if (Array.isArray(xTotvs)) {
            results.useXTotvsAsArray = true;
        } else {
            results.useXTotvsAsArray = false;
            results.wrongXTotvs = "Object with invalid x-totvs: '" + currentObjectName + "'";
        }
    }
}

var CheckIfXTotvsContainRequiredProperties = function (xTotvs, currentObjectName) {
    if (results.XTotvsContainProduct != false && results.XTotvsContainAvailable != false) {
        for (var i in xTotvs) {
            if (!xTotvs[i].hasOwnProperty("product")) {
                results.XTotvsContainProduct = false;
                results.wrongXTotvsProduct = "Object with invalid x-totvs: '" + currentObjectName + "'. Missing property 'product'. If the property is there, please check if it's correclty spelled"
            }
            if (!xTotvs[i].hasOwnProperty("available")) {
                results.XTotvsContainAvailable = false;
                results.wrongXTotvsAvailable = "Object with invalid x-totvs: '" + currentObjectName + "'. Missing property 'available'. If the property is there, please check if it's correclty spelled"
            }
        }
    }
}

var checkIfEnumIsString = function (theObject, currentObjectName) {
    if (results.enumIsString != false) {
        if (theObject.hasOwnProperty("enum") && theObject.type) {
            if (theObject.type.toLowerCase() != "string") {
                results.enumIsString = false;
                results.wrongEnumAsString = "Object with invalid enum: '" + currentObjectName + "'. Object type must be 'string'"
            }
        }
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
            checkIfEnumIsString(theObject, currentObjectName)
            if (prop == '$ref') {
                checkIfObjectIsValid(theObject, prop);
            }
            if (prop == 'x-totvs') {
                checkXtotvs(theObject, prop, currentObjectName);
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

exports.validateSchema = function (_parsedSchema) {
    parsedSchema = _parsedSchema;
    getObjectRecursive(parsedSchema);
    return results;
}

exports.clear = function () {
    results = {};
}