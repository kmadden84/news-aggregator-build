
const express = require('express');
const router = express.Router();
const app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
require('dotenv').config();
const path = require('path');
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';
const fetch = require('node-fetch');
const apiKey = process.env.apiKey;

app.use(bodyParser.json());

app.use(cors());

app.use('/', router);

function requireHTTPS(req, res, next) {
  // The 'x-forwarded-proto' check is for Heroku
  if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}

app.use(requireHTTPS);

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/build/index.html'));
});



router.post('/topheadlines', (req, res, next) => {
  var pageNum = req.body.pageNum;
  fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=20&page=${pageNum}&apiKey=${apiKey}`, {
  }).then((response) => response.json())
    .then((data) => {
      return res.json(data);
    })
    .catch(err => console.log(err))
})


router.post('/fetchitems', (req, res, next) => {
  var url = req.body.url
  console.log(url)
  fetch(url + '&apiKey=' + apiKey, {
  }).then((response) => response.json())
    .then((data) => {
      return res.json(data);
    })
    .catch(err => console.log(err))
})



app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});

module.exports = router;
