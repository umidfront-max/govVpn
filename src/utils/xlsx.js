import * as XLSX from 'xlsx'

// Экспорт массива массивов (aoa) в .xlsx и скачивание файла.
export function exportXLSX(filename, aoa, sheet = 'Лист1') {
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheet)
  XLSX.writeFile(wb, filename)
}
