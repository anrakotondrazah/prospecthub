export interface CSVParseResult {
  headers: string[]
  rows: string[][]
  errors: string[]
}

export function parseCSV(text: string): CSVParseResult {
  const errors: string[] = []
  const lines = text.split(/\r?\n/).filter((line) => line.trim())

  if (lines.length === 0) {
    return { headers: [], rows: [], errors: ['Fichier vide'] }
  }

  const headers = parseCSVLine(lines[0])
  const rows: string[][] = []

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i])
    if (row.length !== headers.length) {
      errors.push(`Ligne ${i + 1}: ${row.length} colonnes au lieu de ${headers.length}`)
      continue
    }
    rows.push(row)
  }

  return { headers, rows, errors }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',' || char === ';') {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
  }

  result.push(current.trim())
  return result
}

export function generateCSV(headers: string[], rows: Record<string, unknown>[]): string {
  const escapeValue = (value: unknown): string => {
    const str = String(value ?? '')
    if (str.includes(',') || str.includes(';') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const headerLine = headers.map(escapeValue).join(',')
  const dataLines = rows.map((row) =>
    headers.map((h) => escapeValue(row[h])).join(',')
  )

  return [headerLine, ...dataLines].join('\n')
}

export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const LEAD_FIELD_MAPPINGS: Record<string, string[]> = {
  first_name: ['prenom', 'first_name', 'firstname', 'prénom', 'first name'],
  last_name: ['nom', 'last_name', 'lastname', 'nom de famille', 'last name'],
  email: ['email', 'e-mail', 'mail', 'courriel'],
  phone: ['telephone', 'phone', 'tel', 'téléphone', 'portable', 'mobile'],
  company_name: ['entreprise', 'company', 'company_name', 'societe', 'société', 'raison sociale'],
  company_siret: ['siret', 'siren', 'numero siret'],
  address_city: ['ville', 'city', 'commune'],
  address_postal_code: ['code postal', 'postal_code', 'cp', 'zip'],
  source: ['source', 'origine', 'provenance'],
}

export function autoMapColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}
  const normalizedHeaders = headers.map((h) => h.toLowerCase().trim())

  for (const [field, aliases] of Object.entries(LEAD_FIELD_MAPPINGS)) {
    for (const alias of aliases) {
      const index = normalizedHeaders.findIndex((h) => h === alias || h.includes(alias))
      if (index !== -1 && !Object.values(mapping).includes(headers[index])) {
        mapping[field] = headers[index]
        break
      }
    }
  }

  return mapping
}
