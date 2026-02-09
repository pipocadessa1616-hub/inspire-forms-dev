import { NextResponse } from "next/server";
import { getSheets } from "@/lib/google-sheets";

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
