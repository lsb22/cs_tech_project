import bcrypt from "bcryptjs";
import cors from "cors";
import csv from "csv-parser";
import express from "express";
import fs, { readFileSync } from "fs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import connectionString from "./password.js";
import XLSX from "xlsx";

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

// const connection = mongoose.connection;

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
  creatorEmail: String,
});

const taskSchema = new mongoose.Schema({
  FirstName: String,
  Phone: String,
  Notes: String,
  assignedTo: String,
  createdBy: String,
});

const userModel = mongoose.model("user", userSchema); // mongoose model
const agentModel = mongoose.model("agent", agentSchema); // mongoose model
const taskModel = mongoose.model("task", taskSchema); // mongoose model

// async function deleteTasks() {
//   try {
//     const res = await taskModel.deleteMany();
//     console.log("successfully deleted tasks", res);
//   } catch (error) {
//     console.log("Error deleting tasks", error);
//     throw error;
//   }
// }

// connection.once("open", () => {
//   deleteTasks();
// });

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

app.post("/agent/:agentEmail", verifyToken, async (req, res) => {
  const { username, email, password, mobile, creatorAgent } = req.body;
  const hash = bcrypt.hashSync(password, 10); // hashing password

  const newAgent = new agentModel({
    email,
    password: hash,
    username,
    mobile,
    creatorEmail: creatorAgent,
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

app.get("/agent/:agentEmail", verifyToken, async (req, res) => {
  const { agentEmail } = req.params;
  const agents = await agentModel.find({ creatorEmail: agentEmail });
  res.status(200).send({ agents: agents });
});

app.post(
  "/file/:agentEmail",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    const { agentEmail } = req.params;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const fileName = req.file.originalname;
    let parsedData;

    if (fileExt === ".csv") {
      // Parse CSV
      parsedData = await parseCSV(fileName);
    } else if (fileExt === ".xlsx") {
      parsedData = await parseXSLX(fileName);
    }

    const s = new Set();
    const uniqueData = [];

    for (const obj of parsedData) {
      const key = JSON.stringify(obj);
      if (!s.has(key)) {
        s.add(key);
        uniqueData.push(obj);
      }
    }

    const data = uniqueData.map((data) => {
      return {
        ...data,
        createdBy: agentEmail,
      };
    });
    res.status(200).send({ tasks: data });
  }
);

app.get("/tasks/:agentEmail", verifyToken, async (req, res) => {
  const { agentEmail } = req.params;
  const tasks = await taskModel.find({ createdBy: agentEmail });
  if (tasks) res.status(200).send({ tasks: tasks });
  else res.status(400).send({ message: "no tasks available" });
});

app.get("/tasks/self/:username", verifyToken, async (req, res) => {
  const { username } = req.params;
  const tasks = await taskModel.find({ assignedTo: username });
  if (tasks) res.status(200).send({ tasks: tasks });
  else res.status(400).send({ message: "no tasks available" });
});

app.post("/tasks", verifyToken, async (req, res) => {
  const tasks = req.body;
  const uploadedTasks = await taskModel.insertMany(tasks);
});

app.post("/agentlogin", async (req, res) => {
  if (!req.body) {
    return res.status(401).json({ message: "Please enter the details" });
  }

  const { email, password } = req.body;

  try {
    const result = await agentModel.find({ email: email });
    if (result.length === 0)
      return res.status(401).send({ message: "Agent doesn't exist" });
    const exist = await bcrypt.compare(password, result[0].password);
    if (exist) {
      const username = result[0].username;
      const token = await jwt.sign({ user: result[0]._id }, secretKey, {
        expiresIn: "1h",
      });
      res.status(200).json({ token, username });
    } else res.status(403).send({ message: "Invalid password or email" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Login failed" });
  }
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

function parseXSLX(filename) {
  return new Promise((resolve, reject) => {
    const p = __dirname + "\\uploads\\" + filename;
    var workbook = XLSX.readFile(p);
    var sheet_name_list = workbook.SheetNames;
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    if (xlData.length !== 0) resolve(xlData);
    else reject("something went wrong");
  });
}

app.listen(PORT, () => console.log(`server is running on port: ${PORT}`));
