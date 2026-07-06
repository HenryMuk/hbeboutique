import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/client';
import { useToast } from '../../contexts/ToastContext';

const AdminUtilisateurs = () => {
  const { showToast } = useToast();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);

  const charger = () => {
    setLoading(true);
    apiFetch('/admin/utilisateurs')
      .then(setUtilisateurs)
      .catch(() => showToast('Erreur lors du chargement des utilisateurs', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleBan = async (utilisateur) => {
    const nouvelEtat = utilisateur.etat === 'Banni' ? 'Actif' : 'Banni';
    try {
      await apiFetch(`/admin/utilisateurs/${utilisateur.id}`, { method: 'PATCH', body: { etat: nouvelEtat } });
      showToast(nouvelEtat === 'Banni' ? 'Utilisateur banni' : 'Utilisateur réactivé');
      charger();
    } catch (err) {
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const toggleRole = async (utilisateur) => {
    const nouveauRole = utilisateur.role === 'admin' ? 'client' : 'admin';
    try {
      await apiFetch(`/admin/utilisateurs/${utilisateur.id}`, { method: 'PATCH', body: { role: nouveauRole } });
      showToast(`Rôle changé en ${nouveauRole}`);
      charger();
    } catch (err) {
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-bold text-white mb-6">Utilisateurs</h1>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/10 text-white/70 text-sm">
            <tr>
              <th className="p-4">Utilisateur</th>
              <th className="p-4">Email</th>
              <th className="p-4">État</th>
              <th className="p-4">Rôle</th>
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
              utilisateurs.map((utilisateur) => (
                <tr key={utilisateur.id} className="border-t border-white/10 hover:bg-white/5 transition">
                  <td className="p-4 text-white">{utilisateur.username}</td>
                  <td className="p-4 text-white/70">{utilisateur.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs ${
                        utilisateur.etat === 'Banni' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                      }`}
                    >
                      {utilisateur.etat}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs ${
                        utilisateur.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {utilisateur.role}
                    </span>
                  </td>
                  <td className="p-4 space-x-3">
                    <button onClick={() => toggleBan(utilisateur)} className="text-orange-300 hover:text-orange-200 transition">
                      {utilisateur.etat === 'Banni' ? 'Réactiver' : 'Bannir'}
                    </button>
                    <button onClick={() => toggleRole(utilisateur)} className="text-purple-300 hover:text-purple-200 transition">
                      {utilisateur.role === 'admin' ? 'Retirer admin' : 'Rendre admin'}
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

export default AdminUtilisateurs;
