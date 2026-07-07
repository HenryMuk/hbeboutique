CREATE TABLE IF NOT EXISTS `tickets_sav` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `commande_id` int(11) NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  `motif` varchar(1000) NOT NULL,
  `statut` varchar(20) NOT NULL DEFAULT 'ouvert',
  `resolution` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `commande_id` (`commande_id`),
  KEY `utilisateur_id` (`utilisateur_id`),
  CONSTRAINT `tickets_sav_commande_fk` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`),
  CONSTRAINT `tickets_sav_utilisateur_fk` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
