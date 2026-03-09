import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Adeudo {
  id: string;
  periodo: string;
  fechaLimite: string;
  monto: number;
  estatus: "vencido" | "proximo" | "pagado";
}

export interface SavedCard {
  id: string;
  label: string;
  brand: "visa" | "mastercard" | "amex" | "unknown";
  last4: string;
}

export interface SavedWallet {
  id: string;
  type: "apple" | "google";
  email: string;
}

export interface Ciudadano {
  numeroCuenta: string;
  nombre: string;
  direccion: string;
  telefono: string;
  adeudos: Adeudo[];
  reminderSent: boolean;
}

const initialCiudadanos: Ciudadano[] = [
  {
    numeroCuenta: "SON-2024-00847",
    nombre: "María Guadalupe Torres Hernández",
    direccion: "Calle Reforma #142, Col. Centro, Hermosillo, Sonora",
    telefono: "662-123-4567",
    reminderSent: false,
    adeudos: [
      { id: "ad-001", periodo: "Nov – Dic 2024", fechaLimite: "15 Ene 2025", monto: 284.0, estatus: "vencido" },
      { id: "ad-002", periodo: "Ene – Feb 2025", fechaLimite: "15 Mar 2025", monto: 312.0, estatus: "vencido" },
      { id: "ad-003", periodo: "Mar – Abr 2025", fechaLimite: "15 May 2025", monto: 298.0, estatus: "proximo" },
    ],
  },
];

interface AppContextType {
  ciudadanos: Ciudadano[];
  ciudadanoActual: Ciudadano;
  savedCards: SavedCard[];
  savedWallets: SavedWallet[];
  payAdeudo: (numeroCuenta: string, adeudoId: string) => void;
  sendReminder: (numeroCuenta: string) => void;
  saveCard: (card: SavedCard) => void;
  saveWallet: (wallet: SavedWallet) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [ciudadanos, setCiudadanos] = useState<Ciudadano[]>(initialCiudadanos);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([]);

  const ciudadanoActual = ciudadanos[0];

  const payAdeudo = (numeroCuenta: string, adeudoId: string) => {
    setCiudadanos((prev) =>
      prev.map((c) =>
        c.numeroCuenta === numeroCuenta
          ? {
              ...c,
              adeudos: c.adeudos.map((a) =>
                a.id === adeudoId ? { ...a, estatus: "pagado" as const } : a
              ),
            }
          : c
      )
    );
  };

  const sendReminder = (numeroCuenta: string) => {
    setCiudadanos((prev) =>
      prev.map((c) =>
        c.numeroCuenta === numeroCuenta ? { ...c, reminderSent: true } : c
      )
    );
  };

  const saveCard = (card: SavedCard) => {
    setSavedCards((prev) => {
      const exists = prev.find((c) => c.id === card.id);
      return exists ? prev : [...prev, card];
    });
  };

  const saveWallet = (wallet: SavedWallet) => {
    setSavedWallets((prev) => {
      const exists = prev.find((w) => w.id === wallet.id);
      return exists ? prev : [...prev, wallet];
    });
  };

  return (
    <AppContext.Provider
      value={{
        ciudadanos,
        ciudadanoActual,
        savedCards,
        savedWallets,
        payAdeudo,
        sendReminder,
        saveCard,
        saveWallet,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
