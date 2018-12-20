sudo apt-get update
sudo apt install curl
ECHO 'Refresh API Reference SearchIndex'
curl -X POST https://api.totvs.com.br:8027/api/apireference/v1/search/refreshindex -d "Content-Length: 0"
ECHO ${APIREFERENCEHOST}