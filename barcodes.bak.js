// I swiped this code from http://www.taltech.com/barcodesoftware/symbologies/upc.
// This is the original code file. It is not a node module but rather meant to be used in the 
// browser with a form (see the document.forms["UPC"] variables floating around.)
// The lib.js file in this project is the node module version

function isNumeric(x) { 
	var numbers=".0123456789";
	// is x a String or a character? 
	if(x.length>1) { 
		// remove negative sign 
		x=Math.abs(x)+""; 
		for(j=0;j<x.length;j++) { 
			// call isNumeric recursively for each character 
			number=isNumeric(x.substring(j,j+1)); 
			if(!number) return number; 
		} 
		return number; 
	} 
	else { 
		// if x is number return true 
		if(numbers.indexOf(x)>=0) return true; 
		return false; 
	} 
} 

function UPCE2A(){

	var UPCA = new String(document.forms["UPC"].txtUPCA.value);

	//If UPCA entered then convert that first
	if (UPCA.length > 0){
		ConvertUPCAtoUPCE(document.forms["UPC"].txtUPCA, document.forms["UPC"].txtUPCE);
		//alert('1');
	}
	
	var UPCE = new String(document.forms["UPC"].txtUPCE.value);

	if (UPCE.length > 0){
		ConvertUPCE2A();
		//alert('2');
	}
}

function ConvertUPCE2A(){

var UPCE = new String(document.forms["UPC"].txtUPCE.value);
// var UPCA = new String(document.forms["UPC"].txtUPCA.value);
var UPCEString = new String();
var ManufacturerNumber = new String();
var ItemNumber = new String();
var Msg = new String();

	if(isNumeric(UPCE)){
		switch (UPCE.length){
			case 6:
			UPCEString = UPCE;	
			break;
		
			case 7:
			UPCEString = UPCE.substring(1, 6);	
			break;
			
			case 8:
			UPCEString = UPCE.substring(2, 6);
			break;
			
			default :
			alert("Wrong size UPCE message!");
			document.forms["UPC"].txtUPCE.value = "";
			document.forms["UPC"].txtUPCE.focus();
			//return false;
			
		} //End Select
		
		// break up the string into its 6 individual digits
		var Digit1 = UPCEString.substr(0, 1);
		var Digit2 = UPCEString.substr(1, 1);
		var Digit3 = UPCEString.substr(2, 1);
		var Digit4 = UPCEString.substr(3, 1);
		var Digit5 = UPCEString.substr(4, 1);
		var Digit6 = UPCEString.substr(5, 1);

		switch (Digit6){
			case "0":
			ManufacturerNumber = ManufacturerNumber.concat(Digit1, Digit2, Digit6, "00");
	            ItemNumber = ItemNumber.concat("00", Digit3, Digit4, Digit5);
			break;
			
			case "1":
			ManufacturerNumber = ManufacturerNumber.concat(Digit1, Digit2, Digit6, "00");
	            ItemNumber = "00" + Digit3 + Digit4 + Digit5;
			break;
			
			case "2":
			ManufacturerNumber = Digit1 + Digit2 + Digit6 + "00";
	            ItemNumber = "00" + Digit3 + Digit4 + Digit5;
			break;
			
			case "3":
			ManufacturerNumber = Digit1 + Digit2 + Digit3 + "00";
         		ItemNumber = "000" + Digit4 + Digit5;	
			break;
			
			case "4":
	            ManufacturerNumber = Digit1 + Digit2 + Digit3 + Digit4 + "0";
         		ItemNumber = "0000" + Digit5;
			break;
			
			default:
		      ManufacturerNumber = ManufacturerNumber.concat(Digit1, Digit2, Digit3, Digit4, Digit5);
	            ItemNumber = ItemNumber.concat("0000", Digit6);
			break;
			
		} //End Select

		// put the number system digit "0" together with the manufacturer code and Item number
		Msg = Msg.concat("0", ManufacturerNumber, ItemNumber);
		CheckChar = CalcCheckDigit(Msg);
		//return(Msg + CheckChar);	// put the pieces together and return
		if (!isNaN(CheckChar)){
			document.forms["UPC"].txtUPCA.value = Msg.concat(CheckChar);
			document.forms["UPC"].txtChk.value = CheckChar;
		} //End If isNaN
	} //End If is numeric
	else {
		alert("UPCs must contain numeric data only!");
		document.forms["UPC"].txtUPCE.value = "";
		document.forms["UPC"].txtUPCE.focus();
	}
} //End Function

function CalcCheckDigit(strMsg){
	// calculate the check digit - note UPCE and UPCA check digits are the same
	var Check = 0;            // initialize the check digit value
	for(var X = 1; X <= 11; X++){
      	var Test = strMsg.substr(X-1, 1);
	      if (isOdd(X)==true){
 		     	Check = Check + parseInt(Test) * 7;       // odd position digits multiplied by 7
		}
      	else{ 
            	Check = Check + parseInt(Test)  * 9;       // even position digits multiplied by 9
      	}
	}
	Check = (Check % 10) + 48;  	// convert value to ASCII character value;
	return charFromCharCode (Check);    // check character
}

function charFromCharCode (charCode) { 
	return unescape('%' + charCode.toString(16)); 
} 

function isEven(y) { 
	return (y%2)?false:true; 
} 
function isOdd(y) { 
	return !isEven(y); 
} 

function mod(divisee,base) {
	return Math.round(divisee - (Math.floor(divisee/base)*base));
}

function ConvertUPCAtoUPCE(UPCA,UPCE)
{
 var csumTotal = 0; // The checksum working variable starts at zero

 // If the source message string is less than 12 characters long, we make it 12 characters

 if( UPCA.value.length < 12 )
  {
  var holdString = '000000000000' + UPCA.value;
  UPCA.value = holdString.substring(holdString.length - 12, holdString.length);
  }

 if( UPCA.value.substring(0,1) != '0' && UPCA.value.substring(0,1) != '1')
   UPCE.value = 'Invalid Number System (only 0 & 1 are valid)';
 else
  {
  if( UPCA.value.substring(3,6) == '000' || UPCA.value.substring(3,6) == '100' ||
      UPCA.value.substring(3,6) == '200' )
    UPCE.value = UPCA.value.substring(1,3) + UPCA.value.substring(8,11) +
                 UPCA.value.substring(3,4);
  else if( UPCA.value.substring(4,6) == '00' )
    UPCE.value = UPCA.value.substring(1,4) + UPCA.value.substring(9,11) + '3';
  else if( UPCA.value.substring(5,6) == '0' )
    UPCE.value = UPCA.value.substring(1,5) + UPCA.value.substring(10,11) + '4';
  else if( UPCA.value.substring(10,11) >= '5' )
    UPCE.value = UPCA.value.substring(1,6) + UPCA.value.substring(10,11);
  else
   //Invalid product code (00005 to 00009 are valid)
   alert('Invalid UPC-E Message');
  }
  
  document.forms["UPC"].txtUPCE.value = UPCE.value;
  document.forms["UPC"].txtUPCE.focus();
}
