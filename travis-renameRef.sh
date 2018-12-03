#Elvis
# git config --global user.email "elvis.brito@totvs.com.br"
# git config --global user.name "elvisbrito"

#Francisco
git config --global user.email "francardoso@outlook.com"
git config --global user.name "francardoso93"

echo "running travis-renameRef.sh"

node validator/master/renameRef.js
git add -A
git commit -m "TRAVISCI - Renaming schema references to branch  'master'"
git remote add origin-pages https://${GH_TOKEN}@github.com/totvs/ttalk-standard-message.git > /dev/null 2>&1                        
git push --set-upstream origin-pages ${TRAVIS_BRANCH}


