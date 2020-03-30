//jshint esversion:6
const express = require("express"); //requires express
const bodyParser = require("body-parser"); //requires body-parser
const layouts = require("express-ejs-layouts") //requires express-ejs-layouts which allows to use layouts in ejs which allow to implement a header or footer which is pre-defined on each page
const app = express(); //assigns app to an instance of express
const ejs = require("ejs"); //requires the ejs modueles which allows for use of scriptlets
// const mongoose = require("mongoose", {useNewUrlParser: true}, {useUnifiedTopology: true}); //creates a mongoose constant which is created by requiring the mongoose module and passing in the usernewurlparser which needs to be used in order for the constant to function properly
// mongoose.connect("mongodb://localhost:27017/supplyDB", {userNewUrlParser: true}) //the code which allows for mongoose to connect with the local host and make changes to the databse called "userDB"


app.set("view engine", "ejs") //sets the view engine as ejs to allow to use ejs files
app.use(bodyParser.urlencoded({extended: false})) //option that needs to be passedin order to use body parser
app.listen(3000)


app.get("/", function(req, res){
  res.render("index.ejs");
});
app.get("/request", function(req,res){
  res.render("request.ejs")
})

// const ItemSchema = new mongoose.Schema({
//   productID: String,
//   name: String,
//   description: String,
//   location: String,
//   quantity: String
//
// })

const Item = mongoose.model("Item", ItemSchema)
