-- script sql postgres pour créer le schéma de base de données pour le système de gestion des stages

-- Activer les extensions requises
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Types d'énumération
CREATE TYPE statut_progression AS ENUM ('en_cours', 'termine');
CREATE TYPE statut_decision AS ENUM ('En_attente', 'Accepte', 'Annule', 'Refuse');
CREATE TYPE type_role AS ENUM ('etudiant', 'enseignant', 'tuteur_industriel', 'administrateur');
CREATE TYPE type_poste AS ENUM ('Professeur_assistant', 'Professeur', 'Directeur');
CREATE TYPE spec_jury AS ENUM ('president', 'rapporteur');
CREATE TYPE mode_arch AS ENUM ('archivage_sans_statut', 'archivage_apres_revision', 'non_archivable');
CREATE TYPE type_sexe AS ENUM ('masculin', 'feminin');
CREATE TYPE type_categorie AS ENUM ('obligatoire', 'facultatif');
CREATE TYPE type_projet AS ENUM ('industriel', 'didactique', 'tutore');
CREATE TYPE type_niveau AS ENUM ('1', '2', '3');
CREATE TYPE type_travail AS ENUM ('stage_ete', 'projet_fin_etudes', 'memoire', 'these');
CREATE TYPE decision_soutenance AS ENUM ('reussi', 'echoue', 'reporte');
CREATE TYPE statut_travail AS ENUM ('actif', 'complet', 'archive');
CREATE TYPE type_signature AS ENUM ('numerique', 'manuelle', 'biometrique');
CREATE TYPE Gouvernorats AS ENUM ('Tunis','Ariana','Manouba','Ben Arous',' Nabeul','Zaghouan','Béja','Jendouba','Kasserine','Kef','Siliana','Sousse','Monastir','Mahdia','Sfax','Kairouan','Sidi Bouzid','Gafsa','Tozeur','Kébili','Medenine','Tataouine','Gabès');
CREATE TYPE type_diplome AS ENUM ('Licence','Master','Doctorat');
CREATE TYPE objectif_otp AS ENUM ('confirmation_document', 'authentification_utilisateur', 'autre');

-- Phase 1: Créer toutes les tables sans références de clés étrangères

CREATE TABLE adresse (
    id SERIAL PRIMARY KEY,
    details_adresse VARCHAR(255) NOT NULL,
    code_postal INT NOT NULL,
    ville VARCHAR(20) NOT NULL,
    gouvernorat Gouvernorats NOT NULL,
    details_supplementaires VARCHAR(255)
);

CREATE TABLE departements (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE
);

CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    id_externe UUID UNIQUE DEFAULT uuid_generate_v4(),
    photo_profil VARCHAR(255) NOT NULL DEFAULT 'assets/images/default-avatar.png',
    prenom VARCHAR(50) NOT NULL,
    nom VARCHAR(50) NOT NULL,
    cin VARCHAR(8) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    mot_de_passe_hash VARCHAR(255) NOT NULL DEFAULT crypt('default', gen_salt('bf')),
    role type_role NOT NULL,
    cree_le TIMESTAMP DEFAULT NOW(),
    adresse_id INT,
    jeton_reinitialisation VARCHAR(100),
    expiration_jeton_reinitialisation TIMESTAMP,
    derniere_connexion TIMESTAMP,
    est_actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE entreprises (
    id SERIAL PRIMARY KEY,
    id_externe UUID UNIQUE DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    raison_sociale VARCHAR(100),
    domaine VARCHAR(50),
    adresse_id INT,
    email VARCHAR(255),
    telephone VARCHAR(20) NULL,
    site_web VARCHAR(255),
    est_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE institutions_academiques (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    universite VARCHAR(100) NOT NULL,
    telephone INT NOT NULL,
    fax INT,
    adresse_id INT NULL,
    email VARCHAR(255) NOT NULL,
    directeur VARCHAR(100) NOT NULL,
    url_logo VARCHAR(255) DEFAULT 'assets/images/default-logo.png'
);

CREATE TABLE programme_diplome (
    id VARCHAR(20) PRIMARY KEY,
    code VARCHAR(10) NULL UNIQUE,
    nom VARCHAR(50) NULL UNIQUE,
    diplome type_diplome NOT NULL,
    filiere VARCHAR(50) NOT NULL,
    specialite VARCHAR(50) NOT NULL,
    duree_annees INT NULL,
    description TEXT,
    institution VARCHAR(20)
);

CREATE TABLE filieres (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    departement VARCHAR(20) NOT NULL,
    description TEXT
);

CREATE TABLE specialites (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    filiere VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE objets_signature (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT,
    nom_signataire VARCHAR(100),
    email_externe VARCHAR(100),
    type_signature VARCHAR(20) NOT NULL,
    url_image VARCHAR(500),
    cree_le TIMESTAMP DEFAULT NOW(),
    est_verifie BOOLEAN DEFAULT FALSE,
    verifie_par INT,
    verifie_le TIMESTAMP,
    est_revoque BOOLEAN DEFAULT FALSE,
    revoque_le TIMESTAMP
);

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    objet_signature_id INT NOT NULL,
    utilisateur_signataire_id INT,
    email_signataire VARCHAR(100),
    signe_le TIMESTAMP DEFAULT NOW(),
    adresse_ip VARCHAR(45),
    agent_utilisateur TEXT,
    est_valide BOOLEAN DEFAULT FALSE,
    valide_par INT,
    valide_le TIMESTAMP
);

CREATE TABLE etudiants (
    utilisateur_id INT PRIMARY KEY,
    sexe type_sexe,
    id_etudiant VARCHAR(10) NOT NULL,
    diplome VARCHAR(20) NOT NULL,
    niveau type_niveau NOT NULL
);

CREATE TABLE enseignants (
    utilisateur_id INT PRIMARY KEY,
    titre VARCHAR(50),
    poste type_poste,
    departement VARCHAR(50) NULL,
    emplacement_bureau VARCHAR(50),
    institution_id INT
);

CREATE TABLE tuteurs_industriels (
    utilisateur_id INT PRIMARY KEY,
    entreprise_id INT NULL,
    titre_poste VARCHAR(50) NOT NULL
);

CREATE TABLE administrateurs (
    utilisateur_id INT PRIMARY KEY,
    poste VARCHAR(50) NOT NULL,
    niveau_acces INT NOT NULL DEFAULT 1,
    peut_gerer_utilisateurs BOOLEAN DEFAULT TRUE
);

CREATE TABLE travail_academique (
    id SERIAL PRIMARY KEY,
    etudiant_id INT NOT NULL,
    est_travail_requis BOOLEAN NOT NULL,
    type type_travail NOT NULL,
    stage_requis BOOLEAN NOT NULL,
    cree_le TIMESTAMP DEFAULT NOW(),
    max_collaborateurs INT DEFAULT 1,
    statut statut_travail NOT NULL DEFAULT 'actif',
    date_debut DATE,
    date_fin DATE
);

CREATE TABLE responsabilites (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    travail_academique_id INT NOT NULL,
    role VARCHAR(50) NOT NULL,
    assigne_par INT,
    assigne_le TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cahier_charges (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    objectifs TEXT NOT NULL,
    taches_principales TEXT NOT NULL,
    profil_etudiant TEXT NOT NULL,
    signature_tuteur_academique INT,
    signature_tuteur_industriel INT,
    cree_le TIMESTAMP DEFAULT NOW(),
    mis_a_jour_le TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stages (
    id SERIAL PRIMARY KEY,
    etudiant_id INT NOT NULL,
    travail_academique_id INT,
    entreprise_id INT NOT NULL,
    tuteur_industriel_id INT NOT NULL,
    type_stage type_categorie NOT NULL DEFAULT 'obligatoire',
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    signature_entreprise INT NOT NULL,
    statut statut_progression NOT NULL DEFAULT 'en_cours'
);

CREATE TABLE prototypes (
    id SERIAL PRIMARY KEY,
    travail_academique_id INT NOT NULL,
    soumis_le TIMESTAMP DEFAULT NOW(),
    url_fichier VARCHAR(500) NOT NULL,
    statut statut_decision NOT NULL DEFAULT 'En_attente',
    commentaires_revue TEXT
);

CREATE TABLE salles (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    emplacement VARCHAR(100) NOT NULL,
    capacite INT,
    est_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE reservations_salle (
    id SERIAL PRIMARY KEY,
    salle_id INT NOT NULL,
    utilisateur_id INT NOT NULL,
    date_reservation DATE NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    statut statut_progression NOT NULL DEFAULT 'en_cours',
    objectif VARCHAR(255),
    cree_le TIMESTAMP DEFAULT NOW()
);

CREATE TABLE evaluations_jury (
    id SERIAL PRIMARY KEY,
    soutenance_id INT NOT NULL,
    superviseur_id INT NOT NULL,
    president_id INT NOT NULL,
    rapporteur_id INT NOT NULL,
    score INT NOT NULL,
    commentaires_evaluation TEXT,
    date_evaluation TIMESTAMP DEFAULT NOW(),
    role_jury spec_jury NOT NULL
);

CREATE TABLE soutenances (
    id SERIAL PRIMARY KEY,
    travail_academique_id INT NOT NULL,
    prototype_id INT,
    reservation_id INT,
    decision decision_soutenance NOT NULL,
    evaluation_jury_id INT
);

CREATE TABLE projets_fin_etudes (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    travail_academique_id INT NOT NULL,
    stage_id INT,
    type type_projet NOT NULL,
    tuteur_academique_id INT NOT NULL,
    signature_tuteur_academique INT,
    mots_cles TEXT[],
    competences_requises TEXT[],
    decision statut_decision NOT NULL DEFAULT 'En_attente',
    date_soumission TIMESTAMP DEFAULT NOW()
);

CREATE TABLE memoires_recherche (
    id SERIAL PRIMARY KEY,
    travail_academique_id INT NOT NULL,
    tuteur_academique_id INT NOT NULL,
    statut statut_progression NOT NULL DEFAULT 'en_cours',
    laboratoire VARCHAR(100) NOT NULL,
    signature_tuteur_id INT NOT NULL,
    directeur_laboratoire VARCHAR(100) NOT NULL,
    resume TEXT NOT NULL,
    mots_cles TEXT[],
    decision statut_decision NOT NULL DEFAULT 'En_attente',
    date_soumission TIMESTAMP DEFAULT NOW()
);

CREATE TABLE documents (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    url_fichier VARCHAR(500) NOT NULL,
    telecharge_par INT NOT NULL,
    telecharge_le TIMESTAMP DEFAULT NOW(),
    taille_fichier BIGINT,
    type_fichier VARCHAR(10)
);

CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    expediteur_id INT NOT NULL,
    prenom_destinataire VARCHAR(50) NOT NULL,
    nom_destinataire VARCHAR(50) NOT NULL,
    email_destinataire VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    nom_entreprise INT,
    destinataire_id INT NOT NULL,
    message TEXT,
    signature_id INT
);

CREATE TABLE audits (
    id SERIAL PRIMARY KEY,
    nom_table VARCHAR(50) NOT NULL,
    id_enregistrement INT NOT NULL,
    type_action VARCHAR(20) NOT NULL,
    anciennes_donnees JSONB,
    nouvelles_donnees JSONB,
    effectue_par INT,
    effectue_le TIMESTAMP DEFAULT NOW()
);

CREATE TABLE demandes_changement_tuteur (
    id SERIAL PRIMARY KEY,
    stage_id INT NOT NULL,
    etudiant_id INT NOT NULL,
    tuteur_actuel_id INT NOT NULL,
    nouveau_tuteur_id INT NOT NULL,
    raison TEXT NOT NULL,
    statut statut_decision NOT NULL DEFAULT 'En_attente',
    validation_admin BOOLEAN DEFAULT FALSE,
    valide_par INT,
    valide_le TIMESTAMP,
    signature_nouveau_tuteur INT,
    cree_le TIMESTAMP DEFAULT NOW(),
    mis_a_jour_le TIMESTAMP DEFAULT NOW()
);

CREATE TABLE livraison_diplome (
    id SERIAL PRIMARY KEY,
    etudiant_id INT NOT NULL,
    travail_academique_id INT NOT NULL,
    evaluation_jury_id INT NOT NULL,
    travail_soumis BOOLEAN NOT NULL DEFAULT FALSE,
    biens_retournes BOOLEAN NOT NULL DEFAULT FALSE,
    id_diplome VARCHAR(500),
    delivre_par INT,
    delivre_le TIMESTAMP,
    statut statut_decision NOT NULL DEFAULT 'En_attente',
    cree_le TIMESTAMP DEFAULT NOW(),
    mis_a_jour_le TIMESTAMP DEFAULT NOW()
);

-- Partie du schéma relative aux messages
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    est_groupe BOOLEAN NOT NULL DEFAULT FALSE,
    cree_le TIMESTAMP DEFAULT NOW(),
    mis_a_jour_le TIMESTAMP DEFAULT NOW(),
    est_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE participants_conversation (
    conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
    utilisateur_id INT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    rejoint_le TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (conversation_id, utilisateur_id)
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
    expediteur_id INT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    contenu TEXT NOT NULL,
    envoye_le TIMESTAMP DEFAULT NOW(),
    est_lu BOOLEAN DEFAULT FALSE
);

-- Partie du schéma relative au chatbot
CREATE TABLE conversations_chatbot (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    commence_le TIMESTAMP DEFAULT NOW(),
    termine_le TIMESTAMP
);

CREATE TABLE messages_chatbot (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations_chatbot(id) ON DELETE CASCADE,
    est_message_utilisateur BOOLEAN NOT NULL,
    contenu TEXT NOT NULL,
    envoye_le TIMESTAMP DEFAULT NOW()
);

-- Partie du schéma relative à la vérification OTP
CREATE TABLE verifications_otp (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    code_otp VARCHAR(6) NOT NULL,
    objectif objectif_otp NOT NULL DEFAULT 'autre',
    cree_le TIMESTAMP DEFAULT NOW(),
    expire_le TIMESTAMP NOT NULL,
    est_utilise BOOLEAN DEFAULT FALSE,
    document_id VARCHAR(50) REFERENCES documents(id)
);

-- Phase 2: Ajouter toutes les contraintes et références de clés étrangères
-- [Les contraintes de clés étrangères et les index suivent...]
