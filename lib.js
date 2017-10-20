
//upc from sku utility function
const ehskuPattern = /^EH-([0-9]{8,})-(?:[0-9]+)$/
function getUpcFromEhsku(ehsku) {
	const match = ehsku.match(ehskuPattern);
	if(match)
		return match[1];
}
exports.getUpcFromEhsku = getUpcFromEhsku;

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

function convertUpcE2A(UPCE){

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
			UPCEString = UPCE.substring(1, 7);	
			break;
			
			case 8:
			UPCEString = UPCE.substring(1, 7);
			break;
			
			case 12:
			return UPCE;

			default:
			return '';
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
		return(Msg + CheckChar);	// put the pieces together and return
	} //End If is numeric
	else {
		return '';//TODO: handle error
	}
} //End Function
exports.convertUpcE2A = convertUpcE2A;

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
