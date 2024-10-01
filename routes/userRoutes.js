import { Router } from "express";
import { registerUser,loginUser,genAccessToken, logout } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = Router();

router.get("/", (req, res) => {
    res.send("this is user Route");
})

router.post("/register",registerUser)
router.post("/login",loginUser);
router.post("/genAccessToken",genAccessToken)
router.post("/logout",authMiddleware,logout)


export default router