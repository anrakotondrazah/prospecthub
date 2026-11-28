# ProspectHub — Spécification du menu Compte et des paramètres

**Version :** 1.0  
**Date :** 27 novembre 2026  
**Statut :** spécification produit et UX à implémenter par étapes  
**Périmètre :** vignette/menu du compte utilisateur et toutes les pages de paramètres accessibles depuis ce menu  
**Référence fonctionnelle :** HubSpot, recoupé avec sa documentation officielle consultée le 27 novembre 2026  

> Ce document décrit uniquement le menu Compte et les écrans de paramètres qu’il ouvre. Il ne spécifie ni la navigation principale, ni une barre supérieure globale, ni la structure des autres menus du CRM. La vignette Compte peut rester à son emplacement actuel en bas de la navigation latérale.

---

## 1. But et décisions structurantes

Le menu Compte doit permettre à un prospecteur de retrouver rapidement son identité, son espace de travail actif, ses préférences et sa sécurité. Il doit également offrir aux personnes autorisées l’accès aux réglages de leur espace ProspectHub. Il ne doit pas devenir un second menu principal contenant toutes les fonctions CRM.

La page Paramètres est le centre de configuration. Elle organise les réglages par **portée** et **capacité** :

1. **Mes préférences** : réglages du membre connecté, sans effet sur les collègues.
2. **Mon accès et ma sécurité** : méthodes d’authentification et sessions personnelles.
3. **Espace de travail** : réglages partagés, visibles et modifiables selon les droits du membre.
4. **Abonnement et facturation** : données réellement renvoyées par le système de facturation, avec accès distinct à la consultation et à la modification.

Les choix commerciaux et d’administration de la plateforme ProspectHub (support interne, opérateurs de base, configuration SaaS globale) sont hors du compte client. Ils doivent relever d’une console interne distincte. Un administrateur d’un client ne devient jamais un administrateur de la plateforme ProspectHub.

### 1.1 Règle pour les rôles

Ne pas construire une échelle rigide « N1 / N2 / N3 » où chaque utilisateur serait défini par un niveau. Ce vocabulaire peut servir à ordonner des écrans ou des étapes de déploiement, mais il ne représente pas le modèle de permissions.

Tous les membres peuvent personnaliser leur expérience et gérer leur propre sécurité. Leurs capacités sur les données partagées sont décidées séparément, par action, ressource et périmètre. Un rôle plus élevé ouvre certaines opérations d’équipe ou d’espace; il n’ajoute pas arbitrairement des préférences personnelles.

### 1.2 Principes produit

- Un réglage doit dire **ce qu’il change**, **qui est concerné**, **quand le changement prend effet** et, pour une action risquée, **comment revenir en arrière**.
- L’interface peut être complète sans afficher toutes les options à la fois : paramètres regroupés, recherche, détails repliables et vues avancées.
- Un contrôle affiché comme actif doit avoir un effet persistant et vérifiable. Si la fonctionnalité ou l’intégration n’existe pas, présenter un état « À configurer » ou « Pas encore disponible » avec une explication exacte, et non un faux interrupteur.
- Les règles d’accès sont vérifiées côté serveur et dans la base. Cacher un lien dans l’interface n’est pas un contrôle de sécurité.
- Ne pas inventer de quota, de délai de rétention, d’offre, de promesse de conformité ou de méthode d’authentification.
- Préférer les libellés français cohérents avec le CRM : « espace de travail », « membre », « prospect », « équipe », « rôle », « permission », « abonnement ».

---

## 2. État existant observé dans le dépôt

Cette section relève les points visibles dans le code local consulté; elle sert à partir de l’état réel et ne constitue pas une critique du fait que le projet soit en cours.

### 2.1 Menu du compte

Dans `src/components/layout/Sidebar.tsx`, le bas de la zone contient une vignette avec initiale, nom et e-mail. Au moment de l’inspection, elle est rendue comme un `div` avec `role="button"` et `tabIndex`, mais aucun gestionnaire d’ouverture ou de clavier n’est attaché. Il n’y a donc pas encore de menu Compte fonctionnel accessible au clic et au clavier.

La page `src/app/(app)/settings/page.tsx` charge actuellement le profil et l’organisation puis rend `SettingsClient`. Elle ne transmet pas de rôle ou de capacités à l’écran dans la sélection observée.

### 2.2 Paramètres actuels

Dans `src/app/(app)/settings/SettingsClient.tsx` :

- les onglets sont un profil, des préférences et un compte, mais une partie des libellés est encore sans accents ou en anglais;
- les champs de profil et d’organisation visibles sont désactivés;
- les préférences de notification ont un bouton Enregistrer, mais sa fonction affiche les valeurs dans la console au lieu de les enregistrer;
- le plan `Free`, les limites « 50 leads/mois », « 1 utilisateur » et l’accès « Export CSV » sont des valeurs statiques dans le composant;
- le changement d’offre et la suppression de compte sont désactivés;
- la déconnexion existe;
- la page expose un raccourci vers les propriétés personnalisées.

`ThemeSettings` est fourni à l’écran et le menu latéral a déjà une commande de thème. La persistance et le périmètre exact du thème doivent être confirmés avant de déclarer cette préférence synchronisée entre appareils.

### 2.3 Conséquence sur l’ordre de travail

La première livraison utile n’est pas de créer toutes les pages détaillées en même temps. Elle consiste à rendre le menu Compte fonctionnel, à clarifier les réglages personnels, puis à relier chaque commande à un comportement persistant. Ensuite seulement, ouvrir les réglages de l’espace selon les capacités réellement implémentées.

---

## 3. Menu Compte — contenu et comportements

### 3.1 Ouverture et fermeture

**Déclencheur :** bouton de compte portant l’avatar ou les initiales, le nom, et une indication de menu.

- Clic ou activation clavier ouvre le menu.
- `Entrée` et `Espace` l’ouvrent; `Échap` le ferme et rend le focus au déclencheur.
- Le focus se déplace dans le menu de façon prévisible; les éléments sont des liens ou des boutons natifs, pas des `div` cliquables.
- Le clic hors du menu le ferme. Un changement de route le ferme également.
- Le nom et l’adresse ne doivent pas déborder; les valeurs longues sont tronquées visuellement et restent accessibles intégralement aux technologies d’assistance.
- L’avatar peut afficher une photo réellement fournie par l’utilisateur, sinon ses initiales. Ne pas récupérer automatiquement une photo depuis un service tiers sans décision de confidentialité explicite.

**Texte accessible du bouton :** `Ouvrir le menu du compte de {nom}`.  
**État chargé :** l’identité vient de la session et du profil du membre, jamais d’une constante de démonstration.  
**Erreur de profil :** garder l’accès aux actions sûres (paramètres, aide si elle existe, déconnexion); afficher « Certaines informations de profil n’ont pas pu être chargées. »

### 3.2 Ordre recommandé des blocs

#### Bloc A — Identité et espace actif

Afficher :

- avatar ou initiales;
- nom complet, si disponible;
- adresse e-mail de connexion;
- rôle ou libellé de capacité dans l’espace, si cette donnée est fiable;
- nom de l’espace actif.

Texte d’aide sous l’espace : **« Vous utilisez ProspectHub dans l’espace {nom}. Les données et les réglages affichés dépendent de cet espace. »**

L’adresse e-mail de connexion et l’adresse d’envoi d’e-mails CRM sont deux notions différentes. Ne pas les confondre dans le résumé.

#### Bloc B — Changer d’espace (conditionnel)

Afficher **Changer d’espace** uniquement si le membre a accès à au moins deux espaces. Ouvrir une liste des espaces auxquels le serveur confirme son appartenance. Pour chaque ligne : nom, éventuellement domaine ou organisation, et marqueur « Actuel » pour l’espace courant.

- Basculer le contexte côté serveur/session et recharger les données selon l’espace choisi.
- Ne jamais accepter un `organization_id` choisi par le navigateur sans vérifier l’appartenance du membre.
- Afficher une confirmation uniquement si un formulaire de réglage non enregistré risque d’être perdu; ne pas interrompre un simple changement depuis une page sans brouillon.
- Si un espace n’est pas accessible : **« Vous n’avez plus accès à cet espace. Actualisez la liste ou demandez une invitation à son administrateur. »**
- Les environnements bac à sable ne sont pas à inventer. Les proposer seulement si une vraie fonction de sandbox existe, et les distinguer visuellement de la production.

#### Bloc C — Accès rapides personnels

1. **Mon profil et mes préférences** → section Profil ou préférences personnelles.
2. **Apparence** → choix rapide Clair / Sombre / Selon mon appareil, si cette préférence est effectivement persistée.
3. **Notifications** → section Notifications, avec un compteur non lu seulement si le compteur existe.
4. **Sécurité et sessions** → section Sécurité personnelle.

Le menu ne doit pas répéter chaque réglage ou chaque catégorie administrative. Il sert de raccourci, pas d’arbre de navigation complet.

#### Bloc D — Espace de travail (conditionnel aux droits)

Lien **Paramètres de l’espace** visible seulement si le membre possède au moins une capacité de consultation d’un réglage d’espace. Les sous-pages visibles dans Paramètres seront elles-mêmes filtrées par permission.

Si la personne n’a pas accès à l’administration, ne pas afficher un lien qui mène à une page vide ou refusée. Si une demande d’accès est utile et implémentée, afficher une action explicite « Demander l’accès à l’administration ».

#### Bloc E — Aide et informations (uniquement si les destinations existent)

- **Centre d’aide** : documentation produit; ne pas pointer vers une page inexistante.
- **Raccourcis clavier** : ouvre la liste effective des raccourcis; ne pas promettre `?`, `C`, ou toute autre combinaison avant son implémentation.
- **Nouveautés** : journal de versions réel; masquer jusqu’à sa disponibilité.
- **À propos de ProspectHub** : version de l’application et liens juridiques/publics validés, si disponibles.

#### Bloc F — Déconnexion

Bouton **Se déconnecter** met fin à la session active avec le mécanisme d’authentification du projet, puis redirige vers la connexion. Pendant l’opération : `Déconnexion…`. En cas d’échec, ne pas prétendre que la session est terminée : « La déconnexion a échoué. Réessayez. »

### 3.3 À laisser hors du menu Compte

- La liste complète des modules du CRM.
- La liste complète des objets, pipelines, champs, intégrations ou règles d’automatisation.
- Les opérations de plateforme réservées à l’équipe ProspectHub.
- Le statut « En ligne / En réunion / Absent / Ne pas déranger » tant qu’il n’existe pas de routage ou de disponibilité qui utilise réellement ce statut.
- Un sélecteur de langue ou de fuseau directement dans le menu si ces options disposent déjà d’une page de préférences claire. Un aperçu rapide est possible plus tard, mais il doit ouvrir la bonne section et enregistrer le même réglage.
- Des commandes de facturation visibles pour tous les membres sans distinction de permission.

---

## 4. Architecture de la page Paramètres

Le centre Paramètres doit être adressable par URL. Chaque sous-page possède un chemin stable, peut être rafraîchie sans perdre son contexte, et vérifie les permissions au chargement et lors de chaque mutation.

### 4.1 Structure de page

- Titre de page : **Paramètres**.
- Texte d’introduction : **« Réglez votre expérience ProspectHub et, selon vos droits, les paramètres partagés de votre espace. »**
- Recherche de paramètres filtrant les catégories auxquelles l’utilisateur peut accéder. Les résultats indiquent le chemin complet, par exemple `Espace de travail > Données > Propriétés`.
- Regroupement visuel de premier niveau par portée : **Personnel**, **Espace de travail**, **Abonnement**.
- La navigation détaillée des paramètres est propre à cette page. Elle ne modifie pas la navigation principale du CRM.
- Le contenu présente titre, portée, explication, formulaire et action de sauvegarde appropriée.
- Chaque préférence personnelle précise si elle est propre à ce compte membre, à l’espace actif, ou à cet appareil.
- Les réglages avancés peuvent être repliés avec un intitulé explicite et une explication du risque.
- Le chemin actif peut être copié ou partagé uniquement si les destinataires ont les droits nécessaires; la route ne confère aucun droit à elle seule.

### 4.2 Modèle de portée

| Portée | Exemple | Persistance | Qui peut modifier |
|---|---|---|---|
| Membre | langue personnelle, avatar, notifications | profil du membre dans l’espace, ou fournisseur d’authentification pour les identifiants | membre concerné, avec réauthentification pour les actions sensibles |
| Appareil | densité, thème local si ce choix est retenu | stockage local ou préférence synchronisée; choisir et documenter un seul comportement | membre sur cet appareil |
| Espace | devise par défaut, équipe, règles de données | données associées à l’espace | permission dédiée sur le réglage concerné |
| Abonnement | offre, factures, sièges, crédits/achats de données | système de facturation et registre d’usage | consultation ou gestion de facturation selon permission |
| Plateforme | opérations d’exploitation ProspectHub | console interne distincte | opérateurs ProspectHub explicitement autorisés |

---

## 5. Mes préférences

**Introduction de catégorie :** « Personnalisez votre profil et votre façon de travailler. Ces préférences ne modifient pas celles des autres membres. »

### 5.1 Profil professionnel

#### 5.1.1 Identité affichée

- Prénom.
- Nom.
- Nom affiché calculé ou saisi, avec un comportement documenté si les deux champs sont distincts.
- Photo de profil : choisir, recadrer, remplacer ou retirer. Limiter les formats et dimensions côté client **et** serveur; retirer les métadonnées si le traitement d’image le permet.
- Fonction ou titre dans l’équipe, facultatif.
- Téléphone professionnel, facultatif, avec indicatif pays.
- Langue de communication interne, uniquement si l’application en a une utilisation concrète.

**Pourquoi :** ces informations identifient le propriétaire des prospects, des tâches et des échanges. Elles ne doivent pas être utilisées pour donner des droits.

**Micro-copie :** « Votre nom et votre photo peuvent apparaître auprès des membres de votre espace et dans les activités que vous leur partagez. » Préciser les surfaces exactes après inventaire des usages.

#### 5.1.2 Coordonnées et e-mail de connexion

- Afficher l’e-mail de connexion avec son état de vérification.
- Changer l’e-mail seulement via le flux d’authentification : confirmation de l’adresse actuelle si nécessaire, vérification de la nouvelle, gestion d’un lien expiré et prévention des comptes en double.
- La modification de l’e-mail ne modifie pas automatiquement l’adresse connectée pour l’envoi de messages CRM.
- L’adresse d’envoi CRM appartient à **Mes connexions > E-mail d’envoi**, si cette fonction d’envoi existe.

**Aide :** « Cet e-mail sert à vous connecter et à recevoir les messages de compte. Pour envoyer depuis une boîte professionnelle, configurez une connexion séparée. »

#### 5.1.3 Signature de prospection (phase ultérieure, dépend du module e-mail)

- Texte de signature et aperçu avant enregistrement.
- Variables autorisées uniquement depuis des champs profil contrôlés; échapper le HTML.
- Possibilité d’avoir une signature texte simple, préférable pour démarrer.
- Choix explicite d’insertion automatique ou non dans les e-mails envoyés par le CRM.
- Avertissement si la signature inclut une image distante ou des informations sensibles.

Ne pas afficher cette rubrique comme opérationnelle tant que l’envoi d’e-mails et la règle d’insertion ne sont pas en production.

### 5.2 Apparence et confort d’utilisation

#### 5.2.1 Thème

- Clair.
- Sombre.
- Selon le système.
- Aperçu immédiat réversible.
- Périmètre affiché : **« Ce choix s’applique à votre compte sur cet appareil »** ou **« suit votre compte sur vos appareils »**, selon la persistance réellement retenue.

#### 5.2.2 Densité des listes

- Confortable : davantage d’espace vertical.
- Compacte : plus de lignes visibles.
- Valeur par défaut définie par le produit et réinitialisable.
- N’agir que sur les composants concernés; ne pas casser les espacements ni l’accessibilité tactile.

#### 5.2.3 Taille de texte et lisibilité

- Taille de texte de l’application avec un nombre limité de choix testés.
- Contraste renforcé si une palette accessible est disponible.
- Respect du zoom navigateur : le réglage ne doit pas l’annuler.
- Éviter un contrôle « contraste élevé » si le thème ne satisfait pas réellement les contrastes visés.

#### 5.2.4 Mouvement

- **Réduire les animations** : suit la préférence du système par défaut; possibilité de la forcer si une solution existe.
- Les animations ne doivent jamais porter seules une information d’état.

#### 5.2.5 Réinitialisation

Bouton **Rétablir les préférences d’affichage par défaut** avec aperçu du périmètre réinitialisé. Ce bouton ne réinitialise ni la langue, ni les droits, ni les données CRM.

### 5.3 Langue, formats et horaires personnels

#### 5.3.1 Langue de l’interface

- Langues réellement traduites et supportées par l’application, affichées dans leur nom natif.
- Enregistrer puis recharger les libellés de l’interface; ne pas supposer que les noms de propriétés personnalisées ou les données prospect sont traduits.
- Une langue personnelle ne remplace pas la langue par défaut des e-mails, formulaires ou contenus publics de l’espace.

#### 5.3.2 Région et formats

- Format de date : date localisée explicite, par exemple `31/12/2026`.
- Format d’heure : 24 h ou 12 h.
- Format numérique : séparateur décimal et de milliers cohérents avec la locale.
- Premier jour de la semaine, si les calendriers du CRM le respectent.
- Devise d’affichage personnelle seulement si l’application sait convertir les montants sans modifier leur valeur enregistrée. Sinon, montrer les montants dans la devise de l’espace.

**Aide :** « Ces préférences changent l’affichage des nombres et des dates. Elles ne changent pas les données enregistrées ni la devise de référence de l’espace. »

#### 5.3.3 Fuseau horaire personnel

- Fuseau IANA explicite, avec recherche par ville/zone.
- Option « Détecter depuis mon appareil » seulement si elle est fiable et que l’utilisateur peut la désactiver.
- Toujours distinguer du fuseau de l’espace, utilisé par les rapports, règles planifiées et tâches globales.
- Montrer un exemple de conversion avant sauvegarde.
- Si des heures de prospection ou rendez-vous sont gérés, les dates présentées à l’utilisateur doivent inclure une zone non ambiguë lorsque nécessaire.

#### 5.3.4 Heures de travail (si utilisées par le routage)

- Fuseau horaire, jours actifs, heure de début et fin, pauses facultatives.
- Exceptions ponctuelles / absence planifiée seulement si un modèle de disponibilité existe.
- Indiquer l’usage concret : attribution automatique, prise de rendez-vous ou files de conversations.
- Si aucune de ces fonctions n’est active : ne pas laisser croire que cette configuration changera la disponibilité.

### 5.4 Page d’arrivée et vues personnelles

#### 5.4.1 Page affichée après connexion

- Valeur par défaut sûre choisie par le produit.
- Liste des destinations réellement autorisées pour ce membre.
- Conserver la redirection contextuelle vers la page demandée lorsqu’un lien profond a été ouvert.
- Ne jamais rediriger vers une page à laquelle le membre n’a pas droit.

#### 5.4.2 Préférences d’affichage des tableaux

- Vue par défaut pour chaque objet, si la fonctionnalité de vues existe.
- Colonnes, ordre et tri personnels; indiquer si une vue est personnelle ou partagée.
- Les préférences personnelles ne remplacent pas les filtres de sécurité serveur.

#### 5.4.3 Éléments récemment consultés

La conservation et la suppression de l’historique local peuvent être proposées si le produit enregistre effectivement ces événements. Ne pas exposer un historique d’accès présenté comme un journal de sécurité.

### 5.5 Notifications

**Introduction :** « Choisissez les événements qui vous avertissent et le canal utilisé. Les alertes de sécurité du compte peuvent être nécessaires pour protéger votre accès. »

#### 5.5.1 Canaux

- Centre de notifications dans l’application.
- E-mail.
- Notification navigateur, après autorisation explicite du navigateur.
- Application mobile ou intégration tierce uniquement si disponible.
- Ne pas proposer SMS, push mobile, Slack ou autre canal avant intégration fonctionnelle.

Pour chaque canal : état de connexion/autorisation, bouton de test si raisonnable, date du dernier échec quand connue, lien de dépannage.

#### 5.5.2 Familles d’événements

Configurer indépendamment les événements déjà produits par le CRM. Catégories recommandées :

1. **Prospects et entreprises** : prospect attribué, prospect réattribué, activité importante sur un prospect suivi.
2. **Tâches et rendez-vous** : tâche assignée, rappel avant échéance, tâche en retard, rendez-vous créé ou modifié.
3. **Équipe et collaboration** : mention, commentaire où l’utilisateur est mentionné, changement de propriétaire d’un élément suivi.
4. **Boîte de réception** : conversation ou ticket assigné, réponse attendue, uniquement si la boîte de réception existe.
5. **Imports et traitements** : import terminé/échoué, enrichissement ou traitement de données terminé/échoué, export prêt/échoué, seulement pour une opération lancée par l’utilisateur ou selon les droits.
6. **Compte et sécurité** : connexion inhabituelle si le système la détecte, changement d’adresse e-mail, modification des droits du membre, échec d’une opération de sécurité.
7. **Rapports et résumés** : rapport planifié ou synthèse, uniquement s’ils sont réellement envoyés.

Ne pas reprendre les catégories d’une IA concurrente sous la forme de cases actives si les événements ne sont pas émis par le système. Chaque type doit être relié à un événement backend versionné et testable.

#### 5.5.3 Préférences de fréquence

- Immédiate, résumé périodique ou désactivée pour les événements non critiques, si le service sait regrouper ces messages.
- Plages silencieuses avec fuseau personnel, si le canal et les événements l’autorisent.
- Les événements qui doivent rester actifs sont définis par une politique produit et expliqués précisément. Ne pas inventer une catégorie « urgence » qui ne correspond à aucun engagement de service.

#### 5.5.4 Profils de notifications d’équipe (espace; phase ultérieure)

Un administrateur peut définir une suggestion par défaut ou un profil pour une équipe. Le membre voit l’origine de chaque valeur et peut personnaliser ses préférences, sauf règle de sécurité réellement imposée et annoncée. Toute modification collective indique la population concernée et la date d’effet.

#### 5.5.5 États et retours

- Chargement : préférences récupérées du serveur.
- Sauvegarde : « Enregistrement… » puis « Préférences enregistrées. »
- Échec : garder les choix non enregistrés et dire quoi réessayer.
- Autorisation navigateur refusée : l’e-mail et le centre d’application restent configurables; ne pas afficher « activé ».
- Événement absent : expliquer qu’il sera disponible lorsque la fonction CRM correspondante sera activée.

### 5.6 Raccourcis clavier

- Liste recherchable des commandes actives.
- Les raccourcis spécifiques à Mac/Windows sont affichés selon le système.
- Une personnalisation des raccourcis n’est prévue qu’après détection des conflits, possibilité de revenir à la valeur par défaut et prise en charge des technologies d’assistance.
- Indiquer le contexte où chaque raccourci marche.
- Ne documenter que les raccourcis réellement implémentés.

### 5.7 Connexions personnelles

#### 5.7.1 Boîte e-mail d’envoi (dépend du module e-mail)

- Fournisseur connecté, adresse, état, dernière synchronisation.
- Connecter, renouveler les autorisations, suspendre ou déconnecter.
- L’autorisation minimale demandée et les données synchronisées sont décrites avant l’accord.
- Statut d’envoi et de journalisation présenté séparément.
- La connexion d’une boîte ne vaut pas autorisation de campagnes automatisées.

#### 5.7.2 Calendrier (dépend des rendez-vous)

- Fournisseur, calendrier choisi, sens de synchronisation, fuseau, dernier état.
- Choix précis des événements lus/écrits; ne pas synchroniser tous les calendriers par défaut.
- Déconnexion et conséquences clairement indiquées.

#### 5.7.3 Téléphonie (dépend d’une vraie intégration)

- Fournisseur et numéro sortant.
- Région, indicatif, état de connexion.
- Enregistrement, transcription, consentement et conservation ne sont configurables qu’avec un fournisseur opérationnel et une validation métier/juridique adaptée au pays de l’utilisateur et du prospect.
- Ne pas activer l’enregistrement par défaut ni afficher de promesse de conformité.

### 5.8 Préférences d’accessibilité

- Respect de `prefers-reduced-motion`.
- Navigation complète au clavier et indicateur de focus.
- Zoom texte/navigateur sans perte d’information.
- Contraste lisible et états qui ne dépendent pas seulement des couleurs.
- Compatibilité lecteurs d’écran; noms accessibles des commandes et erreurs reliées aux champs.
- Sous-titres/transcriptions seulement pour les médias qui en ont besoin.

Cette page ne remplace pas la correction des défauts d’accessibilité dans le reste de l’application.

---

## 6. Mon accès et ma sécurité

**Introduction :** « Protégez votre accès à ProspectHub. Les changements de connexion peuvent vous demander de confirmer votre identité. »

### 6.1 Méthodes de connexion

- Fournisseur de connexion courant (mot de passe, lien magique, OAuth/SSO) si connu.
- Modifier ou réinitialiser le mot de passe via Supabase Auth, sans lire ni enregistrer le mot de passe dans une table de profil.
- Ajouter une méthode alternative uniquement si le fournisseur et le parcours de récupération le permettent.
- Réauthentification récente avant modification de l’e-mail, désactivation d’une méthode forte ou fermeture du compte.

### 6.2 Vérification en deux étapes

- État : configurée / non configurée / exigée par une règle d’espace.
- Méthodes proposées uniquement si elles sont supportées par la configuration Supabase Auth actuelle : application d’authentification, passkey ou autres méthodes vérifiées.
- Clés de récupération affichées une seule fois et régénérables avec confirmation si ce flux existe.
- La politique d’espace (exiger ou recommander une méthode) est distincte du réglage personnel et visible dans Sécurité de l’espace.
- Ne pas promettre SMS, SSO, SAML ou passkeys avant vérification de la prise en charge et configuration du fournisseur.

### 6.3 Sessions et appareils

- Appareil/navigateur connu, date approximative de dernière activité et état courant si l’authentification fournit réellement ces informations.
- Action de révocation pour les sessions autres que celle en cours; confirmation claire.
- Action distincte **Déconnecter toutes les autres sessions** avec avertissement et réauthentification si nécessaire.
- Ne pas afficher une géolocalisation précise non collectée ou une localisation présentée comme certaine.

### 6.4 Historique de sécurité personnel

Peut montrer les événements liés à ce membre si le système les enregistre : connexion réussie, changement de méthode, changement d’adresse et révocation de session. Ce panneau n’est pas le journal d’audit complet de l’espace et ne remplace pas les logs d’authentification.

### 6.5 E-mail de compte perdu ou non vérifié

- E-mail non vérifié : état visible, bouton de renvoi avec minuterie contrôlée côté serveur.
- Adresse inaccessible : parcours de récupération officiel, sans révéler l’existence d’un compte à une personne non authentifiée.
- Copie : **« Nous avons envoyé les instructions à l’adresse enregistrée. Si vous n’y avez plus accès, suivez la procédure de récupération de compte. »**

---

## 7. Paramètres de l’espace de travail

**Accès :** chaque sous-section est protégée par une permission dédiée, pas par la seule valeur d’un libellé `role` transmis au navigateur.

### 7.1 Présentation et paramètres par défaut

#### 7.1.1 Identité de l’espace

- Nom affiché.
- Identifiant interne stable, copiable et non modifiable après création, si un identifiant existe.
- Logo et identité visuelle uniquement si utilisés dans les e-mails, devis ou pages générés.
- Domaine, secteur et coordonnées professionnelles facultatives.
- États de vérification du domaine distincts des champs libres.

#### 7.1.2 Langue et formats par défaut

- Langue de référence pour les nouveaux membres et les communications générées.
- Pays, format de dates/nombres, devise de référence et fuseau horaire de l’espace.
- Aide distinguant chaque effet : rapports, automatisations, échéances, documents et valeurs monétaires.
- Changer une valeur par défaut ne convertit pas rétroactivement les données existantes.

#### 7.1.3 Unités et informations commerciales

- Adresse et téléphone de l’organisation si requis par une vraie fonction (factures, mentions commerciales, documents).
- Devise et règles d’arrondi uniquement selon le modèle de montant enregistré.
- Pas de champ légal présenté comme obligatoire avant de connaître son usage exact.

### 7.2 Membres, invitations et équipes

#### 7.2.1 Liste des membres

Colonnes recommandées : nom, e-mail, statut, équipe, rôle ou profil de permissions, dernière activité si collectée et licence/siège si le système d’abonnement l’utilise. Les statuts doivent être cohérents : invitation envoyée, actif, suspendu, invitation expirée.

#### 7.2.2 Invitations

- Adresse e-mail, équipe initiale et modèle de permissions/capacités à attribuer.
- Résumé avant envoi : espaces et données accessibles, opérations permises, modules ou quotas associés.
- Expiration configurable uniquement selon la durée réellement appliquée par le backend.
- Renvoyer/révoquer une invitation; éviter de créer un second membre actif pour la même identité.
- Journaliser l’invitation, son acceptation, sa révocation et le changement de droits.

#### 7.2.3 Suspension et départ d’un membre

- **Suspendre l’accès** bloque les nouvelles connexions et invalide les sessions selon les capacités de l’authentification.
- Préserver les enregistrements et les événements; proposer la réattribution des prospects, tâches et conversations avant le départ définitif.
- Afficher les conséquences exactes sur les données, la licence, les automatisations et la propriété des éléments.
- La suppression d’un compte d’authentification n’efface pas automatiquement les dossiers CRM sans parcours distinct et validé.

#### 7.2.4 Équipes

- Créer/renommer/archiver une équipe.
- Membres et responsable d’équipe.
- Appartenance multiple si le modèle de données la supporte.
- Équipes utilisées comme cible de visibilité ou de distribution seulement si ces fonctions utilisent les équipes.
- Déplacement d’un membre : expliquer les changements d’accès avant de confirmer.

#### 7.2.5 Hiérarchie de gestion

Relation responsable/membre utile pour les rapports et processus d’approbation. Ne pas l’utiliser comme substitut aux permissions.

### 7.3 Rôles, profils de droits et accès aux données

#### 7.3.1 Modèle d’autorisation

Utiliser des permissions composées de :

1. **Ressource** (prospect, entreprise, transaction, tâche, réglage, facturation, etc.).
2. **Action** (consulter, créer, modifier, supprimer, fusionner, importer, exporter, administrer).
3. **Portée** (mes éléments, équipe, espace entier, éléments explicitement partagés).
4. **Contexte complémentaire** (licence/entitlement, état de l’espace, fonctionnalité activée).

La règle effective doit être calculée de manière prévisible et documentée. Les permissions d’un rapport, d’un export, d’une intégration et d’une interface ne doivent pas permettre de contourner les droits sur les enregistrements.

#### 7.3.2 Profils de départ suggérés

Ce sont des modèles à créer et adapter, pas des niveaux hiérarchiques obligatoires.

- **Propriétaire de l’espace** : responsable des paramètres critiques, membres et abonnement; transfert de propriété nécessaire avant son départ.
- **Administrateur d’espace** : réglages partagés explicitement autorisés, sans accès automatique à la plateforme ProspectHub.
- **Administrateur de configuration** : capacité limitée à une ou plusieurs catégories (par exemple membres, modèle de données, intégrations), sans facturation par défaut.
- **Responsable d’équipe** : visibilité et opérations sur son périmètre d’équipe selon les capacités attribuées.
- **Prospecteur** : droits de travail sur les prospects qui lui sont accessibles; préférences personnelles complètes.
- **Observateur** : consultation limitée; export, édition et suppression non accordés par défaut.
- **Profil personnalisé** : ensemble nommé de permissions compréhensible, versionné et réutilisable.

Ne pas supposer qu’un propriétaire doit pouvoir contourner une politique de sécurité; définir le propriétaire comme une responsabilité de gestion avec des capacités explicites.

#### 7.3.3 Matrice d’accès à implémenter

Créer un tableau maintenu dans le produit ou le code pour les capacités suivantes :

| Famille de capacités | Exemples de droits séparés |
|---|---|
| Membres | lire; inviter; modifier les accès; suspendre; réactiver; transférer la propriété |
| Équipes | lire; créer; modifier; affecter des membres |
| Données CRM | lire/créer/modifier/supprimer par objet et portée; fusionner; restaurer |
| Import | lancer; consulter ses imports; consulter tous les imports; annuler si possible |
| Export | exporter ses éléments; exporter une vue; export complet; consulter/exporter les fichiers produits |
| Modèle de données | lire; créer propriétés; modifier; archiver; supprimer avec précontrôle d’impact |
| Automatisations | lire; créer/modifier; activer; désactiver; supprimer; consulter l’historique |
| Intégrations | lire l’état; connecter; modifier; révoquer; gérer les secrets/webhooks |
| Sécurité | lire politique; imposer un facteur; gérer politiques d’espace; consulter l’audit |
| Abonnement | lire l’offre et l’usage; consulter factures; gérer le moyen de paiement; changer/annuler l’offre |
| Paramètres plateforme | aucune permission client; opérations dans une console interne séparée |

Les imports gratuits et exports facturés décrits dans le modèle économique doivent être représentés par des droits **et** des contrôles de facturation/usage côté serveur. Ne pas accorder un export parce que le bouton est caché, ni débiter deux fois une opération après une nouvelle tentative.

#### 7.3.4 Création et modification de profil de droits

- Nom, description compréhensible, catégories de permissions, portée des données.
- Vue comparative « Avant / Après » lors d’une modification.
- Nombre et liste des membres impactés.
- Avertissement si un profil retire à son éditeur la capacité de gérer les accès.
- Confirmation, événement d’audit, date, acteur, valeurs antérieures et nouvelles.
- Historique de versions et option de restauration si le modèle le permet.

#### 7.3.5 Test d’accès

Proposer plus tard un aperçu « Ce que {membre} peut faire » construit depuis les mêmes règles d’autorisation que le backend. Ne pas offrir l’usurpation ou l’impersonation de session comme simple outil d’administration.

### 7.4 Sécurité de l’espace

#### 7.4.1 Authentification exigée

- Règles de mot de passe déléguées au fournisseur d’authentification utilisé.
- Facteur supplémentaire exigé ou recommandé seulement si l’intégration le permet.
- Méthodes prises en charge et exceptions explicites.
- État d’application par membre, sans exposer de secret.

#### 7.4.2 Sessions et expiration

- Durée et révocation configurables seulement si l’authentification permet de les faire respecter.
- Révocation des sessions lors d’une suspension, d’une compromission ou d’une désactivation d’accès.
- Texte de politique visible aux membres concernés.

#### 7.4.3 Accès réseau et SSO

- IP autorisées, SSO/SAML ou règles d’identité sont des fonctionnalités avancées et dépendantes de l’infrastructure.
- Ne les proposer qu’après validation technique complète, stratégie de récupération et procédure anti-verrouillage.
- Toute règle réseau présente un aperçu des administrateurs qui conserveront l’accès avant activation.

#### 7.4.4 Alertes de sécurité

- Alertes sur événements que le système journalise réellement : changement de rôle, export sensible, nouvel accès administrateur, révocation de sessions, connexion inhabituelle si détectée.
- Destinataires et canal explicites.
- Les alertes critiques ne doivent être dites « obligatoires » que si la politique produit les définit et que le système l’applique.

### 7.5 Journal d’activité et d’audit

#### 7.5.1 Événements

Journaliser au minimum les opérations sensibles que ProspectHub prend réellement en charge : invitation, modification et suspension des membres; changements de permissions; export/import; modifications de paramètres; gestion d’intégration; changements d’abonnement si exposés; suppression/restauration de données.

Chaque événement contient acteur, date UTC, espace, action, ressource concernée, résultat, identifiant de requête et champs avant/après lorsque cela est approprié. Ne jamais journaliser mots de passe, tokens, contenu sensible inutile ou secrets d’intégration.

#### 7.5.2 Consultation

- Filtres par période, acteur, type d’action, ressource et résultat.
- Détails d’un événement avec valeurs masquées si sensibles.
- Export du journal soumis à une permission distincte.
- Durée de conservation affichée à partir de la politique effectivement définie. Ne pas recopier le délai HubSpot ou inventer 30, 90 ou 365 jours.
- Indiquer clairement que les journaux couvrent les événements instrumentés et ne signifient pas nécessairement que chaque lecture ou action externe est observée.

### 7.6 Données et structure CRM

La page Paramètres peut exposer les zones ci-dessous lorsque les modules existent. Les réglages structurants ne doivent pas être ajoutés au menu Compte lui-même.

#### 7.6.1 Objets et propriétés

- Objets standard existants : prospects, entreprises, affaires, tâches, tickets si implémentés.
- Liste des propriétés avec libellé, clé interne, objet, type, source, usage, date de création.
- Groupes de propriétés, valeurs et ordre d’affichage.
- Types supportés par la base et formulaires.
- Obligatoire, unique, calculé ou modifiable uniquement si toutes les opérations liées sont prises en charge.
- Dépendances avant archivage/suppression : filtres, rapports, workflows, imports, formulaires.
- Historique ou plan de migration avant changement de type.
- « Supprimer la propriété » doit d’abord montrer le nombre d’enregistrements et les usages qui seront perdus, et ne peut être confirmé qu’après permission et vérification serveur.

#### 7.6.2 Associations et étiquettes

- Types de liens entre objets disponibles.
- Étiquettes décrivant la relation, si présentes dans l’interface.
- Cardinalités et limites seulement si le schéma les applique.
- Prévisualisation de l’impact d’un changement de définition.

#### 7.6.3 Étapes et pipelines

- Configuration des étapes de cycle de vie et pipeline des affaires/tickets réellement disponibles.
- Ordre, libellé, état terminal, probabilité ou conditions uniquement si consommés par les calculs/rapports.
- Changement d’étape avec aperçu des éléments concernés et destination de remplacement.
- Aucun déplacement silencieux des enregistrements lors d’une suppression d’étape.

#### 7.6.4 Doublons et qualité

- Règles de détection fondées sur des identifiants disponibles et expliquées.
- File de rapprochement manuelle avec origine des suggestions.
- Fusion avec comparaison champ par champ et journal de l’action.
- Tableau de qualité distinguant problème détecté, règle appliquée et suggestion.
- Une détection de doublon ne doit pas fusionner automatiquement des entreprises/prospects sans règle et approbation explicites.

#### 7.6.5 Imports et exports

- Historique des opérations : initiateur, date, type, nombre de lignes, état, erreurs, rapport d’anomalies.
- Décrire la politique de mise à jour, déduplication et provenance avant exécution.
- Vérification des colonnes et prévisualisation avant écriture.
- Export : colonnes, portée, nombre estimé d’enregistrements, prix/crédit éventuel, raison du contrôle, confirmation finale.
- Appliquer le coût ou quota une seule fois, même si le navigateur réessaie la requête.
- Délai de disponibilité du fichier, expiration du lien et suppression déterminés par la politique réelle et indiqués à l’écran.
- La réutilisation commerciale des données importées par le client relève d’un consentement et de conditions juridiques distincts. Elle ne doit pas être dissimulée dans une case de paramètres techniques ni présentée comme déjà autorisée par défaut.

#### 7.6.6 Corbeille et restauration

- Liste, objet, suppression, auteur et date si instrumentés.
- Restaurer avec contrôle des collisions et des permissions.
- Supprimer définitivement avec décompte et conséquences détaillées.
- Afficher la vraie durée de rétention de ProspectHub une fois définie; pas de « 90 jours » emprunté sans règle technique.

#### 7.6.7 Confidentialité, consentement et conservation

- Décrire les champs de consentement et leur usage uniquement après définition du modèle produit.
- Historiser la source, la date et la version de la preuve de consentement si ce besoin est retenu.
- Accès, rectification, export ou effacement via des flux administrables si implémentés.
- Règles de conservation et suppression par catégorie de données, validées techniquement et juridiquement avant publication.
- Les textes ne garantissent pas à eux seuls une conformité légale.

### 7.7 Automatisations et règles d’équipe

- Préférences de notifications d’équipe.
- Règles d’attribution/routage des prospects si le service existe : critères, membres admissibles, heures et comportement si personne n’est disponible.
- Heures d’activité et jours fériés seulement s’ils influencent réellement les traitements.
- États activée/en pause, historique d’exécution et résultat.
- Bouton d’essai sur données fictives ou environnement isolé lorsque possible.
- Une modification doit préciser si elle s’applique aux nouveaux éléments, aux éléments existants ou aux deux.

### 7.8 Connexions et développeurs

#### 7.8.1 Applications connectées

- Nom du fournisseur, propriétaire de la connexion, portées OAuth, état, dernière synchronisation, erreurs.
- Connecter, renouveler, déconnecter; montrer ce qui cessera de fonctionner avant révocation.
- Révoquer les secrets côté serveur et ne les afficher qu’au moment de création, jamais dans les logs ou le HTML.
- Une intégration personnelle (boîte mail) est séparée d’une intégration partagée d’espace.

#### 7.8.2 Webhooks et API (plus tard)

- Seulement après définition d’API publiques, authentification, rotation et quotas.
- Secrets masqués; régénération avec révocation de la valeur précédente.
- Historique des requêtes avec données personnelles minimisées.
- Périmètre associé à un membre/service et date d’expiration si supportée.
- Ne jamais donner à un agent un bouton « Voir le token complet » après sa création.

#### 7.8.3 Système d’import de données prospectées

- Comptes de service et clés utilisés par les workflows Kubernetes/Docker sont configurés dans une interface d’intégration distincte, jamais dans le profil personnel.
- Séparer le jeton d’ingestion, l’identité de l’opérateur, l’espace destination et la source du jeu de données.
- Valider schéma, provenance, consentement/permission d’usage, doublons et volume avant ingestion.
- Journaliser lot, version du workflow, compte de service, résultats et rejets sans écrire de secret.
- Tester la reprise idempotente et empêcher un lot rejoué de débiter ou dupliquer les données.
- Les clés techniques ne doivent pas être remises aux prospecteurs ordinaires.

### 7.9 Abonnement, usage et facturation

#### 7.9.1 Résumé

- Offre réelle, état (essai/actif/en retard/annulé), prochaine échéance si connue.
- Utilisateurs/sièges facturés et utilisés, uniquement si le fournisseur de facturation expose ces données.
- Crédits ou achats de données, imports et exports comptabilisés selon le modèle commercial effectivement développé.
- Comparaison des droits de l’offre depuis le catalogue central, non dupliquée comme constantes dans chaque page.

#### 7.9.2 Factures et paiement

- Factures et reçus issus du fournisseur de facturation.
- Moyen de paiement masqué.
- Modifier le paiement ou l’adresse de facturation avec parcours authentifié.
- Ne jamais collecter ni stocker les numéros complets de carte dans ProspectHub.

#### 7.9.3 Gérer l’abonnement

- Modifier, mettre à niveau, rétrograder ou annuler avec récapitulatif du prix, date d’effet, prorata et droits impactés renvoyés par le fournisseur.
- Confirmation explicite et reçu de la demande.
- L’accès client à la facturation est indépendant des permissions CRM et peut être délégué à un responsable de facturation.
- Si la facturation n’est pas intégrée, afficher **« La gestion de l’abonnement n’est pas encore disponible dans l’application »** et le canal de contact réel. Ne pas afficher un plan `Free` simulé.

#### 7.9.4 Consommation des données

- Crédits achetés, consommés, réservés et expirants seulement si le modèle prévoit ces états.
- Historique de transaction : lot, quantité, prix, date, statut, référence de facture.
- Empêcher les doubles débits; traiter les remboursements et erreurs fournisseur selon une règle explicite.

### 7.10 Environnements d’essai

Créer une rubrique uniquement si ProspectHub implémente réellement des espaces isolés/sandboxes. Décrire précisément ce qui est copié, anonymisé, synchronisé, facturé et envoyé à l’extérieur. La phrase « les données d’essai ne toucheront jamais vos vrais clients » n’est autorisée que si l’isolation le garantit.

### 7.11 Actions irréversibles sur l’espace

#### 7.11.1 Transfert de propriété

- Identifier la personne actuelle et le futur propriétaire.
- Vérifier la capacité de la nouvelle personne à accepter.
- Afficher les droits et responsabilités qui changent.
- Confirmation avec réauthentification et événement d’audit.

#### 7.11.2 Suppression d’un espace

Ne pas créer ce bouton avant d’avoir défini : propriétaire requis, vérification forte, période de grâce éventuelle, exports autorisés, arrêt des intégrations, traitement des abonnements, suppression dans les sauvegardes, conservation légale et impact sur les données liées.

Quand le flux sera réel : récapitulatif des conséquences, confirmation par saisie du nom exact, étape finale séparée, état de demande et voie de récupération si applicable. Ne pas promettre un délai de 30 jours ou une suppression immédiate avant qu’une politique soit implémentée et validée.

---

## 8. Modèle d’accès : matrice fonctionnelle

Tous les rôles peuvent accéder à leurs réglages personnels, sous réserve des limites du fournisseur d’authentification. Le tableau décrit des valeurs par défaut proposées; la décision finale doit vivre dans les permissions de l’espace.

| Fonction | Prospecteur | Responsable d’équipe | Admin délégué | Propriétaire / admin espace | Opérateur ProspectHub |
|---|---:|---:|---:|---:|---:|
| Modifier mon profil et mon thème | Oui | Oui | Oui | Oui | Non dans le compte client |
| Gérer ma langue, mes notifications et mes sessions | Oui | Oui | Oui | Oui | Non dans le compte client |
| Voir les réglages communs | Selon partage | Selon permission | Catégories accordées | Oui, selon capacité explicite | Console interne distincte |
| Modifier les paramètres de son équipe | Non par défaut | Si droit accordé | Selon capacité | Selon capacité | Non dans le compte client |
| Inviter/suspendre des membres | Non par défaut | Non par défaut | Si droit accordé | Si droit accordé | Non dans le compte client |
| Modifier un profil de permissions | Non | Non par défaut | Si permission `access.manage` | Si permission `access.manage` | Non dans le compte client |
| Lire l’audit d’espace | Non par défaut | Non par défaut | Si `audit.read` | Si `audit.read` | Console interne selon besoin opérationnel |
| Consulter l’abonnement | Si autorisé | Si autorisé | Si `billing.read` | Si `billing.read` | Non dans le compte client |
| Modifier paiement/abonnement | Non | Non | Si `billing.manage` délégué | Si `billing.manage` | Non dans le compte client |
| Accéder aux secrets d’intégration | Non | Non | Si rôle technique dédié | Si rôle technique dédié | Secrets d’exploitation séparés |
| Modifier les fonctions SaaS de ProspectHub | Jamais | Jamais | Jamais | Jamais | Console d’exploitation distincte |

### 8.1 Contrôle technique attendu

- Identité authentifiée déterminée côté serveur.
- Espace actif vérifié à partir d’une relation membre/espace autorisée.
- Capacité contrôlée pour l’action, la ressource et la portée demandées.
- Policies RLS cohérentes avec les vérifications de l’API et des Server Actions.
- Refus par défaut si le rôle, la permission ou l’espace manque.
- Test de non-contournement par URL directe, requête API, identifiant d’espace forgé et accès à un autre tenant.
- Les changements de permissions prennent effet avec invalidation/réévaluation de caches et sessions concernées.

### 8.2 Permissions préférées à un rôle spécial

Exemples de capacités atomiques :

- `profile.read.self`, `profile.update.self`;
- `workspace.settings.read`, `workspace.settings.update`;
- `members.read`, `members.invite`, `members.access.update`, `members.suspend`;
- `teams.read`, `teams.manage`;
- `crm.leads.read`, `crm.leads.create`, `crm.leads.update`, `crm.leads.delete`, avec une portée distincte;
- `data.import`, `data.export`, `data.export.full`;
- `schema.properties.read`, `schema.properties.manage`;
- `audit.read`, `audit.export`;
- `billing.read`, `billing.manage`;
- `integrations.read`, `integrations.manage`.

Les chaînes sont des exemples de conception; les standardiser dans le code avant de les exposer aux utilisateurs.

---

## 9. Recherche, micro-copie et modèles d’écran

### 9.1 Format explicatif d’une section

Pour éviter une page froide ou vide sans submerger l’utilisateur, chaque section complexe suit ce format :

1. **Titre clair** : objet du réglage.
2. **Résumé en une phrase** : effet principal et périmètre.
3. **Valeur actuelle** : état réel et source de cette valeur.
4. **Contrôle** : choix concret, avec libellés compréhensibles.
5. **Effet ou exemple** : aperçu d’une date, d’un accès ou d’un changement représentatif.
6. **Conséquence** : avertissement proportionné si des données ou des droits changent.
7. **Sauvegarde** : état de l’enregistrement, résultat et possibilité de retour.

Une explication longue se place dans **En savoir plus** ou un panneau contextuel, pas dans chaque ligne de formulaire. Les textes doivent décrire ProspectHub et son comportement confirmé, pas copier les engagements de HubSpot.

### 9.2 Textes de section prêts à l’emploi

- **Mes préférences** — « Personnalisez votre profil, la langue et les notifications de votre compte. Ces réglages ne modifient pas ceux des autres membres. »
- **Sécurité** — « Gérez les méthodes de connexion et les sessions associées à votre compte. Certaines modifications nécessitent de confirmer votre identité. »
- **Espace de travail** — « Configurez les réglages partagés de cet espace. Les sections disponibles dépendent des permissions qui vous ont été attribuées. »
- **Membres** — « Invitez les personnes qui doivent travailler dans cet espace et définissez les actions auxquelles elles ont accès. »
- **Équipes** — « Regroupez les membres selon votre organisation. Une équipe ne donne pas automatiquement accès à toutes les données de ses membres. »
- **Permissions** — « Définissez les actions autorisées, les données accessibles et leur périmètre. Vérifiez les membres concernés avant d’enregistrer. »
- **Journal d’activité** — « Consultez les changements enregistrés par ProspectHub. Ce journal ne contient que les événements suivis par l’application. »
- **Données et structure** — « Adaptez les champs et les règles de vos données. Avant une modification, ProspectHub vous indiquera les enregistrements et fonctions concernés lorsqu’ils sont connus. »
- **Facturation** — « Consultez l’abonnement et les opérations de facturation liés à cet espace. Seules les informations confirmées par votre fournisseur de paiement sont affichées. »

### 9.3 États d’interface obligatoires

Chaque section doit préciser son comportement en cas de :

- chargement;
- donnée absente/non renseignée;
- erreur de lecture;
- absence de permission;
- sauvegarde en cours;
- sauvegarde réussie;
- validation invalide;
- conflit de modification concurrente;
- intégration déconnectée;
- fonctionnalité non disponible;
- limitation d’offre, si elle est vérifiée par le système d’entitlements.

### 9.4 Textes d’erreur utiles

- **Chargement :** « Chargement des paramètres… »
- **Erreur de lecture :** « Ces paramètres n’ont pas pu être chargés. Réessayez. Aucun changement n’a été enregistré. »
- **Sauvegarde réussie :** « Modifications enregistrées. »
- **Sauvegarde échouée :** « Les modifications n’ont pas été enregistrées. Vérifiez votre connexion puis réessayez. »
- **Droits insuffisants :** « Vous n’avez pas la permission de modifier ce réglage. Demandez l’accès à un administrateur de votre espace. »
- **Session expirée :** « Votre session a expiré. Reconnectez-vous pour continuer. »
- **Conflit :** « Ce réglage a été modifié par un autre membre depuis son ouverture. Rechargez les dernières valeurs avant de réessayer. »
- **Fonction indisponible :** « Cette option n’est pas encore disponible dans ProspectHub. »
- **Limite d’offre confirmée :** « Cette action n’est pas comprise dans votre offre actuelle. Consultez les détails de l’offre pour connaître les options disponibles. » Ne pas afficher si aucune logique d’offre ne peut l’expliquer.

---

## 10. Parcours utilisateur principaux

### 10.1 Ouvrir mes préférences

1. Le membre ouvre le menu Compte.
2. Il choisit **Mon profil et mes préférences**.
3. La page charge les réglages personnels de l’espace actif.
4. Le membre modifie un champ.
5. Le champ valide le format et montre l’effet local ou partagé.
6. La sauvegarde renvoie un état de succès ou conserve le brouillon en cas d’erreur.

### 10.2 Modifier un accès de membre

1. Une personne autorisée ouvre `Espace de travail > Membres et accès`.
2. Elle choisit un membre.
3. L’interface charge les permissions présentes depuis le serveur.
4. Elle ajuste les capacités et portées.
5. L’aperçu liste les actions nouvelles/retirées et les surfaces concernées.
6. L’interface indique l’effet sur les données et les sessions.
7. Après confirmation, le backend vérifie à nouveau l’autorisation et enregistre l’audit.
8. L’utilisateur concerné reçoit une notification si la politique le prévoit.

### 10.3 Configurer une préférence personnelle contrôlée par l’espace

1. La page différencie la valeur personnelle, la valeur par défaut et une éventuelle contrainte.
2. Le membre sait s’il peut remplacer la valeur par défaut.
3. Un réglage imposé affiche qui l’impose et pourquoi, sans contrôle interactif trompeur.
4. Une modification par l’administrateur présente la population impactée avant l’application.

### 10.4 Acheter des crédits de données ou demander un export payant

1. Afficher quantité, contenu du jeu de données, prix et éventuels crédits avant confirmation.
2. Vérifier la permission et l’abonnement sur le serveur.
3. Créer une opération idempotente liée à l’utilisateur, à l’espace, au jeu de données et au tarif confirmé.
4. Facturer une seule fois; un échec de production ne doit pas laisser un débit orphelin.
5. Présenter état, facture/référence et résultat.

Ce flux appartient à l’usage et à la facturation. Il ne doit pas être simulé par un interrupteur ou une valeur statique de l’onglet Compte.

---

## 11. Phases concrètes de conception et de création

Les phases ordonnent la dépendance produit; une catégorie complète n’est pas dite « faite » quand son écran seul est visible.

### Phase 0 — Inventaire et contrat de données

1. Lister les routes et composants de paramètres existants.
2. Lister les tables et colonnes réellement disponibles pour le profil, les organisations, les membres, les rôles, les notifications et les préférences.
3. Décrire le fournisseur d’identité et les méthodes d’authentification qu’il supporte.
4. Définir le modèle de permission et les portées avant de créer des menus admin.
5. Établir la source réelle de l’offre, des quotas et de la facturation; tant qu’elle n’existe pas, enlever les valeurs simulées de la conception cible.
6. Cartographier les événements CRM susceptibles de déclencher une notification.
7. Définir les états de sauvegarde, de chargement et d’erreur communs.

**Critère de sortie :** chaque écran prévu correspond à une donnée, une permission, une API ou un statut explicitement défini; les éléments inconnus sont signalés comme dépendances.

### Phase 1 — Menu Compte fonctionnel

1. Remplacer le `div` cliquable par un bouton accessible.
2. Charger identité et espace depuis les données authentifiées.
3. Ouvrir/fermer le menu au clic et clavier, gérer le focus et `Échap`.
4. Lier profil/préférences, thème, sécurité et déconnexion vers des routes stables.
5. Afficher changement d’espace uniquement si le backend confirme plusieurs appartenances.
6. N’afficher aide, raccourcis ou nouveautés que si les pages existent.
7. Respecter le thème clair/sombre et les états de chargement.

**Critère de sortie :** aucune action du menu n’est une décoration; chaque ligne a un résultat, et un membre ne peut changer d’espace par manipulation d’identifiant.

### Phase 2 — Préférences personnelles et persistance

1. Rendre le prénom, nom, photo, titre et téléphone modifiables selon le schéma.
2. Persister les préférences d’apparence avec un périmètre défini.
3. Implémenter langue et formats supportés ou limiter les contrôles à ce qui existe.
4. Remplacer le `console.log` de notification par une sauvegarde réelle et une validation.
5. Ajouter page d’arrivée et vues personnelles uniquement si ces préférences sont persistées.
6. Relier états d’erreur et de succès.

**Critère de sortie :** un rechargement conserve les réglages; les préférences d’un membre n’altèrent pas celles d’un autre.

### Phase 3 — Sécurité personnelle

1. Documenter les fonctions supportées par Supabase Auth.
2. Construire les parcours de changement/récupération de mot de passe et e-mail.
3. Afficher MFA/Passkeys seulement si configurés et vérifiés.
4. Inventorier les sessions disponibles; si leur révocation n’est pas supportée, ne pas dessiner une fausse liste d’appareils.
5. Exiger une confirmation récente pour les opérations sensibles.

**Critère de sortie :** les écrans reflètent l’état réel du fournisseur d’identité, sans stocker ou exposer de secret.

### Phase 4 — Membres et équipes

1. Définir invitations, statuts, suspension et transfert d’éléments.
2. Implémenter les permissions d’administration côté serveur et dans RLS.
3. Construire liste, filtres, page membre et résumés de changement.
4. Ajouter équipes et rattachements selon le schéma.
5. Journaliser les événements.

**Critère de sortie :** un prospecteur ne peut ni modifier les droits d’autrui ni lire des membres d’un autre espace; les opérations de départ préservent les données.

### Phase 5 — RBAC et audit

1. Valider les capacités et portées par ressource.
2. Créer les profils de départ et permettre des profils personnalisés si les écrans d’édition sont sûrs.
3. Ajouter aperçu avant/après, membres impactés et historique.
4. Introduire les exports et permissions d’export comme capacités séparées.
5. Ajouter audit consultable et politiques de conservation établies.

**Critère de sortie :** UI, API et base appliquent les mêmes règles; aucune permission ne repose sur un simple booléen côté client.

### Phase 6 — Réglages CRM avancés

Développer par dépendances, dans l’ordre : paramètres de langue et espace; propriétés; associations; étapes/pipelines; qualité/doublons; imports/exports; automatisations et intégrations. Chaque mutation affiche l’impact réel et est autorisée/journalisée.

**Critère de sortie :** les écrans utilisent le modèle de données existant, traitent les erreurs et conflits, et ne suppriment/déplacent pas silencieusement de données.

### Phase 7 — Facturation et achats

1. Intégrer le fournisseur de paiement et son registre d’événements.
2. Modéliser offres, sièges, droits, crédits, commandes de données et remboursements.
3. Construire aperçu des coûts et confirmation.
4. Ajouter factures, moyens de paiement et gestion d’offre.
5. Contrôler import gratuit/export payant côté serveur avec opérations idempotentes.

**Critère de sortie :** montant, état d’offre et usage affichés sont issus de la source de facturation; pas de faux plan ou de double débit.

### Phase 8 — Gouvernance, environnements et opérations avancées

SSO, politiques réseau, sandbox, conservation avancée et suppression d’espace ne démarrent qu’après conception des mécanismes de récupération, des politiques et des dépendances d’infrastructure.

**Critère de sortie :** pas de verrouillage irréversible non récupérable; chaque garantie affichée est démontrée par le système et approuvée par les responsables compétents.

---

## 12. Critères d’acceptation produit et technique

### 12.1 Menu Compte

- Le bouton expose état ouvert/fermé et un nom accessible.
- Navigation clavier complète, fermeture avec `Échap`, focus restauré.
- Nom/email/espace reflètent la session courante.
- Liens conditionnels selon l’appartenance et les permissions.
- Déconnexion invalide réellement la session.
- Le menu ne duplique pas la navigation CRM.

### 12.2 Préférences

- Les valeurs sont enregistrées par le bon périmètre.
- Les états sauvegarde/réussite/échec sont visibles.
- Deux membres d’un même espace ne partagent pas accidentellement leurs préférences.
- Les réglages d’appareil sont explicitement identifiés comme locaux.
- Les données non traduisibles ou non converties ne sont pas présentées comme telles.

### 12.3 Permissions et multi-tenant

- Un prospecteur ne voit pas les pages d’administration non autorisées.
- Requête directe sans permission refusée par l’API et la base.
- Un ID d’organisation forgé ne permet ni lecture ni écriture inter-espace.
- Chaque mutation critique vérifie la permission au moment de l’action.
- Changement de droits journalisé et effectif selon la politique de session.
- Les exports, suppressions, intégrations et factures ont des permissions séparées.

### 12.4 Qualité UX

- Chaque catégorie possède titre et aide décrivant portée et résultat.
- Un utilisateur comprend pourquoi une section est absente, verrouillée ou indisponible.
- Les avertissements correspondent à des conséquences réelles.
- Les champs ont labels, descriptions, erreurs reliées et unités compréhensibles.
- Aucun quota, plan, délai ou statut de connexion n’est codé en dur comme donnée réelle.

---

## 13. Proposition de prompt d’exécution pour Claude Code

```text
Lis d’abord 00_REFERENCES/analysis/14_SPEC_MENU_COMPTE_ET_PARAMETRES.md et les règles AGENTS.md.

Objectif de cette tâche : implémenter uniquement la phase [N] de la spécification du menu Compte et des paramètres. Ne refais pas la navigation principale ni une barre supérieure globale. Avant de toucher au code, inspecte les routes, le schéma Supabase, les politiques RLS, les composants de session et la version de Next.js installée; lis la documentation Next.js locale pertinente.

Règles :
- ne crée aucun contrôle factice ni donnée d’abonnement codée en dur;
- ne déduis jamais un droit depuis une valeur fournie par le navigateur;
- applique les permissions côté serveur et respecte les policies RLS existantes;
- conserve TypeScript strict, évite `any`, ne logue aucun secret;
- suis les textes et périmètres de portée décrits dans la spécification;
- garde les changements ciblés et explique les dépendances manquantes avant de créer des écrans qui les simuleraient;
- pour tout changement visuel, vérifie le rendu dans Playwright et sauvegarde une capture d’écran comme demandé dans AGENTS.md;
- n’ajoute pas de nouvelles bibliothèques sans raison explicite.

Avant modification : résume les fichiers concernés, le contrat de données et les permissions vérifiées. Après modification : fournis le diff, les commandes réellement exécutées, le résultat et les limites restantes. Ne déclare pas une fonctionnalité complète si son enregistrement ou son contrôle serveur n’est pas effectif.
```

Pour exécuter chaque phase, remplacer `[N]` et ajouter le sous-périmètre concret (fichiers et comportement visés). Le prompt ne doit pas être envoyé comme une tâche globale « crée tous les paramètres » sans phase : les contrôles d’accès, les préférences, les intégrations et la facturation dépendent de fondations différentes.

---

## 14. Écarts entre les propositions reçues et la cible

| Proposition reçue | Traitement dans cette spécification |
|---|---|
| Arbre réglages à trois niveaux N1/N2/N3 | Remplacé par des capacités, portées et permissions par action. Les niveaux peuvent servir au découpage des phases, pas déterminer mécaniquement les droits. |
| Tout utilisateur aurait un nombre croissant de réglages selon son niveau | Chaque membre conserve un ensemble complet de préférences personnelles. Les droits supplémentaires concernent uniquement les réglages partagés ou les opérations autorisées. |
| Statuts en ligne/réunion/absent/DND dans le menu | Différé jusqu’à une fonction de disponibilité, d’affectation ou de routage qui consomme ces statuts. |
| Import/export Excel/CSV et crédits | Gardés comme réglages et flux de données, sous réserve de formats réellement pris en charge et de contrôle de facturation serveur. |
| Réutilisation des fichiers importés pour enrichir la base ProspectHub | À traiter explicitement dans les contrats et consentements de collecte; ne pas assimiler une importation à une autorisation commerciale cachée. |
| 2FA, passkeys, SSO/SAML, sessions, allowlist IP | Dépendent du fournisseur d’identité, du plan et de l’infrastructure. À afficher uniquement après vérification technique; ne pas promettre un bouton sans flux réel. |
| Journal d’audit modifiable en « preuve » complète | Journaliser les actions instrumentées; expliquer les limites et rétention. Ne pas promettre un historique exhaustif ou immuable sans garanties techniques. |
| Suppression propriété/espace avec texte d’avertissement seulement | Ajouter précontrôle d’impact, permission, sauvegarde/recours et procédure confirmée; ne pas faire croire qu’un dialogue suffit à rendre l’action sûre. |
| Bac à sable et garantie « aucun envoi réel » | À construire uniquement si l’environnement est isolé et si les envois sont effectivement bloqués. |
| Plan Free et quotas dans la page Paramètres | Supprimer les constantes; alimenter l’affichage depuis abonnements et droits réels. |
| Explications longues dans toutes les lignes | Garder résumés compacts, ajouter des détails progressifs pour le contexte, l’impact, l’exemple et les risques. |

---

## 15. Sources officielles HubSpot et limites de comparaison

Les pages suivantes montrent des comportements documentés de HubSpot au moment de la recherche. Elles inspirent les principes fonctionnels, mais les droits exacts, les abonnements, le nom des menus et la disponibilité changent selon l’offre et peuvent évoluer. ProspectHub ne doit pas copier les quotas ou les garanties HubSpot.

- [Gérer le profil et les préférences utilisateur](https://knowledge.hubspot.com/user-management/profile-and-preferences) — préférences personnelles, nom/photo, langue/formats, fuseau; distinction entre préférence de membre et défaut de compte; certaines fonctions connexes sont gérées ailleurs.
- [Configurer les notifications utilisateur](https://knowledge.hubspot.com/user-management/how-to-set-up-user-notifications-in-hubspot) — réglages de notification par membre et par canal/événement.
- [Créer des profils de notification](https://knowledge.hubspot.com/account-management/create-notification-profiles) — paramètres par défaut ou profils associés à des ensembles d’autorisations; préférences personnelles distinctes.
- [Guide des permissions HubSpot](https://knowledge.hubspot.com/user-management/hubspot-user-permissions-guide) — permissions par module/objet, actions et portée d’accès.
- [Gérer les permissions utilisateur](https://knowledge.hubspot.com/user-management/manage-user-permissions) — édition des permissions et suivi de l’historique associé.
- [Gérer les heures et la disponibilité des utilisateurs](https://knowledge.hubspot.com/user-management/manage-user-working-hours-for-inbox-and-help-desk) — heures et disponibilité peuvent agir sur les files et la prise de rendez-vous.
- [Voir et exporter l’historique d’activité](https://knowledge.hubspot.com/account-management/view-and-export-account-activity-history) — vues, filtres, permissions, journaux d’actions utilisateur, limites de couverture et rétention par catégorie/offre.
- [Configurer l’authentification à deux facteurs](https://knowledge.hubspot.com/account-security/set-up-two-factor-authentication-for-your-hubspot-login) — méthodes et disponibilités dépendantes du plan/région au moment de la documentation.
- [Changer la langue et les réglages régionaux](https://knowledge.hubspot.com/account-management/change-your-language-and-region-settings) — paramètres par défaut de l’espace, à différencier des préférences personnelles.

### 15.1 Ce qui est documenté et ce qui est une recommandation

**Documenté chez HubSpot :** les préférences individuelles sont distinctes des paramètres par défaut de compte; les notifications sont configurables par personne; les droits couvrent plusieurs actions et périmètres; les heures de travail ne sont utiles que lorsqu’elles alimentent les fonctions de disponibilité; les journaux ont des limites de couverture et de rétention dépendantes des catégories/offres.

**Recommandation de conception ProspectHub :** la taxonomie exacte de cette spécification, les capacités atomiques, les profils de départ, les textes français, les contrôles de coûts, les phases et la séparation de l’administration SaaS sont des propositions adaptées au produit ProspectHub. Ce ne sont pas des affirmations sur l’implémentation HubSpot.

---

## 16. Prochaine action concrète

Commencer par la **Phase 0**, puis livrer le **menu Compte fonctionnel (Phase 1)** et les préférences personnelles réellement persistées (Phase 2). L’administration avancée, le RBAC complet et la facturation viennent après la définition de leurs contrats de données et contrôles serveur.

---

# Annexe A — Paramètres opérationnels des communications, appels et automatisations

Cette annexe complète le cahier précédent sans remplacer ses catégories ni ses recommandations. Elle approfondit les réglages permettant aux clients de connecter leurs outils, de définir leurs habitudes de communication et de préparer les fonctions avancées. Les intitulés « à construire » ne signifient pas que la fonction est déjà active dans ProspectHub.

Les deux nouvelles propositions IA fournies par Andry ont été lues. Les idées de parcours guidés, états de connexion, tests, documentation intégrée et arborescence Communication/Automatisations sont reprises et développées. Les valeurs chiffrées et hypothèses de fournisseurs ne sont pas considérées comme des règles réelles sans vérification.

## A.1 Ajouter des catégories sans transformer Paramètres en liste interminable

Ajouter au centre Paramètres les familles suivantes, séparées selon le périmètre du réglage :

| Catégorie de paramètres | Portée principale | Contenu |
|---|---|---|
| E-mail et délivrabilité | personnelle et espace | boîtes connectées, expéditeur, signature, synchronisation, domaine d’envoi, suivi, envois différés |
| Appels et téléphonie | personnelle, équipe, espace | fournisseur, numéros, softphone, routage, disponibilité, journalisation, enregistrement |
| SMS | espace ou compte fournisseur | fournisseur, expéditeurs, opt-in/out, modèles, limites et coûts |
| WhatsApp Business | espace | comptes Meta, numéros, modèles approuvés, webhooks, fenêtre et coûts |
| LinkedIn et prospection assistée | personnelle/équipe | tâches manuelles, journalisation, intégration officielle si l’accès est accordé |
| Calendrier et rendez-vous | personnelle et espace | connexion, synchronisation, disponibilité, liens de réservation |
| Modèles et contenu | personnel/partagé | modèles, variables, version, langue, accès, aperçu et contrôles |
| Tâches et rappels | personnel et espace | valeurs par défaut, rappels, jours ouvrés, jours fériés, canaux |
| Automatisations | espace | déclencheurs, règles, actions, horaires, limites, erreurs, historique |
| Séquences | espace et utilisateur | cadence, inscription, conformité, pauses et exclusions |
| Apps, API et webhooks | espace ou opérateur | connexions OAuth, clés et secrets, événements, limites et journaux |

Dans le parcours simple, les réglages restent lisibles. Un bouton **Configurer les options avancées** révèle le protocole, les ports, les scopes, les politiques de reprise et les détails techniques. La recherche Paramètres doit indexer chaque option et son aide; les catégories avancées ne sont pas exposées aux membres sans capacité d’accès.

## A.2 Cycle de vie commun des connexions

Chaque connexion d’intégration doit réutiliser les mêmes états de base, avec un message adapté au fournisseur :

1. **Non configurée** : aucune autorisation ni secret enregistré.
2. **En attente** : saisie ou redirection OAuth commencée.
3. **Vérification en cours** : test réseau ou validation du fournisseur en cours.
4. **Connectée** : test réussi récemment et autorisation valide.
5. **Action requise** : autorisation expirée/révoquée ou configuration incomplète.
6. **Erreur** : dernier test ou dernière opération a échoué; afficher un code et une prochaine étape non sensible.
7. **Suspendue** : mise en pause par un administrateur ou un opérateur, avec raison et date si disponibles.
8. **Déconnectée** : secrets révoqués ou supprimés; conserver uniquement les métadonnées nécessaires à l’audit.

Pour tout état, enregistrer selon le besoin : fournisseur, propriétaire de la connexion, espace/membre concerné, périmètre de permission accordé, date du dernier succès, date du dernier échec, version de configuration et identifiant d’opération. Ne pas enregistrer de jeton complet, mot de passe, en-tête d’autorisation, contenu complet d’e-mail ou message privé dans les journaux.

Les boutons **Tester la connexion** et **Envoyer un test** ne sont pas interchangeables : le premier vérifie une authentification/capacité sans destinataire tiers; le second réalise un envoi externe, qui doit expliquer le destinataire, le contenu, le coût éventuel et le caractère réel du message avant confirmation.

---

## A.3 E-mail — connexions, envoi, suivi et planification

### A.3.1 Distinguer les trois usages d’e-mail

Le centre Paramètres doit d’abord demander quel problème le membre cherche à résoudre :

1. **Envoyer et suivre des échanges individuels** : connecter la boîte professionnelle personnelle, associer les messages à des prospects selon des règles explicites.
2. **Envoyer des messages depuis une adresse ou un domaine de l’entreprise** : utiliser un fournisseur d’envoi transactionnel ou marketing dédié.
3. **Configurer un serveur SMTP existant** : parcours manuel avancé pour un fournisseur qui n’a pas de connecteur natif.

Ces usages ont des contraintes, des autorisations et des volumes différents. Un compte Gmail/Outlook personnel n’est pas automatiquement un service d’envoi de campagnes de masse. Le CRM doit orienter vers le bon parcours avant de demander des identifiants.

### A.3.2 Ordre recommandé des méthodes de connexion

#### Option 1 — Connexion OAuth Google

- Bouton **Connecter Google**.
- Afficher le compte Google choisi, l’état de connexion, le propriétaire, la date et les scopes réellement acceptés.
- Séparer les autorisations nécessaires à l’envoi de celles nécessaires à la lecture/synchronisation.
- Demander le scope le plus restreint correspondant au cas d’usage. Expliquer en français ce que le CRM peut faire et ne peut pas faire.
- Prévoir annulation, refus du consentement, organisation Google Workspace qui bloque l’application, réautorisation et révocation.
- L’application publique peut devoir passer les vérifications OAuth de Google en fonction des scopes. Ne pas présenter cette étape comme déjà obtenue.

**Texte d’autorisation proposé :** « ProspectHub demande l’autorisation d’envoyer des messages depuis cette boîte. L’accès à la lecture des messages est une autorisation séparée et n’est demandé que si vous activez la synchronisation. »

#### Option 2 — Connexion OAuth Microsoft

- Bouton **Connecter Microsoft 365 ou Outlook**.
- Distinguer compte personnel Microsoft et compte professionnel/scolaire si le fournisseur l’exige.
- Utiliser des permissions déléguées et le principe du moindre privilège pour envoyer au nom du membre.
- Pour une intégration d’envoi seule, préférer le scope d’envoi délégué minimal, par exemple `Mail.Send` quand Microsoft Graph est la voie choisie.
- Afficher une demande de consentement administrateur quand l’organisation l’impose, sans demander au client de fournir son mot de passe.
- Prévoir la perte d’accès, les politiques d’organisation, réautorisation et révocation.

#### Option 3 — Fournisseur/API d’envoi

- Exemples de familles à étudier : SendGrid, Amazon SES, Brevo et autres fournisseurs régionaux ou transactionnels.
- L’utilisateur choisit un fournisseur explicitement supporté ou « Autre fournisseur compatible ».
- Clé API limitée au service d’envoi et au sous-compte concerné; idéalement créer une clé distincte pour ProspectHub.
- Valider l’identifiant du fournisseur et le compte avant d’activer les envois.
- Afficher quotas, prix, régions de traitement et liens vers la console du fournisseur uniquement après vérification des données de celui-ci.

#### Option 4 — SMTP générique, mode avancé

**Promesse à afficher :** « Connectez un serveur SMTP compatible. Les messages seront remis au fournisseur configuré avec ses propres quotas et conditions. ProspectHub ne garantit pas la délivrabilité du fournisseur. »

Champs guidés :

| Champ | Détail et validation |
|---|---|
| Nom de la connexion | Nom visible, ex. « Messagerie de l’équipe commerciale »; ne contient aucun secret. |
| Fournisseur | Choix guidé si connu, sinon « Serveur personnalisé ». |
| Hôte SMTP | Nom DNS, pas une URL; aide avec exemple fictif `smtp.exemple.fr`. Validation syntaxique et contrôle SSRF côté serveur. |
| Port | Valeur fournie par l’hébergeur. Options courantes documentées sans les présenter comme universelles; 587 avec STARTTLS et 465 avec TLS implicite selon le fournisseur. Éviter de proposer le port 25 comme choix normal. |
| Sécurité de transport | STARTTLS obligatoire si supporté; TLS implicite si le fournisseur le demande; pas d’option sans chiffrement en service partagé de production. Validation de certificat activée. |
| Méthode d’authentification | OAuth/XOAUTH2 si supportée; sinon utilisateur + mot de passe d’application ou clé SMTP spécifique au fournisseur. Ne jamais demander le mot de passe principal du compte. |
| Identifiant SMTP | Adresse ou identifiant fourni par le serveur. Afficher masqué après sauvegarde. |
| Secret SMTP | Champ à usage ponctuel, jamais prérempli ni renvoyé à l’interface; chiffré dans un coffre côté serveur et révocable. |
| Adresse d’expédition | Adresse autorisée par le fournisseur; vérifier l’alignement et empêcher l’usurpation d’un domaine dont le client n’a pas la maîtrise. |
| Nom d’expéditeur | Nom affiché, avec exemples sobres et prévisualisation du champ `From`. |
| Adresse de réponse | Facultative; doit être visible et vérifiable. |
| Domaine d’envoi | Domaine authentifié à contrôler séparément; n’est pas déduit automatiquement du compte SMTP. |

**Assistant débutant :** choisir le fournisseur → ouvrir son guide ciblé → demander uniquement les champs nécessaires → vérifier la connexion → envoyer un test à l’adresse du membre → enregistrer.  
**Assistant avancé :** afficher protocole, hôte, port, méthode d’authentification et détails de l’erreur, sans dévoiler le secret.

**Sécurité particulière du SMTP saisi par le client :** la connexion sort du serveur ProspectHub vers une destination contrôlée par l’utilisateur. Elle peut être exploitée pour attaquer le réseau interne ou le service de métadonnées du cloud. Effectuer le test via un worker isolé avec politique réseau de sortie; bloquer loopback, adresses privées/link-local, destinations de métadonnées, redirections et ports interdits; vérifier DNS à la connexion afin de résister au DNS rebinding. Un besoin d’e-mail sur réseau privé exige un déploiement/agent client explicitement conçu pour cela, pas une exception cachée.

**Résultat du test :** étapes horodatées `Résolution du serveur`, `Connexion TLS`, `Authentification`, `Envoi du test`, avec état et cause actionnable. Ne pas montrer de commandes brutes ou d’en-têtes contenant des identifiants. Le test ne doit pas faire croire que la réputation d’expéditeur ou la délivrabilité future est garantie.

**Avertissement important :** un mot de passe de boîte utilisé comme identifiant SMTP est une solution de compatibilité, pas le parcours recommandé. Exchange Online a désactivé Basic Auth pour de nombreux protocoles et SMTP AUTH dépend des politiques du tenant; les intégrations modernes doivent privilégier OAuth. Gmail documente également XOAUTH2 pour SMTP/IMAP et les scopes OAuth ont des niveaux de sensibilité variables.

### A.3.3 Envoi individuel depuis une fiche Prospect

- Choisir la boîte d’expédition parmi les connexions autorisées du membre.
- Modèle, objet, corps, variables, pièces jointes contrôlées.
- Destinataire et adresses Cc visibles avant l’envoi.
- Aperçu avec les données du prospect sélectionné; valeurs de fusion manquantes signalées avant l’envoi.
- Signature automatique selon préférence personnelle et modèle.
- Option de suivi, uniquement si configurée; expliquer pixels et liens de suivi et permettre le réglage prévu par le produit.
- Envoi immédiat ou planifié, avec date/heure et fuseau explicites.
- Confirmation et statut exact : brouillon, en file, accepté par le fournisseur, remis si retour disponible, rejeté, rebondi. Ne pas appeler « livré » une réponse SMTP d’acceptation si aucune preuve de remise n’existe.
- Enregistrer dans la chronologie du prospect le résultat et le fournisseur, en minimisant le contenu sensible.

### A.3.4 Envois programmés

Réglages personnels ou de séquence :

- Date et heure locale, fuseau affiché, conversion UTC côté serveur.
- Fenêtres d’envoi et jours autorisés selon l’espace; possibilité de mettre une opération en pause.
- Replanifier, annuler et consulter la file.
- Si le destinataire change de fuseau, le système ne change pas silencieusement l’heure déjà confirmée.
- Gérer changement d’heure saisonnier, heure inexistante/répétée et changement du fuseau du membre.
- Avant confirmation, afficher volume estimé, boîte sélectionnée et prochaine heure d’envoi.
- Déduplication/idempotence pour éviter un double envoi sur répétition réseau.
- Traiter l’expiration OAuth, boîte déconnectée, quota du fournisseur, adresse invalide et rejet permanent.
- Une tentative automatique ne répète pas un envoi externe dont le résultat est inconnu sans réconciliation avec l’ID du fournisseur ou une politique de déduplication.
- L’option « annuler » précise si le message est encore modifiable ou déjà remis au fournisseur.

### A.3.5 Signature e-mail personnelle

Paramètres :

- Une ou plusieurs signatures nommées (ex. principale, langue française, langue anglaise) si le produit gère plusieurs langues.
- Nom, fonction, téléphone, site et coordonnées sélectionnées depuis le profil; variables non renseignées mises en évidence.
- Contenu texte d’abord; formatage riche et image seulement si l’éditeur et le moteur d’envoi gèrent correctement le HTML.
- Aperçu sur ordinateur et mobile; aperçu du texte brut.
- Cases distinctes « Nouveaux messages » et « Réponses/transferts »; valeur par défaut off/on définie après décision produit.
- Insertion manuelle depuis l’éditeur en plus de l’insertion automatique.
- Vérification des liens, taille d’image et contenu externe; ne pas embarquer de traceur invisible dans une image de signature.
- La signature personnelle ne remplace pas le pied de page et le lien de désinscription d’un message marketing.
- Si la signature est partagée par l’équipe, une personne habilitée peut fournir un modèle de signature verrouillé ou avec variables; l’utilisateur sait quels blocs il peut modifier.

**Texte d’aide :** « Cette signature s’ajoute aux e-mails individuels que vous envoyez depuis ProspectHub. Elle ne remplace pas les informations de désinscription des campagnes. »

### A.3.6 Synchronisation de boîte et journalisation des réponses

- Séparer l’autorisation d’envoi de l’autorisation de lire/synchroniser.
- Choisir la règle : messages envoyés depuis le CRM seulement, échanges avec des prospects CRM, ou aucune synchronisation entrante.
- Configurer des listes d’exclusion (adresses privées, domaines internes, listes jamais journalisées) avec validation d’accès.
- Dossiers envoyés/reçus mappés à partir de ceux que le fournisseur expose; ne pas coder `Sent` ou `INBOX` comme noms universels.
- Afficher la date de dernière synchronisation, le curseur de synchronisation et le dernier échec.
- Import incrémental avec reprise sûre, déduplication par identifiant fournisseur et limites de taille.
- Aucune ingestion d’une boîte entière sans consentement explicite, explication des champs lus et permissions OAuth minimales.
- « Déconnecter » arrête le job et révoque/supprime le refresh token selon la capacité fournisseur; l’utilisateur choisit le traitement de l’historique déjà journalisé selon la politique produit.

### A.3.7 Domaine, authentification et délivrabilité

Sous-page **Domaine d’envoi** réservée au membre disposant de `email.domain.manage` :

- Domaine, sous-domaine d’envoi et propriétaire de connexion.
- Enregistrements DNS réellement générés par le fournisseur : SPF, DKIM, DMARC, CNAME ou vérification de propriété selon le service.
- Nom/valeur/type à copier, TTL si pertinent, bouton de copie, statut « manquant / en attente / vérifié / invalide ».
- Vérification DNS lancée à la demande et dernière date de contrôle.
- Détecter l’existence potentielle d’un SPF existant; expliquer qu’il ne faut pas publier plusieurs politiques SPF sur le même nom. Proposer une aide, ne pas fusionner automatiquement un enregistrement DNS.
- Vérifier l’alignement du domaine `From` avec le domaine authentifié si le fournisseur expose les données.
- Mettre en garde avant de changer une politique DMARC stricte; ne pas proposer une modification DNS automatique sans autorisation du domaine.
- Statistiques de délivrabilité seulement si mesurées : acceptation fournisseur, rebonds, plaintes, désabonnements; différencier mesure et estimation.
- Quotas et limites récupérés du fournisseur ou marqués « à vérifier chez votre fournisseur ». Ne pas inscrire les quotas Gmail dans le code.

### A.3.8 E-mail de séquence vs campagne marketing

Définir au niveau du produit et des permissions :

- message individuel à un prospect;
- série de messages commerciaux personnalisés, contrôlée par une séquence;
- campagne marketing adressée à une audience inscrite.

La désinscription marketing, les listes de suppression, les hard bounces, les plaintes et les préférences de communications doivent être respectés par toute action manuelle, séquence et workflow. Une automation ne peut pas réinscrire un destinataire supprimé ou désabonné. La règle juridique varie selon le canal, le pays, la relation et le contexte; afficher les contrôles produit sans certifier que le client respecte la loi.

### A.3.9 Mesures d’ouverture et clics

- Activer séparément suivi d’ouverture et suivi de clic lorsque disponible.
- Avertissement : pixels bloqués, préchargement et protection de confidentialité peuvent rendre l’ouverture approximative.
- Prévisualiser la réécriture des liens; exclure les liens sensibles ou de désinscription du tracking.
- Contrôle de rétention des événements et visibilité par rôle.
- Utiliser les événements pour des rapports seulement après définition des biais et de la finalité; ne pas présenter une ouverture comme preuve certaine de lecture humaine.

---

## A.4 Appels et téléphonie intégrés

### A.4.1 Choisir une architecture téléphonique

Proposer trois chemins distincts :

1. **Connecter un fournisseur téléphonique** (intégration officielle, quand elle existe).
2. **Configurer un compte fournisseur BYOK** (Bring Your Own Provider) avec comptes, numéros et coûts gérés par le client.
3. **Softphone WebRTC fourni par ProspectHub** seulement si ProspectHub opère l’infrastructure et le support correspondants.

Ne pas lister un fournisseur comme intégré parce qu’il expose une API. Chaque carte doit indiquer : statut réellement disponible, pays couverts, sens d’appel, besoin de numéro, coût connu ou non, conditions fournisseur, prérequis et limites.

### A.4.2 Configuration du fournisseur et numéros

Selon le fournisseur :

- compte/tenant ou projet du fournisseur;
- méthode d’authentification (OAuth, clé/API token, sous-compte);
- secrets saisis dans un champ sécurisé et chiffrés côté serveur;
- numéros sortants vérifiés/achetés, pays, type, format E.164, capacité voix/SMS, statut de vérification;
- numéro par défaut du membre et numéro par défaut de l’équipe;
- appel entrant, transfert, voicemail ou renvoi, uniquement si implémentés;
- URL de callback générée par ProspectHub, événements attendus, méthode de signature et test;
- permissions de création d’appel, de lecture du statut, de lecture/enregistrement audio demandées.

Permettre un test vers un numéro détenu par l’utilisateur ou explicitement approuvé par un administrateur. Le test doit nommer le numéro appelé et le coût potentiel avant exécution.

### A.4.3 Comportement de l’appel CRM

Le panneau softphone, si livré, décrit et implémente :

- appel sortant à partir d’une fiche, numéro visible et confirmation si le numéro est international;
- état : préparation, sonnerie, connecté, terminé, occupé, sans réponse, échec, annulé;
- commandes prises en charge par le fournisseur : couper/rétablir le micro, raccrocher, attente, transfert ou clavier DTMF;
- demande de permission microphone au moment d’utiliser le navigateur, message d’aide si refusée;
- notes d’appel et résultat sélectionné après la fin (répondu, message laissé, à rappeler, mauvais numéro, autre);
- durée, coût si fourni, lien d’enregistrement si autorisé, identifiant fournisseur;
- création d’activité liée au prospect et à l’utilisateur, une seule fois, à partir des callbacks idempotents.

### A.4.4 Enregistrement, transcription et résumés

Réglages séparés par pays/fournisseur :

- enregistrement activé/désactivé;
- notification/annonce obligatoire selon la configuration choisie;
- pause/reprise/arrêt si l’API le supporte;
- transcription, langue, modèle ou fournisseur, correction manuelle;
- résumé IA seulement avec traitement, stockage, accès et coût expliqués;
- durée de conservation et suppression à partir de la politique réellement définie;
- accès au fichier par permission stricte et URL temporaire, jamais lien public permanent;
- audit des lectures/téléchargements si le risque le justifie.

Ne pas proposer « enregistrer sans annonce » comme une option anodine. Les règles et attentes dépendent des juridictions et contextes de l’appel; faire valider l’expérience avant activation.

### A.4.5 Disponibilités, routage et plages d’appel

- fuseau, heures de travail, jours actifs, pauses et indisponibilités;
- statut disponible/absent seulement s’il influence le routage ou l’agenda;
- files et règles : équipe, territoire, rotation, disponibilité et comportement sans destinataire;
- aperçus avant application; historique des changements.
- horaires de démarchage configurés selon les marchés réellement servis, fuseau du destinataire si connu et règles vérifiées.
- Ne pas coder des horaires français comme règle universelle pour des agents basés à Madagascar ou des prospects de pays multiples.
- Les fonctions de vérification de listes d’opposition ou de conformité ne sont affichées comme réalisées que si ProspectHub dispose réellement de la source, de la fréquence de mise à jour, de la base juridique et du blocage côté serveur.

### A.4.6 Santé et erreurs de téléphonie

Afficher un diagnostic par couche : fournisseur joignable, identité acceptée, numéro actif, navigateur prêt, webhook reçu, dernier appel passé. Pour un échec, traduire le code fournisseur sans inventer la cause; conserver le code brut dans les logs techniques sécurisés et proposer la prochaine étape.

---

## A.5 SMS

### A.5.1 Configuration

- Fournisseur sélectionné parmi les connecteurs vraiment supportés ou API compatible.
- Compte, sous-compte, identifiants/clé, services d’envoi, pays, numéro ou sender ID.
- Statut et capacité par pays/réseau; l’expéditeur alphanumérique peut être indisponible ou soumis à validation.
- Webhook de réception et de statut, vérification d’authenticité, statut de dernier événement reçu.
- Test vers numéro contrôlé avec estimation du coût et confirmation.

### A.5.2 Consentement, préférences et désinscription

- Consentement/autorisation par canal stocké sur la fiche avec source, date et texte/version présenté si le produit le prévoit.
- Motifs de suppression par canal, horodatage et provenance.
- Gestion STOP/START/HELP dépendante du fournisseur et du pays; liste des mots-clés locaux configurable seulement si supportée.
- Synchroniser immédiatement l’opt-out reçu avec toutes les séquences et workflows concernés.
- Un workflow ne peut pas ignorer l’opt-out.
- Les termes exacts et exigences dépendent de la réglementation et du fournisseur. Les exemples Twilio ne doivent pas être généralisés à tous les pays.

### A.5.3 Rédaction, longueur et segmentation

- Modèles SMS, variables, aperçu, langue, lien raccourci si service prévu.
- Compteur de caractères calculé selon l’encodage réel et le fournisseur; indiquer le nombre de segments et le coût estimé lorsque la grille tarifaire est connue.
- La longueur GSM-7/UCS-2 varie avec les caractères, les accents, les emojis et la concaténation : ne pas afficher une limite unique comme universelle.
- Afficher le nombre de destinataires, fuseau et fenêtre d’envoi avant envoi en lot.

---

## A.6 WhatsApp Business

### A.6.1 Connexion

- Méthode officielle d’onboarding Meta/WhatsApp disponible pour ProspectHub; ne pas faire copier un token permanent manuellement si une intégration officielle et sûre peut l’éviter.
- Identifiants Business/WABA/numéro et état de vérification lorsque l’API les expose.
- Webhook généré, défi de vérification, signature/validation d’événement, test et dernier événement reçu.
- Permissions, propriétaire et actions accessibles expliqués.
- Tokens protégés par coffre, rotation/révocation et aucun affichage de la valeur après saisie.

### A.6.2 Modèles approuvés et fenêtre de conversation

- Liste des modèles avec langue, catégorie, état fournisseur, date et motif de rejet si fourni.
- Création/modification soumise à approbation du fournisseur; aucun message envoyé en tant que modèle « approuvé » avant statut confirmé par Meta.
- Messages libres et modèles présentés selon l’état réel de la conversation et les politiques actuelles du fournisseur.
- La fenêtre de service et les règles de modèles/tarification peuvent évoluer : calculer l’éligibilité sur les données et règles actuelles de l’API, afficher le dernier état reçu, ne pas se fier uniquement à une phrase statique « 24 h » dans le front.
- Compteurs de messages/limites/coûts issus du compte fournisseur, s’ils sont disponibles.

### A.6.3 Conversations, messages et erreurs

- Statuts : accepté fournisseur, envoyé, remis, lu, échoué, selon les callbacks reçus.
- Idempotence par ID message Meta.
- Pièces jointes autorisées et rétention par type.
- Réponses entrantes liées au contact selon numéro vérifié, avec résolution de doublon et audit.
- Erreurs « numéro invalide », « destinataire injoignable », « modèle non approuvé », « jeton expiré » traduites en étapes de résolution.
- Opt-out central synchronisé dans listes, séquences et workflows.

---

## A.7 LinkedIn : intégration assistée et limites explicites

### A.7.1 Capacités à présenter

- Générer un brouillon de message personnalisé à partir des champs autorisés et le copier.
- Créer une tâche de suivi à faire manuellement, avec lien vers le profil si ce lien est fourni/légalement utilisable.
- Bouton « J’ai effectué cette action » qui journalise une activité déclarée par le membre, sans prétendre l’avoir vérifiée par l’API.
- Connecteur de publication ou de gestion de page uniquement si ProspectHub obtient les permissions et l’accès officiels correspondants.
- État d’accès : non connecté, en demande/approbation, connecté avec scopes, autorisation expirée.

### A.7.2 Ce qu’il ne faut pas promettre

- Pas de scraping de profils ou extraction automatisée d’adresses via LinkedIn.
- Pas d’envoi automatisé de messages de prospection ou d’invitations depuis un compte individuel sans autorisation officielle couvrant exactement cet usage.
- Ne pas importer/conserver les données de membres LinkedIn pour enrichir la base ProspectHub sans base autorisée par les règles LinkedIn.
- Ne pas présenter une API de publication de contenu comme une API de messagerie commerciale.
- Aucun code qui pilote le navigateur, simule des clics ou contourne les limites du fournisseur.

La page doit expliquer honnêtement quelles actions sont manuelles et quelles fonctions proviennent d’une API officiellement autorisée. Les accès aux API LinkedIn ne sont pas automatiques; plusieurs permissions et programmes sont soumis à approbation.

---

## A.8 Calendriers, rendez-vous et disponibilités

### A.8.1 Connexion Google/Microsoft

- OAuth, calendrier sélectionné, permissions exactes, membre propriétaire et état de synchronisation.
- Séparer lecture des événements, création des rendez-vous et modification/suppression.
- Ne demander aucun accès aux événements privés si le cas d’usage n’en a pas besoin.
- Afficher l’effet de chaque niveau d’accès avant le consentement.
- Sélectionner calendriers inclus et exclus; distinguer visibilité des détails et simple blocage de disponibilité.
- État du dernier cycle de synchronisation, erreurs et option de réautoriser/déconnecter.

### A.8.2 Sens de synchronisation et conflits

- CRM vers calendrier, calendrier vers CRM ou sens combinés si l’intégration les prend réellement en charge.
- Règle source de vérité par champ; fuseaux, annulations, modifications et conflits de versions.
- Correspondance par identifiant externe, jamais par titre/heure seulement.
- Événement créé une seule fois; reprise idempotente; traitement des suppressions/annulations.
- L’invitation à un prospect peut envoyer un e-mail externe. Afficher les invités et l’effet avant de créer/modifier un rendez-vous.

### A.8.3 Liens de réservation

- Nom public, durée, lieu/visio, calendrier ciblé, buffers avant/après, délais minimaux et horizons de réservation.
- Heures par jour et périodes d’indisponibilité; fuseau de présentation du prospect.
- Questions de qualification avec types de champs et validation.
- Limites de réservation, confirmations, annulations, reports et notifications.
- URL publique, publication, désactivation et protection contre le partage non voulu.
- Aucun créneau affiché si le calendrier est déconnecté ou si l’utilisateur n’a plus de disponibilité.

---

## A.9 Modèles, signatures et bibliothèques de contenu

### A.9.1 Types d’actifs

- E-mail individuel.
- E-mail de séquence.
- E-mail marketing/campagne si ce module est développé.
- SMS.
- Modèle WhatsApp associé à un identifiant approuvé.
- Scripts d’appel et réponses de qualification.
- Notes, tâches et instructions d’automatisation.

Ne pas laisser un modèle de campagne marketing être envoyé par un simple canal individuel sans contrôle des désinscriptions.

### A.9.2 Champs d’un modèle

- nom, description, langue, catégorie, propriétaire, visibilité (privé, équipe, espace);
- objet/pré-en-tête pour e-mails, corps typé pour le canal, variables utilisées;
- version publiée et brouillon en édition;
- état : brouillon, prêt à utiliser, archivé; état externe approuvé/refusé pour les templates WhatsApp;
- date, auteur et résumé des changements;
- permissions d’édition, de publication et d’archivage.

### A.9.3 Variables de personnalisation

- Catalogue de variables par objet et contexte (prospect, entreprise, membre, affaire).
- Prévisualisation avec un enregistrement que l’utilisateur a le droit de voir.
- État de secours si la valeur est vide, avec possibilité de bloquer l’envoi pour un champ critique.
- Échappement HTML et contrôle anti-injection.
- Variables de consentement, désinscription et paramètres de suivi protégées, non supprimables d’un modèle qui exige ces composants.
- Validation avant activation : champ inexistant, variable vide, lien invalide, pièce jointe manquante, longueur dépassée, absence de consentement selon la règle choisie.

### A.9.4 Éditeur et prévisualisation

- Texte brut pour démarrer; HTML contrôlé ou éditeur visuel lorsque supporté.
- Aperçu mobile, bureau et texte brut.
- Données fictives clairement marquées; données réelles uniquement avec permission et sélection volontaire.
- Envoi de test à soi-même affiche le destinataire et l’objet, et n’inscrit pas l’envoi comme communication réelle avec un prospect.
- Historique de version, comparaison et restauration d’une version publiée.
- Images hébergées et domaines explicites; éviter le contenu tiers non fiable.

---

## A.10 Tâches, rappels et calendrier de travail

### A.10.1 Valeurs par défaut personnelles

- Type de tâche par défaut.
- Durée par défaut par type (appel, rendez-vous, tâche), si la durée est utilisée.
- Échéance suggérée calculée selon jours ouvrés et fuseau utilisateur.
- Rappels : délai avant échéance, canal et possibilité de plusieurs rappels si le moteur le supporte.
- Valeur personnalisée pour tâches créées manuellement; les automations peuvent avoir leur propre échéance explicite.
- Option de remettre les paramètres aux valeurs par défaut.

Éviter les valeurs rigides « appel 15 minutes », « réunion 30 minutes » ou « dans deux jours » si aucune recherche utilisateur ne les justifie. Elles peuvent être proposées comme valeurs initiales modifiables.

### A.10.2 Récapitulatif quotidien et notifications regroupées

- Résumé des tâches à faire, en retard et rendez-vous du jour.
- Heure et fuseau du membre.
- Jours d’envoi; exclure les journées sans travail si configuré.
- Aperçu de l’e-mail et destinataire.
- Regroupement par objet uniquement si l’infrastructure évite de supprimer des événements importants.
- Résumé désactivable séparément des alertes de sécurité et d’assignation.

### A.10.3 Jours fériés et calendriers d’équipe

- Calendrier national choisi pour les calculs ouvrés; possibilité d’ajouter une fermeture propre à l’organisation.
- Définir la région de l’équipe séparément de la région de l’espace si les membres travaillent dans différents pays.
- Un calendrier férié ne doit pas déplacer ou supprimer un rendez-vous déjà confirmé.

---

## A.11 Séquences de prospection

Les séquences décrivent une cadence répétable pour une liste de prospects; les workflows décrivent une logique d’automatisation événementielle plus générale. Les distinguer dans le vocabulaire, l’audit et l’interface.

### A.11.1 Paramètres de séquence

- propriétaire et visibilité;
- durée entre les étapes et fuseau;
- fenêtres autorisées par jour;
- arrêt à réponse, rebond, désinscription, changement d’état ou retrait manuel;
- conditions de sortie et transfert à un autre membre;
- nombre maximal de prospects inscrits, selon les droits/quotas réels;
- boîte d’envoi sélectionnée par membre ou par configuration de l’espace;
- capacité de lancer manuellement une étape LinkedIn uniquement, sans automatiser l’action non autorisée.

### A.11.2 Inscription et suppression d’une séquence

- Vérifier doublon d’inscription, état actif, propriété du prospect et consentement/préférences par canal.
- Exiger une permission de masse adaptée à l’inscription d’une liste entière.
- Avant confirmation, afficher nombre de prospects, étapes, canaux, prochaines dates et éventuels frais/limites.
- Journaliser l’utilisateur et la source de l’inscription (manuelle, liste, workflow).
- Retrait possible avec raison; aucune réinscription automatique d’un prospect qui a demandé l’arrêt.
- Évaluer l’éligibilité au moment de chaque étape, pas seulement à l’inscription initiale.

### A.11.3 Réponses et pause

- Définir les sources de réponse observées (boîte connectée, webhook de canal).
- Si la réponse ne peut pas être observée faute de droits/connexion, afficher cette limite et ne pas promettre l’arrêt automatique.
- Répondre, rebond, opt-out ou signalement peut interrompre la séquence selon la politique définie.
- Pause manuelle conserve le contexte et présente la prochaine date; reprise réévalue consentement, connexion, horaires et état du prospect.

---

## A.12 Automatisations (workflows) — réglages, déclencheurs, actions et garde-fous

### A.12.1 Séparer configuration du moteur et éditeur de workflow

Dans Paramètres, régler les capacités globales : fuseau d’exécution, canaux disponibles, seuils, alertes d’échec, accès, historique et connexions. La création du workflow, ses conditions et ses actions restent dans le module Automatisations. La page Paramètres renvoie à ce module sans dupliquer l’éditeur.

### A.12.2 Déclencheurs à prévoir par famille

Chaque déclencheur est listé seulement si son événement est réellement émis et possède un schéma versionné :

1. **Enregistrement** : créé, modifié, supprimé/restauré; objet et propriétés surveillées.
2. **Cycle commercial** : étape modifiée, affaire gagnée/perdue, tâche créée/terminée/en retard.
3. **Activité** : appel journalisé, rendez-vous créé/annulé, e-mail accepté/rebondi/réponse reçue si connectée.
4. **Consentement et canal** : opt-in/out, modèle approuvé/refusé, canal déconnecté.
5. **Temps** : date d’une propriété, délai depuis une activité, échéance dans X jours; fuseau explicite.
6. **Import et données** : import terminé, lot rejeté, enregistrement enrichi ou besoin de validation.
7. **Webhook entrant** : endpoint authentifié, événement dédupliqué, schéma validé.
8. **Manuel** : lancement par membre autorisé avec aperçu des enregistrements concernés.

Les ouvertures/clics d’e-mails ne sont pas des signaux certains de lecture. Si disponibles, marquer leur nature indicative dans les règles et rapports.

### A.12.3 Conditions et filtres

- Groupes ET/OU avec aperçu en langage naturel de la logique.
- Comparateurs typés : égal, différent, contient, est vide, date avant/après, nombre supérieur/inférieur, appartient à une liste, associé à une équipe.
- Gestion explicite des valeurs nulles et des fuseaux.
- Indiquer si la condition est évaluée au déclenchement, à chaque reprise ou immédiatement avant une action externe.
- Prévisualiser combien d’enregistrements correspondent lorsque les droits et la taille de la requête le permettent.

### A.12.4 Actions

- créer une tâche, attribuer un membre ou une équipe;
- modifier une propriété permise;
- ajouter/retirer d’une liste ou d’une séquence;
- envoyer e-mail, SMS ou WhatsApp seulement via un fournisseur connecté, avec consentement/opt-out et limites revérifiés;
- créer une notification interne;
- attendre un délai ou jusqu’à une date/heure locale;
- branchement conditionnel et fin;
- appeler une intégration/webhook avec permission et validation du destinataire;
- générer une demande d’approbation avant l’action risquée si ce système est pris en charge.

Chaque action affiche ses champs obligatoires, ses permissions, ses conséquences et la donnée utilisée. Aucun secret n’est inséré dans le texte de l’action.

### A.12.5 Contrôles avant activation

- statut brouillon/actif/pausé/erreur/archivé;
- événements d’entrée par période, volume de sortie estimé, tâches et messages externes possibles;
- test sur données fictives ou enregistrement choisi en lecture seule;
- aperçu des étapes, variables fusionnées et horaires;
- vérification que le canal est connecté, que le membre a le droit et que le destinataire peut recevoir;
- repérage de boucle, branche inaccessible, attente sans sortie, action destructive et fenêtre horaire invalide;
- approbation par un rôle secondaire pour les flux à grand volume si cette fonction est créée;
- plan de désactivation et propriétaire de suivi;
- confirmation récapitulative avant activation.

Texte proposé : **« À l’activation, ce workflow pourra créer {n} tâches et tenter {n} envois avec les réglages actuels. Les estimations dépendent des changements de données et de la réponse des fournisseurs. »**

### A.12.6 Limites, concurrence et boucles

- Limite de fréquence par workflow, espace, canal et destinataire issue de la capacité de la plateforme et du contrat fournisseur.
- File d’attente avec priorité, back-pressure et reprise.
- Clé d’idempotence événement + exécution + action.
- Détection de répétition; limite de profondeur/itération et arrêt d’urgence.
- Relance uniquement pour erreurs considérées temporaires; erreurs définitives passent en intervention requise.
- Ne jamais rejouer aveuglément un e-mail/SMS/appel si l’acceptation externe est inconnue.
- Chaque message externe revalide désinscription, règles de silence, fuseau, boîte et quota juste avant l’envoi.

### A.12.7 Historique et réparation

- Timeline par exécution : événement source, conditions, branche choisie, action, durée, résultat, ID fournisseur et erreur expurgée.
- Filtre par workflow, contact, date, membre, état.
- Export de logs protégé; corps de webhook et PII minimisés.
- Relance d’une action déterminée seulement après avoir expliqué le risque de doublon; support idempotence.
- Reprise d’une exécution complète uniquement si chaque action passée et chaque effet externe sont reconciliés.
- Mesures de santé : taux d’échec, backlog, latence, événements abandonnés.

### A.12.8 Paramètres d’espace pour les workflows

- fuseau de référence;
- limites d’exécution et de messages actuelles;
- membres autorisés à créer, modifier, activer et arrêter;
- gestion des erreurs (notification et propriétaire);
- canaux et comptes fournisseur autorisés;
- événements disponibles par plan/entitlement;
- politiques de pause et sauvegarde/version.

Ne pas écrire d’offres telles que « 3 workflows gratuits, 50 Pro, illimité Entreprise » dans la spécification fonctionnelle. Ces limites seront issues du futur catalogue d’abonnement, si ce choix commercial est confirmé.

---

## A.13 Intégrations tierces, OAuth et secrets

### A.13.1 Catalogue d’intégrations

Chaque carte donne : résultat produit, fournisseur, propriétaire de connexion (membre/espace), fonctionnalités disponibles, permissions demandées, données lues/écrites, plan si réellement limité, état, dernière synchronisation, documentation et bouton de révocation.

### A.13.2 OAuth

- Callback avec vérification `state`, PKCE lorsque applicable, contrôle de l’issuer/audience et prévention de rejeu.
- Scopes strictement liés au cas d’usage; répertorier la finalité de chaque scope dans le catalogue.
- Tokens d’accès et de renouvellement stockés côté serveur dans un coffre chiffré, jamais dans `localStorage`/JS client.
- Révocation et suppression; rotation selon fournisseur; expiration visible.
- Gérer scopes retirés, consentement administrateur, refus, callback invalide, utilisateur qui change de compte.
- Parcours de test via comptes de développement sans données réelles.
- Pour chaque connecteur public, documenter vérification fournisseur, consentement OAuth, app review et audit externe requis éventuel.

### A.13.3 Secrets et clés API BYOK

- Types : clé fournisseur, secret SMTP, SID/Auth token, token WhatsApp, credential de compte de service.
- Champ secret accepté une seule fois; les mises à jour demandent une nouvelle valeur, l’ancienne reste masquée.
- Chiffrement par service de gestion de clés; séparation tenant et environnement; rotation et révocation.
- Éviter qu’un admin lisant une configuration puisse récupérer une clé privée; il peut voir statut et préfixe.
- Jamais dans les journaux, erreurs frontales, traces analytics ou exports.
- Permission d’éditer le connecteur distincte de la permission d’utiliser le canal.
- En cas de fuite présumée : révoquer, renouveler, arrêter les jobs associés, prévenir la personne/équipe selon procédure.

### A.13.4 Webhooks sortants

- URL HTTPS, endpoint, événements, secret de signature, version de payload, date de création et propriétaire.
- Vérifier la destination après résolution DNS et à chaque connexion; empêcher accès à l’IP locale, plages privées et endpoint de métadonnées; refuser redirections non sûres.
- Signature HMAC sur octets exacts du corps, identifiant d’événement unique, horodatage et fenêtre anti-rejeu documentés.
- Payload versionné, taille plafonnée et champs sensibles filtrés.
- Livraison asynchrone au moins une fois; le consommateur doit dédupliquer via l’ID d’événement. Ne pas promettre une livraison exactement une fois.
- Politique de délai, nombre de tentatives et backoff définis par le produit; état terminal, mise en pause et réactivation.
- Test d’événement n’inclut pas de PII réelle par défaut.
- Journal : ID, événement, code retour, latence, tentative, réponse tronquée/expurgée et lien de diagnostic.
- Rejouer une livraison exige une permission et signale le risque de traitement dupliqué chez le client.

### A.13.5 API ProspectHub et clés

- API versionnée, environnements test/production réels.
- Création d’une clé avec nom, propriétaire, scopes, date d’expiration, IP autorisées seulement si infra supportée, et prévisualisation des droits.
- Secret affiché une fois; seul un préfixe et les métadonnées demeurent visibles.
- Rotation avec période de coexistence configurable et révocation; aucune période « 24 h » fixe sans décision de sécurité.
- Limite de débit attribuée à la politique/abonnement effective.
- Journal d’utilisation par clé/route et états 401/403/429, en masquant données et Authorization.
- Bouton de révocation immédiate; erreur claire sur les automatisations qui dépendaient de la clé.
- Guides débutants : cURL, JavaScript/TypeScript, Python; tous les exemples utilisent des variables d’environnement et des secrets fictifs.

### A.13.6 Import automatisé par Docker/Kubernetes/n8n

- Connecteur d’ingestion ou endpoint d’import réservé aux flux autorisés.
- Identité technique séparée d’un utilisateur humain, et clé à scopes limités aux objets requis.
- Environnement cible, espace, source, version de schéma, identifiant de lot, compte de service.
- Mapping colonnes, règles de création/mise à jour, critères de doublon, validation des e-mails/téléphones et erreurs ligne par ligne.
- Mode prévisualisation avant chargement; compter créations, mises à jour, rejets et données ambiguës.
- Lot idempotent, reprise partielle, statut de traitement, DLQ/erreurs récupérables et audit.
- Limites de débit et taille configurables selon contrat; reprise avec cursor/offset fiable.
- Provenance et droits d’utilisation des données capturés comme métadonnées; un workflow ne transforme pas automatiquement une source importée en permission de redistribution.

---

## A.14 Guides intégrés pour les clients non techniques

### A.14.1 Contrat d’un guide de configuration

Chaque guide contextualisé doit contenir :

1. **Objectif** — ce que la connexion permettra dans ProspectHub.
2. **Durée indicative** — uniquement estimée/testée; signaler si l’accord d’un admin externe peut allonger le délai.
3. **Prérequis** — compte et rôle fournisseur requis, sans demander un mot de passe de cet autre service.
4. **Données et droits** — ce qui sera lu, écrit, envoyé ou facturé.
5. **Étapes illustrées** — une action par étape, capture récente ou lien officiel.
6. **Test sûr** — destinataire contrôlé ou environnement de test.
7. **Résultat attendu** — état observable.
8. **Erreurs courantes** — message traduisant le code et résolution.
9. **Sécurité et retrait** — où révoquer l’accès et que devient l’historique.
10. **Support** — destination active, version de documentation, date de vérification.

### A.14.2 Composants pédagogiques

- Choix « Je débute » / « Je connais déjà les réglages techniques ».
- Bouton **Où trouver cette information ?** ouvre une instruction visuelle ciblée, pas une longue page générique.
- Exemple avec domaine et adresse fictifs clairement marqués.
- Glossaire contextuel : SMTP, OAuth, scope, webhook, DNS, token, DKIM.
- Barre d’étapes et sauvegarde de brouillon; aucun secret enregistré avant consentement.
- Bouton **Tester** désactivé tant que les champs obligatoires ou l’autorisation manquent.
- Étape de confirmation récapitule le compte/la boîte/numéro et le type d’opération externe.
- Copie du message d’erreur avec IDs de support et sans secret.
- Toutes les captures datées/versionnées; fournisseur peut modifier ses écrans, donc associer au lien officiel vivant.

### A.14.3 Guides à créer

- Connecter une boîte Google en OAuth.
- Connecter une boîte Microsoft en OAuth.
- Connecter un serveur SMTP compatible (hôte, port, TLS, authentification).
- Définir l’expéditeur, le domaine d’envoi et vérifier le DNS.
- Configurer signature personnelle.
- Planifier un e-mail et l’annuler avant envoi.
- Connecter calendrier Google/Microsoft avec permissions minimales.
- Configurer un fournisseur de téléphonie et passer un test autorisé.
- Recevoir et traiter les retours de statut d’appel.
- Connecter SMS, définir opt-in/out et tester le STOP.
- Connecter WhatsApp Business et suivre les modèles.
- Créer un modèle, prévisualiser ses variables et envoyer un test.
- Construire un workflow, le tester puis l’activer.
- Créer un webhook et valider sa signature.
- Créer/révoquer une clé API d’environnement test.
- Relier une ingestion n8n/Docker/Kubernetes à un espace de test.

---

## A.15 Rôles et permissions propres aux fonctions de communication

Ajouter ces permissions au registre RBAC défini plus haut :

| Domaine | Permissions atomiques à distinguer |
|---|---|
| Boîtes e-mail | lire l’état; connecter sa boîte; gérer une boîte d’espace; envoyer depuis une boîte; lire/synchroniser les réponses; déconnecter |
| Domaine e-mail | lire l’état DNS; créer la configuration fournisseur; valider; changer l’expéditeur; gérer la suppression |
| Signature et modèles | créer personnel; modifier partagé; publier; archiver; utiliser un modèle |
| Envois programmés | créer; annuler ses propres envois; voir les envois d’équipe; replanifier ceux d’autrui |
| Campagnes/séquences | créer; inscrire un prospect; inscrire une liste; activer; arrêter; voir métriques |
| Appels | appeler ses prospects visibles; utiliser un numéro; gérer fournisseur; écouter/enregistrer; télécharger l’enregistrement |
| SMS/WhatsApp | envoyer; lancer une campagne; gérer le fournisseur; modifier templates; lire conversations |
| Automatisations | lire; créer; modifier; activer; désactiver; voir l’historique; relancer action |
| Webhooks/API | consulter; créer; faire tourner; révoquer; accéder aux logs; rejouer |

L’accès à un canal ne doit pas augmenter implicitement la portée des données CRM. L’accès à un enregistrement n’accorde pas l’autorisation de le contacter par tous les canaux.

---

## A.16 États, événements et données à prévoir par intégration

Avant de construire les écrans, formaliser les contrats de données; ne pas commencer par créer une table unique `integrations` contenant les tokens et toutes les options au format libre.

### A.16.1 Métadonnées de connexion

- `id`, `workspace_id`, `provider`, `connection_type`, `owner_user_id` nullable;
- `status`, `status_reason_code`, `last_verified_at`, `last_success_at`, `last_error_at`;
- `granted_scopes`, `provider_account_id`, `provider_display_name`, `created_by`, `updated_by`;
- secret référence vers coffre séparé, jamais valeur secrète dans la table accessible aux clients;
- `config_version`, `created_at`, `updated_at`, `revoked_at`.

### A.16.2 Comptes et canaux

Une connexion peut fournir plusieurs boîtes, numéros, calendriers ou expéditeurs. Distinguer la connexion OAuth fournisseur de ses ressources sélectionnées. Mettre une contrainte d’unicité tenant/ressource lorsque les règles le nécessitent; gérer multi-comptes sans écraser la connexion précédente.

### A.16.3 Opérations externes

Créer une entité d’opération pour les envois/appels/imports/exportations avec : UUID idempotent, canal, initiateur, cible interne, référence fournisseur, état, coût estimé/réel si connu, horodatage, erreurs filtrées, nombre de tentatives et lien vers le log d’audit. Éviter de stocker un corps complet de message comme historique par défaut.

### A.16.4 Événements asynchrones

Chaque webhook fournisseur doit être validé, authentifié, enregistré dans une boîte de réception idempotente, traité par worker et acquitté avec une réponse rapide. Gérer doublons, événements désordonnés, retries et événements inconnus. Le log technique doit différencier réception, traitement et effet CRM.

---

## A.17 Échecs et récupération des communications

| Échec | Résultat utilisateur attendu |
|---|---|
| OAuth refusé | Connexion laissée non configurée; expliquer que rien n’a été synchronisé. |
| Token expiré/révoqué | Canal en « Action requise »; tâches en attente suspendues selon la règle; proposer reconnecter. |
| SMTP inaccessible | Aucun statut « connecté »; étapes de diagnostic réseau/TLS/config; secret jamais réaffiché. |
| Message accepté mais callback absent | « En attente de confirmation du fournisseur », pas « échoué » ou « livré » au hasard. |
| Webhook dupliqué | Ne créer qu’un effet CRM; journaliser la duplication idempotente. |
| Limite fournisseur atteinte | Pause ou report selon politique explicite; afficher source, prochaine tentative et coûts évités. |
| Opt-out reçu pendant attente | Annuler les envois ultérieurs sur ce canal et confirmer l’arrêt. |
| Appel terminé, log d’activité échoué | Garder événement fournisseur en file de réconciliation; éviter un second appel lors de la reprise. |
| Planification ambigüe lors du changement d’heure | Demander le choix ou appliquer une règle documentée, jamais décaler silencieusement. |
| Erreur d’API permanente | Intervention requise; ne pas relancer automatiquement en boucle. |

---

## A.18 Ordre de construction étendu

Ces étapes complètent les Phases 0–8 déjà présentes; elles ne les remplacent pas.

### Phase 9 — Fondations de communication

- Séparer messages individuels, campagnes, séquences et notifications système.
- Créer registre des connexions, coffre de secrets, webhooks entrants, queue d’envoi, IDs idempotents et journal d’opérations.
- Définir événements de statut et modèle d’opt-out/suppression.
- Créer les écrans de statut et guides, sans encore exposer des fournisseurs non opérationnels.

### Phase 10 — E-mail individuel et préférences

- OAuth Google et Microsoft en premier si validation des applications/scopes est obtenue.
- Signature et modèles, choix d’expéditeur, prévisualisation, test vers soi.
- Historique de messages et réponse entrante seulement après définition du périmètre OAuth.
- Envoi différé, annulation et gestion de la file.

### Phase 11 — SMTP générique et domaine

- Prototype du worker réseau isolé et politiques anti-SSRF avant l’écran d’hôte personnalisé.
- Implémentation SMTP avec TLS et méthodes auth réellement supportées.
- Chiffrement/rotation secrets, test connexion, vérification domaine et erreurs.
- Mettre SMTP en fonctionnalité expérimentale si les garanties de stockage et réseau ne sont pas encore établies.

### Phase 12 — Calendrier, rappels et téléphonie

- OAuth calendrier, permissions de lecture/écriture, règles anti-doublon et fuseaux.
- Defaults de tâches et rappels.
- Connecteur d’appel retenu, callbacks, softphone, activité journalisée, coûts, permissions et procédure d’échec.
- Enregistrement/transcription différés après la chaîne de consentement, permissions et conservation.

### Phase 13 — Séquences et workflows opérationnels

- Construire moteur et file avant les cartes de configuration.
- Enregistrer opt-out, suppressions par canal et vérification au moment d’exécuter.
- Simulateur, aperçu volume, activation/arrêt, logs et réconciliation.
- Ajouter canaux e-mail, tâches et appels d’abord; SMS/WhatsApp seulement avec fournisseurs et règles d’opt-out configurés.

### Phase 14 — SMS et WhatsApp

- Sélectionner pays de lancement et fournisseur.
- Tester opt-in/out, inbound webhook, coût/segment, templates WhatsApp et statuts réels.
- Définir fuseaux/réglementation par marché avec validation adaptée.

### Phase 15 — API, Webhooks et intégration de données

- Versionner API et événement.
- Clés scope-limited et révocation; sécurité réseau des destinations webhook.
- Console de développement, exemples non secrets, logs expurgés.
- Connecter les pipelines Kubernetes/Docker/n8n avec identités techniques et ingestion idempotente.

### Phase 16 — LinkedIn et intégrations premium

- Vérifier accès de l’application aux produits/permissions LinkedIn demandés.
- Commencer par tâches d’action manuelle et journalisation.
- N’activer une action distante qu’après approbation et validation de l’usage précis.
- Déterminer les fonctionnalités premium à partir de coûts/provider et valeur produit; ne pas bloquer une fonction avant d’avoir défini le modèle tarifaire.

---

## A.19 Check-list d’acceptation spécifique

### E-mail

- OAuth envoie uniquement les permissions expliquées; révocation arrête les traitements.
- SMTP ne peut contacter une adresse interne depuis le worker partagé.
- Aucun secret SMTP/API n’est retourné au navigateur ou aux logs.
- Échec de test ne marque pas la connexion active.
- Test externe confirme le destinataire et n’écrit pas de fausse interaction prospect.
- Envoi programmé respecte fuseau, annulation, opt-out et idempotence.
- Un message accepté par le fournisseur n’est pas présenté comme forcément livré.
- Signature fonctionne en texte/HTML et ne contourne pas les blocs marketing requis.

### Appels et messages

- Appel test cible un numéro contrôlé et chaque callback répété ne crée qu’une activité.
- Enregistrement est désactivé par défaut jusqu’à la décision produit et juridictionnelle.
- Opt-out SMS/WhatsApp bloque séquences et workflows.
- Statut de livraison vient du callback/fournisseur et garde une trace de sa source.
- Coût estimé distingue estimé du facturé.

### Automatisations

- Test simulation ne produit pas d’action externe.
- Activation montre volume/action estimés et canaux concernés.
- Déconnexion fournisseur suspend l’étape nécessitant cette connexion et rend l’erreur visible.
- Actions et déclencheurs revérifient permissions et état de contact.
- Boucles, retries et doublons ont des limites et logs déterministes.

### Webhooks/API

- Signature, timestamp, replay protection, événements dupliqués et endpoint privé sont testés.
- Les clés sont affichées une fois et révocables.
- Une relance ne duplique pas sans avertissement l’effet chez le destinataire.

---

## A.20 Prompts d’aide ciblés pour Claude Code

### Prompt : connexion e-mail OAuth

```text
Implémente uniquement le parcours OAuth du fournisseur [Google ou Microsoft] décrit dans la section A.3.2 du cahier. Commence par vérifier les scopes actuels nécessaires au seul envoi individuel, la configuration déjà présente, les routes serveur et la politique de stockage des tokens. N’ajoute pas d’accès de lecture/synchronisation si cette tâche ne l’exige pas. Implémente state/PKCE selon le fournisseur, sauvegarde les secrets côté serveur, expose uniquement les métadonnées non sensibles, ajoute révocation/erreur/états, et fournis un test de connexion non destructif. Si la validation OAuth externe ou les secrets d’environnement manquent, construis les états et explique exactement le blocage; ne simule pas une connexion réussie.
```

### Prompt : configuration SMTP BYOK

```text
Implémente la configuration SMTP personnalisée uniquement après avoir audité le worker réseau et la prévention SSRF décrits en A.3.2. N’envoie jamais une connexion SMTP depuis le processus web avec une destination libre. Les secrets sont chiffrés côté serveur, jamais relus par le navigateur, les logs ou les erreurs. Exige TLS validé, refuse les destinations loopback/privées/métadonnées et les ports interdits, protège DNS contre rebinding, et utilise un test vers l’adresse de l’utilisateur. Sépare le statut de connexion du test de délivrabilité. Si la plateforme réseau ne peut pas garantir ces règles, implémente seulement la documentation et l’état non disponible, pas un champ host fonctionnel.
```

### Prompt : automatisation de prospection

```text
Implémente une seule tranche du moteur workflow décrite dans A.12, d’abord avec déclencheur et action sans communication externe. Définis schéma versionné, permissions serveur/RLS, idempotence, limite de boucle, file et journal. Ajoute un mode simulation qui n’écrit ni n’envoie. Avant d’ajouter un canal e-mail/SMS/WhatsApp/appel, revalide opt-out, consentement configuré, connexion du canal, fuseau, quota et permissions au moment de l’action. N’invente aucun plan/quota et n’ajoute pas LinkedIn automatisé. Documente les scénarios de concurrence, retry et reprise.
```

### Prompt : intégration téléphonique

```text
Implémente le connecteur téléphonique [fournisseur confirmé] suivant A.4, pour un appel test contrôlé. Vérifie la documentation officielle et version du fournisseur, callback signé, statut/IDs, idempotence et coûts. Ne crée pas d'enregistrement ni de transcription automatique. Stocke le token côté serveur, limite les pays/numéros si la configuration le prévoit, vérifie les droits par prospect, et traite les callbacks dupliqués ou hors ordre. Si aucun compte sandbox ou secret n'est fourni, ne simule pas l'appel comme réussi.
```

---

## A.21 Écarts et corrections à apporter aux deux nouveaux retours IA

| Proposition soumise | Décision et raison |
|---|---|
| « SMTP recommandé pour débuter » avec utilisateur/mot de passe | À présenter comme mode avancé/compatibilité. OAuth est prioritaire pour Gmail/Microsoft; mot de passe principal interdit; SMTP arbitraire exige un worker isolé et une protection SSRF. |
| SMTP 587 recommandé partout, ports 465/25 | Ports et chiffrement suivent le fournisseur; configurer selon sa doc, TLS vérifié, ne pas proposer le port 25 comme choix de base. |
| Gmail/Outlook connectés avec lecture complète de la boîte | Permissions distinctes et scopes minimaux. Ne pas demander `gmail.readonly` si l’envoi seul suffit. Microsoft `Mail.Send` ne veut pas dire lecture. |
| Stocker les identifiants « chiffrés » sans plan technique | Ajouter coffre, séparation de secrets, non-affichage, rotation, suppression, contrôle des logs et worker réseau. Le chiffrement seul n’empêche pas SSRF ni la fuite applicative. |
| « Tout e-mail part via le SMTP du client et quotas du client » | Exact seulement pour les opérations réellement envoyées par ce canal; le CRM doit montrer erreurs/quotas et ne peut garantir la réputation ou la livraison. Distinguer envoi personnel et campagne. |
| Synchroniser IMAP toutes les 1 ou 5 minutes selon plan | Cadence à définir selon fournisseur, coûts, API quotas et besoin; aucune fréquence ou limite de plan n’est validée à ce stade. |
| SPF/DKIM/DMARC présentés comme trois cases fixes | Exigences varient selon fournisseur, volume et période. Vérifier le DNS et le guide actuel du provider; ne pas écraser automatiquement un SPF existant. |
| Quotas Gmail codés dans l’interface | Les limites changent par compte et service; afficher depuis le fournisseur ou « à vérifier », sans nombre statique présenté comme garantie. |
| Une ouverture/clic établit l’engagement du prospect | Les signaux sont approximatifs (protection de confidentialité, bloqueurs, bots); afficher comme indicateurs, jamais preuve certaine de lecture. |
| Heure d’appel française par défaut à tous | À définir par marché, pays, fuseau et règles actuelles; clientèle/prospecteurs peuvent être dans différents pays. |
| « Bloctel vérifié » comme fonction automatique acquise | Ne pas annoncer de vérification sans fournisseur, source et actualisation réellement opérationnels, plus validation des règles applicables. |
| Enregistrement « sans annonce » proposé au même niveau que les autres options | Le retirer du parcours ordinaire; décision conditionnée par pays, consentement, politiques et implémentation effective. |
| SMS fixe 160/70 caractères et STOP automatique partout | Segments/encodage et mots-clés dépendent du canal, du contenu, du fournisseur et du pays. Déléguer quand supporté, tester les opt-outs. |
| WhatsApp 24h/approbation tarifée comme texte permanent | Les règles et tarifs évoluent. Lire l’état du compte/templates et la politique actuelle via l’API/doc fournisseur, exposer la date d’actualisation. |
| « API LinkedIn ne permet aucun message » ou, inversement, automatiser tout outreach | Éviter les affirmations absolues. Accès APIs limité et approuvé par produit; les tâches manuelles sont un parcours sûr. Les usages marketing restreignent fortement l’exploitation/export des données de membres LinkedIn. |
| Exécution webhook exactement une fois | Réseau et retries impliquent généralement livraison au moins une fois; utiliser event ID et déduplication. |
| Retry fixe « 8 essais », désactivation après 100 erreurs | Politique d’exploitation à définir à partir des SLO et types d’erreur; ne pas figer des chiffres sans capacité et tests. |
| Quotas d’automatisation par plan dans les exemples | Entitlements centralisés et futurs; aucun chiffre d’offre n’est supposé dans cette spécification. |
| Capture générique « autorisation vérifiée » après clic | États externes testés et preuve (ID provider/callback) exigés; l’interface ne simule pas un succès. |

---

## A.22 Sources primaires consultées pour cette annexe

Sources officielles consultées le 27 novembre 2026. Elles justifient les contraintes techniques citées; l’implémentation et l’éligibilité à chaque produit restent à revérifier lors de la phase correspondante.

- [Google — IMAP, POP et SMTP pour Gmail](https://developers.google.com/workspace/gmail/imap/imap-smtp) — endpoints/protocoles et mécanismes d’authentification.
- [Google — protocole OAuth XOAUTH2 pour SMTP/IMAP/POP](https://developers.google.com/workspace/gmail/imap/xoauth2-protocol) — OAuth token-based pour l’authentification Gmail.
- [Google — choisir les scopes Gmail](https://developers.google.com/workspace/gmail/api/auth/scopes) — portée `gmail.send`, scopes sensibles/restreints et exigences de vérification.
- [Microsoft — retrait de l’authentification Basic dans Exchange Online](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-basic-authentication-exchange-online) — migration vers Modern Auth/OAuth et restrictions Basic Auth.
- [Microsoft — SMTP AUTH dans Exchange Online](https://learn.microsoft.com/en-us/Exchange/clients-and-mobile-in-exchange-online/authenticated-client-smtp-submission) — SMTP AUTH, OAuth, activation au niveau de l’organisation/boîte et restrictions.
- [Microsoft Graph — envoyer un e-mail](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0) — permissions minimales `Mail.Send` selon type de compte.
- [Gmail — consignes d’expéditeur](https://support.google.com/mail/answer/81126?hl=en-en) — SPF/DKIM/DMARC, bonnes pratiques d’authentification et désinscription en un clic selon volume.
- [Gmail — FAQ des exigences d’expéditeur](https://support.google.com/mail/answer/14229414?hl=en) — alignement DMARC et conditions de mitigation.
- [Google Calendar — créer des événements](https://developers.google.com/workspace/calendar/api/guides/create-events) et [référence Events insert](https://developers.google.com/workspace/calendar/api/v3/reference/events/insert) — OAuth scopes, zones horaires, invités et notifications.
- [Meta — référence de modèles WhatsApp Business](https://developers.facebook.com/docs/graph-api/reference/whats-app-business-account/message_templates/) — états fournisseur de modèles et cycle d’approbation.
- [Meta — références WhatsApp Business Account](https://developers.facebook.com/docs/graph-api/reference/whats-app-business-account) — état du compte et limite de messages exposée selon les comptes/API.
- [LinkedIn — accès aux APIs](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access) — permissions et programmes nécessitant souvent approbation.
- [LinkedIn — Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-01) — API de publication, permissions et contraintes d’accès.
- [LinkedIn — cas d’usage restreints et règles de données](https://learn.microsoft.com/en-us/linkedin/marketing/restricted-use-cases?view=li-lms-2026-09) — limites sur les données membres, le stockage et certains usages de prospection/CRM.
- [Twilio — ressource Call](https://www.twilio.com/docs/voice/api/call-resource) — callbacks de statut, enregistrement et événements de traitement.
- [Twilio — webhooks Voix](https://www.twilio.com/docs/usage/webhooks/voice-webhooks) — événements d’état d’appel et callback de disponibilité des enregistrements.
- [Twilio — Messaging Services](https://www.twilio.com/docs/messaging/services) — segmentation/encodage, canaux et opt-out avancé.
- [Twilio — Advanced Opt-Out](https://www.twilio.com/docs/messaging/tutorials/advanced-opt-out) et [politique de messagerie](https://www.twilio.com/en-us/legal/messaging-policy) — gestion fournisseur des mots-clés et attentes de consentement selon service.

### A.22.1 Degré de certitude

- **Vérifié dans les sources ci-dessus :** Google documente XOAUTH2 et classe les scopes Gmail selon leur sensibilité; Microsoft documente le retrait/désactivation de Basic Auth et la voie OAuth; Google publie des exigences d’authentification et de désinscription selon l’expéditeur; Google Calendar demande des scopes correspondant aux opérations; Meta expose des états de modèles/comptes; LinkedIn soumet plusieurs accès à approbation et publie des restrictions de données; Twilio fournit des callbacks et un mécanisme opt-out pour ses services.
- **Recommandation ProspectHub :** ordre des fournisseurs, UX des assistants, limites réseau SMTP, schéma de connexion, permissions CRM, idempotence, phases, copie française et architecture de queue. Ces décisions sont à implémenter et valider dans ProspectHub, elles ne sont pas des fonctionnalités HubSpot garanties.
- **À revérifier avant chaque intégration :** prix, quotas, pays disponibles, versions d’API, scopes validés, formulaires OAuth, politique de messages, règles de consentement, durées de rétention et conditions commerciales.

## A.23 Prochaine action de conception

Avant d’ouvrir à tous les utilisateurs un formulaire SMTP libre, faire valider le chemin réseau et les secrets par la Phase 0; ensuite, implémenter en priorité le guide de connexion OAuth, la signature personnelle et l’envoi différé avec journal de statut. En parallèle, choisir un seul fournisseur d’appels et un seul fournisseur de messages pour prototyper leurs callbacks et parcours de désinscription avant de proposer un catalogue d’intégrations.

---

## A.24 Modèle de configuration piloté par schéma

Un formulaire piloté par schéma évite que chaque intégration ait des labels, erreurs, états et contrôles différents. Le schéma décrit la présentation et la validation côté interface; il ne remplace pas la validation serveur, la permission ou le chiffrement.

### A.24.1 Contrat de champ

Chaque paramètre décrit au minimum :

- identifiant stable de section et chemin de configuration;
- portée `member`, `workspace` ou `platform`;
- type, libellé, description, exemple fictif et aide progressive;
- caractère obligatoire, règle de format et règle de dépendance;
- si le champ est sensible, comment le saisir, masquer et remplacer;
- où il est stocké et qui peut le lire/écrire;
- état de sauvegarde et comportement d’erreur;
- version de schéma/migration;
- indicateur de fonctionnalité disponible, conditionnée ou non disponible;
- exigences de plan si la logique d’entitlements existe réellement.

### A.24.2 Exemple déclaratif SMTP

```ts
type SettingField = {
  key: string
  label: string
  description: string
  type: 'text' | 'number' | 'select' | 'email' | 'secret' | 'toggle'
  required: boolean
  placeholder?: string
  sensitive?: boolean
  helpKey?: string
  options?: ReadonlyArray<{ value: string | number; label: string }>
  validationKey?: string
  visibleWhen?: { field: string; equals: string | number | boolean }
}

const smtpSettings = {
  id: 'communication.email.smtp',
  scope: 'workspace',
  title: 'Serveur SMTP personnalisé',
  summary: 'Connectez un serveur d’envoi que votre organisation est autorisée à utiliser.',
  availability: 'advanced',
  fields: [
    { key: 'host', label: 'Hôte SMTP', description: 'Nom du serveur fourni par votre hébergeur.', type: 'text', required: true, placeholder: 'smtp.exemple.fr', validationKey: 'smtpHost' },
    { key: 'port', label: 'Port', description: 'Choisissez le port indiqué par le fournisseur.', type: 'number', required: true, placeholder: '587', validationKey: 'smtpPort' },
    { key: 'transport', label: 'Sécurité de connexion', description: 'Le chiffrement doit correspondre au serveur.', type: 'select', required: true, options: [] },
    { key: 'authMethod', label: 'Authentification', description: 'Utilisez OAuth si le fournisseur le prend en charge.', type: 'select', required: true, options: [] },
    { key: 'username', label: 'Identifiant SMTP', description: 'Identifiant dédié fourni par le service.', type: 'text', required: true },
    { key: 'secret', label: 'Mot de passe d’application ou clé SMTP', description: 'Ne saisissez pas le mot de passe principal de votre boîte.', type: 'secret', required: true, sensitive: true },
    { key: 'fromAddress', label: 'Adresse d’expédition', description: 'Adresse autorisée comme expéditeur par le fournisseur.', type: 'email', required: true },
    { key: 'displayName', label: 'Nom affiché', description: 'Nom que le destinataire verra comme expéditeur.', type: 'text', required: true },
  ] satisfies SettingField[],
  actions: ['validate', 'test_connection', 'send_test_to_self', 'save', 'disconnect'],
  requiredCapability: 'email.connection.manage',
} as const
```

Cet exemple ne contient ni valeurs de plan, ni mot de passe par défaut, ni capacité prétendument déjà implémentée. Le code serveur possède la source canonique des champs acceptés, ports autorisés, formats et scopes; un client ne peut pas transmettre un champ secret supplémentaire ignoré par l’interface.

### A.24.3 Règles de rendu du schéma

- Les identifiants et valeurs sont des clés stables; les libellés traduits viennent du dictionnaire i18n.
- L’ordre des champs suit la dépendance logique, pas l’ordre alphabétique.
- Un changement de méthode d’authentification retire du formulaire les champs qui ne s’appliquent plus sans effacer un secret déjà enregistré avant confirmation.
- Le type `secret` n’émet jamais la valeur existante; seul `hasSavedSecret` peut être renvoyé.
- Les validations synchrones de formulaire sont répétées côté serveur.
- Les options sont obtenues d’une liste autorisée versionnée; le front ne définit pas la politique de réseau ou de sécurité.
- Tous les secrets sont exclus des objets d’erreur, logs client, métriques et traces de formulaire.
- Un champ désactivé indique pourquoi; un contrôle sans effet ne doit pas être rendu comme un réglage normal.
- Les migrations de configuration sont versionnées et testées avant toute sauvegarde.

---

## A.25 Parcours et micro-copie concrets à implémenter

### A.25.1 Assistant « Connecter mon serveur SMTP »

**Écran d’entrée — choix du mode**

> **Comment envoyez-vous vos e-mails ?**  
> Pour une boîte Google ou Microsoft, connectez-vous sans saisir de mot de passe. Choisissez SMTP uniquement si votre hébergeur vous a fourni ces paramètres.

Actions : `Connecter Google`, `Connecter Microsoft`, `Utiliser un fournisseur d’envoi`, `Configurer SMTP manuellement`.

**Étape 1 — vérifier le fournisseur**

> **Avant de commencer**  
> Vous aurez besoin du nom du serveur, du port, de la méthode de chiffrement et d’un identifiant SMTP. N’utilisez pas le mot de passe principal de votre boîte. Cette connexion enverra des e-mails au nom des adresses que votre fournisseur autorise.

Cases de prérequis non bloquantes : `J’ai accès au panneau du fournisseur`, `J’ai une clé SMTP ou un mot de passe d’application`, `Je connais l’adresse autorisée comme expéditeur`.

**Étape 2 — détails serveur**

- Hôte SMTP — aide : « Entrez uniquement le nom du serveur, sans `https://` ni chemin. Demandez-le à votre fournisseur. »
- Port — aide : « Utilisez le port fourni. 587 avec STARTTLS et 465 avec TLS implicite sont fréquents, mais le fournisseur fait foi. »
- Sécurité — choix : `STARTTLS`, `TLS implicite`; aucun choix sans chiffrement en production.
- Méthode — choix selon fournisseur : `OAuth`, `Identifiant + secret dédié`.
- Bouton : `Vérifier la connexion`.

**Étape 3 — authentification**

- Identifiant SMTP.
- Secret d’application ou clé SMTP.
- Aide : « Ce secret est transmis de façon sécurisée et masqué après enregistrement. ProspectHub ne vous demandera jamais le mot de passe principal de votre compte. »
- Bouton : `Tester l’authentification`.

**Étape 4 — identité d’expédition**

- Adresse d’expédition, nom visible, adresse de réponse.
- Prévisualisation : `Andry Eudes <prospection@exemple.fr>` (valeur fictive).
- Aide : « Le serveur doit autoriser cette adresse. Une connexion réussie ne vérifie pas la réputation du domaine ni la remise en boîte de réception. »

**Étape 5 — envoi de test**

- Destinataire prérempli avec l’e-mail vérifié du membre; possibilité de le modifier seulement avec une confirmation du destinataire externe.
- Objet : `[Test ProspectHub] Vérification de votre connexion`.
- Corps indique le nom d’espace, la connexion testée et n’inclut aucun prospect réel.
- Confirmation : « Ce test enverra un véritable e-mail à {adresse}. Des frais ou limites peuvent s’appliquer chez votre fournisseur. »
- Bouton : `Envoyer l’e-mail de test`.

**Étape 6 — résultat**

- `Connexion sécurisée établie` / `Authentification acceptée` / `E-mail accepté par le fournisseur`.
- Préciser : « L’acceptation par le serveur ne garantit pas la livraison ni le placement en boîte de réception. »
- Boutons : `Enregistrer cette connexion`, `Modifier les paramètres`, `Révoquer les identifiants saisis`.

**Messages d’erreur**

- Hôte invalide : « Vérifiez le nom du serveur fourni par votre hébergeur. »
- Hôte interdit : « Ce serveur n’est pas accessible depuis ProspectHub pour des raisons de sécurité réseau. »
- TLS invalide : « Le serveur n’a pas présenté un certificat valide. N’ignorez pas cette vérification; contactez votre fournisseur. »
- Authentification refusée : « Le fournisseur a refusé ces identifiants. Vérifiez le nom d’utilisateur et le secret dédié dans son panneau. »
- Délai dépassé : « Le serveur n’a pas répondu à temps. Vérifiez l’hôte, le port et les règles réseau du fournisseur. »
- Test d’envoi échoué : « La connexion fonctionne, mais le serveur n’a pas accepté l’e-mail test. Votre connexion n’est pas encore active pour les envois. »

### A.25.2 Assistant « Planifier un e-mail »

1. Choisir le canal et l’adresse d’expédition.
2. Sélectionner le prospect, modèle et contenu.
3. Prévisualiser les champs de personnalisation et la signature.
4. Choisir `Envoyer maintenant` ou `Planifier`.
5. Si planifié : date, heure, fuseau, fenêtre d’envoi applicable.
6. Vérifier les préférences/opt-out, statut du contact et autorisation de l’utilisateur.
7. Présenter un récapitulatif : destinataire, expéditeur, moment, suivi activé, pièces jointes.
8. Confirmer; créer une opération idempotente et afficher son statut dans la file.
9. Offrir `Modifier l’heure`, `Modifier le message`, `Annuler l’envoi` tant que le fournisseur ne l’a pas accepté.

Micro-copie : **« Votre e-mail est planifié pour le {date} à {heure} ({fuseau}). ProspectHub vérifiera à nouveau l’état de la boîte et les préférences du prospect avant l’envoi. »**

### A.25.3 Assistant « Connecter mon calendrier »

1. Choisir Google ou Microsoft.
2. Afficher séparément « Voir mes disponibilités » et « Créer/modifier des rendez-vous ».
3. Décrire les données lues/écrites en termes simples.
4. Redirection OAuth, choix de compte, consentement.
5. Choisir le calendrier à utiliser et les calendriers privés à ignorer.
6. Règle de confidentialité : partager seulement les plages occupées ou le titre/détails, selon permission et choix.
7. Tester en créant un événement privé de test seulement après autorisation.
8. Confirmer le sens de synchronisation et les doublons.

### A.25.4 Assistant « Connecter un fournisseur d’appels »

1. Choisir un fournisseur effectivement disponible.
2. Afficher pays et fonctions supportées (appel sortant/entrant, statut, enregistrement facultatif).
3. Lire le compte de test ou configurer une clé dédiée.
4. Sélectionner un numéro vérifié et expliquer les coûts indicatifs si le fournisseur les expose.
5. Enregistrer l’URL webhook côté fournisseur et tester la signature.
6. Demander au navigateur l’accès micro au premier appel, pas à l’ouverture de la page Paramètres.
7. Passer un appel test vers un numéro contrôlé, après confirmation de coût.
8. Vérifier le callback terminal et la création unique d’une activité.
9. Activer pour le membre, l’équipe ou l’espace selon la permission choisie.

### A.25.5 Assistant « Activer un workflow »

1. Vérifier propriétaire, déclencheur, objets et événement.
2. Simuler sur un exemple sans produire d’action externe.
3. Afficher une liste des actions et dépendances déconnectées.
4. Prévisualiser volume/contacts et prochaines heures.
5. Avertir des actions externes, coûts, critères de sortie et risques de boucle.
6. Vérifier les permissions de publication et d’utilisation des canaux.
7. Confirmer `Activer le workflow`.
8. Montrer le premier événement traité et le journal; offrir `Mettre en pause` immédiatement.

### A.25.6 Écran de connexion interrompue

> **La connexion à {fournisseur} demande votre attention.**  
> Les nouvelles actions qui nécessitent cette connexion sont en attente. Les autres fonctions ProspectHub continuent de marcher. Reconnectez le compte ou remplacez-le par une autre connexion autorisée.

Actions : `Reconnecter`, `Voir les opérations en attente`, `Désactiver cette connexion`. L’action désactiver précise quelles séquences ou automations seront mises en pause.

---

## A.26 Catalogue fournisseurs : niveau de promesse à afficher

Un catalogue de fournisseurs n’est pas une liste de logos. Chaque ligne doit indiquer ce qui est réellement développé et testé dans ProspectHub.

| Famille | Voie de connexion privilégiée | Options avancées éventuelles | État à afficher |
|---|---|---|---|
| Boîte Gmail/Google Workspace | OAuth avec scopes minimaux | SMTP XOAUTH2; lecture de réponse séparée | Connecteur disponible seulement après revue/consentement OAuth |
| Outlook/Microsoft 365 | Microsoft OAuth/Graph pour l’usage retenu | SMTP AUTH/OAuth selon configuration du tenant | Ne pas supposer Basic Auth utilisable |
| Serveur de messagerie privé ou régional | OAuth/API si proposé par l’hébergeur | SMTP TLS avec secret dédié | Connectivité testée fournisseur par fournisseur; SMTP libre soumis au worker isolé |
| Envoi transactionnel/marketing | API officielle du fournisseur | SMTP relay si nécessaire | Afficher coûts, quotas et région depuis contrat/données fournisseur |
| Appels | API/SDK officiel du fournisseur sélectionné | WebRTC/SIP seulement si infrastructure opérée | Ne pas afficher fournisseur « intégré » sans callbacks validés |
| SMS | API d’un fournisseur couvrant les pays clients | Sender IDs et numéros selon pays | Tarifs/segments et opt-out par fournisseur/région |
| WhatsApp | API WhatsApp Business Platform/Meta | Onboarding/permissions métier | Dépend du statut WABA, templates et politique Meta courante |
| LinkedIn | API et partenariat/permissions officiellement accordés | Actions manuelles assistées | Ne pas automatiser messages/invitations sans voie officiellement approuvée |
| Agenda | Google Calendar API ou Microsoft Graph | Synchronisation plus profonde avec scopes séparés | Permissions lecture/écriture distinctes |
| Automatisation externe | OAuth/application officielle ou webhook signé | n8n, Docker, Kubernetes via API ProspectHub | Identité machine, scopes et journal de lot distincts d’un membre |

Ne pas promettre la compatibilité avec « Gmail, Outlook, SendGrid, etc. » au pluriel comme si toutes les variantes avaient été testées. Le catalogue peut montrer **À venir** avec la liste de prérequis, mais le bouton de connexion ne doit apparaître qu’en état opérationnel.

---

## A.27 Plan de réglages par rôle — quoi laisser au membre et quoi garder délégué

### Tous les membres

- profil, photo, langue et fuseau personnels;
- thème, densité, accessibilité;
- propres canaux personnels autorisés (boîte personnelle, calendrier personnel);
- signature personnelle, modèles privés;
- notifications, rappels et disponibilité personnelle si le routage le consomme;
- sessions et méthode de connexion personnelle;
- envois et appels sur les prospects que leur accès leur permet de traiter;
- statut personnel des tâches et historique des actions qu’ils ont réalisées.

### Responsable d’équipe si permission accordée

- valeurs par défaut d’équipe, plages de disponibilité et distribution;
- modèles partagés de l’équipe;
- calendrier de travail et visibilité des membres dans le périmètre autorisé;
- résultats/erreurs des séquences et workflows dont il est propriétaire;
- réaffectation d’une activité dans son équipe sans lire les données hors de sa portée.

### Personne administrant les communications

- connexions d’espace, domaines e-mail, numéros et fournisseurs;
- scopes OAuth, révocation, callbacks/webhooks;
- politiques de modèles, consentement par canal, suppression/opt-out;
- limites et mesures agrégées;
- paramètres globaux de workflow, sécurité d’envoi et audit.

### Facturation

Une capacité séparée `billing.read/manage` permet à un membre de gérer les factures et plans sans lui donner automatiquement accès aux contacts, enregistrements ou secrets d’intégration.

---

## A.28 Modèle de registre de réglages complet

Avant de coder les sections, créer un registre unique (types stricts et validations serveur) qui permet de répondre à ces questions pour chaque contrôle :

| Propriété du registre | Question répondue |
|---|---|
| `settingId` | Quel réglage stable et documenté est modifié ? |
| `categoryId` | Dans quelle section Paramètres apparaît-il ? |
| `scope` | Préférence membre, appareil, espace, abonnement ou plateforme ? |
| `capability` | Quelle permission précise est exigée pour lire ou modifier ? |
| `entitlement` | Une condition d’offre s’applique-t-elle et quelle source centrale la confirme ? |
| `featureState` | Opérationnel, expérimental, conditionné ou à venir ? |
| `dataContract` | Quelle donnée/API sauvegarde la valeur ? |
| `secretPolicy` | Le champ contient-il un secret et comment est-il chiffré/rotaté ? |
| `validation` | Quelles validations serveur, formats, dépendances et limites ? |
| `effect` | Quand et sur qui le changement agit-il ? |
| `auditEvent` | Quel événement est écrit si le réglage change ? |
| `helpContent` | Quel guide, glossaire et lien fournisseur explique le réglage ? |
| `rollback` | Peut-on annuler, restaurer ou révoquer ? |
| `locale` | Quelles langues et formats sont supportés ? |
| `owner` | Qui maintient l’intégration et vérifie que la doc externe est à jour ? |

L’interface peut ensuite construire une recherche, une liste des intégrations et un indicateur de configuration à partir de ce registre, sans inventer l’état d’une fonction. Une jauge « Configuration de l’espace » doit rester informative et ne pas bloquer l’usage général du CRM; détailler les éléments incomplets et les ignorer s’ils ne concernent pas le plan de l’espace.

---

## A.29 Nouvelles références à intégrer à la bibliothèque du projet

Créer ultérieurement des notes d’implémentation distinctes, chacune datée et sourcée, pour éviter de transformer cette vision en affirmations intemporelles :

- comparatif des scopes OAuth Google/Microsoft nécessaires par cas d’usage;
- fournisseurs e-mail disponibles en Europe et/ou à Madagascar, leurs conditions, régions et coûts actuels;
- fournisseur d’appels réellement disponible dans les marchés clients;
- tarifs et restrictions SMS/WhatsApp par pays;
- état du programme et des permissions LinkedIn pour les usages retenus;
- politiques régionales de prospection et d’enregistrement à faire valider avant lancement commercial;
- intégration n8n, contrats de webhooks, événements d’import et sources de données de ProspectHub.

Chaque note doit indiquer date de consultation, version/API, pays, offre du fournisseur, statut (testé, documenté, non vérifié) et date de révision prévue.
