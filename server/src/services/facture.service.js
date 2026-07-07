const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const facturesRepo = require('../repositories/factures.repo');

const facturesDir = path.join(__dirname, '../../uploads/factures');
fs.mkdirSync(facturesDir, { recursive: true });

function generateNumero() {
  return `FAC-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
}

async function ecrirePdf(filePath, numero, commande, lignes) {
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text('HBE Boutique', { align: 'left' });
    doc.fontSize(10).fillColor('#555').text('Facture', { align: 'left' });
    doc.moveDown();

    doc.fillColor('#000').fontSize(12).text(`Facture n° ${numero}`);
    doc.text(`Commande n° ${commande.reference}`);
    doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`);
    doc.moveDown();

    doc.fontSize(11).text('Détail de la commande', { underline: true });
    doc.moveDown(0.5);
    lignes.forEach((ligne) => {
      const sousTotal = Number(ligne.prix_unitaire) * ligne.quantite;
      doc.fontSize(10).text(`${ligne.nom}  x${ligne.quantite}  —  ${sousTotal.toLocaleString('fr-FR')} CDF`);
    });

    doc.moveDown();
    doc.fontSize(13).text(`Total : ${Number(commande.montant_total).toLocaleString('fr-FR')} CDF`, {
      align: 'right'
    });

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

async function genererFacture(commande, lignes) {
  const numero = generateNumero();
  const fileName = `${numero}.pdf`;
  const filePath = path.join(facturesDir, fileName);

  await ecrirePdf(filePath, numero, commande, lignes);

  const cheminFichier = `/uploads/factures/${fileName}`;
  const id = await facturesRepo.create({
    commandeId: commande.id,
    numero,
    montantTotal: commande.montant_total,
    cheminFichier
  });

  return { id, numero, cheminFichier };
}

module.exports = { genererFacture };
