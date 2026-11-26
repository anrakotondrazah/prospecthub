# Audit Back-end et API - ProspectHub CRM

**Date**: 2026-11-26  
**Projet**: ProspectHub  
**API Prod**: https://prospecthub-silk.vercel.app/api  
**Stack**: Next.js 15 API Routes + Supabase (PostgreSQL + Auth + RLS)

---

## 1. Tableau des Endpoints

| Route | Methode | Auth | Validation | RLS | Verdict |
|-------|---------|------|------------|-----|---------|
| `/api/activities` | GET | Oui | entity_type enum, entity_id int, limit int | Oui | OK |
| `/api/activities` | POST | Oui | activity_type enum obligatoire | Oui | OK |
| `/api/activities/[id]` | GET | Oui | id int parse | Oui | OK |
| `/api/activities/[id]` | PATCH | Oui | allowedFields whitelist | Oui | OK |
| `/api/activities/[id]` | DELETE | Oui | id int parse | Oui | OK (soft delete) |
| `/api/associations` | GET | Oui | entity_type + entity_id requis | Oui | ALERTE N+1 |
| `/api/associations` | POST | Oui | 4 champs requis | Oui | OK (upsert) |
| `/api/associations` | DELETE | Oui | id requis | Oui | OK |
| `/api/documents` | GET | Oui | entity_type enum, pagination | Oui | OK |
| `/api/documents` | POST | Oui | name + file_url requis | Oui | OK |
| `/api/documents` | DELETE | Oui | id requis | Oui | OK (soft delete) |
| `/api/leads/import` | POST | Oui | leads[] requis, validation email/phone | Oui | OK |
| `/api/leads/unlock` | POST | Oui | shared_company_id requis | Oui | ALERTE atomicite |
| `/api/lists/[id]/members` | GET | Oui | pagination | Oui | OK |
| `/api/lists/[id]/members` | POST | Oui | lead_ids[] requis, type=static | Oui | OK |
| `/api/lists/[id]/members` | DELETE | Oui | member_ids ou lead_ids | Oui | OK |
| `/api/lists/[id]/members/bulk` | POST | Oui | action enum, validation cible | Oui | OK |
| `/api/meetings` | GET | Oui | filtres multiples, pagination | Oui | ALERTE N+1 |
| `/api/meetings` | POST | Oui | title + start_time + end_time | Oui | OK |
| `/api/meetings` | PATCH | Oui | id requis | Oui | OK |
| `/api/meetings` | DELETE | Oui | id requis | Oui | OK (hard delete) |
| `/api/notifications` | GET | Oui | user-scoped | Oui | OK |
| `/api/notifications/[id]/read` | PATCH | Oui | id int parse | Oui | OK |
| `/api/notifications/read-all` | PATCH | Oui | aucun param | Oui | OK |
| `/api/products` | GET | Oui | aucun filtre | Oui | OK |
| `/api/products` | POST | Oui | name + unit_price requis | Oui | OK |
| `/api/properties` | GET | Oui | entity_type optionnel | Oui | OK |
| `/api/properties` | POST | Oui | field_name + field_label + field_type + entity_type | Oui | OK |
| `/api/properties` | PUT | Oui | id requis | Oui | OK |
| `/api/properties` | DELETE | Oui | id requis | Oui | OK (cascade) |
| `/api/quotes` | GET | Oui | avec lignes + relations | Oui | OK |
| `/api/quotes` | POST | Oui | auto quote_number | Oui | OK |
| `/api/quotes/[uuid]` | GET | Oui | uuid param | Oui | OK |
| `/api/quotes/[uuid]` | PUT | Oui | gestion lignes | Oui | ALERTE atomicite |
| `/api/quotes/[uuid]` | DELETE | Oui | uuid param | Oui | OK (soft delete) |
| `/api/quotes/[uuid]/pdf` | POST | Oui | HTML escape XSS | Oui | OK |
| `/api/templates` | GET | Oui | is_active=true | Oui | OK |
| `/api/templates` | POST | Oui | name + body requis | Oui | OK |
| `/api/templates/[id]` | GET | Oui | id int parse | Oui | OK |
| `/api/templates/[id]` | PUT | Oui | name + body requis | Oui | OK |
| `/api/templates/[id]` | DELETE | Oui | id int parse | Oui | OK (hard delete) |
| `/api/templates/[id]/use` | POST | Oui | increment usage_count | Oui | OK |
| `/api/views` | GET | Oui | entity_type optionnel, shared filter | Oui | OK |
| `/api/views` | POST | Oui | name + entity_type requis | Oui | OK |
| `/api/views` | DELETE | Oui | ownership check 403 | Oui | OK |

**Legende**: OK = Conforme, ALERTE = Probleme identifie

---

## 2. Tableau des Problemes

| ID | Categorie | Gravite | Fichier:ligne | Description | Correctif |
|----|-----------|---------|---------------|-------------|-----------|
| B01 | Deploiement | CRITIQUE | - | Routes API retournent 404 en prod (sauf /api/notifications) | Verifier next.config.js, vercel.json, structure app router |
| B02 | Performance | HAUTE | associations/route.ts:75-137 | N+1 queries: Promise.all avec requetes individuelles par association | Utiliser requete unique avec JOIN ou RPC PostgreSQL |
| B03 | Performance | HAUTE | meetings/route.ts:127-139 | N+1 queries: requete attendees_count par meeting | Inclure count dans la requete principale ou RPC |
| B04 | Atomicite | HAUTE | leads/unlock/route.ts:95-150 | Transaction non atomique: 4 operations separees sans rollback | Utiliser la fonction SQL unlock_lead() existante ou transaction |
| B05 | Atomicite | MOYENNE | quotes/[uuid]/route.ts:138-177 | Delete + Insert lignes sans transaction, risque perte si erreur | Wrapper dans transaction Supabase |
| B06 | Validation | MOYENNE | associations/route.ts:48 | entity_type cast unsafe en EntityType sans validation enum | Ajouter validation explicite des valeurs autorisees |
| B07 | Validation | MOYENNE | plusieurs | Pas de validation Zod/Yup, validation manuelle | Ajouter schema validation avec Zod |
| B08 | Coherence | FAIBLE | templates/[id]/route.ts:177-179 | Hard delete template vs soft delete ailleurs | Uniformiser avec soft delete |
| B09 | Coherence | FAIBLE | meetings/route.ts:430-434 | Hard delete meeting vs soft delete docs/activities | Uniformiser avec soft delete |
| B10 | Securite | FAIBLE | plusieurs | Pas de rate limiting sur endpoints sensibles | Ajouter rate limiting Vercel/middleware |
| B11 | Logs | FAIBLE | plusieurs | console.error expose potentiellement des infos sensibles | Utiliser logger structure sans donnees sensibles |
| B12 | Types | FAIBLE | activities/route.ts:124-126 | Mapping user.id (UUID) vers users.id (int) via requete | Stocker user_id UUID directement dans activities |
| B13 | Performance | FAIBLE | products/route.ts:32-36 | SELECT * sans pagination | Ajouter pagination par defaut |
| B14 | Validation | FAIBLE | documents/route.ts:174 | file_url non valide comme URL | Ajouter validation URL format |
| B15 | IDOR | FAIBLE | tous endpoints | Protection par organization_id OK mais pas de verification owner_id | Ajouter check owner_id pour operations sensibles |

---

## 3. Analyse du Modele de Donnees

### 3.1 Migrations SQL (11 fichiers)

| Migration | Tables | RLS | Index | Triggers | Verdict |
|-----------|--------|-----|-------|----------|---------|
| 001_initial_schema | 17 tables core | Oui | Basiques | on_auth_user_created | OK |
| 002_credits_system | credit_transactions, unlocked_leads | Oui | Oui | - | OK + fonction unlock_lead |
| 003_lists | lists, list_members | Oui | Oui | member_count auto | OK |
| 004_notifications | notifications | Oui | Oui | cleanup_old_notifications | OK |
| 005_associations | associations | Oui | Oui | get_entity_associations | OK |
| 006_views_properties | saved_views, custom_properties, custom_property_values | Oui | Oui | timestamps + single_default | OK |
| 007_message_templates | message_templates, template_categories | Oui | Oui | timestamps + increment_usage | OK |
| 008_documents | documents, document_versions, document_access_logs | Oui | Oui | timestamps + auto_version | OK |
| 009_meetings | meetings, meeting_attendees, meeting_notes | Oui | Oui | timestamps + create_activity | OK |
| 010_quotes | products, quotes, quote_lines | Oui | Oui | calculate_totals + generate_number | OK |
| 011_storage_policies | storage.objects policies | Oui | - | - | OK |

### 3.2 Points Positifs
- RLS (Row Level Security) active sur TOUTES les tables
- Policies coherentes basees sur organization_id via profiles
- Triggers automatiques pour updated_at, member_count, quote_totals
- Fonctions SECURITY DEFINER pour operations sensibles
- Soft delete implemente sur entites principales
- UUID + ID int pour flexibilite references
- Index sur colonnes frequemment filtrees

### 3.3 Points d'Attention
- Table `users` distincte de `profiles` avec mapping UUID/int (complexite)
- Pas de contraintes CHECK sur certains enums (status, type)
- Pas de partitioning sur tables potentiellement volumineuses (activity_logs)

---

## 4. Analyse de Securite

### 4.1 Authentification
- **Methode**: Supabase Auth via `supabase.auth.getUser()`
- **Verification**: Presente dans TOUS les endpoints
- **Reponse 401**: Format JSON coherent `{success: false, message: 'Non authentifie'}`

### 4.2 Autorisation (Multi-tenant)
- **Isolation**: Toutes les requetes filtrees par `organization_id`
- **Obtention org_id**: Via table `profiles` liee a `auth.uid()`
- **RLS**: Double protection cote PostgreSQL

### 4.3 Protections Implementees
- Escape HTML dans generation PDF (XSS)
- Validation parseInt sur IDs numeriques
- Whitelist de champs modifiables (PATCH activities)
- Verification appartenance liste avant ajout membres
- Verification credits avant deblocage lead

### 4.4 Risques Residuels
- Pas de CORS explicite (gere par Vercel/Next.js)
- Pas de rate limiting
- Pas de validation schema stricte (Zod)
- Pas d'audit trail systematique sur modifications

---

## 5. Gestion des Erreurs

### 5.1 Codes HTTP
| Code | Usage | Coherence |
|------|-------|-----------|
| 200 | Succes GET/PATCH/DELETE | OK |
| 201 | Succes POST creation | OK |
| 400 | Validation echouee, params invalides | OK |
| 401 | Non authentifie | OK |
| 403 | Non autorise (views ownership) | OK mais rare |
| 404 | Ressource non trouvee | OK |
| 500 | Erreur serveur | OK |

### 5.2 Format Reponse
```typescript
// Succes
{ success: true, [entity]: data }

// Erreur
{ success: false, message: string }
```

### 5.3 Messages
- Messages utilisateur en francais
- Pas d'exposition stack traces
- console.error cote serveur uniquement

---

## 6. Performance et Requetes

### 6.1 Problemes N+1 Identifies

**associations/route.ts:75-137**
```typescript
// PROBLEME: requete par association
const associations = await Promise.all(
  (rawAssociations || []).map(async (assoc) => {
    // 1 requete par type d'entite
    if (assoc.related_type === 'leads') {
      const { data } = await supabase.from('leads').select(...).eq('id', assoc.related_id).single()
    }
    // ...
  })
)
```

**meetings/route.ts:127-139**
```typescript
// PROBLEME: requete count par meeting
const meetingsWithAttendees = await Promise.all(
  (meetings || []).map(async (meeting) => {
    const { count } = await supabase.from('meeting_attendees').select('*', { count: 'exact', head: true }).eq('meeting_id', meeting.id)
  })
)
```

### 6.2 Pagination
- **Implementee**: documents, lists/members, meetings, activities
- **Manquante**: products, templates (risque si volumetrie importante)

### 6.3 Transactions
- **unlock_lead**: Fonction SQL atomique disponible mais non utilisee par l'API
- **quotes/lines**: Pas de transaction, risque d'etat inconsistant

---

## 7. Synthese - 10 Problemes Prioritaires

| Prio | ID | Probleme | Impact | Effort | Action |
|------|----|---------|---------| -------|--------|
| 1 | B01 | Routes 404 en prod | Bloquant | 1h | Debug deploiement Vercel |
| 2 | B04 | Unlock lead non atomique | Perte credits | 2h | Utiliser unlock_lead() SQL |
| 3 | B02 | N+1 associations | Perf degradee | 3h | JOIN ou RPC batch |
| 4 | B03 | N+1 meetings attendees | Perf degradee | 2h | Subquery count |
| 5 | B05 | Quotes lines non atomique | Perte donnees | 2h | Transaction wrapper |
| 6 | B07 | Pas de validation schema | Bugs runtime | 4h | Integrer Zod |
| 7 | B10 | Pas de rate limiting | DoS possible | 2h | Vercel rate limit |
| 8 | B06 | entity_type non valide | Erreur silencieuse | 1h | Enum validation |
| 9 | B08/B09 | Delete inconsistant | Perte audit trail | 1h | Uniformiser soft delete |
| 10 | B13 | Products sans pagination | Memoire | 1h | Ajouter limit/offset |

---

## 8. Score de Robustesse

| Critere | Score | Max | Commentaire |
|---------|-------|-----|-------------|
| Authentification | 10 | 10 | Tous endpoints proteges |
| Autorisation | 9 | 10 | RLS + org_id, owner_id partiel |
| Validation | 6 | 10 | Basique, pas de schema |
| Gestion erreurs | 8 | 10 | Coherent, messages securises |
| Performance | 5 | 10 | N+1 critiques, pagination partielle |
| Atomicite | 4 | 10 | Transactions manquantes |
| Documentation | 7 | 10 | JSDoc present, pas OpenAPI |
| Tests | - | 10 | Non evalues |

**Score Global: 6.1 / 10**

---

## 9. Recommandations Immediates

### Sprint 3 - Corrections Critiques
1. **Debug 404 Vercel** - Verifier:
   - Structure `src/app/api/` conforme App Router
   - `next.config.js` sans rewrites bloquants
   - Logs Vercel pour erreurs build
   
2. **Atomicite unlock_lead** - Remplacer:
   ```typescript
   // AVANT: 4 operations manuelles
   // APRES: appel fonction SQL
   const { data, error } = await supabase.rpc('unlock_lead', {
     p_org_id: orgId,
     p_shared_company_id: shared_company_id,
     p_user_id: user.id
   })
   ```

3. **Fix N+1 associations** - Utiliser RPC existant ou:
   ```sql
   SELECT a.*, 
     CASE WHEN a.related_type = 'leads' THEN l.name END as related_name
   FROM get_entity_associations(...) a
   LEFT JOIN leads l ON a.related_type = 'leads' AND l.id = a.related_id
   -- ...
   ```

### Moyen Terme
- Integrer Zod pour validation schemas
- Ajouter rate limiting middleware
- Uniformiser soft delete
- Ajouter tests integration API

---

**Fin de l'audit Back-end**
