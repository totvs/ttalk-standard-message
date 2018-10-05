"use strict";

var expect = require('expect.js');
var fs = require('fs');
var path = require('path');
var pathValidator = require('../lib/pathValidator.js');
var jsonValidator = require('../lib/jsonValidator.js');
var fileHandler = require('../lib/fileHandler.js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var expect = require('chai').expect;

describe("Validating files...", function () {
  it("test suite started", function () {

  })
});

//OPENAPIS //
var dirname = "./jsonschema/apis/";
fs.readdir(dirname, function (err, filenames) {
  if (err) {
    console.log(err);
  }

  console.log('OPENAPI files');
  console.log(filenames);
  filenames.forEach(function (filename) {
    if (filename.includes(".json") && !filename.includes("package")) {
      let openAPIPath = path.join(dirname, filename);

      describe("OpenAPI - " + filename, function () {
        var file = fs.readFileSync(openAPIPath, {
          encoding: 'utf-8'
        });
        var parsedOpenAPI;
        var pathValidatorResult
        var apiSchemasList;

        before(function () { //function (done)
          parsedOpenAPI = JSON.parse(file);
          pathValidator.clear();
          pathValidatorResult = pathValidator.runThroughPaths(parsedOpenAPI);
          //apiSchemasList = fileHandler.getAllExternalFiles(pathValidatorResult.schemaUrlList, done);
        })

        describe(" - Filename: ", function () {
          it("should start with uppercase letter", function () {
            expect(filename[0]).to.equal(filename[0].toUpperCase());
          });

          it("should contain version (lowercase 'v')", function () {
            let containsVersion = filename.includes("_v");
            expect(containsVersion).to.be.true;
          });
        });

        describe(" - Content Format: ", function () {
          it("should be complient with OpenAPI in version 3.0'", function () {
            expect(parsedOpenAPI).to.have.property("openapi");
            expect(parsedOpenAPI).to.not.have.property("swagger");
          });
        });

        describe(" - Servers: ", function () {
          it("should have a 'servers' property with 'URL' and 'variables'", function () {
            expect(parsedOpenAPI).to.have.property("servers");
            expect(parsedOpenAPI.servers[0]).to.have.property("variables");
            expect(parsedOpenAPI.servers[0]).to.have.property("url");
          });
          it("should have an URL consistent with our model", function () {
            var patt = /(?:.*)\/api\/(?:.*)\/v[0-9]*$/;
            var result = patt.test(parsedOpenAPI.servers[0].url);
            expect(result, "http://tdn.totvs.com.br/pages/releaseview.action?pageId=271660444").to.be.true;
          });
        });

        describe(" - Version: ", function () {
          it("should contain the same version on 'info' as in filename", function () {
            var fileNameVersion = filename.substr(filename.lastIndexOf("_v") + 2, filename.length)
              .replace("_", ".")
              .replace(".json", "");
            var infoVersion = parsedOpenAPI.info.version;
            expect(fileNameVersion).to.equal(infoVersion);
          });
        });

        describe(" - Endpoints: ", function () {
          it("shouldn't contain 'post', 'put', 'get' or 'delete' in the URL", function () {
            expect(pathValidatorResult.useHttpVerbInEndpointUrl).to.not.equal(true);
          });   
          
          it("should contain success responses for all http verbs", function () {
            expect(pathValidatorResult.foundSuccessResponse).to.be.true;
          });   

          it("should specify 'Id' for all PUT or DELETE operations", function () {
            expect(pathValidatorResult.useIdInAllPutsAndDeletes).to.be.true;
          });             
        });       

        describe(" - Schemas: ", function () {
          this.timeout(30000);
          it("shouldn't contain 'schemas'", function () {
            if (parsedOpenAPI.components) {
              if (parsedOpenAPI.components.schemas) {
                expect(parsedOpenAPI.components.schemas).to.eql({});
              } else {
                expect(parsedOpenAPI.components.schemas).to.be.an('undefined');
              }
            }
          });

          it("should use external schemas for all requests and responses ", function () {
            expect(pathValidatorResult.useExternalSchema).to.be.true;
          });
         
          //TODO: Mandar essa logica para outro arquivo
          it("should reference valid JSON schema files", function (done) {
            this.timeout(30000);
            setTimeout(done, 30000);
            ///var responses = []; //TODO: Vai ser últil, provavelmente, para validar se o objeto existe no schema
            var completed_requests = 0;
            for (var i in pathValidatorResult.schemaUrlList) {
              var rawFile = new XMLHttpRequest();
              rawFile.open("GET", pathValidatorResult.schemaUrlList[i], false);
              rawFile.onreadystatechange = function () {
                if (rawFile.readyState === 4) {
                  if (rawFile.status === 200 || rawFile.status == 0) {
                    var body = rawFile.responseText;
                    //responses.push(body);
                    completed_requests++;
                    var isValidSchemaFile = jsonValidator.IsJsonString(body);
                    expect(isValidSchemaFile).to.be.true
                    if (completed_requests == pathValidatorResult.schemaUrlList.length || !isValidSchemaFile) {                      
                      done();
                    }
                  }
                  else {
                    expect(false).to.equal('Error while getting schema file in ' + pathValidatorResult.schemaUrlList[i] + '. Check if URL is valid')
                    done();
                    return;
                  }
                } else {
                  expect(false).to.equal('Error while getting schema file in ' + pathValidatorResult.schemaUrlList[i] + '. Check if URL is valid')
                  done();
                  return;
                }
              }
              rawFile.send(null); //This triggers onreadystatechange           
            }
          });
        });

        describe(" - Parameters: ", function () {         
          it("should have 'pagination', 'query' and 'order' for collection endpoints", function () {
            var collectionsWithoutRequiredParams = "Please check this endpoint: " + pathValidatorResult.collectionsWithoutRequiredParams;
            expect(pathValidatorResult.useAllRequiredParamsForCollection, collectionsWithoutRequiredParams).to.be.true;
          });

          it("should use common parameters", function () {
            var notUsingCommonParams = "Please check this endpoint|httpverb: " +  pathValidatorResult.notUsingCommonParams;
            expect(pathValidatorResult.useCommonParams, notUsingCommonParams).to.be.true;
          });
        });

        describe(" - Errors: ", function () {
          it("should use common errors schema", function () {
            expect(pathValidatorResult.useErrorSchema).to.be.true;
          });
        });

        describe(" - xtotvs: ", function () {
          it("should contain xtotvs/productinformation as an array on 'info'", function () {           
            expect(parsedOpenAPI.info["x-totvs"].productInformation).to.be.an('array');
          });

          it("should contain xtotvs/productinformation as an array on 'paths'", function () {
            var wrongXTotvs = "Please check this endpoint|httpverb: " + pathValidatorResult.wrongXTotvs;
            expect(pathValidatorResult.useProductInfoAsArray, wrongXTotvs).to.be.true;
          });
        });
      });
    };
  });
});



//TODO: Único método que varre todos os paths, e pega as informações necessárias para validar nos testes
//Ideal seria isso para resolver uma questão de performance, mas só de ter o código + organizado já vai ajudar muito
//Já teria que colocar os TRUE, FALSE, dentro desse 'método único' de varredura, e na estrutura do teste só retorno se equal true


//TODO: Later
//SCHEMAS
// var dirname = "./schema/";
// fs.readdir(dirname, function (err, filenames) {
//   if (err) {
//     console.log(err);
//   }

//   ///DE ALGUMA FORMA, ESSE FOREACH VAI TER QUE FICAR DENTRO
//   filenames.forEach(function (filename) {
//     if (filename.includes(".json") && !filename.includes("package")) {
//       let schemaPath =  path.join(dirname, filename);

//       let parsedSchema = JSON.parse(fs.readFileSync(schemaPath, {
//         encoding: 'utf-8'
//       }));

//       describe("Schema content", function () {
//         describe(" - Content Format: ", function () {
//           it("should be a valid JsonSchema'", function () {

//           });
//         });

//         describe(" - Parameters: ", function () {
//           it("shouldn't have common parameters", function () {

//           })
//         });

//         //TODO: Arrumar
//         describe(" - xtotvs: ", function () {
//           it("should be an array ", function () {
//             // for (var definitionKey in parsedSchema.definitions) {
//             //   if (parsedSchema.definitions[definitionKey].properties["x-totvs"]) {
//             //     expect(parsedSchema.definitions[definitionKey].properties["x-totvs"]).to.be.an('array');
//             //   }
//             //TODO: Isolar isso em um método recursivo para varrer até o último nível possível
//             //Check for LowerLevel
//             // if (parsedSchema.definitions[definitionKey].type == 'object') {
//             //Chamar o mesmo loop acima
//             //     }
//             //   }
//           });
//         });

//         describe(" - Enum: ", function () {
//           it("must be a string ", function () {

//           });
//         })

//         describe(" - Errors: ", function () {
//           it("shouldn't contain error model", function () {

//           });
//         });
//       });

//     };
//   });
// });