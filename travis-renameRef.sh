git config --global user.email "francardoso@outlook.com"
git config --global user.name "Francisco Ferreira Cardoso"
git config --global push.default simple

git remote set-url origin francardoso93@github.com:25789t@T/totvs/ttalk-standard-message.git 


echo "Mudado Git Config e origin"

node validator/master/renameRef.js
git add -A
git commit -m "Renaming schema references to branch  'master'"
git push origin $1

