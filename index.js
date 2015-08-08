var moment = require('moment');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var moment = require('moment');
var timetable = require('./lib/timetable');
var utils = require('./lib/utils');

// Configure Express

switch (process.env.NODE_ENV) {
  case 'production':
    app.set('listening ip', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
    app.set('listening port', process.env.OPENSHIFT_NODEJS_PORT || 80);
    break;
  default:
    app.set('listening ip', '0.0.0.0');
    app.set('listening port', 3000);
    break;
}
app.use(bodyParser.json());

// Router

app.get('/', function(req, res) {
  return res.send('Not much to see here.');
});

app.post('/timetable', function(req, res) {
  var errors = [];
  if (req.get('Content-Type') != 'application/json') { return res.status(400).json({ errors: ['Content-Type must be application/json'] }); }
  if (!req.body.hasOwnProperty('projectId') || !utils.isInteger(req.body.projectId)) { errors.push('projectId must exist and be an integer') }
  if (!req.body.hasOwnProperty('resourcesId') || !utils.isInteger(req.body.resourcesId)) { errors.push('resourcesId must exist and be an integer') }
  dateRegex = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/
  if (!req.body.hasOwnProperty('startDate') || !dateRegex.test(req.body.startDate)) { errors.push('startDate must exist and be an ISO 8601 date') }
  else if (new Date(req.body.startDate).getDay() != 1) { errors.push('startDate must be a monday') }
  if (errors.length > 0) { return res.status(400).json({ errors: errors }); }
  
  timetable.get(req.body.projectId, req.body.resourcesId, new Date(req.body.startDate), moment(req.body.startDate).day(6).toDate(), function(err, timetable) {
    if (err) {
      console.log(err);
      return res.status(500).json({errors: ['Error gathering timetable from the UPEC ADE']});
    }
  
    return res.json(timetable);
  });
});

app.use(function(err, req, res, next) {
  res.status(400).send('An error occured: ' + err + '. Check your request.');
});

// Listen

app.listen(app.get('listening port'), app.get('listening ip'));