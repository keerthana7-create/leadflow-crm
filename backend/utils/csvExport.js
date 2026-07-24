/**
 * Converts an array of objects to a CSV string
 * @param {Array<Object>} data
 * @param {Array<{key: string, label: string}>} columns
 * @returns {string} CSV formatted string
 */
const toCSV = (data, columns) => {
  if (!data || data.length === 0) return '';

  const header = columns.map((c) => `"${c.label}"`).join(',');
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  return [header, ...rows].join('\n');
};

/**
 * Build lead CSV response
 */
const buildLeadCSV = (leads) => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'company', label: 'Company' },
    { key: 'status', label: 'Status' },
    { key: 'source', label: 'Source' },
    { key: 'createdAt', label: 'Created At' },
  ];

  const normalized = leads.map((l) => ({
    name: l.name,
    email: l.email,
    phone: l.phone || '',
    company: l.company || '',
    status: l.status,
    source: l.source,
    createdAt: new Date(l.createdAt).toISOString(),
  }));

  return toCSV(normalized, columns);
};

module.exports = { toCSV, buildLeadCSV };
