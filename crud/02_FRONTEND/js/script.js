const form = document.forms.query;
const queryInput = form.elements.query;
let isSimpleMode = false;

//запросы для simpleMode
let listOfSimple = [
  ["Вывести таблицу Абонент", "SELECT * FROM ABONENT"],
  ["Вывести таблицу АТС", "SELECT * FROM ATS"],
  ["Вывести таблицу Ведомости звонков", "SELECT * FROM VEDOMOSTZVONKA"],
  ["Выбрать всех абонентов с основным видом телефона", "SELECT * FROM Abonent WHERE VidTelephona = 'основной';"],
  ["Выбрать всех абонентов с льготами", "SELECT * FROM Abonent WHERE Lgota = 'да'"],
  ["Выбрать всех абонентов, кроме тех, у кого закрытый межгород", "SELECT * FROM Abonent WHERE NOT Mezhgorod = 'закрыт';"],
  ["Выбрать абонентов с фамилией, содержащей \"ов\"", "SELECT * FROM Abonent WHERE Familia LIKE '%ов%';"],
  ["Выбрать всех абонентов из АТС с кодами 1, 2 или 3", "SELECT * FROM ATS WHERE KodATS IN (1, 2, 3);"],
  ["Выбрать абонентов, у которых вид телефона является параллельным или спаренным", "SELECT * FROM Abonent WHERE VidTelephona IN ('параллельный', 'спаренный');"],
  ["Выбрать абонентов, у которых количество минут на городские звонки больше или равно 400", "SELECT * FROM VedomostAbonentskoiPlaty WHERE MinutiNaGorodsk >= 400;"],
  ["Выбрать абонентов, у которых цена на городской звонок находится в диапазоне от 2 до 3", "SELECT * FROM PraisATS WHERE CenaNaGorodsk BETWEEN 2 AND 3;"],
  ["Выбрать абонентов с адресом, начинающимся на \"ул.\".", "SELECT * FROM Abonent WHERE Adres LIKE 'ул.%';"],
]
let sideState = '';

//список запросов для отрисовка Last queries чтобы окно не было пустым
let listOfLastQueries = [
  ["SELECT * FROM ABONENT;", "SELECT * FROM ABONENT;"],
  ["SELECT * FROM ATS;", "SELECT * FROM ATS;"],
  ["SELECT * FROM ABONENT WHERE IMIA LIKE 'А%';", "SELECT * FROM ABONENT WHERE IMIA LIKE 'А%';"],
  ["SELECT * FROM Abonent WHERE Lgota = 'да';", "SELECT * FROM Abonent WHERE Lgota = 'да';"]
];

//очистка таблицы хз зачем
document.getElementById("clear").onclick = function clear() {
  const thead = document.getElementById('thead');
  const tbody = document.getElementById('tbody');
  thead.innerHTML = '';
  tbody.innerHTML = '';
}

//заполнение запросов simple mode
function createSimpleModeList(aside) {
  aside.innerHTML = '<h3 style="text-align: center">LIST OF QUERY</h3>'
  for (let i = 0; i < listOfSimple.length; i++) {
    let queryDIV = document.createElement('div');
    queryDIV.className = 'query';
    queryDIV.textContent = listOfSimple[i][0];
    (function (index) {
      queryDIV.addEventListener('click', function () {
        getQueryDefault(listOfSimple[index][1]);
      });
    })(i);
    aside.appendChild(queryDIV);
  }
}

//включение и выключение  simple mode
function changeASide() {
  const aside = document.getElementById('aside');
  if (isSimpleMode) {
    isSimpleMode = false;
    aside.innerHTML = sideState;
    addLastQuery();
  } else {
    isSimpleMode = true;
    sideState = aside.innerHTML;
    createSimpleModeList(aside);
  }
}

//отрисовка главной таблицы после получения данных запроса
function drawTable(data) {
  let info = data.data
  const thead = document.getElementById('thead');
  const tbody = document.getElementById('tbody');

  const tableKeys = Object.keys(info[0])
  let theadHTML = "<tr>";
  for (let i = 0; i <= tableKeys.length - 1; i++) {
    theadHTML += `<th>${tableKeys[i]}</th>`
  }
  theadHTML += "</tr>";

  let tbodyHTML = "";
  for (let i = 0; i <= info.length - 1; i++) {
    tbodyHTML += "<tr>"
    let tableValues = Object.values(info[i]);
    for (let j = 0; j <= tableValues.length - 1; j++) {
      tbodyHTML += `<td>${tableValues[j]}</td>`
    }
    tbodyHTML += "</tr>"
  }
  thead.innerHTML = theadHTML;
  tbody.innerHTML = tbodyHTML;

}

//функция отправки запроса на сервер
function fetchToServer(querySQL) {
  let sqlQueryJSON = JSON.stringify(querySQL);
  fetch("http://localhost:8080/query", {
    method: "POST",
    body: sqlQueryJSON,
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())

    .then((data) => drawTable(data))
    .catch((error) => console.error('Ошибка', error));
}

//вывод таблицы по запросы из последни запросов
function getQueryDefault(query) {
  let querySQL = {
    "sqlQuery": query
  }
  fetchToServer(querySQL)
  if (listOfSimple.map((item) => item[1]).length > 0) {
    addLastQuery([query, listOfSimple.find((item) => item[1] === query)[0]]);
  } else {
    addLastQuery([query, query]);
  }
}

//добавление запроса в список последних и перерисовка
function addLastQuery(query) {
  if (query) {
    let flag = true;
    for (let i = 0; i <= listOfLastQueries.length - 1; i++) {
      if (query[0] === listOfLastQueries[i][0]) {
        flag = false;
      }
    }
    if (flag) {
      listOfLastQueries.unshift(query);
    }

  }
  if (listOfLastQueries.length > 6) {
    listOfLastQueries.pop();
  }
  const lastQueries = document.getElementById('queries');
  lastQueries.innerHTML = '';
  for (let i = 0; i < listOfLastQueries.length; i++) {
    let queryDIV = document.createElement('div');
    queryDIV.className = 'query';
    queryDIV.textContent = listOfLastQueries[i][1].length < 30 ? listOfLastQueries[i][1] : listOfLastQueries[i][1].slice(0, 28) + '...';
    (function (index) {
      queryDIV.addEventListener('click', function () {
        getQueryDefault(listOfLastQueries[index][0]);
      });
    })(i);
    (function (i) {
      queryDIV.addEventListener('mouseover', function () {
        queryDIV.textContent = listOfLastQueries[i][1];
      });
    })(i);
    (function (i) {
      queryDIV.addEventListener('mouseout', function () {
        queryDIV.textContent = listOfLastQueries[i][1].length < 30 ? listOfLastQueries[i][1] : listOfLastQueries[i][1].slice(0, 28) + '...';
      });
    })(i);
    lastQueries.appendChild(queryDIV);
  }
}

// получения полной таблицы по клику на ее имя в списке таблиц, вызывает drawTables
function drawFullTable(table_name) {
  let querySQL = {
    "sqlQuery": `SELECT * FROM ${table_name}`
  }
  fetchToServer(querySQL)
}

//выводит названия всех таблиц в БД в list__tables
function drawListOfTables(data) {
  let listTables = document.getElementById("list__tables");

  let tables = data.data.map((item) => `<div onclick="drawFullTable(encodeURIComponent('${item['TABLE_NAME']}'))" class="table">${item['TABLE_NAME']}</div>`);
  for (let i = 0; i <= tables.length - 1; i++) {
    listTables.innerHTML += tables[i]
  }

}

//получение названия всех таблиц из БД и отрисовка их в drawListOfTables
function getTables() {
  fetch("http://localhost:8080/query", {
    method: "POST",
    body: JSON.stringify({"sqlQuery": "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'"}),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())

    .then((data) => drawListOfTables(data))
    .catch((error) => console.error('Ошибка', error))
}

//на отправку запросы из форму вызвает drawTable которая отрисовывает таблцу
form.addEventListener('submit', (evt) => {
  evt.preventDefault();
  addLastQuery(queryInput.value)
  let querySQL = {
    "sqlQuery": queryInput.value
  }
  fetchToServer(querySQL)
  form.reset();
})

//надо чтобы выводились все таблицы и последние запросы
getTables();
addLastQuery();

