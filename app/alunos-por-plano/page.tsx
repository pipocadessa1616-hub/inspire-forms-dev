"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Unidade {
  id: string;
  nome: string;
}

interface FormData {
  date: string;
  unidade: string;
  inadimplentes: string;
  plano: string;
  wellhub: string;
  totalpass: string;
}

interface FormErrors {
  date?: string;
  unidade?: string;
  inadimplentes?: string;
  plano?: string;
  wellhub?: string;
  totalpass?: string;
}

export default function AlunosPorPlanoPage() {
  const [formData, setFormData] = useState<FormData>({
    date: "",
    unidade: "",
    inadimplentes: "",
    plano: "",
    wellhub: "",
    totalpass: "",
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
    newErrors.inadimplentes = validateNumberField(formData.inadimplentes);
    newErrors.plano = validateNumberField(formData.plano);
    newErrors.wellhub = validateNumberField(formData.wellhub);
    newErrors.totalpass = validateNumberField(formData.totalpass);

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    if (validateForm()) {
      setIsLoading(true);
      try {
        const res = await fetch("/api/submit", {
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
            inadimplentes: "",
            plano: "",
            wellhub: "",
            totalpass: "",
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
    setFormData(prev => ({ ...prev, [field]: value }));
    // Validar campo em tempo real
    const error = validateNumberField(value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setFormData((prev) => ({ ...prev, date: newDate }));

    if (newDate) {
      // Para obter o dia da semana de forma confiável, independente do fuso horário,
      // criamos a data a partir de suas partes.
      const [year, month, day] = newDate.split('-').map(Number);
      // O mês no objeto Date do JavaScript é baseado em zero (0-11), então subtraímos 1.
      const selectedDate = new Date(year, month - 1, day);

      if (selectedDate.getDay() === 0) { // 0 = Domingo
        setErrors((prev) => ({ ...prev, date: "Não é possível selecionar datas de domingo." }));
      } else {
        setErrors((prev) => ({ ...prev, date: undefined }));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #AAACDF 0%, #7867F2 50%, #6441BF 100%)" }}
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: "#6441BF" }}>
              Alunos por Plano
            </h1>
            <div className="mx-auto w-20 h-1 rounded-full mb-3" style={{ background: "linear-gradient(90deg, #5CD1FB, #7867F2)" }} />
            <p style={{ color: "#7867F2" }}>
              Preencha todos os campos com os dados da unidade
            </p>
          </div>

          {isSubmitted && (
            <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: "#5CD1FB20", borderColor: "#5CD1FB" }}>
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
                onChange={handleDateChange}
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
                  setFormData(prev => ({ ...prev, unidade: e.target.value }));
                  if (e.target.value) {
                    setErrors(prev => ({ ...prev, unidade: undefined }));
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
                <p className="mt-1 text-sm text-red-600">
                  {errors.unidade}
                </p>
              )}
            </div>

            {/* INADIMPLENTES */}
            <div>
              <label
                htmlFor="inadimplentes"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#6441BF" }}
              >
                INADIMPLENTES
              </label>
              <input
                type="number"
                id="inadimplentes"
                value={formData.inadimplentes}
                onChange={(e) => handleChange("inadimplentes", e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all text-black outline-none ${
                  errors.inadimplentes
                    ? "border-red-500 bg-red-50"
                    : "border-[#AAACDF] focus:border-[#7867F2]"
                }`}
              />
              {errors.inadimplentes && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.inadimplentes}
                </p>
              )}
            </div>

            {/* PLANO */}
            <div>
              <label
                htmlFor="plano"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#6441BF" }}
              >
                PLANO
              </label>
              <input
                type="number"
                id="plano"
                value={formData.plano}
                onChange={(e) => handleChange("plano", e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all text-black outline-none ${
                  errors.plano ? "border-red-500 bg-red-50" : "border-[#AAACDF] focus:border-[#7867F2]"
                }`}
              />
              {errors.plano && (
                <p className="mt-1 text-sm text-red-600">{errors.plano}</p>
              )}
            </div>

            {/* WELLHUB */}
            <div>
              <label
                htmlFor="wellhub"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#6441BF" }}
              >
                WELLHUB
              </label>
              <input
                type="number"
                id="wellhub"
                value={formData.wellhub}
                onChange={(e) => handleChange("wellhub", e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all text-black outline-none ${
                  errors.wellhub
                    ? "border-red-500 bg-red-50"
                    : "border-[#AAACDF] focus:border-[#7867F2]"
                }`}
              />
              {errors.wellhub && (
                <p className="mt-1 text-sm text-red-600">{errors.wellhub}</p>
              )}
            </div>

            {/* TOTALPASS */}
            <div>
              <label
                htmlFor="totalpass"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#6441BF" }}
              >
                TOTALPASS
              </label>
              <input
                type="number"
                id="totalpass"
                value={formData.totalpass}
                onChange={(e) => handleChange("totalpass", e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all text-black outline-none ${
                  errors.totalpass
                    ? "border-red-500 bg-red-50"
                    : "border-[#AAACDF] focus:border-[#7867F2]"
                }`}
              />
              {errors.totalpass && (
                <p className="mt-1 text-sm text-red-600">{errors.totalpass}</p>
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
                if (!isLoading) (e.target as HTMLButtonElement).style.background = "linear-gradient(135deg, #6441BF, #7867F2)";
              }}
              onMouseLeave={(e) => {
                if (!isLoading) (e.target as HTMLButtonElement).style.background = "linear-gradient(135deg, #7867F2, #6441BF)";
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
