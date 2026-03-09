import { motion } from "framer-motion";
import { CheckCircle2, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Adeudo } from "@/context/AppContext";

interface ConfirmationStepProps {
  selectedAdeudos: Adeudo[];
  total: number;
  method: "tarjeta" | "spei" | "wallet";
  cardLabel: string | null;
  numeroCuenta: string;
  onReset: () => void;
}

const methodLabel = (method: "tarjeta" | "spei" | "wallet", cardLabel: string | null) => {
  if (method === "tarjeta") return cardLabel ?? "Tarjeta";
  if (method === "spei") return "SPEI";
  return cardLabel ?? "Pago Digital";
};

const ConfirmationStep = ({
  selectedAdeudos,
  total,
  method,
  cardLabel,
  numeroCuenta,
  onReset,
}: ConfirmationStepProps) => {
  const folio = `PAG-2025-${String(Math.floor(Math.random() * 9000) + 1000).padStart(5, "0")}`;
  const now = new Date();
  const fecha = now.toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
  const hora = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-6 px-4 w-full max-w-md mx-auto"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center"
      >
        <CheckCircle2 className="w-12 h-12 text-success" />
      </motion.div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">¡Pago exitoso!</h2>
        <p className="text-muted-foreground mt-1">Tu pago ha sido registrado correctamente</p>
      </div>

      <div className="w-full bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Folio de pago</span>
          <span className="font-bold font-mono text-foreground">{folio}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Cuenta</span>
          <span className="font-medium text-foreground">{numeroCuenta}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Método</span>
          <span className="font-medium text-foreground">{methodLabel(method, cardLabel)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Fecha y hora</span>
          <span className="font-medium text-foreground">{fecha}, {hora}</span>
        </div>
        <div className="border-t border-border pt-2">
          <p className="text-xs text-muted-foreground mb-2">Períodos cubiertos</p>
          {selectedAdeudos.map((a) => (
            <div key={a.id} className="flex justify-between text-sm py-0.5">
              <span className="text-foreground">{a.periodo}</span>
              <span className="font-medium text-foreground">${a.monto.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-2 flex justify-between">
          <span className="font-bold text-foreground">Total pagado</span>
          <span className="font-bold text-xl text-success">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="w-full space-y-3">
        <Button
          variant="outline"
          className="w-full h-12 rounded-xl gap-2"
          onClick={() => {}}
        >
          <Download className="w-4 h-4" />
          Descargar comprobante
        </Button>
        <Button
          onClick={onReset}
          className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Button>
      </div>
    </motion.div>
  );
};

export default ConfirmationStep;
