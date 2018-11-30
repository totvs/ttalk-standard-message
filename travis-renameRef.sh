git config --global user.email "francardoso@outlook.com"
git config --global user.name "Francisco Ferreira Cardoso"
git config --global push.default simple

echo "Definidos Git Config"

node validator/master/renameRef.js
git add -A
git commit -m "Renaming schema references to branch  'master'"
git push origin $1

