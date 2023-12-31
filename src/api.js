const express = require("express");
const betterSQLite3 = require("better-sqlite3");

const api = express.Router();
const db = betterSQLite3(__dirname + "/database.db", { "fileMustExist": true, "verbose": console.log });

const dbQueries = {
    getAllMembers: db.prepare("SELECT * FROM members;"),
    getAllMemberNames: db.prepare("SELECT id, first_name, second_name FROM members;"),
    getSingeMemberByID: db.prepare("SELECT * FROM members WHERE id=?;"),
    addSingleMember: db.prepare("INSERT INTO members (first_name, second_name, gender, birthday, address, email, phone, phone2, function_level, team, family, active, debit) VALUES ($first_name, $second_name, $gender, $birthday, $address, $email, $phone, $phone2, $function_level, $team, $family, $active, $debit);"),
    getAllFamilys: db.prepare("SELECT * FROM familys"),
    getAllFamilyNames: db.prepare("SELECT familyname FROM familys"),
    getAllFamilyMembers: db.prepare("SELECT id, first_name, second_name FROM members WHERE id=?;"),
    deleteMember: db.prepare("DELETE FROM members WHERE id=?;"),
    getSingeFamilyByName: db.prepare("SELECT * FROM familys WHERE familyname=?;"),
    addSingleFamily: db.prepare("INSERT INTO familys (familyname, parent_first_name, parent_second_name, parent_gender, parent_address, parent_email, parent_phone, parent_phone2, generated) VALUES ($familyname, $parent_first_name, $parent_second_name, $parent_gender, $parent_address, $parent_email, $parent_phone, $parent_phone2, $generated);"),
    addGeneratedFamily: db.prepare("INSERT INTO familys (familyname, generated) VALUES (?, 1);"),
    deleteFamily: db.prepare("DELETE FROM familys WHERE familyname=?;"),
    getAllTeams: db.prepare("SELECT teams.*, COUNT(members.team) AS member_count FROM teams LEFT JOIN members ON teams.teamname = members.team GROUP BY teams.teamname;"),
    getAllTeamNames: db.prepare("SELECT teamname FROM teams;"),
    getSingleTeam: db.prepare("SELECT * FROM teams WHERE teamname=?;"),
    getAllTeamMembers: db.prepare("SELECT id FROM members WHERE team=?;"),
    addSingleTeam: db.prepare("INSERT INTO teams (teamname, leader1, leader2, leader3, notes) VALUES ($teamname, $leader1, $leader2, $leader3, $notes)"),
    removeTeamConnections: db.prepare("UPDATE members SET team=NULL WHERE team=?;"),
    deleteTeam: db.prepare("DELETE FROM teams WHERE teamname=?;")
}

/**
 * MEMBERS
 */
api.get("/members", (_req, res) => {
    let data = dbQueries.getAllMembers.all();

    data.forEach((row, i) => {
        data[i].age = getAge(row.birthday)
    })

    res.json(data);
    res.end();
});

api.get("/members/list", (_req, res) => {
    let data = dbQueries.getAllMemberNames.all();
    res.json(data);
    res.end();
});

api.get("/member", (req, res) => {
    try {
        let id = (req.query.id);
        let data = dbQueries.getSingeMemberByID.get(id);
        res.json(data);
        res.end();
    } catch (err) {
        console.log(err)
        res.status(500).end();
    }
});

api.post("/member/create", (req, res) => {
    try {
        let data = JSON.parse(req.query.data);

        if (data.team === "") {
            data.team = null;
        }

        if (!data.family || data.family === "") {
            res.status(500).end();
        } else {
            dbQueries.addSingleMember.run(data);
            res.status(200).end();
        }
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

api.post("/member/update", (req, res) => {
    try {
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

api.delete("/member/delete", (req, res) => {
    //TODO member in tempteam
    try {
        let id = JSON.parse(req.query.id);
        dbQueries.deleteMember.run(id);
        res.status(200).end();
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

/**
 * FAMILYS
 */
api.get("/familys", (_req, res) => {
    let data = dbQueries.getAllFamilys.all();
    res.json(data).status(200).end();
});

api.get("/familys/list", (_req, res) => {
    let data = dbQueries.getAllFamilyNames.all();
    let familys = []
    data.forEach(elem => {
        familys.push(elem.familyname)
    });
    res.json(familys).status(200).end();
})

api.get("/family", (req, res) => {
    try {
        let familyname = (req.query.familyname);
        let data = dbQueries.getSingeFamilyByName.get(familyname);
        res.json(data).status(200).end();
    } catch (err) {
        console.log(err)
        res.status(500).end();
    }
});

api.get("/family/members", (req, res) => {
    let familyname = req.query.familyname;
    let data = dbQueries.getAllFamilyMembers.all(familyname);
    res.json(data).status(200).end();
});

api.post("/family/create", (req, res) => {
    try {
        let data = JSON.parse(req.query.data);

        if (!data.generated) {
            data.generated = 0;
        }

        dbQueries.addSingleFamily.run(data);
        res.status(200).end();
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

api.post("/family/create/generate", (req, res) => {
    try {
        let familyname = (req.query.familyname);

        dbQueries.addGeneratedFamily.run(familyname);
        res.status(200).end();
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
            db.prepare(`UPDATE familys SET ${column}=${escapeSQL(data[column])} WHERE familyname=${familyname};`).run();
        });

        res.status(200).end();
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

api.delete("/family/delete", (req, res) => {
    try {
        let familyname = req.query.familyname;

        let members = dbQueries.getAllFamilyMembers.all(familyname);

        if (members.length >= 1) {
            res.status(400).send(members).end();
        } else {
            dbQueries.deleteFamily.run(familyname);
            res.status(200).end();
        }

    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

/**
 *  TEAMS
 */
api.get("/teams", (_req, res) => {
    let data = dbQueries.getAllTeams.all();

    data.forEach((row, i) => {
        let members = dbQueries.getAllTeamMembers.all(row.teamname);
        let membersToAppend = [];
        members.forEach((row) => {
            membersToAppend.push(row.id);
        });
        data[i].members = membersToAppend;
    })

    res.json(data).status(200).end();
});

api.get("/teams/list", (_req, res) => {
    let data = dbQueries.getAllTeamNames.all();
    let teams = []
    data.forEach(elem => {
        teams.push(elem.teamname)
    });
    res.json(teams).status(200).end();
});

api.get("/team", (req, res) => {
    try {
        let teamname = (req.query.teamname);
        let data = dbQueries.getSingleTeam.get(teamname);
        res.json(data).status(200).end();
    } catch (err) {
        console.log(err)
        res.status(500).end();
    }
});

api.get("/team/members", (req, res) => {
    let teamname = req.query.teamname;
    let data = dbQueries.getAllTeamMembers.all(teamname);
    let returndata = [];
    data.forEach((row) => {
        returndata.push(row.id);
    });
    res.json(returndata).status(200).end();
});

api.post("/team/create", (req, res) => {
    try {
        let data = JSON.parse(req.query.data);
        dbQueries.addSingleTeam.run(data);
        res.status(200).end();
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

api.post("/team/update", (req, res) => {
    try {
        let data = JSON.parse(req.query.data);
        let teamName = req.query.teamname;

        Object.keys(data).forEach((column, _index) => {
            db.prepare(`UPDATE teams SET ${column}=${escapeSQL(data[column])} WHERE teamname=${escapeSQL(teamName)};`).run();
        });

        res.status(200).end();
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

api.delete("/team/delete", (req, res) => {
    try {
        let teamname = req.query.teamname;

        dbQueries.removeTeamConnections.run(teamname);
        dbQueries.deleteTeam.run(teamname);
        res.status(200).end();
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

/**
 *  FUNCTIONS
 */
function escapeSQL(value) {
    if (value == null) { return "NULL" }
    return "'" + String(value).replace(/'/g, "''") + "'";
}

function getAge(dateString) {
    let today = new Date();
    let birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

module.exports = api;