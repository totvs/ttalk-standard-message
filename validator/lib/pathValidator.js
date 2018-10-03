"use strict";

var results;
var foundorder;
var foundpage;
var foundpagesize;
var hasgetcollectionendpoint;
var thisisagetcollectionendpoint;

var checkXtotvs = function (httpVerbInfo) {
    if (httpVerbInfo["x-totvs"]) {
        var productInfo = httpVerbInfo["x-totvs"].productInformation;
        if (results.useProductInfoAsArray != false)
            results.useProductInfoAsArray = Array.isArray(productInfo);
    } else {
        results.useProductInfoAsArray = true;
    }
};

var checkUseOfCommonsParams = function (parameter) {
    if (results.useCommonParams != false) {
        if (parameter.$ref) {
            results.useCommonParams = !(parameter.$ref.includes("#/components/parameters/Authorization") ||
                parameter.$ref.includes("#/components/parameters/Order") ||
                parameter.$ref.includes("#/components/parameters/Page") ||
                parameter.$ref.includes("#/components/parameters/PageSize") ||
                parameter.$ref.includes("#/components/parameters/AcceptLanguage") ||
                parameter.$ref.includes("#/components/parameters/Fields") ||
                parameter.$ref.includes("#/components/parameters/Expand"));
        }
        if (parameter.name) {
            results.useCommonParams = !(parameter.name.includes("Authorization") ||
                parameter.name.includes("Order") ||
                parameter.name.includes("Page") ||
                parameter.name.includes("PageSize") ||
                parameter.name.includes("AcceptLanguage") ||
                parameter.name.includes("Fields") ||
                parameter.name.includes("Expand"));
        }
    }
};

var checkIfCollectionHasAllNeededParams = function (parameter, httpVerbkey, pathkey) {
    if (thisisagetcollectionendpoint) {
        if (parameter.$ref) {
            if (parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message") && parameter.$ref.includes("jsonschema/apis/types/totvsApiTypesBase.json#/parameters/Order")) {
                foundorder = true;
            }
            if (parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message") && parameter.$ref.includes("jsonschema/apis/types/totvsApiTypesBase.json#/parameters/Page")) {
                foundpage = true;
            }
            if (parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message") && parameter.$ref.includes("jsonschema/apis/types/totvsApiTypesBase.json#/parameters/PageSize")) {
                foundpagesize = true;
            }
        }
    };
};

var checkCommonErrorSchema = function (response, responseKey) {
    if (results.useErrorSchema != false && (responseKey >= 400 && responseKey <= 599)) {
        var ref = response.content["application/json"].schema.$ref;
        results.useErrorSchema = ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/") && ref.includes("/jsonschema/apis/types/totvsApiTypesBase.json#/definitions/ErrorModel");
    }
};

var checkHttpVerbInUrl = function (pathkey) {
    if (results.useHttpVerbInEndpointUrl != true) {
        results.useHttpVerbInEndpointUrl = (pathkey.includes("get") ||
            pathkey.includes("put") ||
            pathkey.includes("post") ||
            pathkey.includes("delete"))
    }
    results.useHttpVerbInEndpointUrl;
}

var checkIfSchemaIsSettedToExternaFile = function (responseRequest) {
    if (responseRequest) {
        if (responseRequest.content["application/json"].schema) {
            //TODO: Extrair essa questão de encontrar quem é o REF. Já está duplicado aqui e no método abaixo
            var ref = responseRequest.content["application/json"].schema.$ref;
            if (!ref) {
                if(responseRequest.content["application/json"].schema.items) {
                    ref = responseRequest.content["application/json"].schema.items.$ref;
                }
            }
            if (results.useExternalSchema != false && ref) {
                results.useExternalSchema = !ref.includes("#/components/");
            }
        }
    }
}

//TODO: Pegar schemas de request também. Só adicionar se o schema (sem levar em consideração o que vem depois do #/definition) for diferente
var addSchema = function (responseRequest) {
    if (responseRequest) {
        if (responseRequest.content["application/json"].schema) {
            var ref = responseRequest.content["application/json"].schema.$ref;
            if (!ref) {
                if(responseRequest.content["application/json"].schema.items) {
                    ref = responseRequest.content["application/json"].schema.items.$ref;
                }
            }
            if (ref) {
                var ref = ref.slice(0, ref.indexOf("#"));
                if (!results.schemaUrlList.includes(ref)) {
                    results.schemaUrlList.push(ref);
                }
            } else results.errorAddingSchema = true;
        }
    }
};

var runThroughResponses = function (responses) {
    for (var responseKey in responses) {
        var response = responses[responseKey];
        if (response.content) {
            checkCommonErrorSchema(response, responseKey);
            checkIfSchemaIsSettedToExternaFile(response, true);
            addSchema(response);
        }
    }
};

var runThroughParams = function (parameters, httpVerbkey, pathkey) {
    for (var parameterKey in parameters) {
        var parameter = parameters[parameterKey];
        checkUseOfCommonsParams(parameter);
        checkIfCollectionHasAllNeededParams(parameter, httpVerbkey, pathkey);
    }
};

var clearCollectionParamsValidation = function () {
    foundorder = false;
    foundpage = false;
    foundpagesize = false;
}

exports.clear = function () {
    results = {
        schemaUrlList: []
    };
    clearCollectionParamsValidation();
    hasgetcollectionendpoint = undefined;
    thisisagetcollectionendpoint = undefined;
};

exports.runThroughPaths = function name(parsedOpenAPI) {
    for (var pathkey in parsedOpenAPI.paths) {
        checkHttpVerbInUrl(pathkey);
        for (var httpVerbkey in parsedOpenAPI.paths[pathkey]) {
            //TODO: EXTRACT METHOD            
            if (httpVerbkey == "get" && !pathkey.includes("{")) {
                if (hasgetcollectionendpoint) { //Will be hit if there is more then one get collection endpoint
                    clearCollectionParamsValidation();
                }
                hasgetcollectionendpoint = true;
                thisisagetcollectionendpoint = true;
            } else {
                thisisagetcollectionendpoint = false;
            }
            /////

            var httpVerbInfo = parsedOpenAPI.paths[pathkey][httpVerbkey];
            checkXtotvs(httpVerbInfo);
            var parameters = parsedOpenAPI.paths[pathkey][httpVerbkey].parameters;
            runThroughParams(parameters, httpVerbkey, pathkey);
            var request = httpVerbInfo.requestBody;
            checkIfSchemaIsSettedToExternaFile(request);
            addSchema(request);
            var responses = httpVerbInfo.responses;
            runThroughResponses(responses);
        }
    }
    if (!hasgetcollectionendpoint)
        results.useAllRequiredParamsForCollection = true;
    else if (foundorder && foundpage && foundpagesize && results.useAllRequiredParamsForCollection != false)
        results.useAllRequiredParamsForCollection = true;
    return results;
};