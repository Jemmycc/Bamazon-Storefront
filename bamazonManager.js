var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require("colors");
var Table = require("cli-table");

//set the connection for database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_db"
});

//make connection with the server
connection.connect(function (err) {
    console.log("Connected as id: " + connection.threadId);
    chooseMenu();
});

var chooseMenu = function () {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "Please select an option:",
            choices: [
                "View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add a New Product",
                "Delete a Product",
                "Exit Manager View"
            ]
        }).then(function (answer) {
            switch (answer.action) {
                case "View Products for Sale":
                    displayItemsForSale();
                    break;

                case "View Low Inventory":
                    viewLowInventory();
                    break;

                case "Add to Inventory":
                    AddInventory();
                    break;

                case "Add a New Product":
                    addNewProduct();
                    break;

                case "Delete a Product":
                    deleteProduct();
                    break;

                case "Exit Manager View":
                    exit();
                    break;
            }
        });
}

//display items for sale
function displayItemsForSale() {
    connection.query("SELECT item_id, product_name, price, department_name,stock_quantity FROM products", function (err, result) {
        if (err) throw err;

        if (result.length == 0) {
            console.log("There are no items for sale.");
        }

        for (var i = 0; i < result.length; i++) {
            console.log(colors.green("\nBook ID:    " + result[i].item_id.toString() + "\n" +
                "Book Name:  " + result[i].product_name + "\n" +
                "Book Price: " + parseInt(result[i].price).toFixed(2) + "\n" +
                "Department: " + result[i].department_name + "\n" +
                "Stock:      " + result[i].stock_quantity));
        }
        chooseMenu();
    });
}

//display Low Inventory
function viewLowInventory() {
    connection.query("SELECT item_id, product_name, stock_quantity FROM products WHERE stock_quantity <=5", function (err, result) {
        if (err) throw err;

        if (result.length == 0) {
            console.log(colors.magenta("\nThere are no low inventory items.\n"));
        }
        for (var i = 0; i < result.length; i++) {
            console.log(colors.yellow("\nBook ID:    " + result[i].item_id.toString() + "\n" +
                "Book Name:  " + result[i].product_name + "\n" +
                "Stock:      " + result[i].stock_quantity));
        }
        chooseMenu();
    });
}

// add New Product
function addNewProduct() {
    console.log("Inserting a new product...\n");
    inquirer
        .prompt([
            {
                type: "input",
                name: "product_name",
                message: colors.cyan("What is the book's name?")
            },
            {
                type: "input",
                name: "price",
                message: colors.cyan("What is the price?")
            },
            {
                type: "list",
                name: "department_name",
                message: colors.cyan("Which department does it belong to?"),
                choices: ["Hardcover", "Paperback", "Kindle"]
            },
            {
                type: "input",
                name: "quantity",
                message: colors.cyan("How many do you need?")
            }
        ]).then(function (answer) {

            connection.query("INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)",
                [answer.product_name, answer.department_name, parseInt(answer.price), parseInt(answer.quantity)],
                function (err, res) {
                    if (err) throw err;
                    console.log(colors.magenta("\n Your book has been added.\n"));
                    console.log(colors.green("\nBook Name:  " + answer.product_name + "\n" +
                        "Book Price: " + parseInt(answer.price).toFixed(2) + "\n" +
                        "Department: " + answer.department_name + "\n" +
                        "Stock:      " + answer.quantity + "\n"));
                    chooseMenu();
                });
        });
}

//Add inventory
function AddInventory() {
    inquirer
        .prompt([{
            name: "bookId",
            type: "input",
            message: colors.cyan("Select a Book ID: ")
        },
        {
            name: "quantity",
            type: "input",
            message: colors.cyan("How many do you want to add?")
        }])
        .then(function (answer) {
            connection.query("SELECT product_name, stock_quantity FROM products WHERE item_id = ?",
                [answer.bookId],
                function (err, res) {
                    if (err) throw err;

                    var newQuantity = parseInt(res[0].stock_quantity) + parseInt(answer.quantity);
                    connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?",
                        [newQuantity, answer.bookId],
                        function (err, result) {
                            if (err) throw err;
                            console.log(colors.magenta("\n Your stock quantity has been updated.\n"));
                            console.log(colors.green("\nBook Name:" + res[0].product_name + "\n" +
                                "Stock    :" + newQuantity + "\n"));
                            chooseMenu();
                        });
                });
        });
}

//Delete inventory
function deleteProduct() {
    inquirer
        .prompt([
            {
                name: "bookId",
                type: "input",
                message: colors.cyan("Select a Book ID: ")
            },
            {
                name: "sure",
                type: "confirm",
                message: colors.cyan("Are you sure?")
            }
        ])
        .then(function (answer) {
            connection.query("DELETE FROM products WHERE item_id = ?",
                [answer.bookId],
                function (err, res) {
                    if (err) throw err;
                    console.log(colors.magenta("\n Your book has been deleted.\n"));
                    chooseMenu();
                })
        });
}

//Exit the manager's view
function exit() {
    connection.end();
    process.exit(-1);
}