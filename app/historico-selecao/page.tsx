"use client";

import Image from "next/image";
import Link from "next/link";

export default function HistoricoSelecaoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #AAACDF 0%, #7867F2 50%, #6441BF 100%)" }}
    >
      <main className="w-full max-w-3xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 relative">
          
          {/* Botão Voltar */}
          <Link href="/" className="absolute top-4 left-4 md:top-6 md:left-6 text-[#7867F2] hover:text-[#6441BF] transition-colors flex items-center gap-1 group" title="Voltar para o início">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
            <span className="text-sm font-medium hidden md:inline">Voltar</span>
          </Link>

          <Image
            src="/inspire-logo-transparente.png"
            alt="Inspire"
            width={70}
            height={70}
            className="absolute top-4 right-4 md:top-6 md:right-6"
          />

          <div className="mb-10 text-center mt-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "#6441BF" }}>
              Selecione a aba que você deseja
            </h1>
            <div className="mx-auto w-20 h-1 rounded-full mb-3" style={{ background: "linear-gradient(90deg, #5CD1FB, #7867F2)" }} />
            <p className="text-gray-600 text-sm">Escolha o tipo de histórico que deseja visualizar e editar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Alunos por Plano */}
            <Link 
              href="/historico-edicao"
              className="group relative flex flex-col items-center justify-center p-8 md:p-10 rounded-2xl border-2 border-[#AAACDF] hover:border-[#7867F2] bg-white hover:bg-gradient-to-br hover:from-[#F0F1FA] hover:to-white transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl transform hover:scale-[1.02]"
            >
              {/* Ícone */}
              <div className="mb-4 p-4 rounded-full bg-gradient-to-br from-[#7867F2] to-[#6441BF] group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              
              {/* Texto */}
              <span className="text-xl md:text-2xl font-bold text-[#6441BF] group-hover:text-[#7867F2] transition-colors text-center">
                Alunos por Plano
              </span>
              
              {/* Descrição */}
              <p className="mt-2 text-sm text-gray-500 text-center">
                Visualize e edite dados de inadimplentes, planos e benefícios
              </p>

              {/* Indicador de ação */}
              <div className="mt-4 flex items-center gap-1 text-[#7867F2] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Acessar</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14"/>
                  <path d="m12 5 7 7-7 7"/>
                </svg>
              </div>
            </Link>

            {/* Card Dados Diários */}
            <Link 
              href="/historico-dados-diarios"
              className="group relative flex flex-col items-center justify-center p-8 md:p-10 rounded-2xl border-2 border-[#AAACDF] hover:border-[#7867F2] bg-white hover:bg-gradient-to-br hover:from-[#F0F1FA] hover:to-white transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl transform hover:scale-[1.02]"
            >
              {/* Ícone */}
              <div className="mb-4 p-4 rounded-full bg-gradient-to-br from-[#7867F2] to-[#6441BF] group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                  <line x1="16" x2="16" y1="2" y2="6"/>
                  <line x1="8" x2="8" y1="2" y2="6"/>
                  <line x1="3" x2="21" y1="10" y2="10"/>
                  <path d="M8 14h.01"/>
                  <path d="M12 14h.01"/>
                  <path d="M16 14h.01"/>
                  <path d="M8 18h.01"/>
                  <path d="M12 18h.01"/>
                  <path d="M16 18h.01"/>
                </svg>
              </div>
              
              {/* Texto */}
              <span className="text-xl md:text-2xl font-bold text-[#6441BF] group-hover:text-[#7867F2] transition-colors text-center">
                Dados Diários
              </span>
              
              {/* Descrição */}
              <p className="mt-2 text-sm text-gray-500 text-center">
                Visualize e edite leads, vendas, experimentais e agendamentos
              </p>

              {/* Indicador de ação */}
              <div className="mt-4 flex items-center gap-1 text-[#7867F2] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Acessar</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14"/>
                  <path d="m12 5 7 7-7 7"/>
                </svg>
              </div>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              Escolha uma opção para visualizar e editar os registros
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}