//jshint esversion:6
const express = require("express"); //requires express
const bodyParser = require("body-parser"); //requires body-parser
const layouts = require("express-ejs-layouts") //requires express-ejs-layouts which allows to use layouts in ejs which allow to implement a header or footer which is pre-defined on each page
const exceljs = require("exceljs")
const app = express(); //assigns app to an instance of express
const ejs = require("ejs"); //requires the ejs modueles which allows for use of scriptlets
const mongoose = require("mongoose", {useNewUrlParser: true}, {useUnifiedTopology: true}); //creates a mongoose constant which is created by requiring the mongoose module and passing in the usernewurlparser which needs to be used in order for the constant to function properly
//mongoose.connect("mongodb://localhost:27017/supplyDB", {userNewUrlParser: true}) //the code which allows for mongoose to connect with the local host and make changes to the databse called "userDB"
app.set("view engine", "ejs") //sets the view engine as ejs to allow to use ejs files
app.use(bodyParser.urlencoded({extended: false})) //option that needs to be passedin order to use body parser
app.listen(3000)
// app.use(express.static("/public"));
app.use(express.static("public"));

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

app.get("/", function(req, res){//get request to home page
  res.render("index.ejs");
});
//---------------------------------------------
app.get("/orderSummary/:itemCode", function(req,res){
  let itemsToRender = []
  Item.find({itemCode: req.params.itemCode}, function (err,items){
    if (err){
      console.log(err)
    }
    console.log(items)
  })
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






app.get("/orderSummary", function(req,res){//this get request will contain all the requests that have been made
  Item.find(function(err,items){//finds all requested items in databse
    if(err){
      console.log(err)
    }
      res.render("orderSummary.ejs", { ItemsToRender: items })

  })

})


app.get("/Inventory", function(req,res ){
  res.render("Inventory.ejs")
})





app.route("/editInventory")
  .get(function(req,res){
    res.render("editInventory.ejs")
  })
  .post(function(req,res){

  })

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
      })
      addedInventoryItem.save()
      res.redirect("/addInventory")

    })



//---------------------------------------------
app.route('/request')//route handler for the request route entry in the post method

  .get(function (req, res) {//renders the request page
    res.render("request.ejs")
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
    requestedItemsArray = []
    requestedItemsArray.push(req.body.productID, req.body.email,req.body.name,req.body.committee,req.body.event, req.body.itemCode,req.body.itemDescription,req.body.quantity,req.body.dateNeededBy,
    req.body.timeNeededBy,req.body.locationOfItem,req.body.unitsAvailable,req.body.status);//this line and the line above adds all the requested item info to the array which will be used to write to the excel file



    const inventoryWorkbook = new exceljs.Workbook(); //creates an exceljs workbook
    inventoryWorkbook.xlsx.readFile("Inventory.xlsx")
      .then(function(){
        let worksheet = inventoryWorkbook.getWorksheet(1);//gets the first worksheet in the homcoming.xlsx files
        rowNumber = 2
        let row = worksheet.getRow(rowNumber)//sets the variable row, equal to the second row of the 1st sheet of the homecoming xlsx file
        while (row.getCell(2).value != req.body.itemCode && row.getCell(2).value != null){
          rowNumber = rowNumber + 1 //variable which is used to traverse to next row in excel sheet
          row = worksheet.getRow(rowNumber)//resets row to next row if the row is filled already wit ninfo
          console.log(rowNumber)
        }
        row.getCell(8).value = parseInt(row.getCell(8).value) - parseInt(req.body.quantity)
        row.commit()//commits changes made to the row
        return inventoryWorkbook.xlsx.writeFile("Inventory.xlsx")//rewrites the file with the added values and names it homecoming.xlsx
      })


    const workbook = new exceljs.Workbook(); //creates an exceljs workbook
    workbook.xlsx.readFile("Homecoming.xlsx")
      .then(function(){
        let worksheet = workbook.getWorksheet(1);//gets the first worksheet in the homcoming.xlsx files
        rowNumber = 2
        let row = worksheet.getRow(rowNumber)//sets the variable row, equal to the second row of the 1st sheet of the homecoming xlsx file
        while (row.getCell(2).value != null){
          rowNumber = rowNumber + 1 //variable which is used to traverse to next row in excel sheet
          row = worksheet.getRow(rowNumber)//resets row to next row if the row is filled already wit ninfo
        }
        for (i = 1; i<=13; i++){
          row.getCell(i).value = requestedItemsArray[i-1]
        }
        row.commit()//commits changes made to the row
        return workbook.xlsx.writeFile("Homecoming.xlsx")//rewrites the file with the added values and names it homecoming.xlsx
      })





    requestedItem.save()//Saves the requested item to the mongo database
    res.redirect("/request")

  })
  //------------------------------------------
