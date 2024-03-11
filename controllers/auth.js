const bcrypt = require("bcryptjs");
const userSchema = require("../models/user");
var { google } = require("googleapis");
const nodeMailer = require("nodemailer")
const jwt = require("jsonwebtoken");


const CLIENT_ID =
  "335674338168-shke2ermkcgu3rdkroomplhh58sa11e7.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
REFRESH_TOKEN =
  "1//04vEfhjHxra-yCgYIARAAGAQSNwF-L9IrNxvgjiTLq3BsGJliSfZqVsUI_eq5gguoz6OSCL4J5m3SG-Zix-1PlyR8EoXkq8A2DR0";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const accessToken = oAuth2Client.getAccessToken();

const userSignup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Please fill all the required fields!" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password should be at least 8 characters long" });
    }
    if (confirmPassword !== password) {
      return res.status(400).json({ message: "Passwords should match" });
    }

    const existingUser = await userSchema.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPwd = await bcrypt.hash(password, 12);

    const newUser = new userSchema({
      name,
      email,
      password: hashedPwd,
    });

    const result = await newUser.save();
    console.log(result)

    const transport = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "kuldeepchahar426@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: "kuldeepchahar426@gmail.com",
      to: email,
      subject: "Welcome",
      html: "<h1>Welcome you have successfully signed up ! </h1>",
    };

    const mailResult = await transport.sendMail(mailOptions);
    console.log("Mail sent successfully:", mailResult);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const findUser = await userSchema.findOne({ email });
    if (!findUser) {
      return res.status(500).json({ message: "Please sign up !!" });
    }

    const isMatchPassword = await bcrypt.compare(password, findUser.password);
    if (!isMatchPassword) {
      return res.status(500).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ email }, "kuldeep_secret_key", {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true, secure: "production" });

    console.log('Logged In !')
    res.status(200).json({success: true, message: "User logged In", email, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const logoutUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const findUser = await userSchema.findById(userId);
    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .cookie("jwt", null, {
        maxAge: 0,
        sameSite: "none",
        secure: true,
        httpOnly: true,
      })
      .status(200)
      .send({
        success: true,
        message: "Logout Success !!",
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userSchema.find().sort({ createdAt: -1 });

    if (!users) {
      return res.status(404).json({ message: "No user found !!" });
    }

    res.status(200).json({ message: "users fetched !!", users });
  } catch (err) {
    console.log(err);
    res.status(200).json("internal server error");
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userSchema.findById({ _id: id });
    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }

    res.status(200).json({ message: "User fetched successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const findUser = await userSchema.findById(id);

    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await userSchema.findByIdAndRemove(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.userSignup = userSignup;
exports.userLogin = userLogin;
exports.logoutUser = logoutUser;
exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.deleteUserById = deleteUserById;
