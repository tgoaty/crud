//Импорт модулей и конфига
const http = require(`http`);
const mssql = require('mssql');
const config = require('./config/config');

//счетчик запросов по приколу
let countOfQuery = 1;

//создание сервера и прописывание основных заголовок для запроса, чтобы CORS не ругался
const server = http.createServer(async (req, res) => {
  const url = req.url;
  console.log('Query num', countOfQuery);
  countOfQuery++;
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:63342');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    //проверка метода
  } else if (req.method === 'POST' && url.split('?')[0] === '/query') {
    let requestBody = '';
    //прием пакетов данных
    req.on('data', chunk => {
      requestBody += chunk.toString();
    });
    req.on('end', async () => {
      //создание тела запроса
      try {
        const {sqlQuery} = JSON.parse(requestBody);
        // подключение к SSMS
        await mssql.connect(config);

        const result = await mssql.query(sqlQuery);

        res.writeHead(200, {'Content-Type': 'application/json'});
        //отправка запроса
        res.end(JSON.stringify({success: true, data: result.recordset}))
      } catch (error) {
        console.error(error);
        res.writeHead(500, {'Content-Type': 'application/json'});

        res.end(JSON.stringify({success: false, error: error.message}));
      } finally {
        mssql.close();
      }
    })
  } else {
    res.writeHead(404, {'Content-Type': 'application/json'});

    res.end(JSON.stringify({success: false, error: 'Not Found'}));
  }
})
//запуск сервера на выбранном порту
const port = 8080;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
