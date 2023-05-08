var msg = {
  // "data": "02FD172200",
  "data": "02FD176020"
  // "data": "21 04FB0E0s1020304 041301020304  0000 01020304 0102 01 01   01FD1799  046D01020304 440301020304"

}

function format(value)  {
data = value.replaceAll(' ', '');
return data;
}

var decodedMsg = msg;
var currentIndex = 0;  //  keeping track of current index is important 
var data = format(msg.data)|| "";

if (msg && msg.data) {
  decodedMsg = main();
}


return {
  msg: decodedMsg,
  // metadata: metadata,
  // msgType: msgType
};

function main() {
// check message format  
  console.log("inside main " , data) ;
  currentIndex = 6  ;

  // return true false string  
  var event = getReversedValue(currentIndex, currentIndex+3);
  console.log("rev " , event ) ;
  // convert to binary 
  event = convertHexToBinary(event) ;
  

  // reverse  
  event= event.split("").reverse().join(""); //  reverse string  

  console.log(event  ) ;

  var reserved =  event[0]==="1"? "ON": "OFF" ;
  var airBubbles=  event[1]==="1"? "ON": "OFF" ;
  var burst =  event[2]==="1"? "ON": "OFF" ;
  var leak =  event[4]==="1"? "ON": "OFF" ;

  var frost =  event[4]==="1"? "ON": "OFF" ;
  var heat =  event[5]==="1"? "ON": "OFF" ;
  var overTemperature =  event[6]==="1"? "ON": "OFF" ;
  var noConsumption =   event[7]==="1"? "ON": "OFF" ;


  var batteryLow =  event[8]==="1"? "ON": "OFF" ;
  var reverseFlow =  event[9]==="1"? "ON": "OFF" ;
  
   
  var overload =  event[10]==="1"? "ON": "OFF" ;
  var dry =  event[11]==="1"? "ON": "OFF" ;
  
  var limitMinWatTemp =   event[12]==="1"? "ON": "OFF" ;
  var limitMaxWatTemp =  event[13]==="1"? "ON": "OFF" ;
  var limitMinAmbTemp =  event[14]==="1"? "ON": "OFF" ;
  var limitMaxAmbTemp =  event[15]==="1"? "ON": "OFF" ;
  
   
   
   

  var ret =  {
    Reserved: reserved,
    AirBubbles: airBubbles,
    Burst: burst,
    Frost: frost,

    Heat: heat,
    OverTemperature: overTemperature,
    NoConsumption: noConsumption,   
    Leak: leak,

    BatteryLow: batteryLow,
    ReverseFlow: reverseFlow,
    Overload: overload,
    Dry: dry,

    LimitMinWatTemp: limitMinWatTemp,
    LimitMaxWatTemp: limitMaxWatTemp,
    LimitMinAmbTemp: limitMinAmbTemp,
    LimitMaxAmbTemp: limitMaxAmbTemp,
  }
  
  console.log( ret) ;
  return ret;
}

function matchString(startIndex, endIndex , str) {
  for( var i=startIndex, j= 0; i<= endIndex; i++ ,j++) if(data[i]!== str[j] ) return false;
  return true;
}
function getReversedValue(startIndex, endIndex) {
  var str ="" ;
  for(var i=endIndex-1 ; i>= startIndex ;i-=2 ) str += data[i] +""+ data[i+1]  ;
  return str ; 

}
function convertHexToBinary(data ) {
  var len = data.length * 4    ;
  data = (parseInt(data, 16).toString(2)).padStart(8, '0') ; 
 
  while(data.length< len ) data = "0"+ data ; 
  return data ;   
  
}
