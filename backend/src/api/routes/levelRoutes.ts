import express, { Router } from "express";
import * as levelController from "../controllers/levelsController";

const router = Router();
const jsonParser = express.json();

router.post("/levels/:id/complete", levelController.markComplete);
router.get("/levels/:id", levelController.getLevel);
router.get("/levels", levelController.getAllGameLevels);
//router.get("/events/day/:id", eventsController.getEventsForDay);
router.post("/level/add", jsonParser, levelController.addLevel);

//router.delete("/comments/:id", eventsController.deleteComment);
//router.post("/event/edit", jsonParser, eventsController.updateEvent);

export default router;
