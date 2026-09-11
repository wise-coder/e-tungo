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
  listings: Listing[];
  setListings: (l: Listing[]) => void;
  addListing: (l: Listing) => void;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  wantedRequests: WantedRequest[];
  addWantedRequest: (r: WantedRequest) => void;
  deleteWantedRequest: (id: string) => void;
  updateWantedRequest: (id: string, updates: Partial<WantedRequest>) => void;
}

interface AppProviderProps {
  children: ReactNode;
  initialListings?: Listing[];
  initialWantedRequests?: WantedRequest[];
}

const AppContext = createContext<AppContextType | null>(null);

async function persist(path: string, method: string, body?: unknown) {
  try {
    await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
    });
  } catch (error) {
    console.error(`Failed to persist ${path}`, error);
  }
}

export function AppProvider({
  children,
  initialListings = [],
  initialWantedRequests = [],
}: AppProviderProps) {
  const [lang, setLang] = useState<Language>("rw");
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [wantedRequests, setWantedRequests] = useState<WantedRequest[]>(initialWantedRequests);

  const t = translations[lang];

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("e_tungo_user");
      if (stored) {
        setUser(JSON.parse(stored) as User);
      }
    } catch (error) {
      console.error("Failed to load user profile", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (user) {
      try {
        window.localStorage.setItem("e_tungo_user", JSON.stringify(user));
      } catch (error) {
        console.error("Failed to save user profile", error);
      }
      void persist("/api/users", "PUT", user);
    } else {
      try {
        window.localStorage.removeItem("e_tungo_user");
      } catch (error) {
        console.error("Failed to clear user profile", error);
      }
    }
  }, [hydrated, user]);

  const addListing = (listing: Listing) => {
    setListings((prev) => [listing, ...prev]);
    void persist("/api/listings", "POST", listing);
  };

  const updateListing = (id: string, updates: Partial<Listing>) => {
    setListings((prev) => prev.map((listing) => (listing.id === id ? { ...listing, ...updates } : listing)));
    void persist(`/api/listings/${id}`, "PATCH", updates);
  };

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((listing) => listing.id !== id));
    void persist(`/api/listings/${id}`, "DELETE");
  };

  const addWantedRequest = (request: WantedRequest) => {
    setWantedRequests((prev) => [request, ...prev]);
    void persist("/api/wanted", "POST", request);
  };

  const deleteWantedRequest = (id: string) => {
    setWantedRequests((prev) => prev.filter((request) => request.id !== id));
    void persist(`/api/wanted/${id}`, "DELETE");
  };

  const updateWantedRequest = (id: string, updates: Partial<WantedRequest>) => {
    setWantedRequests((prev) =>
      prev.map((request) => (request.id === id ? { ...request, ...updates } : request))
    );
    void persist(`/api/wanted/${id}`, "PATCH", updates);
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
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
