"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { 
  ArrowLeft, 
  FileText, 
  Download,
  CheckCircle,
  User,
  Briefcase,
  Calendar,
  Loader2,
  QrCode,
  Edit
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Invoice,
  InvoiceItem,
  Client,
  Mandat,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS
} from "@/types/database";
import { formatCurrency, DEFAULT_TVA_RATE } from "@/lib/invoiceHelpers";

type InvoiceWithRelations = Invoice & {
  client: Client | null;
  mandat: Mandat | null;
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceWithRelations | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  useEffect(() => {
    loadInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  async function loadInvoice() {
    try {
      setIsLoading(true);
      setError(null);

      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoice")
        .select(`
          *,
          client:client_id (*),
          mandat:mandat_id (*)
        `)
        .eq("id", invoiceId)
        .single();

      if (invoiceError) throw invoiceError;
      if (!invoiceData) throw new Error("Facture non trouvée");

      setInvoice(invoiceData as InvoiceWithRelations);

      const { data: itemsData, error: itemsError } = await supabase
        .from("invoice_item")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("id");

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Erreur lors du chargement de la facture");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGeneratePDF() {
    setIsGeneratingPDF(true);
    try {
      const response = await fetch("/api/invoices/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id: invoiceId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la génération du PDF");
      }

      alert("PDF généré avec succès !");
      loadInvoice(); // Recharger pour avoir le nouveau pdf_path

    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Erreur lors de la génération du PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  async function handleMarkAsPaid() {
    const confirmed = confirm("Marquer cette facture comme payée ?");
    if (!confirmed) return;

    setIsMarkingPaid(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/mark-paid`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la mise à jour");
      }

      alert("Facture marquée comme payée !");
      router.refresh();
      loadInvoice();

    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Erreur");
    } finally {
      setIsMarkingPaid(false);
    }
  }

  if (isLoading) {
    return (
      <>
        <Header title="Chargement..." />
        <main className="p-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold">Chargement de la facture...</p>
          </div>
        </main>
      </>
    );
  }

  if (error || !invoice) {
    return (
      <>
        <Header title="Erreur" />
        <main className="p-8">
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
            <p className="text-red-900 font-semibold">{error || "Facture non trouvée"}</p>
            <Link href="/factures" className="inline-block mt-4 text-red-700 hover:text-red-900 font-bold">
              Retour aux factures
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title={invoice.invoice_number} />
      <main className="p-8">
        {/* Breadcrumb + Actions */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/factures"
            className="flex items-center text-gray-900 hover:text-blue-700 transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux factures
          </Link>

          <div className="flex space-x-3">
            <Link
              href={`/factures/${invoiceId}/edit`}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-bold"
            >
              <Edit className="w-4 h-4" />
              <span>Éditer</span>
            </Link>

            <button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Génération...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>{invoice.pdf_path ? "Regénérer PDF" : "Générer PDF"}</span>
                </>
              )}
            </button>

            {invoice.pdf_path && (
              <a
                href={`/api/invoices/${invoice.id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger PDF</span>
              </a>
            )}

            <button
              onClick={() => {
                // Générer un timestamp unique au moment du clic pour forcer le rechargement
                const timestamp = Date.now();
                const url = `/api/invoices/${invoice.id}/qr-bill?t=${timestamp}`;
                console.log('🔄 Génération QR-bill - Timestamp:', timestamp);
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-bold"
            >
              <QrCode className="w-4 h-4" />
              <span>QR-Bill</span>
            </button>

            {invoice.status !== 'payee' && invoice.status !== 'annulee' && (
              <button
                onClick={handleMarkAsPaid}
                disabled={isMarkingPaid}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
              >
                {isMarkingPaid ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Marquer comme payée</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Informations principales */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900 mb-3">
                Facture {invoice.invoice_number}
              </h1>
              <span className={`inline-flex px-4 py-2 text-base rounded-full ${INVOICE_STATUS_COLORS[invoice.status]}`}>
                {INVOICE_STATUS_LABELS[invoice.status]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client */}
            {invoice.client && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Client</h3>
                <Link
                  href={`/clients/${invoice.client.id}`}
                  className="flex items-center text-blue-700 hover:text-blue-900 font-bold hover:underline"
                >
                  <User className="w-4 h-4 mr-2" />
                  {invoice.client.name}
                </Link>
              </div>
            )}

            {/* Mandat */}
            {invoice.mandat && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Mandat</h3>
                <Link
                  href={`/mandats/${invoice.mandat.id}`}
                  className="flex items-center text-blue-700 hover:text-blue-900 font-bold hover:underline"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  {invoice.mandat.title}
                </Link>
              </div>
            )}

            {/* Date d'émission */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Date d&apos;émission</h3>
              <div className="flex items-center text-gray-900 font-semibold">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(invoice.issue_date).toLocaleDateString("fr-FR")}
              </div>
            </div>

            {/* Date d'échéance */}
            {invoice.due_date && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Date d&apos;échéance</h3>
                <div className="flex items-center text-gray-900 font-semibold">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(invoice.due_date).toLocaleDateString("fr-FR")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lignes de facture */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Détail de la facture</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-black text-gray-900 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-black text-gray-900 uppercase">
                    Quantité
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-black text-gray-900 uppercase">
                    Prix unitaire
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-black text-gray-900 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-semibold">{item.description}</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-bold">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-bold">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-black">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totaux */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Totaux</h2>
          <div className="space-y-3 max-w-md ml-auto">
            <div className="flex justify-between items-center pb-2">
              <span className="text-gray-900 font-bold">Total HT :</span>
              <span className="text-xl font-black text-gray-900">{formatCurrency(invoice.total_ht)}</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-gray-900 font-bold">
                TVA ({invoice.total_tva > 0 ? `${(DEFAULT_TVA_RATE * 100).toFixed(1)}%` : 'Exonéré'}) :
              </span>
              <span className={`text-xl font-black ${invoice.total_tva > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                {formatCurrency(invoice.total_tva)}
              </span>
            </div>
            {invoice.total_tva === 0 && (
              <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
                Exonéré de TVA (CA &lt; CHF 100&apos;000)
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t-[3px] border-gray-900">
              <span className="text-lg font-black text-gray-900">Total TTC :</span>
              <span className="text-3xl font-black text-blue-700">{formatCurrency(invoice.total_ttc)}</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

