//Developed by Vishwak N D in node js
//This is version zero so there may be bugs.  I am trying to update it.
//If you want to help just contribute or donate or give support for this project
//My mail id - vishwakneelamegam@gmail.com
//modules used
//express, cors, bodyParser, mongoose
const express = require('express')
var cors = require('cors')
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express()

app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//mongodb connection
mongoose.connect('mongodb://127.0.0.1:27017/clip2read',{useNewUrlParser: true,useCreateIndex: true,useUnifiedTopology: true});

//data schema
//id - user id or email
//data - content or message that user needs to hear via voice assistant(Alexa, Google Assistant, Siri etc)
const dataModel = mongoose.model('datas',{
  id:{
    type: String
  },
  data:{
    type: String
  }
});


//add data to mongodb
//The addData function gets user id and input data or string from the user and add them to mongodb
//If the user adds data newly a space is created in mongodb
//If the user adds data the old space is updated with new data
async function addData(uid,inp){
  try{
    returnOutput = {};
    if(await dataModel.countDocuments({"id":uid}).exec() <= 0){
      await dataModel.create({id:uid,data:inp});
      returnOutput.response = "added";
      return returnOutput;
    }else{
      await dataModel.updateOne({id:uid},{"data":inp});
      returnOutput.response = "added";
      return returnOutput;
    }
  }catch(e){
    returnOutput.response = "error";
    return returnOutput;
  }
}

//get Data from mongodb
//By providing user id, can get user data
async function getData(uid){
  try{
    returnOutput = {};
    if(await dataModel.countDocuments({"id":uid}).exec() > 0){
      returnOutput.response = await dataModel.findOne({"id":uid}).exec();
      return returnOutput;
    }else{
      returnOutput.response = "upload";
      return returnOutput;
    }
  }catch(e){
    returnOutput.response = "error";
    return returnOutput;
  }
}

//post method is used to add data
app.post('/add', (req, res) => {
  const reqJson = req.body
  if('id' in reqJson && 'inp' in reqJson){
    addData(reqJson.id.trim(),reqJson.inp.toLowerCase().trim()).then(x => res.json(x));
  }else{
    res.json({"response":"missing"});
  }
})

//get method is used to get data
app.get('/get',async(req,res)=>{
  const uid = req.query.uid;
  if(uid.length > 0){
    getData(uid).then(x => res.json(x));
  }else{
    res.json({"response":"missing"});
  }
})

//runs in port 80 use nginx to run on https
app.listen(80)
