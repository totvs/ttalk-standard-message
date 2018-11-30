echo $TRAVIS_BRANCH
echo ${GIT_EMAIL}
echo ${GIT_NAME}

git config --global user.email "${GIT_EMAIL}"
git config --global user.name "${GIT_NAME}"
git config --global push.default simple

node validator/master/renameRef.js
git add -A
git commit -m "Renaming schema references to branch 'master'"
git push origin $1