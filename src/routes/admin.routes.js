import { Router } from "express";
import {
  SignUpAdmin,
  addDepartment,
  addDoctor,
  loginAdmin,
  getDepartment,
  addMedicineCategory,
  addMedicine,
  getMedicine,
} from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/signup").post(SignUpAdmin);

router.route("/login").post(loginAdmin);

router.route("/add-doctor").post(upload.single("profile"), addDoctor);

router.route("/add-department").post(addDepartment);

router.route("/get-department").get(getDepartment);

router.route("/add-medicine-category").post(addMedicineCategory);

router.route("/add-medicine").post(upload.single("medImage"), addMedicine);

router.route("/get-medicine-category").get(getMedicine);

export default router;
