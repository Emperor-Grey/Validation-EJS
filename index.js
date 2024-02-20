const express = require("express");
const collection = require("./src/config");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();

app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.get("/", (_, res) => {
  res.render("login");
});

app.get("/register", (_, res) => {
  res.render("register");
});

// Register User
app.post("/register", async (req, res) => {
  const data = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };

  // Check if the username already exists in the database
  const existingUser = await collection.findOne({ name: data.username });

  if (existingUser) {
    return res.send("User already exists. Please choose a different username.");
  }

  // Hash the password using bcrypt
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);

  data.password = hashedPassword;

  try {
    const userdata = await collection.insertMany(data);
    console.log(userdata);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Login user
app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ name: req.body.username });

    if (!check) {
      return res.send("Username not found");
    }

    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      check.password,
    );

    if (!isPasswordMatch) {
      return res.send("Wrong Password");
    }

    res.render("home");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`);
});
