import { Error } from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

const signup = async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    if (!fullName || !email || !password)
      return res.status(400).json({ message: "All fields are required" });
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      fullName,
    });

    if (newUser) {
      // JWt token
      generateToken(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User does not exist" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Incorrect password" });

    generateToken(user._id, res);
    return res.status(200).json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    return res.status(500).json("Internal server error");
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    return res.status(500).json("Internal server error");
  }
};

const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    console.log("body:",req.body);
    const userId = req.user._id;
    if (!profilePic){
      return res.status(400).json({ message: "Profile Picture is required" });
    }
    //! Upload to cloudinary
    const upload_res = await cloudinary.uploader.upload(profilePic);
    console.log("Upload response:", upload_res);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: upload_res.secure_url,
      },
      { new: true } //* gives user after updates have been applied
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    return res
      .status(200)
      .json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.log("Error in updateProfile controller", error.message);
    return res.status(500).json("Internal server error");
  }
};

const checkAuth = (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller: ", error.message);
    return res.status(500).json("Internal server error");
  }
};
export { signup, login, logout, updateProfile, checkAuth };
