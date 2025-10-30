// api/src/index.ts

import app from "./server";

const port = 3005;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  console.log("");
  console.log("Routes");
  console.log("************************************************************");
  console.log("Get all users: GET /users");
  console.log("Create a new user: POST /users");
  console.log("Get all positions: GET /positions");
  console.log("Create a new position POST /positions");
  console.log(
    "Get candidates by their id: GET /positions/:positionId/candidates"
  );
  console.log(
    "Create a new candidate: POST /positions/:positionsId/candidates"
  );
  console.log("Create a vote record: POST /vote");
  console.log("Get all votes: N/A");
  console.log("Get votes for a candidate with using an id: N/A");
  console.log("create verification code: PATCH /verification");
});
