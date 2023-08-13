const express = require("express");

const api = require("./api");

const app = express();

app.use("/", express.static(__dirname + "/static"));
app.use("/bootstrap", express.static(__dirname + "/node_modules/bootstrap/dist"));
app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist"));
app.use("/bootstrap-table", express.static(__dirname + "/node_modules/bootstrap-table/dist"));
app.use("/bootstrap-icons", express.static(__dirname + "/node_modules/bootstrap-icons"));
app.use("/gridjs", express.static(__dirname + "/node_modules/gridjs/dist/"))
app.use("/api", api);

app.listen(3001, () => {
    console.log("running...");
});
