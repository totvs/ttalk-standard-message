var expect = require('expect.js');
var fs = require('fs');
var path = require('path');
var schemaDefinitionsValidator = require('../libSchema/schemaDefinitionsValidator.js');

var expect = require('chai').expect;

//SCHEMAS
var dirname = "./jsonschema/schemas/";
fs.readdir(dirname, function (err, filenames) {
  if (err) {
    console.log(err);
  }

  console.log('SCHEMA files');
  console.log(filenames);
  filenames.forEach(function (filename) {
    if (filename.includes(".json") && !filename.includes("package")) {
      let schemaPath = path.join(dirname, filename);
      var parsedSchema;
      var schemaDefinitionsValidatorResult
      describe("SCHEMA - " + filename, function () {
        var file = fs.readFileSync(schemaPath, {
          encoding: 'utf-8'
        });

        before(function () {
          parsedSchema = JSON.parse(file);
          schemaDefinitionsValidator.clear();
          schemaDefinitionsValidatorResult = schemaDefinitionsValidator.validateSchema(parsedSchema);
        })

        describe(" - Filename: ", function () {
          it("should start with uppercase letter", function () {
            expect(filename[0]).to.equal(filename[0].toUpperCase());
          });

          it("should contain version separtor (_)", function () {
            let containsVersion = filename.includes("_");
            expect(containsVersion).to.be.true;
          });

          it("shouldn't contain v (_v)", function() {
            let containsWrongVersionPattern = filename.includes("_v");
            expect(containsWrongVersionPattern).to.be.false;
          });
        });      

        describe(" - Schemas: ", function () {
          it("should reference valid objects", function() {
            var errorMessage = "";
            if (schemaDefinitionsValidatorResult.erroredObjectName)
              errorMessage = "Could not find the object '" + schemaDefinitionsValidatorResult.erroredObjectName + "' inside 'definitions' property of this file '" 
            expect(schemaDefinitionsValidatorResult.validObject, errorMessage).not.to.be.false;
          });
        });

        
        //TODO: Arrumar / Schema validator
        // describe(" - xtotvs: ", function () {
        //   it("should be an array ", function () {
        //     // for (var definitionKey in parsedSchema.definitions) {
        //     //   if (parsedSchema.definitions[definitionKey].properties["x-totvs"]) {
        //     //     expect(parsedSchema.definitions[definitionKey].properties["x-totvs"]).to.be.an('array');
        //     //   }
        //     //TODO: Isolar isso em um método recursivo para varrer até o último nível possível
        //     //Check for LowerLevel
        //     // if (parsedSchema.definitions[definitionKey].type == 'object') {
        //     //Chamar o mesmo loop acima
        //     //     }
        //     //   }
        //   });

        //   it("should have the property 'available' correctly spelled", function () {

        //   });
        // });

        // describe(" - Enum: ", function () {
        //   it("should be a string ", function () {

        //   });
        // })
      });
    };
  });
});