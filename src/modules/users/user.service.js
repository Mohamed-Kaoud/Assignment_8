import userModel from "../../DB/models/user.model.js";
import bcrypt from "bcrypt"
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken"

export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, age } = req.body;
    if (!name || !email || !password || !phone || !age) {
      return res
        .status(400)
        .json({ message: `name,email,password,phone,age are required` });
    }
    const userExist = await userModel.findOne({ email });
    if (userExist) {
      return res.status(409).json({ message: `Email ${email} already exist` });
    }
    const hashedPassword = bcrypt.hashSync(password,10)
    
    const encryptedPhone = CryptoJS.AES.encrypt(
      phone,
      "secretkey123"
    ).toString()

    const user = await userModel.create({ name, email, password:hashedPassword, phone:encryptedPhone, age });
    return res.status(201).json({ message: `User added successfully`, user });
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: `email and password are required` });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: `Invalid email or password` });
    }
    const match = bcrypt.compareSync(password,user.password)
    if(!match){
      return res.status(400).json({ message: `Invalid email or password` });
    }
    const token = jwt.sign(
      {userId:user._id},
      "loginSecretKey",
      {expiresIn:"1h"}
    )
    return res.status(200).json({ message: `Login successful`, token });
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email, phone, age } = req.body;
    if (req.body.password) {
      return res.status(400).json({ message: "You cannot update password here" });
    }

    if (email) {
      const emailExist = await userModel.findOne({ email });
      if (emailExist) {
        return res.status(409).json({ message: `Email ${email} already exist` });
      }
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { name, email, phone, age },
      { new: true }
    );

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.userId;

    const deletedUser = await userModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = req.userId
    const user = await userModel.findById(userId).select("-__v")
    if (!user) {
      return res.status(404).json({ message: `User not found` });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
};
