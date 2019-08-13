var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest

var pretext = "A validação foi concluída! Sua documentação foi aprovada em todos os casos de teste!";
var aftertext = "\\n\\nPara visualizar o log com detalhes da validação que foi realizada, acesse: https://travis-ci.org/totvs/ttalk-standard-message/builds/"+process.env.TRAVIS_BUILD_ID+"";
var validationDetails = "\\n\\nCaso queira entender melhor cada uma das validações e formas de correção, visite nossa documentação: http://tdn.totvs.com/pages/viewpage.action?pageId=465388996"


var data = "{\n\t\"body\":\""+pretext+aftertext+validationDetails+"\"\n}\n";
var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.open("POST", "https://api.github.com/repos/totvs/ttalk-standard-message/issues/"+process.env.TRAVIS_PULL_REQUEST+"/comments", false);
xhr.setRequestHeader("Authorization", "Bearer "+process.env.GH_TOKEN+"");
xhr.addEventListener("readystatechange", function () {
  if (this.readyState === 4) {
    console.log(this.responseText);
  }
});
xhr.send(data);