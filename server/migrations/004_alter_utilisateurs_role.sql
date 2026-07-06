ALTER TABLE `utilisateurs` ADD COLUMN `role` VARCHAR(20) NOT NULL DEFAULT 'client' AFTER `etat`;
