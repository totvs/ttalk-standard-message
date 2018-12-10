exports.renameRefInternals = function (refObj, refprop) {
    console.log("renameRefInternals - commons.js")
    if (refObj[refprop]) {
        if (refObj[refprop].includes("http") && refObj[refprop].includes("/jsonschema")) {
            refObj[refprop] = refObj[refprop].replace(
               0, refObj[refprop].lastIndexOf("/jsonschema"), "https://raw.githubusercontent.com/totvs/ttalk-standard-message/master"
            );
        }
    }
}