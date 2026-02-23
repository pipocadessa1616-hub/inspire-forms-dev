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
      range: "app!A2:F", // A partir da linha 2 (assumindo linha 1 é header)
    });

    const rows = response.data.values ?? [];

    const dados = rows.map((row, index) => ({
      rowIndex: index + 2, // Adiciona o índice da linha (baseado em 1, +1 do header)
      data: row[0],
      unidade: row[1],
      inadimplentes: row[2],
      plano: row[3],
      wellhub: row[4],
      totalpass: row[5],
    }));

    return NextResponse.json(dados);
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Inserir novos dados
export async function POST(request: Request) {
  try {
    const { date, unidade, inadimplentes, plano, wellhub, totalpass } =
      await request.json();

    const { sheets, spreadsheetId } = getSheets();

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
      range: "app!A2:F",
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

    // ✅ CORREÇÃO 2: Escrever tudo em UMA ÚNICA requisição
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `app!A${nextRow}:F${nextRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          dateStr,
          String(unidade),
          Number(inadimplentes),
          Number(plano),
          Number(wellhub),
          Number(totalpass),
        ]],
      },
    });

    return NextResponse.json({ success: true, row: nextRow });
  } catch (error) {
    console.error("Erro ao salvar na planilha:", error);
    return NextResponse.json(
      { error: "Erro ao salvar dados na planilha" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar dados existentes
export async function PUT(request: Request) {
  try {
    const { rowIndex, date, unidade, inadimplentes, plano, wellhub, totalpass } =
      await request.json();

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
      range: `app!A${rowIndex}:F${rowIndex}`,
    });

    if (!existing.data.values || existing.data.values.length === 0) {
      return NextResponse.json(
        { error: "Registro não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar a linha específica (Colunas A até F)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `app!A${rowIndex}:F${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            formattedDate,
            String(unidade),
            Number(inadimplentes),
            Number(plano),
            Number(wellhub),
            Number(totalpass),
          ],
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar dados:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar dados na planilha" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir uma linha da planilha de Alunos por Plano
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
      range: `app!A${rowIndex}:F${rowIndex}`,
    });

    if (!existing.data.values || existing.data.values.length === 0) {
      return NextResponse.json(
        { error: "Registro não encontrado" },
        { status: 404 }
      );
    }

    // Busca o ID da aba "app"
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === "app");
    const sheetId = sheet?.properties?.sheetId;

    if (sheetId === undefined) {
      return NextResponse.json({ error: "Aba 'app' não encontrada" }, { status: 404 });
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
                startIndex: rowIndex - 1,
                endIndex: rowIndex,
              },
            },
          },
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir dado da planilha app:", error);
    return NextResponse.json(
      { error: "Erro ao excluir dado na planilha" },
      { status: 500 }
    );
  }
}