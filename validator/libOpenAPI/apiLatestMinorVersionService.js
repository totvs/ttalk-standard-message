//Busca e lê file com a última versão minor
var currentFilename;
exports.lookForApiLatestMinorVersion = function (filenames, _currentFilename, fs, path, dirname) {
    currentFilename = _currentFilename;
    var filteredMinorVersionsFileNamesList = filenames.filter(findAllMinorVersions);
    var latestMinorVersionFile;
    if (filteredMinorVersionsFileNamesList.length > 0) {
        var latestMinorVersionFileName = filteredMinorVersionsFileNamesList[filteredMinorVersionsFileNamesList.length - 1]; //Gets the latest (-1) before the currentFileName
        openAPIPath = path.join(dirname, latestMinorVersionFileName);
        latestMinorVersionFile = fs.readFileSync(openAPIPath, {
            encoding: 'utf-8'
        });
    }
    if (latestMinorVersionFile) {
        return JSON.parse(latestMinorVersionFile);
    }
}

function findAllMinorVersions(x) {
    return (x.substr(0, x.lastIndexOf("_")) == currentFilename.substr(0, currentFilename.lastIndexOf("_"))) &&
    (x.includes(".json")) &&
    (x < currentFilename); //I <3 Javascript
}