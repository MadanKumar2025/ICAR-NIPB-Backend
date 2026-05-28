import express from "express";
import { createMenu ,getMenus,updateMenuStatus,updateMenu,getMenusWeb} from "../controllers/menuController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createmenu",authMiddleware, createMenu);
router.get("/getmenu",authMiddleware, getMenus);

router.put("/update/:id",authMiddleware, updateMenu);
router.put("/status/:id",authMiddleware, updateMenuStatus);


// this is use for web
router.get("/getmenu/web", getMenusWeb);


export default router;