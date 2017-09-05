var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var _ = require('underscore');
var sql = require('mssql');

var mssqlWMSConfig = require('./src/data/mssqlWMSConfig.json');
var queries = require('./src/data/queries.json');

sql.connect(mssqlWMSConfig, function (err) {
    if (err) { console.log(err); } else {
      console.log('Connected to WMS');
    }
  });

app.use(express.static(__dirname + '/node_modules'));
app.get('/', function (req, res, next) {
  res.sendFile(__dirname + '/countdown.html');
});

var countdown = 1000;

//these are seconds when 1000ms is the setInterval interval

setInterval(function () {
  countdown--;
  io.sockets.emit('timer', { countdown: 1000 - countdown });
}, 1000);

io.sockets.emit('query', 'Loading');

io.sockets.on('connection', function (socket) {
  console.log('Client connected...');



  setInterval(function () {
    var summaryData = new sql.Request();

    var queryData = summaryData.query(queries.summaryQuery,
      function (err, recordset) {
            var queryData = recordset.recordset;
            if (err) { console.log(err); } else { console.log(queryData[0].Data); }

            //return queryData;
            // var ordersData =_.where(queryData[0], {Label: 'Data'});
            // console.log(ordersData);

            io.sockets.emit('query', { queryData: queryData[0].Data });
          });
  }, 30000);

  socket.on('join', function (data) {
      console.log(data);
    });

  socket.on('reset', function (data) {
    console.log(data + ' Pressed!');
    countdown = 1000;
    io.sockets.emit('timer', { countdown: 1000 - countdown });
  });
});

server.listen(4400);
