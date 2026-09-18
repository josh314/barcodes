import { describe, it, expect } from '@jest/globals';

import * as barcodes from './lib';


describe('Check digit calculations', () => {

  const test1 = '12345678901';
  const checkDigit1 = '2';
  it(`'${test1}' should fail check digit validation`, () => {
    expect(barcodes.validateCheckDigit(test1)).toBe(false);
  });

  it(`Calculating the check digit for '${test1}'`, () => {
    expect(barcodes.calculateCheckDigit(test1)).toBe(checkDigit1);
  });

  // This tests the case where the digital sum is a multiple of 10, which has a different branch in the logic
  const test2 = '91891891831';
  const checkDigit2 = '0';

  it(`'${test2}' should fail check digit validation`, () => {
    expect(barcodes.validateCheckDigit(test2)).toBe(false);
  });

  it(`Calculating the check digit for '${test2}' (the 'multiple of 10' edge case)`, () => {
    expect(barcodes.calculateCheckDigit(test2)).toBe(checkDigit2);
  });

});

describe('Typical inputs for normalization', () => {

  const test = '56746784887';

  it(`Normalizing '${test}'`, () => {
    expect(barcodes.normalizingFn( test, 12 )).toBe(`567467848878`);
  });

  it(`Comparing normalizingFn and normalizeBarcodeByType for '${test}'`, () => {
    expect(barcodes.normalizingFn( test, 12 )).toBe(barcodes.normalizeBarcodeByType(test, 'upca'));
  });

});

describe('Special input - normalizing an n-digit code that consists of an (n-1) digit substring and its check digit', () => {

  const test = '1234567898';
  const test_prime = test + barcodes.calculateCheckDigit(test);
  it(`${test_prime} should pass check digit validation`, () => {
    expect(barcodes.validateCheckDigit(test_prime)).toBe(true);
  });

  it(`Normalizing '${test}'`, () => {
    expect(barcodes.normalizingFn( test, 11 )).toBe(test_prime);
  });

  it(`Normalizing '${test_prime}'`, () => {
    expect(barcodes.normalizingFn( test_prime, 12 )).toBe(test_prime + barcodes.calculateCheckDigit(test_prime));
  });

  it(`Comparing normalizingFn and normalizeBarcodeByType for '${test_prime}'`, () => {
    expect(barcodes.normalizingFn( test_prime, 12 )).toBe(barcodes.normalizeBarcodeByType(test_prime, 'upca'));
  });

});

describe('Special input - Already normalized input', () => {

  const test = '12345678989';
  const test_prime = test + barcodes.calculateCheckDigit(test);

  it(`Comparing normalizingFn and identity for '${test_prime}'`, () => {
    expect(barcodes.normalizingFn( test_prime, 12 )).toBe(test_prime);
  });

});

describe('Special input - Input with leading zeros', () => {

  const test = '00567467848';

  it(`'${test}' should fail check digit validation`, () => {
    expect(barcodes.validateCheckDigit(test)).toBe(false);
  });

  it(`Normalizing '${test}'`, () => {
    expect(barcodes.normalizingFn( test, 12 )).toBe(test + barcodes.calculateCheckDigit(test));
  });

  it(`Comparing normalizingFn and normalizeBarcodeByType for '${test}'`, () => {
    expect(barcodes.normalizingFn( test, 12 )).toBe(barcodes.normalizeBarcodeByType(test, 'upca'));
  });

});

describe('Special input - Missing leading zeros', () => {

    const base_test = '567467848';
    const test = '00' + base_test;

    it(`Normalizing '${base_test}' and '${test}' should be the same`, () => {
      expect(barcodes.normalizingFn( base_test, 12 )).toBe(barcodes.normalizingFn( test, 12 ));
    });

});

describe('Special input - Bad inputs', () => {

  const test1 = 'invalidBarcode';

  it(`'${test1}' should fail check digit validation`, () => {
    expect(barcodes.validateCheckDigit(test1)).toBe(false);
  });

  it(`Normalizing '${test1}' should be null`, () => {
    expect(barcodes.normalizingFn( test1, 12 )).toBe( null );
  });

  const test2 = '1234567890123';

  it(`'${test2}' is the wrong length for normalizingFn(..., 12)`, () => {
    expect(barcodes.normalizingFn( test2, 12 )).toBe( null );
  });

  it('Unknown barcode type should return null in normalizeBarcodeByType', () => {
    expect(barcodes.normalizeBarcodeByType(test2, 'unknown')).toBe(null);
  });
});