import { Router } from "express";
import {
  getMahalock,
  timelock12Day,
  timelock14Day,
  timelock30Day,
} from "../controller/webhook";

const router = Router();
router.get("/", (req, res) => res.send("server is running"));
router.post("/mahalock-webhook", (req, res) => getMahalock(req, res));
router.post("/12-day-timelock", (req, res) => timelock12Day(req, res));
router.post("/14-day-timelock", (req, res) => timelock14Day(req, res));
router.post("/30-day-timelock", (req, res) => timelock30Day(req, res));

export default router;
