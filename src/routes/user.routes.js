import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  SignUpUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateEmail,
  updateUserProfile,
  getCurrentUserTest,
  getDepartment,
  getDoctors,
  getAvailableSlot,
  bookAppointment,
  getAppointments,
  getDoctorAndDeptbyId,
} from "../controllers/user.controller.js";
const router = Router();

router.route("/register").post(SignUpUser);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJwt, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").put(verifyJwt, changeCurrentPassword);

router.route("/getCurrentUser").get(verifyJwt, getCurrentUser);

router.route("/update-email").put(verifyJwt, updateEmail);

router
  .route("/updateUserProfile")
  .put(upload.single("profile"), verifyJwt, updateUserProfile);

router.route("/getTest").get(getCurrentUserTest);

router.route("/getDepartment").get(verifyJwt, getDepartment);

router.route("/getDoctors").get(verifyJwt, getDoctors);

router.route("/getSlots").get(verifyJwt, getAvailableSlot);

router.route("/book-appointment").post(verifyJwt, bookAppointment);

router.route("/get-appointments").get(verifyJwt, getAppointments);

router.route("/getDoctorAndDeptbyId").get(verifyJwt, getDoctorAndDeptbyId);

export default router;
