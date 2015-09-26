function TestsView(){
}

TestsView.categories = [];

// ScriptView replaceInLine tests
TestsView.categories.push((function(){

  var makeTestLine = function(){
    return {
      timestamp: "0:02:28",
      text: "のんびり長閑なところまん",
      words: [
        {text: "のん"},
        {text: "びり"},
        {text: "長閑"},
        {text: "な"},
        {text: "ところ"},
        {text: "まん"}
      ]
    };
  };

  return {
    name: "ScriptView replaceInLine",
    tests: [

    {
      name: "one word",
      fn: function(){
        var word = {text: "TEST"};
        var line = makeTestLine();
        var pos = 2;
        var selText = "びり";

        ScriptView.prototype.replaceWordInLine(word, line, pos, selText);

        if (line.words[0].text === "のん" &&
            line.words[1].text === "TEST" &&
            line.words[2].text === "長閑"){
          return true;
        }

        return false;
      }
    },
    {
      name: "first word",
      fn: function(){
        var word = {text: "TEST"};
        var line = makeTestLine();
        var pos = 0;
        var selText = "のん";

        ScriptView.prototype.replaceWordInLine(word, line, pos, selText);

        if (line.words[0].text === "TEST" &&
            line.words[1].text === "びり" &&
            line.words[2].text === "長閑"){
          return true;
        }

        return false;
      }
    },
    {
      name: "two words",
      fn: function(){
        var word = {text: "TEST"};
        var line = makeTestLine();
        var pos = 0;
        var selText = "のんびり";

        ScriptView.prototype.replaceWordInLine(word, line, pos, selText);

        if (line.words[0].text === "TEST" &&
            line.words[1].text === "長閑"){
          return true;
        }

        return false;
      }
    },
    {
      name: "partial word",
      fn: function(){
        var word = {text: "TEST"};
        var line = makeTestLine();
        var pos = 8;
        var selText = "ころ";

        ScriptView.prototype.replaceWordInLine(word, line, pos, selText);

        if (line.words[4].text === "と" &&
            line.words[5].text === "TEST" &&
            line.words[6].text === "まん"){
          return true;
        }

        return false;
      }
    },
    {
      name: "partial of two",
      fn: function(){
        var word = {text: "TEST"};
        var line = makeTestLine();
        var pos = 1;
        var selText = "んび";

        ScriptView.prototype.replaceWordInLine(word, line, pos, selText);

        if (line.words[0].text === "の" &&
            line.words[1].text === "TEST" &&
            line.words[2].text === "り" &&
            line.words[3].text === "長閑"){
          return true;
        }
        console.log(line.words.map(function(word){return word.text}).join(","))

        return false;
      }
    },
    {
      name: "partial and whole",
      fn: function(){
        var word = {text: "TEST"};
        var line = makeTestLine();
        var pos = 1;
        var selText = "んびり";

        ScriptView.prototype.replaceWordInLine(word, line, pos, selText);

        if (line.words[0].text === "の" &&
            line.words[1].text === "TEST" &&
            line.words[2].text === "長閑"){
          return true;
        }

        return false;
      }
    },

    ]
  };
})());

// render function
TestsView.prototype.render = function($el){
  var $testsView = $('<div class="tests-view"></div>');
  $el.appendChild($testsView[0]);

  $testsView.html('<h1>Tests</h1>');

  TestsView.categories.forEach(function(category){
    var $category = $('<div class="tests-category"><h2>'+category.name+'</h2></div>');
    $testsView.append($category);

    category.tests.forEach(function(test){
      var $test = $('<div class="tests-test"><span class="result"></span><span>'+test.name+'</span></div>');
      $category.append($test);

      setTimeout(function(){
        try {
          if (test.fn()) {
            $test.find('.result').html('<span style="color:green;">✓</span>');
          } else {
            $test.find('.result').html('<span style="color:red;">✗</span>');
          }
        } catch (e) {
          console.error(e);
          $test.find('.result').html('<span style="color:red;">✗</span>');
        }
      }, 1);
    });
  });
};