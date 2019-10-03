const barcodes = require('./lib');

console.log('');
console.log('#### Testing normalizing functions\n');

console.log('\n### Test suite 1')
console.log('### typical input\n')

console.log('\n## an 11-digit code that is not already validated')

const test1 = '56746784887';
console.log("test1: " + test1)
console.log('')

console.log('## Checking validation of check digit\n');
if(barcodes.validateCheckDigit(test1)) {
  console.log("fail: validateCheckDigit(test1) true");
}
else {
  console.log("success: validateCheckDigit(test1) false");
}
console.log('')

console.log('## Checking the action of ~normalizingFn~ on test1\n');
a = test1 + barcodes.calculateCheckDigit(test1);
b = barcodes.normalizingFn(test1, 12);
if(a===b) {
  console.log("success: test1 + calculateCheckDigit(test1) === normalizingFn(test1, 12)");
}
else {
  console.log("fail: test1 + calculateCheckDigit(test1) === normalizingFn(test1, 12)");
}
console.log("test1 + calculateCheckDigit(test1): " + a);
console.log("normalizingFn(test1, 12): " + b);
console.log('');

console.log('## Comparing the action of ~normalizingFn~ and ~normalizeBarcodeByType~ on test1\n');
a = barcodes.normalizingFn(test1, 12);
b = barcodes.normalizeBarcodeByType(test1, 'upca');
if(a===b) {
  console.log("success: normalizingFn(test1, 12) === normalizeBarcodeByType(test1, 'upca')");
}
else {
  console.log("fail: normalizingFn(test1, 12) === normalizeBarcodeByType(test1, 'upca')");
}
console.log("normalizingFn(test1, 12): " + a);
console.log("normalizeBarcodeByType(test1, 'upca'): " + b);
console.log('');

console.log('\n### Test suite 2')
console.log('### special input - normalizing an n-digit code that consists of an (n-1) digit substring and its check digit')

console.log('## Start with a ten digit number and manually add check digit:')
const test2 = '1234567898';
console.log("test2: " + test2)
const test2_prime = test2 + barcodes.calculateCheckDigit(test2);
console.log('test2_prime := test2 + calculateCheckDigit(test2)')
console.log("test2_prime: " + test2_prime)
console.log('')

console.log('## Checking validation of check digit\n');
if(barcodes.validateCheckDigit(test2_prime)) {
  console.log("success: validateCheckDigit(test2_prime) true");
}
else {
  console.log("fail: validateCheckDigit(test2_prime) false");
}
console.log('')

console.log('## Checking the action of ~normalizingFn~ on test2\n');
a = test2_prime;
b = barcodes.normalizingFn(test2, 11);
if(a===b) {
  console.log("success: test2_prime === normalizingFn(test2, 11)");
}
else {
  console.log("fail: test2_prime === normalizingFn(test2, 11)");
}
console.log("test2_prime: " + a);
console.log("barcodes.normalizingFn(test2, 11): " + b);
console.log('');

console.log('## Checking the action of ~normalizingFn~ on test2_prime');
console.log('## test2_prime has been constructed to be an 11-digit number whose last digit is the check digit of the first 10 digits\n')
a = test2_prime + barcodes.calculateCheckDigit(test2_prime);
b = barcodes.normalizingFn(test2_prime, 12);
if(a===b) {
  console.log("success: test2_prime + calculateCheckDigit(test2_prime) === normalizingFn(test2_prime, 12)");
}
else {
  console.log("fail: test2_prime + calculateCheckDigit(test2_prime) === normalizingFn(test2_prime, 12)");
}
console.log("test2_prime + calculateCheckDigit(test2_prime): " + a);
console.log("normalizingFn(test2_prime, 12): " + b);
console.log('');

console.log('## Comparing the action of ~normalizingFn~ and ~normalizeBarcodeByType~ on test2_prime\n');
a = barcodes.normalizingFn(test2_prime, 12);
b = barcodes.normalizeBarcodeByType(test2_prime, 'upca');
if(a===b) {
  console.log("success: normalizingFn(test2_prime, 12) === normalizeBarcodeByType(test2_prime, 'upca')");
}
else {
  console.log("fail: normalizingFn(test2_prime, 12) === normalizeBarcodeByType(test2_prime, 'upca')");
}
console.log("normalizingFn(test2_prime, 12): " + a);
console.log("normalizeBarcodeByType(test2_prime, 'upca'): " + b);
console.log('');

console.log('\n### Test suite 3')
console.log('### special input - Already normalized input\n')

console.log('## Start with a 11 digit number and manually add check digit:')
const test3 = '12345678989';
console.log("test3: " + test3)
const test3_prime = test3 + barcodes.calculateCheckDigit(test3);
console.log('test3_prime := test3 + calculateCheckDigit(test3)')
console.log("test3_prime: " + test3_prime)
console.log('')

console.log('## Comparing the action of ~normalizingFn~ vs identity on test3_prime\n');
a = barcodes.normalizingFn(test3_prime, 12);
b = test3_prime
if(a===b) {
  console.log("success: normalizingFn(test3_prime, 12) === test3_prime");
}
else {
  console.log("fail: normalizingFn(test3_prime, 12) === test3_prime");
}
console.log("normalizingFn(test3_prime, 12): " + a);
console.log("test3_prime: " + b);
console.log('');


console.log('\n### Test suite 4')
console.log('### special input - Input with leading zeros\n')

const test4 = '00567467848';
console.log("test4: " + test4)
console.log('')

console.log('## Checking validation of check digit\n');
if(barcodes.validateCheckDigit(test4)) {
  console.log("fail: validateCheckDigit(test4) true");
}
else {
  console.log("success: validateCheckDigit(test4) false");
}
console.log('')

console.log('## Checking the action of ~normalizingFn~ on test4\n');
a = test4 + barcodes.calculateCheckDigit(test4);
b = barcodes.normalizingFn(test4, 12);
if(a===b) {
  console.log("success: test4 + calculateCheckDigit(test4) === normalizingFn(test4, 12)");
}
else {
  console.log("fail: test4 + calculateCheckDigit(test4) === normalizingFn(test4, 12)");
}
console.log("test4 + calculateCheckDigit(test4): " + a);
console.log("normalizingFn(test4, 12): " + b);
console.log('');

console.log('## Comparing the action of ~normalizingFn~ and ~normalizeBarcodeByType~ on test4\n');
a = barcodes.normalizingFn(test4, 12);
b = barcodes.normalizeBarcodeByType(test4, 'upca');
if(a===b) {
  console.log("success: normalizingFn(test4, 12) === normalizeBarcodeByType(test4, 'upca')");
}
else {
  console.log("fail: normalizingFn(test4, 12) === normalizeBarcodeByType(test4, 'upca')");
}
console.log("normalizingFn(test4, 12): " + a);
console.log("normalizeBarcodeByType(test4, 'upca'): " + b);
console.log('');

console.log('\n### Test suite 5')
console.log('### special input - Extra leading zeros\n')

const base_test5 = '56746784887';
zeros = '00000'
console.log(`11-digit input with ${zeros.length} extra zeros`)
const test5 = zeros + base_test5;
console.log("base_test5: " + base_test5)
console.log("test5: " + test5)
console.log('')

console.log('## Comparing the action of ~normalizingFn~ on test5 and base_test5\n');
a = barcodes.normalizingFn(test5, 12);
b = barcodes.normalizingFn(base_test5, 12);
if(a===b) {
  console.log("success: normalizingFn(test5, 12) === normalizingFn(base_test5, 12)");
}
else {
  console.log("fail: normalizingFn(test5, 12) === normalizingFn(base_test5, 12)");
}
console.log("normalizingFn(test5, 12): " + a);
console.log("normalizingFn(base_test5, 12): " + b);
console.log('');

console.log('\n### Test suite 6')
console.log('### special input - missing leading zeros\n')

const base_test6 = '567467848';
zeros = '0'.repeat(11-base_test6.length)
console.log(`11-digit input missing ${zeros.length} leading zeros`)
const test6 = zeros + base_test6;
console.log("base_test6: " + base_test6)
console.log("test6: " + test6)
console.log('')

console.log('## Comparing the action of ~normalizingFn~ on test6 and base_test6\n');
a = barcodes.normalizingFn(test6, 12);
b = barcodes.normalizingFn(base_test6, 12);
if(a===b) {
  console.log("success: normalizingFn(test6, 12) === normalizingFn(base_test6, 12)");
}
else {
  console.log("fail: normalizingFn(test6, 12) === normalizingFn(base_test6, 12)");
}
console.log("normalizingFn(test6, 12): " + a);
console.log("normalizingFn(base_test6, 12): " + b);
console.log('');
