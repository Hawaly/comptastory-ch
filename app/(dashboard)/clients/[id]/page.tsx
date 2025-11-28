"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { MandatsList } from "@/components/mandats/MandatsList";
import { ContractsList } from "@/components/contracts/ContractsList";
import { GenerateContractButton } from "@/components/contracts/GenerateContractButton";
import { ExpensesList } from "@/components/expenses/ExpensesList";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Building2,
  Calendar,
  FileText,
  Briefcase,
  Receipt,
  Loader2,
  User
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Client,
  CLIENT_TYPE_LABELS,
  CLIENT_STATUS_LABELS,
  CLIENT_STATUS_COLORS,
  CLIENT_TYPE_COLORS
} from "@/types/database";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"mandats" | "contrats" | "factures" | "depenses">("mandats");
  const [contractsKey, setContractsKey] = useState(0);

  useEffect(() => {
    loadClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  async function loadClient() {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("client")
        .select("*")
        .eq("id", clientId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error("Client non trouvé");

      setClient(data);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Erreur lors du chargement du client");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!client) return;

    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer le client "${client.name}" ?\n\nCette action est irréversible et supprimera également tous les mandats, factures et dépenses associés.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      const { error: deleteError } = await supabase
        .from("client")
        .delete()
        .eq("id", clientId);

      if (deleteError) throw deleteError;

      // Redirection vers la liste
      router.push("/clients");
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Erreur lors de la suppression");
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <>
        <Header title="Chargement..." />
        <main className="p-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement du client...</p>
          </div>
        </main>
      </>
    );
  }

  if (error || !client) {
    return (
      <>
        <Header title="Erreur" />
        <main className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error || "Client non trouvé"}</p>
            <Link
              href="/clients"
              className="inline-block mt-4 text-red-600 hover:text-red-800"
            >
              Retour à la liste
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title={client.name} />
      <main className="p-8">
        {/* Breadcrumb + Actions */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/clients"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste des clients
          </Link>

          <div className="flex space-x-3">
            <Link
              href={`/clients/${clientId}/edit`}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Modifier</span>
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Suppression...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Infos principales */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{client.name}</h1>
              {client.company_name && (
                <div className="flex items-center text-gray-600 mb-2">
                  <Building2 className="w-4 h-4 mr-2" />
                  {client.company_name}
                </div>
              )}

              {/* Adresse */}
              {(client.address || client.zip_code || client.locality) && (
                <div className="flex items-start text-gray-600 mb-4">
                  <svg className="w-4 h-4 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    {client.address && <div className="font-medium text-gray-900">{client.address}</div>}
                    {(client.zip_code || client.locality) && (
                      <div className="font-medium text-gray-900">
                        {client.zip_code} {client.locality}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Représenté par */}
              {client.represented_by && (
                <div className="flex items-center text-gray-600 mb-4">
                  <User className="w-4 h-4 mr-2" />
                  <div>
                    <span className="text-xs font-bold text-gray-700">Représenté par :</span>{' '}
                    <span className="font-medium text-gray-900">{client.represented_by}</span>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 mb-4">
                <span className={`inline-flex px-4 py-2 text-base rounded-full ${CLIENT_TYPE_COLORS[client.type]}`}>
                  {CLIENT_TYPE_LABELS[client.type]}
                </span>
                <span className={`inline-flex px-4 py-2 text-base rounded-full ${CLIENT_STATUS_COLORS[client.status]}`}>
                  {CLIENT_STATUS_LABELS[client.status]}
                </span>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                {client.email && (
                  <div className="flex items-center text-gray-700">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <a href={`mailto:${client.email}`} className="hover:text-blue-600">
                      {client.email}
                    </a>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center text-gray-700">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <a href={`tel:${client.phone}`} className="hover:text-blue-600">
                      {client.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                  Créé le {new Date(client.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-end">
          <GenerateContractButton 
            clientId={client.id} 
            onGenerated={() => setContractsKey(prev => prev + 1)}
          />
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Navigation des onglets */}
          <div className="border-b-2 border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("mandats")}
                className={`flex items-center space-x-2 px-6 py-4 border-b-[3px] font-bold text-sm transition-colors ${
                  activeTab === "mandats"
                    ? "border-blue-600 text-blue-700 bg-blue-50"
                    : "border-transparent text-gray-900 hover:text-blue-700 hover:bg-gray-50"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Mandats</span>
              </button>
              <button
                onClick={() => setActiveTab("contrats")}
                className={`flex items-center space-x-2 px-6 py-4 border-b-[3px] font-bold text-sm transition-colors ${
                  activeTab === "contrats"
                    ? "border-green-600 text-green-700 bg-green-50"
                    : "border-transparent text-gray-900 hover:text-green-700 hover:bg-gray-50"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Contrats</span>
              </button>
              <button
                onClick={() => setActiveTab("factures")}
                className={`flex items-center space-x-2 px-6 py-4 border-b-[3px] font-bold text-sm transition-colors ${
                  activeTab === "factures"
                    ? "border-purple-600 text-purple-700 bg-purple-50"
                    : "border-transparent text-gray-900 hover:text-purple-700 hover:bg-gray-50"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Factures</span>
              </button>
              <button
                onClick={() => setActiveTab("depenses")}
                className={`flex items-center space-x-2 px-6 py-4 border-b-[3px] font-bold text-sm transition-colors ${
                  activeTab === "depenses"
                    ? "border-orange-600 text-orange-700 bg-orange-50"
                    : "border-transparent text-gray-900 hover:text-orange-700 hover:bg-gray-50"
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Dépenses</span>
              </button>
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            {activeTab === "mandats" && (
              <MandatsList clientId={client.id} />
            )}

            {activeTab === "contrats" && (
              <ContractsList 
                key={contractsKey} 
                clientId={client.id} 
              />
            )}

            {activeTab === "factures" && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Factures du client
                </h3>
                <p className="text-gray-700 font-medium">
                  La gestion des factures sera disponible dans une prochaine étape.
                </p>
              </div>
            )}

            {activeTab === "depenses" && (
              <ExpensesList clientId={client.id} />
            )}
          </div>
        </div>
      </main>
    </>
  );
}

