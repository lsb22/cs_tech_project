import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connectionString from "./password.js";
import bcrypt from "bcryptjs";

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;

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

const userModel = mongoose.model("user", userSchema); // mongoose model

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
  const result = await userModel.find({ email: email });
  if (result.length === 0)
    return res
      .status(400)
      .send({ message: "User doesn't exist, please register" });

  const exist = await bcrypt.compare(password, result[0].password);
  if (exist) {
    res.status(200).send({ message: "Successfully logged in" });
  } else res.status(403).send({ message: "Invalid password or email" });
});

app.post("/register", async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Please enter the details" });
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

app.listen(PORT, () => console.log(`server is running on port: ${PORT}`));
