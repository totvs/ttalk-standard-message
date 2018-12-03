git config --global user.email "francardoso@outlook.com"
git config --global user.name "Francisco Ferreira Cardoso"

echo git config -l

#https://stackoverflow.com/questions/10054318/how-to-provide-username-and-password-when-run-git-clone-gitremote-git
#https://username:password@github.com/username/repository.git
#https://gist.github.com/willprice/e07efd73fb7f13f917ea
#git config remote.origin.url 775ce10e820d83ced636f75ebe5b4842abf49179@github.com/totvs/ttalk-standard-message.git

echo "eee Git Config e origin"

node validator/master/renameRef.js
git add -A
git commit -m "TRAVISCI - Renaming schema references to branch  'master'"
git remote add origin-pages 775ce10e820d83ced636f75ebe5b4842abf49179@github.com/totvs/ttalk-standard-message.git                            
git push origin $1

