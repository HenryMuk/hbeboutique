const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../src/config/env');

const files = [
  '001_create_produits.sql',
  '002_create_commandes.sql',
  '003_seed_produits.sql',
  '004_alter_utilisateurs_role.sql',
  '005_recreate_commandes.sql',
  '006_create_panier_produit_likes_signalements.sql',
  '007_seed_admin.sql',
  '008_add_stock_produits.sql',
  '009_widen_role_utilisateurs.sql',
  '010_add_statut_signalements.sql',
  '011_widen_statut_commandes.sql',
  '012_create_factures.sql',
  '013_create_livraisons.sql'
];

async function tableExists(connection, tableName) {
  const [rows] = await connection.query('SHOW TABLES LIKE ?', [tableName]);
  return rows.length > 0;
}

async function columnExists(connection, tableName, columnName) {
  const [rows] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE ?`, [columnName]);
  return rows.length > 0;
}

async function main() {
  const connection = await mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    multipleStatements: true
  });

  for (const file of files) {
    if (file === '003_seed_produits.sql') {
      const [rows] = await connection.query('SELECT COUNT(*) AS total FROM produits');
      if (rows[0].total > 0) {
        console.log('Produits déjà présents, seed ignoré.');
        continue;
      }
    }

    if (file === '004_alter_utilisateurs_role.sql' && (await columnExists(connection, 'utilisateurs', 'role'))) {
      console.log('Colonne role déjà présente, migration ignorée.');
      continue;
    }

    if (file === '005_recreate_commandes.sql' && (await tableExists(connection, 'commande_lignes'))) {
      console.log('Table commande_lignes déjà présente, migration ignorée.');
      continue;
    }

    if (file === '007_seed_admin.sql') {
      const [rows] = await connection.query("SELECT COUNT(*) AS total FROM utilisateurs WHERE role = 'admin'");
      if (rows[0].total > 0) {
        console.log('Compte admin déjà présent, seed ignoré.');
        continue;
      }
    }

    if (file === '008_add_stock_produits.sql' && (await columnExists(connection, 'produits', 'stock'))) {
      console.log('Colonne stock déjà présente, migration ignorée.');
      continue;
    }

    if (file === '010_add_statut_signalements.sql' && (await columnExists(connection, 'signalements', 'statut'))) {
      console.log('Colonne statut déjà présente, migration ignorée.');
      continue;
    }

    const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
    console.log(`Exécution de ${file}...`);
    await connection.query(sql);
  }

  console.log('Migrations terminées.');
  await connection.end();
}

main().catch((err) => {
  console.error('Erreur pendant les migrations:', err.message);
  process.exit(1);
});
