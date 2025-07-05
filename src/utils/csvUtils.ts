export interface FieldConfig { // Added export
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'boolean';
}

export const toCSV = (data: any[], fields: FieldConfig[]): string => {
  if (!data || data.length === 0) {
    return fields.map(f => f.key).join(','); // Just headers if no data
  }

  const headers = fields.map(f => f.key);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.map(header => `"${header.replace(/"/g, '""')}"`).join(','));

  // Add data rows
  for (const item of data) {
    const row = fields.map(field => {
      let value = item[field.key];
      if (value === null || value === undefined) {
        return '';
      }
      if (field.type === 'date' && value) {
        const dateObj = new Date(value);
        if (!isNaN(dateObj.getTime())) { // Check if it's a valid date
          value = dateObj.toISOString().split('T')[0];
        } else {
          value = ''; // Return empty string for invalid dates
        }
      } else if (field.type === 'boolean') {
        value = value ? 'true' : 'false';
      }
      // Escape double quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
    csvRows.push(row);
  }

  return csvRows.join('\n');
};

export const fromCSV = (csvString: string, fields: FieldConfig[]): any[] => {
  const lines = csvString.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) { // Need at least header and one data row
    return [];
  }

  // Use the provided fields' keys as the definitive headers for parsing
  const headerKeys = fields.map(f => f.key);
  const result = [];

  // Skip the first line (actual CSV headers, which might be labels or different order)
  // and rely on `fields` for mapping.
  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    // Basic CSV parsing: split by comma, handle quoted fields
    const values = currentLine.match(/(?:\"(?:[^"]|\"\")*\"|[^,])+/g);

    if (!values) continue;

    const obj: Record<string, any> = {};
    for (let j = 0; j < headerKeys.length && j < values.length; j++) {
      let value = values[j].trim();
      // Remove surrounding quotes and unescape internal quotes
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1).replace(/\"\"/g, '"');
      }

      const field = fields.find(f => f.key === headerKeys[j]);
      if (field) {
        switch (field.type) {
          case 'number':
            obj[field.key] = parseFloat(value) || null;
            break;
          case 'boolean':
            obj[field.key] = value.toLowerCase() === 'true';
            break;
          case 'date':
            // Supabase expects ISO 8601 format (YYYY-MM-DD) for date columns
            obj[field.key] = value ? new Date(value).toISOString().split('T')[0] : null;
            break;
          default:
            obj[field.key] = value;
        }
      }
    }
    result.push(obj);
  }
  return result;
};