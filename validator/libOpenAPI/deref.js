var $RefParser = require('json-schema-ref-parser');

exports.derefScript = async function (parsedOpenAPI) {
    
    var parser = new $RefParser();
    var resultEvaluation = true;
    await parser.bundle(parsedOpenAPI, { //.bundle doc https://apidevtools.org/json-schema-ref-parser/docs/ref-parser.html#bundleschema-options-callback
        dereference: { //these are options
            dereference: true
        },
        resolve: {
            external: true,
            http: {
                redirects: 0,
                timeout: 20000
            }
        }
    }, function (err, newSchema) {
        if (err) {
            resultEvaluation = false;
        } else {
            resultEvaluation = true;
        }
        return resultEvaluation;
    });
}