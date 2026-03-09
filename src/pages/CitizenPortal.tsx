import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import CitizenHeader from "@/components/citizen/CitizenHeader";
import StepIndicator from "@/components/citizen/StepIndicator";
import WelcomeStep from "@/components/citizen/WelcomeStep";
import BalancesStep from "@/components/citizen/BalancesStep";
import PaymentMethodStep from "@/components/citizen/PaymentMethodStep";
import PaymentDetailStep from "@/components/citizen/PaymentDetailStep";
import ProcessingStep from "@/components/citizen/ProcessingStep";
import ConfirmationStep from "@/components/citizen/ConfirmationStep";
import { useApp } from "@/context/AppContext";

const STEP_LABELS = ["Bienvenida", "Adeudos", "Método", "Detalle", "Proceso", "Listo"];

const CitizenPortal = () => {
  const { ciudadanoActual, payAdeudo } = useApp();
  const [step, setStep] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"tarjeta" | "spei" | "wallet" | null>(null);
  const [cardLabel, setCardLabel] = useState<string | null>(null);

  const adeudosPendientes = ciudadanoActual.adeudos.filter(
    (a) => a.estatus === "vencido" || a.estatus === "proximo"
  );
  const selectedAdeudos = adeudosPendientes.filter((a) => selectedIds.includes(a.id));
  const total = selectedAdeudos.reduce((sum, a) => sum + a.monto, 0);

  const toggleAdeudo = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    setStep(1);
    setSelectedIds([]);
    setPaymentMethod(null);
    setCardLabel(null);
  };

  const handleProcessingComplete = useCallback(() => {
    selectedAdeudos.forEach((a) => payAdeudo(ciudadanoActual.numeroCuenta, a.id));
    setStep(6);
  }, [selectedAdeudos, payAdeudo, ciudadanoActual.numeroCuenta]);

  return (
    <div className="min-h-screen gradient-surface flex flex-col">
      <CitizenHeader />

      {step <= 4 && (
        <div className="bg-card border-b border-border">
          <StepIndicator currentStep={step} totalSteps={6} labels={STEP_LABELS} />
        </div>
      )}

      <main className="flex-1 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {step === 1 && <WelcomeStep onNext={() => setStep(2)} />}
          {step === 2 && (
            <BalancesStep
              adeudos={adeudosPendientes}
              selected={selectedIds}
              onToggle={toggleAdeudo}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <PaymentMethodStep
              method={paymentMethod}
              onSelect={setPaymentMethod}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && paymentMethod && (
            <PaymentDetailStep
              method={paymentMethod}
              selectedAdeudos={selectedAdeudos}
              total={total}
              onConfirm={(label) => {
                setCardLabel(label ?? null);
                setStep(5);
              }}
              onBack={() => setStep(3)}
            />
          )}
          {step === 5 && <ProcessingStep onComplete={handleProcessingComplete} />}
          {step === 6 && paymentMethod && (
            <ConfirmationStep
              selectedAdeudos={selectedAdeudos}
              total={total}
              method={paymentMethod}
              cardLabel={cardLabel}
              numeroCuenta={ciudadanoActual.numeroCuenta}
              onReset={handleReset}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        © 2025 Gobierno Municipal de Hermosillo · Servicios de Agua
      </footer>
    </div>
  );
};

export default CitizenPortal;
