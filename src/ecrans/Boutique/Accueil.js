import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import SkeletonCard from '../../components/SkeletonCard';
import { apiFetch } from '../../api/client';
import { usePanier } from '../../contexts/PanierContext';
import { useToast } from '../../contexts/ToastContext';

const Accueil = () => {
  const { addItem } = usePanier();
  const { showToast } = useToast();

  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/produits', { auth: false })
      .then(setProduits)
      .catch(() => setProduits([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAjouterAuPanier = async (e, produitId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addItem(produitId, 1);
      showToast('Ajouté au panier');
    } catch (err) {
      showToast("Erreur lors de l'ajout au panier", 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600/20 to-pink-600/20 py-16">
        <div className="container mx-auto px-6 text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Bienvenue chez <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">HBE Boutique</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Découvrez notre sélection de produits premium au meilleur prix
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : produits.map((produit, index) => (
                <Link
                  key={produit.id}
                  to={`/produit/${produit.id}`}
                  className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="overflow-hidden h-48">
                    <img
                      src={produit.image_url}
                      alt={produit.nom}
                      className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-white font-semibold truncate">{produit.nom}</h3>
                    <p className="text-white/50 text-sm line-clamp-2">{produit.description}</p>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <p className="text-purple-300 font-bold">{Number(produit.prix).toLocaleString('fr-FR')} CDF</p>
                      <button
                        onClick={(e) => handleAjouterAuPanier(e, produit.id)}
                        className="px-3 py-1.5 text-sm bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 rounded-lg transition"
                      >
                        + Panier
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </div>
  );
};

export default Accueil;
