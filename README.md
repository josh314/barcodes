# @wazue/barcodes

Utility functions for validating, normalizing, and converting UPC/EAN/GTIN barcodes. Written in TypeScript, compiled to CommonJS — requireable from plain Node.

## Install

```
npm install @wazue/barcodes
```

## Usage

Two import paths are supported and kept in sync:

```js
// bare import
const barcodes = require('@wazue/barcodes');

// subpath import (kept for backward compatibility with existing consumers,
// e.g. lot-commander's server/modules/product-data.js)
const barcodes = require('@wazue/barcodes/lib');
```

Both resolve to the same compiled module (`dist/lib.js`) via the `exports` map in `package.json` — there is no behavioral difference between them, only the import path differs.

TypeScript consumers get type declarations automatically from either path (`dist/lib.d.ts`).

## API

- `getUpcFromEhsku(ehsku)`
- `parseEhsku(ehsku)`
- `isEhskuFormat(s)`
- `getEhskuFromUpc(upc, kitQuantity?)`
- `parseSkulabsUpcString(upcString)`
- `isUpcE(upc)`
- `convertUpcE2A(UPCE)`
- `calculateCheckDigit(upc)`
- `validateCheckDigit(barcode)`
- `addCheckDigit(barcode)`
- `normalizeUpc(upc, opts?)`
- `normalizeUpcA(upc)`
- `normalizeUpcE(upc)`
- `normalizeEan13(ean)`
- `normalizingFn(barcode, standardLength)`
- `normalizeBarcodeByType(barcode, type)`

## Development

```
npm install
npm run build   # compile src/ -> dist/
npm test        # run the Jest suite
```
