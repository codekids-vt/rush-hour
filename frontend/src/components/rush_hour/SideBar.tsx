import { gameState } from "../../../../shared/types";

export default function SideBar({
  currentGameState,
  undoLastMove,
  restartLevel,
  selectNewLevel,
  createCustomLevel,
  usingCam,
  setUsingCam,
}: {
  currentGameState: gameState;
  undoLastMove: () => void;
  restartLevel: () => void;
  selectNewLevel: () => void;
  createCustomLevel: () => void;
  usingCam: boolean;
  setUsingCam: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl h-full bg-white border-2 border-gray-400">
      <div className="flex flex-col p-4 gap-4">
        <button
          className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
          onClick={setUsingCam}
        >
          {usingCam ? "Turn Camera Off" : "Turn Camera On"}
        </button>
        <button
          className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
          onClick={() => {
            console.log("clicked");
            selectNewLevel();
          }}
        >
          Select different level
        </button>
        {/*
        <button
          className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
          onClick={() => {
            //console.log('clicked');
            createCustomLevel();
          }}
        >
          Set custom board
        </button>

        (currentGameState == gameState.attemptingLevel ||
          currentGameState == gameState.levelComplete) && (
          <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
            onClick={() => {
              restartLevel();
            }}
          >
            Restart
          </button>
        )

        currentGameState == gameState.attemptingLevel && (
          <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
            onClick={undoLastMove}
          >
            Undo Last Move
          </button>
        )*/}
      </div>
    </div>
  );
}
