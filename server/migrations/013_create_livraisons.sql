CREATE TABLE IF NOT EXISTS `livraisons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `commande_id` int(11) NOT NULL,
  `livreur_id` int(11) NOT NULL,
  `statut` varchar(20) NOT NULL DEFAULT 'assignee',
  `date_assignation` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_livraison` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `commande_id` (`commande_id`),
  KEY `livreur_id` (`livreur_id`),
  CONSTRAINT `livraisons_commande_fk` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`),
  CONSTRAINT `livraisons_livreur_fk` FOREIGN KEY (`livreur_id`) REFERENCES `utilisateurs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
