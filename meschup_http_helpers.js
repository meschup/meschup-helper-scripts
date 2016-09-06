// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};

/**
 * meSchup HTTP Helpers
 * 
 * All rights reserved by
 * Unversity of Stuttgart 2013-2017
 * 
 * author: Thomas Kubitza
 * email: thomas.kubitza@vis.uni-stuttgart.de
 * 
 * Allows to conveniently do HTTP-GET and POST request
 */ 

var _httpDebug = false;

function httpGet(url){
    var uri = parseUri(url);
    http.get({hostname:uri.host, port:uri.port, path:uri.relative, agent:false}, function(res) {
        res.setTimeout(1000);
        if (_httpDebug) log("httpGet: Got response: " + res.statusCode);
    }).on('error', function(e) {
        if (_httpDebug) log("httpGet: Got error: " + e.message);
    });
}


function httpPost(url, data) {
    var uri = parseUri(url);

    var req = http.request({
        host: uri.host, port: uri.port, path: uri.relative, agent: false, method: 'POST', headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(data).length
        }
    }, function (res) {
        res.setTimeout(1000);
        if (_httpDebug) console.log("httpPost: Got response: " + res.statusCode);
    }).on('error', function (e) {
        if (_httpDebug) {
            console.log("httpPost: Got error: " + e.message + " with url: " + url + " and data ");
        }
    });

    req.write(JSON.stringify(data));

    if (_httpDebug) console.log(req);
    req.end();
}