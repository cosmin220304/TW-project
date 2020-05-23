const fs = require('fs');
const path = require('path');  
const qs = require('querystring');  
var model = require('../models/model')
const mongoose = require('mongoose')

async function getHandler(filePath, response){ 
    //Open and return it if is .html,.css or .js
    fs.readFile(filePath, function(error, content) 
    {  
        response.writeHead(200, { 'Content-Type': getContentType(filePath) });
        response.end(content); 
    }); 
}  
 
async function postHandler(filePath, response){  
    //Used for getting the request data
    let reqBody = '';
    var obj;
    console.log(request);  

    //Print any error
    request.on('error', (err) => { 
        console.error(err.stack);
    });

    //Get the data
    request.on('data',function(data){
        reqBody += data;
        obj = JSON.parse(reqBody);
    });


    request.on('end', function(){
        response.writeHead(200, { 'Content-Type': 'application/json' });
        console.log("body");
        obj['_id'] = new mongoose.Types.ObjectId();
        console.log(obj);
        model.save(obj);
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