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
            redirects: 0,
            timeout: 10000
          }
        }
      }
    await parser.dereference(derefResult, dereferenceOptions, await callbackDereferenceResult); 
}