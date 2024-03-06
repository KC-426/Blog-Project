const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blog");

const PORT = process.env.PORT || 3000;
const { MONGOD_URI } = process.env;

app.use(cookieParser());

app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/blog", blogRoutes);

mongoose
  .connect(MONGOD_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
