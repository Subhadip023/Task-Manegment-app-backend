import Joi from "joi";
import  jwt from'jsonwebtoken';

import User from "../models/userModel.js";
import { comparePassword } from "../utils/hashPassword.js";
import dotenv from 'dotenv'

dotenv.config()

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenGenarator.js";

const registerUser = async (req, res) => {
  try {
    const { username, password, confirmPassword, email } = req.body;

    const schema = Joi.object({
      username: Joi.string().min(3).max(30).required(),
      password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
      confirmPassword: Joi.ref("password"),
      email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      }),
    });

    const { error } = schema.validate({
      username,
      password,
      confirmPassword,
      email,
    });
    if (error) {
      return res.status(404).json({ error: error.message });
    }

    const lowerEmail = email.toLowerCase();

    const emailExists = await User.findOne({ email: lowerEmail });

    if (emailExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newUser = await User.create({
      username,
      email: lowerEmail,
      password,
    });

    res.status(201).json(`New User ${newUser.username} Registerd`);
  } catch (error) {
    return res.status(422).json(error);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(req.body)
    const schema = Joi.object({
      password: Joi.string()
        .min(8)
        .max(16)
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
      email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      }),
    });

    const { error } = schema.validate({ email, password });
    if (error) {
      return res.status(404).json({ error: error.message });
    }

    const user = await User.findOne({ email });
    const matchPassword = await comparePassword(password, user.password);
    if (!matchPassword) {
      return res.status(422).json("Password Not Matched");
    }
    const accessToken = generateAccessToken({
      id: user._id,
      name: user.username,
    });
    const refreshToken = generateRefreshToken({
      id: user._id,
      name: user.username,
    });

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      accessToken: accessToken,
      refreshToken:refreshToken
    });
  } catch (error) {
    console.log(error);
  }
};

const genAccessToken=async(req,res)=>{
  const { refreshToken } = req.body;

  if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
      const user = await User.findOne({ refreshToken });
      // console.log(user,refreshToken)
      if (!user) {
          return res.status(403).json({ message: 'Invalid refresh token' });
      }

      // Verify the refresh token
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
          if (err) {
              return res.status(403).json({ message: 'Invalid or expired refresh token' });
          }
// console.log("decoded")
          // Generate a new access token
          const newAccessToken = jwt.sign(
              { id: user._id, username: user.username }, 
              process.env.ACCESS_TOKEN_SECRET, 
              { expiresIn: '15m' } // New access token valid for 15 minutes
          );

          res.json({ accessToken: newAccessToken });
      });
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
}

const logout=async(req,res)=>{
  
}

export { registerUser, loginUser,genAccessToken };
