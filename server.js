/**
 * Just for local development.
 */
const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.static('.'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
