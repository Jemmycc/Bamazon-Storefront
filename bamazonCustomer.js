var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require("colors");


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
    itemsForSale();
})


//items available for sale
function itemsForSale() {
    connection.query("SELECT item_id, product_name, price, department_name FROM products;", function (err, result) {
        if (err) throw err;

        for (var i = 0; i < result.length; i++) {

            console.log("\nBook ID:    " + result[i].item_id.toString() + "\n" +
                "Book Name:  " + result[i].product_name + "\n" +
                "Book Price: " + parseInt(result[i].price).toFixed(2) + "\n" +
                "Department: " + result[i].department_name);
        }
        chooseItems();
    });
}


// sets function for cutomer to make a purchase
// list of items id's as an array and passed to the promt/choices
function chooseItems() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "buy",
                message: colors.cyan("Please indicate the ID of the books that you would like to purchase?"),

            },
            {
                type: "input",
                name: "quantity",
                message: colors.cyan("Please enter quantity?")
            }
        ]).then(function (answer) {
            var query = "SELECT item_id, stock_quantity, price FROM products WHERE ?";
            connection.query(query, { item_id: answer.buy }, function (err, res) {
                if (err) throw err;
                // console.log(res);

                checkStock(res[0].stock_quantity, answer.quantity, res[0].price.toFixed(2), res[0].item_id);
            });
        })
}


//check quantity against the stock
function checkStock(in_stock, buy_quantity, price, item_id) {
    if (in_stock >= buy_quantity) {
        var total_price = buy_quantity * price;
        console.log(colors.green("\nThe total amount is $" + total_price.toFixed(2) + ".\n" + "Thank you for purchasing!\n"));
        //update database
        updateStock(in_stock - buy_quantity, item_id);
        updateSales(total_price, item_id);

    } else {
        console.log(colors.red("\nInsufficient quantity in stock!\nThere are only " + colors.yellow(in_stock) + " items in stock!"));
        connection.end();
    }
}

function updateSales(total_price, item_id) {
    var query = "UPDATE products SET product_sales = product_sales + ? WHERE item_id = ?";
    connection.query(query,
        [total_price, item_id],
        function (err, res) {
            if (err) throw err;
            // console.log(colors.yellow("Database was successfully updated!"));
            console.log(colors.magenta(res.affectedRows + " product sales updated!\n"));
        });

}

//update stock_quantity
function updateStock(quantity, item_id) {
    console.log("Updating the quantities...\n");
    var query = "UPDATE products SET ? WHERE ?";
    connection.query(query,
        [
            {
                stock_quantity: quantity
            },
            {
                item_id: item_id
            }
        ],
        function (err, res) {
            if (err) throw err;
            console.log(colors.yellow("Database was successfully updated!"));
            console.log(colors.yellow(res.affectedRows + " products updated!\n"));
        });

    connection.query("SELECT * FROM products WHERE ?",
        {
            item_id: item_id
        },
        function (err, result) {
            if (err) throw err;

            console.log("\nBook ID:    " + result[0].item_id.toString() + "\n" +
                "Book Name:  " + result[0].product_name + "\n" +
                "Book Price: " + parseInt(result[0].price).toFixed(2) + "\n" +
                "Department: " + result[0].department_name + "\n" +
                "Stock:      " + result[0].stock_quantity);
        });
}

