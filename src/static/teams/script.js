const e = (id) => document.getElementById(id)

fetch("/api/members").then(response => {
  response.text().then(text => {
    var memberData = JSON.parse(text);

    const table = new gridjs.Grid({
      sort: true,
      resizable: true,
      fixedHeader: true,
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
          formatter: (_, row) => gridjs.html(`<b>${row.cells[6].data}</b><br>(${row.cells[5].data})`)
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
      data: memberData,
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
    })
    table.render(e("tableInHere"))

    const onRowClick = (...args) => {
      //edit member
      let d = memberData[args[1]._cells[0].data - 1];

      e("modalDeleteMember").onclick = () => {
        fetch("/api/member/delete?id="+d.id, {method: "DELETE"}).then(res => {
          e("modalCloseButton").click()
        })
      }

      e("modal-first_name").value = d.first_name;
      e("modal-second_name").value = d.second_name;
      e("modal-gender").value = d.gender;
      e("modal-birthday").value = d.birthday;
      e("modal-phone").value = d.phone;
      e("modal-phone2").value = d.phone2;
      e("modal-email").value = d.email;
      e("modal-address").value = d.address;
      e("modal-family").value = d.family;
      e("modal-team").value = d.team;
      e("modal-function_level").value = d.function_level;
      e("modal-active").value = String(d.active);
      e("modal-debit").value = String(d.debit);

      e("modalDeleteMember").hidden = false;
      e("openModalHidden").click();
      e("createModalLabel").innerHTML = `Mitglied bearbeiten <i>(ID: ${d.id})</i>`;

      e("modalSaveButton").onclick = () => {
        let team;
        if (e("modal-team").value == "") { team = null } else { team = e("modal-team").value }

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

        fetch(`/api/member/update?id=${d.id}&data=` + decodeURIComponent(JSON.stringify(data)), {
          method: "POST"
        }).then(response => {
          if (response.status == 200) {
            memberData[d.id - 1] = data;
            memberData[d.id - 1].age = getAge(data.birthday);
            memberData[d.id - 1].id = d.id
            table.forceRender()
          }
        });
      }
    };

    e("createMemberButton"). onclick = () => {
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
        if (e("modal-team").value == "") { team = null } else { team = e("modal-team").value }

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
          fetch("/api/member/create?data="+decodeURIComponent(JSON.stringify(data)), {method: "POST"});
          location.reload()
        }

        if (data.family == "create_family") {
          fetch("/api/family/create/generate?familyname="+decodeURIComponent(data.second_name), {method: "POST"}).then(response => {
            if (response.status == 200) {
              data.family = data.second_name;
              createMember(data);
            } else {
              console.error("error while createing family")
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
  var today = new Date();
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}


loadOptionsFromURL("/api/familys/list", "modal-family");
loadOptionsFromURL("/api/teams/list", "modal-team");