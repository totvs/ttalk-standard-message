var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest

var logFile = "https://api.travis-ci.org/v3/job/"+ process.env.TRAVIS_JOB_ID + "/log.txt";
function getFromUrl(logFile){
  var docReady = false;
  while (docReady!=true){
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", logFile, false);
    rawFile.onreadystatechange = function() {
      if (rawFile.readyState === 4) {  // Makes sure the document is ready to parse.
        if (rawFile.status === 200) {  // Makes sure it's found the file.
          substr = rawFile.responseText.substring(rawFile.responseText.lastIndexOf("mocha") + 27,  rawFile.responseText.lastIndexOf("npm test")-13);
          return substr;
        }
      }
    }
    rawFile.send(null);
    if ((rawFile.responseText.match(/npm test/g) || []).length>1) docReady = true; //check if there are 2 occurences of "npm test" inside txt (meaning the part that I want is ready)
    if (docReady) return substr; //if there are 2 occurences, the document is ready and data can be returned
  }
}

var substr = getFromUrl(logFile);
var pretext = "A validação foi concluída! Abaixo está evidenciado o resultado do teste:";
var aftertext = "\\n\\nPara maiores detalhes acesse: https://travis-ci.org/totvs/ttalk-standard-message/builds/"+process.env.TRAVIS_BUILD_ID+"";

// --- The following piece of code replaces all the characters that we don't want, so the JSON can be sent inside the body of the request.
substr=substr.replace(/\/g, '');
substr=substr.replace(/\n/g, '\\n');
substr=substr.replace(/\n \n/g, '\\n\\n');
substr=substr.replace(/\t/g, '\\t');
substr=substr.replace(/\r/g, '\\r');
substr=substr.replace(/\r\n\r\n/g, '\\r\\n');
substr=substr.replace(/\s/g, ' ');
substr=substr.replace(/'/g, '\'');
substr=substr.replace(/>/g, '\>');
substr=substr.replace(/\[0m/g, '');
substr=substr.replace(/\[32m/g, '');
substr=substr.replace(/\[31m/g, '');
substr=substr.replace(/\[30m/g, '');
substr=substr.replace(/\[90m/g, '');
substr=substr.replace(/\[35m/g, '');
substr=substr.replace(/\[92m/g, '');
substr=substr.replace(/\[37;40m/g, '');
substr=substr.replace(/\[31;40m/g, '');
substr=substr.replace(/\[2J\[1;3H/g, '');
substr=substr.replace(/\[0K\[32;1m/g, '');
substr=substr.replace(/\[0K\[31;1m/g, '');
substr=substr.replace(/:end:/g, ': end:');
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

var data = "{\n\t\"body\":\""+pretext+substr+aftertext+"\"\n}\n";
var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

console.log(data);

xhr.open("POST", "https://api.github.com/repos/totvs/ttalk-standard-message/issues/"+process.env.TRAVIS_PULL_REQUEST+"/comments", false);
xhr.setRequestHeader("Authorization", "Bearer "+process.env.GH_TOKEN+"");
xhr.addEventListener("readystatechange", function () {
  if (this.readyState === 4) {
    console.log(this.responseText);
  }
});
xhr.send(data);