var fs = require('fs');
var path = require('path');
var dirnames = ["./jsonschema/schemas/", "./jsonschema/schemas/types/", "./jsonschema/apis/types/", "./jsonschema/transactions/"];
var commons = require("./commons.js");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
//forma o conteúdo do comment

//var logFile = "https://api.travis-ci.org/v3/job/"+ process.env.TRAVIS_JOB_ID + "/log.txt";
var logFile = "https://api.travis-ci.org/v3/job/459848043/log.txt";

function getFromUrl(logFile){
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
  return substr;
}

var substr = getFromUrl(logFile); //conteúdo armazenado nesta variável
substr=substr.replace(/\/g, '');
substr=substr.replace(/\n/g, '');
substr=substr.replace(/\t/g, '');
substr=substr.replace(/\//g, '\/');
substr=substr.replace(/\</g, '\<');
substr=substr.replace(/\>/g, '\>');


console.log(substr);
//posta o comment
var data = "{\n\t\"body\":\""+substr+"\"\n}\n";

var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.open("POST", "https://api.github.com/repos/totvs/ttalk-standard-message/issues/486/comments", false);
//xhr.open("POST", "https://api.github.com/repos/totvs/ttalk-standard-message/issues/"+process.env.TRAVIS_PULL_REQUEST+"/comments");
xhr.setRequestHeader("Authorization", "Bearer 1659148d17bfd880b67771236f72c64cae0dcf53");
xhr.addEventListener("readystatechange", function () {
  if (this.readyState === 4) {
    console.log(this.responseText);
  }
});
xhr.send(data);