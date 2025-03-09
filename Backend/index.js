import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connectionString from "./password.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import csv from "csv-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;
const secretKey = "hsdbenka22102002";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const originalName = path.parse(file.originalname).name; // Extract base name
    const extension = path.extname(file.originalname); // Extract extension
    cb(null, originalName + extension);
  },
});

const upload = multer({
  storage,
});

// connecting to mongoDb
mongoose
  .connect(connectionString)
  .then(() => console.log("connected to database"))
  .catch((err) => console.log(err));

// mongoose schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const agentSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  mobile: String,
});

const taskSchema = new mongoose.Schema({
  FirstName: String,
  Phone: String,
  Notes: String,
});

const userModel = mongoose.model("user", userSchema); // mongoose model
const agentModel = mongoose.model("agent", agentSchema); // mongoose model
const taskModel = mongoose.model("task", taskSchema); // mongoose model

function verifyToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token) res.status(403).json({ error: "Access denied" });
  try {
    const decoded = jwt.verify(token, secretKey);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

app.get("/", (req, res) => {
  res.json({
    speed: "1 tera bytz",
    memory: "1 peta bytz",
  });
});

app.post("/login", async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Please enter the details" });
  }

  const { email, password } = req.body;
  try {
    const result = await userModel.find({ email: email });
    if (result.length === 0)
      return res
        .status(401)
        .send({ message: "User doesn't exist, please register" });
    const exist = await bcrypt.compare(password, result[0].password);
    if (exist) {
      const token = await jwt.sign({ user: result[0]._id }, secretKey, {
        expiresIn: "1h",
      });
      res.status(200).json({ token });
    } else res.status(403).send({ message: "Invalid password or email" });
  } catch (error) {
    res.status(500).send({ message: "Login failed" });
  }
});

app.post("/register", async (req, res) => {
  if (!req.body) {
    return res.status(401).json({ message: "Please enter the details" });
  }

  const { email, password, name } = req.body;
  const hash = bcrypt.hashSync(password, 10); // hashing password
  const newUser = new userModel({ email, password: hash, username: name });
  try {
    await newUser.save();
    res.status(200).send({ message: "Successfully created user" });
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" });
  }
});

app.post("/agent", verifyToken, async (req, res) => {
  const { username, email, password, mobile } = req.body;
  const hash = bcrypt.hashSync(password, 10); // hashing password

  const newAgent = new agentModel({
    email,
    password: hash,
    username,
    mobile,
  });
  try {
    const agent = await newAgent.save();
    res
      .status(200)
      .send({ message: "Successfully created agent", agent: agent });
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" });
  }
});

app.get("/agent", verifyToken, async (req, res) => {
  const agents = await agentModel.find();
  res.status(200).send({ agents: agents });
});

app.post("/file", verifyToken, upload.single("file"), async (req, res) => {
  const fileExt = path.extname(req.file.originalname).toLowerCase();
  const fileName = req.file.originalname;
  let parsedData;

  if (fileExt === ".csv") {
    // Parse CSV
    parsedData = await parseCSV(fileName);

    const uploadedTasks = await taskModel.insertMany(parsedData);

    res.status(200).send({ tasks: uploadedTasks });
  } else if (fileExt === ".xlsx" || fileExt === ".xls") {
    // Parse Excel
    parsedData = parseExcel(fileName);
  } else {
    return res.status(400).json({ message: "Unsupported file type" });
  }
});

app.get("/tasks", verifyToken, async (req, res) => {
  const tasks = await taskModel.find();
  if (tasks) res.status(200).send({ tasks: tasks });
  else res.status(400).send({ message: "no tasks available" });
});

function parseCSV(fileName) {
  return new Promise((resolve, reject) => {
    const results = [];
    const p = __dirname + "\\uploads\\" + fileName;

    fs.createReadStream(p)
      .pipe(csv())
      .on("data", (data) => {
        results.push(data);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

app.listen(PORT, () => console.log(`server is running on port: ${PORT}`));
