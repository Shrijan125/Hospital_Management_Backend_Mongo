import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Dept } from "../models/departments.model.js";
import { Doctor } from "../models/doctors.model.js";
import { Appointment } from "../models/appointments.model.js";
const generateAccessTokenAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const SignUpUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if ([email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const user = await User.create({
    profilePhoto: "",
    email,
    password,
    username,
  });

  const createdUserId = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUserId) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUserId, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user Credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully."
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorised Request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken: accessToken, refreshToken: newRefreshToken },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User Fetched Successfully"));
});

const updateEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        email,
      },
    },
    {
      new: true,
    }
  ).select(" -password ");
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshTokens(user._id);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { accessToken: accessToken, refreshToken: refreshToken },
        "Email Updated"
      )
    );
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const profileLocalPath = req.file?.path;

  if (!profileLocalPath) {
    throw new ApiError(400, "Profile file is missing");
  }

  const profile = await uploadOnCloudinary(profileLocalPath);

  if (!profile.url) {
    throw new ApiError(400, "Error while uploading on profile");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        profilePhoto: profile.url,
      },
    },
    {
      new: true,
    }
  ).select(" -password ");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile photo updated succesfully"));
});

const getCurrentUserTest = function (req, res) {
  return res.status(200).json({ msg: "Success" });
};

const getDepartment = asyncHandler(async (req, res) => {
  const getAllDepts = await Dept.find({}, "name");
  if (!getAllDepts || getAllDepts.length === 0) {
    throw new ApiError(404, "No Department Found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, getAllDepts, "Fetched Department names successfully")
    );
});
const getDoctors= asyncHandler(async (req, res) => {
  const getAllDoctors = await Doctor.find({},"name availability department consultationCharge");
  if (!getAllDoctors || getAllDoctors.length === 0) {
    throw new ApiError(404, "No Doctor Found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, getAllDoctors, "Fetched Doctors names successfully")
    );
});

const getAvailableSlot= asyncHandler(async (req, res) => {
  const {doctor_id}=req.query;
  const getslot = await Doctor.find({_id:doctor_id},"availability");
  if (!getslot || getslot.length === 0) {
    throw new ApiError(404, "No Time Slot Found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, getslot, "Fetched TimeSlots  successfully")
    );
});

const bookAppointment=asyncHandler(async (req, res) => {
  const {doctor_id,booked_time,dept_id,index,user_id}=req.body;
  if ([doctor_id,  dept_id ,user_id].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  if(!index)
  {
    throw new ApiError(400, "All fields are required");
  }

  if(booked_time=="")
  {
    throw new ApiError(409,"This time slot has been booked");
  }


  const appointment = await Appointment.create({
    doctorID:doctor_id,
    timeSlot:booked_time,
    deptID:dept_id,
    userId:user_id
  });

 const updateDoctor= await Doctor.findByIdAndUpdate(doctor_id,{
    $set: {
      [`availability.${index}.booked`]: true
    }
  },{
    new:true
  });
  if(!updateDoctor)
  {
    throw new ApiError(500, "Something went wrong while booking the appointment");
  }

  const createdAppointment=Appointment.findById(appointment._id);
  
  if (!createdAppointment) {
    throw new ApiError(500, "Something went wrong while booking the appointment");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, appointment._id, "Appointment Booked successfully"));
})

export {
  SignUpUser,
  loginUser,
  getDoctors,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  getDepartment,
  updateEmail,
  updateUserProfile,
  getCurrentUserTest,
  getAvailableSlot,
  bookAppointment
};
