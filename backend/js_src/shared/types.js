"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redCarID = exports.cellWidth = exports.gameState = exports.carColors = void 0;
exports.loadAuthState = loadAuthState;
exports.saveAuthState = saveAuthState;
exports.clearAuthState = clearAuthState;
var carColors;
(function (carColors) {
    carColors["blue"] = "#154491";
    carColors["red"] = "#ff0000";
    carColors["yellow"] = "#bc8206";
    carColors["orange"] = "#b73601";
    carColors["darkGreen"] = "#05552e";
    carColors["lightGreen"] = "#33905d";
    carColors["olive"] = "#635e04";
    carColors["purple"] = "purple";
    carColors["pink"] = "pink";
    carColors["teal"] = "#39a080";
    carColors["cyan"] = "cyan";
    carColors["lime"] = "lime";
    carColors["amber"] = "amber";
    carColors["sky"] = "sky";
    carColors["green"] = "emerald";
})(carColors || (exports.carColors = carColors = {}));
var gameState;
(function (gameState) {
    gameState[gameState["attemptingLevel"] = 0] = "attemptingLevel";
    gameState[gameState["levelComplete"] = 1] = "levelComplete";
    gameState[gameState["settingCustomLevel"] = 2] = "settingCustomLevel";
    gameState[gameState["selectingLevel"] = 3] = "selectingLevel";
    gameState[gameState["settingLevelUp"] = 4] = "settingLevelUp";
})(gameState || (exports.gameState = gameState = {}));
exports.cellWidth = 63.333;
exports.redCarID = 5;
const STORAGE_KEY = "rushHourAuth";
function loadAuthState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
        return { user: null, token: null };
    try {
        return JSON.parse(raw);
    }
    catch {
        return { user: null, token: null };
    }
}
function saveAuthState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function clearAuthState() {
    localStorage.removeItem(STORAGE_KEY);
}
