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
              Inspire Forms COMERCIAL
            </h1>
            <div
              className="mx-auto w-20 h-1 rounded-full mb-3"
              style={{ background: "linear-gradient(90deg, #5CD1FB, #7867F2)" }}
            />
            <p style={{ color: "#7867F2" }}>
              Selecione o formulário que deseja preencher.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/dados-diarios"
              className="block w-full text-center text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7867F2]"
              style={{
                background: "linear-gradient(135deg, #7867F2, #6441BF)",
              }}
            >
              Dados diários
            </Link>
            <Link
              href="/alunos-por-plano"
              className="block w-full text-center text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7867F2]"
              style={{
                background: "linear-gradient(135deg, #7867F2, #6441BF)",
              }}
            >
              Alunos por plano
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}