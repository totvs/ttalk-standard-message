/*
This class has the objective of doing json related operations
@author Francisco F. Cardoso | T-TALK
*/

/**
 * This method checks if string is a valid json
 * @param {*} str 
 */
exports.IsJsonString = function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * This method builds a list of objects from a list JSON strings (Schema)
 * @param {*} pathSchemaObjList Array of objects
 * @param {*} apiSchema String
 */
exports.buildSchemaObjectBody = function (pathSchemaObjList, apiSchema) {
    if (apiSchema) {
        var parsedObjectBody = JSON.parse(apiSchema);
        for (var i in pathSchemaObjList) {
            pathSchemaObjList[i].objectBody = parsedObjectBody;
        }
        return pathSchemaObjList;
    }
    else {
        return "Undefined apiSchema"
    }
}