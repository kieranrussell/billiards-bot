const matchesData = require("./matches/matches.data-access");
const express = require("express");
const app = express();

let port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  matchesData
    .get()
    .then(data => {
      console.log("Returning data");
      return res.send(JSON.stringify(data));
    })
    .catch(error => {
      console.log(error);
      return res.send(error);
    });
});

app.get("/:name", (req, res) => {
  matchesData
    .get()
    .then(data => {
      console.log("Returning data");
      let match = data.matches.filter(item => {
        return (
          item.player.includes(req.params.name) ||
          item.opponent.includes(req.params.name)
        );
      });
      return res.send(JSON.stringify(match));
    })
    .catch(error => {
      console.log(error);
      return res.send(error);
    });
});

app.listen(port, () => {
  console.log("Server is listening on port " + port);
});
