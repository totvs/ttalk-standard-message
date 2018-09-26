var expect = require('expect.js');
var fs = require('fs');
var path = require('path');
var request = require('request');
var pathValidator = require('../lib/pathValidator.js');


describe("Validating files...", function() {
  it("test suite started",function() {

  })
});

//OPENAPIS //
var dirname = "./jsonschema/apis/";
fs.readdir(dirname, function (err, filenames) {
  if (err) {
    console.log(err);
  }

  ///DE ALGUMA FORMA, ESSE FOREACH VAI TER QUE FICAR DENTRO
  filenames.forEach(function (filename) {
    if (filename.includes(".json") && !filename.includes("package")) {
      let openAPIPath =  path.join(dirname, filename);

      let parsedOpenAPI = JSON.parse(fs.readFileSync(openAPIPath, {
        encoding: 'utf-8'
      }));

      describe("OpenAPI - " + filename, function () {
        pathValidator.clear();
        let pathValidatorResult = pathValidator.runThroughPaths(parsedOpenAPI);
        describe(" - Filename: ", function () {
          it("should start with uppercase letter", function () {

          });

          it("should contain version", function () {

          });
        });

        describe(" - Content Format: ", function () {
          it("should be a valid JsonSchema'", function () {

          });

          it("should be complient with OpenAPI in version 3.0'", function () {
            expect(parsedOpenAPI).to.have.property("openapi");
            expect(parsedOpenAPI).to.not.have.property("swagger");
          });
        });

        describe(" - Servers: ", function () {
          it("should have a 'servers' property", function () {
            expect(parsedOpenAPI).to.have.property("servers");
            expect(parsedOpenAPI.servers[0]).to.have.property("variables");
            expect(parsedOpenAPI.servers[0]).to.have.property("url");
          });
          it("should have an URL consistent with our model", function () {
            //Todo: substrings based on '/' Validate "api" and "version"
          });
        });

        describe(" - Version: ", function () {
          it("should contain the same version on 'info' as in filename", function () {

          });
        });

        describe(" - Endpoints: ", function () {
          it("shouldn't contain 'post', 'put', 'get' or 'delete' in the URL", function () {

          });
        });

        describe(" - Schemas: ", function () {
          it("shouldn't contain schemas", function () {
            if (parsedOpenAPI.components.schemas) {
              expect(parsedOpenAPI.components.schemas).to.eql({});
            } else {
              expect(parsedOpenAPI.components.schemas).to.be.an('undefined');
            }
          });

          //TODO: Executar promisse que lê todos os arquivos e verifica se estão validos. APós executação, chama o 'done()'
        });

        describe(" - Parameters: ", function () {
          it("should have 'pagination', 'query' and 'order' for collection endpoints", function () {
            expect(pathValidatorResult.useAllRequiredParamsForCollection).to.equal(true);
          });

          it("should use common parameters", function () {
            expect(pathValidatorResult.useCommonParams).to.equal(true);
          });
        });

        describe(" - Errors: ", function () {
          it("should use common errors schema", function () {
            expect(pathValidatorResult.useErrorSchema).to.equal(true);
          });
        });

        describe(" - xtotvs: ", function () {
          it("should contain xtotvs/productinformation as an array on 'info'", function () {
            expect(parsedOpenAPI.info["x-totvs"].productInformation).to.be.an('array');
          });

          it("should contain xtotvs/productinformation as an array on 'paths'", function () {
            expect(pathValidatorResult.useProductInfoAsArray).to.equal(true);
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

