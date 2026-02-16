import { NextResponse } from "next/server";
import { getSheets } from "@/lib/google-sheets";

// Força a rota a ser dinâmica para garantir que os dados estejam sempre atualizados
export const dynamic = 'force-dynamic';

// GET - Buscar dados existentes
export async function GET() {
  try {
    const { sheets, spreadsheetId } = getSheets();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Comercial!A2:J", // A partir da linha 2 (assumindo linha 1 é header)
    });

    const rows = response.data.values ?? [];

    const dados = rows.map((row, index) => ({
      rowIndex: index + 2, // Adiciona o índice da linha (baseado em 1, +1 do header)
      data: row[0],
      unidade: row[1],
      leadsRecebidos: row[2] || "0",
      experimentaisAgendadas: row[3] || "0",
      aulasRealizadas: row[4] || "0",
      vendas: row[5] || "0",
      totalpassAgendamentos: row[6] || "0",
      totalpassPresencas: row[7] || "0",
      wellhubAgendamentos: row[8] || "0",
      wellhubPresenca: row[9] || "0",
    }));

    return NextResponse.json(dados);
  } catch (error) {
    console.error("Erro ao buscar dados diários:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Inserir novos dados
export async function POST(request: Request) {
  try {
    const { 
      date, 
      unidade, 
      leadsRecebidos, 
      experimentaisAgendadas, 
      aulasRealizadas, 
      vendas,
      totalpassAgendamentos,
      totalpassPresencas,
      wellhubAgendamentos,
      wellhubPresenca
    } = await request.json();

    const { sheets, spreadsheetId } = getSheets();

    // Buscar dados existentes para achar a próxima linha vazia
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Comercial!A:A",
    });

    const nextRow = (existing.data.values?.length ?? 0) + 1;

    // Formatar data
    let dateStr;
    if (date) {
      const [year, month, day] = date.split("-");
      dateStr = `${day}/${month}/${year}`;
    } else {
      const today = new Date();
      dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;
    }

    // Escrever todas as colunas de uma vez (A até J)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Comercial!A${nextRow}:J${nextRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          dateStr,
          String(unidade),
          Number(leadsRecebidos) || 0,
          Number(experimentaisAgendadas) || 0,
          Number(aulasRealizadas) || 0,
          Number(vendas) || 0,
          Number(totalpassAgendamentos) || 0,
          Number(totalpassPresencas) || 0,
          Number(wellhubAgendamentos) || 0,
          Number(wellhubPresenca) || 0,
        ]],
      },
    });

    return NextResponse.json({ success: true, row: nextRow });
  } catch (error) {
    console.error("Erro ao salvar dados diários na planilha:", error);
    return NextResponse.json(
      { error: "Erro ao salvar dados na planilha" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar dados existentes
export async function PUT(request: Request) {
  try {
    const { 
      rowIndex, 
      date, 
      unidade, 
      leadsRecebidos, 
      experimentaisAgendadas, 
      aulasRealizadas, 
      vendas,
      totalpassAgendamentos,
      totalpassPresencas,
      wellhubAgendamentos,
      wellhubPresenca
    } = await request.json();

    if (!rowIndex) {
      return NextResponse.json(
        { error: "Índice da linha é obrigatório" },
        { status: 400 }
      );
    }

    const { sheets, spreadsheetId } = getSheets();

    // Formatar a data para o padrão da planilha (DD/MM/YYYY) se vier no formato ISO (YYYY-MM-DD)
    let formattedDate = date;
    if (date && date.includes("-")) {
      const [year, month, day] = date.split("-");
      formattedDate = `${day}/${month}/${year}`;
    }

    // Atualizar a linha específica (Colunas A até J)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Comercial!A${rowIndex}:J${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          formattedDate,
          String(unidade),
          Number(leadsRecebidos) || 0,
          Number(experimentaisAgendadas) || 0,
          Number(aulasRealizadas) || 0,
          Number(vendas) || 0,
          Number(totalpassAgendamentos) || 0,
          Number(totalpassPresencas) || 0,
          Number(wellhubAgendamentos) || 0,
          Number(wellhubPresenca) || 0,
        ]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar dados diários:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar dados na planilha" },
      { status: 500 }
    );
  }
}