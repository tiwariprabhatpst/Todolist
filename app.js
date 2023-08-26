//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require('lodash');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://prabhatpst0811:Prabhat0811@cluster0.e0an2u1.mongodb.net/todolistDB?retryWrites=true&w=majority");

const itemsSchema ={
  name: String
};

const Item = mongoose.model("Item",itemsSchema);
const t1 = new Item({
  name: "Gym"
});

const t2 = new Item({
  name: "Study"
});

const t3 = new Item({
  name: "Eat healthy"
});

const defaultItems = [t1,t2,t3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find()
  .then(function (items) { 
    if(items.length === 0){
      Item.insertMany(defaultItems);
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
    
  })

  .catch(function (err) {
      console.log(err);
});

});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName})
  .then(function(foundList){
    if(foundList === null){
      const list = new List({
        name: customListName,
        items: defaultItems 
      });
      list.save();
      res.redirect("/"+ customListName);
    }
    else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  })
  .catch(function(err){
    console.log(err);
  })
})

app.post("/", function(req, res){
  const listName = req.body.list;
  const newItem = new Item({
    name: req.body.newItem
  });

  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName})
    .then(function(foundList){
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/"+ listName); 
    })
    .catch(function(err){
      console.log(err);
    })
    }

});

app.post("/delete", function(req, res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItem).then(function(){ 
      console.log("Item deleted");
      res.redirect("/");
    })
  
    .catch(function (err) {
        console.log(err);
  });
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItem}}})
    .then(function(){
      res.redirect("/"+listName);
    })
    .catch(function (err) {
      console.log(err);
  });
  }
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
