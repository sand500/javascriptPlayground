var http = require('http');
var request = require('request');
var zlib = require('zlib');
var url = require('url');
var fs = require('fs');
var server;

server = http.createServer(function(req, res){
    // your normal server code
    var path = url.parse(req.url).pathname;
    switch (path){
        case '/':
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('<h1>Hello! Try the <a href="/test.html">Test page</a></h1>');
            res.end();
            break;
        case '/test.html':
            fs.readFile(__dirname + path, function(err, data){
                if (err){ 
                    return send404(res);
                }
                res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text.html'});
                res.write(data, 'utf8');
                res.end();
            });
        break;
        default: send404(res);
    }
}),

send404 = function(res){
    res.writeHead(404);
    res.write('404');
    res.end();
};

server.listen(8002);

// use socket.io
var io = require('socket.io').listen(server);

       

// define interactions with client
io.sockets.on('connection', function(socket){
    //send data to client
    setInterval(function(){
        //socket.emit('date', {'date': new Date()});
    }, 1000);   

    //recieve client data
    socket.on('client_data', function(data){
         process.stdout.write(data);
         stackSearch(data,function(x){
            socket.emit('server_data', x);
            console.log(x);
        });

    });
    socket.on('url', function(data){
        console.log(data.url);
        var links = data.url.split('\n');
        console.log(JSON.stringify(links));
        io.emit('newurl', 'ed do you fuckin see htis?');
        io.emit('newurl', {urlList:JSON.stringify(links) });

    });


     socket.on('urll', function(data){
        console.log(data);


        stackSearch(data,function(x){
            socket.emit('server_data', x);
            console.log(x);
        });
       


    });
});


function stackSearch(q,callback) {

    var so_url = "https://api.stackexchange.com/search/advanced?order=desc&sort=activity&q="+encodeURIComponent(q)+"&filter=default&site=stackoverflow";
    var googleURL = "https://www.googleapis.com/customsearch/v1?q="+encodeURIComponent(q)+"&cx=010344413874094446100%3A7t0sbj9tk7g&siteSearch=stackoverflow.com&key=AIzaSyALTCTmFqGeSS5RGz2wiGUWv4JKx7eYmCY"
    console.log(googleURL+"\n");
    request(googleURL,function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var gJson = JSON.parse(body);
            if(typeof gJson["items"] != 'undefined'){
                var xString = gJson["items"][0].link;
                var qindex=  xString.indexOf("/questions/");
                var id = xString.substr(qindex+11,8);
                var so_url2 =  "https://api.stackexchange.com/2.2/questions/"+id+"/comments?order=desc&sort=creation&site=stackoverflow&filter=withbody";

                console.log("SO\t"+so_url2+"\n");
                request(so_url2, {encoding: null},function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        


                        console.log(response.headers);
                        var encoding = response.headers['content-encoding']
                        if (encoding && encoding.indexOf('gzip') >= 0) {
                                zlib.gunzip(body, function(err, dezipped) {
                                    console.log(err+" \n");
                                    var json_string = dezipped.toString('utf-8');
                                    console.log(json_string);
                                    var soJSON = JSON.parse(json_string);
                                    // console.log(dezipped.toString());
                                    if(typeof soJSON["items"]  != 'undefined'){
                                        var commentBody = soJSON["items"][0].body;
                                        console.log("CB\t"+commentBody+"\n");
                                        callback(commentBody);
                                    }
                                });
                        } else {
                          // Response is not gzipped
                        }

                    } else {
                        console.log("so fucked up\n")
                    }
                });
            } else {
                console.log("Item Size " + gJson["items"].size + "\n");
                //console.log(body+"\n");

            }
        }else {
            console.log("Google fucked up"+body+"\n")
        }
    });
}


          
            
      /*    console.log(response.headers);
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
                    callback(json.items[0].link);
                  });
            } else {
              // Response is not gzipped
            }
        }
    });*/



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

