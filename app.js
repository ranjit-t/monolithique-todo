const express = require("express");
const dotenv = require("dotenv");
const hbs = require("hbs");
const path = require("path");
const { readFileSync, writeFileSync } = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fs = require("fs");

//Routes
const usersRoutes = require("./Routes/users-route");
const tasksRoutes = require("./Routes/tasks-route");
const { middleWare1, middleWare2 } = require("./Middleware/security");

const hbsViewsPath = path.join(__dirname, "./templates/views");
const hbsPartialsPath = path.join(__dirname, "./templates/partials");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config();

app.use(express.static("public"));

app.set("view engine", "hbs");
hbs.registerPartials(hbsPartialsPath);
app.set("views", hbsViewsPath);

app.use(middleWare1);

app.get("/", async (req, res) => {
  const users = JSON.parse(readFileSync("./data/users.json"));

  const email = req.email;
  if (!email) {
    return res.render("index.hbs", {
      pageTitle: "Todo List",
      loggedIn: req.loggedIn,
    });
  }
  let existingUser = users.find((user) => user.email === email);
  const tasks = existingUser.tasks;

  res.render("index.hbs", {
    pageTitle: "Todo List",
    loggedIn: req.loggedIn,
    tasks: tasks,
  });
});

app.use("", usersRoutes);

app.use(middleWare2);

app.use("", tasksRoutes);

app.get("*", (req, res) => {
  res.render("404.hbs", {
    pageTitle: "404 : Page not found",
    loggedIn: req.loggedIn,
  });
});

const Port = process.env.PORT || 3000;

app.listen(Port, () => {
  console.log(`Server running on ${Port}`);
});
