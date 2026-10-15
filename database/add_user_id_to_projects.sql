-- Links each project to the user who submitted it, so the profile page can
-- list "my projects". Run this ONCE against your database before using the
-- profile feature (MySQL Workbench, DBeaver, or the mysql CLI).
--
-- Projects submitted before this change keep user_id = NULL and will not
-- appear on any profile.

ALTER TABLE projects
  ADD COLUMN user_id INT NULL,
  ADD INDEX idx_projects_user_id (user_id);
