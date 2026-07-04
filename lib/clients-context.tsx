"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { clients as clientsInitiaux, type Client } from "@/lib/mock-data";

type ClientsContextValue = {
  clients: Client[];
  ajouterClients: (nouveaux: Client[]) => void;
};

const ClientsContext = createContext<ClientsContextValue | null>(null);

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(clientsInitiaux);

  function ajouterClients(nouveaux: Client[]) {
    setClients((prev) => [...nouveaux, ...prev]);
  }

  return (
    <ClientsContext.Provider value={{ clients, ajouterClients }}>
      {children}
    </ClientsContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error("useClients doit être utilisé dans un ClientsProvider");
  }
  return context;
}
