const express = require("express");
const mongoose = require("mongoose");
const app = express();
const date = require(__dirname + "/date.js");
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(express.urlencoded({
    extended: true
}));
app.use(express.static("public"));

let day = date;

// Connecting to the database
main().catch(err => console.log(err));
async function main() {
    // await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');
    await mongoose.connect('mongodb+srv://admin-preetal:test2507@cluster0.q4tuz7l.mongodb.net/todolistDB');
}

// Create schema
const itemsSchema = new mongoose.Schema({
    name: String
});

// Create model
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your to-do list!"
});

const item2 = new Item({
    name: "Click + to add a new task!"
});

const item3 = new Item({
    name: "Tick the box once the task is completed!"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Home route
app.get("/", async function (req, res) {
    try {
        const foundItems = await Item.find({});

        if (!(await Item.exists())) {
            await Item.insertMany(defaultItems);
            res.redirect("/");
        } else {
            res.render("list", {
                currentDate: day,
                listTitle: "Today",
                newListItems: foundItems
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred.");
    }
});

// Create or display a custom list
app.get("/:customListName", async function (req, res) {
    const customListName = _.capitalize(req.params.customListName);


    try {
        const foundList = await List.findOne({
            name: customListName
        });

        if (!foundList) {
            // Create a new list
            const list = new List({
                currentDate: day,
                name: customListName,
                items: defaultItems
            });
            await list.save();
        }

        // Show an existing list with the custom name
        res.render("list", {
            currentDate: day,
            listTitle: customListName,
            newListItems: foundList ? foundList.items : []
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred.");
    }
});

// Handle item deletion
app.post("/delete", async function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    try {
        if (listName === "Today") {
            await Item.findByIdAndRemove(checkedItemId);
            console.log("Successfully deleted checked item from the database");
            res.redirect("/");
        } else {
            const foundList = await List.findOne({
                name: listName
            });

            if (!foundList) {
                console.error("Custom list not found.");
                res.status(404).send("Custom list not found.");
            } else {
                foundList.items.pull({
                    _id: checkedItemId
                });
                await foundList.save();
                console.log("Successfully deleted checked item from the custom list");
                res.redirect("/" + listName); // Redirect to the custom list
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred.");
    }
});



// Create or add an item to a list
app.post("/", async function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.listName;

    const item = new Item({
        name: itemName
    });

    try {
        if (!listName) {
            console.error("List name not provided.");
            res.status(400).send("List name not provided.");
        } else if (listName === "Today") {
            await item.save();
            res.redirect("/");
        } else {
            let foundList = await List.findOne({
                name: listName
            });

            if (!foundList) {
                foundList = new List({
                    name: listName,
                    items: defaultItems
                });
                await foundList.save();
            }
            foundList.items.push(item);
            await foundList.save();
            res.redirect("/" + listName);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred.");
    }
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});