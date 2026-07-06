INSERT INTO `utilisateurs` (`email`, `username`, `mdp`, `etat`, `role`, `email_verifie`, `date`)
VALUES (
  'admin@hbeboutique.cd',
  'admin',
  '$2a$10$uPZ9VbwzyYNYvbcBMzQXYuojHYikK5Oh.PkcpDheFEIPISnx1gB0e',
  'Actif',
  'admin',
  1,
  NOW()
);
