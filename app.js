const express = require("express");
const dotenv = require("dotenv");
const hbs = require("hbs");
const path = require("path");
const { readFileSync, writeFileSync } = require("fs");
const bodyParser = require("body-parser");
const { clear } = require("console");

const hbsViewsPath = path.join(__dirname, "./templates/views");
const hbsPartialsPath = path.join(__dirname, "./templates/partials");

// console.log(hbsViewsPath);

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config();

app.use(express.static("public"));

app.set("view engine", "hbs");
hbs.registerPartials(hbsPartialsPath);
app.set("views", hbsViewsPath);

const tasks = JSON.parse(readFileSync("./data/data.json"));

app.get("/", (req, res) => {
  res.render("index.hbs", { pageTitle: "Todo List", loggedIn: false, tasks });
});

app.post("/addtask", (req, res) => {
  const task = req.body.task;
  console.log(task);
  tasks.push(task);
  writeFileSync("./data/data.json", JSON.stringify(tasks));
  res.redirect("/");
});
app.post("/deletetask", (req, res) => {
  const task = req.body.task;
  console.log(task);
  const newTasks = tasks.filter((item) => item !== task);
  writeFileSync("./data/data.json", JSON.stringify(newTasks));
  res.send({ link: "/" });
});

app.get("*", (req, res) => {
  res.render("404.hbs", { pageTitle: "404 : Page not found", loggedIn: false });
});

const Port = process.env.PORT || 3000;

app.listen(Port, () => {
  console.log(`Server running on ${Port}`);
});
