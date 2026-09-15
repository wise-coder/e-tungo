"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Language, Listing, User, WantedRequest } from "@/lib/types";
import { translations } from "@/lib/translations";

interface AppContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: typeof translations.en;
  hydrated: boolean;
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => Promise<boolean>;
  updateProfile: (u: User) => Promise<boolean>;
  listings: Listing[];
  setListings: React.Dispatch<React.SetStateAction<Listing[]>>;
  addListing: (l: Listing) => Promise<Listing | null>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<boolean>;
  deleteListing: (id: string) => Promise<boolean>;
  wantedRequests: WantedRequest[];
  addWantedRequest: (r: WantedRequest) => Promise<WantedRequest | null>;
  deleteWantedRequest: (id: string) => void;
  updateWantedRequest: (id: string, updates: Partial<WantedRequest>) => void;
}

interface AppProviderProps {
  children: ReactNode;
  initialListings?: Listing[];
  initialWantedRequests?: WantedRequest[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({
  children,
  initialListings = [],
  initialWantedRequests = [],
}: AppProviderProps) {
  const [lang, setLang] = useState<Language>("rw");
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [wantedRequests, setWantedRequests] = useState<WantedRequest[]>(initialWantedRequests);

  const t = translations[lang];

  useEffect(() => {
    let active = true;
    try { window.localStorage.removeItem("e_tungo_user"); } catch {}
    async function refresh() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (active) setUser(data.user);
      } catch { if (active) setUser(null); }
      finally { if (active) setHydrated(true); }
    }
    void refresh();
    window.addEventListener("focus", refresh);
    return () => { active = false; window.removeEventListener("focus", refresh); };
  }, []);

  async function persist<T>(path: string, method: string, body?: unknown): Promise<T | null> {
    setSaveError("");
    try {
      const response = await fetch(path, {
        method, headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined, credentials: "same-origin",
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) setUser(null);
        throw new Error(data.error || "Unable to save changes.");
      }
      return data as T;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save changes.");
      return null;
    }
  }
  const logout = async () => {
    const result = await persist("/api/auth/logout", "POST");
    if (!result) return false;
    setUser(null);
    return true;
  };
  const updateProfile = async (profile: User) => {
    const result = await persist<User>("/api/users", "PUT", profile);
    if (!result) return false;
    setUser(result);
    return true;
  };
  const addListing = async (listing: Listing) => {
    const result = await persist<Listing>("/api/listings", "POST", listing);
    if (result) setListings(prev => [result, ...prev]);
    return result;
  };
  const updateListing = async (id: string, updates: Partial<Listing>) => {
    const result = await persist<Listing>(`/api/listings/${encodeURIComponent(id)}`, "PATCH", updates);
    if (result) setListings(prev => prev.map(item => item.id === id ? result : item));
    return Boolean(result);
  };
  const deleteListing = async (id: string) => {
    const result = await persist(`/api/listings/${encodeURIComponent(id)}`, "DELETE");
    if (result) setListings(prev => prev.filter(item => item.id !== id));
    return Boolean(result);
  };
  const addWantedRequest = async (request: WantedRequest) => {
    const result = await persist<WantedRequest>("/api/wanted", "POST", request);
    if (result) setWantedRequests(prev => [result, ...prev]);
    return result;
  };
  const updateWantedRequest = async (id: string, updates: Partial<WantedRequest>) => {
    const result = await persist<WantedRequest>(`/api/wanted/${encodeURIComponent(id)}`, "PATCH", updates);
    if (result) setWantedRequests(prev => prev.map(item => item.id === id ? result : item));
  };
  const deleteWantedRequest = async (id: string) => {
    if (await persist(`/api/wanted/${encodeURIComponent(id)}`, "DELETE")) setWantedRequests(prev => prev.filter(item => item.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        t,
        hydrated,
        user,
        setUser,
        logout,
        updateProfile,
        listings,
        setListings,
        addListing,
        updateListing,
        deleteListing,
        wantedRequests,
        addWantedRequest,
        deleteWantedRequest,
        updateWantedRequest,
      }}
    >
      {saveError && <div role="alert" className="fixed bottom-20 left-4 right-4 z-50 rounded-xl bg-red-700 p-4 text-white">{saveError}<button className="ml-4 underline" onClick={() => setSaveError("")}>Dismiss</button></div>}
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
