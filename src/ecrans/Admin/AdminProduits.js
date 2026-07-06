import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/client';
import { useToast } from '../../contexts/ToastContext';

const FORM_VIDE = { nom: '', description: '', prix: '', imageUrl: '' };

const AdminProduits = () => {
  const { showToast } = useToast();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOuvert, setFormOuvert] = useState(false);
  const [editionId, setEditionId] = useState(null);
  const [form, setForm] = useState(FORM_VIDE);

  const charger = () => {
    setLoading(true);
    apiFetch('/admin/produits')
      .then(setProduits)
      .catch(() => showToast('Erreur lors du chargement des produits', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ouvrirCreation = () => {
    setEditionId(null);
    setForm(FORM_VIDE);
    setFormOuvert(true);
  };

  const ouvrirEdition = (produit) => {
    setEditionId(produit.id);
    setForm({
      nom: produit.nom,
      description: produit.description,
      prix: produit.prix,
      imageUrl: produit.image_url
    });
    setFormOuvert(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editionId) {
        await apiFetch(`/admin/produits/${editionId}`, { method: 'PUT', body: form });
        showToast('Produit modifié');
      } else {
        await apiFetch('/admin/produits', { method: 'POST', body: form });
        showToast('Produit créé');
      }
      setFormOuvert(false);
      charger();
    } catch (err) {
      showToast("Erreur lors de l'enregistrement", 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      await apiFetch(`/admin/produits/${id}`, { method: 'DELETE' });
      showToast('Produit supprimé');
      charger();
    } catch (err) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Produits</h1>
        <button
          onClick={ouvrirCreation}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition"
        >
          + Ajouter un produit
        </button>
      </div>

      {formOuvert && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6 space-y-4 animate-scale-in"
        >
          <div className="grid grid-cols-2 gap-4">
            <input
              required
              placeholder="Nom"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40"
            />
            <input
              required
              type="number"
              step="0.01"
              placeholder="Prix (CDF)"
              value={form.prix}
              onChange={(e) => setForm({ ...form, prix: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40"
            />
          </div>
          <input
            placeholder="URL de l'image"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40"
          />
          <textarea
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40"
          />
          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition">
              {editionId ? 'Enregistrer' : 'Créer'}
            </button>
            <button
              type="button"
              onClick={() => setFormOuvert(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/10 text-white/70 text-sm">
            <tr>
              <th className="p-4">Image</th>
              <th className="p-4">Nom</th>
              <th className="p-4">Prix</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-white/50">
                  Chargement...
                </td>
              </tr>
            ) : (
              produits.map((produit) => (
                <tr key={produit.id} className="border-t border-white/10 hover:bg-white/5 transition">
                  <td className="p-4">
                    <img src={produit.image_url} alt={produit.nom} className="w-12 h-12 object-cover rounded-lg" />
                  </td>
                  <td className="p-4 text-white">{produit.nom}</td>
                  <td className="p-4 text-purple-300">{Number(produit.prix).toLocaleString('fr-FR')} CDF</td>
                  <td className="p-4 space-x-3">
                    <button onClick={() => ouvrirEdition(produit)} className="text-purple-300 hover:text-purple-200 transition">
                      Éditer
                    </button>
                    <button onClick={() => handleDelete(produit.id)} className="text-red-300 hover:text-red-200 transition">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProduits;
