"use strict";

var results;
var foundorder;
var foundpage;
var foundpagesize;
var thisIsCollectionEdpoint;
var hasgetcollectionendpoint;

var checkXtotvs = function (httpVerbInfo, httpVerbkey, pathkey) {
    if (httpVerbInfo["x-totvs"]) {
        var productInfo = httpVerbInfo["x-totvs"].productInformation;
        if (results.useProductInfoAsArray != false && Array.isArray(productInfo)) {
            results.useProductInfoAsArray = true
        } else {
            results.useProductInfoAsArray = false;
            results.wrongXTotvs = pathkey + "|" + httpVerbkey;
        }
    } else {
        results.useProductInfoAsArray = true;
    }
};

var checkUseOfCommonsParams = function (parameter, httpVerbkey, pathkey) {
    if (results.useCommonParams != false) {
        if (parameter.$ref) {
            results.useCommonParams = !(
                (parameter.$ref.includes("Authorization") && !parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/master/jsonschema/apis/types/totvsApiTypesBase.json")) ||
                (parameter.$ref.includes("Order") && !parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/master/jsonschema/apis/types/totvsApiTypesBase.json")) ||
                (parameter.$ref.includes("Page") && !parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/master/jsonschema/apis/types/totvsApiTypesBase.json")) ||
                (parameter.$ref.includes("PageSize") && !parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/master/jsonschema/apis/types/totvsApiTypesBase.json")) ||
                (parameter.$ref.includes("AcceptLanguage") && !parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/master/jsonschema/apis/types/totvsApiTypesBase.json")) ||
                (parameter.$ref.includes("Fields") && !parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/master/jsonschema/apis/types/totvsApiTypesBase.json")) ||
                (parameter.$ref.includes("Expand") && !parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/master/jsonschema/apis/types/totvsApiTypesBase.json"))
            )
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
        if (results.useCommonParams == false) {
            results.notUsingCommonParams = pathkey + "|" + httpVerbkey
        }
    }
};

var checkIfCollectionHasAllNeededParams = function (parameter, httpVerbkey, pathkey) {
    if (thisIsCollectionEdpoint && httpVerbkey == 'get') {
        if (parameter.$ref) {
            if (parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message") && parameter.$ref.includes("jsonschema/apis/types/totvsApiTypesBase.json#/parameters/Order")) {
                foundorder = true;
            }
            if (parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message") && parameter.$ref.substring(parameter.$ref.lastIndexOf("/"), parameter.$ref.length) == ("/Page")) {
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
                if (responseRequest.content["application/json"].schema.items) {
                    ref = responseRequest.content["application/json"].schema.items.$ref;
                }
            }
            if (results.useExternalSchema != false && ref) {
                results.useExternalSchema = !ref.includes("#/components/");
            }
        }
    }
}

var addSchema = function (responseRequest) {
    if (responseRequest) {
        if (responseRequest.content["application/json"].schema) {
            var ref = responseRequest.content["application/json"].schema.$ref;
            if (!ref) {
                if (responseRequest.content["application/json"].schema.items) {
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

var checkIfPutAndDeleteHaveId = function (thisIsCollectionEdpoint, httpVerbsList) { //Collection shouldn't have PUT or DELETE
    if (thisIsCollectionEdpoint) {
        results.useIdInAllPutsAndDeletes = !((httpVerbsList.hasOwnProperty("put") || httpVerbsList.hasOwnProperty("delete")));
    }
}

var checkIfThereIsSuccessResponse = function (responses) {
    if (results.foundSuccessResponse != false) {
        results.foundSuccessResponse = responses.hasOwnProperty(200) || responses.hasOwnProperty(201) || responses.hasOwnProperty(202) || responses.hasOwnProperty(204)
    }
};

var runThroughResponses = function (responses) {
    checkIfThereIsSuccessResponse(responses);
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
        checkUseOfCommonsParams(parameter, httpVerbkey, pathkey);
        checkIfCollectionHasAllNeededParams(parameter, httpVerbkey, pathkey);
    }
};

var clearCollectionParamsValidation = function () {
    foundorder = false;
    foundpage = false;
    foundpagesize = false;
}

var verifyIfThisIsCollectionEndpoint = function (pathkey) {
    if (pathkey.substring(pathkey.lastIndexOf("/"), pathkey.length).includes("{")) {
        thisIsCollectionEdpoint = false;
    } else {
        thisIsCollectionEdpoint = true;
    }
}

var verifyIfThisIsGETCollectionRequest = function (httpVerbkey) {
    if (thisIsCollectionEdpoint && httpVerbkey == 'get') {
        if (hasgetcollectionendpoint) { //Will be hit if there is more then one get collection endpoint
            clearCollectionParamsValidation();
        }
        hasgetcollectionendpoint = true;
    }
}

exports.clear = function () {
    results = {
        schemaUrlList: [],
        collectionsWithoutRequiredParams: "",
        wrongXTotvs: "",
        notUsingCommonParams: "",
    };
    clearCollectionParamsValidation();
    hasgetcollectionendpoint = undefined;
    thisIsCollectionEdpoint = undefined;
};

exports.runThroughPaths = function name(parsedOpenAPI) {
    for (var pathkey in parsedOpenAPI.paths) {
        checkHttpVerbInUrl(pathkey);
        var httpVerbsList = parsedOpenAPI.paths[pathkey]
        verifyIfThisIsCollectionEndpoint(pathkey);
        checkIfPutAndDeleteHaveId(thisIsCollectionEdpoint, httpVerbsList);
        for (var httpVerbkey in httpVerbsList) {
            if (httpVerbkey != "parameters") {
                verifyIfThisIsGETCollectionRequest(httpVerbkey);
                var httpVerbInfo = parsedOpenAPI.paths[pathkey][httpVerbkey];
                checkXtotvs(httpVerbInfo, httpVerbkey, pathkey);
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
        else {
            if (results.useAllRequiredParamsForCollection != false)
                results.collectionsWithoutRequiredParams += "'" + pathkey + "'";
            results.useAllRequiredParamsForCollection = false
        }
    }
    return results;
};