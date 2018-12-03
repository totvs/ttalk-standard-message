git config --global user.email "francardoso@outlook.com"
git config --global user.name "francardoso93"

#https://stackoverflow.com/questions/10054318/how-to-provide-username-and-password-when-run-git-clone-gitremote-git
#https://username:password@github.com/username/repository.git
#https://gist.github.com/willprice/e07efd73fb7f13f917ea
#git config remote.origin.url 775ce10e820d83ced636f75ebe5b4842abf49179@github.com/totvs/ttalk-standard-message.git

echo "Testando acessar variavel Travis dentro do SH"
echo ${TRAVIS_BRANCH}
echo "Secure Token"
echo ${GH_TOKEN}

node validator/master/renameRef.js
git add -A
git commit -m "TRAVISCI - Renaming schema references to branch  'master'"
git remote add origin-pages https://775ce10e820d83ced636f75ebe5b4842abf49179@github.com/totvs/ttalk-standard-message.git > /dev/null 2>&1                        
#git remote add origin-pages https://${GH_TOKEN}@github.com/totvs/ttalk-standard-message.git > /dev/null 2>&1                        
git push --set-upstream origin-pages ${TRAVIS_BRANCH}


