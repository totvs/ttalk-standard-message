exports.renameRefInternals = function (refObj, refprop) {
    console.log("renameRefInternals - commons.js")
    if (refObj[refprop]) {
        if (refObj[refprop].includes("http") && refObj[refprop].includes("totvs/ttalk-standard-message")) {
            refObj[refprop] = refObj[refprop].replace(
                refObj[refprop].substring(refObj[refprop].lastIndexOf("/totvs/ttalk-standard-message/") + 30, refObj[refprop].lastIndexOf("/jsonschema")), "master"
            );
        }
    }
}