import { motion } from "framer-motion";
import { useState } from "react";
import { CreditCard, Copy, Check, Plus, Smartphone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Adeudo, SavedCard, SavedWallet, useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

interface PaymentDetailStepProps {
  method: "tarjeta" | "spei" | "wallet";
  selectedAdeudos: Adeudo[];
  total: number;
  onConfirm: (label?: string) => void;
  onBack: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatCardNumber = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();

const formatExpiry = (v: string) => {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const detectCardBrand = (v: string): "visa" | "mastercard" | "amex" | "unknown" => {
  const n = v.replace(/\D/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  return "unknown";
};

const brandLabel: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  unknown: "",
};

const brandColors: Record<string, string> = {
  visa: "text-blue-600 bg-blue-50 border-blue-200",
  mastercard: "text-orange-600 bg-orange-50 border-orange-200",
  amex: "text-green-600 bg-green-50 border-green-200",
  unknown: "hidden",
};

// ── Sub-componentes ───────────────────────────────────────────────────────────

interface CardFormProps {
  onSave: (card: SavedCard, label: string) => void;
  onCancel?: () => void;
  showCancel: boolean;
}

const CardForm = ({ onSave, onCancel, showCancel }: CardFormProps) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const digits = cardNumber.replace(/\D/g, "");
  const brand = detectCardBrand(digits);
  const isValid = digits.length >= 13 && cardExpiry.length >= 4 && cardCvv.length >= 3 && cardName.length > 2;

  const handleSave = () => {
    if (!isValid) return;
    const last4 = digits.slice(-4);
    const label = `${brandLabel[brand] || "Tarjeta"} •••• ${last4}`;
    const card: SavedCard = {
      id: `card-${digits.slice(0, 6)}-${last4}`,
      label,
      brand,
      last4,
    };
    onSave(card, label);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm text-muted-foreground">Nombre del titular</Label>
        <Input
          placeholder="Como aparece en la tarjeta"
          value={cardName}
          onChange={(e) => setCardName(e.target.value.toUpperCase())}
          className="h-12 rounded-xl"
        />
      </div>
      <div>
        <Label className="text-sm text-muted-foreground">Número de tarjeta</Label>
        <div className="relative">
          <Input
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            className="h-12 rounded-xl pr-20"
            maxLength={19}
          />
          {brand !== "unknown" && (
            <span
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-full border",
                brandColors[brand]
              )}
            >
              {brandLabel[brand]}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <Label className="text-sm text-muted-foreground">Vencimiento</Label>
          <Input
            placeholder="MM/AA"
            value={cardExpiry}
            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
            className="h-12 rounded-xl"
            maxLength={5}
          />
        </div>
        <div className="flex-1">
          <Label className="text-sm text-muted-foreground">CVV</Label>
          <Input
            type="password"
            placeholder="•••"
            value={cardCvv}
            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="h-12 rounded-xl"
            maxLength={4}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        {showCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1 h-11 rounded-xl text-sm">
            Cancelar
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={!isValid}
          className={cn(
            "h-11 rounded-xl gradient-primary text-primary-foreground font-semibold disabled:opacity-50",
            showCancel ? "flex-1" : "w-full"
          )}
        >
          Tokenizar y usar tarjeta
        </Button>
      </div>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────

const PaymentDetailStep = ({
  method,
  selectedAdeudos,
  total,
  onConfirm,
  onBack,
}: PaymentDetailStepProps) => {
  const { savedCards, savedWallets, saveCard, saveWallet } = useApp();
  const [copied, setCopied] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    savedCards.length > 0 ? savedCards[0].id : null
  );
  const [showNewCardForm, setShowNewCardForm] = useState(savedCards.length === 0);

  // wallet state
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(
    savedWallets.length > 0 ? savedWallets[0].id : null
  );
  const [showNewWalletForm, setShowNewWalletForm] = useState(savedWallets.length === 0);
  const [walletType, setWalletType] = useState<"apple" | "google">("apple");
  const [walletEmail, setWalletEmail] = useState("");

  const clabeRef = "014180655032875695";
  const referencia = `${selectedAdeudos[0]?.id ?? "SON"}-MAR25`.toUpperCase();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Tarjeta ──
  const handleCardSaved = (card: SavedCard, label: string) => {
    saveCard(card);
    setSelectedCardId(card.id);
    setShowNewCardForm(false);
    onConfirm(label);
  };

  const handleUseExistingCard = () => {
    if (!selectedCardId) return;
    const card = savedCards.find((c) => c.id === selectedCardId);
    onConfirm(card?.label);
  };

  // ── Wallet ──
  const handleWalletConfirm = () => {
    if (!showNewWalletForm && selectedWalletId) {
      const w = savedWallets.find((w) => w.id === selectedWalletId);
      onConfirm(w ? `${w.type === "apple" ? "Apple Pay" : "Google Pay"} (${w.email})` : "Pago Digital");
      return;
    }
    if (!walletEmail) return;
    const wallet: SavedWallet = {
      id: `wallet-${walletType}-${walletEmail}`,
      type: walletType,
      email: walletEmail,
    };
    saveWallet(wallet);
    setSelectedWalletId(wallet.id);
    setShowNewWalletForm(false);
    onConfirm(`${walletType === "apple" ? "Apple Pay" : "Google Pay"} (${walletEmail})`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5 px-4 w-full max-w-md mx-auto"
    >
      {/* Resumen */}
      <div className="bg-accent rounded-xl p-4">
        <h3 className="font-semibold text-accent-foreground mb-2">Resumen de tu pago</h3>
        {selectedAdeudos.map((a) => (
          <div key={a.id} className="flex justify-between text-sm py-1">
            <span className="text-muted-foreground">{a.periodo}</span>
            <span className="font-medium text-foreground">${a.monto.toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t border-border mt-2 pt-2 flex justify-between">
          <span className="font-bold text-foreground">Total</span>
          <span className="font-bold text-xl text-primary">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* ── TARJETA ── */}
      {method === "tarjeta" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Datos de tu tarjeta
          </h2>

          {/* Tarjetas guardadas */}
          {savedCards.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tarjetas guardadas</p>
              {savedCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => {
                    setSelectedCardId(card.id);
                    setShowNewCardForm(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                    selectedCardId === card.id && !showNewCardForm
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary-lighter"
                  )}
                >
                  <CreditCard className="w-5 h-5 text-primary shrink-0" />
                  <span className="font-medium text-foreground">{card.label}</span>
                  {selectedCardId === card.id && !showNewCardForm && (
                    <Check className="w-4 h-4 text-primary ml-auto" />
                  )}
                </button>
              ))}

              {!showNewCardForm && (
                <button
                  onClick={() => { setShowNewCardForm(true); setSelectedCardId(null); }}
                  className="w-full flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Agregar nueva tarjeta
                </button>
              )}
            </div>
          )}

          {/* Formulario nueva tarjeta */}
          {showNewCardForm && (
            <CardForm
              onSave={handleCardSaved}
              onCancel={savedCards.length > 0 ? () => { setShowNewCardForm(false); setSelectedCardId(savedCards[0].id); } : undefined}
              showCancel={savedCards.length > 0}
            />
          )}
        </div>
      )}

      {/* ── SPEI ── */}
      {method === "spei" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Datos para transferencia SPEI</h2>
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">CLABE interbancaria</p>
              <div className="flex items-center gap-2">
                <p className="font-mono font-bold text-foreground text-lg tracking-wider">{clabeRef}</p>
                <button onClick={() => handleCopy(clabeRef)} className="text-primary hover:text-primary-light">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Referencia de pago</p>
              <div className="flex items-center gap-2">
                <p className="font-mono font-semibold text-foreground">{referencia}</p>
                <button onClick={() => handleCopy(referencia)} className="text-primary hover:text-primary-light">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Beneficiario</p>
              <p className="font-semibold text-foreground">SAPA Hermosillo — Gobierno Municipal</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monto exacto</p>
              <p className="font-bold text-primary text-lg">${total.toFixed(2)} MXN</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Realiza la transferencia desde tu banca en línea y haz clic en "Confirmar pago" cuando la hayas completado.
          </p>
        </div>
      )}

      {/* ── WALLET ── */}
      {method === "wallet" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Pago Digital
          </h2>

          {savedWallets.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Wallets vinculadas</p>
              {savedWallets.map((w) => (
                <button
                  key={w.id}
                  onClick={() => { setSelectedWalletId(w.id); setShowNewWalletForm(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                    selectedWalletId === w.id && !showNewWalletForm
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary-lighter"
                  )}
                >
                  <Smartphone className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      {w.type === "apple" ? "Apple Pay" : "Google Pay"}
                    </p>
                    <p className="text-xs text-muted-foreground">{w.email}</p>
                  </div>
                  {selectedWalletId === w.id && !showNewWalletForm && (
                    <Check className="w-4 h-4 text-primary ml-auto" />
                  )}
                </button>
              ))}

              {!showNewWalletForm && (
                <button
                  onClick={() => { setShowNewWalletForm(true); setSelectedWalletId(null); }}
                  className="w-full flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Vincular nueva wallet
                </button>
              )}
            </div>
          )}

          {showNewWalletForm && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {(["apple", "google"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setWalletType(t)}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-medium text-sm transition-all",
                      walletType === t ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary-lighter"
                    )}
                  >
                    <Smartphone className="w-4 h-4" />
                    {t === "apple" ? "Apple Pay" : "Google Pay"}
                  </button>
                ))}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Email de la cuenta</Label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={walletEmail}
                  onChange={(e) => setWalletEmail(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3 mt-2">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12 rounded-xl">
          Regresar
        </Button>

        {/* Tarjeta con tarjetas guardadas seleccionadas (no está en el form interno) */}
        {method === "tarjeta" && !showNewCardForm && (
          <Button
            onClick={handleUseExistingCard}
            disabled={!selectedCardId}
            className="flex-1 h-12 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-elevated hover:shadow-glow transition-all disabled:opacity-50"
          >
            Confirmar y pagar
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}

        {/* SPEI: confirmar directo */}
        {method === "spei" && (
          <Button
            onClick={() => onConfirm("SPEI")}
            className="flex-1 h-12 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-elevated hover:shadow-glow transition-all"
          >
            Confirmar pago
          </Button>
        )}

        {/* Wallet */}
        {method === "wallet" && (
          <Button
            onClick={handleWalletConfirm}
            disabled={showNewWalletForm && !walletEmail}
            className="flex-1 h-12 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-elevated hover:shadow-glow transition-all disabled:opacity-50"
          >
            {showNewWalletForm ? "Vincular y pagar" : "Confirmar y pagar"}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default PaymentDetailStep;
