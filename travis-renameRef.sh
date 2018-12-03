#Elvis
git config --global user.email "elvis.brito@totvs.com.br"
git config --global user.name "elvisbrito"

#Francisco
#git config --global user.email "francardoso@outlook.com"
#git config --global user.name "francardoso93"


echo "Testando acessar variavel Travis dentro do SH"
echo ${TRAVIS_BRANCH}
echo "Secure Token"
echo ${GH_TOKEN}
echo "89d850169e011bab02607657c590d01f0f3e519d"

node validator/master/renameRef.js
git add -A
git commit -m "TRAVISCI - Renaming schema references to branch  'master'"
#Elvis
git remote add origin-pages https://1b5ff82ae16f0d51beaa2f0b288cbffb32a3af77@github.com/totvs/ttalk-standard-message.git > /dev/null 2>&1                        
#Francisco
#git remote add origin-pages https://f88b24655d7d793de53a:226711446e6c68fd7675fd2670ebf701445216d8@github.com/totvs/ttalk-standard-message.git > /dev/null 2>&1                        
#Secure
#git remote add origin-pages https://${GH_TOKEN}@github.com/totvs/ttalk-standard-message.git > /dev/null 2>&1                        
git push --set-upstream origin-pages ${TRAVIS_BRANCH}


