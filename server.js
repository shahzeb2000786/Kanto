//jshint esversion:6
const express = require("express"); //requires express
const bodyParser = require("body-parser"); //requires body-parser
const layouts = require("express-ejs-layouts") //requires express-ejs-layouts which allows to use layouts in ejs which allow to implement a header or footer which is pre-defined on each page
const exceljs = require("exceljs")
const app = express(); //assigns app to an instance of express
const ejs = require("ejs"); //requires the ejs modueles which allows for use of scriptlets
const mongoose = require("mongoose", {useNewUrlParser: true}, {useUnifiedTopology: true}); //creates a mongoose constant which is created by requiring the mongoose module and passing in the usernewurlparser which needs to be used in order for the constant to function properly
const ObjectsToCsv = require('objects-to-csv');; //library which allows json to be converted to csv
const open = require ("open")
app.set("view engine", "ejs") //sets the view engine as ejs to allow to use ejs files
app.use(bodyParser.urlencoded({extended: false})) //option that needs to be passedin order to use body parser
app.use(express.static("public"));
app.listen(3000)
 //app.use(express.static("/public"));


app.set('view engine', 'ejs');


const uri = process.env.ATLAS_URI
mongoose.connect("mongodb+srv://sqa5719:Sa786sa786@@cluster0.dt2ez.mongodb.net/Supply_Request?retryWrites=true&w=majority", {useNewUrlParser: true, useCreateIndex: true})
const connection = mongoose.connection;
connection.once("open", function(){
  console.log("Mongo database connection successfully established.")
})




//-------------------------------------------------------------------------------------------

const InventoryItemSchema = new mongoose.Schema({//this InventoryItemSchema schema is used the schema used to add/edit items in the inventory
  itemCode: String,//itemcode of the item
  size: String, //the size of the item,might not be applicable to all ItemSchema
  units: String,// current units of the item
  unitDescription: String, //description of what a single unit of the item is
  location: String, //where the item is located at
  subLocation: String, //the specific place where the item is located within the location
  itemDescription: String,//description of the item
  notes: String //any additional notes about the item.
})
const InventoryItem = mongoose.model("inventoryItem", InventoryItemSchema)
//-------------------------------------------------------------------------------------------




//--------------------------------------------------------------------------------------------------------------
const ItemSchema = new mongoose.Schema({//this itemschema is the schema which is used to make database entries for item requests
  email: String,//email of user making the request
  name: String,//name of the user making the request
  committee: String,//homecoming committee that the user is from
  event: String,//event for which the item is needed
  itemCode: String,//itemCode of the item being requested
  itemDescription: String,//item description of the item being requested. This is not needed if the itemCode is given
  quantity: String //quantity  of the item being requested by the user.     maybe change to a number data type
})

const Item = mongoose.model("Item", ItemSchema)
//--------------------------------------------------------------------------------------------------------------







app.get("/", function (req,res){
  res.render("index.ejs")
})





//-------------------------------orderSummary and orderSummary/search routes-------------------------------------------------------------
app.get("/orderSummary", function(req,res){//this get request will contain all the requests that have been made
  Item.find(function(err,items){//finds all requested items in databse
    if(err){
      console.log(err)
    }
      res.render("orderSummary.ejs", { ItemsToRender: items })
  })

})

app.get("/orderSummary/search", function(req,res){
  res.redirect("/orderSummary")
})

app.post("/orderSummary/search", function(req,res){
  let itemsToRender = []
  Item.find({itemCode: req.body.searchedItem}, function (err,items){
    if (err){
      console.log(err)
    }
    res.render("orderSummary.ejs", {ItemsToRender: items})
  })
})
//-------------------------------orderSummary and orderSummary/search routes-------------------------------------------------------------


app.get("/inventory", function(req,res ){
  res.render("Inventory.ejs")
})
//-----------------------------beginning of editInventory------------------------------------------------------------
app.route("/editInventory")
  .get(function(req,res){

    InventoryItem.find(function(err,items){
      if (err){
        console.log(err)
      }
      res.render("editInventory.ejs", {ItemsToRender: items})
    })
  })

  .post(function(req,res){
    console.log(req.body.itemCode)
    InventoryItem.findOneAndUpdate({itemCode: req.body.itemCode}, {
      itemCode: req.body.itemCode,//itemcode of the item
      size: req.body.size, //the size of the item,might not be applicable to all ItemSchema
      units: req.body.units,// current units of the item
      unitDescription: req.body.unitDescription, //description of what a single unit of the item is
      location: req.body.location, //where the item is located at
      subLocation: req.body.subLocation, //the specific place where the item is located within the location
      itemDescription: req.body.itemDescription,//description of the item
      notes: req.body.notes //any additional notes about the item.

    }).then(item => console.log(item))
    .catch(err => console.log(err))

    res.redirect("/editInventory")

  })
//--------------------------------end of edit inventory routes---------------------------------------------------------





//--------------------------------editinventory/search routes---------------------------------------------------------
app.get("/editInventory/search", function(req,res){
  res.redirect("/editInventory")
})

app.post("/editInventory/search", function(req,res){
  InventoryItem.find({itemCode: req.body.searchedItem},function(err,items){
    if (err){
    //  res.render("error.ejs", {ErrorTitle: "Could not edit Item, try again", ErrorDescription: err.toString()})
      console.log(err)
    }
    else{
      res.render("editInventory", {ItemsToRender: items})
    }

  })
})
//--------------------------------end of editinventory/search routes---------------------------------------------------------







//--------------------------------addInventory routes ---------------------------------------------------------

  app.route("/addInventory")
    .get(function(req,res){
      res.render("addInventory.ejs")
      })
    .post(function(req,res){

      const addedInventoryItem = new InventoryItem({
        itemCode: req.body.itemCode,//itemcode of the item
        size: req.body.size, //the size of the item,might not be applicable to all ItemSchema
        units: req.body.units,// current units of the item
        unitDescription: req.body.unitDescription, //description of what a single unit of the item is
        location: req.body.location, //where the item is located at
        subLocation: req.body.subLocation, //the specific place where the item is located within the location
        itemDescription: req.body.itemDescription,//description of the item
        notes: req.body.notes //any additional notes about the item.
      });
      addedInventoryItem.save()
      res.redirect("/addInventory")

    })



//---------------------request routers -----------------------------------------------
app.route('/request')//route handler for the request route entry in the post method

  .get(function (req, res) {//renders the request page
    InventoryItem.find(function(err, items){//the items that our found will be used to make a dropdown where users can select which items they want ot request by and it will show both the itemcode and itemname in each option in the dropdown so they don't have to look up itemcodes separately.
      if (err){//logs any errors there were in finding items in the collection
        console.log(err)
      }
      else{
          res.render("request.ejs", {InventoryItems: items})//renders request.ejs with the "items" array passed in as the value for ejs variable "InventoryItems".
      }
    })



  })
  .post(function (req, res) {//creates a new item entry when a post request is made to the /request app

    const requestedItem = new Item({
      email: req.body.email,//email of user making the request
      name: req.body.name,//name of the user making the request
      committee: req.body.committee,//homecoming committee that the user is from
      event: req.body.event,//event for which the item is needed
      itemCode: req.body.itemCode,//itemCode of the item being requested
      itemDescription: req.body.itemDescription,//item description of the item being requested. This is not needed if the itemCode is given
      quantity: req.body.quantity //quantity  of the item being requested by the user.     maybe change to a number data type

    })


    requestedItem.save()//Saves the requested item to the mongo database
    res.redirect("/request")

  })
  //--------------------------------------------------------------------------







//----------------------download  page get and past routes----------------------
app.get("/download",function(req,res){
  res.render("download.ejs")
})

app.post("/download/inventory",function(req,res){
    InventoryItem.find(function(err,items){
      if (err){
        console.log(err)
      }

      else{
          (dataToCsv(items))
      }//ensd of else statement
    })//end of inventoryItem.find and post route
})//end of post route

  app.post("download/requestedItems",function(req,res){

  })

  async function dataToCsv(data) {
    let csvData =  (await new ObjectsToCsv(data).toString());
    let Data =  (await new ObjectsToCsv(data));
     //console.log(csvData)
    // console.log(Data)

}
  //----------------------download  page get and past routes----------------------
