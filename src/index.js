const express = require("express");

const api = require("./api");

const app = express();

app.use("/", express.static(__dirname + "/static"));
app.use("/bootstrap", express.static(__dirname + "/node_modules/bootstrap/dist"));
app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist"));
app.use("/api", api)

app.listen(3001, () => {
    console.log("running...");
});
