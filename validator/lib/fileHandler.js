exports.getExternalFile = function(url) {
    rawFile.open("GET", url, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var body = rawFile.responseText;                
            }
        }
    }
    rawFile.send(null); //This triggers onreadystatechange         
}