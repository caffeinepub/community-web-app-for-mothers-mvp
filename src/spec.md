# Application Communautaire Web pour Mères   Nara MVP

## Aperçu
Une application communautaire web calme et simple pour les futures mères et les mères, offrant un espace de soutien pour partager des expériences et des ressources.

## Authentification
- Authentification des utilisateurs via Internet Identity
- Fonctionnalités d'inscription et de connexion
- Les utilisateurs peuvent choisir de publier anonymement ou sous leur nom authentifié

## Fonctionnalités Principales

### Page d'Accueil
- Page d'accueil accueillante avec titre "Un espace doux et bienveillant pour les mères"
- Textes chaleureux et humains expliquant le but de la communauté
- Ton conversationnel et rassurant spécifique aux mères, mettant l'accent sur l'appartenance et l'expérience partagée de la maternité
- Navigation claire vers les sections principales avec titres et sous-titres récrits pour être plus chaleureux
- Trois sections de fonctionnalités avec icônes spécifiques :
  - "Parle librement" avec icône bouche
  - "Donne une seconde vie" avec icône recyclage
  - "En toute confiance" avec icône cœur sur fond blanc
- **Nouvelle section "Seconde Main"** placée juste avant la section "Prête à nous rejoindre" :
  - Titre chaleureux et description amicale ("Découvre les trésors partagés par la communauté.")
  - Quatre cartes de catégories avec icônes fines :
    - **Vêtements** (avec icône appropriée)
    - **Chaussures** (avec icône appropriée)
    - **Jouets** (avec icône ours en peluche illustré sur fond blanc circulaire)
    - **Tout découvrir** (avec icône cœur sur fond blanc)
  - Chaque carte navigue vers la page "Seconde Main" avec le filtre de catégorie correspondant appliqué
  - Design cohérent avec la palette orange douce et les formes arrondies
  - Ton humain et chaleureux maintenu
- Thème orange doux cohérent maintenu
- Mise en page sans image héro principale, gardant l'équilibre visuel

### Forum
- Les utilisateurs peuvent créer de nouveaux messages
- Les utilisateurs peuvent répondre aux messages existants
- Les messages sont organisés en catégories prédéfinies avec descriptions conversationnelles et amicales :
  - Grossesse
  - Post-partum
  - Sommeil
  - Organisation
  - Charge Mentale
- Titres et descriptions de catégories réécrits pour sonner conversationnels et amicaux, mettant l'accent sur le soin et l'expérience partagée
- Chaque message affiche la catégorie, l'auteur (ou "Anonyme"), et l'horodatage
- Options de publication : anonyme ou avec le nom de l'utilisateur
- Structure et mise en page inchangées

### Onglet Seconde Main (Échange Seconde Main)
- Les utilisateurs peuvent créer des annonces pour l'échange d'objets avec les champs suivants :
  - Titre
  - Description
  - Prix (en CHF, champ numérique)
  - État de l'objet (sélection parmi : "Neuf", "Très bon état", "Bon état", "Déjà porté")
  - Région (sélection parmi : Genève, Vaud, Valais, Fribourg, Neuchâtel, Jura)
  - Catégorie (sélection parmi : Vêtements, Chaussures, Jouets, Accessoires, Livres, Équipement bébé, Autres)
  - Âge (sélection parmi : 0–3 mois, 3–6 mois, 6–12 mois, 1–2 ans, 2–4 ans, 4+ ans)
  - Téléchargement d'images obligatoire (plusieurs images possibles)
- Cartes d'annonces affichent le prénom ou surnom de l'auteur et le temps de publication relatif (ex: "Posté il y a 2 jours")
- Système de favoris discret "Sauvegarder pour plus tard" :
  - Les utilisateurs peuvent marquer des annonces comme favorites via une icône cœur
  - Cœur plein pour les favoris, cœur vide pour les non-favoris
  - Section "Mes favoris" pour voir toutes les annonces favorites de l'utilisateur
- État, âge et localisation affichés comme tags amicaux
- Vocabulaire e-commerce supprimé, remplacé par un langage communautaire
- Filtres sur la page de vue d'ensemble :
  - Filtre par catégorie (Vêtements, Chaussures, Jouets, Accessoires, Livres, Équipement bébé, Autres)
  - Filtre par âge (0–3 mois, 3–6 mois, 6–12 mois, 1–2 ans, 2–4 ans, 4+ ans)
  - Filtre par région (Genève, Vaud, Valais, Fribourg, Neuchâtel, Jura)
- Vue d'ensemble des annonces :
  - Bouton "Contacter la vendeuse" sur chaque annonce qui ouvre la page de profil du vendeur
- Vue détaillée des annonces :
  - Affichage complet de tous les détails de l'annonce avec descriptions courtes et naturelles (ex: "Porté quelques fois")
  - Section suggestions renommée "D'autres articles de la communauté"
  - Accessible via clic sur l'annonce elle-même
- Modale de création d'annonce avec placeholders et textes d'aide soutenants et humains (ex: "Dis-nous comment tu l'as utilisé", "Quelques mots suffisent")
- Interface avec thème orange doux et calme maintenu
- Icônes pour les attributs des annonces (cœur, prix, état, région)
- Focus sur le partage communautaire et les échanges
- Structure et mise en page inchangées
- **Support de navigation filtrée depuis la page d'accueil** : La page peut être chargée avec des filtres de catégorie pré-appliqués

### Profils Utilisateurs
- Page de profil complète avec en-tête de profil comprenant :
  - Photo de profil optionnelle (forme arrondie douce)
  - Prénom ou surnom
  - Localisation (canton)
  - Statut de maternité sélectionnable parmi : "Essais bébé", "Enceinte", "Postpartum", "Mère de jeune.s enfant.s", "Mère d'ado.s", "Mère d'adulte.s"
  - Bio courte optionnelle (1-2 lignes, ton amical)
- Actions de profil privé (visibles uniquement sur son propre profil) :
  - Bouton "Modifier mon profil"
  - Bouton "Mes favoris"
- Interface à onglets pour l'activité de l'utilisateur :
  - "Mes annonces" (annonces de l'utilisateur)
  - "Mes discussions" (messages du forum de l'utilisateur)
  - "Articles sauvegardés" (favoris, visible uniquement sur son propre profil)
- Chaque section utilise des cartes minimalistes montrant titre, date et tags de statut basiques
- Vue publique (autres utilisateurs) : affiche uniquement prénom/surnom, localisation, statut de maternité, et annonces/messages publics
- Vue privée (utilisateur voyant sa propre page) : inclut les actions personnelles et les favoris
- Messages de confiance et sécurité rassurants :
  - "Ces informations sont visibles uniquement par les membres de la communauté"
  - "Tu peux modifier ou supprimer ton contenu à tout moment"
- Bouton "Chat" pour initier une conversation privée (visible sur les profils des autres utilisateurs)
- **Récupération automatique du profil utilisateur** : Au chargement de la page "Mon profil", l'application récupère automatiquement les données du profil de l'utilisateur connecté via `getCallerUserProfile()`
- **Gestion des profils inexistants** : Si aucun profil utilisateur n'existe encore, afficher un message chaleureux et amical invitant l'utilisateur à compléter son profil (ex: "Complète ton profil pour le voir ici.") au lieu d'un message d'erreur
- **Affichage correct des données** : Tous les champs du profil (nom, localisation, bio, statut, favoris, annonces, discussions) se remplissent correctement quand le profil existe

### Chat Privé
- Système de messagerie privée entre deux utilisateurs
- Conversations accessibles depuis les profils utilisateurs
- Interface de chat intégrée à l'application
- Historique des messages sauvegardé

## Navigation
- Navigation par onglets entre quatre sections principales :
  - Page d'Accueil
  - Forum
  - Seconde Main
  - Mon profil (bouton de navigation avec icône harmonieuse fine en ton orange doux, toujours visible pour les utilisateurs authentifiés)
- Le bouton "Mon profil" navigue vers la page de profil de l'utilisateur connecté (ProfilePage.tsx) et charge automatiquement ses données
- Placement du bouton "Mon profil" après "Seconde Main" dans la barre de navigation principale
- Maintien du style cohérent avec les autres boutons de navigation (palette orange douce, formes arrondies)
- Utilisation de la police DM Serif Display pour tous les labels de menu, y compris "Mon profil", en harmonie avec les titres de l'application
- Cohérence visuelle et typographique entre tous les éléments de navigation
- Utilisation de l'icône fine et douce `profile-icon-fine.dim_24x24.png` pour maintenir la cohérence esthétique du menu

## Footer
- Footer avec mention "Fait avec [icône cœur] par Nara" utilisant la couleur orange douce et la typographie cohérente avec l'application

## Exigences de Design
- Interface minimaliste et calme maintenue
- Palette de couleurs douces avec thème orange doux uniforme sur toute l'application
- Typographie avec police DM Serif Display pour tous les titres, en-têtes (H1, H2, H3) et labels de menu importée depuis Google Fonts
- Police actuelle du corps de texte maintenue inchangée
- Mise en page épurée axée sur la lisibilité du contenu
- Design adaptatif mobile
- Icônes appropriées pour les différents éléments avec style harmonieux et cohérent
- Tous les textes visibles mis à jour pour prioriser l'authenticité, la chaleur et le ton humain plutôt que la perfection formelle
- Espacement typographique et style de composants arrondis existants préservés
- Esthétique centrée sur l'humain avec formes arrondies douces pour la page de profil
- Cohérence visuelle des icônes de navigation et de fonctionnalités avec tons orange doux et contours fins

## Stockage de Données Backend
- Profils utilisateurs étendus (liés à Internet Identity) avec :
  - Photo de profil optionnelle
  - Prénom ou surnom
  - Localisation (canton)
  - Statut de maternité
  - Bio courte optionnelle
- Messages du forum avec catégories, contenu, informations d'auteur, et horodatages
- Réponses aux messages avec structure de fil de discussion
- Annonces de seconde main avec titre, description, prix, état, région, catégorie, âge, et images multiples
- Favoris des utilisateurs (relation entre utilisateur et annonces favorites)
- Gestion des catégories pour les messages du forum
- Conversations de chat privé entre utilisateurs
- Messages de chat avec horodatages et références utilisateurs

## Opérations Backend
- Authentification des utilisateurs et gestion des sessions
- Opérations CRUD pour les profils utilisateurs étendus (mise à jour photo, bio, statut de maternité, localisation)
- **Récupération du profil de l'utilisateur connecté** : Fonction `getCallerUserProfile()` qui retourne le profil de l'utilisateur authentifié ou indique qu'aucun profil n'existe
- Opérations CRUD pour les messages du forum et les réponses
- Opérations CRUD pour les annonces de seconde main avec nouveaux champs (catégorie, âge, images multiples)
- Gestion des favoris (ajouter/supprimer des favoris par utilisateur)
- Récupération des annonces favorites par utilisateur
- Téléchargement et stockage d'images multiples pour les annonces et photos de profil
- Filtrage et récupération des messages basés sur les catégories
- Filtrage des annonces par région, état, catégorie, âge, et statut de favori
- Récupération des annonces et messages du forum par utilisateur pour les pages de profil
- Opérations CRUD pour les conversations de chat privé
- Envoi et récupération de messages de chat entre utilisateurs
- Récupération des conversations par utilisateur

## Langue de l'Interface
- Interface entièrement en français utilisant le tutoiement (forme informelle "tu")
- Tous les textes visibles réécrits pour sonner plus humains, bienveillants et conversationnels
- Microtextes authentiques et non-marketing (ex: "Partage ton expérience" au lieu de "Publie ton message")
- Contenu de la page d'accueil réécrit pour être plus chaleureux et spécifique aux mères, mettant l'accent sur la réassurance, l'appartenance et la maternité partagée
- Messages d'erreur, étiquettes, boutons, formulaires, dialogues, et notifications système en français avec tutoiement et ton chaleureux
- Toutes les fonctionnalités (chat, catégories, filtres d'âge, profils) entièrement en français avec tutoiement et langage supportant
- Cohérence du ton humain et chaleureux dans tous les composants : HomePage.tsx, ForumPage.tsx, SecondHandPage.tsx, ProfilePage.tsx, ChatPage.tsx, et tous les composants sous frontend/src/components
- Phrases simples et chaleureuses écrites en tutoiement, remplaçant les textes formels ou génériques
