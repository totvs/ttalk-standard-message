var results;

var checkIfObjectIsValid = function (schemaObjectBody, objectName, ref) {
    if (schemaObjectBody) {
        if (results.validObject != false && schemaObjectBody.definitions) { //If another object was already defined as invalid, this wont't verify the next, improving performance and preventing one correct object replacing the info of an incorrect object
            results.validObject = (schemaObjectBody.definitions[objectName] != undefined &&
                schemaObjectBody.definitions[objectName] != null)
            if (results.validObject == false) {
                results.erroredObjectName = objectName;
                results.ref = ref;
            }
        }
    }
};


var checkIfHasNextAndItems = function (properties, pathkey) {
    if (properties && results.containsItemsAndHasNext != false) {
        if (properties.hasOwnProperty("items") || properties.hasOwnProperty("hasNext")) {
            results.containsItemsAndHasNext = properties.hasOwnProperty("items") && properties.hasOwnProperty("hasNext");
            if (results.containsItemsAndHasNext == false) {
                results.erroredPath = pathkey;
            }
        }
    }
}

exports.clear = function () {
    results = {
        containsItemsAndHasNext: true        
    };
}

//TODO: Extract Methods
exports.runThroughSchemaObjects = function (pathValidatorResult) {
    for (var i in pathValidatorResult.schemaObjList) {
        var iscolleciton = pathValidatorResult.schemaObjList[i].iscollection;
        var pathkey = pathValidatorResult.schemaObjList[i].pathkey;
        var pathidkey = pathkey.substr(pathkey.lastIndexOf("/{") + 2, pathkey.length).replace("}", "").replace("{", "");
        var ref = pathValidatorResult.schemaObjList[i].ref;
        var objectName = pathValidatorResult.schemaObjList[i].objectName;
        var schemaObjectBody = pathValidatorResult.schemaObjList[i].objectBody;
        checkIfObjectIsValid(schemaObjectBody, objectName, ref);
        if (results.validObject) {
            var objectBody = schemaObjectBody.definitions[objectName];
            var properties = objectBody.properties;
            checkIfHasNextAndItems(properties, pathkey);
            //Had to do 'properties' validation because there are some none-collection endpoints which return list as the entity been approved (business requirement)
            if (iscolleciton && results.containsTheSameKeyInUrlAndBody != false) results.containsTheSameKeyInUrlAndBody = true; //No need to validate that. Collections don't have 'id' in URL
            else {
                if (results.containsTheSameKeyInUrlAndBody != false) {
                    results.containsTheSameKeyInUrlAndBody = properties ? properties.hasOwnProperty(pathidkey) : true;
                    if (results.containsTheSameKeyInUrlAndBody == false) {
                        results.erroredPath = pathkey;
                    }
                }
            }
        }
    }
    return results;
}