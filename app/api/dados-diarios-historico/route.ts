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

    // Formatar data
    let dateStr;
    if (date) {
      const [year, month, day] = date.split("-");
      dateStr = `${day}/${month}/${year}`;
    } else {
      const today = new Date();
      dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;
    }

    // ✅ CORREÇÃO 1: Verificar se já existe um registro com a mesma data e unidade
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Comercial!A2:J",
    });

    const rows = existing.data.values ?? [];
    const duplicate = rows.find(row => row[0] === dateStr && row[1] === String(unidade));

    if (duplicate) {
      return NextResponse.json(
        { error: "Já existe um registro para esta data e unidade" },
        { status: 409 } // 409 = Conflict
      );
    }

    const nextRow = (existing.data.values?.length ?? 0) + 2; // +2 porque começa em A2

    // ✅ CORREÇÃO 2: Escrever todas as colunas de uma vez (A até J)
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

    // ✅ CORREÇÃO 3: Verificar se a linha ainda existe antes de atualizar
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Comercial!A${rowIndex}:J${rowIndex}`,
    });

    if (!existing.data.values || existing.data.values.length === 0) {
      return NextResponse.json(
        { error: "Registro não encontrado" },
        { status: 404 }
      );
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

// DELETE - Excluir uma linha da planilha
export async function DELETE(request: Request) {
  try {
    const { rowIndex } = await request.json();

    if (!rowIndex) {
      return NextResponse.json(
        { error: "O índice da linha (rowIndex) é obrigatório" },
        { status: 400 }
      );
    }

    const { sheets, spreadsheetId } = getSheets();

    // ✅ CORREÇÃO 4: Verificar se a linha existe antes de excluir
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Comercial!A${rowIndex}:J${rowIndex}`,
    });

    if (!existing.data.values || existing.data.values.length === 0) {
      return NextResponse.json(
        { error: "Registro não encontrado" },
        { status: 404 }
      );
    }

    // Primeiro buscamos as informações da planilha para garantir que temos o ID correto da aba "Comercial"
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === "Comercial"); //nome da aba
    const sheetId = sheet?.properties?.sheetId;

    if (sheetId === undefined) {
      return NextResponse.json({ error: "Aba 'Comercial' não encontrada" }, { status: 404 });
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: rowIndex - 1, // Início (inclusivo)
                endIndex: rowIndex,       // Fim (exclusivo)
              },
            },
          },
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir dado da planilha:", error);
    return NextResponse.json(
      { error: "Erro ao excluir dado da planilha" },
      { status: 500 }
    );
  }
}