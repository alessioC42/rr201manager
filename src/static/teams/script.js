const e = (id) => document.getElementById(id)

var teams;
var teams_dict = {}
var members;
var members_dict = {}
var table;

async function loadTable() {
  teams = JSON.parse(await (await fetch("/api/teams")).text());

  teams.forEach((team, i) => {
    teams[i].leader1_name = parseMemberString(team, members_dict, "leader1");
    teams[i].leader2_name = parseMemberString(team, members_dict, "leader2");
    teams[i].leader3_name = parseMemberString(team, members_dict, "leader3");

    teams_dict[team.teamname] = team;
  });

  table = new gridjs.Grid({
    fixedHeader: true,
    search: true,
    fixedHeader: true,
    height: '80vh',
    width: "98%",
    columns: [
      { name: '_leader1', id: 'leader1', hidden: true },
      { name: '_leader2', id: 'leader2', hidden: true },
      { name: '_leader3', id: 'leader3', hidden: true },
      { name: 'Team', id: 'teamname' },
      {
        name: 'Leiter A',
        id: 'leader1_name',
        formatter: (field, row) => gridjs.html(`<a href="/members/?show=${row.cells[0].data}">${field}</a>`)
      },
      {
        name: 'Leiter B',
        id: 'leader2_name',
        formatter: (field, row) => gridjs.html(`<a href="/members/?show=${row.cells[1].data}">${field}</a>`)
      },
      {
        name: 'Leiter C',
        id: 'leader3_name',
        formatter: (field, row) => gridjs.html(`<a href="/members/?show=${row.cells[2].data}">${field}</a>`)
      },
      { name: "Mitglieder", id: "member_count" },
      { name: "Notizen", id: "notes" }
    ],
    data: teams,
    style: {
      th: {
        'text-align': 'center',
        th: {
          'background-color': 'rgba(0, 0, 0, 0.1)',
          color: '#000',
          'border-bottom': '3px solid #ccc',
          'text-align': 'center'
        },
        td: {
          'text-align': 'center'
        }
      },
      td: {
        'text-align': 'center'
      }
    }
  });
  table.render(e("tableInHere"))

  table.on('rowClick', onRowClick);


}

function loadMembersInTeamInput() {
  let selects = [
    document.getElementById("modal-leader1"),
    document.getElementById("modal-leader2"),
    document.getElementById("modal-leader3"),
  ]

  members.forEach(member => {
    members_dict[member.id] = member;
    selects.forEach(select => {
      let option = document.createElement("option");
      option.value = member.id;
      option.innerText = `${member.first_name} ${member.second_name}`;
      select.appendChild(option);
    });
  });
}

fetch("/api/members/list").then(response => response.text().then(text => {
  members = JSON.parse(text);
  loadTable();
  loadMembersInTeamInput();
}));

function parseMemberString(team, members_dict, field) {
  if (team[field]) {
    return `${members_dict[team[field]].first_name} ${members_dict[team[field]].second_name}`;
  } else {
    return null
  }
}

function onRowClick(...args) {
  e("modalDeleteTeam").hidden = false;
  e("modal-teamname").setAttribute("disabled", "true");

  let team = teams_dict[args[1]._cells[3].data];

  e("modal-teamname").value = team.teamname
  e("modal-leader1").value = team.leader1;
  e("modal-leader2").value = team.leader2;
  e("modal-leader3").value = team.leader3;
  e("modal-notes").value = team.notes ;
  e("openModalHidden").click();
};


e("createTeamButton").onclick = onNewTeamClick;
function onNewTeamClick() {
  e("modalDeleteTeam").hidden = true;
  e("modal-teamname").removeAttribute("disabled");

  e("modal-teamname").value = "";
  e("modal-leader1").value = "null";
  e("modal-leader2").value = "null";
  e("modal-leader3").value = "null";
  e("modal-notes").value = "";

  e("modalSaveButton").onclick = () => {
    fetch("/api/team/create?data=" + encodeURIComponent(JSON.stringify({
      teamname: e("modal-teamname").value,
      leader1: e("modal-leader1").value,
      leader2: e("modal-leader2").value,
      leader3: e("modal-leader3").value,
      notes: e("modal-notes").value
    })), { method: "POST" });
  }
}