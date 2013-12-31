var $ = function(str){
  return document.querySelector(str);
}

var $data = $('td[width="50%"] table td');
var state = $('.bodytextB', data).innerHTML.replace(/Biotechnology In /i, '');
var data = $('[align="left"]', data).innerHTML.replace(/<\/?(p|strong|b|img)( [^>]*)?>/g, '').replace(/&nbsp;/g, ' ');
var split = data.replace(/\s*<br>\s*/g, '<br>').split(/<br><br>/g);
var institutions = {
  EDUCATION: [],
  ORGANIZATIONS: [],
  INDUSTRY: [],
};
var category = "EDUCATION";
for (var i in split) {
  var inst = parseInstitution(split[i]);
  if (typeof inst == "string") {
    category = inst;
  }else if (inst){//don't add junk
    institutions[category].push(inst);
  }
}
function parseInstitution(str){
  var label = str.match(/\s*<font [^>]+>\s*(EDUCATION|ORGANIZATIONS|INDUSTRY)\s*<\/font>/);
  if (label)
    return label[1];
  
  //parse an institution
  var inst = {};
  inst.original = str;
  inst.error = [];  
  var rows = str.split(/<br>/g);
  var text = rows.shift();
  if (url = text.match(/href="([^"]+)"/))
    inst.url = url[1];
  inst.title = text.match(/(<[^>]+>)?([^<]+)(<\/[^>]>)?/)[2];
  
  if (inst.url == "#top") {
    return null;//don't add this.
  }
  
  while(text = rows.shift()){
    if(/^([0-9]+[a-z]?( ([0-9]{1,2}(st|nd|rd|th)))?\s+[a-z]+.+)|(Suite .*[0-9]+)$/i.test(text)) {//address: 123 place walk or Suite derp 105
      inst.address = text;
    }else if (/^([a-zA-Z \.]+,?\s+[A-Z][A-Z],?\s*( [0-9\-]+)?)$/.test(text)) {//city, state zip
      var split = text.split(/^([a-zA-Z \.]+),?\s+([A-Z][A-Z]),?\s*( [0-9\-]+)?$/);
      if (split.length==5) {
        inst.city = split[1]
        inst.state = split[2];
        if (split[3])
          inst.zip = split[3];
      }else{
        inst.error.push(text);
      }
    }else if (/^(1-)?\(?[0-9]{3}[\- )] ?[0-9]{3}[ -][0-9]{4}$/.test(text)) {//looks like a phone number
      var split = text.split(/^(1-)?\(?([0-9]{3})[\- )] ?([0-9]{3})[ -]([0-9]{4})$/);
      if (split.length==6) {
        inst.phone = "("+split[2]+") "+split[3]+"-"+split[4];
      }
    }else if (/^P.?O.? Box [0-9]+.*$/i.test(text)) {
      var split = text.split(/^(P.?O.? Box [0-9]+),?(.*)$/i);
      if (split.length == 4) {
        inst.additional = split[1];
        if (split[2])//address is inline
          inst.address = split[2];
      }else{
        inst.error.push(text);
      }
    }else{
      inst.error.push(text);
    }
    if (inst.error.length > 0) {
      console.log("error:", inst);
    }
  }
  if (inst.additional && !inst.address) {
    inst.address = inst.additional;
    delete inst.additional;
  }
  return inst;
}

str = JSON.stringify(institutions);
blob = new Blob([str], {type : 'text/json'});
url = URL.createObjectURL(blob);
div = document.createElement('strong');
div.innerHTML = '<a href="'+url+'" download="'+state+'.json">Download</a>';
$data.insertBefore(div, $data.firstChild);
//$data.appendChild(div);