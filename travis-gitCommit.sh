echo "travis-gitCommit"

#Francisco
git config --global user.email "francardoso@outlook.com"
git config --global user.name "francardoso93"

git remote add origin-pages https://${GH_TOKEN}@github.com/totvs/ttalk-standard-message.git > /dev/null 2>&1     
git pull
git checkout ${TRAVIS_BRANCH}
git add -A
#git status
git commit -m "TRAVISCI - Renaming schema references to branch  'master'. Travis build: ${TRAVIS_BUILD_NUMBER}"
                 
git push --set-upstream origin-pages ${TRAVIS_BRANCH}

