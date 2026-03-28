/**
 * SOAP-compatible proxy endpoints for the CEA agent.
 * Accepts the same SOAP requests as Aquacis/CEA and responds with
 * matching XML so the agent only needs to change CEA_API_BASE.
 *
 * Routes (mounted at /Comercial/services):
 *   POST /InterfazGenericaGestionDeudaWS   → get_deuda
 *   POST /InterfazOficinaVirtualClientesWS  → get_consumo
 *   POST /InterfazGenericaContratacionWS    → get_contract_details
 */

import { Router, Request, Response } from "express";
import express from "express";
import prisma from "../db/client";

const router = Router();

// Parse incoming SOAP XML bodies as plain text
router.use(
  express.text({ type: ["text/xml", "application/xml", "application/soap+xml"] })
);

// ─────────────────────────────────────────────
// XML helpers
// ─────────────────────────────────────────────

/** Extract first matching tag value (namespace-agnostic) */
function xmlValue(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<(?:[^:>]+:)?${tag}[^>]*>([^<]*)<\\/(?:[^:>]+:)?${tag}>`, "i"));
  return m ? m[1].trim() : null;
}

function soapEnvelope(content: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <return>
${content}
    </return>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function soapFault(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <soapenv:Fault>
      <faultstring>${message}</faultstring>
    </soapenv:Fault>
  </soapenv:Body>
</soapenv:Envelope>`;
}

// ─────────────────────────────────────────────
// POST /InterfazGenericaGestionDeudaWS
// Agent sends: <valor>{contrato}</valor>
// Parses: deudaTotal, deuda (porVencer), saldoAnteriorTotal (vencido),
//         nombreCliente, direccion, codigoError
// ─────────────────────────────────────────────

router.post("/InterfazGenericaGestionDeudaWS", async (req: Request, res: Response) => {
  const contrato = xmlValue(req.body as string, "valor");

  if (!contrato) {
    return res.type("text/xml").send(soapFault("Contrato no especificado"));
  }

  try {
    const c = await prisma.contrato.findUnique({
      where: { numeroContrato: contrato },
      include: { facturas: { where: { estado: { not: "pagado" } } } },
    });

    if (!c) {
      return res.type("text/xml").send(soapEnvelope(`
      <codigoError>1</codigoError>
      <descripcionError>Contrato no encontrado: ${contrato}</descripcionError>`));
    }

    const vencidas = c.facturas.filter((f) => f.estado === "vencido");
    const pendientes = c.facturas.filter((f) => f.estado === "pendiente");

    const saldoAnterior = vencidas.reduce((s, f) => s + Number(f.importeTotal), 0);
    const porVencer = pendientes.reduce((s, f) => s + Number(f.importeTotal), 0);
    const totalDeuda = saldoAnterior + porVencer;

    const direccion = `${c.calle} ${c.numero}, ${c.colonia}, ${c.municipio}`;

    return res.type("text/xml").send(soapEnvelope(`
      <codigoError>0</codigoError>
      <deudaTotal>${totalDeuda.toFixed(2)}</deudaTotal>
      <deuda>${porVencer.toFixed(2)}</deuda>
      <saldoAnteriorTotal>${saldoAnterior.toFixed(2)}</saldoAnteriorTotal>
      <nombreCliente>${c.nombreTitular}</nombreCliente>
      <direccion>${direccion}</direccion>`));
  } catch (err) {
    console.error("[SOAP deuda]", err);
    return res.status(500).type("text/xml").send(soapFault("Error interno del servidor"));
  }
});

// ─────────────────────────────────────────────
// POST /InterfazOficinaVirtualClientesWS
// Agent sends: <contrato>{contrato}</contrato>
// Parses: <Consumo> blocks with periodo, año, metrosCubicos, estimado, fechaLectura
// ─────────────────────────────────────────────

router.post("/InterfazOficinaVirtualClientesWS", async (req: Request, res: Response) => {
  const contrato = xmlValue(req.body as string, "contrato");

  if (!contrato) {
    return res.type("text/xml").send(soapFault("Contrato no especificado"));
  }

  try {
    const c = await prisma.contrato.findUnique({
      where: { numeroContrato: contrato },
      include: {
        consumos: {
          orderBy: { fechaLectura: "desc" },
          take: 36,
        },
      },
    });

    if (!c) {
      return res.type("text/xml").send(soapFault(`Contrato no encontrado: ${contrato}`));
    }

    const consumosXML = c.consumos
      .map(
        (con) => `      <Consumo>
        <periodo>${con.periodo}</periodo>
        <año>${con.anio}</año>
        <metrosCubicos>${Number(con.metrosCubicos).toFixed(2)}</metrosCubicos>
        <estimado>${con.estimado}</estimado>
        <fechaLectura>${con.fechaLectura.toISOString()}</fechaLectura>
      </Consumo>`
      )
      .join("\n");

    return res.type("text/xml").send(soapEnvelope(consumosXML));
  } catch (err) {
    console.error("[SOAP consumo]", err);
    return res.status(500).type("text/xml").send(soapFault("Error interno del servidor"));
  }
});

// ─────────────────────────────────────────────
// POST /InterfazGenericaContratacionWS
// Agent sends: <numeroContrato>{contrato}</numeroContrato>
// Parses: numeroContrato, titular, calle, numero, municipio,
//         descUso, fechaAlta, codigoPostal, numeroContador, fechaBaja
// ─────────────────────────────────────────────

router.post("/InterfazGenericaContratacionWS", async (req: Request, res: Response) => {
  const contrato = xmlValue(req.body as string, "numeroContrato");

  if (!contrato) {
    return res.type("text/xml").send(soapFault("Número de contrato no especificado"));
  }

  try {
    const c = await prisma.contrato.findUnique({
      where: { numeroContrato: contrato },
    });

    if (!c) {
      return res.type("text/xml").send(soapFault(`Contrato no encontrado: ${contrato}`));
    }

    // fechaBaja indicates cortado/suspendido status to the agent parser
    const fechaBajaTag =
      c.estado === "cortado" || c.estado === "suspendido"
        ? `      <fechaBaja>${new Date().toISOString()}</fechaBaja>`
        : "";

    return res.type("text/xml").send(soapEnvelope(`
      <numeroContrato>${c.numeroContrato}</numeroContrato>
      <titular>${c.nombreTitular}</titular>
      <calle>${c.calle}</calle>
      <numero>${c.numero}</numero>
      <municipio>${c.municipio}</municipio>
      <codigoPostal>${c.cp}</codigoPostal>
      <descUso>${c.tarifa}</descUso>
      <fechaAlta>${c.fechaAlta.toISOString()}</fechaAlta>
      <numeroContador>${c.numeroMedidor}</numeroContador>${fechaBajaTag ? "\n" + fechaBajaTag : ""}`));
  } catch (err) {
    console.error("[SOAP contrato]", err);
    return res.status(500).type("text/xml").send(soapFault("Error interno del servidor"));
  }
});

export default router;
