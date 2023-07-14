import { Router } from "express";
import { getMahalock, getCallExecute } from "../controller/webhook";

const router = Router();
router.get("/", (req, res) => res.send("server is running"));
router.post("/mahalock-webhook", (req, res) => getMahalock(req, res));
router.post("/callExecute-webhook", (req, res) => getCallExecute(req, res));

export default router;
