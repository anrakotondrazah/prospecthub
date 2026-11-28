# Graph Report - PROSPECTHUB  (2026-11-28)

## Corpus Check
- 273 files · ~196,138 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 1, .ico 1, .css 1)

## Summary
- 1572 nodes · 2755 edges · 118 communities (106 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cd0afd42`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- lucide-react
- SettingsClient.tsx
- Loader
- 7. Paramètres de l’espace de travail
- tokens.ts
- createClient
- ListFiltersEditor.tsx
- Sidebar.tsx
- onboarding/page.tsx
- Audit UX - ProspectHub
- RAPPORT FINAL D'AUDIT - ProspectHub CRM
- 5. Mes préférences
- 2. RAPPORT DE BUGS
- next
- MeetingsPageClient.tsx
- Audit Back-end et API - ProspectHub CRM
- server.ts
- buttons/index.tsx
- TicketCard.tsx
- FillButton
- SequenceDetailClient.tsx
- reports/page.tsx
- QuoteEditor.tsx
- Audit Design UI - ProspectHub
- SequencesPageClient.tsx
- Audit Performance - ProspectHub CRM
- package.json
- compilerOptions
- Analyse Detaillee par Categorie
- InboxPageClient.tsx
- LeadsTable.tsx
- dependencies
- ListDetailClient.tsx
- DocumentList.tsx
- AssociateRecordModal.tsx
- Annexe A — Paramètres opérationnels des communications, appels et automatisations
- A.3 E-mail — connexions, envoi, suivi et planification
- ProductsPageClient.tsx
- createClient
- tasks/[id]/page.tsx
- LogCallModal.tsx
- deals/[id]/page.tsx
- QuotesPageClient.tsx
- supabase/client.ts
- useActivities.ts
- ActivityTimelineItem.tsx
- ProspectHub
- dashboard/page.tsx
- ImportCSVModal.tsx
- ProspectHub — Spécification du menu Compte et des paramètres
- 11. Phases concrètes de conception et de création
- 3.2 Ordre recommandé des blocs
- Audit Accessibilite et Qualite Redactionnelle - ProspectHub
- Checklist Review
- Regles Subagents - Optimisation Tokens
- useLists.ts
- A.12 Automatisations (workflows) — réglages, déclencheurs, actions et garde-fous
- A.18 Ordre de construction étendu
- react
- leads/[id]/page.tsx
- Executor Backend Agent
- Executor Feature Agent
- import/route.ts
- demo/page.tsx
- SequenceStepBuilder.tsx
- A.13 Intégrations tierces, OAuth et secrets
- A.25 Parcours et micro-copie concrets à implémenter
- A.4 Appels et téléphonie intégrés
- Audit ProspectHub - Phase 0 : Preparation
- Executor UI Agent
- tasks/page.tsx
- 6. Mon accès et ma sécurité
- Explorer Agent
- Planner Agent
- eslint.config.mjs
- bulk/route.ts
- sequences/route.ts
- deals/page.tsx
- SuccessMessage.tsx
- 10. Parcours utilisateur principaux
- 12. Critères d’acceptation produit et technique
- 9. Recherche, micro-copie et modèles d’écran
- A.16 États, événements et données à prévoir par intégration
- A.19 Check-list d’acceptation spécifique
- A.20 Prompts d’aide ciblés pour Claude Code
- A.27 Plan de réglages par rôle — quoi laisser au membre et quoi garder délégué
- A.9 Modèles, signatures et bibliothèques de contenu
- next-intl
- scripts
- pdf/route.ts
- [uuid]/route.ts
- preferences/route.ts
- quotes/[uuid]/page.tsx
- UploadDocumentModal.tsx
- EnrollmentRow.tsx
- A.10 Tâches, rappels et calendrier de travail
- A.11 Séquences de prospection
- A.14 Guides intégrés pour les clients non techniques
- A.24 Modèle de configuration piloté par schéma
- A.5 SMS
- A.6 WhatsApp Business
- A.8 Calendriers, rendez-vous et disponibilités
- documents/route.ts
- templates/[id]/route.ts
- securite/page.tsx
- 1. But et décisions structurantes
- 4. Architecture de la page Paramètres
- unlock/route.ts
- api/members/route.ts
- quotes/route.ts
- templates/route.ts
- database.ts
- AGENTS.md
- react-dom@19.3.0
- @supabase/ssr
- @supabase/supabase-js@^2.119.2
- tailwind-merge

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 146 edges
2. `react` - 99 edges
3. `next` - 92 edges
4. `createClient()` - 91 edges
5. `FillButton` - 67 edges
6. `Loader()` - 42 edges
7. `Annexe A — Paramètres opérationnels des communications, appels et automatisations` - 30 edges
8. `lucide-react` - 21 edges
9. `ProspectHub — Spécification du menu Compte et des paramètres` - 17 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `2.1 Menu du compte` --references--> `SettingsClient()`  [INFERRED]
  00_REFERENCES/analysis/14_SPEC_MENU_COMPTE_ET_PARAMETRES.md → src/app/(app)/settings/SettingsClient.tsx
- `2.2 Paramètres actuels` --references--> `ThemeSettings()`  [INFERRED]
  00_REFERENCES/analysis/14_SPEC_MENU_COMPTE_ET_PARAMETRES.md → src/app/(app)/settings/ThemeSettings.tsx
- `Tableau des Issues` --references--> `fetchProperties()`  [INFERRED]
  audit/03-front.md → src/app/(app)/settings/properties/page.tsx
- `5. Formulaires` --references--> `CreateDealModal()`  [INFERRED]
  audit/03-front.md → src/components/modals/CreateDealModal.tsx
- `5. Formulaires` --references--> `CreateQuoteModal()`  [INFERRED]
  audit/03-front.md → src/components/quotes/CreateQuoteModal.tsx

## Import Cycles
- None detected.

## Communities (118 total, 12 thin omitted)

### Community 0 - "lucide-react"
Cohesion: 0.05
Nodes (36): lucide-react, instant, instant, instant, instant, CreatePropertyModalProps, FIELD_TYPES, FIELD_TYPE_LABELS (+28 more)

### Community 1 - "SettingsClient.tsx"
Cohesion: 0.06
Nodes (35): 2.1 Menu du compte, 2.2 Paramètres actuels, 2.3 Conséquence sur l’ordre de travail, 2. État existant observé dans le dépôt, instant, SettingsPage(), SettingsClient(), SettingsClientProps (+27 more)

### Community 2 - "Loader"
Cohesion: 0.07
Nodes (31): BaseEntreprisesPage(), getCreditCost(), getScoreTier(), SCORE_BADGES, SharedCompany, UnlockedLead, CompaniesLoading(), DashboardLoading() (+23 more)

### Community 3 - "7. Paramètres de l’espace de travail"
Cohesion: 0.04
Nodes (47): 7.10 Environnements d’essai, 7.11.1 Transfert de propriété, 7.11.2 Suppression d’un espace, 7.11 Actions irréversibles sur l’espace, 7.1.1 Identité de l’espace, 7.1.2 Langue et formats par défaut, 7.1.3 Unités et informations commerciales, 7.1 Présentation et paramètres par défaut (+39 more)

### Community 4 - "tokens.ts"
Cohesion: 0.10
Nodes (35): TemplatesPage(), TemplatesPageClient(), TemplatesPageClientProps, TemplateType, TYPE_ICONS, TYPE_LABELS, CreateTemplateModal(), CreateTemplateModalProps (+27 more)

### Community 5 - "createClient"
Cohesion: 0.08
Nodes (31): DELETE(), GET(), PATCH(), GET(), POST(), DELETE(), GET(), POST() (+23 more)

### Community 6 - "ListFiltersEditor.tsx"
Cohesion: 0.08
Nodes (31): List, ListsPageClient(), ListsPageClientProps, instant, ListsPage(), BulkListActions(), BulkListActionsProps, downloadAsFile() (+23 more)

### Community 7 - "Sidebar.tsx"
Cohesion: 0.08
Nodes (28): AppLayout(), instant, AppShell(), AppShellProps, bottomItems, comingSoonItems, navItems, Sidebar() (+20 more)

### Community 8 - "onboarding/page.tsx"
Cohesion: 0.12
Nodes (25): LoginPage(), checkPasswordStrength(), PasswordRequirement(), PasswordStrength, RegisterPage(), VerifyEmailContent(), VerifyEmailPage(), COMPANY_SIZES (+17 more)

### Community 9 - "Audit UX - ProspectHub"
Cohesion: 0.06
Nodes (33): 10. Matrice Effort/Impact, 1. Personas et Objectifs, 2. Cartographie des Parcours Cles, 3. Inventaire des Problemes UX, 4. Inventaire des Boutons, 5. Analyse des Etats, 6. Charge Cognitive, 7. Prevention des Erreurs (+25 more)

### Community 10 - "RAPPORT FINAL D'AUDIT - ProspectHub CRM"
Cohesion: 0.06
Nodes (33): 1. SYNTHESE EXECUTIVE, 2. MATRICE DES PROBLEMES CONSOLIDES, 3. CARTOGRAPHIE BOUTONS ET FONCTIONNALITES, 4. PLAN D'ACTION PAR LOTS, 5 Risques Majeurs, 5. SCORES CONSOLIDES, 6. JOURNAL DE VERIFICATION, 7. LIMITES DE L'AUDIT (+25 more)

### Community 11 - "5. Mes préférences"
Cohesion: 0.06
Nodes (32): 5.1.1 Identité affichée, 5.1.2 Coordonnées et e-mail de connexion, 5.1.3 Signature de prospection (phase ultérieure, dépend du module e-mail), 5.1 Profil professionnel, 5.2.1 Thème, 5.2.2 Densité des listes, 5.2.3 Taille de texte et lisibilité, 5.2.4 Mouvement (+24 more)

### Community 12 - "2. RAPPORT DE BUGS"
Cohesion: 0.06
Nodes (31): 1.1 Landing Page (/), 1.2 Page Login (/auth/login), 1.3 Page Register (/auth/register), 1.4 Page Demo (/demo), 1.5 Dashboard (/dashboard), 1.6 Pages App Protegees, 1.7 Pages App (connecte), 1. INVENTAIRE DES ELEMENTS TESTES (+23 more)

### Community 13 - "next"
Cohesion: 0.07
Nodes (17): next, PATCH(), POST(), ACTIVITY_TYPE_LABELS, CompanyDetailPage(), CompanyPageProps, instant, metadata (+9 more)

### Community 14 - "MeetingsPageClient.tsx"
Cohesion: 0.12
Nodes (21): date-fns, MeetingsPageClient(), MeetingsPageClientProps, instant, MeetingsPage(), CalendarWidget(), CalendarWidgetProps, MEETING_TYPE_ICONS (+13 more)

### Community 15 - "Audit Back-end et API - ProspectHub CRM"
Cohesion: 0.08
Nodes (25): 1. Tableau des Endpoints, 2. Tableau des Problemes, 3.1 Migrations SQL (11 fichiers), 3.2 Points Positifs, 3.3 Points d'Attention, 3. Analyse du Modele de Donnees, 4.1 Authentification, 4.2 Autorisation (Multi-tenant) (+17 more)

### Community 16 - "server.ts"
Cohesion: 0.08
Nodes (17): AssociationCreate, DELETE(), EntityType, GET(), POST(), PATCH(), GET(), ALLOWED_STATUS (+9 more)

### Community 17 - "buttons/index.tsx"
Cohesion: 0.14
Nodes (20): CompaniesPageClient(), CompaniesPageClientProps, Company, CompaniesPage(), instant, Lead, LeadsPageClient(), LeadsPageClientProps (+12 more)

### Community 18 - "TicketCard.tsx"
Cohesion: 0.16
Nodes (19): instant, TicketsPage(), TicketsPageClient(), TicketsPageClientProps, categories, CreateTicketModal(), CreateTicketModalProps, priorities (+11 more)

### Community 19 - "FillButton"
Cohesion: 0.18
Nodes (19): 5. Formulaires, @dnd-kit/core, @dnd-kit/sortable, DealsPageClient(), DealsPageClientProps, Deal, DealCard(), DealCardProps (+11 more)

### Community 20 - "SequenceDetailClient.tsx"
Cohesion: 0.11
Nodes (19): instant, SequenceDetailPage(), SequencePageProps, Enrollment, SequenceDetailClient(), SequenceDetailClientProps, SequenceStep, STATUS_CONFIG (+11 more)

### Community 21 - "reports/page.tsx"
Cohesion: 0.15
Nodes (16): recharts@^3.11.1, recharts, DealRow, DEFAULT_STAGES, instant, PipelineStageRow, ReportsPage(), COLORS (+8 more)

### Community 22 - "QuoteEditor.tsx"
Cohesion: 0.17
Nodes (16): QuoteDetailClientProps, Product, ProductPicker(), ProductPickerProps, Product, Quote, QuoteEditor(), QuoteEditorProps (+8 more)

### Community 23 - "Audit Design UI - ProspectHub"
Cohesion: 0.10
Nodes (19): 10 Problemes Prioritaires, Analyse Responsive, Audit Design UI - ProspectHub, Breakpoint 1280px (Desktop small), Breakpoint 1920px (Desktop large), Breakpoint 375px (Mobile), Breakpoint 768px (Tablette), Coherence Design System (+11 more)

### Community 24 - "SequencesPageClient.tsx"
Cohesion: 0.17
Nodes (15): instant, SequenceRow, SequencesPage(), SequencesPageClient(), SequencesPageClientProps, SequenceStats, CreatedSequence, CreateSequenceModal() (+7 more)

### Community 25 - "Audit Performance - ProspectHub CRM"
Cohesion: 0.11
Nodes (18): 1. Tableau des Mesures par Page, 2. Tableau des Problemes de Performance, 3.1 Probleme Principal: Prefetching Excessif, 3.2 Routes API 404 en Production, 3.3 Bundle JavaScript, 3.4 Cascading Renders (Anti-pattern React), 3.5 Layout Shift (CLS), 3. Analyse Detaillee (+10 more)

### Community 26 - "package.json"
Cohesion: 0.15
Nodes (18): devDependencies, tailwindcss@4.3.3, @tailwindcss/turbopack@4.3.3, @types/dompurify@^3.0.5, @types/node@^20, @types/react@^19, @types/react-dom@^19, typescript@^5 (+10 more)

### Community 27 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 28 - "Analyse Detaillee par Categorie"
Cohesion: 0.11
Nodes (17): 1. Architecture et Structure, 2. Gestion d'Etat (useState/useEffect), 3. Appels API et Gestion Erreurs, 4. Handlers de Boutons, 6. Typage TypeScript, 7. Code Mort et Imports Inutilises, 8. Console Logs en Production, Analyse Detaillee par Categorie (+9 more)

### Community 29 - "InboxPageClient.tsx"
Cohesion: 0.20
Nodes (14): groupActivitiesByDate(), InboxPageClient(), InboxPageClientProps, InboxPage(), instant, ActivityFilters(), ActivityFiltersProps, ActivityType (+6 more)

### Community 30 - "LeadsTable.tsx"
Cohesion: 0.16
Nodes (15): getScoreTier(), Lead, LeadDetailPanel(), LeadsTable(), LeadsTableProps, SCORE_COLORS, STATUS_COLORS, STATUS_LABELS (+7 more)

### Community 31 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, date-fns@^4.4.0, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, dompurify@^3.5.0 (+9 more)

### Community 32 - "ListDetailClient.tsx"
Cohesion: 0.14
Nodes (15): AddLeadsModal(), AvailableLead, Lead, List, ListDetailClient(), ListDetailClientProps, Member, STATUS_LABELS (+7 more)

### Community 33 - "DocumentList.tsx"
Cohesion: 0.16
Nodes (14): DocumentItem(), DocumentItemData, DocumentItemProps, FILE_TYPE_CONFIG, VISIBILITY_CONFIG, DocumentList(), DocumentListProps, FilterType (+6 more)

### Community 34 - "AssociateRecordModal.tsx"
Cohesion: 0.28
Nodes (11): AssociateRecordModal(), AssociateRecordModalProps, SelectedEntity, Association, AssociationListProps, AssociationPicker(), AssociationPickerProps, EntityType (+3 more)

### Community 35 - "Annexe A — Paramètres opérationnels des communications, appels et automatisations"
Cohesion: 0.13
Nodes (15): A.15 Rôles et permissions propres aux fonctions de communication, A.17 Échecs et récupération des communications, A.1 Ajouter des catégories sans transformer Paramètres en liste interminable, A.21 Écarts et corrections à apporter aux deux nouveaux retours IA, A.22.1 Degré de certitude, A.22 Sources primaires consultées pour cette annexe, A.23 Prochaine action de conception, A.26 Catalogue fournisseurs : niveau de promesse à afficher (+7 more)

### Community 36 - "A.3 E-mail — connexions, envoi, suivi et planification"
Cohesion: 0.14
Nodes (14): A.3.1 Distinguer les trois usages d’e-mail, A.3.2 Ordre recommandé des méthodes de connexion, A.3.3 Envoi individuel depuis une fiche Prospect, A.3.4 Envois programmés, A.3.5 Signature e-mail personnelle, A.3.6 Synchronisation de boîte et journalisation des réponses, A.3.7 Domaine, authentification et délivrabilité, A.3.8 E-mail de séquence vs campagne marketing (+6 more)

### Community 37 - "ProductsPageClient.tsx"
Cohesion: 0.19
Nodes (11): instant, ProductsPage(), Product, ProductsPageClient(), ProductsPageClientProps, UNITS_LABELS, CreatedProduct, CreateProductModal() (+3 more)

### Community 38 - "createClient"
Cohesion: 0.24
Nodes (12): BrandSettingsPage(), loadBrandSettings(), ENTITY_TABS, EntityType, PropertiesSettingsPage(), fetchProperties(), fetchUserData(), CreatePropertyModal() (+4 more)

### Community 39 - "tasks/[id]/page.tsx"
Cohesion: 0.18
Nodes (11): AssociatedCompany, AssociatedDeal, AssociatedLead, instant, Task, TASK_TYPE_LABELS, TaskDetailPage(), TaskOwner (+3 more)

### Community 40 - "LogCallModal.tsx"
Cohesion: 0.28
Nodes (9): CreateNoteModal(), CreateNoteModalProps, DealActions(), DealActionsProps, LeadActionsProps, CALL_OUTCOMES, LogCallModal(), LogCallModalProps (+1 more)

### Community 41 - "deals/[id]/page.tsx"
Cohesion: 0.23
Nodes (10): DealAssociations(), DealAssociationsProps, Deal, DealCompany, DealDetailPage(), DealOwner, DealStage, instant (+2 more)

### Community 42 - "QuotesPageClient.tsx"
Cohesion: 0.23
Nodes (9): instant, QuotesPage(), Quote, QuotesPageClient(), QuotesPageClientProps, statusFilters, QuoteStatusBadge(), QuoteStatusBadgeProps (+1 more)

### Community 43 - "supabase/client.ts"
Cohesion: 0.17
Nodes (8): BrandSettings, DEFAULT_COLORS, FONT_OPTIONS, CreateQuoteModalProps, Quote, QuoteLine, QuoteStatus, useQuotes()

### Community 44 - "useActivities.ts"
Cohesion: 0.20
Nodes (10): ActivityForm(), ActivityFormProps, CALL_OUTCOMES, Activity, ActivityType, CreateActivityData, CreateNoteData, LogCallData (+2 more)

### Community 45 - "ActivityTimelineItem.tsx"
Cohesion: 0.30
Nodes (9): ActivityTimeline(), ActivityTimelineProps, Activity, ActivityTimelineItem(), ActivityTimelineItemProps, ActivityType, ICONS, TYPE_COLORS (+1 more)

### Community 46 - "ProspectHub"
Cohesion: 0.18
Nodes (10): Contributing, Database Schema, Features, Getting Started, Installation, License, Prerequisites, Project Structure (+2 more)

### Community 47 - "dashboard/page.tsx"
Cohesion: 0.25
Nodes (9): DashboardPage(), DEFAULT_STAGES, getDueLabel(), getRelativeTime(), instant, priorityColors, statusColors, taskIcons (+1 more)

### Community 48 - "ImportCSVModal.tsx"
Cohesion: 0.29
Nodes (9): DEFAULT_LEAD_FIELDS, ImportCSVModal(), ImportCSVModalProps, Step, autoMapColumns(), CSVParseResult, LEAD_FIELD_MAPPINGS, parseCSV() (+1 more)

### Community 49 - "ProspectHub — Spécification du menu Compte et des paramètres"
Cohesion: 0.20
Nodes (9): 13. Proposition de prompt d’exécution pour Claude Code, 14. Écarts entre les propositions reçues et la cible, 15.1 Ce qui est documenté et ce qui est une recommandation, 15. Sources officielles HubSpot et limites de comparaison, 16. Prochaine action concrète, 8.1 Contrôle technique attendu, 8.2 Permissions préférées à un rôle spécial, 8. Modèle d’accès : matrice fonctionnelle (+1 more)

### Community 50 - "11. Phases concrètes de conception et de création"
Cohesion: 0.20
Nodes (10): 11. Phases concrètes de conception et de création, Phase 0 — Inventaire et contrat de données, Phase 1 — Menu Compte fonctionnel, Phase 2 — Préférences personnelles et persistance, Phase 3 — Sécurité personnelle, Phase 4 — Membres et équipes, Phase 5 — RBAC et audit, Phase 6 — Réglages CRM avancés (+2 more)

### Community 51 - "3.2 Ordre recommandé des blocs"
Cohesion: 0.20
Nodes (10): 3.1 Ouverture et fermeture, 3.2 Ordre recommandé des blocs, 3.3 À laisser hors du menu Compte, 3. Menu Compte — contenu et comportements, Bloc A — Identité et espace actif, Bloc B — Changer d’espace (conditionnel), Bloc C — Accès rapides personnels, Bloc D — Espace de travail (conditionnel aux droits) (+2 more)

### Community 52 - "Audit Accessibilite et Qualite Redactionnelle - ProspectHub"
Cohesion: 0.20
Nodes (9): 10 Corrections Urgentes (par priorite), 1. Tableau des problemes de texte, 2. Tableau des problemes d'accessibilite WCAG 2.2, 3. Synthese, Audit Accessibilite et Qualite Redactionnelle - ProspectHub, Fichiers principaux a corriger, Recommandation, Score Accessibilite: 4/10 (+1 more)

### Community 53 - "Checklist Review"
Cohesion: 0.20
Nodes (9): Checklist Review, Format Output, Hors Scope, Mission, Performance, Qualite, Reviewer Agent, Securite (+1 more)

### Community 54 - "Regles Subagents - Optimisation Tokens"
Cohesion: 0.20
Nodes (9): BON (80 tokens), EXEMPLE BON vs MAUVAIS, FORMAT PROMPT OPTIMAL, MAUVAIS (500+ tokens), MODELE PAR TACHE, REGLES EXECUTION, REGLES PROMPTS SUBAGENTS, Regles Subagents - Optimisation Tokens (+1 more)

### Community 55 - "useLists.ts"
Cohesion: 0.20
Nodes (9): CreateListData, List, ListMember, useListDetail(), UseListDetailOptions, UseListDetailReturn, useLists(), UseListsOptions (+1 more)

### Community 56 - "A.12 Automatisations (workflows) — réglages, déclencheurs, actions et garde-fous"
Cohesion: 0.22
Nodes (9): A.12.1 Séparer configuration du moteur et éditeur de workflow, A.12.2 Déclencheurs à prévoir par famille, A.12.3 Conditions et filtres, A.12.4 Actions, A.12.5 Contrôles avant activation, A.12.6 Limites, concurrence et boucles, A.12.7 Historique et réparation, A.12.8 Paramètres d’espace pour les workflows (+1 more)

### Community 57 - "A.18 Ordre de construction étendu"
Cohesion: 0.22
Nodes (9): A.18 Ordre de construction étendu, Phase 10 — E-mail individuel et préférences, Phase 11 — SMTP générique et domaine, Phase 12 — Calendrier, rappels et téléphonie, Phase 13 — Séquences et workflows opérationnels, Phase 14 — SMS et WhatsApp, Phase 15 — API, Webhooks et intégration de données, Phase 16 — LinkedIn et intégrations premium (+1 more)

### Community 58 - "react"
Cohesion: 0.22
Nodes (5): react, CATEGORY_LABELS, Integration, INTEGRATIONS, ConfettiProps

### Community 59 - "leads/[id]/page.tsx"
Cohesion: 0.28
Nodes (8): getScoreTier(), instant, LeadDetailPage(), LeadPageProps, SCORE_COLORS, STATUS_COLORS, STATUS_LABELS, LeadActions()

### Community 60 - "Executor Backend Agent"
Cohesion: 0.25
Nodes (7): A la fin, Executor Backend Agent, Format Output, Patterns Autorises, Perimetre AUTORISE, Perimetre INTERDIT, Regles Strictes

### Community 61 - "Executor Feature Agent"
Cohesion: 0.25
Nodes (7): A la fin, Checklist Feature, Executor Feature Agent, Format Output, Perimetre AUTORISE, Perimetre INTERDIT, Regles Strictes

### Community 62 - "import/route.ts"
Cohesion: 0.39
Nodes (6): LeadImportData, normalizePhone(), POST(), validateEmail(), validateLead(), validatePhone()

### Community 63 - "demo/page.tsx"
Cohesion: 0.25
Nodes (6): DEMO_LEADS, DEMO_STATS, NAV_ITEMS, STATUS_COLORS, STATUS_LABELS, TABS

### Community 64 - "SequenceStepBuilder.tsx"
Cohesion: 0.32
Nodes (7): formatDelay(), SequenceStep, SequenceStepBuilder(), SequenceStepBuilderProps, SortableStepItem(), SortableStepItemProps, STEP_TYPE_CONFIG

### Community 65 - "A.13 Intégrations tierces, OAuth et secrets"
Cohesion: 0.29
Nodes (7): A.13.1 Catalogue d’intégrations, A.13.2 OAuth, A.13.3 Secrets et clés API BYOK, A.13.4 Webhooks sortants, A.13.5 API ProspectHub et clés, A.13.6 Import automatisé par Docker/Kubernetes/n8n, A.13 Intégrations tierces, OAuth et secrets

### Community 66 - "A.25 Parcours et micro-copie concrets à implémenter"
Cohesion: 0.29
Nodes (7): A.25.1 Assistant « Connecter mon serveur SMTP », A.25.2 Assistant « Planifier un e-mail », A.25.3 Assistant « Connecter mon calendrier », A.25.4 Assistant « Connecter un fournisseur d’appels », A.25.5 Assistant « Activer un workflow », A.25.6 Écran de connexion interrompue, A.25 Parcours et micro-copie concrets à implémenter

### Community 67 - "A.4 Appels et téléphonie intégrés"
Cohesion: 0.29
Nodes (7): A.4.1 Choisir une architecture téléphonique, A.4.2 Configuration du fournisseur et numéros, A.4.3 Comportement de l’appel CRM, A.4.4 Enregistrement, transcription et résumés, A.4.5 Disponibilités, routage et plages d’appel, A.4.6 Santé et erreurs de téléphonie, A.4 Appels et téléphonie intégrés

### Community 68 - "Audit ProspectHub - Phase 0 : Preparation"
Cohesion: 0.29
Nodes (6): Audit ProspectHub - Phase 0 : Preparation, Dossiers Crees, Environnement, Outils Disponibles, Stack Technique, Validation

### Community 69 - "Executor UI Agent"
Cohesion: 0.29
Nodes (6): A la fin, Executor UI Agent, Format Output, Perimetre AUTORISE, Perimetre INTERDIT, Regles Strictes

### Community 70 - "tasks/page.tsx"
Cohesion: 0.43
Nodes (5): instant, Task, TaskCard(), TasksPage(), NewTaskButton()

### Community 71 - "6. Mon accès et ma sécurité"
Cohesion: 0.33
Nodes (6): 6.1 Méthodes de connexion, 6.2 Vérification en deux étapes, 6.3 Sessions et appareils, 6.4 Historique de sécurité personnel, 6.5 E-mail de compte perdu ou non vérifié, 6. Mon accès et ma sécurité

### Community 72 - "Explorer Agent"
Cohesion: 0.33
Nodes (5): Explorer Agent, Format Output, Hors Scope, Mission, Regles Strictes

### Community 73 - "Planner Agent"
Cohesion: 0.33
Nodes (5): Format Output, Hors Scope, Mission, Planner Agent, Regles Strictes

### Community 74 - "eslint.config.mjs"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.4.6, eslint, eslint-config-next

### Community 75 - "bulk/route.ts"
Cohesion: 0.33
Nodes (5): BulkAction, BulkRequestBody, MemberWithLead, POST(), RouteParams

### Community 76 - "sequences/route.ts"
Cohesion: 0.40
Nodes (5): ALLOWED_STATUS, ALLOWED_TRIGGER_TYPE, GET(), POST(), validateSequenceFields()

### Community 77 - "deals/page.tsx"
Cohesion: 0.33
Nodes (5): Deal, DealsPage(), DEFAULT_STAGES, instant, PipelineStage

### Community 78 - "SuccessMessage.tsx"
Cohesion: 0.40
Nodes (5): SUCCESS_CONFIG, SuccessMessage(), SuccessMessageProps, SuccessMessageType, useSuccessMessage()

### Community 79 - "10. Parcours utilisateur principaux"
Cohesion: 0.40
Nodes (5): 10.1 Ouvrir mes préférences, 10.2 Modifier un accès de membre, 10.3 Configurer une préférence personnelle contrôlée par l’espace, 10.4 Acheter des crédits de données ou demander un export payant, 10. Parcours utilisateur principaux

### Community 80 - "12. Critères d’acceptation produit et technique"
Cohesion: 0.40
Nodes (5): 12.1 Menu Compte, 12.2 Préférences, 12.3 Permissions et multi-tenant, 12.4 Qualité UX, 12. Critères d’acceptation produit et technique

### Community 81 - "9. Recherche, micro-copie et modèles d’écran"
Cohesion: 0.40
Nodes (5): 9.1 Format explicatif d’une section, 9.2 Textes de section prêts à l’emploi, 9.3 États d’interface obligatoires, 9.4 Textes d’erreur utiles, 9. Recherche, micro-copie et modèles d’écran

### Community 82 - "A.16 États, événements et données à prévoir par intégration"
Cohesion: 0.40
Nodes (5): A.16.1 Métadonnées de connexion, A.16.2 Comptes et canaux, A.16.3 Opérations externes, A.16.4 Événements asynchrones, A.16 États, événements et données à prévoir par intégration

### Community 83 - "A.19 Check-list d’acceptation spécifique"
Cohesion: 0.40
Nodes (5): A.19 Check-list d’acceptation spécifique, Appels et messages, Automatisations, E-mail, Webhooks/API

### Community 84 - "A.20 Prompts d’aide ciblés pour Claude Code"
Cohesion: 0.40
Nodes (5): A.20 Prompts d’aide ciblés pour Claude Code, Prompt : automatisation de prospection, Prompt : configuration SMTP BYOK, Prompt : connexion e-mail OAuth, Prompt : intégration téléphonique

### Community 85 - "A.27 Plan de réglages par rôle — quoi laisser au membre et quoi garder délégué"
Cohesion: 0.40
Nodes (5): A.27 Plan de réglages par rôle — quoi laisser au membre et quoi garder délégué, Facturation, Personne administrant les communications, Responsable d’équipe si permission accordée, Tous les membres

### Community 86 - "A.9 Modèles, signatures et bibliothèques de contenu"
Cohesion: 0.40
Nodes (5): A.9.1 Types d’actifs, A.9.2 Champs d’un modèle, A.9.3 Variables de personnalisation, A.9.4 Éditeur et prévisualisation, A.9 Modèles, signatures et bibliothèques de contenu

### Community 87 - "next-intl"
Cohesion: 0.40
Nodes (4): nextConfig, withNextIntl, next-intl@^4.16.2, next-intl

### Community 88 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 89 - "pdf/route.ts"
Cohesion: 0.60
Nodes (4): escapeHtml(), generatePdfHtml(), POST(), Props

### Community 90 - "[uuid]/route.ts"
Cohesion: 0.40
Nodes (4): DELETE(), GET(), Props, PUT()

### Community 91 - "preferences/route.ts"
Cohesion: 0.40
Nodes (4): GET(), NotificationSettings, PATCH(), UserSettings

### Community 92 - "quotes/[uuid]/page.tsx"
Cohesion: 0.50
Nodes (4): instant, Props, QuoteDetailPage(), QuoteDetailClient()

### Community 93 - "UploadDocumentModal.tsx"
Cohesion: 0.40
Nodes (4): Document, FILE_TYPE_ICONS, UploadDocumentModal(), UploadDocumentModalProps

### Community 94 - "EnrollmentRow.tsx"
Cohesion: 0.40
Nodes (4): Enrollment, EnrollmentRow(), EnrollmentRowProps, STATUS_CONFIG

### Community 95 - "A.10 Tâches, rappels et calendrier de travail"
Cohesion: 0.50
Nodes (4): A.10.1 Valeurs par défaut personnelles, A.10.2 Récapitulatif quotidien et notifications regroupées, A.10.3 Jours fériés et calendriers d’équipe, A.10 Tâches, rappels et calendrier de travail

### Community 96 - "A.11 Séquences de prospection"
Cohesion: 0.50
Nodes (4): A.11.1 Paramètres de séquence, A.11.2 Inscription et suppression d’une séquence, A.11.3 Réponses et pause, A.11 Séquences de prospection

### Community 97 - "A.14 Guides intégrés pour les clients non techniques"
Cohesion: 0.50
Nodes (4): A.14.1 Contrat d’un guide de configuration, A.14.2 Composants pédagogiques, A.14.3 Guides à créer, A.14 Guides intégrés pour les clients non techniques

### Community 98 - "A.24 Modèle de configuration piloté par schéma"
Cohesion: 0.50
Nodes (4): A.24.1 Contrat de champ, A.24.2 Exemple déclaratif SMTP, A.24.3 Règles de rendu du schéma, A.24 Modèle de configuration piloté par schéma

### Community 99 - "A.5 SMS"
Cohesion: 0.50
Nodes (4): A.5.1 Configuration, A.5.2 Consentement, préférences et désinscription, A.5.3 Rédaction, longueur et segmentation, A.5 SMS

### Community 100 - "A.6 WhatsApp Business"
Cohesion: 0.50
Nodes (4): A.6.1 Connexion, A.6.2 Modèles approuvés et fenêtre de conversation, A.6.3 Conversations, messages et erreurs, A.6 WhatsApp Business

### Community 101 - "A.8 Calendriers, rendez-vous et disponibilités"
Cohesion: 0.50
Nodes (4): A.8.1 Connexion Google/Microsoft, A.8.2 Sens de synchronisation et conflits, A.8.3 Liens de réservation, A.8 Calendriers, rendez-vous et disponibilités

### Community 102 - "documents/route.ts"
Cohesion: 0.50
Nodes (3): DELETE(), GET(), POST()

### Community 103 - "templates/[id]/route.ts"
Cohesion: 0.50
Nodes (3): DELETE(), GET(), PUT()

### Community 105 - "1. But et décisions structurantes"
Cohesion: 0.67
Nodes (3): 1.1 Règle pour les rôles, 1.2 Principes produit, 1. But et décisions structurantes

### Community 106 - "4. Architecture de la page Paramètres"
Cohesion: 0.67
Nodes (3): 4.1 Structure de page, 4.2 Modèle de portée, 4. Architecture de la page Paramètres

## Knowledge Gaps
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ProspectHub — Spécification du menu Compte et des paramètres` connect `ProspectHub — Spécification du menu Compte et des paramètres` to `SettingsClient.tsx`, `7. Paramètres de l’espace de travail`, `6. Mon accès et ma sécurité`, `1. But et décisions structurantes`, `4. Architecture de la page Paramètres`, `5. Mes préférences`, `10. Parcours utilisateur principaux`, `12. Critères d’acceptation produit et technique`, `9. Recherche, micro-copie et modèles d’écran`, `11. Phases concrètes de conception et de création`, `3.2 Ordre recommandé des blocs`?**
  _High betweenness centrality (0.260) - this node is a cross-community bridge._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.05384150030248034 - nodes in this community are weakly interconnected._
- **Why does `2. État existant observé dans le dépôt` connect `SettingsClient.tsx` to `ProspectHub — Spécification du menu Compte et des paramètres`?**
  _High betweenness centrality (0.238) - this node is a cross-community bridge._
- **Should `SettingsClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06095791001451379 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `lucide-react`, `SettingsClient.tsx`, `Loader`, `tokens.ts`, `ListFiltersEditor.tsx`, `Sidebar.tsx`, `onboarding/page.tsx`, `MeetingsPageClient.tsx`, `buttons/index.tsx`, `TicketCard.tsx`, `FillButton`, `SequenceDetailClient.tsx`, `QuoteEditor.tsx`, `SequencesPageClient.tsx`, `package.json`, `InboxPageClient.tsx`, `LeadsTable.tsx`, `dependencies`, `ListDetailClient.tsx`, `DocumentList.tsx`, `AssociateRecordModal.tsx`, `ProductsPageClient.tsx`, `createClient`, `tasks/[id]/page.tsx`, `LogCallModal.tsx`, `deals/[id]/page.tsx`, `QuotesPageClient.tsx`, `supabase/client.ts`, `useActivities.ts`, `ActivityTimelineItem.tsx`, `ImportCSVModal.tsx`, `useLists.ts`, `demo/page.tsx`, `SequenceStepBuilder.tsx`, `SuccessMessage.tsx`, `UploadDocumentModal.tsx`, `EnrollmentRow.tsx`?**
  _High betweenness centrality (0.208) - this node is a cross-community bridge._
- **Should `Loader` be split into smaller, more focused modules?**
  _Cohesion score 0.07397959183673469 - nodes in this community are weakly interconnected._
- **Should `7. Paramètres de l’espace de travail` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._