import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.json({
    speed: "1 tera bytz",
    memory: "1 peta bytz",
  });
});

app.listen(PORT, () => console.log(`server is running on port: ${PORT}`));
