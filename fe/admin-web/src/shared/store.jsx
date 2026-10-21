import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  initialAudit,
  initialCampaigns,
  initialContent,
  initialProducts,
  initialUsers,
} from './mock.js';

const StoreContext = createContext(null);

const ADMIN = 'Admin LOOKSY';

function nowLabel() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function readAuth() {
  try {
    return sessionStorage.getItem('looks_admin_auth') === '1';
  } catch {
    return false;
  }
}

export function StoreProvider({ children }) {
  const [authed, setAuthed] = useState(readAuth);
  const [users, setUsers] = useState(initialUsers);
  const [audit, setAudit] = useState(initialAudit);
  const [content, setContent] = useState(initialContent);
  const [products, setProducts] = useState(initialProducts);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2600);
  }, []);

  const log = useCallback((action, user) => {
    setAudit((prev) => [
      { time: nowLabel(), admin: ADMIN, action, user, result: 'Thành công' },
      ...prev,
    ]);
  }, []);

  const value = useMemo(
    () => ({
      authed,
      login: () => {
        try {
          sessionStorage.setItem('looks_admin_auth', '1');
        } catch {
          /* bỏ qua nếu trình duyệt chặn storage */
        }
        setAuthed(true);
      },
      logout: () => {
        try {
          sessionStorage.removeItem('looks_admin_auth');
        } catch {
          /* bỏ qua */
        }
        setAuthed(false);
      },
      users,
      setUserStatus: (id, status, action) => {
        const u = users.find((x) => x.id === id);
        setUsers((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
        if (u) log(action, u.name);
      },
      audit,
      log,
      content,
      resolveContent: (id, action) => {
        const item = content.find((c) => c.id === id);
        setContent((prev) => prev.filter((c) => c.id !== id));
        if (item) log(action, item.author);
        showToast(`${action}: ${item ? item.summary : ''}`);
      },
      products,
      addProduct: (p) =>
        setProducts((prev) => [{ ...p, id: Date.now(), status: 'Chờ duyệt' }, ...prev]),
      setProductStatus: (id, status) =>
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p))),
      campaigns,
      addCampaign: (c) =>
        setCampaigns((prev) => [
          { ...c, id: Date.now(), creator: ADMIN },
          ...prev,
        ]),
      toast,
      showToast,
    }),
    [authed, users, audit, content, products, campaigns, toast, log, showToast],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
