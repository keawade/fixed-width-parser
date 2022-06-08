# Change log

## 3.0.0

- Add `date` parse `tryParsingRawValueBeforeFallback` option to attempt parsing the raw value as a
  Date before failing after failing to parse the trimmed value as a Date
- Enhance `date` parse `falsyFallback == 'passthrough'` behavior to pass through trimmed value

## 2.5.1

- Updated `date-fns` dependency
- Updated developer tooling
- Drop Node 10 support
