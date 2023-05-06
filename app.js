const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
//Get Players Api
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `SELECT
 *
 FROM
 cricket_team`;

  const playerArray = await db.all(getPlayerQuery);
  response.send(
    playerArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});
//create player Api
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  const addPlayerQuery = `
    INSERT INTO
      cricket_team
       (player_name,jersey_number,role)
    VALUES
        ('${playerName}', ${jerseyNumber},'${role}');`;
  const dbResponse = await db.run(addPlayerQuery);
  //const playerId = dbResponse.lastId;
  response.send("Player Added to Team");
});
//
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * 
    FROM 
    cricket_team 
    WHERE player_id=${playerId}`;

  const getPlayer = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(getPlayer));
});
//
app.put("/players/:playerId", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const setUpdateQuery = `
    UPDATE
    cricket_team
    SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE
    player_id = ${playerId}`;
  await db.run(setUpdateQuery);
  response.send("Player Details Updated");
});
//
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const setDeleteQuery = `
  DELETE 
  FROM cricket_team 
  WHERE player_id=${playerId}`;
  await db.run(setDeleteQuery);
  response.send("Player Removed");
});
module.exports = app;
