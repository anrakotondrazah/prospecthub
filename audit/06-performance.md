# Audit Performance - ProspectHub CRM

**Date**: 2026-11-26  
**Auditeur**: Agent Performance Senior  
**URL Production**: https://prospecthub-silk.vercel.app  
**Stack**: Next.js 16, React 19, TailwindCSS 4, Vercel Edge

---

## 1. Tableau des Mesures par Page

| Page | Metrique | Valeur Mesuree | Seuil Cible | Verdict |
|------|----------|----------------|-------------|---------|
| **/** (Landing) | TTFB | 77ms | <200ms | OK |
| | FCP | 544ms | <1800ms | OK |
| | LCP | - | <2500ms | NON MESURABLE |
| | DOM Content Loaded | 481ms | <1000ms | OK |
| | Load Complete | 514ms | <2000ms | OK |
| | JS Bundle | 146 KB | <200KB | OK |
| | CSS Bundle | 14 KB | <50KB | OK |
| | Total Resources | 19 | <30 | OK |
| **Score Landing** | | | | **95/100** |
| **Dashboard** | TTFB | 77-81ms | <200ms | OK |
| | FCP | **2160-2480ms** | <1800ms | ECHEC |
| | LCP | - | <2500ms | NON MESURABLE |
| | DOM Content Loaded | **2121-2420ms** | <1000ms | ECHEC |
| | Load Complete | **2150-2456ms** | <2000ms | ECHEC |
| | JS Bundle | 220 KB | <200KB | ALERTE |
| | Total Resources | **42** | <30 | ECHEC |
| | Prefetch Requests | **28** | <10 | ECHEC |
| | Console Errors | 2 | 0 | ECHEC |
| **Score Dashboard** | | | | **45/100** |
| **Leads** | TTFB | 100ms | <200ms | OK |
| | FCP | 1604ms | <1800ms | OK |
| | DOM Content Loaded | 1560ms | <1000ms | ALERTE |
| | Total Resources | 41 | <30 | ECHEC |
| **Score Leads** | | | | **65/100** |
| **Deals** | TTFB | 75ms | <200ms | OK |
| | FCP | **1912ms** | <1800ms | ALERTE |
| | DOM Content Loaded | 1876ms | <1000ms | ECHEC |
| **Score Deals** | | | | **60/100** |
| **Quotes** | TTFB | 74ms | <200ms | OK |
| | FCP | 1060ms | <1800ms | OK |
| | DOM Content Loaded | 1024ms | <1000ms | ALERTE |
| **Score Quotes** | | | | **80/100** |

**Seuils Web Vitals (Core)**:
- FCP: <1800ms (Good), 1800-3000ms (Needs Improvement), >3000ms (Poor)
- LCP: <2500ms (Good), 2500-4000ms (Needs Improvement), >4000ms (Poor)
- CLS: <0.1 (Good), 0.1-0.25 (Needs Improvement), >0.25 (Poor)

---

## 2. Tableau des Problemes de Performance

| ID | Type | Gravite | Localisation | Mesure | Cause | Correctif | Gain Estime |
|----|------|---------|--------------|--------|-------|-----------|-------------|
| P01 | RESEAU | CRITIQUE | Sidebar.tsx | 28 prefetch/page | Next.js Link prefetch par defaut sur 25+ liens visibles | Ajouter `prefetch={false}` sur liens non-critiques | -1200ms FCP |
| P02 | API | CRITIQUE | /api/activities | 404 en prod | Route non deployee ou mal configuree | Verifier structure API + build Vercel | Fonctionnel |
| P03 | API | CRITIQUE | /api/leads | 404 en prod | Route non deployee | Debug build output Vercel | Fonctionnel |
| P04 | API | CRITIQUE | /settings/credits | 404 en prod | Page non existante | Creer page ou retirer lien | -1 requete |
| P05 | BUNDLE | HAUTE | Dashboard | 220KB JS vs 146KB landing | Composants lourds charges | Code splitting + lazy loading | -40KB |
| P06 | RENDER | HAUTE | useProducts.ts, useQuotes.ts, etc. | 7 hooks | setState dans useEffect (cascading renders) | Migrer vers useSWR ou React Query | -200ms TTI |
| P07 | RESEAU | MOYENNE | Dashboard | 42 resources | Trop de requetes paralleles | Regrouper requetes, eliminer prefetch | -800ms Load |
| P08 | CONSOLE | MOYENNE | Dashboard | 2 erreurs | Erreurs JS non geres | Identifier et corriger | Stabilite |
| P09 | CACHE | FAIBLE | Static assets | 13 hits / 29 fetches | Certains assets non caches | Headers Cache-Control optimaux | -100ms revisites |
| P10 | FONTS | FAIBLE | Fonts woff2 | 51KB | Polices non subsettees | Font subsetting | -20KB |

---

## 3. Analyse Detaillee

### 3.1 Probleme Principal: Prefetching Excessif

**Constat**: Le dashboard charge 28 requetes de prefetch RSC (`_rsc=...`) correspondant a tous les liens du sidebar.

**Mecanisme**: Next.js App Router prefetch automatiquement tous les `<Link>` visibles dans le viewport. Avec 25+ liens dans le sidebar, cela cree une cascade de requetes.

**Impact**:
- FCP passe de 544ms (landing) a 2300ms+ (dashboard)
- 28 requetes x ~300 bytes = ~8.4KB de donnees inutiles
- Saturation reseau pendant le chargement initial

**Fichier concerne**: `src/components/layout/Sidebar.tsx`
```tsx
// PROBLEME: Tous ces liens sont prefetches
const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Inbox', href: '/inbox' },
  // ... 23 autres liens
]

// Utilisation actuelle (prefetch=true par defaut)
<Link href={item.href}>

// CORRECTIF:
<Link href={item.href} prefetch={false}>
```

### 3.2 Routes API 404 en Production

**Constat**: 2 routes prefetchees retournent 404:
- `/activities?_rsc=...` -> 404
- `/settings/credits?_rsc=...` -> 404

**APIs testees**:
| Endpoint | Status | TTFB |
|----------|--------|------|
| /api/notifications | 200 | 76ms |
| /api/leads | 404 | - |
| /api/activities | 404 | - |

**Cause probable**: 
- Routes API non incluses dans le build Vercel
- Structure dossier incorrecte pour App Router
- Voir audit backend B01 pour details

### 3.3 Bundle JavaScript

**Composition (Dashboard)**:
| Chunk | Taille Compressee | Taille Originale | Compression |
|-------|-------------------|------------------|-------------|
| 3_35d9wtvgt0h.js | 73 KB | 230 KB | 68% |
| 1idm78xyyyzm1.js | 46 KB | 164 KB | 72% |
| 2kdw3ev5-8r1a.css | 14 KB | 77 KB | 82% |
| Autres JS (8 chunks) | 87 KB | - | ~70% |
| **Total** | **220 KB** | **~550 KB** | **~70%** |

**Points positifs**:
- Compression Brotli/gzip active (70%+ ratio)
- Code splitting en place (chunks separes)

**Points a ameliorer**:
- Dashboard charge 74KB de plus que la landing
- Certains composants pourraient etre lazy-loaded

### 3.4 Cascading Renders (Anti-pattern React)

**7 hooks identifes avec le pattern problematique** (voir audit front F03-F08):
```typescript
// ANTI-PATTERN
useEffect(() => {
  fetchData() // Trigger setState -> re-render -> re-fetch
}, [fetchData])
```

**Impact performance**:
- Multiple re-renders au chargement
- DOM Content Loaded retarde de ~200ms
- Consommation memoire accrue

### 3.5 Layout Shift (CLS)

**Mesure**: CLS = 0

**Verdict**: Excellent - pas de decalage de mise en page detecte.

---

## 4. Synthese - Top 10 Goulots d'Etranglement

| Priorite | Probleme | Impact FCP | Impact Utilisateur | Effort |
|----------|----------|------------|-------------------|--------|
| 1 | Prefetch 28 liens sidebar | +1700ms | Lenteur ressentie | 1h |
| 2 | Routes API 404 | Bloquant | Fonctionnalites cassees | 2h |
| 3 | Cascading renders (7 hooks) | +200ms | Re-renders visibles | 4h |
| 4 | Bundle dashboard 220KB | +100ms | Chargement long | 2h |
| 5 | 42 resources chargees | +500ms | Saturation reseau | 2h |
| 6 | Console errors (2) | - | Bugs potentiels | 1h |
| 7 | Prefetch liens 404 | +50ms | Requetes inutiles | 30min |
| 8 | Fonts non subsettees | +20ms | Poids page | 1h |
| 9 | Cache headers | - | Revisites lentes | 30min |
| 10 | LCP non mesurable | - | Monitoring | 1h |

---

## 5. Score Performance Global

| Critere | Score | Max | Commentaire |
|---------|-------|-----|-------------|
| **Landing Page** | 95 | 100 | Excellente, cible atteinte |
| **Dashboard** | 45 | 100 | FCP critique (2.3s), prefetch excessif |
| **Leads** | 65 | 100 | FCP acceptable, trop de resources |
| **Deals** | 60 | 100 | FCP limite, DOM lent |
| **Quotes** | 80 | 100 | Bonne performance |
| **APIs** | 20 | 100 | Majorite 404, 1 seule fonctionnelle |

**Score Global: 61/100**

**Decomposition**:
- Core Web Vitals (FCP/LCP): 50/100
- Time to Interactive: 60/100
- Bundle Size: 70/100
- Network Efficiency: 40/100
- Compression: 90/100
- CLS: 100/100

---

## 6. Plan d'Optimisation

### Phase 1 - Quick Wins (1 jour)

| Action | Fichier | Impact | Effort |
|--------|---------|--------|--------|
| Ajouter `prefetch={false}` aux liens non-critiques | Sidebar.tsx | -1200ms FCP | 1h |
| Supprimer liens vers routes 404 | Sidebar.tsx | -2 requetes | 30min |
| Corriger console errors | Dashboard | Stabilite | 1h |

**Code a modifier**:
```tsx
// src/components/layout/Sidebar.tsx

// Liens critiques (garder prefetch)
const criticalLinks = ['/dashboard', '/leads', '/deals']

// Modification
<Link 
  href={item.href} 
  prefetch={criticalLinks.includes(item.href)}
>
```

### Phase 2 - Corrections Structurelles (3 jours)

| Action | Impact | Effort |
|--------|--------|--------|
| Migrer hooks vers useSWR | -200ms TTI | 4h |
| Lazy load composants secondaires | -40KB bundle | 3h |
| Debug routes API 404 | Fonctionnel | 2h |
| Implementer skeleton loaders | UX percue | 2h |

### Phase 3 - Optimisations Avancees (5 jours)

| Action | Impact |
|--------|--------|
| Font subsetting (Inter) | -20KB |
| Image optimization (next/image) | -variable |
| Service Worker caching | Offline ready |
| Bundle analyzer + tree shaking | -20-50KB |
| Rate limiting API | Securite |

---

## 7. Metriques Cibles Post-Optimisation

| Page | Metrique | Actuel | Cible Phase 1 | Cible Phase 3 |
|------|----------|--------|---------------|---------------|
| Dashboard | FCP | 2300ms | 1500ms | 1000ms |
| Dashboard | Load | 2400ms | 1800ms | 1200ms |
| Dashboard | Resources | 42 | 25 | 15 |
| Dashboard | JS Bundle | 220KB | 180KB | 150KB |

---

## 8. Outils de Monitoring Recommandes

| Outil | Usage | Priorite |
|-------|-------|----------|
| Vercel Analytics | Web Vitals production | HAUTE |
| Sentry Performance | Tracing + errors | HAUTE |
| Lighthouse CI | Regression testing | MOYENNE |
| Bundle Analyzer | Audit bundles | FAIBLE |

**Configuration Vercel Analytics**:
```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

---

## 9. Resume Executif

**Etat actuel**: Performance degradee sur les pages authentifiees (dashboard, leads, deals) due principalement au prefetching excessif de Next.js App Router.

**Cause racine**: 28 liens dans le sidebar declenchent chacun une requete de prefetch RSC au chargement.

**Impact business**: 
- FCP dashboard 2.3s (cible <1.8s)
- UX degradee, utilisateurs ressentent lenteur
- Consommation bande passante inutile

**Solution immediate**: Ajouter `prefetch={false}` aux liens non-critiques du sidebar. Gain attendu: -1200ms FCP.

**ROI**: 1h de travail pour 50% d'amelioration FCP.

---

**Fin de l'audit Performance**
