const fs = require('fs');
const path = require('path');  
const qs = require('querystring');  
var model = require('../models/model')

//View path
const homeViewPath = path.join(__dirname, '..', 'views', 'heatMap'); 

function getHandler(request, response){ 

    //Find the file 
    let filePath = homeViewPath + request.url; 
    if (request.url == '/heatMap'){
        filePath = homeViewPath + '/heatMap.html';
    }   
    console.log(request.url);
    //Open and return it if is .html,.css or .js
    fs.readFile(filePath, function(error, content) 
    { 
        if (error)  
            return 404; 
 
        response.writeHead(200, { 'Content-Type': getContentType(filePath) });
        response.end(content);
        return 200; 
    }); 
}  

function postHandler(request, response){

    //Find the file path
    let filePath = homeViewPath + request.url; 
    if (request.url == '/heatMap'){
        filePath = homeViewPath + '/heatMap.html';
    }  
    const dataModel= new homeModel({

    });

    //Used for getting the request data
    let reqBody = '';
    let formatedReqBody = '';  

    //Print any error
    request.on('error', (err) => { 
        console.error(err.stack);
    });

    //Get the data
    request.on('data',function(data){
        reqBody += data;  
        if (reqBody.length > 1e6)
            request.connection.destroy();
    });

    //Process it and send a response
    request.on('end', function(){ 
        formatedReqBody = qs.parse(reqBody);  
        model.find(reqBody);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(reqBody);
    });
}

function getContentType(filePath)
{
    var extensionName = String(path.extname(filePath)).toLowerCase();
    var contentTypeMap = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json', 
    }; 
    var contentType = contentTypeMap[extensionName];
    return contentType;
}

function showCookies(request){
    var list = {},
    rc = request.headers.cookie; 
    if (rc)
        console.log('Cookies:',rc);
    else 
        console.log('No cookies found!');
}

module.exports.getHandler = getHandler;
module.exports.postHandler = postHandler;