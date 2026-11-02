-- PS Toolbox database. Run once: mysql -u root -p < server/schema.sql
CREATE DATABASE IF NOT EXISTS ps_toolbox CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ps_toolbox;

-- One row per project. `data` holds the whole Conference Rooms state as JSON: every room with its
-- setup, survey answers and install progress, plus the report settings. name, site and room_count
-- are copied out of it on each save so the project list can be read without parsing the JSON.
CREATE TABLE IF NOT EXISTS projects (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL DEFAULT '',
  site        VARCHAR(300) NOT NULL DEFAULT '',
  room_count  INT UNSIGNED NOT NULL DEFAULT 0,
  data        LONGTEXT     NOT NULL,
  version     INT UNSIGNED NOT NULL DEFAULT 1,  -- bumped on every save; stale saves are refused
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
