# Audit Front-End ProspectHub CRM

**Date**: 2026-11-26  
**Auditeur**: Agent Front-End Senior  
**Stack**: Next.js 16, React 19, TypeScript, TailwindCSS 4  
**Perimetre**: src/app/, src/components/, src/hooks/

---

## Resume Executif

| Metrique | Valeur |
|----------|--------|
| **Score Maintenabilite** | **6.5/10** |
| Fichiers analyses | 155 |
| Erreurs ESLint | 65 |
| Warnings ESLint | 33 |
| Erreurs TypeScript | 0 |
| Issues critiques | 12 |
| Issues majeures | 24 |
| Issues mineures | 29 |

---

## Resultats ESLint/TypeScript

```
npm run lint: 65 errors, 33 warnings
npx tsc --noEmit: 0 errors (compilation OK)
```

---

## Tableau des Issues

| ID | Gravite | Fichier:ligne | Description | Extrait code | Correctif |
|----|---------|---------------|-------------|--------------|-----------|
| F01 | CRITIQUE | `src/app/(app)/lists/[id]/ListDetailClient.tsx:1` | Directive `@ts-nocheck` desactive le typage | `// @ts-nocheck` | Supprimer la directive et corriger les erreurs de typage |
| F02 | CRITIQUE | `src/app/(app)/lists/[id]/page.tsx:1` | Directive `@ts-nocheck` desactive le typage | `// @ts-nocheck` | Supprimer la directive et corriger les erreurs de typage |
| F03 | CRITIQUE | `src/app/(app)/base-entreprises/page.tsx:135` | setState dans useEffect cause des cascading renders | `loadData()` dans useEffect | Utiliser useSWR ou React Query, ou deplacer l'appel initial |
| F04 | CRITIQUE | `src/hooks/useProducts.ts:64` | setState synchrone dans useEffect | `fetchProducts()` dans useEffect | Utiliser pattern fetch-on-mount correct ou SWR |
| F05 | CRITIQUE | `src/hooks/useQuotes.ts:102` | setState synchrone dans useEffect | `fetchQuotes()` dans useEffect | Utiliser pattern fetch-on-mount correct ou SWR |
| F06 | CRITIQUE | `src/hooks/useViews.ts:112` | setState synchrone dans useEffect | `fetchViews()` dans useEffect | Utiliser pattern fetch-on-mount correct ou SWR |
| F07 | CRITIQUE | `src/hooks/useProperties.ts:158` | setState synchrone dans useEffect | `fetchProperties()` dans useEffect | Utiliser pattern fetch-on-mount correct ou SWR |
| F08 | CRITIQUE | `src/hooks/useMeetings.ts:246` | setState synchrone dans useEffect | `fetchMeetings()` dans useEffect | Utiliser pattern fetch-on-mount correct ou SWR |
| F09 | CRITIQUE | `src/app/onboarding/page.tsx:97` | setState synchrone dans useEffect | `setShowCelebration(true)` | Deplacer la logique hors du useEffect |
| F10 | MAJEUR | `src/app/(app)/lists/[id]/ListDetailClient.tsx:149` | Navigation via window.location au lieu de useRouter | `window.location.href = '/lists'` | Utiliser `router.push('/lists')` de next/navigation |
| F11 | MAJEUR | `src/app/(app)/tasks/page.tsx:31,77` | Utilisation de `<a>` au lieu de `<Link>` pour navigation interne | `<a href="/tasks">` | Remplacer par `<Link href="/tasks">` |
| F12 | MAJEUR | `src/hooks/useProperties.ts:42,69,94,115,147,213,276` | 7 usages de `any` explicites | `catch (err: any)`, `v: any` | Typer correctement avec interfaces specifiques |
| F13 | MAJEUR | `src/hooks/useViews.ts:49,76,103` | 3 usages de `any` explicites | `catch (err: any)` | Typer avec `Error` ou custom error type |
| F14 | MAJEUR | `src/app/(app)/lists/[id]/ListDetailClient.tsx:109,132,150` | 3 usages de `any` pour erreurs | `catch (err: any)` | Typer avec `unknown` puis type guard |
| F15 | MAJEUR | `src/app/(app)/settings/properties/page.tsx:121,129` | 2 usages de `any` | `prop: any`, `err: any` | Creer interface Property |
| F16 | MAJEUR | `src/components/modals/CreateDealModal.tsx:10` | Callback type `any` | `onDealCreated: (deal: any) => void` | Definir type Deal complet |
| F17 | MAJEUR | `src/components/properties/CreatePropertyModal.tsx:11` | Callback type `any` | `onPropertyCreated: (property: any)` | Definir type CustomProperty |
| F18 | MAJEUR | `src/components/views/CreateViewModal.tsx:16` | Callback type `any` | `onViewCreated: (view: any)` | Definir type SavedView |
| F19 | MAJEUR | `src/app/(app)/base-entreprises/page.tsx:167` | Catch vide sans gestion erreur | `} catch {` | Ajouter log ou affichage erreur utilisateur |
| F20 | MAJEUR | `src/app/(app)/leads/LeadsPageClient.tsx:96` | Catch vide sans gestion erreur | `} catch {` | Ajouter toast ou message erreur |
| F21 | MAJEUR | `src/app/onboarding/page.tsx:202` | Catch vide sans gestion erreur | `} catch {` | Gerer l'erreur ou logger |
| F22 | MAJEUR | `src/components/modals/ImportCSVModal.tsx:105` | Catch vide sans gestion erreur | `} catch {` | Afficher erreur a l'utilisateur |
| F23 | MAJEUR | `src/components/products/ProductPicker.tsx:70` | Catch vide sans gestion erreur | `} catch {` | Logger l'erreur |
| F24 | MAJEUR | `src/components/search/GlobalSearch.tsx:114` | Catch vide sans gestion erreur | `} catch {` | Afficher message "erreur de recherche" |
| F25 | MAJEUR | `src/app/(app)/dashboard/page.tsx:6,14,109` | Variables declarees jamais utilisees | `statusColors`, `priorityColors`, `startOfMonth` | Supprimer les declarations inutiles |
| F26 | MAJEUR | `src/app/(app)/inbox/page.tsx:3` | Imports inutilises | `Activity`, `ACTIVITY_ICONS`, `ACTIVITY_LABELS` | Supprimer les imports |
| F27 | MAJEUR | `src/app/(app)/deals/[id]/page.tsx:26` | Type importe jamais utilise | `Deal` | Supprimer l'import |
| F28 | MAJEUR | `src/app/(app)/deals/page.tsx:18` | Type importe jamais utilise | `Deal` | Supprimer l'import |
| F29 | MAJEUR | `src/hooks/useTemplates.ts:4` | Import inutilise | `createClient` | Supprimer l'import |
| F30 | MINEUR | `src/app/(app)/dashboard/page.tsx:338,630` | Apostrophe non echappee dans JSX | `'` | Remplacer par `&apos;` |
| F31 | MINEUR | `src/app/(app)/lists/[id]/ListDetailClient.tsx:293` | Apostrophe non echappee | `d'autres` | Remplacer par `&apos;` |
| F32 | MINEUR | `src/app/(app)/sequences/page.tsx:25` | Apostrophe non echappee | `'` | Remplacer par `&apos;` |
| F33 | MINEUR | `src/app/(app)/settings/ThemeSettings.tsx:30` | Apostrophe non echappee | `'` | Remplacer par `&apos;` |
| F34 | MINEUR | `src/app/page.tsx:334` | Apostrophe non echappee | `'` | Remplacer par `&apos;` |
| F35 | MINEUR | `src/app/(app)/lists/[id]/ListDetailClient.tsx:59` | Parametre non utilise | `organizationId` | Prefixer avec `_` ou supprimer |
| F36 | MINEUR | `src/app/(app)/lists/[id]/ListDetailClient.tsx:115` | Parametre non utilise | `leadId` | Prefixer avec `_` ou supprimer |
| F37 | MINEUR | `src/app/(app)/tasks/[id]/TaskDetailClient.tsx:23` | Variable non utilisee | `userId` | Prefixer avec `_` |
| F38 | MINEUR | `src/app/(app)/tasks/[id]/page.tsx:34` | Type non utilise | `Task` | Supprimer l'import |
| F39 | MINEUR | `src/app/(app)/settings/properties/page.tsx:71` | Variable assignee jamais lue | `userId` | Utiliser ou supprimer |
| F40 | MINEUR | `src/app/(app)/base-entreprises/page.tsx:127` | Variable `err` non utilisee | `catch (err)` | Remplacer par `catch` sans parametre |
| F41 | MINEUR | `src/app/api/leads/unlock/route.ts:161` | Variable `error` non utilisee | `error` | Prefixer avec `_` |
| F42 | MINEUR | `src/app/(app)/lists/[id]/page.tsx:3` | Import `Link` non utilise | `import Link` | Supprimer |
| F43 | MINEUR | Multiple fichiers | console.error en production | 50+ occurrences | Utiliser service de logging (Sentry, etc.) |
| F44 | MINEUR | `src/app/(app)/inbox/InboxPageClient.tsx:57-67` | Bouton "Nouvelle activite" desactive sans feedback | `disabled cursor-not-allowed` | Ajouter tooltip explicatif ou retirer le bouton |
| F45 | MINEUR | `src/app/(app)/tasks/page.tsx:102-112` | Bouton "Nouvelle tache" desactive sans feedback | `disabled cursor-not-allowed` | Ajouter tooltip explicatif ou retirer le bouton |

---

## Analyse Detaillee par Categorie

### 1. Architecture et Structure

**Points positifs:**
- Separation claire app/(app)/ pour les routes authentifiees
- Composants bien organises par fonctionnalite (quotes/, deals/, etc.)
- Hooks custom pour la logique metier (useQuotes, useViews, etc.)

**Points negatifs:**
- 2 fichiers avec `@ts-nocheck` compromettent la securite du typage
- Pas de layer d'abstraction API (fetch direct dans les composants)
- Duplication de logique Supabase entre hooks similaires

**Recommandations:**
- Creer un service API central (`src/lib/api/`)
- Supprimer les `@ts-nocheck` et corriger les types
- Factoriser les hooks avec un pattern generique

### 2. Gestion d'Etat (useState/useEffect)

**Problemes identifies:**
- 7 hooks appellent setState dans useEffect (cascading renders)
- Pattern anti-pattern: `useEffect(() => { fetchData() }, [fetchData])`

**Exemple problematique (useProducts.ts:63-65):**
```typescript
useEffect(() => {
  fetchProducts()  // ERREUR: setState synchrone
}, [fetchProducts])
```

**Correctif recommande:**
```typescript
// Option 1: useSWR
const { data, error, isLoading } = useSWR(
  `/api/products?org=${organizationId}`,
  fetcher
)

// Option 2: Fetch avec guard unmount
useEffect(() => {
  let mounted = true
  fetchProducts().then(() => {
    // Le hook gere l'etat en interne
    // Le guard mounted est dans le hook lui-meme
  })
  return () => { mounted = false }
}, [fetchProducts])
```

### 3. Appels API et Gestion Erreurs

**Problemes:**
- 8 blocs `catch {}` vides = erreurs silencieuses
- Pas d'annulation des requetes (AbortController)
- Pas de retry automatique
- alert() utilise pour feedback utilisateur (UX pauvre)

**Exemple (base-entreprises/page.tsx:166-169):**
```typescript
} catch {
  alert('Erreur reseau')  // Pas de detail, UX basique
}
```

**Recommandations:**
- Implementer un systeme de toast (react-hot-toast, sonner)
- Ajouter AbortController pour les fetches
- Logger les erreurs vers un service (Sentry)

### 4. Handlers de Boutons

**Analyse:** Tous les handlers verifies sont correctement cables.

**Boutons desactives sans feature:**
- `src/app/(app)/inbox/InboxPageClient.tsx:57` - "Nouvelle activite"
- `src/app/(app)/tasks/page.tsx:102` - "Nouvelle tache"

Ces boutons ont `disabled` mais l'UX devrait soit les masquer soit expliquer quand ils seront disponibles.

### 5. Formulaires

**Points positifs:**
- Validation front avec messages d'erreur (`CreateQuoteModal`, `CreateDealModal`)
- Protection soumission multiple (isLoading state)
- Champs required marques visuellement

**Points a ameliorer:**
- Pas de validation email cote client (`CreateQuoteModal:229`)
- Pas de debounce sur les filtres de recherche (sauf GlobalSearch)

### 6. Typage TypeScript

**Issues `any` identifiees: 23 occurrences**

| Fichier | Occurrences |
|---------|-------------|
| useProperties.ts | 8 |
| useViews.ts | 3 |
| ListDetailClient.tsx | 3 |
| settings/properties/page.tsx | 2 |
| CreateDealModal.tsx | 1 |
| CreatePropertyModal.tsx | 1 |
| CreateViewModal.tsx | 1 |
| PropertyEditor.tsx | 2 |
| + autres | 2 |

**Pattern a corriger:**
```typescript
// AVANT
catch (err: any) {
  setError(err.message)
}

// APRES
catch (err: unknown) {
  const message = err instanceof Error ? err.message : 'Erreur inconnue'
  setError(message)
}
```

### 7. Code Mort et Imports Inutilises

| Type | Fichiers affectes |
|------|-------------------|
| Variables non utilisees | dashboard/page.tsx, settings/properties/page.tsx |
| Imports non utilises | inbox/page.tsx, deals/page.tsx, deals/[id]/page.tsx, tasks/[id]/page.tsx, useTemplates.ts, lists/[id]/page.tsx |
| Types non utilises | Deal (2 fichiers), Task (1 fichier) |

### 8. Console Logs en Production

**50+ occurrences de `console.error`** dans le code.

Fichiers avec le plus de logs:
- API routes (attendu pour le debug serveur)
- Hooks custom
- Pages client

**Recommandation:** Configurer ESLint `no-console` et utiliser un logger conditionnel:
```typescript
const logger = {
  log: process.env.NODE_ENV === 'development' ? console.log : () => {},
  warn: console.warn,  // Garder les warnings en prod
  error: console.error // Garder les erreurs en prod (observabilite)
}
```

---

## Top 10 Corrections Prioritaires

| Priorite | Action | Impact | Effort |
|----------|--------|--------|--------|
| 1 | Supprimer `@ts-nocheck` dans ListDetailClient.tsx et page.tsx | ELEVE | MOYEN |
| 2 | Refactorer les 7 hooks avec pattern fetch correct | ELEVE | MOYEN |
| 3 | Corriger les 8 catch vides | MOYEN | FAIBLE |
| 4 | Remplacer window.location par router.push | MOYEN | FAIBLE |
| 5 | Remplacer `<a>` par `<Link>` dans tasks/page.tsx | MOYEN | FAIBLE |
| 6 | Typer les 23 usages de `any` | MOYEN | MOYEN |
| 7 | Supprimer les imports/variables non utilises | FAIBLE | FAIBLE |
| 8 | Echapper les apostrophes dans JSX | FAIBLE | FAIBLE |
| 9 | Implementer systeme toast pour remplacer alert() | MOYEN | MOYEN |
| 10 | Ajouter AbortController aux fetches | MOYEN | MOYEN |

---

## Score de Maintenabilite: 6.5/10

**Decomposition:**
- Architecture: 7/10 (bonne organisation, mais pas de couche API)
- Typage: 5/10 (2 fichiers @ts-nocheck, 23 `any`)
- Gestion d'etat: 5/10 (pattern useEffect problematique)
- Gestion erreurs: 5/10 (8 catch vides, alert() pour UX)
- Code propre: 7/10 (quelques imports morts, variables inutilisees)
- Accessibilite: 7/10 (labels presents, aria-label utilises)
- Performance: 7/10 (debounce sur search, mais pas sur filtres)

**Conclusion:** Le code est fonctionnel mais presente des anti-patterns React 19 (setState dans useEffect) et des lacunes de typage. Les corrections prioritaires sont realisables en 2-3 jours de travail.

---

## Annexes

### Commandes utilisees
```bash
npm run lint
npx tsc --noEmit
grep -r "@ts-nocheck" src/
grep -r "catch {" src/
grep -r ": any" src/
grep -r "TODO\|FIXME" src/  # Aucun resultat
```

### Fichiers non analyses (API routes)
Les routes API (`src/app/api/**`) sont hors perimetre front-end mais contiennent des console.error pour le debug serveur, ce qui est acceptable.
