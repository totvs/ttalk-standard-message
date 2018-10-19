var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var results;

exports.clear = function() {    
    completed_requests = 0;
    results = {
        apiSchema: "",
        typesBaseSchema: {}, //Já posso colocar de default aqui
        notFoundSchemas: []
    };
}

exports.getAllExternalFiles = function (schemaObjList) {
    var schemaUrlList = getSchemaUrls(schemaObjList);  
    for (var i in schemaUrlList) {
        getExternalFile(schemaUrlList[i]);
    }
    return results;
}

var getSchemaUrls = function (schemaObjList) { 
    var schemaUrlList = [];
    for (var i in schemaObjList) {
        if(!schemaUrlList.includes(schemaObjList[i].ref)){
            schemaUrlList.push(schemaObjList[i].ref)
        }
    }
    return schemaUrlList;
}

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