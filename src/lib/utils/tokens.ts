/**
 * Token Utils - Gestion des tokens de personnalisation
 *
 * Les tokens permettent de personnaliser les templates avec des données dynamiques
 * Format: [Label du token] (ex: [Prénom], [Entreprise], [Votre nom])
 */

export type TokenCategory = 'lead' | 'company' | 'deal' | 'user' | 'organization' | 'date'

export interface Token {
  id: string
  name: string
  label: string
  category: TokenCategory
  description: string
  example: string
  path: string // Le chemin pour acceder a la donnee (ex: lead.first_name)
}

export interface TokenContext {
  lead?: {
    first_name?: string | null
    last_name?: string | null
    email?: string | null
    phone?: string | null
    mobile?: string | null
    job_title?: string | null
    company_name?: string | null
    address_city?: string | null
  }
  company?: {
    name?: string | null
    website?: string | null
    industry?: string | null
    phone?: string | null
    email?: string | null
    address_city?: string | null
  }
  deal?: {
    name?: string | null
    value?: number | null
    currency?: string | null
    expected_close_date?: string | null
  }
  user?: {
    first_name?: string | null
    last_name?: string | null
    email?: string | null
    phone?: string | null
    job_title?: string | null
  }
  organization?: {
    name?: string | null
    website?: string | null
  }
}

// Liste des tokens disponibles
export const AVAILABLE_TOKENS: Token[] = [
  // Lead tokens
  {
    id: 'lead_first_name',
    name: 'lead.first_name',
    label: 'Prénom',
    category: 'lead',
    description: 'Prénom du lead',
    example: 'Jean',
    path: 'lead.first_name',
  },
  {
    id: 'lead_last_name',
    name: 'lead.last_name',
    label: 'Nom',
    category: 'lead',
    description: 'Nom de famille du lead',
    example: 'Dupont',
    path: 'lead.last_name',
  },
  {
    id: 'lead_full_name',
    name: 'lead.full_name',
    label: 'Nom complet',
    category: 'lead',
    description: 'Nom complet du lead',
    example: 'Jean Dupont',
    path: 'lead.full_name',
  },
  {
    id: 'lead_email',
    name: 'lead.email',
    label: 'Email',
    category: 'lead',
    description: 'Adresse email du lead',
    example: 'jean.dupont@email.com',
    path: 'lead.email',
  },
  {
    id: 'lead_phone',
    name: 'lead.phone',
    label: 'Téléphone',
    category: 'lead',
    description: 'Numéro de téléphone du lead',
    example: '01 23 45 67 89',
    path: 'lead.phone',
  },
  {
    id: 'lead_job_title',
    name: 'lead.job_title',
    label: 'Poste',
    category: 'lead',
    description: 'Intitulé de poste du lead',
    example: 'Directeur Commercial',
    path: 'lead.job_title',
  },
  {
    id: 'lead_company_name',
    name: 'lead.company_name',
    label: 'Entreprise',
    category: 'lead',
    description: 'Nom de l\'entreprise du lead',
    example: 'Acme Corp',
    path: 'lead.company_name',
  },
  {
    id: 'lead_city',
    name: 'lead.address_city',
    label: 'Ville',
    category: 'lead',
    description: 'Ville du lead',
    example: 'Paris',
    path: 'lead.address_city',
  },

  // Company tokens
  {
    id: 'company_name',
    name: 'company.name',
    label: 'Nom',
    category: 'company',
    description: 'Nom de l\'entreprise',
    example: 'Acme Corp',
    path: 'company.name',
  },
  {
    id: 'company_website',
    name: 'company.website',
    label: 'Site web',
    category: 'company',
    description: 'Site web de l\'entreprise',
    example: 'www.acme.com',
    path: 'company.website',
  },
  {
    id: 'company_industry',
    name: 'company.industry',
    label: 'Secteur',
    category: 'company',
    description: 'Secteur d\'activite',
    example: 'Technologie',
    path: 'company.industry',
  },
  {
    id: 'company_phone',
    name: 'company.phone',
    label: 'Téléphone',
    category: 'company',
    description: 'Numero de telephone de l\'entreprise',
    example: '01 98 76 54 32',
    path: 'company.phone',
  },
  {
    id: 'company_city',
    name: 'company.address_city',
    label: 'Ville',
    category: 'company',
    description: 'Ville de l\'entreprise',
    example: 'Lyon',
    path: 'company.address_city',
  },

  // Deal tokens
  {
    id: 'deal_name',
    name: 'deal.name',
    label: 'Nom',
    category: 'deal',
    description: 'Nom du deal',
    example: 'Contrat annuel',
    path: 'deal.name',
  },
  {
    id: 'deal_value',
    name: 'deal.value',
    label: 'Montant',
    category: 'deal',
    description: 'Montant du deal',
    example: '15 000 EUR',
    path: 'deal.value',
  },
  {
    id: 'deal_close_date',
    name: 'deal.expected_close_date',
    label: 'Date de clôture',
    category: 'deal',
    description: 'Date de clôture prevue',
    example: '15/12/2026',
    path: 'deal.expected_close_date',
  },

  // User tokens (expediteur)
  {
    id: 'user_first_name',
    name: 'user.first_name',
    label: 'Mon prénom',
    category: 'user',
    description: 'Votre prénom',
    example: 'Marie',
    path: 'user.first_name',
  },
  {
    id: 'user_last_name',
    name: 'user.last_name',
    label: 'Mon nom',
    category: 'user',
    description: 'Votre nom de famille',
    example: 'Martin',
    path: 'user.last_name',
  },
  {
    id: 'user_full_name',
    name: 'user.full_name',
    label: 'Mon nom complet',
    category: 'user',
    description: 'Votre nom complet',
    example: 'Marie Martin',
    path: 'user.full_name',
  },
  {
    id: 'user_email',
    name: 'user.email',
    label: 'Mon email',
    category: 'user',
    description: 'Votre adresse email',
    example: 'marie@prospecthub.fr',
    path: 'user.email',
  },
  {
    id: 'user_phone',
    name: 'user.phone',
    label: 'Mon téléphone',
    category: 'user',
    description: 'Votre numéro de téléphone',
    example: '06 12 34 56 78',
    path: 'user.phone',
  },
  {
    id: 'user_job_title',
    name: 'user.job_title',
    label: 'Mon poste',
    category: 'user',
    description: 'Votre intitulé de poste',
    example: 'Commercial',
    path: 'user.job_title',
  },

  // Organization tokens
  {
    id: 'org_name',
    name: 'organization.name',
    label: 'Nom entreprise',
    category: 'organization',
    description: 'Nom de votre entreprise',
    example: 'ProspectHub',
    path: 'organization.name',
  },
  {
    id: 'org_website',
    name: 'organization.website',
    label: 'Site web',
    category: 'organization',
    description: 'Site web de votre entreprise',
    example: 'www.prospecthub.fr',
    path: 'organization.website',
  },

  // Date tokens
  {
    id: 'date_today',
    name: 'date.today',
    label: 'Aujourd\'hui',
    category: 'date',
    description: 'Date du jour',
    example: '26/11/2026',
    path: 'date.today',
  },
  {
    id: 'date_tomorrow',
    name: 'date.tomorrow',
    label: 'Demain',
    category: 'date',
    description: 'Date de demain',
    example: '27/11/2026',
    path: 'date.tomorrow',
  },
  {
    id: 'date_next_week',
    name: 'date.next_week',
    label: 'Semaine prochaine',
    category: 'date',
    description: 'Dans une semaine',
    example: '03/12/2026',
    path: 'date.next_week',
  },
]

// Grouper les tokens par categorie
export function getTokensByCategory(): Record<TokenCategory, Token[]> {
  return AVAILABLE_TOKENS.reduce((acc, token) => {
    if (!acc[token.category]) {
      acc[token.category] = []
    }
    acc[token.category].push(token)
    return acc
  }, {} as Record<TokenCategory, Token[]>)
}

// Labels des categories
export const TOKEN_CATEGORY_LABELS: Record<TokenCategory, string> = {
  lead: 'Lead',
  company: 'Entreprise',
  deal: 'Deal',
  user: 'Expéditeur',
  organization: 'Mon organisation',
  date: 'Dates',
}

// Icones des categories (Lucide icon names)
export const TOKEN_CATEGORY_ICONS: Record<TokenCategory, string> = {
  lead: 'User',
  company: 'Building2',
  deal: 'Briefcase',
  user: 'UserCircle',
  organization: 'Building',
  date: 'Calendar',
}

// Regex pour detecter les tokens dans un texte (format [Label])
const TOKEN_REGEX = /\[([^\]]+)\]/g

/**
 * Extraire tous les tokens utilises dans un texte
 */
export function extractTokensFromText(text: string): string[] {
  const matches = text.match(TOKEN_REGEX)
  if (!matches) return []

  // Extraire les labels et trouver les noms de tokens correspondants
  const labels = [...new Set(matches.map(m => m.replace(/\[|\]/g, '')))]
  return labels
    .map(label => AVAILABLE_TOKENS.find(t => t.label === label)?.name)
    .filter((name): name is string => name !== undefined)
}

/**
 * Verifier si un token existe (par label ou par nom)
 */
export function isValidToken(tokenLabelOrName: string): boolean {
  return AVAILABLE_TOKENS.some(t => t.label === tokenLabelOrName || t.name === tokenLabelOrName)
}

/**
 * Obtenir la valeur d'un token depuis le contexte
 */
function getTokenValue(tokenName: string, context: TokenContext): string | null {
  // Gestion des tokens speciaux (full_name, dates)
  if (tokenName === 'lead.full_name') {
    const firstName = context.lead?.first_name || ''
    const lastName = context.lead?.last_name || ''
    return [firstName, lastName].filter(Boolean).join(' ') || null
  }

  if (tokenName === 'user.full_name') {
    const firstName = context.user?.first_name || ''
    const lastName = context.user?.last_name || ''
    return [firstName, lastName].filter(Boolean).join(' ') || null
  }

  // Tokens de date
  if (tokenName === 'date.today') {
    return formatDate(new Date())
  }

  if (tokenName === 'date.tomorrow') {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return formatDate(tomorrow)
  }

  if (tokenName === 'date.next_week') {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    return formatDate(nextWeek)
  }

  // Tokens normaux via path
  const parts = tokenName.split('.')
  let value: unknown = context

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = (value as Record<string, unknown>)[part]
    } else {
      return null
    }
  }

  // Formatage special pour les valeurs numeriques (montants)
  if (tokenName === 'deal.value' && typeof value === 'number') {
    const currency = context.deal?.currency || 'EUR'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Formatage pour les dates
  if (tokenName.includes('date') && typeof value === 'string') {
    try {
      return formatDate(new Date(value))
    } catch {
      return value
    }
  }

  return typeof value === 'string' ? value : null
}

/**
 * Formater une date en format francais
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Remplacer les tokens dans un texte par leurs valeurs
 * @param text - Le texte contenant les tokens
 * @param context - Le contexte avec les donnees
 * @param fallback - Texte a utiliser si le token n'a pas de valeur (defaut: token original)
 */
export function replaceTokens(
  text: string,
  context: TokenContext,
  fallback: 'keep' | 'empty' | 'placeholder' = 'placeholder'
): string {
  return text.replace(TOKEN_REGEX, (match, tokenLabel) => {
    // Trouver le token par son label
    const token = AVAILABLE_TOKENS.find(t => t.label === tokenLabel)
    if (!token) {
      return match // Label inconnu, garder tel quel
    }

    const value = getTokenValue(token.name, context)

    if (value !== null) {
      return value
    }

    // Gestion du fallback quand le token n'a pas de valeur
    switch (fallback) {
      case 'keep':
        return match // Garde le token tel quel
      case 'empty':
        return '' // Remplace par une chaine vide
      case 'placeholder':
        return `[${token.label}]` // Retourne le placeholder lisible
    }
  })
}

/**
 * Generer un apercu avec des donnees d'exemple
 */
export function generatePreview(text: string): string {
  // Creer un contexte avec des donnees d'exemple
  const exampleContext: TokenContext = {
    lead: {
      first_name: 'Jean',
      last_name: 'Dupont',
      email: 'jean.dupont@email.com',
      phone: '01 23 45 67 89',
      job_title: 'Directeur Commercial',
      company_name: 'Acme Corp',
      address_city: 'Paris',
    },
    company: {
      name: 'Acme Corp',
      website: 'www.acme.com',
      industry: 'Technologie',
      phone: '01 98 76 54 32',
      address_city: 'Lyon',
    },
    deal: {
      name: 'Contrat annuel',
      value: 15000,
      currency: 'EUR',
      expected_close_date: '2026-12-15',
    },
    user: {
      first_name: 'Marie',
      last_name: 'Martin',
      email: 'marie@prospecthub.fr',
      phone: '06 12 34 56 78',
      job_title: 'Commercial',
    },
    organization: {
      name: 'ProspectHub',
      website: 'www.prospecthub.fr',
    },
  }

  return replaceTokens(text, exampleContext, 'keep')
}

/**
 * Valider un template et retourner les erreurs
 */
export function validateTemplate(template: { subject?: string; body: string }): {
  isValid: boolean
  errors: string[]
  warnings: string[]
  usedTokens: Token[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  const usedTokenNames: string[] = []

  // Extraire les tokens du sujet et du body
  if (template.subject) {
    usedTokenNames.push(...extractTokensFromText(template.subject))
  }
  usedTokenNames.push(...extractTokensFromText(template.body))

  // Verifier chaque token
  const uniqueTokenNames = [...new Set(usedTokenNames)]
  const usedTokens: Token[] = []

  for (const tokenName of uniqueTokenNames) {
    const token = AVAILABLE_TOKENS.find(t => t.name === tokenName)
    if (token) {
      usedTokens.push(token)
    } else {
      errors.push(`Token inconnu: [${tokenName}]`)
    }
  }

  // Warnings pour les bonnes pratiques
  if (!template.body.trim()) {
    errors.push('Le corps du message ne peut pas être vide')
  }

  if (template.body.length > 10000) {
    warnings.push('Le message est très long (> 10 000 caractères)')
  }

  // Verifier qu'on a au moins un token de personnalisation (optionnel mais recommande)
  if (usedTokens.length === 0 && template.body.length > 50) {
    warnings.push('Conseil: Ajoutez des tokens de personnalisation pour un meilleur taux de réponse')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    usedTokens,
  }
}

/**
 * Inserer un token a la position du curseur
 */
export function insertTokenAtCursor(
  text: string,
  cursorPosition: number,
  token: Token
): { newText: string; newCursorPosition: number } {
  const tokenText = `[${token.label}]`
  const before = text.slice(0, cursorPosition)
  const after = text.slice(cursorPosition)

  return {
    newText: before + tokenText + after,
    newCursorPosition: cursorPosition + tokenText.length,
  }
}
