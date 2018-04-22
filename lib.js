
//upc from sku utility function
const ehskuPattern = /^EH-([0-9]{8,})-([0-9]+)$/
function getUpcFromEhsku(ehsku) {
	const match = ehsku.match(ehskuPattern);
	if(match)
		return match[1];
}


// get both upc and pack quantity from ehsku
function parseEhsku(ehsku) {
	const match = ehsku.match(ehskuPattern);
	if(match) {
		return [match[1], match[2]];// return [upc, packQuantity]
	}
}


function isEhskuFormat(s) {
	return ehskuPattern.test(s);
}


// converts UPCs to EHSKUs
const upcPattern = /^[0-9]+$/; 
function getEhskuFromUpc(upc, kitQuantity=1) {
	if (upcPattern.test(upc))
		return `EH-${upc}-${kitQuantity}`;
	else
		return null;
};

//Extract the upcs from the csv string that skulabs stores
const skulabsUpcPattern = /(?:^|,)([0-9]{8,})(?:,|$)/g;
function parseSkulabsUpcString(upcString) {
	let upcs = [];
	while((res = skulabsUpcPattern.exec(upcString)) ) {
		upcs.push(res[1]);
		skulabsUpcPattern.lastIndex -= 1;//need to back up the regex one character in order to catch overlapping matches (i.e. the trailing comma for one match is the leading comma for next one)
	}
	return upcs;
}


function isNumeric(x) { 
	var numbers=".0123456789";
	// is x a String or a character? 
	if(x && x.length>1) { 
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

const upcE = /^[0-9]{8}$/;
function isUpcE(upc) {
	return upcE.test(upc);
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
		CheckChar = calculateCheckDigit(Msg);
		return(Msg + CheckChar);	// put the pieces together and return
	} //End If is numeric
	else {
		return '';//TODO: handle error
	}
} //End Function

// WARNING:This fucntion doesn't seem to work for GTIN13
// function calculateCheckDigit(strMsg){
// 	// calculate the check digit - note UPCE and UPCA check digits are the same
// 	var Check = 0;            // initialize the check digit value
// 	for(var X = 1; X <= 11; X++){
//       	var Test = strMsg.substr(X-1, 1);
// 	      if (isOdd(X)==true){
//  		     	Check = Check + parseInt(Test) * 7;       // odd position digits multiplied by 7
// 		}
//       	else{ 
//             	Check = Check + parseInt(Test)  * 9;       // even position digits multiplied by 9
//       	}
// 	}
// 	Check = (Check % 10) + 48;  	// convert value to ASCII character value;
// 	return charFromCharCode (Check);    // check character
// }

function charFromCharCode (charCode) { 
	return unescape('%' + charCode.toString(16)); 
} 

// def compute_check_digit(upc):
//     """Computes the check digit (last digit, or least significant digit) for a partial barcode number. Input is the barcode number (without check digit) as a string. Works for a number pf the standard product codes: GTIN-8 (EAN-8), GTIN-12 (UPC-12), GTIN-13 (EAN-13, UPC-13, ISBN-13), GTIN-14, the 17-digit GSIN, and the 18-digit SSCC."""
//     upc_rev_list = list(upc)[::-1]
//     totes = 0
//     for n, char in enumerate(upc_rev_list):
//         if n % 2 == 0:
//             totes += 3*int(char)
//         else:
//             totes += int(char)
//     check_digit = -totes % 10#Check digit is the remainder after subtracting above sum from nearest (larger) multiple of ten.
//     return check_digit

function calculateCheckDigit(upc) {
	upc = upc.split('').reverse().join('');
	let total = 0;
	for(let i=0; i<upc.length; i++) {
		if(i % 2===0) {
			total = total + 3*parseInt(upc[i]);
		}
		else {
			total = total + parseInt(upc[i]);
		}
	}
  //Check digit is the remainder after subtracting above sum from nearest (larger or equal) multiple of ten.
	if(parseInt(total/10)===total/10) {
		return 0
	}
	else {
		return (parseInt(total/10)+1)*10 -total;
	}
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

function normalizeUpc(upc, opts={}) {
	if (opts.checkDigit) {
		upc = `${upc}${calculateCheckDigit(upc)}`;
	}
	if (opts.trim) {
		upc = upc.slice(opts.trim,upc.length);
	}
	return upc;
}

// Checks if the barcode includes a check digit
function validateCheckDigit(barcode) {
	const lastIdx = barcode.length-1;
	const lastChar = barcode[lastIdx];
	const base = barcode.slice(0, lastIdx);
	return calculateCheckDigit(base)==lastChar;// use == since we are comparing a string to a number
}

module.exports = {
	parseSkulabsUpcString: parseSkulabsUpcString,
	getUpcFromEhsku: getUpcFromEhsku,
	parseEhsku: parseEhsku,
	isEhskuFormat: isEhskuFormat,
	getEhskuFromUpc: getEhskuFromUpc,
	isUpcE: isUpcE,
	convertUpcE2A: convertUpcE2A,
	calculateCheckDigit: calculateCheckDigit,
	normalizeUpc: normalizeUpc,
	validateCheckDigit: validateCheckDigit,
}
