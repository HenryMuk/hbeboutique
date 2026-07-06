import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

const PanierContext = createContext(null);

export const PanierProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      setItems([]);
      setTotal(0);
      return;
    }
    try {
      const panier = await apiFetch('/panier');
      setItems(panier.items);
      setTotal(panier.total);
    } catch (err) {
      setItems([]);
      setTotal(0);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (produitId, quantite = 1) => {
      const panier = await apiFetch('/panier', { method: 'POST', body: { produitId, quantite } });
      setItems(panier.items);
      setTotal(panier.total);
    },
    []
  );

  const updateQuantite = useCallback(async (produitId, quantite) => {
    const panier = await apiFetch(`/panier/${produitId}`, { method: 'PATCH', body: { quantite } });
    setItems(panier.items);
    setTotal(panier.total);
  }, []);

  const removeItem = useCallback(async (produitId) => {
    const panier = await apiFetch(`/panier/${produitId}`, { method: 'DELETE' });
    setItems(panier.items);
    setTotal(panier.total);
  }, []);

  const count = items.reduce((sum, item) => sum + item.quantite, 0);

  return (
    <PanierContext.Provider value={{ items, total, count, refresh, addItem, updateQuantite, removeItem }}>
      {children}
    </PanierContext.Provider>
  );
};

export function usePanier() {
  const context = useContext(PanierContext);
  if (!context) {
    throw new Error('usePanier doit être utilisé dans un PanierProvider');
  }
  return context;
}
