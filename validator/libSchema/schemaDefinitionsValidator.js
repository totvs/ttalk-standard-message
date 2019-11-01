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
                results.errorObjectName = objectName;
            }
        }
    }
}

var checkXtotvs = function (theObject, prop, currentObjectName, parent) {
    if (currentObjectName != "info") { //Skip INFO x-totvs
        var xTotvsArr = theObject[prop];
        CheckIfXTotvsIsArray(xTotvsArr, currentObjectName);
        for (var i in xTotvsArr) {
            if (checkIsControlProperty(i)) { //makes it not to walk through .parent or theObject.isAParent
                CheckIfXTotvsIsAvailableWhileParentHasRequired(xTotvsArr[i], currentObjectName, parent);
                CheckIfAvailableCanUpdateRequiredAreBoolean(xTotvsArr[i], currentObjectName);
                CheckIfXTotvsContainMandatoryProperties(xTotvsArr[i], currentObjectName);
                CheckIfNoteWordsHaveMaximumAllowedCharacteres(xTotvsArr[i], currentObjectName);
            }
        }
    }
};

var CheckIfNoteWordsHaveMaximumAllowedCharacteres = function (xTotvs, currentObjectName) {
    if (results.hasSmallLengthNoteWords != false) {
        var note = xTotvs.note;
        if (note) {
            var words = note.match(/\S+/g); //Split words
            for (var i in words) {
                if (words[i].length <= 50) {
                    results.hasSmallLengthNoteWords = true;
                } else {
                    results.hasSmallLengthNoteWords = false;
                    results.wrongXTotvsNotesWordSize = "Object with invalid x-totvs (notes): '" + currentObjectName + "'. Max-Lenght(per word): 50"; 
                }
            }
        }
    }
};

var CheckIfXTotvsIsAvailableWhileParentHasRequired = function (xTotvs, currentObjectName, parent) {
    if (results.hasAcceptableAvailable != false) {
        if (xTotvs.hasOwnProperty('available')) {
            if (xTotvs.available) { //if is available
                results.hasAcceptableAvailable = true; //no problem
            } else { //if it's not available, we have to check if it is required in the parent
                if (parent) {
                    if (parent.hasOwnProperty('required')) {
                        for (j in parent.required) {
                            if (checkIsControlProperty(j)) { //makes it not to walk through .parent or theObject.isAParent
                                if (parent.required[j] == currentObjectName) { //if the object name is inside the required array
                                    results.hasAcceptableAvailable = false; //we have a problem
                                    results.inconsistentAvailable = "Object '" + currentObjectName + "' is 'available:false', but is required at the same time.\n" +
                                        "Please, change available to true or remove the object from the required array.\n";
                                    return;
                                } else {
                                    results.hasAcceptableAvailable = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

var CheckIfRequiredMeetRequirements = function (theObject, currentObjectName) {
    if (theObject.isAParent && theObject.hasOwnProperty('required') && results.requiredIsAnArray != false) {
        if (theObject.required instanceof Array) {
            results.requiredIsAnArray = true;
            for (j in theObject.required) {
                if (checkIsControlProperty(j) && results.requiredIsArrayOfStrings != false) { //makes it not to walk through .parent or parent.isAParent
                    if (typeof (theObject.required[j]) == "string") {
                        results.requiredIsArrayOfStrings = true;
                        if (results.hasRequiredProperty != false) {
                            if (theObject.properties.hasOwnProperty(theObject.required[j])) {
                                results.hasRequiredProperty = true;
                            } else {
                                results.hasRequiredProperty = false;
                                results.hasRequiredPropertyErrMsg = "Schema has '" + theObject.required[j] + "' as a required type (at '" + currentObjectName + "'), but it does not exist as a property.";
                            }
                        }
                    } else {
                        results.requiredIsArrayOfStrings = false;
                        results.requiredIsArrayOfStringsErrMsg = "The array element '" + theObject.required[j] + "', at '" + currentObjectName + "' required field, must be a string.";
                    }
                }
            }
        } else {
            results.requiredIsAnArray = false;
            results.requiredIsAnArrayErrMsg = "The 'required' property of '" + currentObjectName + "' must be an array of strings.";
        }
    }
}


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

var CheckIfAvailableCanUpdateRequiredAreBoolean = function (xTotvs, currentObjectName) {
    if (results.availableIsBoolean != false) {
        if (typeof xTotvs.available == "boolean") {
            results.availableIsBoolean = true;
        } else {
            results.availableIsBoolean = false;
            results.availableIsBooleanMsg = "At object '" + currentObjectName + "', the property 'available' must be a boolean type.";
        }
    }
    if (results.canUpdateIsBoolean != false) {
        if (xTotvs.hasOwnProperty("canUpdate")) {
            if (typeof xTotvs.canUpdate == "boolean") {
                results.canUpdateIsBoolean = true;
            } else {
                results.canUpdateIsBoolean = false;
                results.canUpdateIsBooleanMsg = "At object '" + currentObjectName + "', the property 'canUpdate' must be a boolean type.";
            }
        }
    }
    if (results.requiredIsBoolean != false) {
        if (xTotvs.hasOwnProperty("required")) {
            if (typeof xTotvs.required == "boolean") {
                results.requiredIsBoolean = true;
            } else {
                results.requiredIsBoolean = false;
                results.requiredIsBooleanMsg = "At object '" + currentObjectName + "', the property 'required' must be a boolean type.";
            }
        }
    }
}

var CheckIfXTotvsContainMandatoryProperties = function (xTotvs, currentObjectName) {
    if (!xTotvs.hasOwnProperty("product")) {
        results.XTotvsContainProduct = false;
        results.wrongXTotvsProduct = "Object with invalid x-totvs: '" + currentObjectName + "'. Missing property 'product'. If the property is there, please check if it's correclty spelled"
    }
    if (!xTotvs.hasOwnProperty("available")) {
        results.XTotvsContainAvailable = false;
        results.wrongXTotvsAvailable = "Object with invalid x-totvs: '" + currentObjectName + "'. Missing property 'available'. If the property is there, please check if it's correclty spelled"
    }
}

var checkIfEnumIsString = function (theObject, currentObjectName) {
    if (results.enumIsString != false) {
        if (theObject.hasOwnProperty("enum") && theObject.type) {
            for (var i in theObject.enum) {
                if (checkIsControlProperty(i)) {
                    if (typeof (theObject.enum[i]) != "string") {
                        results.enumIsString = false;
                        results.wrongEnumAsString = "Object with invalid enum: '" + currentObjectName + "'. Enum must be a 'string'."
                    }
                }
            }
        }
    }
}

var $refCache = {};

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

var checkRecursive = function (theObject, currentObjectName, parent) {
    if (!theObject.$idCache)
        theObject.$idCache = guid();

    if ($refCache[theObject.$idCache] !== true) {
        $refCache[theObject.$idCache] = true;
        result = getObjectRecursive(theObject, currentObjectName, parent);
        $refCache[theObject.$idCache] = false;
    }
}

var checkIsControlProperty = function (propertyName) {
    return ((propertyName != 'parent') && (propertyName != 'isAParent') && (propertyName != '$idCache'));
}

//This function will go through all objects existing in the json, recursively for nested objects 
var getObjectRecursive = function (theObject, currentObjectName, parent) {
    if (!theObject.$idCache)
        theObject.$idCache = guid();

    if (parent) theObject.parent = parent;
    if (theObject instanceof Array) { //if the current object is an Array
        for (var i = 0; i < theObject.length; i++) { //walk through this array
            if (checkIsControlProperty(i) && theObject[i] != null) {
                checkRecursive(theObject[i], prop, theObject.parent); //enter until it's not an array anymore                
            }
        }

    } else { //if the current object is not an array
        for (var prop in theObject) { //for each prop inside the object
            if (checkIsControlProperty(prop)) { //makes it not to walk through .parent or theObject.isAParent
                if (prop == 'enum') {
                    checkIfEnumIsString(theObject, currentObjectName);
                }
                if (prop == '$ref') {
                    checkIfObjectIsValid(theObject, prop);
                }
                if (prop == 'x-totvs') {
                    checkXtotvs(theObject, prop, currentObjectName, theObject.parent);
                }

                if (theObject.hasOwnProperty("type") && (theObject.hasOwnProperty("properties")) || (theObject.hasOwnProperty("allOf")) || (theObject.hasOwnProperty("anyOf") || (theObject.hasOwnProperty("oneOf")))) { //I'll have to check if it's also allof anyof etc
                    theObject.isAParent = true;
                    CheckIfRequiredMeetRequirements(theObject, currentObjectName);
                }

                if (theObject[prop] instanceof Object || theObject[prop] instanceof Array) { //if theObject[prop] has elements
                    if (theObject != null) {
                        if (theObject.isAParent) {
                            checkRecursive(theObject[prop], prop, theObject); //enter that guy passing this object as the parent
                        } else {
                            checkRecursive(theObject[prop], prop, theObject.parent); //enter that guy passing the parent of this object as the parent
                        }
                    }
                }
            }
        }
    }
}

exports.validateSchema = function (_parsedSchema, done) {
    parsedSchema = _parsedSchema;
    if (_parsedSchema) getObjectRecursive(parsedSchema);
    done();
    return results;
}

exports.clear = function () {
    results = {};
}