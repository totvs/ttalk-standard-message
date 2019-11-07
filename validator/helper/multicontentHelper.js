exports.allowedContents = [ //https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Basico_sobre_HTTP/MIME_types/Complete_list_of_MIME_types
    "audio/aac",
    "application/x-abiword",
    "application/octet-stream",
    "video/x-msvideo",
    "application/vnd.amazon.ebook",
    "application/x-bzip",
    "application/x-bzip2",
    "application/x-csh",
    "text/css",
    "text/csv",
    "text/xml",
    "application/msword",
    "application/vnd.ms-fontobject",
    "application/epub+zip",
    "image/gif",
    "text/html",
    "image/x-icon",
    "text/calendar",
    "application/java-archive",
    "image/jpeg",
    "application/javascript",
    "application/json",
    "audio/midi",
    "video/mpeg",
    "application/vnd.apple.installer+xml",
    "application/vnd.oasis.opendocument.presentation",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/vnd.oasis.opendocument.text",
    "audio/ogg",
    "video/ogg",
    "font/otf",
    "image/png",
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/x-rar-compressed",
    "application/rtf",
    "application/x-sh",
    "image/svg+xml",
    "application/x-shockwave-flash",
    "application/x-tar",
    "image/tiff",
    "application/typescript",
    "font/ttf",
    "application/vnd.visio",
    "audio/x-wav",
    "audio/webm",
    "video/webm",
    "image/webp",
    "font/woff",
    "font/woff2",
    "application/xhtml+xml",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/xml",
    "application/vnd.mozilla.xul+xml",
    "application/zip",
    "video/3gpp",
    "audio/3gpp",
    "video/3gpp2",
    "audio/3gpp2",
    "application/x-7z-compressed",
];

var checkIfThisIsJsonOrNoContent = function (contentType) {
    // We always consider 'GET' without 'content/type' as JSON endpoint (default value).
    // The 'hasNonJsonResponses' will be responsible for hidding examples in case is about XML.
    return contentType ? checkIfThisIsEndpointOfType(contentType, 'json') : true;
}

var checkIfThisIsXmlEndpoint = function (contentType) {
    return contentType ? checkIfThisIsEndpointOfType(contentType, 'xml') : false;
}

var checkIfThisIsEndpointOfType = function (receivedContentType, expectedContentType) {
    return (receivedContentType ? (receivedContentType.endsWith(expectedContentType)) : false);
}

exports.checkIfThisIsFileEndpoint = function (contentType) {
    return (contentType ? !(checkIfThisIsJsonOrNoContent(contentType)) && !(checkIfThisIsXmlEndpoint(contentType)) : false);
}

exports.getContentType = function (content) {
    return Object.keys(content)[0];
}