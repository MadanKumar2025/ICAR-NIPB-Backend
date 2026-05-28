import User from "../models/User.js";
import Scientist from "../models/ScientistSchema.js";
import fs from "fs";
import path from "path";

export const createUser = async (req, res) => {
  try {
    const { name, email, password, mobileNo, designation, imageTitle } =
      req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo is required and must be an image",
      });
    }

    if (!/^[0-9]{10}$/.test(mobileNo)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be exactly 10 digits",
      });
    }

    const photo = req.file ? req.file.filename : null;

    const createby = req.user.id;

    const user = new User({
      name,
      email,
      password,
      mobileNo,
      designation,
      photo,
      imageTitle,
      createby,
    });

    const savedUser = await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: savedUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = User.find();

    let users;
    const totalUsers = await User.countDocuments();

    if (isAll) {
      users = await query;
    } else {
      users = await query.skip(skip).limit(limit);
    }

    res.status(200).json({
      success: true,
      count: users.length,
      total: totalUsers,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(totalUsers / limit),
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    // const user = await User.findById(req.params.id);
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, password, mobileNo, designation, imageTitle, isActive } =
      req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (mobileNo && !/^[0-9]{10}$/.test(mobileNo)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be exactly 10 digits",
      });
    }

    if (name) user.name = name;
    if (mobileNo) user.mobileNo = mobileNo;
    if (designation) user.designation = designation;
    if (password) user.password = password;
    if (imageTitle) user.imageTitle = imageTitle;
    if (isActive !== undefined) {
      user.isActive = isActive === "true" || isActive === true;
    }
    user.updateby = req.user.id;

    if (req.file) {
      if (user.photo) {
        const oldImagePath = path.join("uploads", user.photo);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      user.photo = req.file.filename;
    }

    user.updatedate = Date.now();

    const updatedUser = await user.save();

    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: userResponse,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    // ✅ 9. Other errors
    console.error("UpdateUser Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong, please try again later",
    });
  }
};

export const changePassword = async (req, res) => {
  const { newPassword, confirmNewPassword } = req.body;

  try {
    const user = req.user;

    if (newPassword !== confirmNewPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    user.password = newPassword;
    user.updatedate = new Date();
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const ProfileUpdate = async (req, res) => {
  try {
    const loggedUserId = req.user._id.toString();
    const paramId = req.params.id;

    if (loggedUserId !== paramId) {
      return res.status(403).json({
        message: "You can only edit your own profile",
      });
    }

    const { name, mobileNo, designation, imageTitle } = req.body;

    let photo;

    if (req.file) {
      photo = req.file.filename;
    }

    if (!/^[0-9]{10}$/.test(mobileNo)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be exactly 10 digits",
      });
    }

    const updateData = {
      name,
      mobileNo,
      designation,
      imageTitle,
      updatedate: Date.now(),
      updateby: loggedUserId,
    };

    if (photo) {
      updateData.photo = photo;
    }

    const user = await User.findByIdAndUpdate(paramId, updateData, {
      new: true,
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, updateby } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        isActive: isActive,
        updateby: updateby,
        updatedate: new Date(),
      },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// This is use for web
export const getAllUsersWeb = async (req, res) => {
  try {
    const usersList = await User.find().sort({ createdAt: -1 });

    const data = usersList.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      mobileNo: user.mobileNo,
      designation: user.designation,
      photo: user.photo,
      imageTitle: user.imageTitle,
      isActive: user.isActive,

      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
};

// this is use for create scientist Login
export const createScientistLogin = async (req, res) => {
  try {
    const {
      scientistId,
      name,
      email,
      password,
      mobileNo,
      designation,
      imageTitle,
      existingPhoto,
    } = req.body;

    const scientist = await Scientist.findById(scientistId);

    if (!scientist) {
      return res.status(404).json({
        success: false,
        message: "Scientist not found",
      });
    }

    // if (!req.file) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Photo is required",
    //   });
    // }

    if (!/^[0-9]{10}$/.test(mobileNo)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be exactly 10 digits",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    let photo = scientist.photo;

    if (req.file) {
      photo = req.file.filename;
      console.log("New uploaded file:", req.file.filename);
    } else {
      console.log("No new file uploaded, using existingPhoto or old");
      photo = existingPhoto || scientist.photo;
    }
    const createby = req.user.id;

    const user = new User({
      scientistId,
      name,
      email,
      password,
      mobileNo,
      designation,
      photo,
      imageTitle,
      createby,
    });

    const savedUser = await user.save();

    res.status(201).json({
      success: true,
      message: "Scientist login created successfully",
      data: savedUser,
    });
  } catch (error) {
    console.log(error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];

      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);

      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
