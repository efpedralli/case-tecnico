import * as XLSX from 'xlsx';

export type ExcelRow = Record<string, unknown>;

export type ColumnMapping<T> = {
  [K in keyof T]: string;
};

export type ExcelImportOptions = {
  sheetIndex?: number;
};

export async function excelImport<T extends Record<string, any>>(
  file: File | ArrayBuffer,
  mapping: ColumnMapping<T>,
  options?: ExcelImportOptions,
): Promise<T[]> {
  const sheetIndex = options?.sheetIndex ?? 0;

  const buffer =
    file instanceof File ? await file.arrayBuffer() : file;

  const workbook = XLSX.read(buffer, { type: 'array' });

  const sheetName = workbook.SheetNames[sheetIndex];
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`Planilha de índice ${sheetIndex} não encontrada.`);
  }

  const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
    defval: null,
  });

  const result: T[] = rows.map((row) => {
    const obj: Partial<T> = {};

    (Object.keys(mapping) as (keyof T)[]).forEach((fieldKey) => {
      const excelHeader = mapping[fieldKey];
      const value = row[excelHeader];

      (obj as any)[fieldKey] = value;
    });

    return obj as T;
  });

  return result;
}
