function HomeView(){
}

HomeView.prototype.render = function($el){
  var $homeView = $('<div class="home-view"><h1>Scripts</h1></div>');
  $el.append($homeView);

  var $spinner = $('<div style="text-align:center;margin-top:30px;">'+
        '<div class="loading-spinner"></div>'+
      '</div>');
  $homeView.append($spinner);

  $.get('/api/scripts').done(function(rsp){
    $spinner.remove();

    var $scriptTable = $('<table>'+
        '<thead><tr><th>Script Name</th></tr></thead>'+
        '<tbody></tbody>'+
      '</table>');
    $homeView.append($scriptTable);

    var $scriptTableBody = $scriptTable.find('tbody');
    rsp.list.forEach(function(scriptName){
      var scriptDisplayName = Script.prototype.getDisplayName.call({name:scriptName});

      $scriptTableBody.append('<tr>'+
          '<td><a href="/scripts/'+scriptName+'">'+scriptDisplayName+'</a></td>'+
        '</tr>');
    });
  });
};
