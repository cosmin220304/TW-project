const mongoose = require('mongoose') 
 
var mySchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    ID: String,
    Source: String,
    TMC: String,
    Severity: String,
    Start_Time: String,
    End_Time: String,
    Start_Lat: String,
    Start_Lng: String,
    End_Lat: String,
    End_Lng: String,
    Distance: String,
    Description: String,
    Number: String,
    Street: String,
    Side: String,
    City: String,
    County: String,
    State: String,
    Zipcode: String,
    Country: String,
    TimeZone: String,
    Airport_code: String,
    Weather_Timestamp: String,
    Temperature: String,
    Wind_Chill: String,
    Humidity: String,
    Pressure: String,
    Visibility: String,
    Wind_Direction: String,
    Wind_Speed: String,
    Precipitation: String,
    Weather_Condition: String,
    Amenity: String,
    Bump: String,
    Crossing: String,
    Give_Way: String,
    Junction: String,
    No_Exit: String,
    Railway: String,
    Roundabout: String,
    Station: String,
    Stop: String,
    Traffic_Calming: String,
    Traffic_Signal: String,
    Turning_Loop: String,
    Sunrise_Sunset: String,
    Civil_Twilight: String,
    Nautical_Twilight: String,
    Astronomical_Twilight: String
})
const MyModel = mongoose.model("data", mySchema, "data")

async function start() {
    mongoose.connect(process.env.db_url, { useUnifiedTopology: true, useNewUrlParser: true })
        .then(() => console.log('Connected to DB!'))
        .catch(err => console.log('DB conn error:' + err))
}


function findCoordonates(body, offset, limit) {
    return new Promise((resolve, reject) => {
        try {
            MyModel.find(body).skip(offset).limit(limit).select("Start_Lat Start_Lng Description -_id")
                .exec((err, res) => {
                    if (err) console.log(err)
                    resolve(res)
                })
        }
        catch (error) {
            reject(error)
        }
    })
}

function findByID(ID) {
    return new Promise((resolve, reject) => {
        try {
            MyModel.findOne({"ID" : ID})
                .exec((err, res) => {
                    if (err) console.log(err)
                    resolve(res)
                })
        }
        catch (error) {
            reject(error)
        }
    })
}



function count(body) {
    return new Promise((resolve, reject) => {
        try {
            MyModel.aggregate
                ([
                    { $match: body },
                    { "$group": { _id: "$State", counter: { $sum: 1 } } }
                ]).exec((err, res) => { resolve(res) })
        }
        catch (error) {
            reject(error)
        }
    })
}


function save(obj) {
    var newModel = new MyModel(obj)
    newModel.save(function (err, element) {
        if (err) console.log(err)
        console.log("object saved in collection")
    })
}


function update(ID, obj, upsertOk) {
    return new Promise((resolve, reject) => {
        try {
            MyModel.updateOne(
                { "ID": ID },
                { $set: obj },
                { upsert: upsertOk },

                (err, result) => {
                    let response = {}  
                    //In case of ERROR
                    if (err) {
                        console.log(err)
                        response["Response"] = "Something went wrong"
                        response["Response Code"] = 500;
                    }

                    //For PATCH on unexisting resource
                    if (upsertOk == false && result["n"] == 0) {
                        response["Response"] = "Update Failed! Couldn't find record." 
                        response["Response Code"] = 404; 
                    } 

                    //For PUT on unexisting resource
                    else if (upsertOk == true && result["upserted"]){
                        response["Response"] = "Object created with Success!" 
                        response["Response Code"] = 201;
                    }

                    //For PATCH/ PUT on existing resource
                    else{
                        response["Response"] = result["nModified"] + " fields updated with Success!" 
                        response["Response Code"] = 200;
                    }
                    
                    resolve(response)
                }
            )
        }
        catch (error) {
            reject(error)
        }
    })
}

function deleteByID(id){
    return new Promise((resolve) => {
        MyModel.deleteOne({ ID: id }, function (res, err) {
            if(err) console.log(err);
            resolve(res)
        });
    })
}

module.exports.save = save
module.exports.findByID = findByID
module.exports.start = start
module.exports.count = count
module.exports.update = update
module.exports.deleteByID = deleteByID
module.exports.findCoordonates = findCoordonates