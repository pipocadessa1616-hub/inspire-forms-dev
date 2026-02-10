import { NextResponse } from "next/server";
import { getSheets } from "@/lib/google-sheets";

// GET - Buscar dados existentes (para exibir na página)
export async function GET() {
  try {
    const { sheets, spreadsheetId } = getSheets();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "app!A2:F", // A partir da linha 2 (assumindo linha 1 é header)
    });

    const rows = response.data.values ?? [];

    const dados = rows.map((row) => ({
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

// POST - Inserir novos dados (seu código existente)
export async function POST(request: Request) {
  try {
    const { unidade, inadimplentes, plano, wellhub, totalpass } =
      await request.json();

    const { sheets, spreadsheetId } = getSheets();

    // Buscar dados existentes na coluna C para achar a próxima linha vazia
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "app!C:C",
    });

    const nextRow = (existing.data.values?.length ?? 0) + 1;

    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

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