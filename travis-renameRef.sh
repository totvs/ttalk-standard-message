echo $1
echo $2
echo $3

git config --global user.email "$2"
git config --global user.name "$3"
git config --global push.default simple

node validator/master/renameRef.js
git add -A
git commit -m "Renaming schema references to branch 'master'"
git push origin $1