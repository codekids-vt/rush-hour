{
  /* Setting a custom level */
}
/*          {currentGameState === gameState.settingCustomLevel && (
            <div className="relative flex flex-col items-center justify-center bg-gray-300 p-2 border-4 border-gray-700 max-w-[408px] min-w-[408px] min-h-[410px]">
              <h5 className="text-3xl text-center my-4">
                Press space to rotate the car
              </h5>
              <button
                className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400 mb-5"
                onClick={handleAddSmallCar}
              >
                Add Small Car
              </button>
              <button
                className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400 mb-5"
                onClick={handleAddLargeCar}
              >
                Add Large Car
              </button>
              <button
                className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400 mb-5"
                onClick={() => {
                  setNewGameState(gameState.attemptingLevel);
                  //do some stuff to reset the graph here
                }}
              >
                Start
              </button>

              <button
                className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400 mb-5"
                onClick={() => {
                  clearCustomLevel();
                }}
              >
                Clear
              </button>

              {
                //custom car color selection
              }
              <div className="grid grid-flow-col grid-rows-2 gap-4">
                {Object.values(carColors)
                  .filter((color) => color !== carColors.red)
                  .map((car_color) => (
                    <button
                      className={`px-4 py-4 bg-${car_color}-500 mb-5`}
                      onClick={() => {
                        setCustomCarColor(car_color);
                      }}
                    ></button>
                  ))}
              </div>

              {/*actual car being added* /}
              {smallCustomCarVisible && !largeCustomCarVisible && (
                <div
                  className={`fixed w-32 h-16 bg-${customCarColor}-500 opacity-75 pointer-events-none`}
                  style={{
                    top: `${customCarY}px`,
                    left: `${customCarX}px`,
                    transform: `translate(-50%, -50%) rotate(${customCarRotation}deg)`,
                    zIndex: 1000, // Ensures it stays above other elements
                  }}
                />
              )}
              {largeCustomCarVisible && !smallCustomCarVisible && (
                <div
                  className={`fixed w-32 h-16 bg-${customCarColor}-500 opacity-75 pointer-events-none`}
                  style={{
                    top: `${customCarY}px`,
                    left: `${customCarX}px`,
                    width: `${64 * 3}px`,
                    height: `${64}px`,
                    transform: `translate(-50%, -50%) rotate(${customCarRotation}deg)`,
                    zIndex: 1000,
                  }}
                />
              )}
            </div>
          )}*/
