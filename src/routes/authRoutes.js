// import express from "express";
// import { loginUser } from "../controllers/authController.js";

// const router = express.Router();

// router.route('/login').post(loginUser)
// export default router;

import express from "express";
import { loginUser, forgotPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);

export default router;