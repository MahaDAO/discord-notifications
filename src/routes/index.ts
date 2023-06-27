import { Router } from "express";
import { getMahalock } from "../controller/mahaLock";

const router = Router();
router.get("/", (req, res) => res.send("server is running"));
router.post("/mahalock-webhook", (req, res) => getMahalock(req, res));

export default router;
