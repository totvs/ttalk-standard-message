git config --global user.email "francardoso@outlook.com"
git config --global user.name "Francisco Ferreira Cardoso"
git config --global push.default simple

echo git config -l
git config remote.origin.url francardoso93:25789t@T@github.com/francardoso93:25789t@T/ttalk-standard-message.git 

echo "eee Git Config e origin"

node validator/master/renameRef.js
git add -A
git commit -m "Renaming schema references to branch  'master'"
git push origin $1

