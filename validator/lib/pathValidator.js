"use strict";

var results;
var foundorder;
var foundpage;
var foundpagesize;
var thisIsCollectionEndpoint;
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
                (parameter.$ref.includes("Authorization") && !parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/") && !parameter.$ref.includes("/jsonschema/apis/types/totvsApiTypesBase.json")) ||
                (parameter.$ref.includes("Order") && !parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/") && !parameter.$ref.includes("/jsonschema/apis/types/totvsApiTypesBase.json")) ||
                (parameter.$ref.includes("Page") && !parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/") && !parameter.$ref.includes("/jsonschema/apis/types/totvsApiTypesBase.json")) ||
                (parameter.$ref.includes("PageSize") && !parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/") && !parameter.$ref.includes("/jsonschema/apis/types/totvsApiTypesBase.json")) ||
                (parameter.$ref.includes("AcceptLanguage") && !parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/") && !parameter.$ref.includes("/jsonschema/apis/types/totvsApiTypesBase.json")) ||
                (parameter.$ref.includes("Fields") && !parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/") && !parameter.$ref.includes("/jsonschema/apis/types/totvsApiTypesBase.json")) ||
                (parameter.$ref.includes("Expand") && !parameter.$ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/") && !parameter.$ref.includes("/jsonschema/apis/types/totvsApiTypesBase.json"))
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
    if (thisIsCollectionEndpoint && httpVerbkey == 'get') {
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

var addParamDefinedInComponentList = function (parameter) {
    if (parameter) {
        if (parameter.$ref) {
            if (parameter.$ref.includes("#/components/parameters/")) {
                var paramName = parameter.$ref.substring(24);
                if (!results.parametersDefinedInComponentList.includes(paramName))
                    results.parametersDefinedInComponentList.push(paramName);
            }
        }
    }
}

var checkIfSchemaIsSettedToExternaFile = function (responseRequest) {
    if (responseRequest) {
        if (responseRequest.content) {
            if (responseRequest.content["application/json"].schema) {
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
}

//Schema types: 'request', 'response', 
var addSchema = function (responseRequest, schematype, pathkey, iscollection, httpVerbkey) {
    if (responseRequest) {
        if (responseRequest.content) {
            if (responseRequest.content["application/json"].schema) {
                var ref = responseRequest.content["application/json"].schema.$ref;
                if (!ref) {
                    if (responseRequest.content["application/json"].schema.items) {
                        ref = responseRequest.content["application/json"].schema.items.$ref;
                    }
                }
                if (ref) {
                    var schemaObj = {
                        ref: ref.slice(0, ref.indexOf("#")),
                        objectName: ref.slice(ref.indexOf("definitions/") + 12, ref.length),
                        schematype: schematype,
                        pathkey: pathkey,
                        iscollection: iscollection,
                        httpVerbkey: httpVerbkey
                    }
                    results.schemaObjList.push(schemaObj);
                } else results.errorAddingSchema = true;
            }
        }
    }
};

var checkIfPutAndDeleteHaveId = function (thisIsCollectionEndpoint, httpVerbsList) { //Collection shouldn't have PUT or DELETE
    if (thisIsCollectionEndpoint) {
        results.useIdInAllPutsAndDeletes = !((httpVerbsList.hasOwnProperty("put") || httpVerbsList.hasOwnProperty("delete")));
    }
}

var checkIfThereIsSuccessResponse = function (responses) {
    if (results.foundSuccessResponse != false) {
        results.foundSuccessResponse = responses.hasOwnProperty(200) || responses.hasOwnProperty(201) || responses.hasOwnProperty(202) || responses.hasOwnProperty(204)
    }
};

var runThroughResponses = function (responses, pathkey, thisIsCollectionEndpoint, httpVerbkey) {
    checkIfThereIsSuccessResponse(responses);
    for (var responseKey in responses) {
        var response = responses[responseKey];
        if (response.content) {
            checkCommonErrorSchema(response, responseKey);
            checkIfSchemaIsSettedToExternaFile(response, true);
            if (responseKey < 400) //Only success response
                addSchema(response, "response", pathkey, thisIsCollectionEndpoint, httpVerbkey);
        }
    }
};

var runThroughParamsInternal = function (parameters, parameterType, httpVerbkey, pathkey) {
    for (var parameterKey in parameters) {
        var parameter = parameters[parameterKey];
        if (parameterType == "httpVerb") {
            checkUseOfCommonsParams(parameter, httpVerbkey, pathkey);
            checkIfCollectionHasAllNeededParams(parameter, httpVerbkey, pathkey);
        }
        addParamDefinedInComponentList(parameters[parameterKey])
    }
}

var runThroughGeneralParams = function (parameters) {
    runThroughParamsInternal(parameters, "general");
}

var runThroughHttpVerbParams = function (parameters, httpVerbkey, pathkey) {
    runThroughParamsInternal(parameters, "httpVerb", httpVerbkey, pathkey);
}

var clearCollectionParamsValidation = function () {
    foundorder = false;
    foundpage = false;
    foundpagesize = false;
}

var verifyIfThisIsCollectionEndpoint = function (pathkey) {
    if (pathkey.substring(pathkey.lastIndexOf("/"), pathkey.length).includes("{")) {
        thisIsCollectionEndpoint = false;
    } else {
        thisIsCollectionEndpoint = true;
    }
}

var verifyIfThisIsGETCollectionRequest = function (httpVerbkey) {
    if (thisIsCollectionEndpoint && httpVerbkey == 'get') {
        if (hasgetcollectionendpoint) { //Will be hit if there is more then one get collection endpoint
            clearCollectionParamsValidation();
        }
        hasgetcollectionendpoint = true;
    }
}

exports.clear = function () {
    results = {
        schemaObjList: [],
        parametersDefinedInComponentList: [],
        collectionsWithoutRequiredParams: "",
        wrongXTotvs: "",
        notUsingCommonParams: "",
        useIdInAllPutsAndDeletes: true
    };
    clearCollectionParamsValidation();
    hasgetcollectionendpoint = undefined;
    thisIsCollectionEndpoint = undefined;
};

exports.runThroughPaths = function name(parsedOpenAPI) {
    for (var pathkey in parsedOpenAPI.paths) {
        checkHttpVerbInUrl(pathkey);
        var httpVerbsList = parsedOpenAPI.paths[pathkey]
        verifyIfThisIsCollectionEndpoint(pathkey);
        checkIfPutAndDeleteHaveId(thisIsCollectionEndpoint, httpVerbsList);
        for (var httpVerbkey in httpVerbsList) {
            if (httpVerbkey == "parameters") {
                runThroughGeneralParams(httpVerbsList[httpVerbkey]);
            } else {
                verifyIfThisIsGETCollectionRequest(httpVerbkey);
                var httpVerbInfo = parsedOpenAPI.paths[pathkey][httpVerbkey];
                checkXtotvs(httpVerbInfo, httpVerbkey, pathkey);
                var parameters = parsedOpenAPI.paths[pathkey][httpVerbkey].parameters;
                runThroughHttpVerbParams(parameters, httpVerbkey, pathkey);
                var request = httpVerbInfo.requestBody;
                checkIfSchemaIsSettedToExternaFile(request);
                addSchema(request, "request", pathkey, thisIsCollectionEndpoint, httpVerbkey);
                var responses = httpVerbInfo.responses;
                runThroughResponses(responses, pathkey, thisIsCollectionEndpoint, httpVerbkey);
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