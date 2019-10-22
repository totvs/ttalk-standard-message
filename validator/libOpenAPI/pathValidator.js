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
var derefOpenAPI;

var idWasCorrecltyDefinedInGeneralParams;
var operationIdList;

var infoProducts = [];
var pathsProducts = [];

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
                populatePathsProductArray(productInfo);
            } else {
                results.useProductInfoAsArray = false;
                results.wrongXTotvs = pathkey + "|" + httpVerbkey;
            }
        }
        for (var i in productInfo) {
            if (results.hasProductAsKeyInProductInfo != false) {
                if (productInfo[i].hasOwnProperty("product")) {
                    results.hasProductAsKeyInProductInfo = true;
                } else {
                    results.hasProductAsKeyInProductInfo = false;
                    results.wrongProductAsKeyInProductInfo = "At path '" + pathkey + "', method '" + httpVerbkey + "'.";
                }
            }
            if (results.hasAvailableCorrectlySpelledInsidePaths != false) {
                if (productInfo[i].hasOwnProperty("available")) {
                    results.hasAvailableCorrectlySpelledInsidePaths = true;
                    if(results.hasAvailableAsBoolean != false){
                        if (typeof productInfo[i].available == "boolean") {
                            results.hasAvailableAsBoolean = true;
                        } else{
                            results.hasAvailableAsBoolean = false;
                            results.hasAvailableAsBooleanMsg = "At path '" + pathkey + "', method '" + httpVerbkey + "', the property 'available' must be a boolean type.";
                        }
                    }
                } else {
                    results.hasAvailableCorrectlySpelledInsidePaths = false;
                    results.availableNotCorrectlySpelled = "At path '" + pathkey + "', method '" + httpVerbkey + "'.";
                }
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
            results.useCommonParams = !(parameter.name == "Authorization" ||
                parameter.name == "Order" ||
                parameter.name == "Page" ||
                parameter.name == "PageSize" ||
                parameter.name == "AcceptLanguage" ||
                parameter.name == "Fields" ||
                parameter.name == "Expand");
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
    var listOfWords = pathkey.split('/');
    if (results.useHttpVerbInEndpointUrl != true) {
        for (var i = 0; i < listOfWords.length; i++) {
            var word = listOfWords[i].toLowerCase();
            results.useHttpVerbInEndpointUrl = (word.startsWith("get") ||
                pathkey.startsWith("put") ||
                pathkey.startsWith("post") ||
                pathkey.startsWith("delete"));
        }
    }
    results.useHttpVerbInEndpointUrl;
};

/**
 * This method checks if schema is set to external file
 * OpenAPI MUST reference schema from external file
 * @param {*} responseRequest Object (Of a request or a response - The internal structure is the same)
 */
var checkIfSchemaIsSetToExternalFile = function (responseRequest) {
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
};


/**
 * This method checks if 'hasNext' and 'items' exist together
 * @param {*} properties Object
 * @param {*} pathkey String
 */
var checkIfHasNextAndItems = function (dereferencedRequestResponse, pathkey) {
    if (results.containsItemsAndHasNext != false) {
        let properties = dereferencedRequestResponse.content['application/json'].schema.properties;
        if (properties) {
            if (properties.hasOwnProperty("items") || properties.hasOwnProperty("hasNext")) {
                results.containsItemsAndHasNext = properties.hasOwnProperty("items") && properties.hasOwnProperty("hasNext");
                if (results.containsItemsAndHasNext == false) {
                    results.errorPathMissingItemOrHasNext = pathkey;
                }
            }
        }
    }
}

var checkIfHasNextInGetAll = function (filename, httpVerbkey, dereferencedResponse, pathkey) {
    if (results.hasNextInGetAll != false) {
        var properties = hasAllPropertiesUntilHasNext(dereferencedResponse);
        if (properties) {
            if (properties.hasOwnProperty("hasNext")) {
                results.hasNextInGetAll = true;
            } else {
                if (hasNextGetAllWhitelist.hasOwnProperty(filename)) {
                    if (hasNextGetAllWhitelist[filename].hasOwnProperty(pathkey) && hasNextGetAllWhitelist[filename][pathkey]==httpVerbkey) {
                        results.hasNextInGetAll = true;
                    } else {
                        results.hasNextInGetAll = false;
                        results.hasNextInGetAllMsg = "At endpoint '" + pathkey + "', must have hasNext and pagination mechanism.";
                    }
                } else {
                    results.hasNextInGetAll = false;
                    results.hasNextInGetAllMsg = "At endpoint '" + pathkey + "', must have hasNext and pagination mechanism.";
                }
            }
        }
    }
}

var checkIfNoHasNextInGetOne = function (filename, httpVerbkey, dereferencedResponse, pathkey) {
    if (results.noHasNextInGetOne != false) {
        var properties = hasAllPropertiesUntilHasNext(dereferencedResponse);
        if (properties) {
            if (properties.hasOwnProperty("hasNext")) {
                if (hasNextGetOneWhitelist.hasOwnProperty(filename)) {
                    if (hasNextGetOneWhitelist[filename].hasOwnProperty(pathkey) && hasNextGetOneWhitelist[filename][pathkey]==httpVerbkey) {
                        results.noHasNextInGetOne = true;
                    } else {
                        results.noHasNextInGetOne = false;
                        results.noHasNextInGetOneMsg = "At endpoint '" + pathkey + "', no hasNext can be declared, because pagination is not permited.";
                    }
                } else {
                    results.noHasNextInGetOne = false;
                    results.noHasNextInGetOneMsg = "At endpoint '" + pathkey + "', no hasNext can be declared, because pagination is not permited.";
                }
            } else {
                results.noHasNextInGetOne = true;
            }
        }
    }
}

var populateInfoProductArray = function (infoProductInfo) {
    infoProducts = [];
    for (var i in infoProductInfo) infoProducts.push(infoProductInfo[i].product);
}

var populatePathsProductArray = function (productInfo){
    for (var j in productInfo){ 
        var controlVar = 0;
        for (var i in pathsProducts){
            if (productInfo[j].product == pathsProducts[i]) controlVar = 1;
        }
        if (controlVar==0) pathsProducts.push(productInfo[j].product);
    }
}

var compareInfoPathsProducts = function (){
    for (var i in pathsProducts){
        if(results.infoProdHasPathElement!=false){
            if (infoProducts.includes(pathsProducts[i])){
                results.infoProdHasPathElement = true;
            }
            else{
                results.infoProdHasPathElement = false;
                results.infoProdHasPathElementMsg = "X-Totvs inside 'paths' has '"+ pathsProducts[i]+"' as product, but it's not declared inside 'info'.";
            }
        }
    }
    for (var i in infoProducts){
        if(results.pathProdHasInfoElement!=false){
            if (pathsProducts.includes(infoProducts[i])){
                results.pathProdHasInfoElement = true;
            }
            else{
                results.pathProdHasInfoElement = false;
                results.pathProdHasInfoElementMsg = "X-Totvs inside 'info' has '"+ infoProducts[i]+"' as product, but it's not declared inside 'paths'.";
            }
        }
    }
    infoProducts = [];
    pathsProducts = [];
}

var hasAllPropertiesUntilHasNext = function (dereferencedResponse) {
    if (dereferencedResponse.hasOwnProperty("content") &&
        dereferencedResponse.content.hasOwnProperty("application/json") &&
        dereferencedResponse.content['application/json'].hasOwnProperty("schema") &&
        dereferencedResponse.content['application/json'].schema.hasOwnProperty("properties")) {
            var properties = dereferencedResponse.content['application/json'].schema.properties;
            return properties;
    } else {
        if (dereferencedResponse.hasOwnProperty("content") &&
        dereferencedResponse.content.hasOwnProperty("application/json") &&
        dereferencedResponse.content['application/json'].hasOwnProperty("schema") &&
        dereferencedResponse.content['application/json'].schema.hasOwnProperty("allOf")){
            for(var i in dereferencedResponse.content['application/json'].schema.allOf){
                if (dereferencedResponse.content['application/json'].schema.allOf[i].hasOwnProperty("properties") &&
                    dereferencedResponse.content['application/json'].schema.allOf[i].properties.hasOwnProperty("hasNext")){
                        var properties = dereferencedResponse.content['application/json'].schema.allOf[i].properties;
                        var control = 1;
                        return properties;
                }else{
                    var control = 0;
                }
            }
            if ((control==0) && (dereferencedResponse.content['application/json'].schema.allOf[0].hasOwnProperty("properties"))){
                var properties = dereferencedResponse.content['application/json'].schema.allOf[0].properties;
                return properties;
            }
        }
        return false;
    }
}

var checkIfTypeIsRequiredWhenPathId = function (dereferencedRequestResponse, pathkey) {
    if (results.typeIsRequiredWhenPathId != false) {
        let properties = dereferencedRequestResponse.content['application/json'].schema.properties;
        if (properties) {
            if (pathkey.substring(pathkey.lastIndexOf("/"), pathkey.length).includes("{")) {
                pathkey = pathkey.substring(pathkey.lastIndexOf("/"), pathkey.length);
                var pathId = pathkey.substring(2, pathkey.length - 1);
                if (properties.hasOwnProperty(pathId)) {
                    for (var i in properties[pathId]['x-totvs']) {
                        if (results.typeIsRequiredWhenPathId != false) {
                            if (properties[pathId]['x-totvs'][i].required) {
                                results.typeIsRequiredWhenPathId = true;
                            } else {
                                results.typeIsRequiredWhenPathId = false;
                                results.typeIsNotRequiredWhenPathId = "Type '" + pathId + "' must be required, because it is a final path param (If we got '/something/{anyId}, that {anyId} type must be required at schema).";
                            }
                        }
                    }

                }
            }
        }
    }
}

var containsTheSameKeyInUrlAndBody = function (dereferencedRequestResponse, pathidkey, pathkey) {
    let properties = dereferencedRequestResponse.content['application/json'].schema.properties;
    if (properties) {
        if (thisIsCollectionEndpoint && results.containsTheSameKeyInUrlAndBody != false) results.containsTheSameKeyInUrlAndBody = true; //No need to validate that. Collections don't have 'id' in URL
        else {
            if (results.containsTheSameKeyInUrlAndBody != false) {
                results.containsTheSameKeyInUrlAndBody = properties.hasOwnProperty(pathidkey);
                if (results.containsTheSameKeyInUrlAndBody == false) {
                    results.errorPathWithoutSameKeyInUrlAndBody = pathkey;
                }
            }
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
var runThroughResponses = function (filename, responses, dereferencedResponses, pathkey, thisIsCollectionEndpoint, httpVerbkey, pathidkey) {
    checkIfThereIsSuccessResponse(responses);
    for (var responseKey in responses) {
        var response = responses[responseKey];
        if (dereferencedResponses) var dereferencedResponse = dereferencedResponses[responseKey];
        if (response.content) {
            checkCommonErrorSchema(response, responseKey);
            checkIfSchemaIsSetToExternalFile(response, true);
            if (responseKey < 400) { //Only success response 
                if (dereferencedResponse) {
                    if (dereferencedResponse.content['application/json'].schema) {
                        checkIfHasNextAndItems(dereferencedResponse, pathkey);
                        checkIfTypeIsRequiredWhenPathId(dereferencedResponse, pathkey);
                        containsTheSameKeyInUrlAndBody(dereferencedResponse, pathidkey, pathkey);
                        if (httpVerbkey) { //(pathkey.replace(/[^/]/g, "").length==1)
                            if ((thisIsCollectionEndpoint) && (httpVerbkey == 'get')) checkIfHasNextInGetAll(filename, httpVerbkey, dereferencedResponse, pathkey);
                            if ((!thisIsCollectionEndpoint) && (httpVerbkey == 'get')) checkIfNoHasNextInGetOne(filename, httpVerbkey, dereferencedResponse, pathkey);
                        }
                    }
                }
            }
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
var runThroughParamsInternal = function (parameters, parameterType, httpVerbkey, pathkey, alreadyfoundpathid, derefParams) {
    for (var parameterKey in parameters) {
        var parameter = parameters[parameterKey];
        if (pathkey.substring(pathkey.lastIndexOf("/"), pathkey.length).includes("{")) {
            checkIfPathIdIsRequired(getLastPathId(pathkey.substring(pathkey.lastIndexOf("/"), pathkey.length)), httpVerbkey, derefParams); //Gets the last Id from the parameter
        }
        if (parameterType == "httpVerbLevel") {
            checkUseOfCommonsParams(parameter, httpVerbkey, pathkey);
            checkIfCollectionHasAllNeededParams(parameter, httpVerbkey, pathkey);
        }
        alreadyfoundpathid = verifyIfThisIsThePathParameter(parameter, pathkey, alreadyfoundpathid);
    }
    checkIfParametersContainPathId(alreadyfoundpathid, pathkey, parameterType);

}

/**
 * This method defines that this is a 'pathLevel' parameters property and calls runThroughParamsInternal
 * @param {*} parameters Array 
 * @param {*} pathkey String (/endpoint)
 * @param {*} alreadyfoundpathid Object - Path parameter that was referenced in the 'parameters' property Bool
 */
var runThroughGeneralParams = function (parameters, pathkey, alreadyfoundpathid, derefParams) {
    runThroughParamsInternal(parameters, "pathLevel", null, pathkey, alreadyfoundpathid, derefParams);
}

/**
 * This method defines that this is a 'pathLevel' parameters property and calls runThroughParamsInternal
 * @param {*} parameters Array 
 * @param {*} httpVerbkey String ('get','put,'post','delete'...)  
 * @param {*} pathkey String (/endpoint)
 * @param {*} alreadyfoundpathid Object - Path parameter that was referenced in the 'parameters' property Bool
 */
var runThroughHttpVerbParams = function (parameters, httpVerbkey, pathkey, alreadyfoundpathid, derefParams) {
    runThroughParamsInternal(parameters, "httpVerbLevel", httpVerbkey, pathkey, alreadyfoundpathid, derefParams);
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

var getLastPathId = function (pathId) {
    pathId = pathId.substring(2, pathId.length - 1);
    return pathId;
}

var checkIfPathIdIsRequired = function (pathId, httpVerbkey, derefParams) {
    if (results.pathIdIsRequired != false) {
        if (httpVerbkey == null) httpVerbkey = 'no method';
        for (var derefParamIndex in derefParams) {
            if (derefParams[derefParamIndex].hasOwnProperty('name')) {
                if (pathId == derefParams[derefParamIndex].name) {
                    if (derefParams[derefParamIndex].hasOwnProperty('required')) {
                        if (derefParams[derefParamIndex].required == false) { //is required false
                            results.pathIdIsRequired = false;
                            results.pathIdIsNotRequired = "Path parameter '" + pathId + "', at method '" + httpVerbkey + "', must be required."
                        }
                    } else { //Does not have required property
                        results.pathIdIsRequired = false;
                        results.pathIdIsNotRequired = "Path parameter '" + pathId + "', at method '" + httpVerbkey + "', does not have a 'required' property (must be 'required=true')."
                    }
                    //if (derefParams[derefParamIndex].hasOwnProperty('x-totvs')){
                    //    console.log("Tem x-totvs");
                    //}
                }
            }
        }
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
                if (parameter) {
                    alreadyfoundpathid = parameter.name == urlId && parameter.in == "path";
                }
            }
        }
        return alreadyfoundpathid;
    }
};

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

        if (!alreadyfoundpathid && !results.endpointsWithoutPathParamDefinedInParameters) {
            results.endpointsWithoutPathParamDefinedInParameters = "Check this endpoint: '" + pathkey + "'.Please observe if path param is defined in general 'params' property or in all httpVerbs 'parameters' property. Make sure 'name' matches urlId and 'in' is 'path' (case sensitive). (Was the parameter object - schema definition - correctly defined?)";
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
        useIdInAllPuts: true,
        containsItemsAndHasNext: true,
        containsTheSameKeyInUrlAndBody: true
    };
    clearCollectionParamsValidation();
    hasgetcollectionendpoint = undefined;
    thisIsCollectionEndpoint = undefined;
    idWasCorrecltyDefinedInGeneralParams = undefined;
    operationIdList = [];
};

/**
 * This method will iterate through 'paths'(endpoints) and it's http verbs
 * @param {*} _parsedOpenAPI OpenAPI object with all external references addresses
 * @param {*} _derefOpenAPI OpenAPI object with all external objects already dereferenced
 */
exports.runThroughPaths = function (filename, _parsedOpenAPI, _derefOpenAPI) {
    parsedOpenAPI = _parsedOpenAPI;
    derefOpenAPI = _derefOpenAPI;
    populateInfoProductArray(parsedOpenAPI.info['x-totvs'].productInformation);
    for (var pathkey in parsedOpenAPI.paths) {
        checkHttpVerbInUrl(pathkey);
        let pathidkey = pathkey.substr(pathkey.lastIndexOf("/{") + 2, pathkey.length).replace("}", "").replace("{", "");
        var httpVerbsList = parsedOpenAPI.paths[pathkey]
        verifyIfThisIsCollectionEndpoint(pathkey);
        checkIfPutHaveId(thisIsCollectionEndpoint, httpVerbsList);
        var alreadyfoundpathid = false;
        for (var httpVerbkey in httpVerbsList) {
            if (httpVerbkey == "parameters") {
                if (derefOpenAPI.paths[pathkey].hasOwnProperty('parameters')) {
                    runThroughGeneralParams(httpVerbsList[httpVerbkey], pathkey, alreadyfoundpathid, derefOpenAPI.paths[pathkey].parameters);
                } else {
                    runThroughGeneralParams(httpVerbsList[httpVerbkey], pathkey, alreadyfoundpathid, derefOpenAPI.paths[pathkey]);
                }
            } else {
                verifyIfThisIsGETCollectionRequest(httpVerbkey);
                var httpVerbInfo = parsedOpenAPI.paths[pathkey][httpVerbkey];
                if (derefOpenAPI) var dereferenceHttpVerbInfo = derefOpenAPI.paths[pathkey][httpVerbkey];
                checkXtotvs(httpVerbInfo, httpVerbkey, pathkey);
                checkIfOperationIdIsUnique(httpVerbInfo.operationId);
                var derefParams = derefOpenAPI.paths[pathkey][httpVerbkey].parameters;
                var parameters = parsedOpenAPI.paths[pathkey][httpVerbkey].parameters;
                runThroughHttpVerbParams(parameters, httpVerbkey, pathkey, alreadyfoundpathid, derefParams);
                var request = httpVerbInfo.requestBody;
                if (dereferenceHttpVerbInfo) var dereferencedRequest = dereferenceHttpVerbInfo.requestBody;
                checkIfSchemaIsSetToExternalFile(request);
                // addSchema(request, "request", pathkey, thisIsCollectionEndpoint, httpVerbkey);
                var responses = httpVerbInfo.responses;
                if (dereferenceHttpVerbInfo) var dereferencedResponses = dereferenceHttpVerbInfo.responses;
                runThroughResponses(filename, responses, dereferencedResponses, pathkey, thisIsCollectionEndpoint, httpVerbkey, pathidkey);
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
    compareInfoPathsProducts();
    return results;
};

var hasNextGetAllWhitelist = {
    "ArmazenagemCargaNaoDesunitizada_v1_000.json": {
        "/cargaNaoDesunitizada/xls": "get"                                          //API definida em legislação pela Receita Federal (XLS)
    },
    "DesunitizacaoCarga_v2_000.json": {
        "/desunitizacaoCarga/xls": "get"                                            //API definida em legislação pela Receita Federal (XLS)
    },
    "EntradaSaidaPessoas_v2_000.json": {
        "/entradaSaidaPessoas/Xls": "get"                                           //API definida em legislação pela Receita Federal (XLS)
    },
    "EntradaSaidaVeiculos_v2_000.json": {
        "/entradaSaidaVeiculos/Xls": "get"                                          //API definida em legislação pela Receita Federal (XLS)
    },
    "MudancaSituacaoAduaneiraLoteCarga_v2_000.json": {
        "/MudancaSituacaoAduaneiraLote/xls": "get"                                  //API definida em legislação pela Receita Federal (XLS)
    },
    "RegistroMudancaRegimeAduaneiro_v2_000.json": {
        "/registroMudancaRegimeAduaneiro/xls": "get"                                //API definida em legislação pela Receita Federal (XLS)
    },
    "SituacaoLoteCargaVerificacao_v2_000.json": {
        "/situacaoLoteCargaVerificacao/xls": "get"                                  //API definida em legislação pela Receita Federal (XLS)
    },
    "TransferenciaLocalArmazenagem_v2_000.json": {
        "/transferenciaLocalArmazenagem/xls": "get"                                 //API definida em legislação pela Receita Federal (XLS)
    },
    "RelacaoNotasFiscais_v2_000.json": {
        "/relacaoNotaFiscal": "get"                                                 //API definida em legislação pela Receita Federal
    },
    "InspectionScript_v1_000.json": {
        "/inspectionScripts/{inspectionScriptId}/draftVersion": "get",              //representa ação sobre o {InspectionScriptId}, o que é permitido pelo guia de APIs.
        "/inspectionScripts/{inspectionScriptId}/version": "get"                    //representa ação sobre o {InspectionScriptId}, o que é permitido pelo guia de APIs. Retorno pode ser uma lista. Sugerir à equipe de negócio que na próxima versão da API eles considerem a paginação neste endpoint.
    },
    "AccountingCalendar_v1_000.json": {
        "/AccountingCalendar": "get"                                                //err, entrar em contato
    },
    "Classes_v1_000.json": {
        "/classes": "get"                                                           //err, entrar em contato
    },
    "ClassParticipants_v1_000.json": {
        "/classParticipants": "get"                                                 //err, entrar em contato
    },
    "ClassValue_v1_000.json": {
        "/classvalue": "get"                                                        //err, entrar em contato
    },
    "CottonBales_v1_000.json": {
        "/CottonBales": "get"                                                       //err, entrar em contato
    },
    "DocumentTraceAbilityRetailSales_v1_000.json": {
        "/DocumentTraceAbilityRetailSales": "get"                                   //err, entrar em contato
    },
    "JobOpportunityProfiles_v1_000.json": {
        "/persons": "get"                                                           //err, entrar em contato
    },
    "Marks_v1_000.json": {
        "/marks": "get"                                                             //err, entrar em contato
    },
    "MaterialFamilies_v1_000.json": {
        "/materialFamilies": "get"                                                  //err, entrar em contato
    },
    "Models_v1_000.json": {
        "/models": "get"                                                            //err, entrar em contato
    },
    "PerformanceEvaluations_v1_000.json": {
        "/performanceEvaluations": "get"                                            //err, entrar em contato
    },
    "Persons_v1_000.json": {
        "/persons": "get"                                                           //err, entrar em contato
    },
    "TotalInputDocument_v1_000.json": {
        "/totalInputDocument": "get",                                               //err, entrar em contato
        "/TotalInputDocument/canceled": "get"                                       //err, entrar em contato
    },
    "TotalOutputDocument_v1_000.json": {
       "/TotalOutputDocument": "get",                                               //err, entrar em contato
       "/TotalOutputDocument/canceled": "get",                                      //err, entrar em contato
    },
    "UnitOfMeasure_v2_000.json": {
        "/UnitOfMeasures": "get"                                                    //err, entrar em contato
    },
    "WorkEnvironments_v1_000.json": {
        "/workenvironments": "get"                                                  //err, entrar em contato
    },
};
var hasNextGetOneWhitelist = {
    "UnitMeasurementConversion_v2_000.json": {
        "/unitMeasurementConversions/{internalId}": "get"                           //err, entrar em contato
    },
    "AuditTopic_v1_000.json": {
        "/auditTopic/{internalId}": "get"                                           //err, entrar em contato
    },
    "Contact_v1_000.json": {
        "/contacts/{contactId}": "get"                                              //err, entrar em contato
    },
    "CustomerVendor_v1_000.json": {
        "/customerVendor/{entityType}": "get"                                       //err, entrar em contato
    },
    "Files_v1_000.json": {
        "/files/{yearMonthRefer}": "get",                                           //err, entrar em contato
        "/files/ccos/{fileName}": "get"                                             //err, entrar em contato
    },
    "MarketSegment_v2_000.json": {
        "/marketSegment/{marketSegmentID}": "get"                                   //err, entrar em contato
    },
    "Menus_v1_001.json": {
        "/menus/{parentId}": "get"                                                  //err, entrar em contato
    },
    "PriceListHeaderItem_v2_005.json": {
        "/priceList/{code}": "get",                                                 //err, entrar em contato
        "/priceList/{code}/itensTablePrice/{itemList}": "get"                       //err, entrar em contato
    },
    "Prospects_v1_000.json": {
        "/prospects/{Code}": "get"                                                  //err, entrar em contato
    },
    "SalesCharge_v1_000.json": {
        "/salesCharge/{InternalId}": "get" ,
        "/salesCharge/{InternalId}/{AccountReceivableDocumentInternalId}": "get"    //err, entrar em contato
    },
    "Sellers_v2_000.json": {
        "/seller/{code}": "get"                                                     //err, entrar em contato
    },
    "Suspects_v1_000.json": {
        "/suspects/{Code}": "get"                                                   //err, entrar em contato
    },
};