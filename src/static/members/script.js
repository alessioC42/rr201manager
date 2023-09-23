const e = (id) => document.getElementById(id);

// Initialize an empty object to store member data.
const memberData = {};

fetch("/api/members").then(response => {
  response.text().then(text => {
    const rawData = JSON.parse(text);

    // Populate the memberData object with member data.
    rawData.forEach(member => {
      memberData[member.id] = member;
    });

    const table = new gridjs.Grid({
      sort: true,
      resizable: true,
      search: true,
      fixedHeader: true,
      height: '80vh',
      width: "98%",
      columns: [
        { name: '_ID', id: 'id', hidden: true },
        { name: "_Vorname", id: "first_name", hidden: true },
        { name: "_Nachname", id: "second_name", hidden: true },
        {
          name: "Name",
          formatter: (_, row) => `${row.cells[2].data}, ${row.cells[1].data}`,
        },
        { name: gridjs.html(`<i class="bi bi-gender-ambiguous"></i>`), id: "gender" },
        { name: "_Geb", id: "birthday", hidden: true },
        { name: "_Alter", id: "age", hidden: true },
        {
          name: "Alter",
          formatter: (_, row) => gridjs.html(`<b>${row.cells[6].data}</b><br>(${(new Date(row.cells[5].data)).toLocaleDateString("de-DE")})`)
        },
        { name: "_Addresse", id: "address", hidden: true },
        { name: "Tel 1", id: "phone", formatter: (tel) => gridjs.html(`<a href="tel:${tel}">${tel}</a>`) },
        { name: "Tel 2", id: "phone2", formatter: (tel) => gridjs.html(`<a href="tel:${tel}">${tel}</a>`) },
        { name: "E-Mail", id: "email", formatter: (mail) => gridjs.html(`<a href="mailto:${mail}">${mail}</a>`) },
        { name: "Funktion", id: "function_level" },
        { name: "Team", id: "team" },
        { name: "Familie", id: "family" },
        { name: "Aktiv", id: "active", formatter: (bin) => ["Nein", "Ja"][Number(bin)] },
        { name: "Lastschrift", id: "debit", formatter: (bin) => ["Nein", "Ja"][Number(bin)] }],
      data: Object.values(memberData), // Use object values to convert the memberData object to an array
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

    table.render(e("tableInHere"));

    const onRowClick = (...args) => {
      //edit member
      const memberId = args[1]._cells[0].data;
      const member = memberData[memberId];

      e("modalDeleteMember").onclick = () => {
        fetch("/api/member/delete?id="+member.id, {method: "DELETE"}).then(_res => {
          e("modalCloseButton").click();
          location.reload();
        })
      }

      e("modal-first_name").value = member.first_name;
      e("modal-second_name").value = member.second_name;
      e("modal-gender").value = member.gender;
      e("modal-birthday").value = member.birthday;
      e("modal-phone").value = member.phone;
      e("modal-phone2").value = member.phone2;
      e("modal-email").value = member.email;
      e("modal-address").value = member.address;
      e("modal-family").value = member.family;
      e("modal-team").value = member.team;
      e("modal-function_level").value = member.function_level;
      e("modal-active").value = String(member.active);
      e("modal-debit").value = String(member.debit);

      e("modalDeleteMember").hidden = false;
      e("openModalHidden").click();
      e("createModalLabel").innerHTML = `Mitglied bearbeiten <i>(ID: ${member.id})</i>`;

      e("modalSaveButton").onclick = () => {
        let team;
        if (e("modal-team").value === "") { team = null } else { team = e("modal-team").value }

        let data = {
          first_name: e("modal-first_name").value,
          second_name: e("modal-second_name").value,
          gender: e("modal-gender").value,
          birthday: e("modal-birthday").value,
          phone: e("modal-phone").value,
          phone2: e("modal-phone2").value,
          email: e("modal-email").value,
          address: e("modal-address").value,
          family: e("modal-family").value,
          team: team,
          function_level: e("modal-function_level").value,
          active: e("modal-active").value,
          debit: e("modal-debit").value,
        }

        fetch(`/api/member/update?id=${member.id}&data=` + decodeURIComponent(JSON.stringify(data)), {
          method: "POST"
        }).then(response => {
          if (response.status === 200) {
            console.log('Before update:', memberData);
            memberData[memberId] = data;
            memberData[memberId].id = memberId;
            memberData[memberId].age = getAge(data.birthday);
            table.updateConfig({
              data: Object.values(memberData)
            })
            table.forceRender();
            console.log('After update:', memberData);

          }
        });
      }
    };

    e("createMemberButton"). onclick = () => {
      e("createModalLabel").innerHTML = `Neues Mitglied erstellen`;

      e("modal-first_name").value = "";
      e("modal-second_name").value = "";
      e("modal-gender").value = "";
      e("modal-birthday").value = "";
      e("modal-phone").value = "";
      e("modal-phone2").value = "";
      e("modal-email").value = "";
      e("modal-address").value = "";
      e("modal-family").value = "create_family";
      e("modal-team").value = "";
      e("modal-function_level").value = "Entdecker";
      e("modal-active").value = String(1);
      e("modal-debit").value = String(0);

      e("modalDeleteMember").hidden = true;

      e("modalSaveButton").onclick = () => {
        let team;
        team = e("modal-team").value === "" ? null : e("modal-team").value;

        let data = {
          first_name: e("modal-first_name").value,
          second_name: e("modal-second_name").value,
          gender: e("modal-gender").value,
          birthday: e("modal-birthday").value,
          phone: e("modal-phone").value,
          phone2: e("modal-phone2").value,
          email: e("modal-email").value,
          address: e("modal-address").value,
          family: e("modal-family").value,
          team: team,
          function_level: e("modal-function_level").value,
          active: e("modal-active").value,
          debit: e("modal-debit").value,
        }

        const createMember = (data) => {
          fetch("/api/member/create?data="+decodeURIComponent(JSON.stringify(data)), {method: "POST"}).then(()=>{
            location.reload();
          })
        }

        if (data.family === "create_family") {
          fetch("/api/family/create/generate?familyname="+decodeURIComponent(data.second_name), {method: "POST"}).then(response => {
            if (response.status === 200) {
              data.family = data.second_name;
              createMember(data);
            } else {
              console.error("error while creating family")
            }
          })
        } else {
          createMember(data)
        }

      }
    }

    table.on('rowClick', (...args) => onRowClick(...args))
  });
});


function loadOptionsFromURL(url, selectID) {
  fetch(url).then(response => response.text().then(responseText => {
    let data = JSON.parse(responseText);
    data.forEach(elem => {
      let option = document.createElement("option");
      option.value = elem;
      option.innerText = elem;
      e(selectID).appendChild(option);
    })
  }))
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

loadOptionsFromURL("/api/familys/list", "modal-family");
loadOptionsFromURL("/api/teams/list", "modal-team");