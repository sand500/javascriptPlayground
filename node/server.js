var request = require('request');
var http = require('http');

var url = require('url');
var fs = require('fs');
var zlib = require('zlib');
var server;

server = http.createServer(function(req, res){
    // your normal server code
    var path = url.parse(req.url).pathname;
    console.log(req.method);
    switch (path){
        case '/':
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('<h1>Hello! Try the <a href="/test.html">Test page</a></h1>');
            res.end();
            JSON.stringify(res);
            console.log(res);
            break;
        case '/test.html':
            fs.readFile(__dirname + path, function(err, data){
                if (err){ 
                    return send404(res);
                }
                res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'});
                res.write(data, 'utf8');
                res.end();
            });
        break;
        default:
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('Fuck You ED');
        res.end();

    }
}),

send404 = function(res){
    res.writeHead(404);
    res.write('404');
    res.end();
};

server.listen(8001);

// use socket.io
var io = require('socket.io').listen(server);

       

// define interactions with client
io.sockets.on('connection', function(socket){
    //send data to client
    setInterval(function(){
        socket.emit('date', {'date': new Date()});
    }, 1000);

    //recieve client data
    socket.on('client_data', function(data){
        process.stdout.write(data.letter);
        //socket.emit('server_data', {'letter': ""+data.letter});
        stackSearch(data.letter,function(responeText){
          socket.emit('server_data', {'letter': ""+responeText});  
        })

    });
});


function stackSearch(q,callback) {

  
    var so_url = "https://api.stackexchange.com/search/advanced?order=desc&sort=activity&q="+encodeURIComponent(q)+"&filter=default&site=stackoverflow";

    console.log(so_url+"\n");
    request(so_url, {encoding: null},function (error, response, body) {
        if (!error && response.statusCode == 200) {
            

          
            
            console.log(response.headers);
            var encoding = response.headers['content-encoding']
            if (encoding && encoding.indexOf('gzip') >= 0) {
                  zlib.gunzip(body, function(err, dezipped) {
                    console.log(err+" \n");
                    var json_string = dezipped.toString('utf-8');
                    var json = JSON.parse(json_string);
                    
                   // console.log(json.toString());
                   // console.log(dezipped.toString());
                    fs.writeFile("testTestTest", dezipped.toString(), function(error) {
                         if (error) {
                           console.error("write error:  " + error.message);
                         } else {
                           console.log("Successful Write to ");
                         }
                    });    
                    callback(dezipped.toString());
                  });
            } else {
              // Response is not gzipped
            }


            



        }
    });



    /*return http.get({
        host: 'personatestuser.org',
        path: '/email'
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {

            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
            callback(responeText);
        });
    }); */

}