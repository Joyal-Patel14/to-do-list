const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://joyal14:joyal2002@cluster0.xfoxusg.mongodb.net/?retryWrites=true&w=majority").then(() => console.log('Connection successful')).catch(err => console.log('No connection'));

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add task to the list."],
  }

});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your to do list!",
});

const item2 = new Item({
  name: "Hit + button to add a new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: {
    type: String,
    required: [true, "Please add name"]
  },

  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

  Item.find ({}, function (err, foundItems) {
    
    if (foundItems.length === 0) {

      Item.insertMany (defaultItems, function (err) {

        if (err) {
          console.log(err);
        } else {
          console.log("Default items inserted successfully.");
        }

      });

      res.redirect("/");

    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }

  });

});

app.post("/", function (req, res) {
  
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }

  else {
    List.findOne ({name: listName}, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
  
});

app.post("/delete", function(req, res) {

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
  
        console.log("Successfully removed item from the list.");
  
        res.redirect("/");
      }
    });
  }

  else {
    List.findOneAndUpdate ({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function (err, foundList) {
      
      if (!err) {
        res.redirect("/" + listName);
      }

    });
  }
});

app.get("/:customListName", function (req, res) {
  
  const customListName = _.capitalize(req.params.customListName);

  List.findOne ({name: customListName}, function (err, foundList) {
    
    if (!err) {
      if (!foundList) {

        const list = new List ({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);

      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }

  });

});

app.get("/about", function (req, res) {
  
  res.render("about");
  
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
