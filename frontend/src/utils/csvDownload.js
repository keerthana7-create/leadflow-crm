/**
 * Trigger a CSV blob download in the browser
 * @param {Blob} blob - The CSV blob from the API
 * @param {string} filename - File name for the download
 */
export const downloadCSV = (blob, filename = 'export.csv') => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
