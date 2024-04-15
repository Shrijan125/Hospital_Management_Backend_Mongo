import { Router } from "express";
import userRouter from "./user.routes.js";
import adminRouter from "./admin.routes.js";
const router = Router();

router.use("/users", userRouter);
router.use("/admin", adminRouter);

export default router;
