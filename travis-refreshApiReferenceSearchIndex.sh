#sudo apt install curl
echo 'Refresh API Reference SearchIndex'
curl -X POST https://api.totvs.com.br:8045/api/apireference/v1/search/refreshindex -d "Content-Length: 0"
echo ${APIREFERENCEHOST}