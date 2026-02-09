"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

interface Unidade {
  id: string;
  nome: string;
}

interface FormData {
  date: string;
  unidade: string;
  leadsRecebidos: string;
  experimentaisAgendadas: string;
  aulasRealizadas: string;
  vendas: string;
  totalpassAgendamentos: string;
  totalpassPresencas: string;
  wellhubAgendamentos: string;
  wellhubPresenca: string;
}

interface FormErrors {
  date?: string;
  unidade?: string;
  leadsRecebidos?: string;
  experimentaisAgendadas?: string;
  aulasRealizadas?: string;
  vendas?: string;
  totalpassAgendamentos?: string;
  totalpassPresencas?: string;
  wellhubAgendamentos?: string;
  wellhubPresenca?: string;
}

export default function DadosDiariosPage() {
  const [formData, setFormData] = useState<FormData>({
    date: "",
    unidade: "",
    leadsRecebidos: "",
    experimentaisAgendadas: "",
    aulasRealizadas: "",
    vendas: "",
    totalpassAgendamentos: "",
    totalpassPresencas: "",
    wellhubAgendamentos: "",
    wellhubPresenca: "",
  });

  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/unidades")
      .then((res) => res.json())
      .then((data) => setUnidades(data))
      .catch(() => setSubmitError("Erro ao carregar unidades"));
  }, []);

  const validateNumberField = (value: string): string | undefined => {
    const numValue = Number(value);
    if (value === "" || isNaN(numValue) || numValue < 0) {
      return "Deve ser um número maior ou igual a zero";
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.date) {
      newErrors.date = "Selecione uma data";
    }
    if (!formData.unidade) {
      newErrors.unidade = "Selecione uma unidade";
    }
    newErrors.leadsRecebidos = validateNumberField(formData.leadsRecebidos);
    newErrors.experimentaisAgendadas = validateNumberField(
      formData.experimentaisAgendadas
    );
    newErrors.aulasRealizadas = validateNumberField(formData.aulasRealizadas);
    newErrors.vendas = validateNumberField(formData.vendas);
    newErrors.totalpassAgendamentos = validateNumberField(
      formData.totalpassAgendamentos
    );
    newErrors.totalpassPresencas = validateNumberField(
      formData.totalpassPresencas
    );
    newErrors.wellhubAgendamentos = validateNumberField(
      formData.wellhubAgendamentos
    );
    newErrors.wellhubPresenca = validateNumberField(formData.wellhubPresenca);

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    if (validateForm()) {
      setIsLoading(true);
      try {
        const res = await fetch("/api/dados-diarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          setSubmitError(data.error || "Erro ao enviar formulário");
          return;
        }

        setIsSubmitted(true);

        setTimeout(() => {
          setFormData({
            date: "",
            unidade: "",
            leadsRecebidos: "",
            experimentaisAgendadas: "",
            aulasRealizadas: "",
            vendas: "",
            totalpassAgendamentos: "",
            totalpassPresencas: "",
            wellhubAgendamentos: "",
            wellhubPresenca: "",
          });
          setIsSubmitted(false);
          setErrors({});
        }, 3000);
      } catch {
        setSubmitError("Erro de conexão. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateNumberField(value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #AAACDF 0%, #7867F2 50%, #6441BF 100%)",
      }}
    >
      <main className="w-full max-w-2xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 relative">
          <Link href="/" className="absolute top-4 left-4 md:top-6 md:left-6 text-[#7867F2] hover:text-[#6441BF] transition-colors" title="Voltar para o início">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
          </Link>
          <Image
            src="/inspire-logo-transparente.png"
            alt="Inspire"
            width={80}
            height={80}
            className="absolute top-4 right-4 md:top-6 md:right-6"
          />
          <div className="mb-8 text-center">
            <h1
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{ color: "#6441BF" }}
            >
              Dados Diários
            </h1>
            <div
              className="mx-auto w-20 h-1 rounded-full mb-3"
              style={{ background: "linear-gradient(90deg, #5CD1FB, #7867F2)" }}
            />
            <p style={{ color: "#7867F2" }}>
              Preencha todos os campos com os dados da unidade
            </p>
          </div>

          {isSubmitted && (
            <div
              className="mb-6 p-4 rounded-lg border"
              style={{ backgroundColor: "#5CD1FB20", borderColor: "#5CD1FB" }}
            >
              <p className="font-medium" style={{ color: "#6441BF" }}>
                Formulário enviado com sucesso!
              </p>
            </div>
          )}

          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* DATA DA INSERÇÃO */}
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#6441BF" }}
              >
                DATA DA INSERÇÃO
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, date: e.target.value }));
                  if (e.target.value) {
                    setErrors((prev) => ({ ...prev, date: undefined }));
                  }
                }}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all text-black outline-none ${
                  errors.date
                    ? "border-red-500 bg-red-50"
                    : "border-[#AAACDF] focus:border-[#7867F2]"
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* UNIDADE */}
            <div>
              <label
                htmlFor="unidade"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#6441BF" }}
              >
                UNIDADE
              </label>
              <select
                id="unidade"
                value={formData.unidade}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, unidade: e.target.value }));
                  if (e.target.value) {
                    setErrors((prev) => ({ ...prev, unidade: undefined }));
                  }
                }}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all text-black outline-none ${
                  errors.unidade
                    ? "border-red-500 bg-red-50"
                    : "border-[#AAACDF] focus:border-[#7867F2]"
                }`}
              >
                <option value="">Selecione uma unidade</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
              {errors.unidade && (
                <p className="mt-1 text-sm text-red-600">{errors.unidade}</p>
              )}
            </div>

            {/* LEADS RECEBIDOS */}
            <div>
              <label
                htmlFor="leadsRecebidos"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#6441BF" }}
              >
                LEADS RECEBIDOS
              </label>
              <input
                type="number"
                id="leadsRecebidos"
                value={formData.leadsRecebidos}
                onChange={(e) => handleChange("leadsRecebidos", e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all text-black outline-none ${
                  errors.leadsRecebidos
                    ? "border-red-500 bg-red-50"
                    : "border-[#AAACDF] focus:border-[#7867F2]"
                }`}
              />
              {errors.leadsRecebidos && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.leadsRecebidos}
                </p>
              )}
            </div>

            {/* EXPERIMENTAIS AGENDADAS */}
            <div>
              <label
                htmlFor="experimentaisAgendadas"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#6441BF" }}
              >
                EXPERIMENTAIS AGENDADAS
              </label>
              <input
                type="number"
                id="experimentaisAgendadas"
                value={formData.experimentaisAgendadas}
                onChange={(e) =>
                  handleChange("experimentaisAgendadas", e.target.value)
                }
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all text-black outline-none ${
                  errors.experimentaisAgendadas
                    ? "border-red-500 bg-red-50"
                    : "border-[#AAACDF] focus:border-[#7867F2]"
                }`}
              />
              {errors.experimentaisAgendadas && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.experimentaisAgendadas}
                </p>
              )}
            </div>

            {/* AULAS REALIZADAS */}
            <div>
              <label
                htmlFor="aulasRealizadas"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#6441BF" }}
              >
                AULAS REALIZADAS
              </label>
              <input
                type="number"
                id="aulasRealizadas"
                value={formData.aulasRealizadas}
                onChange={(e) => handleChange("aulasRealizadas", e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all text-black outline-none ${
                  errors.aulasRealizadas
                    ? "border-red-500 bg-red-50"
                    : "border-[#AAACDF] focus:border-[#7867F2]"
                }`}
              />
              {errors.aulasRealizadas && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.aulasRealizadas}
                </p>
              )}
            </div>

            {/* VENDAS */}
            <div>
              <label
                htmlFor="vendas"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#6441BF" }}
              >
                VENDAS
              </label>
              <input
                type="number"
                id="vendas"
                value={formData.vendas}
                onChange={(e) => handleChange("vendas", e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all text-black outline-none ${
                  errors.vendas
                    ? "border-red-500 bg-red-50"
                    : "border-[#AAACDF] focus:border-[#7867F2]"
                }`}
              />
              {errors.vendas && (
                <p className="mt-1 text-sm text-red-600">{errors.vendas}</p>
              )}
            </div>

            {/* TOTALPASS AGENDAMENTOS */}
            <div>
              <label
                htmlFor="totalpassAgendamentos"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#6441BF" }}
              >
                TOTALPASS AGENDAMENTOS
              </label>
              <input
                type="number"
                id="totalpassAgendamentos"
                value={formData.totalpassAgendamentos}
                onChange={(e) =>
                  handleChange("totalpassAgendamentos", e.target.value)
                }
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all text-black outline-none ${
                  errors.totalpassAgendamentos
                    ? "border-red-500 bg-red-50"
                    : "border-[#AAACDF] focus:border-[#7867F2]"
                }`}
              />
              {errors.totalpassAgendamentos && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.totalpassAgendamentos}
                </p>
              )}
            </div>

            {/* TOTALPASS PRESENÇAS */}
            <div>
              <label
                htmlFor="totalpassPresencas"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#6441BF" }}
              >
                TOTALPASS PRESENÇAS
              </label>
              <input
                type="number"
                id="totalpassPresencas"
                value={formData.totalpassPresencas}
                onChange={(e) =>
                  handleChange("totalpassPresencas", e.target.value)
                }
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all text-black outline-none ${
                  errors.totalpassPresencas
                    ? "border-red-500 bg-red-50"
                    : "border-[#AAACDF] focus:border-[#7867F2]"
                }`}
              />
              {errors.totalpassPresencas && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.totalpassPresencas}
                </p>
              )}
            </div>

            {/* WELLHUB AGENDAMENTOS */}
            <div>
              <label
                htmlFor="wellhubAgendamentos"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#6441BF" }}
              >
                WELLHUB AGENDAMENTOS
              </label>
              <input
                type="number"
                id="wellhubAgendamentos"
                value={formData.wellhubAgendamentos}
                onChange={(e) =>
                  handleChange("wellhubAgendamentos", e.target.value)
                }
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all text-black outline-none ${
                  errors.wellhubAgendamentos
                    ? "border-red-500 bg-red-50"
                    : "border-[#AAACDF] focus:border-[#7867F2]"
                }`}
              />
              {errors.wellhubAgendamentos && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.wellhubAgendamentos}
                </p>
              )}
            </div>

            {/* WELLHUB PRESENÇA */}
            <div>
              <label
                htmlFor="wellhubPresenca"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#6441BF" }}
              >
                WELLHUB PRESENÇA
              </label>
              <input
                type="number"
                id="wellhubPresenca"
                value={formData.wellhubPresenca}
                onChange={(e) => handleChange("wellhubPresenca", e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all text-black outline-none ${
                  errors.wellhubPresenca
                    ? "border-red-500 bg-red-50"
                    : "border-[#AAACDF] focus:border-[#7867F2]"
                }`}
              />
              {errors.wellhubPresenca && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.wellhubPresenca}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: isLoading
                  ? "#AAACDF"
                  : "linear-gradient(135deg, #7867F2, #6441BF)",
              }}
              onMouseEnter={(e) => {
                if (!isLoading)
                  (e.target as HTMLButtonElement).style.background =
                    "linear-gradient(135deg, #6441BF, #7867F2)";
              }}
              onMouseLeave={(e) => {
                if (!isLoading)
                  (e.target as HTMLButtonElement).style.background =
                    "linear-gradient(135deg, #7867F2, #6441BF)";
              }}
            >
              {isLoading ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
