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
  data: string; // Formato DD/MM/YYYY vindo da planilha
  unidade: string; // ID da unidade
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

  // Função auxiliar para converter DD/MM/YYYY para Date object
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split('/');
    if (parts.length !== 3) return new Date(0);
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  };

  // Função auxiliar para converter DD/MM/YYYY para YYYY-MM-DD (para input type="date")
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split('/');
    if (parts.length !== 3) return "";
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  };

  // Função auxiliar para converter YYYY-MM-DD para DD/MM/YYYY
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
  };

  // Filtrar e Ordenar Registros
  const filteredRecords = useMemo(() => {
    let filtered = [...records];

    // Filtro por Unidade
    if (filterUnidade) {
      filtered = filtered.filter(r => r.unidade === filterUnidade);
    }

    // Filtro por Data (Range)
    if (filterDateStart) {
      const start = new Date(filterDateStart);
      filtered = filtered.filter(r => parseDate(r.data) >= start);
    }
    if (filterDateEnd) {
      const end = new Date(filterDateEnd);
      filtered = filtered.filter(r => parseDate(r.data) <= end);
    }

    // Ordenar por data
    return filtered.sort((a, b) => {
      const dateA = parseDate(a.data).getTime();
      const dateB = parseDate(b.data).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [records, filterUnidade, filterDateStart, filterDateEnd, sortOrder]);

  const getUnidadeNome = (id: string) => {
    return unidades.find(u => u.id === id)?.nome || id;
  };

  const handleEditClick = (record: DataRecord) => {
    // Converter data para formato YYYY-MM-DD ao abrir o modal
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
      // Preparar dados para enviar para API (com o campo "date" que a API espera)
      const payload = {
        rowIndex: editingRecord.rowIndex,
        date: editingRecord.data, // API espera "date", não "data"
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

      // Converter data de volta para DD/MM/YYYY para exibição
      const displayDate = editingRecord.data.includes('-') 
        ? formatDateForDisplay(editingRecord.data) 
        : editingRecord.data;

      // Atualizar lista localmente com a data formatada
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

  return (
    <div className="min-h-screen flex flex-col items-center p-4"
      style={{ background: "linear-gradient(135deg, #AAACDF 0%, #7867F2 50%, #6441BF 100%)" }}
    >
      <main className="w-full max-w-6xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 relative min-h-[80vh]">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="text-[#7867F2] hover:text-[#6441BF] transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "#6441BF" }}>
              Histórico e Edição Alunos por Plano Inspire
            </h1>
            <div className="mx-auto w-20 h-1 rounded-full mb-3" style={{ background: "linear-gradient(90deg, #5CD1FB, #7867F2)" }} />
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
              <label className="block text-xs font-bold text-[#6441BF] mb-1">ORDEM</label>
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

          {/* Loading / Error */}
          {isLoading && <div className="text-center py-10 text-[#7867F2]">Carregando dados...</div>}
          {error && <div className="text-center py-10 text-red-500">{error}</div>}

          {/* Tabela (Desktop) / Cards (Mobile) */}
          {!isLoading && !error && (
            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <table className="w-full hidden md:table text-sm text-left text-gray-600">
                <thead className="text-xs text-[#6441BF] uppercase bg-[#F0F1FA]">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Data</th>
                    <th className="px-4 py-3">Unidade</th>
                    <th className="px-4 py-3 text-center">Inadimpl.</th>
                    <th className="px-4 py-3 text-center">Plano</th>
                    <th className="px-4 py-3 text-center">Wellhub</th>
                    <th className="px-4 py-3 text-center">Totalpass</th>
                    <th className="px-4 py-3 rounded-r-lg text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.rowIndex} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{record.data}</td>
                      <td className="px-4 py-3">{getUnidadeNome(record.unidade)}</td>
                      <td className="px-4 py-3 text-center">{record.inadimplentes}</td>
                      <td className="px-4 py-3 text-center">{record.plano}</td>
                      <td className="px-4 py-3 text-center">{record.wellhub}</td>
                      <td className="px-4 py-3 text-center">{record.totalpass}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleEditClick(record)}
                          className="text-[#7867F2] hover:text-[#6441BF] font-semibold hover:underline"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">Nenhum registro encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredRecords.map((record) => (
                  <div key={record.rowIndex} className="bg-white border border-[#AAACDF] rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-bold text-[#6441BF] block">DATA</span>
                        <span className="text-sm text-gray-800">{record.data}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#6441BF] block">UNIDADE</span>
                        <span className="text-sm text-gray-800">{getUnidadeNome(record.unidade)}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div>Inadimplentes: <span className="font-medium text-gray-800">{record.inadimplentes}</span></div>
                      <div>Plano: <span className="font-medium text-gray-800">{record.plano}</span></div>
                      <div>Wellhub: <span className="font-medium text-gray-800">{record.wellhub}</span></div>
                      <div>Totalpass: <span className="font-medium text-gray-800">{record.totalpass}</span></div>
                    </div>
                    <button
                      onClick={() => handleEditClick(record)}
                      className="w-full py-2 text-center text-sm font-semibold text-[#7867F2] border border-[#7867F2] rounded hover:bg-[#7867F2] hover:text-white transition-colors"
                    >
                      Editar Registro
                    </button>
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

      {/* Modal de Edição */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#6441BF] mb-4">Editar Registro</h2>
            
            {saveMessage && (
              <div className={`mb-4 p-3 rounded text-sm font-medium ${saveMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
                    className="w-full p-2 border rounded focus:border-[#7867F2] outline-none text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">UNIDADE</label>
                  <select
                    value={editingRecord.unidade}
                    onChange={(e) => setEditingRecord({ ...editingRecord, unidade: e.target.value })}
                    className="w-full p-2 border rounded focus:border-[#7867F2] outline-none text-gray-800"
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
                    className="w-full p-2 border rounded focus:border-[#7867F2] outline-none text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">PLANO</label>
                  <input
                    type="number"
                    value={editingRecord.plano}
                    onChange={(e) => setEditingRecord({ ...editingRecord, plano: e.target.value })}
                    className="w-full p-2 border rounded focus:border-[#7867F2] outline-none text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">WELLHUB</label>
                  <input
                    type="number"
                    value={editingRecord.wellhub}
                    onChange={(e) => setEditingRecord({ ...editingRecord, wellhub: e.target.value })}
                    className="w-full p-2 border rounded focus:border-[#7867F2] outline-none text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">TOTALPASS</label>
                  <input
                    type="number"
                    value={editingRecord.totalpass}
                    onChange={(e) => setEditingRecord({ ...editingRecord, totalpass: e.target.value })}
                    className="w-full p-2 border rounded focus:border-[#7867F2] outline-none text-gray-800"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 font-medium transition-colors"
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 px-4 text-white rounded font-medium shadow-md transition-all disabled:opacity-70"
                  style={{ background: "linear-gradient(135deg, #7867F2, #6441BF)" }}
                >
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}