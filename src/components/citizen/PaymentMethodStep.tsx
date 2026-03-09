import { motion } from "framer-motion";
import { CreditCard, Building2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaymentMethod = "tarjeta" | "spei" | "wallet";

interface PaymentMethodStepProps {
  method: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  onNext: () => void;
  onBack: () => void;
}

const PaymentMethodStep = ({ method, onSelect, onNext, onBack }: PaymentMethodStepProps) => {
  const methods = [
    {
      id: "tarjeta" as const,
      icon: CreditCard,
      title: "Tarjeta de crédito o débito",
      description: "Visa, Mastercard, American Express",
    },
    {
      id: "spei" as const,
      icon: Building2,
      title: "Transferencia SPEI",
      description: "Desde tu banca en línea",
    },
    {
      id: "wallet" as const,
      icon: Smartphone,
      title: "Pago Digital",
      description: "Apple Pay o Google Pay",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5 px-4 w-full max-w-md mx-auto"
    >
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">¿Cómo deseas pagar?</h2>
        <p className="text-sm text-muted-foreground mt-1">Elige tu método de pago preferido</p>
      </div>

      <div className="space-y-3">
        {methods.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelect(m.id)}
            className={cn(
              "w-full text-left bg-card rounded-xl border-2 p-5 flex items-center gap-4 transition-all duration-200",
              method === m.id
                ? "border-primary shadow-elevated"
                : "border-border hover:border-primary-lighter"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                method === m.id ? "gradient-primary" : "bg-accent"
              )}
            >
              <m.icon className={cn("w-6 h-6", method === m.id ? "text-primary-foreground" : "text-primary")} />
            </div>
            <div>
              <p className="font-semibold text-foreground">{m.title}</p>
              <p className="text-sm text-muted-foreground">{m.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-3 mt-2">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12 rounded-xl">
          Regresar
        </Button>
        <Button
          onClick={onNext}
          disabled={!method}
          className="flex-1 h-12 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-elevated hover:shadow-glow transition-all disabled:opacity-50"
        >
          Continuar
        </Button>
      </div>
    </motion.div>
  );
};

export default PaymentMethodStep;
