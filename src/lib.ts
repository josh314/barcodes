
//upc from sku utility function
const ehskuPattern = /^EH-([0-9]{8,})-([0-9]+)$/
function getUpcFromEhsku( ehsku: string ): string | undefined {
	const match = ehsku.match(ehskuPattern);
	if(match)
		return match[1];
}


// get both upc and pack quantity from ehsku
function parseEhsku( ehsku: string ): [string, string] | undefined {
	const match = ehsku.match(ehskuPattern);
	if(match) {
		return [match[1], match[2]];// return [upc, packQuantity]
	}
}


function isEhskuFormat(s: string): boolean {
	return ehskuPattern.test(s);
}


// converts UPCs to EHSKUs
const upcPattern = /^[0-9]+$/;
function getEhskuFromUpc( upc: string, kitQuantity: number = 1 ): string | null {
	if (upcPattern.test(upc))
		return `EH-${upc}-${kitQuantity}`;
	else
		return null;
};

//Extract the upcs from the csv string that skulabs stores
const skulabsUpcPattern = /(?:^|,)([0-9]{8,})(?:,|$)/g;
function parseSkulabsUpcString( upcString: string ): string[] {

  let res: RegExpExecArray | null;
	let upcs: string[] = [];
	while((res = skulabsUpcPattern.exec(upcString)) ) {
		upcs.push(res[1]);
		skulabsUpcPattern.lastIndex -= 1;//need to back up the regex one character in order to catch overlapping matches (i.e. the trailing comma for one match is the leading comma for next one)
	}
	return upcs;

}

function isNumeric( x: string ): boolean {

  return /^[0-9]+$/.test(x);

}

const upcE = /^[0-9]{8}$/;
function isUpcE( upc: string ): boolean {
	return upcE.test(upc);
}


function convertUpcE2A( UPCE: string ): string {

  let UPCEString: string;
	if( isNumeric(UPCE) ){
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
		const Digit1 = UPCEString.substr(0, 1);
		const Digit2 = UPCEString.substr(1, 1);
		const Digit3 = UPCEString.substr(2, 1);
		const Digit4 = UPCEString.substr(3, 1);
		const Digit5 = UPCEString.substr(4, 1);
		const Digit6 = UPCEString.substr(5, 1);

    let ManufacturerNumber = "";
    let ItemNumber = "";
    let Msg = "";
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
		let CheckChar = calculateCheckDigit(Msg);
		return(Msg + CheckChar);	// put the pieces together and return
	} //End If is numeric
	else {
		return '';//TODO: handle error
	}
}

// This should work for all types of barcode standards
function calculateCheckDigit( upc: string ): string {

  // TODO: logic for bad inputs

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

  let res: number;
	if( total % 10 === 0 ) { // Total is multiple of 10, then check digit is 0
		res = 0;
	}
	else {
    // Total is not a multiple of 10, calculate the difference to the next multiple of 10
		res = 10*( Math.floor(total/10) + 1 ) - total;
	}
  return res.toString();
}

// Checks if the barcode includes a check digit
function validateCheckDigit( barcode: string ) {
	const lastIdx = barcode.length-1;
	return calculateCheckDigit( barcode.slice(0, lastIdx) ) == barcode[lastIdx] ;
}

const isDigit = ( c: string ) => ('0123456789'.split('')).includes(c);
const isNumericString = ( s: string ) => s.split('').every(isDigit);

function addCheckDigit( barcode: string ) {

  // return unaltered barcode if not a numeric string
  if( !barcode || !isNumericString( barcode ) ) {
    return barcode;
  }

  return barcode + calculateCheckDigit(barcode);
}

interface NormalizeUpcOptions {
	checkDigit?: boolean;
	trim?: number;
}
function normalizeUpc( upc: string, opts: NormalizeUpcOptions = {}) {
	if ( opts.checkDigit ) {
		upc = `${upc}${calculateCheckDigit(upc)}`;
	}
	if (opts.trim) {
		upc = upc.slice(opts.trim,upc.length);
	}
	return upc;
}

function normalizeUpcE( upc: string ) {
	return normalizingFn(upc, 8);
}

function normalizeUpcA( upc: string ): string | null {
	if(upc.length===8 || upc.length===7) {
    const normalized = normalizeUpcE(upc);
    if( normalized ) {
      return convertUpcE2A( normalized );
    }
    else {
      return null;
    }
	}
	else {
		return normalizingFn(upc, 12);
	}
}

function normalizeEan13( ean: string ) {
	return normalizingFn(ean, 13);
}

function normalizingFn( barcode: string, standardLength: number ): string | null {

	if(validateCheckDigit(barcode) && barcode.length >= standardLength) {
		// trim any unnecessary leading zeros
		while(barcode[0]=='0' && barcode.length > standardLength) {
			barcode = barcode.slice(1,barcode.length);
		}
		if (barcode.length == standardLength) {// if correct length now
			return barcode
		}
	}

	// if too short, add leading zeros up to to one less than correct length
	while(barcode.length < standardLength-1) {
		barcode = '0' + barcode;
	}

	// if too long and have leading zeros, Trim leading zeros up to to one less than correct length
	while(barcode[0]=='0' && barcode.length > standardLength-1) {
		barcode = barcode.slice(1,barcode.length);
	}
	// if it's now the right length for a check digit to be added
	if(barcode.length == standardLength-1) {
		return barcode + calculateCheckDigit(barcode);
	}
	return null;
}

function normalizeBarcodeByType( barcode: string, type: string ): string | null {
	if(type.match(/upca/i) || type.match(/upc12/i) || type.toLowerCase()==='upc') {
		return normalizeUpcA(barcode);
	}
	else if(type.match(/ean13/i) || type.toLowerCase()==='ean') {
		return normalizeEan13(barcode);
	}
	else if(type.match(/upce/i) || type.match(/upc8/i)) {
		return normalizeUpcE(barcode)
	}
	else {// type not recognized
		return null;
	}
}
export {
	parseSkulabsUpcString,
	getUpcFromEhsku,
	parseEhsku,
	isEhskuFormat,
	getEhskuFromUpc,
	isUpcE,
  convertUpcE2A,
  addCheckDigit,
	calculateCheckDigit,
	validateCheckDigit,
	normalizeUpc,
	normalizeBarcodeByType,
	normalizeUpcA,
	normalizeUpcE,
  normalizeEan13,
  normalizingFn
}
