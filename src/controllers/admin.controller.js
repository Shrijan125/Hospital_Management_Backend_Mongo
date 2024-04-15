import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Admin } from "../models/admin.model.js";
import { Doctor } from "../models/doctors.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Dept } from "../models/departments.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Medicine } from "../models/medicines.model.js";
import { MedCategory } from "../models/medicineCategory.model.js";

const SignUpAdmin = asyncHandler(async (req, res) => {
  const { email, adminID, password } = req.body;
  if ([email, adminID, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedAdmin = await Admin.findOne({ adminID });
  if (existedAdmin) {
    throw new ApiError(409, "Admin with email or adminID already exists");
  }

  const admin = await Admin.create({
    email,
    password,
    adminID,
  });

  const createdAdminId = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );

  if (!createdAdminId) {
    throw new ApiError(500, "Something went wrong while registering the Admin");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(200, createdAdminId, "Admin registered successfully")
    );
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { password, adminID } = req.body;
  if (!adminID) {
    throw new ApiError(400, "Admin ID is required");
  }

  const admin = await Admin.findOne({ adminID });
  if (!admin) {
    throw new ApiError(404, "Admin does not exist");
  }

  const isPasswordValid = await admin.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Admin Credentials");
  }

  const loggedInAdmin = await Admin.findById(admin._id).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { admin: loggedInAdmin },
        "Admin logged in successfully."
      )
    );
});

const addDoctor = asyncHandler(async (req, res) => {
  const {
    name,
    consultationCharge,
    email,
    phone,
    availability,
    department,
    shortDescription,
    LongDescription,
  } = req.body;
  if (
    [
      name,
      consultationCharge,
      email,
      phone,
      shortDescription,
      LongDescription,
    ].some((field) => {
      if (typeof field === "string") {
        return field.trim() === "";
      }
    })
  ) {
    throw new ApiError(404, "All fields are required");
  }

  if(!availability || availability.length ==0)
  {
    throw new ApiError(404, "All fields are required");
  }

  const profileLocalPath = req.file?.path;

  if (!profileLocalPath) {
    throw new ApiError(400, "Profile file is missing");
  }

  const profile = await uploadOnCloudinary(profileLocalPath);

  if (!profile.url) {
    throw new ApiError(400, "Error while uploading on profile");
  }

  const doctor = await Doctor.create({
    name,
    consultationCharge,
    profilePhoto: profile.url,
    email,
    phone,
    department,
    shortDescription,
    LongDescription,
    availability
  });

  const createdDoctorId = await Doctor.findById(doctor._id);
  if (!createdDoctorId) {
    throw new ApiError(
      500,
      "Something went wrong while registering the Doctor"
    );
  }
  return res
    .status(201)
    .json(
      new ApiResponse(200, createdDoctorId, "Doctor registered successfully")
    );
});

const addDepartment = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (name === null || name.trim() === "") {
    throw new ApiError(400, "Department name is required");
  }

  const department = await Dept.create({ name });
  const createdDepartmentId = await Dept.findById(department._id);
  if (!createdDepartmentId) {
    throw new ApiError(
      500,
      "Something went wrong while creating the department"
    );
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        createdDepartmentId,
        "Department created Successfully successfully"
      )
    );
});

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

const addMedicineCategory = asyncHandler(async (req, res) => {
  const { category } = req.body;
  if (category === null || category.trim() === "") {
    throw new ApiError(400, "Category name is required");
  }

  const department = await MedCategory.create({ category });
  const createdCategoryId = await MedCategory.findById(department._id);
  if (!createdCategoryId) {
    throw new ApiError(500, "Something went wrong while creating the category");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        createdCategoryId,
        "Category created Successfully successfully"
      )
    );
});

const addMedicine = asyncHandler(async (req, res) => {
  const { name, category, mfg, exp, prescReq, price } = req.body;
  if (
    [name, category, mfg, exp, prescReq, price].some((field) => {
      if (typeof field === "string") {
        return field.trim() === "";
      }
    })
  ) {
    throw new ApiError(404, "All fields are required");
  }
  if (mfg > exp) {
    throw new ApiError(400, "Manufacturing date greater than expiry date");
  }
  const medImageLocalPath = req.file?.path;

  if (!medImageLocalPath) {
    throw new ApiError(400, "Medicine image file is missing");
  }

  const medImage = await uploadOnCloudinary(medImageLocalPath);

  if (!medImage.url) {
    throw new ApiError(400, "Error while uploading medImage");
  }

  const med = await Medicine.create({
    name,
    category,
    mfg,
    exp,
    prescReq,
    price,
    medImage: medImage.url,
  });

  const medId = await Medicine.findById(med._id);
  if (!medId) {
    throw new ApiError(
      500,
      "Something went wrong while registering the medicine"
    );
  }
  return res
    .status(201)
    .json(new ApiResponse(200, medId, "Medicine registered successfully"));
});

const getMedicine = asyncHandler(async (req, res) => {
  const getAllDepts = await MedCategory.find({}, "category");
  if (!getAllDepts || getAllDepts.length === 0) {
    throw new ApiError(404, "No Category Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, getAllDepts, "Fetched Categories successfully"));
});


export {
  SignUpAdmin,
  loginAdmin,
  addDoctor,
  addDepartment,
  getDepartment,
  addMedicineCategory,
  addMedicine,
  getMedicine,

};
