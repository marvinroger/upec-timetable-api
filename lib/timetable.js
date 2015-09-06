process.env.TZ = 'Europe/Paris';

var ADE_URL = 'https://ade.u-pec.fr/jsp/custom/modules/plannings/anonymous_cal.jsp';

var ical = require('ical');
var moment = require('moment');

var get = function(options, cb) {
  var projectId = options.projectId;
  var resourcesId = options.resourcesId;
  var startDate = options.startDate;
  var endDate = options.endDate;

  var firstDate = moment(startDate).format('YYYY-MM-DD');
  var lastDate = moment(endDate).format('YYYY-MM-DD');

  ical.fromURL(ADE_URL + '?projectId=' + projectId + '&resources=' + resourcesId + '&firstDate=' + firstDate + '&lastDate=' + lastDate + '&calType=ical', {}, function(err, data) {
    if (err) return cb(err, null);

    var timetable = { projectId: projectId, resourcesId: resourcesId, fromDate: firstDate, toDate: lastDate, eventsCount: 0, timetable: []};

    var numberOfDays = moment(endDate).diff(startDate, 'days') + 1;
    var daysIndexes = {};
    
    for (var i = 0; i < numberOfDays; i++) { // Add each day to the timetable
      var day = moment(startDate).add(i, 'days').format('YYYY-MM-DD');
      daysIndexes[day] = i;
      timetable.timetable.push({ day: day, events: [] });
    }
    
    for (var key in data) { // Sort events per day and strip unnecessary data
      if (data.hasOwnProperty(key)) {
        var event = data[key];
        var day = moment(event.start).format('YYYY-MM-DD');

        timetable.timetable[daysIndexes[day]].events.push({
          summary: event.summary,
          description: event.description,
          start: event.start,
          end: event.end,
          location: event.location
        });
        timetable.eventsCount++;
      }
    }

    for (var i = 0; i < timetable.timetable.length; i++) { // Sort events in ascending order per day
      timetable.timetable[i].events.sort(function(a, b) {
        return a.start  - b.start;
      });
    }

    return cb(null, timetable);
  });
};

module.exports = {
  get: get
};