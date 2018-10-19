exports.IsJsonString = function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

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