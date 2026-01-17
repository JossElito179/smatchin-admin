CREATE database smatchindb;
USE smatchindb;

-- Create database (optional)
-- CREATE DATABASE IF NOT EXISTS your_database_name;
-- USE your_database_name;

-- Create users table
CREATE TABLE users (
    id_users INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    user_name VARCHAR(50) UNIQUE NOT NULL,
    role BOOLEAN NOT NULL,
    phone_number VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    profil_img TEXT,
    email VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create teams table
CREATE TABLE teams (
    id_teams INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    logo TEXT,
    team_img TEXT,
    id_users INT NOT NULL,
    is_male BOOLEAN NOT NULL,
    FOREIGN KEY (id_users) REFERENCES users(id_users) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create positions table
CREATE TABLE positions (
    id_positions INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    acronym VARCHAR(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create players table
CREATE TABLE players (
    id_players INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    profil_img TEXT,
    bacc_file TEXT,
    cin_file TEXT,
    id_teams INT NOT NULL,
    id_positions INT NOT NULL,
    is_starter BOOLEAN NOT NULL,
    FOREIGN KEY (id_teams) REFERENCES teams(id_teams) ON DELETE CASCADE,
    FOREIGN KEY (id_positions) REFERENCES positions(id_positions) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Create indexes for better performance
CREATE INDEX idx_teams_user_id ON teams(id_users);
CREATE INDEX idx_players_team_id ON players(id_teams);
CREATE INDEX idx_players_position_id ON players(id_positions);
CREATE INDEX idx_users_username ON users(user_name);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_email ON users(email);
ALTER TABLE users MODIFY role TINYINT(1) NOT NULL DEFAULT 0;


-- 1. Insertion des positions (postes de basket)
INSERT INTO positions (id_positions, name, acronym) VALUES
(1, 'Joueur', 'JR'),
(2, 'Staff', 'SF'),
(3, 'Coach', 'CH');

-- 2. Insertion des utilisateurs (entraîneurs/admin)
INSERT INTO users (id_users, name, first_name, user_name, role, phone_number, password, profil_img, email) VALUES
(2, 'Dupont', 'Jean', 'jdupont', true, '0612345678', '$2b$10$.7OvJx8g3sBKHQ.VvcLoCetN9RLccvEDe2dNfXGfTOG5B5RbxJ.1u', NULL, 'jean.dupont@club.com'),
(3, 'Martin', 'Pierre', 'pmartin', false, '0623456789', '$2b$10$.7OvJx8g3sBKHQ.VvcLoCetN9RLccvEDe2dNfXGfTOG5B5RbxJ.1u', NULL, 'pierre.martin@club.com'),
(4, 'Bernard', 'Luc', 'lbernard', false, '0634567890', '$2b$10$.7OvJx8g3sBKHQ.VvcLoCetN9RLccvEDe2dNfXGfTOG5B5RbxJ.1u', NULL, 'luc.bernard@club.com'),
(5, 'Petit', 'Marc', 'mpetit', true, '0645678901', '$2b$10$.7OvJx8g3sBKHQ.VvcLoCetN9RLccvEDe2dNfXGfTOG5B5RbxJ.1u', NULL, 'marc.petit@club.com'),
(6, 'Durand', 'Thomas', 'tdurand', false, '0656789012', '$2b$10$.7OvJx8g3sBKHQ.VvcLoCetN9RLccvEDe2dNfXGfTOG5B5RbxJ.1u', NULL, 'thomas.durand@club.com');
-- 3. Insertion des équipes
INSERT INTO teams (id_teams, name, logo, is_male, id_users) VALUES
(1, 'Les Aigles', NULL, true, 2),
(2, 'Les Lions', NULL, true, 3),
(3, 'Les Sharks', NULL, true, 4),
(4, 'Les Titans', NULL, true, 5),
(5, 'Les Warriors', NULL, true, 6),
(6, 'Les Celtics', NULL, false, 2),
(7, 'Les Lakers', NULL, true, 3),
(8, 'Les Bulls', NULL, true, 4),
(9, 'Les Spurs', NULL, true, 5),
(10, 'Equipe des staffs', NULL, true, 6);

INSERT INTO players
(id_players, name, first_name, birth_date, profil_img, bacc_file, cin_file, id_teams, id_positions, is_starter)
VALUES
-- TEAM 1 : Les Aigles
(1, 'Coach', 'Aigles', '1980-05-12', NULL, NULL, NULL, 1, 3, false),
(2, 'Diallo', 'Amine', '2000-03-21', NULL, NULL, NULL, 1, 1, true),
(3, 'Rakoto', 'Jean', '2001-07-15', NULL, NULL, NULL, 1, 1, true),
(4, 'Martin', 'Lucas', '2002-01-10', NULL, NULL, NULL, 1, 1, true),
(5, 'Bernard', 'Hugo', '2001-11-08', NULL, NULL, NULL, 1, 1, false),
(6, 'Petit', 'Noah', '2003-06-19', NULL, NULL, NULL, 1, 1, false),

-- TEAM 2 : Les Lions
(7, 'Coach', 'Lions', '1978-09-02', NULL, NULL, NULL, 2, 3, false),
(8, 'Rabe', 'Kevin', '1999-04-11', NULL, NULL, NULL, 2, 1, true),
(9, 'Durand', 'Paul', '2000-08-30', NULL, NULL, NULL, 2, 1, true),
(10, 'Morel', 'Yanis', '2002-02-17', NULL, NULL, NULL, 2, 1, true),
(11, 'Simon', 'Alex', '2001-12-01', NULL, NULL, NULL, 2, 1, false),
(12, 'Lopez', 'Ilyes', '2003-07-05', NULL, NULL, NULL, 2, 1, false),

-- TEAM 3 : Les Sharks
(13, 'Coach', 'Sharks', '1982-01-25', NULL, NULL, NULL, 3, 3, false),
(14, 'Randria', 'Mickael', '1998-09-18', NULL, NULL, NULL, 3, 1, true),
(15, 'Nguyen', 'Thomas', '2000-10-14', NULL, NULL, NULL, 3, 1, true),
(16, 'Kamal', 'Sofiane', '2001-05-06', NULL, NULL, NULL, 3, 1, true),
(17, 'Lemoine', 'Adrien', '2002-03-09', NULL, NULL, NULL, 3, 1, false),
(18, 'Benali', 'Mehdi', '2003-08-22', NULL, NULL, NULL, 3, 1, false),

-- TEAM 4 : Les Titans
(19, 'Coach', 'Titans', '1979-06-11', NULL, NULL, NULL, 4, 3, false),
(20, 'Rasoana', 'Eddy', '1999-01-19', NULL, NULL, NULL, 4, 1, true),
(21, 'Dubois', 'Leo', '2001-04-02', NULL, NULL, NULL, 4, 1, true),
(22, 'Cisse', 'Moussa', '2000-12-12', NULL, NULL, NULL, 4, 1, true),
(23, 'Boyer', 'Maxime', '2002-09-05', NULL, NULL, NULL, 4, 1, false),
(24, 'Traore', 'Ismael', '2003-10-29', NULL, NULL, NULL, 4, 1, false),

-- TEAM 5 : Les Warriors
(25, 'Coach', 'Warriors', '1981-03-07', NULL, NULL, NULL, 5, 3, false),
(26, 'Rakotoni', 'Jordan', '1999-11-15', NULL, NULL, NULL, 5, 1, true),
(27, 'Smith', 'Kevin', '2000-06-10', NULL, NULL, NULL, 5, 1, true),
(28, 'Mendy', 'Alioune', '2001-02-20', NULL, NULL, NULL, 5, 1, true),
(29, 'Henry', 'Tom', '2002-07-17', NULL, NULL, NULL, 5, 1, false),
(30, 'Gomez', 'Luis', '2003-04-03', NULL, NULL, NULL, 5, 1, false);


SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM players;
DELETE FROM teams;
DELETE FROM positions;
DELETE FROM users;

SET FOREIGN_KEY_CHECKS = 1;
