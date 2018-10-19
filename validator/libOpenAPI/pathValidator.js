"use strict";

/*
This class has the objective of doing all validations in the OpenAPI file that demand iterating 'paths'(endpoints) and accessessing nested objects
The point is gaining performance through a single file 'run through'       
All methods will first verify if that validation has failed before. If it did, it won't check again for the next objects.
@author Francisco F. Cardoso | T-TALK
*/

var results;
var foundorder;
var foundpage;
var foundpagesize;
var thisIsCollectionEndpoint;
var hasgetcollectionendpoint;
var parsedOpenAPI;
var idWasCorrecltyDefinedInGeneralParams;
var operationIdList;

/**
 * This method checks if path 'x-totvs' has 'productInformation' as array
 * @param {*} httpVerbInfo Object
 * @param {*} httpVerbkey String ('get','put,'post','delete'...)  String ('get','put,'post','delete'...) 
 * @param {*} pathkey String (/endpoint)String (/endpoint)
 */
var checkXtotvs = function (httpVerbInfo, httpVerbkey, pathkey) {
    if (httpVerbInfo["x-totvs"]) {
        var productInfo = httpVerbInfo["x-totvs"].productInformation;
        if (results.useProductInfoAsArray != false) {
            if (Array.isArray(productInfo)) {
                results.useProductInfoAsArray = true
            } else {
                results.useProductInfoAsArray = false;
                results.wrongXTotvs = pathkey + "|" + httpVerbkey;
            }
        }
    } else {
        results.useProductInfoAsArray = true;
    }
};

/**
 * This method checks if parameters already defined in 'totvsApiTypesBase' aren't being defined again.
 * The API must reference common params from there 
 * @param {*} parameter Object 
 * @param {*} httpVerbkey String ('get','put,'post','delete'...)  
 * @param {*} pathkey String (/endpoint)
 */
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

/**
 * This method checks if GET collection has all required params 
 * @param {*} parameter Object 
 * @param {*} httpVerbkey String ('get','put,'post','delete'...)  
 * @param {*} pathkey String (/endpoint)
 */
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

/**
 * This method checks if errorSchema already defined in 'totvsApiTypesBase' isn't being defined again.
 * The API must reference common errorSchema from there 
 * @param {*} response  Object
 * @param {*} responseKey String
 */
var checkCommonErrorSchema = function (response, responseKey) {
    if (results.useErrorSchema != false && (responseKey >= 400 && responseKey <= 599)) {
        var ref = response.content["application/json"].schema.$ref;
        results.useErrorSchema = ref.includes("https://raw.githubusercontent.com/totvs/ttalk-standard-message/") && ref.includes("/jsonschema/apis/types/totvsApiTypesBase.json#/definitions/ErrorModel");
    }
};

/**
 * This method checks if reserved words weren't used in the 'URL'. HTTP verbs cannot be a part of the endpoint
 * @param {*} pathkey String (/endpoint)
 */
var checkHttpVerbInUrl = function (pathkey) {
    if (results.useHttpVerbInEndpointUrl != true) {
        results.useHttpVerbInEndpointUrl = (pathkey.includes("get") ||
            pathkey.includes("put") ||
            pathkey.includes("post") ||
            pathkey.includes("delete"))
    }
    results.useHttpVerbInEndpointUrl;
}

/**
 * This method checks if all parameters which reference the OpenAPI itself exist
 * @param {*} parameter Object 
 */
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

/**
 * This method checks if schema is setted to external file
 * OpenAPI MUST reference schema from external file
 * @param {*} responseRequest Object (Of a request or a response - The internal structure is the same)
 */
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

/**
 * This method adds compelete schema information, that will be used in another class for getting it's content and doing further validations
 * @param {*} responseRequest Object (Of a request or a response - The internal structure is the same)
 * @param {*} schematype String - Possible values 'request', 'response' 
 * @param {*} pathkey String (/endpoint)
 * @param {*} iscollection Boolean - Is this a collection endpoint? 
 * @param {*} httpVerbkey String ('get','put,'post','delete'...)  
 */
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

/**
 * This method checks if all verbs that demand Id in the URL have it
 * @param {*} thisIsCollectionEndpoint Boolean
 * @param {*} httpVerbsList Array - Contains all httpVerbs from that path
 */
var checkIfPutHaveId = function (thisIsCollectionEndpoint, httpVerbsList) { //Collection shouldn't have PUT or DELETE
    if (thisIsCollectionEndpoint) {
        results.useIdInAllPuts = !((httpVerbsList.hasOwnProperty("put")));
    }
}

/**
 * This method checks that there is a successfull response for that endpoint
 * @param {*} responses Object
 */
var checkIfThereIsSuccessResponse = function (responses) {
    if (results.foundSuccessResponse != false) {
        results.foundSuccessResponse = responses.hasOwnProperty(200) || responses.hasOwnProperty(201) || responses.hasOwnProperty(202) || responses.hasOwnProperty(204)
    }
};

/**
 * This method checks if operationId didn't repeat
 * @param {*} operationId 
 */
var checkIfOperationIdIsUnique = function (operationId) {
    if (results.operationIdUnique != false) {
        if (operationIdList.includes(operationId)) {
            results.operationIdUnique = false;
            results.repeatedUniqueId = "The operation id '" + operationId + "' was found more then once. Should be unique"
        } else {
            operationIdList.push(operationId);
            results.operationIdUnique = true;
        }
    }
}

/**
 * This method iterates through responses array
 * @param {*} responses Array
 * @param {*} pathkey String (/endpoint)
 * @param {*} thisIsCollectionEndpoint Boolean
 * @param {*} httpVerbkey String ('get','put,'post','delete'...)  
 */
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

/**
 * This method iterates through params Array  
 * @param {*} parameters Array 
 * @param {*} parameter Object
 * @param {*} httpVerbkey String ('get','put,'post','delete'...)  
 * @param {*} pathkey String (/endpoint)
 * @param {*} alreadyfoundpathid Object - Path parameter that was referenced in the 'parameters' property 
 */
var runThroughParamsInternal = function (parameters, parameterType, httpVerbkey, pathkey, alreadyfoundpathid) {
    for (var parameterKey in parameters) {
        var parameter = parameters[parameterKey];
        if (parameterType == "httpVerbLevel") {
            checkUseOfCommonsParams(parameter, httpVerbkey, pathkey);
            checkIfCollectionHasAllNeededParams(parameter, httpVerbkey, pathkey);
        }
        alreadyfoundpathid = verifyIfThisIsThePathParameter(parameter, pathkey, alreadyfoundpathid);
        addParamDefinedInComponentList(parameters[parameterKey])
    }
    checkIfParametersContainPathId(alreadyfoundpathid, pathkey, parameterType);
}

/**
 * This method defines that this is a 'pathLevel' parameters property and calls runThroughParamsInternal
 * @param {*} parameters Array 
 * @param {*} pathkey String (/endpoint)
 * @param {*} alreadyfoundpathid Object - Path parameter that was referenced in the 'parameters' property Bool
 */
var runThroughGeneralParams = function (parameters, pathkey, alreadyfoundpathid) {
    runThroughParamsInternal(parameters, "pathLevel", null, pathkey, alreadyfoundpathid);
}

/**
 * This method defines that this is a 'pathLevel' parameters property and calls runThroughParamsInternal
 * @param {*} parameters Array 
 * @param {*} httpVerbkey String ('get','put,'post','delete'...)  
 * @param {*} pathkey String (/endpoint)
 * @param {*} alreadyfoundpathid Object - Path parameter that was referenced in the 'parameters' property Bool
 */
var runThroughHttpVerbParams = function (parameters, httpVerbkey, pathkey, alreadyfoundpathid) {
    runThroughParamsInternal(parameters, "httpVerbLevel", httpVerbkey, pathkey, alreadyfoundpathid);
}

/**
 * This method clears boolean variable values that were used for validating the use of required params for collections
 */
var clearCollectionParamsValidation = function () {
    foundorder = false;
    foundpage = false;
    foundpagesize = false;
}

/**
 * This method verifies if this path is dealing with a collection
 * @param {*} pathkey String (/endpoint)
 */
var verifyIfThisIsCollectionEndpoint = function (pathkey) {
    if (pathkey.substring(pathkey.lastIndexOf("/"), pathkey.length).includes("{")) {
        thisIsCollectionEndpoint = false;
    } else {
        thisIsCollectionEndpoint = true;
    }
}

/**
 * This method verifies if this path/httpverb is a collection/get
 * @param {*} httpVerbkey String ('get','put,'post','delete'...)  
 */
var verifyIfThisIsGETCollectionRequest = function (httpVerbkey) {
    if (thisIsCollectionEndpoint && httpVerbkey == 'get') {
        if (hasgetcollectionendpoint) { //Will be hit if there is more then one get collection endpoint
            clearCollectionParamsValidation();
        }
        hasgetcollectionendpoint = true;
    }
}

/**
 * This method verifies if this is path parameters (URL Id)
 * Tries to look for the path param object inside the 'parameters', or, if it only has a reference, looks into "#/components/parameters/"
 * @param {*} parameter Object 
 * @param {*} pathkey String (/endpoint)
 * @param {*} alreadyfoundpathid Object - Path parameter that was referenced in the 'parameters' property 
 */
var verifyIfThisIsThePathParameter = function (parameter, pathkey, alreadyfoundpathid) {
    if (!thisIsCollectionEndpoint) {
        var urlId = pathkey.substring(pathkey.lastIndexOf("/{") + 2, pathkey.lastIndexOf("}"));
        if (results.hasPathParamDefinedInParameters != false) {
            if (parameter.$ref && !parameter.name && !parameter.in) { //Maybe is just a reference to parameter                
                if (parameter.$ref.includes("#/components/parameters/")) {
                    var paramName = parameter.$ref.substring(24);
                    parameter = parsedOpenAPI.components.parameters[paramName];
                }
            }
            if (!alreadyfoundpathid) {
                alreadyfoundpathid = parameter.name == urlId && parameter.in == "path";
            }
        }
    }
    return alreadyfoundpathid;
}

/**
 * This method checks if, when pathId was placed in URL, parameter was correctly defined
 * @param {*} alreadyfoundpathid Object - Path parameter that was referenced in the 'parameters' property 
 * @param {*} pathkey String (/endpoint)
 * @param {*} parameter ObjectType 
 */
var checkIfParametersContainPathId = function (alreadyfoundpathid, pathkey, parameterType) {
    if (!thisIsCollectionEndpoint && !idWasCorrecltyDefinedInGeneralParams) { //If Id was already setted correctly in general, no need to validate this for httpVerb
        if (alreadyfoundpathid == false && parameterType == "pathLevel") //If it isn't in general (pathlevel), I need to keep looking for it in the httpVerbs
            return;
        else if (alreadyfoundpathid == true && parameterType == "pathLevel") {
            idWasCorrecltyDefinedInGeneralParams = true;
        }
        results.hasPathParamDefinedInParameters = alreadyfoundpathid;

        if (!alreadyfoundpathid && !results.endpointsWihtoutPathParamDefinedInParameters) {
            results.endpointsWihtoutPathParamDefinedInParameters = "Check this endpoint: '" + pathkey + "'.Please observe if path param is defined in general 'params' property or in all httpVerbs 'parameters' property. Make sure 'name' matches urlId and 'in' is 'path' (case sensitive)";
        }
    }
}

/**
 * This method clears all objects before validating the next file
 */
exports.clear = function () {
    results = {
        schemaObjList: [],
        parametersDefinedInComponentList: [],
        collectionsWithoutRequiredParams: "",
        wrongXTotvs: "",
        notUsingCommonParams: "",
        useIdInAllPuts: true
    };
    clearCollectionParamsValidation();
    hasgetcollectionendpoint = undefined;
    thisIsCollectionEndpoint = undefined;
    idWasCorrecltyDefinedInGeneralParams = undefined;
    operationIdList = [];
};

/**
 * This method will iterate through 'paths'(endpoints) and it's http verbs
 * @param {*} _parsedOpenAPI 
 */
exports.runThroughPaths = function (_parsedOpenAPI) {
    parsedOpenAPI = _parsedOpenAPI;
    for (var pathkey in parsedOpenAPI.paths) {
        checkHttpVerbInUrl(pathkey);
        var httpVerbsList = parsedOpenAPI.paths[pathkey]
        verifyIfThisIsCollectionEndpoint(pathkey);
        checkIfPutHaveId(thisIsCollectionEndpoint, httpVerbsList);
        var alreadyfoundpathid = false;
        for (var httpVerbkey in httpVerbsList) {
            if (httpVerbkey == "parameters") {
                runThroughGeneralParams(httpVerbsList[httpVerbkey], pathkey, alreadyfoundpathid);
            } else {
                verifyIfThisIsGETCollectionRequest(httpVerbkey);
                var httpVerbInfo = parsedOpenAPI.paths[pathkey][httpVerbkey];
                checkXtotvs(httpVerbInfo, httpVerbkey, pathkey);
                checkIfOperationIdIsUnique(httpVerbInfo.operationId);
                var parameters = parsedOpenAPI.paths[pathkey][httpVerbkey].parameters;
                runThroughHttpVerbParams(parameters, httpVerbkey, pathkey, alreadyfoundpathid);
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