/*psql -U postgres -d RushHour -p 5433*/

CREATE TABLE "Cars" (
    "ID" SERIAL PRIMARY KEY,
    "color" TEXT NOT NULL,
    "carLength" INTEGER NOT NULL
);

CREATE TABLE "Levels" (
    "ID" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isCustom" BOOLEAN NOT NULL
);

CREATE TABLE "LevelStart" (
    "levelID" INTEGER NOT NULL,
    "carID" INTEGER NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    "isVertical" BOOLEAN NOT NULL,
    PRIMARY KEY ("levelID", "carID"),
    FOREIGN KEY ("levelID") REFERENCES "Levels"("ID"),
    FOREIGN KEY ("carID") REFERENCES "Cars"("ID")
);

INSERT INTO "Cars" (color, "carLength") VALUES ('#154491',3); /*1*/
INSERT INTO "Cars" (color, "carLength") VALUES ('#bc8206',3);
INSERT INTO "Cars" (color, "carLength") VALUES ('#c1a236',3);
INSERT INTO "Cars" (color, "carLength") VALUES ('#39a080',3);

INSERT INTO "Cars" (color, "carLength") VALUES ('#b73601',2); /*5*/
INSERT INTO "Cars" (color, "carLength") VALUES ('#154491',2);
INSERT INTO "Cars" (color, "carLength") VALUES ('#bc8206',2);
INSERT INTO "Cars" (color, "carLength") VALUES ('#dcdf5f',2);
INSERT INTO "Cars" (color, "carLength") VALUES ('#634eab',2);
INSERT INTO "Cars" (color, "carLength") VALUES ('#a9def1',2); /*10*/
INSERT INTO "Cars" (color, "carLength") VALUES ('#398961',2);
INSERT INTO "Cars" (color, "carLength") VALUES ('#95ca38',2);
INSERT INTO "Cars" (color, "carLength") VALUES ('#8778cb',2);
INSERT INTO "Cars" (color, "carLength") VALUES ('#96286d',2);
INSERT INTO "Cars" (color, "carLength") VALUES ('#b3e6b3',2); /*15*/
INSERT INTO "Cars" (color, "carLength") VALUES ('#9ea5b5',2);