
// is reversing really necessary 
// is parseInt necessar while calculating  power

var msg = {
    // "data": "1E 04FB0E01000000 041301000000 022B0100 023E0102 025B0102 025F0102   0000 01020304 0102 01 01   01FD1701 ",
    // "data": "1F 04FB0E01020304 0000 01020304 0102 01 01 01FD1799"
    "data": "21 04FB0E01020304 041301020304  0000 01020304 0102 01 01   01FD1799  046D01020304 440301020304"

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
  currentIndex = 2  ;
  if( data[0]==='1' && data[1]==='E') return decodeStandard() ;
  else if( data[0]==='1' && data[1]==='F') return decodeCompact() ;
  else if( data[0]==='2' && data[1]==='0') return decodeJson() ;
  else if( data[0]==='2' && data[1]==='1') return decodeScheduledDailyRedundant() ;
  else if( data[0]==='2' && data[1]==='2') return decodeScheduledExtended() ;
  else if( data[0]==='2' && data[1]==='3') return decodeCombinedHeatCooling() ;
  else if( data[0]==='F' && data[1]==='A') return decodeClockMessage() ;

}

function decodeClockMessage() {
  
  if(matchString(currentIndex, currentIndex+3 ,"046D")) {
    return getDateTime();

  }
  return "Invalid date/time";
}
function decodeStandard(){
  console.log("inside decode energy ")
  var energy = getEnergy();
  var volume = getVolume();
  var power = getPower();
  var flow = getFlow();
  var forwardTemperature =  getForwardTemperature();
  var returnTemperature = getReturnTemperature() ;
  var meterAddress = getMeterAddress(); 
  var errrorFlags = getErrorFlags() ;

  var starndardMessage = {
    energy: energy,
    volume: volume,
    power: power,
    flow: flow,
    forwardTemperature: forwardTemperature,
    returnTemperature: returnTemperature,
    meterAddress: meterAddress,
    errrorFlags: errrorFlags

  }
  console.log(starndardMessage) ; 
  return  starndardMessage;

} 

function decodeCompact() {
  var energy = getEnergy();
  var meterAddress = getMeterAddress(); 
  var errrorFlags = getErrorFlags() ;
  var compactMessage = {
    energy: energy,
    meterAddress: meterAddress,
    errrorFlags: errrorFlags
  }

  console.log( compactMessage ) ;  

  return compactMessage  ; 


}

function decodeScheduledDailyRedundant() {
  console.log("scheduled daily re") ; 
  var energy = getEnergy();
  var volume = getVolume();
  var meterAddress = getMeterAddress(); 
  var errrorFlags = getErrorFlags() ;
  var meterDateTime = getDateTime() ; 
  var accumulateEnergyAt24 = getAccumulatedEnergyAt_24() ; 
  
  var scheduledDailyRedundantMessage = {
    energy: energy,
    volume: volume,
    meterAddress: meterAddress,
    errrorFlags: errrorFlags,
    meterDateTime: meterDateTime,
    accumulateEnergyAt24: accumulateEnergyAt24
  }
  console.log(scheduledDailyRedundantMessage);

  return scheduledDailyRedundantMessage;

}
function decodeCombinedHeatCooling() {
  var heatEnergy = getEnergy();
  var coolingEnergy = getCoolingEnergy(); // need to write
  
  var volume = getVolume();
  var forwardTemperature = getForwardTemperature();
  var returnTemperature = getReturnTemperature();
  var meterAddress = getMeterAddress(); 
  var errrorFlags = getErrorFlags() ;
 
  var combinedHeatCoolingMessage = {
    energy: heatEnergy,
    coolingEnergy: coolingEnergy,
    volume: volume,
    forwardTemperature: forwardTemperature,
    returnTemperature: returnTemperature,
    meterAddress: meterAddress,
    errrorFlags: errrorFlags
  }
  
  return combinedHeatCoolingMessage; 

}

function getPowerFlowFwTempRtTemp() {
  // byte 0-2 difvif code   
  currentIndex += 6;
  
  // byte 3 scaling of power 
  currentIndex += 1;  

  // byte 4-5 forward temperature 
  var forwardTemperature = parseInt(getReversedValue( currentIndex, currentIndex+3), 16)+ "°C"; currentIndex += 4;

  // byte 6-7 return temperature 
  var returnTemperature = parseInt(getReversedValue(currentIndex, currentIndex+3 ), 16)+"°C"; currentIndex+= 4;

  // byte 8-9 flow
  var flow = parseInt(getReversedValue(currentIndex, currentIndex+3), 16)+ "m3/h"; currentIndex += 4;

  // byte 10-11 power  
  var power = parseInt(getReversedValue(currentIndex, currentIndex+3 ), 16)+ "m3/h"; currentIndex += 4;

  var ret = {
    forwardTemperature: forwardTemperature,
    returnTemperature: returnTemperature,
    flow: flow,
    power: power

  }
  return ret;
}
function getMeterIdErrorFlags() {
  // byte 0-3 difvif codes 0x0DFF21E9
  currentIndex += 8;

  // byte 4 error flags 
  var errorFlags =  parseInt(getReversedValue(currentIndex, currentIndex+1), 16 ) ;
  currentIndex += 2 ;
  // byte 5-8 meter id 
  var meterId = parseInt(getReversedValue(currentIndex, currentIndex+ 7), 16); 
  currentIndex += 8;

  // byte 9-10 meter menufacturer
  var meterManufacturer = parseInt(getReversedValue(currentIndex, currentIndex+3), 16);
  currentIndex += 4;

  // byte 11 meter version  
  var meterVersion = parseInt(getReversedValue(currentIndex, currentIndex+1), 16);
  currentIndex += 1; 
  // byte 11 meter version  
  var deviceType = parseInt(getReversedValue(currentIndex, currentIndex+1), 16);
  currentIndex += 1;
  
  var ret = {
    errorFlags: errorFlags,
    meterId: meterId,
    meterManufacturer: meterManufacturer,
    meterVersion: meterVersion,
    deviceType: deviceType
  }
  return ret;

  
}
function decodeScheduledExtended() {
  var energy = getEnergy();
  var volume = getVolume();

  var  powerFlowFwTempRtTemp = getPowerFlowFwTempRtTemp() ;
  var meterIdErrorFlags = getMeterIdErrorFlags(); 
  var meterDateTime = getDateTime() ;
  
  var scheduledExtendedMessage = {
    energy: energy, 
    volume: volume,
    forwardTemperature: powerFlowFwTempRtTemp.forwardTemperature,
    returnTemperature: powerFlowFwTempRtTemp.returnTemperature,
    flow: powerFlowFwTempRtTemp.flow,
    power: powerFlowFwTempRtTemp.power,
    errorFlags: meterIdErrorFlags.errorFlags,
    meterId: meterIdErrorFlags.meterId,
    meterManufacturer: meterIdErrorFlags.meterManufacturer,
    meterVersion: meterIdErrorFlags.meterVersion,
    deviceType: meterIdErrorFlags.deviceType,
    meterDateTime: meterDateTime
  }
  return scheduledExtendedMessage;

}

function decodeJson() {
  return data;
}

function getDateTime() {
  // var res = (parseInt(data, 16).toString(2)).padStart(8, '0')
  // console.log("datetime-> ",data , res) ; 
  // 046D xxxx xxxx
  // if(data=== undefined) return;
  currentIndex += 4; 
  var dateTimeString = "" ;
  var currentBit= 0 ;
  for(var i=currentIndex; i<currentIndex+8 ; i++ ) dateTimeString += data[i] ;
  
  console.log( "datetime str"  ,dateTimeString ) ;
  // dateTimeString = (parseInt(dateTimeString, 16).toString(2)).padStart(8, '0') ;
  dateTimeString = convertHexToBinary(dateTimeString );
  console.log( "after convert ", dateTimeString) ;  
  
  // bit 31-28  total 4 bit 
  var yearHigh = dateTimeString.substring(currentBit, currentBit+3 ) ; currentBit+= 4 ; 

  // bit 27-24  total 4 bit 
  var month = dateTimeString.substring(currentBit, currentBit+3 ) ; currentBit+= 4 ; 

  // bit 23-21  total 3 bit 
  var yearLow = dateTimeString.substring(currentBit, currentBit+2  ) ; currentBit+= 3 ;
 
  
  // bit 20-16  total 5 bit 
  var day = dateTimeString.substring(currentBit, currentBit+4  ) ; currentBit+= 5 ;
  
  // bit 15  total 15 bit 
  var summertimeFlag = dateTimeString.substring(currentBit, currentBit  ) ; currentBit+= 1 ;
  
  // bit 12-8  total 5 bit 
  var hour = dateTimeString.substring(currentBit, currentBit+4  ) ; currentBit+= 5 ;

  // bit 7 error flag total 1 bit
  var errorFlag = dateTimeString.substring(currentBit, currentBit  ) ; currentBit+= 1 ;
  
  // bit 6 total 1
  var reservedFutureUse = dateTimeString.substring(currentBit, currentBit  ) ; currentBit+= 1 ;
  
  // bit 0-5  minute total 6 
  var minute = dateTimeString.substring(currentBit, currentBit+5  ) ; currentBit+= 6 ;
   
  
  currentIndex += 8;
  var YY = parseInt(yearHigh+"" + yearLow, 2 ) ;
  var MM = parseInt(month, 2) ;
  var DD = parseInt(day, 2) ;
  var HH = parseInt(hour, 2);
  var MM_Minute= parseInt(minute, 2);

  var dateTime = YY +"-"+ MM +"-"+DD +" "+ HH+ ":" + MM_Minute ; 
  return dateTime;
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

function getErrorFlags( ) {
  // var difVif = ["01FD17xx"] ;
  // volume 6  0413 xxxx xxxx  
  var errorFlags= parseInt( getReversedValue( currentIndex+6, currentIndex+7), 16);
  currentIndex += 8; 
  return errorFlags ;  
}
function getEnergy() {
  // start from 2nd bit 
  
  var difVif = ["0403", "0404", "0405", "0406", "0407", "040E", "040F", "04FB0D", "04FB0E", "04FB0F"] ;
  var multiplier = [1, 10, 100,1, 10, 1, 10,1, 10, 100] ;
  var unit = ["Wh" , "Wh", "Wh", "kWh", "kWh", "MJ", "MJ", "MCal","MCal","MCal" ];  

  // energy 6-7 byte  
  var energy; 

  for(var i=0;i< difVif.length ;i++  ) {
    if(matchString(currentIndex, currentIndex+ difVif[i].length - 1, difVif[i]))  {
      var start = currentIndex+difVif[i].length ;  
      var end = currentIndex +  (i<=6?11: 13 );
      energy = ( parseInt( getReversedValue(start, end ), 16 )  * multiplier[i])  + unit[i] ;
      currentIndex  =   currentIndex + (i<=6 ? 12: 14 ) ;  
      console.log( energy ,   currentIndex)  ;  
      return energy ;
    }
  }
}
function getCoolingEnergy() {
  // start from 2nd bit 
  
  var difVif = ["0483FF02", "0484FF02", "0485FF02", "0486FF02", "0487FF02", "048EFF02", "048FFF02", "04FB8DFF02", "04FB8EFF02", "04FB8FFF02"] ;
  var multiplier = [1, 10, 100,1, 10, 1, 10,1, 10, 100] ;
  var unit = ["Wh" , "Wh", "Wh", "kWh", "kWh", "MJ", "MJ", "MCal","MCal","MCal" ];  

  // energy 6-7 byte  
  var energy; 

  for(var i=0;i< difVif.length ;i++  ) {
    if(matchString(currentIndex, currentIndex+ difVif[i].length - 1, difVif[i]))  {
      var start = currentIndex+difVif[i].length ;  
      var end = currentIndex +  (i<=6?14: 16 );
      energy = ( parseInt( getReversedValue(start, end ), 16 )  * multiplier[i])  + unit[i] ;
      currentIndex  =   currentIndex + (i<=6 ? 15: 17 ) ;  
      console.log( energy ,   currentIndex)  ;  
      return energy ;
    }
  }
}
function getAccumulatedEnergyAt_24() {
  
  var difVif = ["4403", "4404", "4405", "4406", "4407", "440E", "440F", "44FB0D", "44FB0E", "44FB0F"] ;
  var multiplier = [1, 10, 100,1, 10, 1, 10,1, 10, 100] ;
  var unit = ["Wh" , "Wh", "Wh", "kWh", "kWh", "MJ", "MJ", "MCal","MCal","MCal" ];  

  // energy 6-7 byte  
  var energy; 

  for(var i=0;i< difVif.length ;i++  ) {
    if(matchString(currentIndex, currentIndex+ difVif[i].length - 1, difVif[i]))  {
      var start = currentIndex+difVif[i].length ;  
      var end = currentIndex +  (i<=6?11: 13 );
      energy = ( parseInt( getReversedValue(start, end ), 16 )  * multiplier[i])  + unit[i] ;
      currentIndex  =   currentIndex + (i<=6 ? 12: 14 ) ;  
      console.log( energy ,   currentIndex)  ;  
      return energy ;
    }
  }
}
function getVolume() {
  var difVif = ["0413", "0414", "0415", "0416", "0417"] ;
  var multiplier = [0.001, 0.01, 0.1, 1, 10] ;
  var unit = ["m3", "m3", "m3", "m3", "m3"];  
  // volume 6  0413 xxxx xxxx  
  var volume; 

  for(var i=0;i< difVif.length ;i++  ) {
    if(matchString(currentIndex, currentIndex+ difVif[i].length - 1, difVif[i]))  {
      var start = currentIndex+difVif[i].length ;  
      var end = currentIndex +  11;
      volume = ( parseInt( getReversedValue(start, end ),16 )  * multiplier[i])  + unit[i] ;
      currentIndex  =   currentIndex + 12 ;  
      console.log( volume  ,   currentIndex)  ;  
      return volume ;

    }
  }
}
function getPower() {
  var difVif = ["022B", "022C", "022D", "022E", "022F"] ;
  var multiplier = [1, 10, 100, 1, 10] ;
  var unit = ["W", "W", "W", "kW", "kW"];  
  // volume 6  0413 xxxx xxxx  
  var power; 

  for(var i=0;i< difVif.length ;i++  ) {
    if(matchString(currentIndex, currentIndex+ difVif[i].length - 1, difVif[i]))  {
      var start = currentIndex+difVif[i].length ;  
      var end = currentIndex +  7;
      power = ( parseInt( getReversedValue(start, end ), 16 )  * multiplier[i])  + unit[i] ;
      currentIndex  =   currentIndex + 8 ;  
      console.log( power  ,   currentIndex)  ;  
      return power ;

    }
  }
}
function getFlow() {
  var difVif = ["023B", "023C", "023D", "023E", "023F"] ;
  var multiplier = [0.001, 0.01, 0.1, 1, 10] ;
  var unit = ["m3/h", "m3/h", "m3/h", "m3/h", "m3/h"];  
  // volume 6  0413 xxxx xxxx  
  var flow; 

  for(var i=0;i< difVif.length ;i++  ) {
    if(matchString(currentIndex, currentIndex+ difVif[i].length - 1, difVif[i]))  {
      var start = currentIndex+difVif[i].length ;  
      var end = currentIndex +  7;
      flow = ( parseInt( getReversedValue(start, end ) , 16)  * multiplier[i])  + unit[i] ;
      currentIndex  =   currentIndex + 8 ;  
      console.log( flow  ,   currentIndex)  ;  
      return flow ;

    }
  }
}
function getReturnTemperature() {
  var difVif = ["025C", "025D", "025E", "025F"] ;
  var multiplier = [0.001, 0.01, 0.1, 1] ;
  var unit = ["°C", "°C", "°C", "°C"];  
  // volume 6  0413 xxxx xxxx  
  var returnTemperature; 

  for(var i=0;i< difVif.length ;i++  ) {
    if(matchString(currentIndex, currentIndex+ difVif[i].length - 1, difVif[i]))  {
      var start = currentIndex+difVif[i].length ;  
      var end = currentIndex +  7;
      returnTemperature = ( parseInt( getReversedValue(start, end ), 16)  * multiplier[i])  + unit[i] ;
      currentIndex  =   currentIndex + 8 ;  
      console.log( returnTemperature  ,   currentIndex)  ;  
      return returnTemperature ;

    }
  }
}
function getForwardTemperature() {
  var difVif = ["0258", "0259", "025A", "025B"] ;
  var multiplier = [0.001, 0.01, 0.1, 1] ;
  var unit = ["°C", "°C", "°C", "°C"];  
  // volume 6  0413 xxxx xxxx  
  var forwardTemperature; 

  for(var i=0;i< difVif.length ;i++  ) {
    if(matchString(currentIndex, currentIndex+ difVif[i].length - 1, difVif[i]))  {
      var start = currentIndex+difVif[i].length ;  
      var end = currentIndex +  7;
      forwardTemperature = ( parseInt( getReversedValue(start, end ), 16 )  * multiplier[i])  + unit[i] ;
      currentIndex  =   currentIndex + 8 ;  
      console.log( forwardTemperature  ,   currentIndex)  ;  
      return forwardTemperature ;

    }
  }

}

function getMeterAddress() {
  
  // 0-1 byte dif/vif code  
  currentIndex+= 4 ;  

  // 2-5 byte is meter address  
  var meterId = parseInt(getReversedValue(currentIndex , currentIndex+ 7), 16);
  currentIndex += 8 ; 

  // 6-7 byte meter manufacturer  
  var meterManufacturer = parseInt(getReversedValue(currentIndex, currentIndex+ 3), 16);
  currentIndex += 4 ;

  // byte 8 meter version 
  var meterVersion = parseInt(getReversedValue(currentIndex, currentIndex+1 ), 16) ; 
  currentIndex += 2 ;

  // byte 9 device type  
  var deviceType =  parseInt(getReversedValue(currentIndex, currentIndex+1), 16 ) ;
  currentIndex += 2 ;
  var meterAddress = {
    meterId: meterId,
    meterManufacturer: meterManufacturer,
    meterVersion: meterVersion,
    deviceType: deviceType,
  }
  return meterAddress;

}
function convertHexToBinary(data ) {
  var len = data.length * 4    ;
  data = (parseInt(data, 16).toString(2)).padStart(8, '0') ; 
 
  while(data.length< len ) data = "0"+ data ; 
  return data ;   
  
}


