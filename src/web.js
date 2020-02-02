const matchesData = require("./matches/matches.data-access");
const express = require("express");
const app = express();

let port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  matchesData
    .api()
    .then(id => res.send(id))
    .catch(err => {
      console.error(err);
      return res.send(err);
    });
});

app.listen(port, () => {
  console.log("Server is listening on port " + port);
});
