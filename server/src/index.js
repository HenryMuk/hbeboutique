const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const utilisateurRoutes = require('./routes/utilisateur.routes');
const produitsRoutes = require('./routes/produits.routes');
const commandesRoutes = require('./routes/commandes.routes');
const panierRoutes = require('./routes/panier.routes');
const adminRoutes = require('./routes/admin.routes');
const errorHandler = require('./middleware/errorHandler.middleware');

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
// Seules les images produit sont servies publiquement ; les factures ne sont
// accessibles qu'via la route authentifiée /api/commandes/:id/facture.
app.use('/uploads/produits', express.static(path.join(__dirname, '../uploads/produits')));

app.use('/api/utilisateur', utilisateurRoutes);
app.use('/api/produits', produitsRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/panier', panierRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Serveur HBE Boutique démarré sur le port ${config.port}`);
});
