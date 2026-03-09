import { ChevronRight, FileText, Pencil, Phone, Mail, Calendar, MapPin, Cpu, Receipt, CreditCard, Banknote, ArrowLeftRight, CheckCircle, Bell, BellOff, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";

const clientesDetalle: Record<string, {
  nombre: string;
  cuenta: string;
  initials: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  email: string;
  saldoPendiente: number;
  periodoPendiente: string;
  ultimoPago: number;
  fechaUltimoPago: string;
  estatusLabel: string;
  estatusColor: string;
  estatusSub: string;
  adeudos: { bimestre: string; monto: number; estatus: "pagado" | "proximo" }[];
  pagos: { folio: string; monto: number; metodo: string; fecha: string; hora: string }[];
  analisis: string;
  tags: string[];
  predio: string;
}> = {
  "SON-2024-00847": {
    nombre: "María Guadalupe Torres",
    cuenta: "SON-2024-00847",
    initials: "MT",
    direccion: "Calle Reforma #142, Col. Centro",
    ciudad: "Hermosillo, Sonora",
    telefono: "662-123-4567",
    email: "m.torres@email.com",
    saldoPendiente: 298.0,
    periodoPendiente: "Período Mar-Abr 2025",
    ultimoPago: 596.0,
    fechaUltimoPago: "24 Mayo 2024",
    estatusLabel: "Al corriente",
    estatusColor: "text-green-600",
    estatusSub: "Contrato Activo",
    adeudos: [
      { bimestre: "Nov-Dic 2024", monto: 284.0, estatus: "pagado" },
      { bimestre: "Ene-Feb 2025", monto: 312.0, estatus: "pagado" },
      { bimestre: "Mar-Abr 2025", monto: 298.0, estatus: "proximo" },
    ],
    pagos: [
      { folio: "#P-2024-8821", monto: 596.0, metodo: "Tarjeta", fecha: "24 Mayo 2024", hora: "14:32" },
      { folio: "#P-2024-3105", monto: 284.0, metodo: "SPEI", fecha: "12 Feb 2024", hora: "09:15" },
      { folio: "#P-2023-9942", monto: 275.0, metodo: "Efectivo", fecha: "05 Dic 2023", hora: "11:40" },
    ],
    analisis:
      "Basado en el historial de consumo de los últimos 12 meses, se estima un incremento del 15% para el próximo período de verano. El cliente mantiene un patrón de pago puntual mediante canales digitales.",
    tags: ["FUGA IMPROBABLE", "PERFIL DIGITAL"],
    predio: "Calle Reforma #142",
  },
  "SON-2024-00912": {
    nombre: "Juan Carlos Pérez",
    cuenta: "SON-2024-00912",
    initials: "JP",
    direccion: "Calle Morelos 45, Col. Juárez",
    ciudad: "Hermosillo, Sonora",
    telefono: "662-987-1234",
    email: "jc.perez@email.com",
    saldoPendiente: 450.0,
    periodoPendiente: "Período Nov-Dic 2024",
    ultimoPago: 300.0,
    fechaUltimoPago: "02 Sep 2023",
    estatusLabel: "Con adeudo",
    estatusColor: "text-red-600",
    estatusSub: "Pago pendiente",
    adeudos: [
      { bimestre: "Sep-Oct 2023", monto: 300.0, estatus: "pagado" },
      { bimestre: "Nov-Dic 2023", monto: 320.0, estatus: "pagado" },
      { bimestre: "Nov-Dic 2024", monto: 450.0, estatus: "proximo" },
    ],
    pagos: [
      { folio: "#P-2023-7710", monto: 300.0, metodo: "Efectivo", fecha: "02 Sep 2023", hora: "10:15" },
    ],
    analisis:
      "El cliente presenta un patrón de pago irregular con periodos de mora recurrentes. Se recomienda enviar recordatorio de pago.",
    tags: ["RIESGO MEDIO", "PAGO EN CAJA"],
    predio: "Calle Morelos 45",
  },
};

const metodoIcon: Record<string, LucideIcon> = {
  Tarjeta: CreditCard,
  SPEI: ArrowLeftRight,
  Efectivo: Banknote,
  Transf: ArrowLeftRight,
};

interface AdminClienteDetalleProps {
  numeroCuenta: string;
  onBack: () => void;
}

const AdminClienteDetalle = ({ numeroCuenta, onBack }: AdminClienteDetalleProps) => {
  const cliente = clientesDetalle[numeroCuenta] ?? clientesDetalle["SON-2024-00847"];
  const { ciudadanos, sendReminder } = useApp();
  const ciudadano = ciudadanos.find((c) => c.numeroCuenta === numeroCuenta) ?? ciudadanos[0];
  const tienePendientes = ciudadano.adeudos.some(
    (a) => a.estatus === "vencido" || a.estatus === "proximo"
  );
  const [sending, setSending] = useState(false);

  const handleSendReminder = () => {
    if (ciudadano.reminderSent || sending) return;
    setSending(true);
    setTimeout(() => {
      sendReminder(ciudadano.numeroCuenta);
      setSending(false);
      toast.success("Recordatorio enviado", {
        description: `Se notificó a ${cliente.nombre} por SMS y correo electrónico.`,
      });
    }, 1500);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <button onClick={onBack} className="hover:text-blue-600 font-medium transition-colors">
          Clientes
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Detalle de Cliente</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{cliente.nombre}</h1>
        <div className="flex gap-2 flex-wrap">
          {tienePendientes && (
            <button
              onClick={handleSendReminder}
              disabled={ciudadano.reminderSent || sending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : ciudadano.reminderSent ? (
                <BellOff className="w-4 h-4" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
              {sending ? "Enviando..." : ciudadano.reminderSent ? "Recordatorio enviado" : "Enviar Recordatorio"}
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            <Pencil className="w-4 h-4 text-blue-500" />
            Editar Datos
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <FileText className="w-4 h-4" />
            Generar Estado de Cuenta
          </button>
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 text-2xl font-bold flex items-center justify-center shrink-0">
            {cliente.initials}
          </div>
          <div className="flex flex-wrap gap-8 flex-1">
            <div>
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">
                Información de Cuenta
              </p>
              <p className="text-xl font-bold text-blue-600">{cliente.cuenta}</p>
              <span className="inline-flex items-center gap-1 mt-1.5 text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                <Cpu className="w-3 h-3" />
                Información identificada por IA
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Ubicación
              </p>
              <p className="text-sm text-gray-800">{cliente.direccion}</p>
              <p className="text-sm text-gray-500">{cliente.ciudad}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Contacto
              </p>
              <p className="text-sm text-gray-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {cliente.telefono}
              </p>
              <p className="text-sm text-gray-700 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {cliente.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Saldo Pendiente</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ${cliente.saldoPendiente.toFixed(2)}
          </p>
          <p className="text-xs text-blue-600 mt-1.5 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {cliente.periodoPendiente}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Último Pago</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ${cliente.ultimoPago.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {cliente.fechaUltimoPago}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Estatus General</p>
          <p className={`text-3xl font-bold mt-2 ${cliente.estatusColor}`}>
            {cliente.estatusLabel}
          </p>
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-gray-400" /> {cliente.estatusSub}
          </p>
        </div>
      </div>

      {/* Two history tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Historial de Adeudos */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50">
              <Receipt className="w-4 h-4 text-blue-500" />
            </span>
            <h3 className="font-semibold text-gray-900">Historial de Adeudos</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3">Bimestre</th>
                <th className="px-5 py-3">Monto</th>
                <th className="px-5 py-3">Estatus</th>
              </tr>
            </thead>
            <tbody>
              {cliente.adeudos.map(a => (
                <tr
                  key={a.bimestre}
                  className={`border-b border-gray-50 last:border-0 ${
                    a.estatus === "proximo" ? "bg-blue-50/40" : ""
                  }`}
                >
                  <td
                    className={`px-5 py-3.5 text-sm ${
                      a.estatus === "proximo"
                        ? "text-blue-700 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {a.bimestre}
                  </td>
                  <td
                    className={`px-5 py-3.5 text-sm font-semibold ${
                      a.estatus === "proximo" ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    ${a.monto.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5">
                    {a.estatus === "pagado" ? (
                      <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                        PAGADO
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                        PRÓXIMO
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Historial de Pagos */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50">
              <CreditCard className="w-4 h-4 text-blue-500" />
            </span>
            <h3 className="font-semibold text-gray-900">Historial de Pagos</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3">Folio</th>
                <th className="px-5 py-3">Monto</th>
                <th className="px-5 py-3">Método</th>
                <th className="px-5 py-3">Fecha / Hora</th>
              </tr>
            </thead>
            <tbody>
              {cliente.pagos.map(p => (
                <tr key={p.folio} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3.5 text-sm font-mono text-gray-700">{p.folio}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">
                    ${p.monto.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      {(() => { const Icon = metodoIcon[p.metodo] ?? CreditCard; return <Icon className="w-3.5 h-3.5 text-gray-400" />; })()}
                      {p.metodo}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    <div>{p.fecha}</div>
                    <div className="text-xs text-gray-400">{p.hora}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Análisis + Mapa */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 bg-blue-100 rounded-lg">
                <Cpu className="w-4 h-4 text-blue-600" />
              </span>
              <h3 className="font-semibold text-gray-900">Análisis Predictivo</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{cliente.analisis}</p>
            <div className="flex gap-2 mt-4 flex-wrap">
              {cliente.tags.map(t => (
                <span
                  key={t}
                  className="text-xs font-semibold bg-white border border-blue-200 text-blue-700 px-3 py-1 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 p-6 text-center min-h-[130px]">
            <MapPin className="w-9 h-9 text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Localización del Predio
            </p>
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">
              {cliente.predio}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClienteDetalle;
