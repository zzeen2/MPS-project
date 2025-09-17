const isValidYearMonth = (s) => !!s && /^\d{4}-(0[1-9]|1[0-2])$/.test(s);

console.log('2025-08 valid:', isValidYearMonth('2025-08'));
console.log('2025-07 valid:', isValidYearMonth('2025-07'));
console.log('2025-09 valid:', isValidYearMonth('2025-09'));
console.log('2025-01 valid:', isValidYearMonth('2025-01'));
console.log('2025-12 valid:', isValidYearMonth('2025-12'));
