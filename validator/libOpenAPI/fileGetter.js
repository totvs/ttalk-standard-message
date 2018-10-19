/*
This class has the objective of doing http requests for getting external objects
@author Francisco F. Cardoso | T-TALK
*/

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var results;

/**
 * This method clears all objects before validating the next file
 */
exports.clear = function() {    
    completed_requests = 0;
    results = {
        apiSchema: "",
        typesBaseSchema: {}, //Já posso colocar de default aqui
        notFoundSchemas: []
    };
}

/**
 * This methods runs through the list of schemas and returns a list of schemas 
 * @param {*} schemaObjList Array
 */
exports.getAllExternalFiles = function (schemaObjList) {
    var schemaUrlList = getSchemaUrls(schemaObjList);  
    for (var i in schemaUrlList) {
        getExternalFile(schemaUrlList[i]);
    }
    return results;
}

/**
 *  This methods returns all schemaUrls from schemaObjList
 * @param {*} schemaObjList Array
 */
var getSchemaUrls = function (schemaObjList) { 
    var schemaUrlList = [];
    for (var i in schemaObjList) {
        if(!schemaUrlList.includes(schemaObjList[i].ref)){
            schemaUrlList.push(schemaObjList[i].ref)
        }
    }
    return schemaUrlList;
}

/**
 * This method does the http get request and place the answer in an array
 * If the reference returns a 404 (or any other error) will be placed in a notFoundSchemas list
 * @param {*} url 
 */
var getExternalFile = function (url) {    
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", url, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var body = rawFile.responseText;
                //var isValidSchemaFile = jsonValidator.IsJsonString(body); //TODO: Validar estrutura do schema em um momento de teste
                results.apiSchema = body;
            } else {
                results.notFoundSchemas.push(url);
            }            
        }
    }
    rawFile.send(null); //This triggers onreadystatechange         
}