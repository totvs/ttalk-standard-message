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
        getExternalFile(schemaUrlList[i], schemaUrlList.length);
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
                //var isValidSchemaFile = jsonValidator.IsJsonString(body); //TODO: Ver se faz sentido isso já ficar nesse momento, e como lidaria com ele.
                //Provavelmente não.. lá na função de verificar se o schema é válido que fariamos isso. Ou então na própria validação de schema...
                //Na própria validação do esquema é o melhor
                results.apiSchema = body;
            } else {
                results.notFoundSchemas.push(url);
            }            
        }
    }
    rawFile.send(null); //This triggers onreadystatechange         
}