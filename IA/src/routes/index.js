// routes/index.js
import express from "express";
//import authMiddleware from "../middleware/authMiddleware.js";
import api from "../comfy.js"

const router = express.Router();


// Rota pública de EndPoints
router.post("/createImage", api.createImage)
router.post("/health", api.health)
// router.post("/api", api.queuePrompt)
// router.post("/api/image", api.getImage)
// router.post("/api/uploadimage", api.uploadImage64) // alterei

export default router;