exports.renameRefInternals = function (refObj, refprop) {
    if (refObj[refprop]) {
        refObj[refprop] = refObj[refprop].replace(
            refObj[refprop].substring(refObj[refprop].lastIndexOf("/totvs/ttalk-standard-message/") + 30, refObj[refprop].lastIndexOf("/jsonschema")), "master"
        );
    }
}