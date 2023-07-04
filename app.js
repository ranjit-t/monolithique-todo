const express = require("express");
const dotenv = require("dotenv");
const hbs = require("hbs");
const path = require("path");
const { readFileSync, writeFileSync } = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const mongoose = require("mongoose");
const usersDB = require("./Models/users");

// //Handle bar buffer
// // Assuming you are using Express and Handlebars
// const exphbs = require("express-handlebars");
// const handlebars = exphbs.create();

// // Define a custom Handlebars helper
// handlebars.handlebars.registerHelper("bufferToBase64", function (buffer) {
//   const base64 = buffer.toString("base64");
//   return new handlebars.handlebars.SafeString(base64);
// });

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

const URL =
  "mongodb+srv://ranjith:ranjithinaveyron@cluster0.zpe9beh.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(URL)
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(middleWare1);

app.get("/", async (req, res) => {
  // const users = JSON.parse(readFileSync("./data/users.json"));

  const email = req.email;
  if (!email) {
    return res.render("index.hbs", {
      pageTitle: "Todo List",
      loggedIn: req.loggedIn,
    });
  }
  const existingUser = await usersDB.findOne({ email });
  if (!existingUser) {
    return res.render("index.hbs", {
      pageTitle: "Todo List",
      loggedIn: false,
    });
  }

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
