process.env.TZ = 'Europe/Paris';

var ADE_URL = 'https://ade.u-pec.fr/jsp/custom/modules/plannings/anonymous_cal.jsp';

var ical = require('ical');

var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
var orderedDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

var get = function(projectId, resourcesId, fromDate, toDate, cb) {
  var firstDate = fromDate.getFullYear() + '-' +
                  ('0' + (fromDate.getMonth()+1)).slice(-2) + '-' +
                  ('0' + fromDate.getDate()).slice(-2);
  var lastDate = toDate.getFullYear() + '-' +
                  ('0' + (toDate.getMonth()+1)).slice(-2) + '-' +
                  ('0' + toDate.getDate()).slice(-2);
  ical.fromURL(ADE_URL + '?projectId=' + projectId + '&resources=' + resourcesId + '&firstDate=' + firstDate + '&lastDate=' + lastDate + '&calType=ical', {}, function(err, data) {
    if (err) return cb(err, null);

    var timetable = { projectId: projectId, resourcesId: resourcesId, fromDate: firstDate, toDate: lastDate, timetable: []};

    for (var i = 0; i <= 6; i++) { // Add each day to the timetable
      timetable.timetable.push({ day: orderedDays[i], events: [] });
    }
    
    for (var key in data) { // Sort events per day and strip unnecessary data
      if (data.hasOwnProperty(key)) {
        var event = data[key];
        var day = orderedDays.indexOf(days[event.start.getDay()]);
        timetable.timetable[day].events.push({
          summary: event.summary,
          description: event.description,
          start: event.start,
          end: event.end,
          location: event.location
        });
      }
    }

    for (var i = 0; i <= 6; i++) { // Sort events in ascending order per day
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