"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #AAACDF 0%, #7867F2 50%, #6441BF 100%)",
      }}
    >
      <main className="w-full max-w-md text-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 relative">
          <Image
            src="/inspire-logo-transparente.png"
            alt="Inspire"
            width={80}
            height={80}
            className="absolute top-4 right-4 md:top-6 md:right-6"
          />
          <div className="mb-8">
            <h1
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{ color: "#6441BF" }}
            >
              Inspire Forms
            </h1>
            <p className="text-lg font-semibold" style={{ color: "#7867F2" }}>
              COMERCIAL
            </p>
            <div
              className="mx-auto w-20 h-1 rounded-full my-3"
              style={{ background: "linear-gradient(90deg, #5CD1FB, #7867F2)" }}
            />
            <p className="text-gray-600 text-sm">
              Selecione o formulário que deseja preencher.
            </p>
          </div>

          <div className="space-y-3">
            {/* Botão Dados Diários */}
            <Link
              href="/dados-diarios"
              className="group block w-full text-center text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7867F2] relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #7867F2, #6441BF)",
              }}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
              <div className="relative flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                  <line x1="16" x2="16" y1="2" y2="6"/>
                  <line x1="8" x2="8" y1="2" y2="6"/>
                  <line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
                <span>Dados Diários</span>
              </div>
            </Link>

            {/* Botão Alunos por Plano */}
            <Link
              href="/alunos-por-plano"
              className="group block w-full text-center text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7867F2] relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #7867F2, #6441BF)",
              }}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
              <div className="relative flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>Alunos por Plano</span>
              </div>
            </Link>

            {/* Divisor */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-400">ou</span>
              </div>
            </div>

            {/* Botão Histórico/Edição */}
            <Link
              href="/historico-selecao"
              className="group block w-full text-center font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7867F2] border-2 relative overflow-hidden"
              style={{
                borderColor: "#7867F2",
                color: "#7867F2",
              }}
            >
              <div className="absolute inset-0 bg-[#7867F2]/0 group-hover:bg-[#7867F2]/5 transition-all duration-300"></div>
              <div className="relative flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                </svg>
                <span>Histórico / Edição</span>
              </div>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Sistema de Gestão Comercial - Inspire Pilates
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}