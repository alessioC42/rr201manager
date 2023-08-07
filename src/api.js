const express = require("express");
const betterSQLite3 = require("better-sqlite3");

const api = express.Router();
const db = betterSQLite3(__dirname + "/database.db", { "fileMustExist": true });

const dbQuerrys = {
    getAllMembers:          db.prepare("SELECT * FROM members;"),
    getSingeMemberByID:     db.prepare("SELECT * FROM members WHERE id= ?;"),
    addSingleMember:        db.prepare("INSERT INTO members (first_name, second_name, gender, birthday, address, email, phone, phone2, function_level, team, family) VALUES ($first_name, $second_name, $gender, $birthday, $address, $email, $phone, $phone2, $function_level, $team, $family);"),
    getAllFamilys:          db.prepare("SELECT * FROM familys"),
    getSingeFamilyByName:   db.prepare("SELECT * FROM familys WHERE familyname= ?;"),
    addSingleFamily:        db.prepare("INSERT INTO familys (familyname, parent_first_name, parent_second_name, parent_gender, parent_address, parent_email, parent_phone, parent_phone2, generated) VALUES ($familyname, $parent_first_name, $parent_second_name, $parent_gender, $parent_address, $parent_email, $parent_phone, $parent_phone2, $generated);")
}

/**
 * MEMBERS
 */
api.get("/members", (_req, res) => {
    let data = dbQuerrys.getAllMembers.all();
    res.json(data);
    res.end();
});

api.get("/member", (req, res) => {
    try {
        let id = (req.query.id);
        let data = dbQuerrys.getSingeMemberByID.get(id);
        res.json(data);
        res.end();
    } catch (err) {
        console.log(err)
        res.status(500).end();
    }
});

api.post("/member/create", (req, res) => {
    try {
        let data = JSON.parse(req.querry.data);

        dbQuerrys.addSingleMember.run(data);
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

api.post("/member/update", (req, res) => {
    try {
        console.log(req.query)
        let data = JSON.parse(req.query.data);
        let id = Number(req.query.id);

        Object.keys(data).forEach((column, _index) => {
            db.prepare(`UPDATE members SET ${column}=${escapeSQL(data[column])} WHERE id=${id};`).run();
        });

        res.status(200).end();

    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

/**
 * FAMILY
 */
api.get("/familys", (req, res) => {
    let data = dbQuerrys.getAllFamilys.all();
    res.json(data);
    res.end();
})

api.get("/family", (req, res) => {
    try {
        let familyname = (req.query.familyname);
        let data = dbQuerrys.getSingeMemberByID.get(familyname);
        res.json(data);
        res.end();
    } catch (err) {
        console.log(err)
        res.status(500).end();
    }
});

api.post("/family/create", (req, res) => {
    try {
        let data = JSON.parse(req.querry.data);

        if (!data.generated) {
            data.generated = 0;
        }

        dbQuerrys.addSingleFamily.run(data);
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

api.post("/family/update", (req, res) => {
    try {
        console.log(req.query);
        let data = JSON.parse(req.query.data);
        let familyname = Number(req.query.familyname);

        Object.keys(data).forEach((column, _index) => {
            db.prepare(`UPDATE family SET ${column}=${escapeSQL(data[column])} WHERE familyname=${familyname};`).run();
        });
        
        res.status(200).end();
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

function escapeSQL(value) {
    return "'" + String(value).replace(/'/g, "''") + "'";
}


module.exports = api;