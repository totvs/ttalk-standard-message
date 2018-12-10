git config --global user.email "TOTVS.TECNOLOGIA.INTEGRACOES@totvs.com.br"
git config --global user.name "TTalkIntegracoes"

git checkout ${TRAVIS_BRANCH}
git pull                   

node validator/master/renameOpenApiRef.js
node validator/master/renameSchemaRef.js

git add -A
git commit -m "TRAVISCI - Renaming all references to branch 'master'. TravisBuildNumber: ${TRAVIS_BUILD_NUMBER}"
git remote add origin-pages https://${GH_TOKEN}@github.com/totvs/ttalk-standard-message.git > /dev/null 2>&1     
git push --set-upstream origin-pages 
