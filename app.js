const express = require("express");
const dotenv = require("dotenv");
const hbs = require("hbs");
const path = require("path");
const { readFileSync } = require("fs");

const hbsViewsPath = path.join(__dirname, "./templates/views");
const hbsPartialsPath = path.join(__dirname, "./templates/partials");

// console.log(hbsViewsPath);

const app = express();
dotenv.config();

app.use(express.static("public"));

app.set("view engine", "hbs");
hbs.registerPartials(hbsPartialsPath);
app.set("views", hbsViewsPath);

const tasks = JSON.parse(readFileSync("./data/data.json"));
// console.log(tasks);

app.get("/", (req, res) => {
  res.render("index.hbs", { pageTitle: "Todo List", loggedIn: false, tasks });
});

app.get("*", (req, res) => {
  res.render("404.hbs", { pageTitle: "404 : Page not found", loggedIn: false });
});

const Port = process.env.PORT || 3000;

app.listen(Port, () => {
  console.log(`Server running on ${Port}`);
});
