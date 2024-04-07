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

export default router;
