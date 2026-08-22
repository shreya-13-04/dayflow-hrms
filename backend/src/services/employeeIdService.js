const Counter = require('../models/Counter');

/**
 * Derives a 2-character company prefix from company name.
 * e.g., "Odoo Inc" -> "OI", "Acme Corp" -> "AC", "Dayflow" -> "DF"
 */
function deriveCompanyPrefix(companyName) {
  if (!companyName || typeof companyName !== 'string') {
    return 'DF';
  }

  const cleaned = companyName.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  const words = cleaned.split(/\s+/).filter(Boolean);

  let prefix = '';
  if (words.length >= 2) {
    prefix = (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1) {
    prefix = words[0].substring(0, 2).toUpperCase();
  }

  if (prefix.length < 2) {
    prefix = prefix.padEnd(2, 'X');
  }

  return prefix;
}

/**
 * Derives a 4-letter name code from first and last name.
 * e.g., John Doe -> JODO, Sarah Jenkins -> SAJE
 */
function deriveNameCode(firstName, lastName) {
  const cleanFirst = (firstName || '').trim().replace(/[^a-zA-Z]/g, '');
  const cleanLast = (lastName || '').trim().replace(/[^a-zA-Z]/g, '');

  const fn2 = (cleanFirst.substring(0, 2) || 'XX').padEnd(2, 'X').toUpperCase();
  const ln2 = (cleanLast.substring(0, 2) || 'XX').padEnd(2, 'X').toUpperCase();

  return `${fn2}${ln2}`;
}

/**
 * Generates auto-incremented Employee ID safely.
 * Format: [company prefix]-[first 2 letters of first name][first 2 letters of last name]-[joining year]-[4-digit joining serial]
 * Example: OI-JODO-2026-0001
 */
async function generateEmployeeId(companyName, firstName, lastName, year = new Date().getFullYear()) {
  const companyPrefix = deriveCompanyPrefix(companyName);
  const nameCode = deriveNameCode(firstName, lastName);
  const joiningYear = year || new Date().getFullYear();

  // Sequence key scoped per company prefix + joining year
  const counterKey = `${companyPrefix}-${joiningYear}`;
  const seq = await Counter.getNextSequence(counterKey);
  const paddedSeq = seq.toString().padStart(4, '0');

  const employeeId = `${companyPrefix}-${nameCode}-${joiningYear}-${paddedSeq}`;

  return {
    employeeId,
    companyPrefix,
    joiningYear,
    serialNumber: seq,
  };
}

module.exports = {
  deriveCompanyPrefix,
  deriveNameCode,
  generateEmployeeId,
};
