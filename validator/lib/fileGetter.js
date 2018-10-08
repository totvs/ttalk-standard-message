var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var results;

exports.clear = function() {    
    completed_requests = 0;
    results = {
        apiSchemasList: [],
        notFoundSchemas: []
    };
}

exports.getAllExternalFiles = function (schemaUrlList) {
    for (var i in schemaUrlList) {
        getExternalFile(schemaUrlList[i], schemaUrlList.length);
    }
    return results;
}

var getExternalFile = function (url, length) {    
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", url, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var body = rawFile.responseText;
                //var isValidSchemaFile = jsonValidator.IsJsonString(body); //TODO: Ver se faz sentido isso já ficar nesse momento, e como lidaria com ele.
                //Provavelmente não.. lá na função de verificar se o schema é válido que fariamos isso. Ou então na própria validação de schema...
                //Na própria validação do esquema é o melhor
                results.apiSchemasList.push(body);

            } else {
                results.notFoundSchemas.push(url);
            }            
        }
    }
    rawFile.send(null); //This triggers onreadystatechange         
}