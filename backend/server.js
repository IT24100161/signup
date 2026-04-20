const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// User Model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  age: { type: Number },
});
const User = mongoose.model("User", UserSchema);

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// SIGNUP
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(400).json({ message: "Email already exists" });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// SAVE NAME AND AGE
app.post("/api/profile", async (req, res) => {
  try {
    const { userId, name, age } = req.body;
    await User.findByIdAndUpdate(userId, { name, age });
    res.json({ message: "Profile saved!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ THIS IS THE ONLY CHANGE — use process.env.PORT for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
