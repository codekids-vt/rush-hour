import { error } from "console";
import { controller } from "../../database/db";
import { Car, RushHourLevel } from "@shared/types";

export async function getLevelWithID(id: number): Promise<RushHourLevel> {
  const result = await controller.query(
    `SELECT * FROM "Levels"
    WHERE
    "ID" = $1`,
    [id],
  );

  if (result.rowCount == 0) {
    throw new Error(`No event found with ID ${id}`);
  }

  const row = result.rows[0];

  const required_fields = ["ID", "name", "is_custom"];

  for (const r_field of required_fields) {
    if (!(r_field in row)) {
      throw new Error(
        `Car doesn't contain all fields. ${row} is missing ${r_field}`,
      );
    }
  }

  const carsInLevel = await controller.query(
    `SELECT * FROM "LevelStart"
    WHERE
    "levelID" = $1`,
    [id],
  );

  if (result.rowCount == 0) {
    return {
      levelID: row?.id ?? -1,
      levelName: row?.name ?? "Err",
      isCustom: row?.is_custom ?? false,
      startingPositions: [],
    };
  }

  const returnedLevel: RushHourLevel = {
    levelID: row?.id ?? -1,
    levelName: row?.name ?? "Err",
    isCustom: row?.is_custom ?? false,
    startingPositions: carsInLevel.rows as Car[], //TODO: fix so it's in the right format
  };

  return returnedLevel;
}

export async function createLevelsWithID(
  levels: RushHourLevel[],
): Promise<RushHourLevel[]> {
  const res = await Promise.all(
    levels.map(async (level) => {
      return await createLevelWithID(
        level.levelName,
        level.isCustom,
        level.startingPositions,
      );
    }),
  );

  return levels.map((l, i) => {
    return { ...l, levelID: res[i] };
  });
}

export async function createLevelWithID(
  name: string,
  isCustom: boolean,
  startingPositions: Car[],
): Promise<number> {
  try {
    const res = await controller.query(
      `INSERT INTO "Levels" 
    (name, "isCustom")
    VALUES
    ($1, $2) RETURNING "ID";`,
      [name, isCustom],
    );
    console.log(res);

    return res?.rows[0]?.ID ?? -1;
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error inserting into database:", err.message);
    } else {
      console.error("Error inserting into database:", err);
    }
  }

  return -1;
}

/*
export async function getEventsForDayWithID(
  id: number,
): Promise<CalendarEvent[]> {
  const result = await controller.query(
    `SELECT * FROM calendarevent WHERE calendardayid = $1`,
    [id],
  );

  if (result.rowCount == 0) {
    //throw new Error(`No event found for day with ID ${id}`);
    return [];
  }

  const allResults = result.rows;

  const required_fields = [
    "id",
    "calendardayid",
    "eventtitle",
    "eventhour",
    "eventminute",
    "eventisam",
    "eventlocation",
    "createdbyid",
  ];

  const allEvents = await Promise.all(
    allResults.map(async (row) => {
      for (const r_field of required_fields) {
        if (!(r_field in row)) {
          throw new Error(
            `Event ${row} doesn't contain all fields. ${row} is missing ${r_field}`,
          );
        }
      }

      const returnedEvent: CalendarEvent = {
        id: row.id,
        title: row.eventtitle,
        time: {
          hour: row.eventhour,
          minute: row.eventminute,
          isAM: row.eventisam,
        },
        location: row.eventlocation,
        createdBy: { id: row.createdbyid } as FamilyIndividual,
        notes: row.eventnotes ?? "",
      };

      if (row.forid) {
        const forResult = await controller.query(
          `SELECT * FROM familyindividuals WHERE id = $1`,
          [row.forid],
        );

        if (forResult.rows.length > 0) {
          const r = forResult.rows[0];

          const forIndividual: FamilyIndividual = {
            id: r.id,
            role: r.role,
            name: r.name,
            canDrive: r.candrive,
            canEditCalendar: r.canedit,
            ...(r.colorstr && { colorStr: r.colorstr }),
          };

          returnedEvent.for = { ...forIndividual };
        }
      }

      try {
        const vehicleSituation = await getTransportationWithEventID(row.id);

        returnedEvent.drivingSituation = { ...vehicleSituation };
      } catch {
        //console.log("no vehicle situation for event");
      }

      return returnedEvent;
    }),
  );

  return allEvents;
}

export async function addEventsToDB(
  events: Record<number, CalendarEvent[]>,
): Promise<void> {
  try {
    await Promise.all(
      Object.entries(events).flatMap(([dayID, eventsOnDay]) => {
        return eventsOnDay.map((event) => {
          return controller.query(
            `INSERT INTO CalendarEvent 
            (calendardayid, eventtitle, eventhour, eventminute, 
            eventisam, eventlocation, eventnotes, createdbyid${event.for ? ", forid" : ""}) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8${event.for ? ", $9" : ""});`,
            [
              //event.id,
              dayID,
              event.title,
              event.time.hour,
              event.time.minute,
              event.time.isAM,
              event.location,
              event.notes,
              event.createdBy.id,
              ...(event.for ? [event.for.id] : []),
            ],
          );
        });
      }),
    );
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Error while inserting events: ${err.message}`);
    }
    throw new Error(`Error while inserting events: ${String(err)}`);
  }
}

async function deleteCommentByID(id: number): Promise<boolean> {
  const result = await controller.query(
    `DELETE FROM public."Comments"
    WHERE id = $1
    RETURNING *;`,
    [id],
  );

  if (result.rows.length === 0) {
    return false;
  }

  return true;
}

export async function updateEventInDB(
  event: CalendarEvent,
  calendarDayID?: number,
): Promise<Number> {
  const result = await controller.query(
    `UPDATE calendarevent
    SET
      eventtitle = $2,
      eventhour = $3,
      eventminute = $4,
      eventisam = $5,
      eventlocation = $6,
      createdbyid = $7,
      eventnotes = $8
      ${event.for ? `, forid = $9` : ""}
      ${
        calendarDayID != null
          ? `, calendardayid = ${event.for ? "$10" : "$9"}`
          : ""
      }

    WHERE id = $1
    RETURNING *;`,
    [
      event.id,
      event.title,
      event.time.hour,
      event.time.minute,
      event.time.isAM,
      event.location,
      event.createdBy.id,
      ...(event.notes ? [event.notes] : [null]),
      ...(event.for && Object.keys(event.for).length > 0 ? [event.for.id] : []),
      ...(calendarDayID != null ? [calendarDayID] : []),
    ],
  );

  if (result.rows.length == 0) {
    return -1;
  }

  return result.rows[0]?.calendardayid ?? -1;
}
*/
