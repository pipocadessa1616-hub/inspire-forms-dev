"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

interface Unidade {
  id: string;
  nome: string;
}

interface DataRecord {
  rowIndex: number;
  data: string;
  unidade: string;
  inadimplentes: string;
  plano: string;
  wellhub: string;
  totalpass: string;
}

export default function HistoricoEdicaoPage() {
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filterUnidade, setFilterUnidade] = useState("");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Edição
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Exclusão
  const [deletingRecord, setDeletingRecord] = useState<DataRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unidadesRes, recordsRes] = await Promise.all([
          fetch("/api/unidades"),
          fetch("/api/submit")
        ]);

        if (!unidadesRes.ok || !recordsRes.ok) throw new Error("Falha ao carregar dados");

        const unidadesData = await unidadesRes.json();
        const recordsData = await recordsRes.json();

        setUnidades(unidadesData);
        setRecords(recordsData);
      } catch (err) {
        setError("Erro ao carregar histórico. Tente recarregar a página.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split('/');
    if (parts.length !== 3) return new Date(0);
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  };

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split('/');
    if (parts.length !== 3) return "";
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  };

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
  };

  // Filtrar e Ordenar Registros
  const filteredRecords = useMemo(() => {
    let filtered = [...records];

    if (filterUnidade) {
      filtered = filtered.filter(r => r.unidade === filterUnidade);
    }

    if (filterDateStart) {
      const [year, month, day] = filterDateStart.split('-');
      const start = new Date(Number(year), Number(month) - 1, Number(day));
      filtered = filtered.filter(r => {
        const recordDate = parseDate(r.data);
        return recordDate >= start;
      });
    }
    if (filterDateEnd) {
      const [year, month, day] = filterDateEnd.split('-');
      const end = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59);
      filtered = filtered.filter(r => {
        const recordDate = parseDate(r.data);
        return recordDate <= end;
      });
    }

    return filtered.sort((a, b) => {
      const dateA = parseDate(a.data).getTime();
      const dateB = parseDate(b.data).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [records, filterUnidade, filterDateStart, filterDateEnd, sortOrder]);

  // Calcular totais
  const totals = useMemo(() => {
    return filteredRecords.reduce((acc, record) => ({
      inadimplentes: acc.inadimplentes + Number(record.inadimplentes || 0),
      plano: acc.plano + Number(record.plano || 0),
      wellhub: acc.wellhub + Number(record.wellhub || 0),
      totalpass: acc.totalpass + Number(record.totalpass || 0),
    }), { inadimplentes: 0, plano: 0, wellhub: 0, totalpass: 0 });
  }, [filteredRecords]);

  const getUnidadeNome = (id: string) => {
    return unidades.find(u => u.id === id)?.nome || id;
  };

  const handleEditClick = (record: DataRecord) => {
    const dateForInput = formatDateForInput(record.data);
    setEditingRecord({ ...record, data: dateForInput });
    setSaveMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const payload = {
        rowIndex: editingRecord.rowIndex,
        date: editingRecord.data,
        unidade: editingRecord.unidade,
        inadimplentes: editingRecord.inadimplentes,
        plano: editingRecord.plano,
        wellhub: editingRecord.wellhub,
        totalpass: editingRecord.totalpass,
      };

      console.log("📤 Enviando para API:", payload);

      const res = await fetch("/api/submit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📥 Resposta da API - Status:", res.status);
      const responseData = await res.json();
      console.log("📥 Resposta da API - Dados:", responseData);

      if (!res.ok) throw new Error("Erro ao salvar");

      const displayDate = editingRecord.data.includes('-') 
        ? formatDateForDisplay(editingRecord.data) 
        : editingRecord.data;

      const updatedRecord = { ...editingRecord, data: displayDate };
      setRecords(prev => prev.map(r => 
        r.rowIndex === updatedRecord.rowIndex ? updatedRecord : r
      ));

      setSaveMessage({ type: 'success', text: "Registro atualizado com sucesso!" });
      setTimeout(() => {
        setEditingRecord(null);
        setSaveMessage(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      setSaveMessage({ type: 'error', text: "Erro ao salvar alterações." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDateChange = (newDate: string) => {
    if (!editingRecord) return;
    setEditingRecord({ ...editingRecord, data: newDate });
  };

  const confirmDelete = async () => {
    if (!deletingRecord) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowIndex: deletingRecord.rowIndex }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao excluir");
      }

      setRecords(prev => prev.filter(r => r.rowIndex !== deletingRecord.rowIndex));
      
      setDeletingRecord(null);
      setSaveMessage({ type: 'success', text: "Registro excluído com sucesso!" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error("Erro ao excluir:", err);
      setDeletingRecord(null);
      setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : "Erro ao excluir registro." });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  // Badge de status
  const getStatusBadge = (value: string | number) => {
    const num = Number(value);
    if (num === 0) return "bg-gray-100 text-gray-600";
    if (num < 5) return "bg-green-100 text-green-700";
    if (num < 10) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4"
      style={{ background: "linear-gradient(135deg, #AAACDF 0%, #7867F2 50%, #6441BF 100%)" }}
    >
      <main className="w-full max-w-7xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 relative min-h-[80vh]">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Link href="/historico-selecao" className="text-[#7867F2] hover:text-[#6441BF] transition-colors flex items-center gap-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
              <span className="font-semibold">Voltar</span>
            </Link>
            <Image
              src="/inspire-logo-transparente.png"
              alt="Inspire"
              width={60}
              height={60}
            />
          </div>

          <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "#6441BF" }}>
              Histórico e Edição - Alunos por Plano
            </h1>
            <div className="mx-auto w-20 h-1 rounded-full mb-3" style={{ background: "linear-gradient(90deg, #5CD1FB, #7867F2)" }} />
            {!isLoading && !error && (
              <p className="text-sm text-gray-600">
                Exibindo {filteredRecords.length} de {records.length} registros
              </p>
            )}
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-[#F0F1FA] rounded-lg">
            <div>
              <label className="block text-xs font-bold text-[#6441BF] mb-1">UNIDADE</label>
              <select
                value={filterUnidade}
                onChange={(e) => setFilterUnidade(e.target.value)}
                className="w-full p-2 rounded border border-[#AAACDF] text-sm text-gray-700 outline-none focus:border-[#7867F2]"
              >
                <option value="">Todas as Unidades</option>
                {unidades.map(u => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6441BF] mb-1">DATA INICIAL</label>
              <input
                type="date"
                value={filterDateStart}
                onChange={(e) => setFilterDateStart(e.target.value)}
                className="w-full p-2 rounded border border-[#AAACDF] text-sm text-gray-700 outline-none focus:border-[#7867F2]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6441BF] mb-1">DATA FINAL</label>
              <input
                type="date"
                value={filterDateEnd}
                onChange={(e) => setFilterDateEnd(e.target.value)}
                className="w-full p-2 rounded border border-[#AAACDF] text-sm text-gray-700 outline-none focus:border-[#7867F2]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6441BF] mb-1">ORDENAR POR</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full p-2 rounded border border-[#AAACDF] text-sm text-gray-700 outline-none focus:border-[#7867F2]"
              >
                <option value="desc">Mais recentes</option>
                <option value="asc">Mais antigos</option>
              </select>
            </div>
          </div>

          {/* Loading com Skeleton */}
          {isLoading && (
            <div className="space-y-3 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          )}

          {error && <div className="text-center py-10 text-red-500">{error}</div>}

          {/* Tabela (Desktop) */}
          {!isLoading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full hidden md:table text-sm text-left text-gray-600">
                <thead className="text-xs text-[#6441BF] uppercase bg-[#F0F1FA] sticky top-0">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Data</th>
                    <th className="px-4 py-3">Unidade</th>
                    <th className="px-4 py-3 text-center">Inadimplentes</th>
                    <th className="px-4 py-3 text-center">Plano</th>
                    <th className="px-4 py-3 text-center">Wellhub</th>
                    <th className="px-4 py-3 text-center">Totalpass</th>
                    <th className="px-4 py-3 rounded-r-lg text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record, index) => (
                    <tr key={record.rowIndex} className={`border-b border-gray-100 hover:bg-[#F0F1FA] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-4 py-3 font-medium">{record.data}</td>
                      <td className="px-4 py-3">{getUnidadeNome(record.unidade)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(record.inadimplentes)}`}>
                          {record.inadimplentes}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">{record.plano}</td>
                      <td className="px-4 py-3 text-center">{record.wellhub}</td>
                      <td className="px-4 py-3 text-center">{record.totalpass}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEditClick(record)}
                            className="inline-flex items-center gap-1 text-[#7867F2] hover:text-[#6441BF] font-semibold hover:underline transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9"/>
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                            </svg>
                            Editar
                          </button>
                          <button
                            onClick={() => setDeletingRecord(record)}
                            className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 font-semibold hover:underline transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"/>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                              <path d="M8 6V4c0-1 1-1 1-1h6c1 0 1 1 1 1v2"/>
                            </svg>
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Linha de Totais */}
                  {filteredRecords.length > 0 && (
                    <tr className="bg-gradient-to-r from-[#F0F1FA] to-[#E8E9F8] font-bold text-[#6441BF] border-t-2 border-[#7867F2]">
                      <td className="px-4 py-3" colSpan={2}>TOTAIS</td>
                      <td className="px-4 py-3 text-center">{totals.inadimplentes}</td>
                      <td className="px-4 py-3 text-center">{totals.plano}</td>
                      <td className="px-4 py-3 text-center">{totals.wellhub}</td>
                      <td className="px-4 py-3 text-center">{totals.totalpass}</td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  )}

                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredRecords.map((record) => (
                  <div key={record.rowIndex} className="bg-white border-2 border-[#AAACDF] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold text-[#6441BF] block mb-1">DATA</span>
                        <span className="text-sm font-semibold text-gray-800">{record.data}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#6441BF] block mb-1">UNIDADE</span>
                        <span className="text-sm font-semibold text-gray-800">{getUnidadeNome(record.unidade)}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Inadimplentes:</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusBadge(record.inadimplentes)}`}>
                          {record.inadimplentes}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Plano:</span>
                        <span className="font-semibold text-gray-800">{record.plano}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Wellhub:</span>
                        <span className="font-semibold text-gray-800">{record.wellhub}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Totalpass:</span>
                        <span className="font-semibold text-gray-800">{record.totalpass}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEditClick(record)}
                        className="flex-1 py-2 text-center text-sm font-semibold text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                        style={{ background: "linear-gradient(135deg, #7867F2, #6441BF)" }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => setDeletingRecord(record)}
                        className="flex-1 py-2 text-center text-sm font-semibold text-white bg-red-500 rounded-lg transition-all shadow-md hover:shadow-lg hover:bg-red-600"
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </div>
                ))}
                
                {filteredRecords.length === 0 && (
                  <div className="text-center py-8 text-gray-400">Nenhum registro encontrado.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Confirmação de Exclusão */}
      {deletingRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-slideUp">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-1 1-1h6c1 0 1 1 1 1v2"/>
                <line x1="10" x2="10" y1="11" y2="17"/>
                <line x1="14" x2="14" y1="11" y2="17"/>
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
              Excluir Registro?
            </h2>
            
            <p className="text-center text-gray-600 mb-6">
              Tem certeza que deseja excluir este registro?<br/>
              <span className="font-semibold text-gray-800">
                {getUnidadeNome(deletingRecord.unidade)} - {deletingRecord.data}
              </span><br/>
              <span className="text-sm text-red-600">Esta ação não pode ser desfeita.</span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingRecord(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Excluindo...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      <path d="M8 6V4c0-1 1-1 1-1h6c1 0 1 1 1 1v2"/>
                    </svg>
                    Sim, Excluir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de Sucesso/Erro Flutuante */}
      {saveMessage && !editingRecord && (
        <div className="fixed top-4 right-4 z-50 animate-slideDown">
          <div className={`p-4 rounded-lg shadow-lg flex items-center gap-3 ${saveMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {saveMessage.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" x2="9" y1="9" y2="15"/>
                <line x1="9" x2="15" y1="9" y2="15"/>
              </svg>
            )}
            <span className="font-medium">{saveMessage.text}</span>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto animate-slideUp">
            <h2 className="text-xl font-bold text-[#6441BF] mb-4">✏️ Editar Registro</h2>
            
            {saveMessage && (
              <div className={`mb-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${saveMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {saveMessage.type === 'success' ? '✅' : '❌'}
                {saveMessage.text}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">DATA</label>
                  <input
                    type="date"
                    value={editingRecord.data}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full p-2 border-2 rounded-lg focus:border-[#7867F2] outline-none text-gray-800 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">UNIDADE</label>
                  <select
                    value={editingRecord.unidade}
                    onChange={(e) => setEditingRecord({ ...editingRecord, unidade: e.target.value })}
                    className="w-full p-2 border-2 rounded-lg focus:border-[#7867F2] outline-none text-gray-800 transition-colors"
                    required
                  >
                    {unidades.map(u => (
                      <option key={u.id} value={u.id}>{u.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">INADIMPLENTES</label>
                  <input
                    type="number"
                    value={editingRecord.inadimplentes}
                    onChange={(e) => setEditingRecord({ ...editingRecord, inadimplentes: e.target.value })}
                    className="w-full p-2 border-2 rounded-lg focus:border-[#7867F2] outline-none text-gray-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">PLANO</label>
                  <input
                    type="number"
                    value={editingRecord.plano}
                    onChange={(e) => setEditingRecord({ ...editingRecord, plano: e.target.value })}
                    className="w-full p-2 border-2 rounded-lg focus:border-[#7867F2] outline-none text-gray-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">WELLHUB</label>
                  <input
                    type="number"
                    value={editingRecord.wellhub}
                    onChange={(e) => setEditingRecord({ ...editingRecord, wellhub: e.target.value })}
                    className="w-full p-2 border-2 rounded-lg focus:border-[#7867F2] outline-none text-gray-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">TOTALPASS</label>
                  <input
                    type="number"
                    value={editingRecord.totalpass}
                    onChange={(e) => setEditingRecord({ ...editingRecord, totalpass: e.target.value })}
                    className="w-full p-2 border-2 rounded-lg focus:border-[#7867F2] outline-none text-gray-800 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="flex-1 py-2 px-4 border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 px-4 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-70"
                  style={{ background: "linear-gradient(135deg, #7867F2, #6441BF)" }}
                >
                  {isSaving ? "⏳ Salvando..." : "💾 Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}