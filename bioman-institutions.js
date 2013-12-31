var $ = function(str){
  return document.querySelector(str);
}
var AddressRegex = /^(([nsew] ?[0-9]+\s*)+\s+[a-z]+.+)|([0-9]+-?[a-z]?\s*[nsew]{0,2}\s*-?\s*([0-9]{1,3}(st|nd|rd|th))?\s+[a-z]+.+)|(Suite .*[0-9]+)$/i,//address: 123 place walk or Suite derp 105
    CityStateZipRegex = /^([a-zA-Z \.]+),?\s+([A-Za-z][A-Za-z]),?\s*( [0-9\-]+)?$/,//city, state zip
    PhoneRegex = /^(1-)?\(?([0-9]{3})\s*[\- \.)]\s*([0-9]{3})\s*[\- \.]\s*([0-9]{4})\s*.*$/,//looks like a phone number
    POBoxRegex = /^(P.?O.? Box [0-9]+),?(.*)$/i;

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
  str = str
    .replace(/(\n|\r|\r\n)/g, '<br>')//change newlines into html breaks...
    .replace(/^(<br>)+/, '');//extra lines at the start screw up my script.
  var rows = str.split(/<br>/g);//split based on breaks between lines
  var text = rows.shift();
  if (url = text.match(/href="([^"]+)"/))
    inst.url = url[1];
  inst.title = text.match(/(<[^>]+>)?([^<]+)(<\/[^>]>)?/)[2];
  
  if (inst.url == "#top" || inst.title.substr(0, 5) == "Note:") {
    return null;//don't add this.
  }
  
  while(text = rows.shift()){
    if(AddressRegex.test(text)) {
      inst.address = text.trim();
    }else if (match = text.match(CityStateZipRegex)) {
      inst.city = match[1]
      inst.state = match[2];
      if (match[3])
        inst.zip = match[3].trimLeft();
    }else if (match = text.match(PhoneRegex)){
      inst.phone = "("+match[2]+") "+match[3]+"-"+match[4];
    }else if (match = text.match(POBoxRegex)) {
      inst.additional = match[1];
      if (match[2])//address is inline
        inst.address = match[2];
    }else{
      inst.error.push(text);
    }

  }
  if (inst.error.length > 0) {
    console.log("error:", inst.error, inst);
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