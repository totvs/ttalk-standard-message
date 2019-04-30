//Busca e lê file com a última versão minor
var currentFilename;
exports.lookForApiLatestMinorVersion = function (filenames, _currentFilename, fs, path, dirname) {
    currentFilename = _currentFilename;
    var filteredFilenamesList = filenames.filter(findAllMinorVersions);
    var latestMinorVersionFile;
    if (filteredFilenamesList.length >= 2) {
        var latestMinorVersionFileName = filteredFilenamesList[filteredFilenamesList.length - 2]; //The latest (-1) is the new one that need to be compared. //(-2) is the one that were the last before that
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
    return x.substr(0, x.lastIndexOf("_")) == currentFilename.substr(0, currentFilename.lastIndexOf("_"));
}