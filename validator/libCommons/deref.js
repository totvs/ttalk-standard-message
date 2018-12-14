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
                timeout: 50000
            }
        }
    }, await function (err, newSchema) {
        if (err) {
            var resultEvaluation = false;
        } else {
            var resultEvaluation = true;
        }
        if (resultEvaluation) {
            dereferencedSchema.payload = newSchema;
        } else {
            dereferencedSchema.payload = false;
            dereferencedSchema.derefErroDetail = err;
        }
    });
    return dereferencedSchema;
}