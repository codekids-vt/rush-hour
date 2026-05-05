"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markComplete = exports.addLevel = exports.getLevel = exports.getAllGameLevels = void 0;
const levels_1 = require("../logic/levels");
//import { RushHourLevel } from "@shared/types";
const getAllGameLevels = async (req, res) => {
    try {
        const user = req.user;
        const result = await (0, levels_1.getAllNonCustomLevels)(user.id);
        res.json(result);
    }
    catch (err) {
        console.error("DB ERROR:", err);
        if (err instanceof Error) {
            res.status(500).json({ error: err?.message ?? "unknown error" });
        }
        else {
            res.status(500).json({ error: "unknown error" });
        }
    }
};
exports.getAllGameLevels = getAllGameLevels;
const getLevel = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const user = req.user;
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid Level ID" });
            return;
        }
        const result = await (0, levels_1.getLevelWithID)(id, user.id);
        res.json(result);
    }
    catch (err) {
        console.error("DB ERROR:", err);
        if (err instanceof Error) {
            res.status(500).json({ error: err?.message ?? "unknown error" });
        }
        else {
            res.status(500).json({ error: "unknown error" });
        }
    }
};
exports.getLevel = getLevel;
const addLevel = async (req, res) => {
    try {
        if (!req.body) {
            res.status(400).json({ error: "Request body is required" });
            return;
        }
        const { name, isCustom, startingPositions } = req.body;
        if (!name) {
            res.status(400).json({ error: "Request body must have field 'name'" });
            return;
        }
        if (!Array.isArray(startingPositions)) {
            res.status(400).json({ error: "'startingPositions' must be an array" });
            return;
        }
        const newID = await (0, levels_1.createLevelWithID)(name, isCustom ?? true, startingPositions);
        /*
        } else {
            res
            .status(400)
            .json({ error: "events must have valid id or calendar info" });
          return;
        }*/
        if (newID == -1) {
            throw new Error("Could not create level");
        }
        res
            .status(201)
            .json({ newID: newID, message: "Level inserted successfully" });
    }
    catch (err) {
        console.error("DB ERROR:", err);
        res.status(500).json({ error: err });
    }
};
exports.addLevel = addLevel;
const markComplete = async (req, res) => {
    try {
        const user = req.user;
        const levelID = Number(req.params.id);
        const result = await (0, levels_1.markLevelCompleted)(user.id, levelID);
        res.json({ success: result });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to mark level completed" });
    }
};
exports.markComplete = markComplete;
/*
export const addLevels = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      res.status(400).json({ error: "Request body is required" });
      return;
    }

    const { days } = req.body;

    if (!days) {
      res.status(400).json({ error: "Request body must have field 'days'" });
      return;
    }

    const calendarEventsToAdd: Record<number, CalendarEvent[]> = {};
    for (const day of days) {
      const { dayID, events } = day;

      if (!Array.isArray(events)) {
        res.status(400).json({ error: "'events' must be an array" });
        return;
      }

      if (dayID == -1) {
        if (day.calendarInfo) {
          const calendarInfo = day.calendarInfo;
          const { calendarID, calendarDate } = calendarInfo;

          if (calendarID == null || !calendarDate) {
            res.status(400).json({
              error: `calendar info must have calendarID and calendarDate fields ${calendarInfo}`,
            });
          } else {
            const newID = await createDayWithCalendarID(
              calendarID,
              calendarDate,
            );
            calendarEventsToAdd[newID] = events;
          }
        } else {
          res
            .status(400)
            .json({ error: "events must have valid id or calendar info" });
          return;
        }
      } else {
        calendarEventsToAdd[dayID] = events;
      }
    }
    await addEventsToDB(calendarEventsToAdd);

    res.status(201).json({ message: "Events inserted successfully" });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: err });
  }
};


export const getEventsForDay = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const result = await getEventsForDayWithID(id);
    res.json(result);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: err });
  }
};

const getAllComments = async (req: Request, res: Response) => {
  try {
    const result = {}; //await getAllCommentsFromDB();
    res.json(result);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: err });
  }
};*/
/*
const deleteComment = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const successfulDelete = false; //await deleteCommentByID(id);
    if (successfulDelete) {
      res.status(201).json({ message: "Comment deleted successfully" });
    } else {
      throw new Error(
        "Comment with id " +
          id +
          "does not exist or was not deleted successfully.",
      );
    }
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: err });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      res.status(400).json({ error: "Request body is required" });
      return;
    }

    const event = req.body;

    if (event.calendarInfo) {
      const { newCalendarDayID, newDate } = event.calendarInfo;

      if (newCalendarDayID > -1) {
        const eventDayID = await updateEventInDB(event, newCalendarDayID);

        if (eventDayID != -1) {
          res.status(201).json({
            result: eventDayID,
            message: "Event altered successfully for",
          });
          return;
        } else {
          throw new Error(
            "Event does not exist or was not altered successfully.",
          );
        }
      } else {
        if (!newDate) {
          res.status(400).json({
            error: `calendar info must have calendarID and calendarDate fields ${event.calendarInfo}`,
          });
          return;
        } else {
          const newID = await getCalendarDayIDByDate(newDate, 0);
          const eventDayID = await updateEventInDB(event, newID);
          //console.log(successfulAlter);
          if (eventDayID != -1) {
            res
              .status(201)
              .json({
                result: eventDayID,
                message: "Event altered successfully",
              });
            return;
          } else {
            throw new Error(
              "Event does not exist or was not altered successfully.",
            );
          }
        }
      }
    } else {
      const eventDayID = await updateEventInDB(event);
      if (eventDayID != -1) {
        res
          .status(201)
          .json({ result: eventDayID, message: "Event altered successfully" });
        return;
      } else {
        throw new Error(
          "Event does not exist or was not altered successfully.",
        );
      }
    }
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: err });
  }
};
*/
