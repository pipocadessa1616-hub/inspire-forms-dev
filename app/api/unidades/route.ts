import { NextResponse } from "next/server";
import { getSheets } from "@/lib/google-sheets";

export async function GET() {
  try {
    const { sheets, spreadsheetId } = getSheets();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Unidades!A2:B",
    });

    const rows = response.data.values ?? [];

    const unidades = rows
      .filter((row) => row[0] != null && row[1] != null)
      .map((row) => ({
        id: String(row[0]),
        nome: String(row[1]),
      }));

    return NextResponse.json(unidades);
  } catch (error) {
    console.error("Erro ao ler unidades:", error);
    return NextResponse.json([], { status: 500 }); // ← MUDOU AQUI
  }
}