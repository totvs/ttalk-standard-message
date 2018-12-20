#sudo apt install curlaaaa
ECHO 'Refresh API Reference SearchIndex'
curl -X POST https://api.totvs.com.br:8045/api/apireference/v1/search/refreshindex -d "Content-Length: 0"
ECHO ${APIREFERENCEHOST}