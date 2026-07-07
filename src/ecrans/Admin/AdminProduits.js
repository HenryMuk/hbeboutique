import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { useToast } from '../../contexts/ToastContext';
import { resolveImageUrl } from '../../utils/media';

const FORM_VIDE = { nom: '', description: '', prix: '', stock: '' };

const AdminProduits = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOuvert, setFormOuvert] = useState(false);
  const [editionId, setEditionId] = useState(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

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
    setImageFile(null);
    setImagePreview('');
    setFormOuvert(true);
  };

  const ouvrirEdition = (produit) => {
    setEditionId(produit.id);
    setForm({
      nom: produit.nom,
      description: produit.description,
      prix: produit.prix,
      stock: produit.stock
    });
    setImageFile(null);
    setImagePreview(resolveImageUrl(produit.image_url));
    setFormOuvert(true);
  };

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && produits.length > 0) {
      const produit = produits.find((p) => String(p.id) === editId);
      if (produit) {
        ouvrirEdition(produit);
      }
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produits]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file || null);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editionId && !imageFile) {
      showToast("Veuillez sélectionner une image pour le produit", 'error');
      return;
    }

    const data = new FormData();
    data.append('nom', form.nom);
    data.append('description', form.description);
    data.append('prix', form.prix);
    data.append('stock', form.stock);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (editionId) {
        await apiFetch(`/admin/produits/${editionId}`, { method: 'PUT', body: data });
        showToast('Produit modifié');
      } else {
        await apiFetch('/admin/produits', { method: 'POST', body: data });
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
            required
            type="number"
            min="0"
            step="1"
            placeholder="Quantité en stock"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40"
          />
          <div className="flex items-center gap-4">
            {imagePreview && (
              <img src={imagePreview} alt="Aperçu" className="w-16 h-16 object-cover rounded-lg border border-white/20" />
            )}
            <div className="flex-1">
              <label className="block text-white/70 text-sm mb-1">Image du produit (depuis votre galerie)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-white/80 text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-purple-500/30 file:text-white file:cursor-pointer"
              />
            </div>
          </div>
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
              <th className="p-4">Stock</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-white/50">
                  Chargement...
                </td>
              </tr>
            ) : (
              produits.map((produit) => (
                <tr key={produit.id} className="border-t border-white/10 hover:bg-white/5 transition">
                  <td className="p-4">
                    <img
                      src={resolveImageUrl(produit.image_url)}
                      alt={produit.nom}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  </td>
                  <td className="p-4 text-white">{produit.nom}</td>
                  <td className="p-4 text-purple-300">{Number(produit.prix).toLocaleString('fr-FR')} CDF</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs ${
                        produit.stock > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {produit.stock > 0 ? `${produit.stock} en stock` : 'Rupture'}
                    </span>
                  </td>
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
