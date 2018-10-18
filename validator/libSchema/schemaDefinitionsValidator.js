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

var checkXtotvs = function (theObject, prop, parentObjectName) {
    if (parentObjectName != "info") { //Skip INFO x-totvs
        var xTotvs = theObject[prop];
        CheckIfXTotvsIsArray(xTotvs, parentObjectName);
        CheckIfXTotvsContainRequiredProperties(xTotvs, parentObjectName);
    }
};

var CheckIfXTotvsIsArray = function (xTotvs, parentObjectName) {
    if (results.useXTotvsAsArray != false) {
        if (Array.isArray(xTotvs)) {
            results.useXTotvsAsArray = true;
        } else {
            results.useXTotvsAsArray = false;
            results.wrongXTotvs = "Object with invalid x-totvs: '" + parentObjectName + "'";
        }
    }
}


var CheckIfXTotvsContainRequiredProperties = function (xTotvs, parentObjectName) {
    if (results.XTotvsContainProduct != false && results.XTotvsContainAvailable != false) {
        for (var i in xTotvs) {           
            if(!xTotvs[i].hasOwnProperty("product")){
                results.XTotvsContainProduct = false;
                results.wrongXTotvsProduct = "Object with invalid x-totvs: '" + parentObjectName + "'. Missing property 'product'. If the property is there, please check if it's correclty spelled"
            }
            if(!xTotvs[i].hasOwnProperty("available")){
                results.XTotvsContainAvailable = false;
                results.wrongXTotvsAvailable = "Object with invalid x-totvs: '" + parentObjectName + "'. Missing property 'available'. If the property is there, please check if it's correclty spelled"
            }
        }      
    }
}

//This function will go through all objects existing in the json, recursively for nested objects 
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

exports.validateSchema = function (_parsedSchema) {
    parsedSchema = _parsedSchema;
    getObjectRecursive(parsedSchema);
    return results;
}

exports.clear = function () {
    results = {};
}