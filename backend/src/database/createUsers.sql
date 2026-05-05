CREATE TABLE "Users" (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "LevelsCompleted" (    
    "userID" INTEGER NOT NULL,
    "levelID" INTEGER NOT NULL,
    PRIMARY KEY ("levelID", "userID"),
    FOREIGN KEY ("levelID") REFERENCES "Levels"("ID"),
    FOREIGN KEY ("userID") REFERENCES "Users"("id")
);
