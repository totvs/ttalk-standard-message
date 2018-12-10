var $RefParser = require('json-schema-ref-parser');

exports.getDereferenced = async function (parsedSchema) {
    var parser = new $RefParser();
    var dereferencedSchema = parsedSchema;
    await parser.dereference(parsedSchema, {
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
    }, await function (err, newSchema) {
        if (err) {
            var resultEvaluation = false;
        } else {
            var resultEvaluation = true;
        }
        if (resultEvaluation) {
            dereferencedSchema = newSchema;
        } else {
            dereferencedSchema = parsedSchema;
        }
    });
    return dereferencedSchema;
    
}