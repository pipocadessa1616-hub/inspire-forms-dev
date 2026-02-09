import { NextResponse } from "next/server";
import { getSheets } from "@/lib/google-sheets";

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
      wellhubPresenca,
    } = await request.json();

    const { sheets, spreadsheetId } = getSheets();

    // Buscar dados existentes na coluna C para achar a próxima linha vazia
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Comercial!C:C",
    });

    const nextRow = (existing.data.values?.length ?? 0) + 1;

    // A data vem como "YYYY-MM-DD" do input
    const [year, month, day] = date.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    // Escrever nas colunas A e B (data e unidade)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Comercial!A${nextRow}:B${nextRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[formattedDate, String(unidade)]],
      },
    });

    // Escrever nas colunas C até J (todos os dados numéricos)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Comercial!C${nextRow}:J${nextRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            Number(leadsRecebidos),        // Coluna C
            Number(experimentaisAgendadas), // Coluna D
            Number(aulasRealizadas),        // Coluna E
            Number(vendas),                 // Coluna F
            Number(totalpassAgendamentos),  // Coluna G
            Number(totalpassPresencas),     // Coluna H
            Number(wellhubAgendamentos),    // Coluna I
            Number(wellhubPresenca),        // Coluna J
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
