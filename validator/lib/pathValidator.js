var request = require('request');

var results;
var foundorder;
var foundpage;
var foundpagesize;

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
    if (httpVerbkey == "get" && !pathkey.includes("{")) {
        if (parameter.$ref) {
            if (parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/master/jsonschema/apis/types/totvsApiTypesBase.json#/parameters/Order")) {
                foundorder = true;
            }
            if (parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/master/jsonschema/apis/types/totvsApiTypesBase.json#/parameters/Page")) {
                foundpage = true;
            }
            if (parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/master/jsonschema/apis/types/totvsApiTypesBase.json#/parameters/PageSize")) {
                foundpagesize = true;
            }
        }
    };
};

var checkCommonErrorSchema = function (response, responseKey) {
    if (results.useErrorSchema != false && (responseKey >= 400 && responseKey <= 599)) {
        results.useErrorSchema = response.content["application/json"].schema.$ref == "https://raw.githubusercontent.com/totvs/ttalk-standard-message/master/jsonschema/apis/types/totvsApiTypesBase.json#/definitions/ErrorModel";
    }
};

var addSchema = function (response) {
    var ref = response.content["application/json"].schema.$ref;
    if (!ref) ref = response.content["application/json"].schema.items.$ref;
    if (ref) results.schemaUrlList.push(ref.slice(0, ref.indexOf("#")));
    else results.errorAddingSchema = true;
};

var runThroughResponses = function (responses) {
    for (var responseKey in responses) {
        var response = responses[responseKey];
        if (response.content) {
            checkCommonErrorSchema(response, responseKey);
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

exports.clear = function() {
    results = {
        schemaUrlList: []
    };
    foundorder = false;
    foundpage = false;
    foundpagesize = false;
};

exports.runThroughPaths = function name(parsedOpenAPI) {
    for (var pathkey in parsedOpenAPI.paths) {
        for (var httpVerbkey in parsedOpenAPI.paths[pathkey]) {
            var httpVerbInfo = parsedOpenAPI.paths[pathkey][httpVerbkey];
            checkXtotvs(httpVerbInfo);
            var parameters = parsedOpenAPI.paths[pathkey][httpVerbkey].parameters;
            runThroughParams(parameters, httpVerbkey, pathkey);
            var responses = httpVerbInfo.responses;
            runThroughResponses(responses);
        }
    }
    if (foundorder && foundpage && foundpagesize && results.useAllRequiredParamsForCollection != false)
        results.useAllRequiredParamsForCollection = true;
    return results;
};