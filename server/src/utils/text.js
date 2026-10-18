const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const escapeCsvCell = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

function toCsv(headers, rows) {
  return [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}

module.exports = { escapeRegex, toCsv };
