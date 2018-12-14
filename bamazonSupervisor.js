var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require("colors");
var Table = require('cli-table');

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
    viewProductSaleByDept();
})



//view Product Sales by Department
function viewProductSaleByDept() {

    // console.log("Inserting a new product...\n");
    var query = "SELECT departments.department_id, products.department_name, departments.over_head_costs, SUM(products.product_sales) AS total_sales FROM products LEFT JOIN departments ON (departments.department_name = products.department_name) GROUP BY department_name ORDER BY departments.department_id";

    connection.query(query, function (err, res) {
        if (err) throw err;

        table = new Table({
            head: ["ID", "Department Name", "Overhead", "Product Sales", "Total Profit"],
            colWidths: [4, 24, 15, 15, 15]
        });
        for (var i = 0; i < res.length; i++) {
            var totalProfit = parseInt(res[i].total_sales) - parseInt(res[i].over_head_costs);
            var outArray = [res[i].department_id.toString(), res[i].department_name, res[i].over_head_costs, res[i].total_sales, totalProfit];
            table.push(outArray);
        }
        console.log(table.toString());

    })
}



