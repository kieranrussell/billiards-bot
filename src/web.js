const matchesData = require("./matches/matches.data-access");
const express = require("express");
const app = express();

let port = process.env.PORT || 3000;

app.get("/test", (req, res) => {
  matchesData
    .api()
    .then(id => res.send(id))
    .catch(err => {
      console.error(err);
      return res.send(err);
    });
});

app.get("/", (req, res) => {
  matchesData
    .get()
    .then(data => {
      console.log("Returning data");
      return res.send(JSON.stringify(data));
    })
    .catch(err => {
      console.error(err);
      return res.send(err);
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
    .catch(err => {
      console.error(err);
      return res.send(err);
    });
});

app.listen(port, () => {
  console.log("Server is listening on port " + port);
});
