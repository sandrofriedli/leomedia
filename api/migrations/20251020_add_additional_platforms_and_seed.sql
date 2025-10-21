-- ------------------------------------------------------------
-- Datenbankskript fuer phpMyAdmin
-- Ziel: Mehrplattform-Unterstuetzung + Seed-Daten fuer "videos"
-- ------------------------------------------------------------

-- 1) Datenbank anlegen (falls noch nicht vorhanden) und verwenden
CREATE DATABASE IF NOT EXISTS `kinder_mediathek_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE `kinder_mediathek_db`;

-- 2) Basistabelle erstellen, sofern sie noch nicht existiert
CREATE TABLE IF NOT EXISTS `videos` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `posterUrl` TEXT NULL,
  `previewUrl` TEXT NULL,
  `trailerUrl` TEXT NULL,
  `age` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `summary` TEXT NULL,
  `tags` TEXT NULL,
  `platform` VARCHAR(255) NULL,
  `platformUrl` TEXT NULL,
  `platformLogo` TEXT NULL,
  `watchHint` TEXT NULL,
  `firstAired` VARCHAR(32) NULL,
  `imdbRating` VARCHAR(16) NULL,
  `additionalPlatforms` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_videos_age` (`age`),
  KEY `idx_videos_title` (`title`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- 3) Sicherstellen, dass benötigte Spalten existieren (kompatibel zu MySQL 5.7+)
SET @db_name := DATABASE();
SET @table_name := 'videos';

-- Helper: Fuegt eine Spalte hinzu, falls sie nicht existiert
DROP PROCEDURE IF EXISTS `ensure_column`;
DELIMITER //
CREATE PROCEDURE `ensure_column`(IN column_name VARCHAR(64), IN column_definition VARCHAR(500))
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @db_name
          AND TABLE_NAME = @table_name
          AND COLUMN_NAME = column_name
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', @table_name, '` ADD COLUMN ', column_definition);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

CALL ensure_column('posterUrl', 'posterUrl TEXT NULL AFTER `title`');
CALL ensure_column('previewUrl', 'previewUrl TEXT NULL AFTER `posterUrl`');
CALL ensure_column('trailerUrl', 'trailerUrl TEXT NULL AFTER `previewUrl`');
CALL ensure_column('age', 'age TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER `trailerUrl`');
CALL ensure_column('summary', 'summary TEXT NULL AFTER `age`');
CALL ensure_column('tags', 'tags TEXT NULL AFTER `summary`');
CALL ensure_column('platform', 'platform VARCHAR(255) NULL AFTER `tags`');
CALL ensure_column('platformUrl', 'platformUrl TEXT NULL AFTER `platform`');
CALL ensure_column('platformLogo', 'platformLogo TEXT NULL AFTER `platformUrl`');
CALL ensure_column('watchHint', 'watchHint TEXT NULL AFTER `platformLogo`');
CALL ensure_column('firstAired', 'firstAired VARCHAR(32) NULL AFTER `watchHint`');
CALL ensure_column('imdbRating', 'imdbRating VARCHAR(16) NULL AFTER `firstAired`');
CALL ensure_column('additionalPlatforms', 'additionalPlatforms JSON NULL AFTER `imdbRating`');

DROP PROCEDURE IF EXISTS `ensure_column`;

-- 4) Seed-Daten nur anlegen, solange die Serie noch nicht existiert
START TRANSACTION;

SET @series_title := 'Leo und der Farbenwald';
SET @platforms := JSON_ARRAY(
    JSON_OBJECT('name', 'Kika Mediathek', 'url', 'https://www.kika.de', 'logo', 'assets/logos/kika.svg'),
    JSON_OBJECT('name', 'ARD Mediathek', 'url', 'https://www.ardmediathek.de', 'logo', 'assets/logos/ard-mediathek.svg')
);
INSERT INTO `videos` (
    `title`, `posterUrl`, `previewUrl`, `trailerUrl`, `age`, `summary`, `tags`, `platform`,
    `platformUrl`, `platformLogo`, `watchHint`, `firstAired`, `imdbRating`, `additionalPlatforms`
)
SELECT
    @series_title,
    'assets/images/loewe.png',
    'https://www.youtube.com/watch?v=YE7VzlLtp-4',
    'https://www.youtube.com/watch?v=YE7VzlLtp-4',
    3,
    'Leo entdeckt mit seinen Freunden jeden Tag eine neue Farbe im Wald.',
    'Abenteuer, Farben, Natur',
    'YouTube Kids',
    'https://www.youtube.com/watch?v=YE7VzlLtp-4',
    'assets/logos/youtube.svg',
    'Playlist mit 10 Folgen verfuegbar.',
    '2024',
    '7.8',
    @platforms
WHERE NOT EXISTS (SELECT 1 FROM `videos` WHERE `title` = @series_title);

SET @series_title := 'Mira und der Musikplanet';
SET @platforms := JSON_ARRAY(
    JSON_OBJECT('name', 'YouTube Kids', 'url', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'logo', 'assets/logos/youtube.svg'),
    JSON_OBJECT('name', 'Prime Video', 'url', 'https://www.primevideo.com/detail/0M6R5', 'logo', 'assets/logos/prime-video.svg', 'hint', 'Staffel 1 im Prime-Abo')
);
INSERT INTO `videos` (
    `title`, `posterUrl`, `previewUrl`, `trailerUrl`, `age`, `summary`, `tags`, `platform`,
    `platformUrl`, `platformLogo`, `watchHint`, `firstAired`, `imdbRating`, `additionalPlatforms`
)
SELECT
    @series_title,
    'assets/images/katze.png',
    'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    4,
    'Mira reist von Konzert zu Konzert und lernt dabei neue Klaenge kennen.',
    'Musik, Reisen, Lernen',
    'Netflix Kids',
    'https://www.netflix.com/de/title/81435684',
    'assets/logos/netflix.svg',
    'Kurzfolgen ideal fuer die Morgenroutine.',
    '2022',
    '8.2',
    @platforms
WHERE NOT EXISTS (SELECT 1 FROM `videos` WHERE `title` = @series_title);

SET @series_title := 'Finns Forschungsreise';
SET @platforms := JSON_ARRAY(
    JSON_OBJECT('name', 'YouTube', 'url', 'https://www.youtube.com/watch?v=H886cC3zRjM', 'logo', 'assets/logos/youtube.svg'),
    JSON_OBJECT('name', 'Kika Mediathek', 'url', 'https://www.kika.de/wissen', 'logo', 'assets/logos/kika.svg')
);
INSERT INTO `videos` (
    `title`, `posterUrl`, `previewUrl`, `trailerUrl`, `age`, `summary`, `tags`, `platform`,
    `platformUrl`, `platformLogo`, `watchHint`, `firstAired`, `imdbRating`, `additionalPlatforms`
)
SELECT
    @series_title,
    'assets/images/traktor.png',
    'https://www.youtube.com/watch?v=H886cC3zRjM',
    'https://www.youtube.com/watch?v=H886cC3zRjM',
    5,
    'Finn besucht Kinderlabore und erklaert Wissenschaft im Alltag.',
    'Wissen, Experimente, Technik',
    'ARD Mediathek',
    'https://www.ardmediathek.de',
    'assets/logos/ard-mediathek.svg',
    'Jede Folge endet mit einer einfachen Bastelaufgabe.',
    '2021',
    '8.5',
    @platforms
WHERE NOT EXISTS (SELECT 1 FROM `videos` WHERE `title` = @series_title);

SET @series_title := 'Nora und die Nachbarschaftshelden';
SET @platforms := JSON_ARRAY(
    JSON_OBJECT('name', 'YouTube Kids', 'url', 'https://www.youtube.com/watch?v=ysz5S6PUM-U', 'logo', 'assets/logos/youtube.svg'),
    JSON_OBJECT('name', 'Netflix Kids', 'url', 'https://www.netflix.com/de/title/81515577', 'logo', 'assets/logos/netflix.svg')
);
INSERT INTO `videos` (
    `title`, `posterUrl`, `previewUrl`, `trailerUrl`, `age`, `summary`, `tags`, `platform`,
    `platformUrl`, `platformLogo`, `watchHint`, `firstAired`, `imdbRating`, `additionalPlatforms`
)
SELECT
    @series_title,
    'assets/images/hund.png',
    'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    6,
    'Nora portraitiert helfende Menschen aus ihrer Strasse.',
    'Freundschaft, Alltag, Vorbilder',
    'Prime Video',
    'https://www.primevideo.com/detail/0L00N9',
    'assets/logos/prime-video.svg',
    'Neue Mini-Doku jeden Freitag.',
    '2025',
    '7.9',
    @platforms
WHERE NOT EXISTS (SELECT 1 FROM `videos` WHERE `title` = @series_title);

SET @series_title := 'Pia und der Traumzirkus';
SET @platforms := JSON_ARRAY(
    JSON_OBJECT('name', 'YouTube', 'url', 'https://www.youtube.com/watch?v=eRsGyueVLvQ', 'logo', 'assets/logos/youtube.svg'),
    JSON_OBJECT('name', 'Kika Mediathek', 'url', 'https://www.kika.de/shows', 'logo', 'assets/logos/kika.svg', 'hint', 'Laeuft in der Ferienzeit')
);
INSERT INTO `videos` (
    `title`, `posterUrl`, `previewUrl`, `trailerUrl`, `age`, `summary`, `tags`, `platform`,
    `platformUrl`, `platformLogo`, `watchHint`, `firstAired`, `imdbRating`, `additionalPlatforms`
)
SELECT
    @series_title,
    'assets/images/elefant.png',
    'https://www.youtube.com/watch?v=eRsGyueVLvQ',
    'https://www.youtube.com/watch?v=eRsGyueVLvQ',
    4,
    'Pia trainiert mit einem inklusiven Kinderzirkus fuer die Traumshow.',
    'Zirkus, Teamwork, Fantasie',
    'YouTube Kids',
    'https://www.youtube.com/watch?v=eRsGyueVLvQ',
    'assets/logos/youtube.svg',
    'Livestream zur Premiere am Wochenende.',
    '2023',
    '8.0',
    @platforms
WHERE NOT EXISTS (SELECT 1 FROM `videos` WHERE `title` = @series_title);

SET @series_title := 'Rico rettet die Jahreszeiten';
SET @platforms := JSON_ARRAY(
    JSON_OBJECT('name', 'ARD Mediathek', 'url', 'https://www.ardmediathek.de/kinder', 'logo', 'assets/logos/ard-mediathek.svg'),
    JSON_OBJECT('name', 'Prime Video', 'url', 'https://www.primevideo.com/detail/0N8Q3', 'logo', 'assets/logos/prime-video.svg')
);
INSERT INTO `videos` (
    `title`, `posterUrl`, `previewUrl`, `trailerUrl`, `age`, `summary`, `tags`, `platform`,
    `platformUrl`, `platformLogo`, `watchHint`, `firstAired`, `imdbRating`, `additionalPlatforms`
)
SELECT
    @series_title,
    'assets/images/frosch.png',
    'https://www.youtube.com/watch?v=Z4C82eyhwgU',
    'https://www.youtube.com/watch?v=Z4C82eyhwgU',
    5,
    'Rico reist mit einer Zeitmaschine durch die Jahreszeiten und hilft der Natur.',
    'Natur, Zeitreise, Familie',
    'Netflix Kids',
    'https://www.netflix.com/de/title/81695834',
    'assets/logos/netflix.svg',
    'Bonusfolgen mit Malvorlagen im Abspann.',
    '2020',
    '8.4',
    @platforms
WHERE NOT EXISTS (SELECT 1 FROM `videos` WHERE `title` = @series_title);

COMMIT;
