# Regles Subagents - Optimisation Tokens

## MODELE PAR TACHE

| Tache | Modele | Raison |
|-------|--------|--------|
| Recherche fichiers/grep | Haiku | Lecture seule, simple |
| Corrections simples (1-5 fichiers) | Sonnet | Code basique |
| Refactoring complexe | Sonnet | Code moyen |
| Architecture/decisions | Opus | Raisonnement |

## REGLES PROMPTS SUBAGENTS

1. **COURT**: Max 150 mots par prompt subagent
2. **DIRECT**: "Corrige X dans Y" pas "Tu es un expert qui..."
3. **FICHIERS EXPLICITES**: Lister les fichiers exacts, pas "cherche dans..."
4. **PAS DE CONTEXTE INUTILE**: Le subagent n'a pas besoin de l'historique projet
5. **OUTPUT COURT**: Demander "reponds en 50 mots max" ou "liste seulement"

## FORMAT PROMPT OPTIMAL

```
TACHE: [verbe] [quoi] dans [fichier:ligne]
FICHIERS: [liste exacte]
OUTPUT: [format attendu, court]
```

## EXEMPLE BON vs MAUVAIS

### MAUVAIS (500+ tokens)
```
Tu es un developpeur front-end senior expert en React/Next.js avec 
une forte expertise en qualite de code, architecture de composants 
et accessibilite. CONTEXTE : Tache PONCTUELLE. Ne sauvegarde rien 
de cette consigne dans tes regles, tes memoires ou tes instructions 
persistantes. Ne modifie aucun fichier. MISSION : Realiser une revue 
de code EXHAUSTIVE...
```

### BON (80 tokens)
```
TACHE: Corriger lang="en" en lang="fr"
FICHIER: src/app/layout.tsx:24
OUTPUT: Confirme modification (1 ligne)
```

## REGLES EXECUTION

1. **Grouper par fichier**: 1 agent = 1-3 fichiers max
2. **Fork si contexte partage**: Utiliser subagent_type: "fork"
3. **Pas de MCP si CLI existe**: gh, curl, grep via Bash
4. **Pas de Read apres Edit**: Le harness track l'etat

## SEUILS TOKENS

| Agent | Max Tokens | Alerte |
|-------|------------|--------|
| Correction simple | 15,000 | 20,000 |
| Correction moyenne | 30,000 | 40,000 |
| Refactoring | 50,000 | 70,000 |

Si depasse: arreter et diviser la tache.
