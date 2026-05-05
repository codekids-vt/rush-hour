import { RushHourLevel } from "../../../../shared/types";

export async function getGameLevels(
  authToken: string,
): Promise<RushHourLevel[]> {
  //console.log(authToken);

  const res = await fetch(`http://localhost:3001/api/levels`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to get the days in the period: ${res.status}`);
  }

  const data = await res.json();
  //console.log(data);
  return data;
}

export async function markLevelComplete(
  authToken: string,
  completedLevel: RushHourLevel,
): Promise<RushHourLevel[]> {
  //console.log("Completed level with id", completedLevel.levelID);
  const res = await fetch(
    `http://localhost:3001/api/levels/${completedLevel.levelID}/complete`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}` },
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to get the days in the period: ${res.status}`);
  }

  const data = await res.json();
  return data;
}
