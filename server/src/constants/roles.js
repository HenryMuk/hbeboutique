const ROLES = {
  CLIENT: 'client',
  CAISSIER: 'caissier',
  GESTIONNAIRE_BOUTIQUE: 'gestionnaire_boutique',
  ENTREPOT: 'entrepot',
  LIVRAISON: 'livraison',
  SAV: 'sav',
  ADMIN: 'admin'
};

const ROLES_LIST = Object.values(ROLES);

module.exports = { ROLES, ROLES_LIST };
