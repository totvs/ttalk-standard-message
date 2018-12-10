exports.renameRefInternals = function (refObj, refprop) {
    if (refObj[refprop]) {
        if (refObj[refprop].includes("http") && refObj[refprop].includes("totvs/ttalk-standard-message")) {
            refObj[refprop] = refObj[refprop].replace(
                refObj[refprop].substring(0, refObj[refprop].lastIndexOf("/jsonschema")), "https://raw.githubusercontent.com/totvs/ttalk-standard-message/master"
            );
        }
    }
}