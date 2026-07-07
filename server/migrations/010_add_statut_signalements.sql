ALTER TABLE `signalements` ADD COLUMN `statut` VARCHAR(20) NOT NULL DEFAULT 'nouveau' AFTER `motif`;
