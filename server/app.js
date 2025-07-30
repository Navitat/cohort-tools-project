const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const Cohort = require("./models/Cohort.model");
const Student = require("./models/Student.model");
const PORT = 5005;

// STATIC DATA
// Devs Team - Import the provided files with JSON data of students and cohorts here:
// ...
const cohorts = require("./cohorts.json");
const students = require("./students.json");

// INITIALIZE EXPRESS APP - https://expressjs.com/en/4x/api.html#express
const app = express();

// MIDDLEWARE
// Research Team - Set up CORS middleware here:
// ...
app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ROUTES - https://expressjs.com/en/starter/basic-routing.html
// Devs Team - Start working on the routes here:
// ...
app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/views/docs.html");
});

//
// COHORT ROUTES
//

app.get("/api/cohorts", (req, res, next) => {
  // res.json(cohorts);
  Cohort.find({})
    .then((cohorts) => {
      console.log("Retrieved cohorts ->", cohorts);
      res.json(cohorts);
    })
    .catch((error) => {
      console.log("Error while retrieving cohorts ->", error);
      res.status(500).json({ error: "Failed to retrieve cohorts" });
    });
});

app.get("/api/cohorts/:cohortId", (req, res) => {
  const { cohortId } = req.params;

  Cohort.findById(cohortId)
    .then((cohort) => {
      res.status(200).json(cohort);
    })
    .catch((error) => {
      console.log("Error retrieving cohort");
      console.log(error);
      res.status(500).json({ error: "Failed retrieving specific Cohort" });
    });
});

app.post("/api/cohorts", (req, res) => {
  const newCohort = req.body;

  Cohort.create(newCohort)
    .then((cohort) => {
      res.status(201).json(cohort);
    })
    .catch((error) => {
      console.log("Error creating cohort");
      console.log(error);
      res.status(500).json({ error: "Failed to create cohort" });
    });
});

app.put("/api/cohorts/:cohortId", (req, res) => {
  const { cohortId } = req.params;

  const newDetails = req.body;

  Cohort.findByIdAndUpdate(cohortId, newDetails, {
    new: true,
    runValidators: true,
  })
    .then((cohort) => {
      res.status(200).json(cohort);
    })
    .catch((error) => {
      console.log("Error updating cohort");
      console.log(error);
      res.status(500).json({ error: "Failed to update cohort" });
    });
});

//
// STUDENT ROUTES
//

app.get("/api/students", (req, res, next) => {
  // res.json(students);
  Student.find({})
    .then((students) => {
      console.log("Retrieved students ->", students);
      res.json(students);
    })
    .catch((error) => {
      console.error("Error while retrieving students ->", error);
      res.status(500).json({ error: "Failed to retrieve students" });
    });
});

//Mongoose connection
mongoose
  .connect("mongodb://127.0.0.1:27017/cohort-tools-api")
  .then((x) => console.log(`Connected to Database: "${x.connections[0].name}"`))
  .catch((error) => console.error("Error connecting to MongoDB", error));

// START SERVER
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
