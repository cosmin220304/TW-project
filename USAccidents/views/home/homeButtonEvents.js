var colorArray = ["#000000"];

// Appends a new searchBlock to the last searchBlock
function createNewSearch(){
    //Get this element
    let createNewSearch = document.getElementById("createNewSearch");
    let saveData = document.getElementById("saveData");

    //Add color picker 
    let colorPicker = document.createElement("input"); 
    colorPicker.type = "color";
    colorPicker.name = "color";
    colorPicker.className = "colorPicker";

    //Replace createNewSearch button with color picker
    createNewSearch.parentNode.insertBefore(colorPicker, createNewSearch); 
    createNewSearch.remove();

    //When choosing color, color picker will create the actual search block and recreate the "createNewSearch" button
    colorPicker.onchange = function(){ 

        //Creates new search block
        createSearchBlock(colorPicker.value);

        //Remove color picker
        colorPicker.remove(); 

        //Add the "createNewSearch" button back
        let button = createNewSearch.cloneNode(true); 
        saveData.parentNode.insertBefore(button, saveData);
    }
}  


//Used when submit button is pressed
function makeSearch() { 
    //Refresh the points on map
    removeAllPoints();

    //Does the actual queryString constructing, sending it to server and adding points to map
    makeSearchHandler()

    //Stop form from changing url
    return false;
}  


async function makeSearchHandler(){
    //We make a different search for every searchBlock   
    for (var index = 0; index <= searchBlockNo; index++)
    {  
        //Get the block from searchBlocks list
        let block = searchBlocks[index]; 

        //If block is empty continue
        if (block.childNodes.length == 0)
        continue;

        //Copy each value from that searchBlock into queryString
        let queryString = "";
        for ( var i = 0; i < block.childNodes.length; i++ ) {
            //Get the elements from that block
            var e = block.childNodes[i];  

            //If checkbox we are interested in true/false value
            if (e.type == "checkbox")
            { 
                queryString = queryString + e.name + "=" + e.checked.toString().toUpperCase() + "&";
                continue;
            }

            //If is a remove button/div/span we skip it
            if (e.className == "removeButton" || e.value == undefined)
            {
                continue;
            }

            //If is text area/date that was uncompleted we simply ignore it (and show a message)
            if (e.value == ""){
                alert("empty data in " + e.name + " will not be sent to server!");
                continue;
            }

            //We get the name and values and add it to our query string
            queryString = queryString + e.name + "=" + e.value + "&";
        } 
        
        //Add the color
        let color = "rgb(0, 0, 0)";
        if (searchBlocks[index].id != "searchBlockStart")
        color =  searchBlocks[index].style.backgroundColor; 

        //Print the result locally + send it to server
        console.log("For block number " + index + " we have: " + queryString);

        await queryToPoints(queryString, color);

        console.log("Block number " + index + " finised!");
    }
}


async function queryToPoints(queryString, color){
    //todo add loading

    //Make requests in wave
    let offset = 0;
    let limit = 1000;
    while(true){
        //Get json from server
        var json = await getReq(queryString+"&Limit="+limit+"&Offset="+offset);  
        var coordonatesObject = Object.values(json);

        offset += limit;
        if (json.length == 0)
            break

        //Transform object into array of coordonates
        var coordonatesArray = [];
        var descriptionArray = [];
        for (var i = 0; i< coordonatesObject.length; i++){
            var lat = coordonatesObject[i].Start_Lat;
            var long = coordonatesObject[i].Start_Lng;  
            var desc = coordonatesObject[i].Description;
            descriptionArray.push(desc);
            coordonatesArray.push([long, lat]);
        } 

        //Add coordonates to map 
        addPointsToMap(coordonatesArray, descriptionArray, color);  
    } 
}


//Initializes the map with some random points
function addRandomPoints() {
    queryToPoints("State=NE&Severity=1", "rgb(0, 0, 0)");
} 
addRandomPoints();

//Get data from db
async function getReq(queryString) {
    return new Promise((resolve, reject) => {
        try {
            fetch("/home?" + queryString, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, */*',
                'Content-type': 'application/json'
            }, 
            })
            .then((res) => res.json())
            .then((data) => resolve(data));
        }
        catch (error){
            reject(error);
        }
    });
}


function saveData(){
    //Delete last data
    localStorage.clear();

    //Prepare variables
    let inputNames = [];
    let inputValues = [];
    let nameOfBlock = [];   
    
    //Go through all searchblocks
    for (var j = 0; j < searchBlocks.length; j++){
        //Go through all searchblock nodes
        children = searchBlocks[j].childNodes; 
        for (var i = 0; i < children.length; i++){
            //Get only inputs
            if (children[i].name !== undefined && children[i].name != "" && children[i].value != "")
            {
                inputNames.push(children[i].name);
                inputValues.push(children[i].value);   
                nameOfBlock.push(searchBlocks[j].id.toString());
            }
        } 
    }

    //Save everything on localStorage
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("inputNames", inputNames);
        localStorage.setItem("inputValues", inputValues); 
        localStorage.setItem("nameOfBlock", nameOfBlock); 
        localStorage.setItem("colorArray", colorArray);
    } 
    else{ 
        alert("Browser does not support localStorage") 
    }
}


function loadData(){
    if (typeof(Storage) !== "undefined"){

        //Destroy everything
        destroyAllBlocks();

        //Load everything from localStorage
        const inputNames = localStorage.getItem("inputNames").split(',');
        const inputValues = localStorage.getItem("inputValues").split(',');
        const nameOfBlock = localStorage.getItem("nameOfBlock").split(',');  
        const colArr = localStorage.getItem("colorArray").split(',');
        let colIndex = 1;
        
        //Recreate each element
        for (var i = 0; i < nameOfBlock.length; i++){   
            //Find current searchBlock
            let searchBlock = document.getElementById(nameOfBlock[i]);

            //Add a new searchBlock if it doesn not exist
            if (searchBlock == null){
                createSearchBlock(colArr[colIndex++]);
                searchBlock = document.getElementById(nameOfBlock[i]); 
            }

            //Add the inputs
            addSelect.value = inputNames[i];
            const func = nameToFunc[addSelect.value];
            var select = func();
            select.value = inputValues[i];
        }   

        //Reset selectGenerator
        addSelect.value = '0';
    }
    else{
        alert("Browser does not support localStorage") 
    }
}


function destroyAllBlocks()
{
    //Remove all
    for (var i = 0; i <= searchBlockNo; i++){   
        searchBlocks[i].remove();
    }

    //Create searchblock start
    let searchBlockStart = document.createElement("div");
    searchBlockStart.id = "searchBlockStart";
    searchBlockStart.className = "searchBlocks";
    
    //Add child to form
    const submit = document.getElementById('submit');
    submit.parentNode.insertBefore(searchBlockStart, submit);

    //Reset array
    searchBlocks = [searchBlockStart];
    searchBlockNo = 0;
    colorArray = ["#000000"];
}


function createSearchBlock(color)
{
    //Create it and add the id and class
    newSearchBlock = document.createElement("div");
    newSearchBlock.id = "searchBlock" + searchBlockNo;
    newSearchBlock.className = "searchBlocks"

    //Add the collor
    newSearchBlock.style.backgroundColor = color;
    colorArray.push(color);

    //Add it in our html
    lastSearchBlock = searchBlocks[searchBlockNo]; 
    lastSearchBlock.parentNode.insertBefore(newSearchBlock, lastSearchBlock.nextSibling); 

    //Add to our array
    searchBlockNo += 1;
    searchBlocks.push(newSearchBlock);
}