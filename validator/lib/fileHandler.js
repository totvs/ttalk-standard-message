exports.getAllExternalFiles = function (schemaUrlList, done) {
    for (var i in pathValidatorResult.schemaUrlList) {
        getExternalFile(pathValidatorResult.schemaUrlList[i], done);
    }
}

var getExternalFile = function (url, done) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", url, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var body = rawFile.responseText;
                //responses.push(body);
                completed_requests++;
                var isValidSchemaFile = jsonValidator.IsJsonString(body); //TODO: Ver se faz sentido isso já ficar nesse momento, e como lidaria com ele.
                //Provavelmente não.. lá na função de verificar se o schema é válido que fariamos isso. Ou então na própria validação de schema...
                if (completed_requests == pathValidatorResult.schemaUrlList.length || !isValidSchemaFile) {
                    done();
                }
            }
        }       
    }
    rawFile.send(null); //This triggers onreadystatechange         
}