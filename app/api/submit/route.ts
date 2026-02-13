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

    // Buscar dados existentes na coluna C para achar a próxima linha vazia
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "app!C:C",
    });

    const nextRow = (existing.data.values?.length ?? 0) + 1;

    let dateStr;
    if (date) {
      const [year, month, day] = date.split("-");
      dateStr = `${day}/${month}/${year}`;
    } else {
      const today = new Date();
      dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;
    }

    // Escrever nas colunas A e B (data e unidade)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `app!A${nextRow}:B${nextRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[dateStr, String(unidade)]],
      },
    });

    // Escrever nas colunas C, D, E, F (inadimplentes, plano, wellhub, totalpass)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `app!C${nextRow}:F${nextRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            Number(inadimplentes),
            Number(plano),
            Number(wellhub),
            Number(totalpass),
          ],
        ],
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
