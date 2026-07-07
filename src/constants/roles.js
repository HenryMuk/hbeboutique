export const ROLES = {
  CLIENT: 'client',
  CAISSIER: 'caissier',
  GESTIONNAIRE_BOUTIQUE: 'gestionnaire_boutique',
  ENTREPOT: 'entrepot',
  LIVRAISON: 'livraison',
  SAV: 'sav',
  ADMIN: 'admin'
};

export const ROLE_LABELS = {
  [ROLES.CLIENT]: 'Client',
  [ROLES.CAISSIER]: 'Caissier',
  [ROLES.GESTIONNAIRE_BOUTIQUE]: 'Gestionnaire de boutique',
  [ROLES.ENTREPOT]: 'Entrepôt',
  [ROLES.LIVRAISON]: 'Livraison',
  [ROLES.SAV]: 'SAV',
  [ROLES.ADMIN]: 'Administrateur'
};

export const ROLES_LIST = Object.values(ROLES);

export const STAFF_ROLES = ROLES_LIST.filter((role) => role !== ROLES.CLIENT);
