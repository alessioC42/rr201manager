const e = (id) => document.getElementById(id)

async function loadTable() {
  let teams = JSON.parse(await (await fetch("/api/teams")).text());
  let members = JSON.parse(await (await fetch("/api/members/list")).text())

  teams.forEach((team, i) => {
    teams[i].leader1_name = parseMemberString(team, members, "leader1");
    teams[i].leader2_name = parseMemberString(team, members, "leader2");
    teams[i].leader3_name = parseMemberString(team, members, "leader3");
  });
  console.log(teams);

  const table = new gridjs.Grid({
    fixedHeader: true,
    search: true,
    fixedHeader: true,
    height: '80vh',
    width: "98%",
    columns: [
      { name: '_ID', id: 'id', hidden: true },
      { name: '_leader1', id: 'leader1', hidden: true },
      { name: '_leader2', id: 'leader2', hidden: true },
      { name: '_leader3', id: 'leader3', hidden: true },
      { name: 'Team', id: 'teamname' },
      { 
        name: 'Leiter A', 
        id: 'leader1_name',
        formatter: (field, row) => gridjs.html(`<a href="/members/?show=${row.cells[1].data}">${field}</a>`)
      },
      { 
        name: 'Leiter B', 
        id: 'leader2_name',
        formatter: (field, row) => gridjs.html(`<a href="/members/?show=${row.cells[2].data}">${field}</a>`)
      },
      { 
        name: 'Leiter C', 
        id: 'leader3_name',
        formatter: (field, row) => gridjs.html(`<a href="/members/?show=${row.cells[3].data}">${field}</a>`)
      },
      { name: "Mitglieder", id: "member_count" },
      { name: "Notizen", id: "notes"}
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
}




function parseMemberString(team, members, field) {
  if (team[field]) {
    return `${members[team[field]].first_name} ${members[team[field]].second_name}`;
  } else {
    return null
  }
}

loadTable()