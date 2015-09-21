// based on https://github.com/Pomax/node-jp-conversion

var kana = module.exports = {};

// unicode range matchers
kana.isHiragana = function(input){
  return (/^[\u3040-\u309F]+$/g).test(input);
};
kana.isKatakana = function(input){
  return (/^[\u30A0-\u30FF]+$/g).test(input);
};
kana.isKana = function(input){
  return kana.isHiragana(input) || kana.isKatakana(input);
};

// all hira glyphs
var hiragana = ["ぁ","あ","ぃ","い","ぅ","う","ぇ","え","ぉ","お",
      "か","が","き","ぎ","く","ぐ","け","げ","こ","ご",
      "さ","ざ","し","じ","す","ず","せ","ぜ","そ","ぞ",
      "た","だ","ち","ぢ","っ","つ","づ","て","で","と","ど",
      "な","に","ぬ","ね","の",
      "は","ば","ぱ","ひ","び","ぴ","ふ","ぶ","ぷ","へ","べ","ぺ","ほ","ぼ","ぽ",
      "ま","み","む","め","も",
      "ゃ","や","ゅ","ゆ","ょ","よ",
      "ら","り","る","れ","ろ",
      "ゎ","わ","ゐ","ゑ","を",
      "ん","ゔ","ゕ","ゖ",
      "わ゛","ゐ゛","ゑ゛","を゛"];

// all kata glyphs
var katakana = ["ァ","ア","ィ","イ","ゥ","ウ","ェ","エ","ォ","オ",
      "カ","ガ","キ","ギ","ク","グ","ケ","ゲ","コ","ゴ",
      "サ","ザ","シ","ジ","ス","ズ","セ","ゼ","ソ","ゾ",
      "タ","ダ","チ","ヂ","ッ","ツ","ヅ","テ","デ","ト","ド",
      "ナ","ニ","ヌ","ネ","ノ",
      "ハ","バ","パ","ヒ","ビ","ピ","フ","ブ","プ","ヘ","ベ","ペ","ホ","ボ","ポ",
      "マ","ミ","ム","メ","モ",
      "ャ","ヤ","ュ","ユ","ョ","ヨ",
      "ラ","リ","ル","レ","ロ",
      "ヮ","ワ","ヰ","ヱ","ヲ",
      "ン","ヴ","ヵ","ヶ",
      "ヷ","ヸ","ヹ","ヺ"];

// replace values from array 1 with corresponding values from array 2
var replaceArray = function(searcharray, replacearray, input) {
    var i, e = searcharray.length;
    for(i = 0; i < e; i++) {
      input = input.replace(new RegExp(searcharray[i],"g"), replacearray[i]);
    }
    return input;
}

// hiragana to katakana
kana.htok = function(input){
  return replaceArray(hiragana, katakana, input);
};

// katakana to hiragana
kana.ktoh = function(input){
  return replaceArray(katakana, hiragana, input);
};
