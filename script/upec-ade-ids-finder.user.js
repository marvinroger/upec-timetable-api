// ==UserScript==
// @name        UPEC ADE IDs finder
// @namespace   upec-ade-ids-finder
// @include     https://ade.u-pec.fr/direct*
// @version     1
// @grant       none
// ==/UserScript==

(function() {
  // Inject block in page
  
  var builder = [];
  builder.push('<div id="but-infos" style="position: absolute; top: 0px; right: 0px; width: 120px; height: auto; box-sizing: border-box; padding: 5px; background-color: rgba(0, 0, 0, .5); border-radius: 10px 0px 0px 10px; color: white; z-index: 9999;">');
  builder.push('<b>projectId: </b><span id="but-project-id">?</span><br>');
  builder.push('<b>resourceId: </b><span id="but-resource-id">?</span>');
  builder.push('</div>');
  prepend(document.body, builder.join('\n'));
  
  // Detect querystring
  
  var projectId = getQueryVariable('projectId');
  var resourceId = getQueryVariable('resources');
  if (projectId) { updateHtml(document.getElementById('but-project-id'), projectId); }
  if (resourceId) { updateHtml(document.getElementById('but-resource-id'), resourceId); }
})();

// Intercept POST requests content

(function(send) {
  XMLHttpRequest.prototype.send = function(body) {

    if (body.indexOf("loadProject") > -1) {
      var splitted = body.split("|");
      var projectId = splitted[splitted.length - 3];
      updateHtml(document.getElementById('but-project-id'), projectId);
    }
    
    if (body.indexOf("getLegends") > -1) {
      var splitted = body.split("|NAME|");
      var interesting = splitted.pop();
      var data = interesting.split("|");
      var resourceId = data[30];
      updateHtml(document.getElementById('but-resource-id'), resourceId);
    }

    send.call(this, body);
  };

})(XMLHttpRequest.prototype.send);

// Helpers

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  
  return null;
}

function prepend(parent, html) {
  var elementWrapper = document.createElement('div');
  elementWrapper.innerHTML = html;
  var element = elementWrapper.firstChild;
  
  parent.insertBefore(element, parent.firstChild);
}

function updateHtml(element, html) {
  element.innerHTML = html;
}