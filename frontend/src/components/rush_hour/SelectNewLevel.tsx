import { RushHourLevel } from "../../../../shared/types";

export default function SelectNewLevelUI({
  gameLevels,
  loadNewLevel,
  numToDifficulty,
}: {
  gameLevels: RushHourLevel[];
  loadNewLevel: (levelNum: number) => void;
  numToDifficulty: (difficulty: number) => string[];
}) {
  return (
    <div className="flex flex-col gap-2 p-4 border-2 border-gray-400 box-border w-full h-full overflow-y-auto min-h-0">
      <h1 className="text-3xl text-center my-4">Select a new level</h1>

      <div className="grid grid-cols-10 gap-3">
        {gameLevels.map((lvl, i) => {
          const lvlNum = i + 1;
          const lvlDifficulty = Math.trunc(i / 10);

          return (
            <button
              key={i}
              className={
                `aspect-square w-16 ${lvl.isComplete ? "text-[#e4c03d]" : "text-white"} rounded-lg text-lg font-semibold` // hover:bg-${
                //numToDifficulty(lvlDifficulty)[1]
                //}-500 transition`
              }
              style={{
                backgroundColor: lvl.isComplete
                  ? "#217e2b"
                  : numToDifficulty(lvlDifficulty)[1],
              }}
              onClick={() => {
                console.log(lvl);
                console.log(lvlNum);
                loadNewLevel(lvlNum);
              }}
            >
              {lvlNum}
            </button>
          );
        })}
      </div>
    </div>
  );
}
