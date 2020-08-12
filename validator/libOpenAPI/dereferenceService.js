var $RefParser = require('json-schema-ref-parser');

exports.dereference = async function (derefResult, callbackDereferenceResult) {
    var parser = new $RefParser();
    var dereferenceOptions = {
        dereference: { //these are options
          dereference: true
        },
        resolve: {
          external: true,
          http: {
<<<<<<< HEAD
            timeout: 5000
=======
            timeout: 10000
>>>>>>> master
          }
        }
      }
    await parser.dereference(derefResult, dereferenceOptions, await callbackDereferenceResult); 
}