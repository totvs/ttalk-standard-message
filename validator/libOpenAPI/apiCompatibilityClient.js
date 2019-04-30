var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

exports.getApisDiff = function (api, api2) {
	return doHttpRequest();
}

exports.getApisDiffMock = function (api1, api2) {
	//Implement API client request
	var result = {
		"deleted": [],
		"added": [],
		"consoleRender": "==========================================================================\r\n==                            API CHANGE LOG                            ==\r\n==========================================================================\r\n                                Vendedores                                \r\n--------------------------------------------------------------------------\r\n--                            What's Changed                            --\r\n--------------------------------------------------------------------------\r\n- GET    /sellers\r\n  Return Type:\r\n    - Changed 200 OK\r\n      Media types:\r\n        - Changed application/json\r\n          BackwardCompatible: Broken compatibility\n  isBackwardCompatible: false\n  - changed: \n    property: items\n    isBackwardCompatible: false\n    type: array\n    isChangeRequired: false\n    properties: \n      isBackwardCompatible: false\n      - changed: \n        property: CompanyId\n        isBackwardCompatible: true\n        description: Empresa nova\n        isChangeRequired: false\n      - changed: \n        property: BranchId\n        isBackwardCompatible: false\n      - changed: \n        property: Address\n        isBackwardCompatible: false\n        isChangeRequired: false\n        properties: \n          isBackwardCompatible: false\n          - changed: \n            property: Address\n            isBackwardCompatible: true\n            description: Rua, Avenida, Rodovia, etc. Ex.: Rua Nações Unidas novas\n            isChangeRequired: false\n          - changed: \n            property: City\n            isBackwardCompatible: false\n            isChangeRequired: false\n            properties: \n              isBackwardCompatible: false\n              - changed: \n                property: cityCode\n                isBackwardCompatible: true\n                description: Código da cidadenova\n                isChangeRequired: false\n              - changed: \n                property: cityDescription\n                isBackwardCompatible: false\r\n- POST   /sellers\r\n  Request:\r\n        - Changed application/json\r\n          BackwardCompatible: Broken compatibility\n  isBackwardCompatible: false\n  - changed: \n    property: CompanyId\n    isBackwardCompatible: true\n    description: Empresa nova\n    isChangeRequired: false\n  - changed: \n    property: Code\n    isBackwardCompatible: false\n  - changed: \n    property: Name\n    isBackwardCompatible: false\n    isChangeRequired: false\n  - changed: \n    property: Address\n    isBackwardCompatible: true\n    isChangeRequired: false\n    properties: \n      isBackwardCompatible: true\n      - changed: \n        property: City\n        isBackwardCompatible: true\n        isChangeRequired: false\n        properties: \n          isBackwardCompatible: true\n          - changed: \n            property: cityDescription\n            isBackwardCompatible: true\n            description: Nome da cidade novo nome\n            isChangeRequired: false\n  - changed: \n    property: SalesChargeInformation\n    isBackwardCompatible: false\n    isChangeRequired: false\n    properties: \n      isBackwardCompatible: false\n      - changed: \n        property: SalesChargeInterface\n        isBackwardCompatible: true\n        description: Interface a ser utilizada no fechamento da comissão (Contas a Pagar, Folha ou Sem Interface) / S - Contas a Pagar / F - Folha de Pagamento / N - Sem Interfacesadfasd\n        isChangeRequired: false\n        enumeration: [S, F, N]\n      - changed: \n        property: IndirectSeller\n        isBackwardCompatible: true\n        isChangeRequired: false\n      - changed: \n        property: IndirectSellerInternalId\n        isBackwardCompatible: false\n        isChangeRequired: false\r\n--------------------------------------------------------------------------\r\n--                                Result                                --\r\n--------------------------------------------------------------------------\r\n                 API changes broke backward compatibility                 \r\n--------------------------------------------------------------------------\r\n",
		"isBackwardCompatible": false,
		"changed": [{
			"pathURL": "/sellers",
			"isBackwardCompatible": false,
			"httpMethod": "GET",
			"returnType": {
				"deleted": [],
				"added": [],
				"isBackwardCompatible": false,
				"changed": [{
					"mediaType": {
						"isBackwardCompatible": false,
						"changed": {
							"schema": {
								"deleted": [],
								"added": [],
								"isBackwardCompatible": false,
								"changed": [{
									"property": "items",
									"isBackwardCompatible": false,
									"type": "array",
									"enumeration": [],
									"isChangeRequired": false,
									"properties": {
										"deleted": [],
										"added": [],
										"isBackwardCompatible": false,
										"changed": [{
											"property": "CompanyId",
											"description": "Empresa nova",
											"isBackwardCompatible": true,
											"enumeration": [],
											"isChangeRequired": false
										}, {
											"property": "BranchId",
											"isBackwardCompatible": false
										}, {
											"property": "Address",
											"isBackwardCompatible": false,
											"enumeration": [],
											"isChangeRequired": false,
											"properties": {
												"deleted": [],
												"added": [],
												"isBackwardCompatible": false,
												"changed": [{
													"property": "Address",
													"description": "Rua, Avenida, Rodovia, etc. Ex.: Rua Nações Unidas novas",
													"isBackwardCompatible": true,
													"enumeration": [],
													"isChangeRequired": false
												}, {
													"property": "City",
													"isBackwardCompatible": false,
													"enumeration": [],
													"isChangeRequired": false,
													"properties": {
														"deleted": [],
														"added": [],
														"isBackwardCompatible": false,
														"changed": [{
															"property": "cityCode",
															"description": "Código da cidadenova",
															"isBackwardCompatible": true,
															"enumeration": [],
															"isChangeRequired": false
														}, {
															"property": "cityDescription",
															"isBackwardCompatible": false
														}]
													}
												}]
											}
										}]
									}
								}]
							},
							"IsBackwardCompatible": false,
							"contentType": "application/json"
						}
					},
					"contentType": "200"
				}]
			}
		}, {
			"request": {
				"isBackwardCompatible": false,
				"changed": {
					"schema": {
						"deleted": [],
						"added": [],
						"isBackwardCompatible": false,
						"changed": [{
							"property": "CompanyId",
							"description": "Empresa nova",
							"isBackwardCompatible": true,
							"enumeration": [],
							"isChangeRequired": false
						}, {
							"property": "Code",
							"isBackwardCompatible": false
						}, {
							"property": "Name",
							"isBackwardCompatible": false,
							"enumeration": [],
							"isChangeRequired": false
						}, {
							"property": "Address",
							"isBackwardCompatible": true,
							"enumeration": [],
							"isChangeRequired": false,
							"properties": {
								"deleted": [],
								"added": [],
								"isBackwardCompatible": true,
								"changed": [{
									"property": "City",
									"isBackwardCompatible": true,
									"enumeration": [],
									"isChangeRequired": false,
									"properties": {
										"deleted": [],
										"added": [],
										"isBackwardCompatible": true,
										"changed": [{
											"property": "cityDescription",
											"description": "Nome da cidade novo nome",
											"isBackwardCompatible": true,
											"enumeration": [],
											"isChangeRequired": false
										}]
									}
								}]
							}
						}, {
							"property": "SalesChargeInformation",
							"isBackwardCompatible": false,
							"enumeration": [],
							"isChangeRequired": false,
							"properties": {
								"deleted": [],
								"added": [],
								"isBackwardCompatible": false,
								"changed": [{
									"property": "SalesChargeInterface",
									"description": "Interface a ser utilizada no fechamento da comissão (Contas a Pagar, Folha ou Sem Interface) / S - Contas a Pagar / F - Folha de Pagamento / N - Sem Interfacesadfasd",
									"isBackwardCompatible": true,
									"enumeration": [
										"S",
										"F",
										"N"
									],
									"isChangeRequired": false
								}, {
									"property": "IndirectSeller",
									"isBackwardCompatible": true,
									"enumeration": [],
									"isChangeRequired": false
								}, {
									"property": "IndirectSellerInternalId",
									"isBackwardCompatible": false,
									"enumeration": [],
									"isChangeRequired": false
								}]
							}
						}]
					},
					"IsBackwardCompatible": false,
					"contentType": "application/json"
				}
			},
			"pathURL": "/sellers",
			"isBackwardCompatible": false,
			"httpMethod": "POST"
		}]
	}
	return result;
}

var doHttpRequest = function() {
	var xhr = new XMLHttpRequest();
	var _strReturn;
	xhr.open("POST", "http://localhost:8040/comparador/v1/apidiff", false);
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			if (xhr.status === 200 || xhr.status == 0) {
				_strReturn = xhr.responseText;
			}
		}
	}
	xhr.send(null); //This triggers onreadystatechange   
	if(_strReturn == undefined){ //If something went wrong with the API response
		_strReturn = '{"isBackwardCompatible": false, "consoleRender":"Validator error: Comparator API seems not to be responding or presenting an http error"}';
	}  
	return JSON.parse(_strReturn);
}