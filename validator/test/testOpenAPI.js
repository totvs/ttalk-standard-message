"use strict";
/*
This class contains MOCHA test cases for OpenAPI files
@author Francisco F. Cardoso | T-TALK
*/

var expect = require("expect.js");
var fs = require("fs");
var path = require("path");
var pathValidator = require("../libOpenAPI/pathValidator.js");
var apiCompatibilityService = require("../libOpenAPI/apiCompatibilityService.js");
var apiLatestMinorVersionService = require("../libOpenAPI/apiLatestMinorVersionService");
var dereferenceService = require("../libOpenAPI/dereferenceService");
var expect = require("chai").expect;
var segmentDictionary = {};
var productDictionary = {};
var changed_files = process.env.CHANGED_FILES;
var enableRunAll = process.env.ENABLE_RUN_ALL;

describe("Validating OpenAPI files...", function () {
  it("test suite started", function (done) {
    //OPENAPIS //
    var dirname = "jsonschema/apis/";
    fs.readdir(dirname, function (err, filenames) {
      if (err) {
        console.log(err);
      }
      if (changed_files || enableRunAll) {
        filenames.forEach(function (filename) {
          if (filename.includes(".json")
            && !filename.includes("package")
            && (enableRunAll || changed_files.includes(dirname + filename))) {
            let openAPIPath = path.join(dirname, filename);

            describe("OpenAPI - " + filename, function () {
              var file = fs.readFileSync(openAPIPath, {
                encoding: "utf-8",
              });
              var parsedOpenAPI;
              var pathValidatorResult;
              var apiCompatibilityServiceResult;
              var derefResult;
              var derefErrorDetail;

              before(async function (done) {
                this.timeout(240000);
                file = file.trim(); //Removes unwanted bytes
                parsedOpenAPI = JSON.parse(file);
                derefResult = JSON.parse(file); //Need to have other obj reference than the previous one

                var callbackDereferenceResult = function (err, newSchema) {
                  if (err) {
                    derefResult = false;
                    derefErrorDetail = err;
                    done();
                  } else {
                    derefResult = newSchema;
                    pathValidator.clear();
                    pathValidatorResult = pathValidator.runThroughPaths(
                      filename,
                      parsedOpenAPI,
                      derefResult
                    );
                    //// Compatibilidade com versões anteriores
                    let latestMinorVersionFileResult = apiLatestMinorVersionService.lookForApiLatestMinorVersion(
                      filenames,
                      filename,
                      fs,
                      path,
                      dirname
                    );
                    if (latestMinorVersionFileResult) {
                      //Derreferencia versão anterior e manda para o serviço que avalia essas diferenças
                      var callbackDereferenceLatestMinorVersionFile = async function () {
                        apiCompatibilityServiceResult = await apiCompatibilityService.getApisDiff(
                          derefResult,
                          latestMinorVersionFileResult
                        );
                        done();
                      };
                      dereferenceService.dereference(
                        latestMinorVersionFileResult,
                        callbackDereferenceLatestMinorVersionFile
                      );
                    } else {
                      apiCompatibilityServiceResult = apiCompatibilityService.getNoVersionToCompareOkResponse();
                      done();
                    }
                    ////
                  }
                };
                dereferenceService.dereference(
                  derefResult,
                  callbackDereferenceResult
                );
              });

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
                it("shouldn't contain weird special characters", function () {
                  expect(
                    file.includes("�"),
                    "Please check file encode"
                  ).to.be.false;
                });

                it("should be compliant with OpenAPI in version 3.0'", function () {
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
                it("should have an URL starting with {{host}}", function () {
                  expect(parsedOpenAPI.servers[0].url.startsWith("{{host}}")).to.be.true;
                });
                it("should have an URL consistent with our model", function () {
                  var patt = /(?:.*)\/api\/(?:.*)\/v[0-9]*$/;
                  var result = patt.test(parsedOpenAPI.servers[0].url);
                  var errorMessage =
                    "Make sure there isn't a '/' in the end of your URL and read this document for more details about a consistent URL: http://tdn.totvs.com.br/pages/releaseview.action?pageId=271660444";
                  expect(result, errorMessage).to.be.true;
                });
                it("should have an URL consistent with our model", function () {
                  var patt = /(?:.*)\/api\/(?:.*)\/v[0-9]*$/;
                  var result = patt.test(parsedOpenAPI.servers[0].url);
                  var errorMessage =
                    "Make sure there isn't a '/' in the end of your URL and read this document for more details about a consistent URL: http://tdn.totvs.com.br/pages/releaseview.action?pageId=271660444";
                  expect(result, errorMessage).to.be.true;
                });
              });

              describe(" - Version: ", function () {
                it("should contain the same version on 'info' as in filename", function () {
                  var fileNameVersion = filename
                    .substr(filename.lastIndexOf("_v") + 2, filename.length)
                    .replace("_", ".")
                    .replace(".json", "");
                  var infoVersion = parsedOpenAPI.info.version;
                  expect(fileNameVersion).to.equal(infoVersion);
                });
                it("should be backward compatible with minor versions", function () {
                  if (apiCompatibilityServiceResult)
                    expect(
                      apiCompatibilityServiceResult.isBackwardCompatible,
                      "\r\n" + apiCompatibilityServiceResult.consoleRender
                    ).to.be.true;
                });
                it("should have anything different from the previous minor version, beside x-totvs", function () {
                  if (apiCompatibilityServiceResult)
                    expect(
                      apiCompatibilityServiceResult.hadChanges,
                      apiCompatibilityServiceResult.consoleRender
                    ).to.be.true;
                });
              });

              describe(" - Endpoints: ", function () {
                it("shouldn't contain 'post', 'put', 'get' or 'delete' in the URL", function () {
                  if (pathValidatorResult)
                    expect(
                      pathValidatorResult.useHttpVerbInEndpointUrl
                    ).to.not.equal(true);
                });

                it("should contain success responses for all http verbs", function () {
                  if (pathValidatorResult)
                    expect(pathValidatorResult.foundSuccessResponse).to.be.true;
                });

                it("should specify 'Id' for all PUT operations", function () {
                  if (pathValidatorResult)
                    expect(pathValidatorResult.useIdInAllPuts).to.be.true;
                });

                it("should have unique 'operationId'", function () {
                  if (pathValidatorResult)
                    expect(
                      pathValidatorResult.operationIdUnique,
                      pathValidatorResult.repeatedUniqueId
                    ).to.be.true;
                });
              });

              describe(" - Schemas: ", function () {
                it("shouldn't contain 'schemas' definition inside this file", function () {
                  if (parsedOpenAPI.components) {
                    if (parsedOpenAPI.components.schemas) {
                      expect(parsedOpenAPI.components.schemas).to.eql({});
                    } else {
                      expect(parsedOpenAPI.components.schemas).to.be.an(
                        "undefined"
                      );
                    }
                  }
                });

                if (pathValidatorResult) {
                  it("should use external schemas for all requests and responses ", function () {
                    expect(pathValidatorResult.useExternalSchema).to.be.true;
                  });
                }

                it("should be dereferenced. This means all external references are correct (FilePaths and Object property names)", function () {
                  if (derefErrorDetail && !(derefErrorDetail.includes("ETIMEDOUT"))) { //Não contar como erro de dereference casos de timeout que podem ter sido ocasionados pela rede no Travis
                    expect(derefResult, derefErrorDetail).to.be.ok;
                  }
                });

                it("should contain the same Id property name in URL and body", function () {
                  let errorMessage = "";
                  if (pathValidatorResult) {
                    if (pathValidatorResult.errorPathWithoutSameKeyInUrlAndBody)
                      errorMessage =
                        "Check the endpoint '" +
                        pathValidatorResult.errorPathWithoutSameKeyInUrlAndBody +
                        "'. It may be a typo or case sensitive difference";
                    expect(
                      pathValidatorResult.containsTheSameKeyInUrlAndBody,
                      errorMessage
                    ).to.be.true;
                  }
                });

                it("should contain 'hasNext' prop if there is 'items' prop and vice versa", function () {
                  let errorMessage = "";
                  if (pathValidatorResult) {
                    if (pathValidatorResult.errorPathMissingItemOrHasNext)
                      errorMessage =
                        "Check the endpoint '" +
                        pathValidatorResult.errorPathMissingItemOrHasNext +
                        "'";
                    expect(
                      pathValidatorResult.containsItemsAndHasNext,
                      errorMessage
                    ).to.be.true;
                  }
                });

                it("should be 'required=true' at schema, because it's a final path param", function () {
                  if (pathValidatorResult) {
                    var errorMessage =
                      pathValidatorResult.typeIsNotRequiredWhenPathId;
                    expect(
                      pathValidatorResult.typeIsRequiredWhenPathId,
                      errorMessage
                    ).not.to.be.false;
                  }
                });

                it("should have 'hasNext' when it's a 'getAll' endpoint", function () {
                  if (pathValidatorResult) {
                    var errorMessage = pathValidatorResult.hasNextInGetAllMsg;
                    expect(pathValidatorResult.hasNextInGetAll, errorMessage).not
                      .to.be.false;
                  }
                });

                it("shouldn't have 'hasNext' when it's a 'getOne' endpoint", function () {
                  if (pathValidatorResult) {
                    var errorMessage = pathValidatorResult.noHasNextInGetOneMsg;
                    expect(pathValidatorResult.noHasNextInGetOne, errorMessage)
                      .not.to.be.false;
                  }
                });
              });

              describe(" - Parameters: ", function () {
                it("should have 'page', 'pagesize' and 'order' for collection endpoints", function () {
                  if (pathValidatorResult) {
                    var collectionsWithoutRequiredParams =
                      "Please check this endpoint: " +
                      pathValidatorResult.collectionsWithoutRequiredParams;
                    expect(
                      pathValidatorResult.useAllRequiredParamsForCollection,
                      collectionsWithoutRequiredParams
                    ).to.be.true;
                  }
                });

                it("should use common parameters", function () {
                  if (pathValidatorResult) {
                    var notUsingCommonParams =
                      "Please check this endpoint|httpverb: " +
                      pathValidatorResult.notUsingCommonParams;
                    expect(
                      pathValidatorResult.useCommonParams,
                      notUsingCommonParams
                    ).to.be.true;
                  }
                });

                it("same ID defined inside path should also be present inside the 'parameters' property", function () {
                  if (pathValidatorResult) {
                    var errorMessage =
                      pathValidatorResult.endpointsWithoutPathParamDefinedInParameters;
                    expect(
                      pathValidatorResult.hasPathParamDefinedInParameters,
                      errorMessage
                    ).not.to.be.false; //Some APIs only have collection endpoints. They will return undefined, and that is Ok
                  }
                });

                it("should be 'required=true' when final path param", function () {
                  if (pathValidatorResult) {
                    var errorMessage = pathValidatorResult.pathIdIsNotRequired;
                    expect(pathValidatorResult.pathIdIsRequired, errorMessage).not
                      .to.be.false;
                  }
                });
              });

              describe(" - Errors: ", function () {
                it("should use common errors schema", function () {
                  if (pathValidatorResult) {
                    expect(pathValidatorResult.useErrorSchema).to.be.true;
                  }
                });
              });

              describe(" - xtotvs: ", function () {
                describe(" - paths: ", function () {
                  it("should contain xtotvs inside 'paths'", function () {
                    if (pathValidatorResult) {
                      var wrongXTotvs =
                        "Please check this endpoint|httpverb: " +
                        pathValidatorResult.wrongXTotvs;
                      expect(pathValidatorResult.hasPathXTotvs, wrongXTotvs).to.be
                        .true;
                    }
                  });
                  it("should contain xtotvs/productinformation as an array inside 'paths'", function () {
                    if (pathValidatorResult) {
                      var wrongXTotvsProductInfo =
                        "Please check this endpoint|httpverb: " +
                        pathValidatorResult.wrongXTotvs;
                      expect(
                        pathValidatorResult.useProductInfoAsArray,
                        wrongXTotvsProductInfo
                      ).to.be.true;
                    }
                  });
                  it("should contain 'product' as a key in productInformation, inside 'paths'", function () {
                    if (pathValidatorResult) {
                      var wrongXTotvs =
                        pathValidatorResult.wrongProductAsKeyInProductInfo;
                      expect(
                        pathValidatorResult.hasProductAsKeyInProductInfo,
                        wrongXTotvs
                      ).not.to.be.false;
                    }
                  });
                  it("should contain 'available' inside productInformation, inside 'paths'", function () {
                    if (pathValidatorResult) {
                      var wrongXTotvs =
                        pathValidatorResult.availableNotCorrectlySpelled;
                      expect(
                        pathValidatorResult.hasAvailableCorrectlySpelledInsidePaths,
                        wrongXTotvs
                      ).not.to.be.false;
                    }
                  });
                  it("all products declared inside 'info' should also exist inside paths' x-totvs", function () {
                    if (pathValidatorResult)
                      expect(
                        pathValidatorResult.pathProdHasInfoElement,
                        pathValidatorResult.pathProdHasInfoElementMsg
                      ).not.to.be.false;
                  });
                  it("all 'available' properties must be boolean", function () {
                    if (pathValidatorResult)
                      expect(
                        pathValidatorResult.hasAvailableAsBoolean,
                        pathValidatorResult.hasAvailableAsBooleanMsg
                      ).not.to.be.false;
                  });
                });
                describe(" - info: ", function () {
                  it("should have 'product' in the correct pattern", function () {
                    expect(
                      parsedOpenAPI.info["x-totvs"].productInformation,
                      "'ProductInformation' has to be an array of objects."
                    ).to.be.an("array");
                    for (var i in parsedOpenAPI.info["x-totvs"]
                      .productInformation) {
                      expect(
                        parsedOpenAPI.info["x-totvs"].productInformation[i],
                        "'Product' must be a property of 'ProductInformation'."
                      ).to.have.property("product");
                    }
                  });
                  it("segment name should be standardized", function () {
                    const keyName = parsedOpenAPI.info[
                      "x-totvs"
                    ].messageDocumentation.segment
                      .toLowerCase()
                      .replace(" ", "")
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "");
                    //Verificar se ja existe a propriedade com este nome
                    if (!(keyName in segmentDictionary)) {
                      //Se nao existe, adiciona
                      segmentDictionary[keyName] =
                        parsedOpenAPI.info[
                          "x-totvs"
                        ].messageDocumentation.segment;
                    } else {
                      //Verificar se o valor do dictionary é igual ao valor do OpenApi
                      var wrongSegment =
                        "You passed '" +
                        parsedOpenAPI.info["x-totvs"].messageDocumentation
                          .segment +
                        "' as x-totvs segment, but we already got '" +
                        segmentDictionary[keyName] +
                        "'.";
                      expect(
                        parsedOpenAPI.info["x-totvs"].messageDocumentation
                          .segment,
                        wrongSegment
                      ).to.be.equal(segmentDictionary[keyName]);
                    }
                  });
                  it("product name should be standardized", function () {
                    for (var i in parsedOpenAPI.info["x-totvs"]
                      .productInformation) {
                      const prodKeyName = parsedOpenAPI.info[
                        "x-totvs"
                      ].productInformation[i].product
                        .toLowerCase()
                        .replace(" ", "")
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "");
                      //Verificar se ja existe produto com este nome
                      if (!(prodKeyName in productDictionary)) {
                        //Se nao existe, adiciona
                        productDictionary[prodKeyName] =
                          parsedOpenAPI.info["x-totvs"].productInformation[
                            i
                          ].product;
                      } else {
                        //Verificar se o valor do dictionary é igual ao valor do OpenApi
                        var wrongProduct =
                          "You passed '" +
                          parsedOpenAPI.info["x-totvs"].productInformation[i]
                            .product +
                          "' as x-totvs product, but we already got '" +
                          productDictionary[prodKeyName] +
                          "'.";
                        expect(
                          parsedOpenAPI.info["x-totvs"].productInformation[i]
                            .product,
                          wrongProduct
                        ).to.be.equal(productDictionary[prodKeyName]);
                      }
                    }
                  });
                  it("all products declared inside 'paths' should also exist inside 'info's' x-totvs", function () {
                    if (pathValidatorResult)
                      expect(
                        pathValidatorResult.infoProdHasPathElement,
                        pathValidatorResult.infoProdHasPathElementMsg
                      ).not.to.be.false;
                  });
                });
              });

              describe(" - Content Type: ", function () {
                it("should be one of the supported/allowed ContentTypes", function () {
                  if (pathValidatorResult) {
                    expect(
                      pathValidatorResult.allowedContentType,
                      pathValidatorResult.allowedContentTypeMsg
                    ).to.be.true;
                  }
                });
                it("should have matching body content", function () {
                  if (pathValidatorResult) {
                    expect(
                      pathValidatorResult.contentBodyMatchesContentType,
                      pathValidatorResult.contentBodyMatchesContentTypeMsg
                    ).to.be.true;
                  }
                });
              });
            });
          }
        });
        done();
      } else {
        console.log('Could not regonize any file changes or new files');
        done();
      }
    });
  });
});
