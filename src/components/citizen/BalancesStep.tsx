import { motion } from "framer-motion";
import { AlertTriangle, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Adeudo } from "@/context/AppContext";

interface BalancesStepProps {
  adeudos: Adeudo[];
  selected: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const BalancesStep = ({ adeudos, selected, onToggle, onNext, onBack }: BalancesStepProps) => {
  const total = adeudos.filter(a => selected.includes(a.id)).reduce((sum, a) => sum + a.monto, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 px-4 w-full max-w-md mx-auto"
    >
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Tus adeudos de agua</h2>
        <p className="text-sm text-muted-foreground mt-1">Selecciona los períodos que deseas pagar</p>
      </div>

      <div className="space-y-3">
        {adeudos.map((adeudo, i) => {
          const isSelected = selected.includes(adeudo.id);
          const isVencido = adeudo.estatus === "vencido";

          return (
            <motion.button
              key={adeudo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onToggle(adeudo.id)}
              className={cn(
                "w-full text-left bg-card rounded-xl border-2 p-4 transition-all duration-200",
                isSelected
                  ? "border-primary shadow-elevated"
                  : "border-border hover:border-primary-lighter"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{adeudo.periodo}</span>
                    {isVencido ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Vencido
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Próximo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Fecha límite: {adeudo.fechaLimite}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-foreground">
                    ${adeudo.monto.toFixed(2)}
                  </span>
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Total */}
      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-accent rounded-xl p-4 flex items-center justify-between"
        >
          <span className="font-medium text-accent-foreground">
            Total a pagar ({selected.length} {selected.length === 1 ? "período" : "períodos"})
          </span>
          <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
        </motion.div>
      )}

      <div className="flex gap-3 mt-2">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12 rounded-xl">
          Regresar
        </Button>
        <Button
          onClick={onNext}
          disabled={selected.length === 0}
          className="flex-1 h-12 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-elevated hover:shadow-glow transition-all disabled:opacity-50"
        >
          Pagar seleccionados
        </Button>
      </div>
    </motion.div>
  );
};

export default BalancesStep;
