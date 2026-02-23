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

    // A data vem como "YYYY-MM-DD" do input
    const [year, month, day] = date.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    // ✅ CORREÇÃO 1: Verificar se já existe um registro com a mesma data e unidade
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Comercial!A2:J",
    });

    const rows = existing.data.values ?? [];
    const duplicate = rows.find(row => row[0] === formattedDate && row[1] === String(unidade));

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
      range: `Comercial!A${nextRow}:J${nextRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          formattedDate,
          String(unidade),
          Number(leadsRecebidos),
          Number(experimentaisAgendadas),
          Number(aulasRealizadas),
          Number(vendas),
          Number(totalpassAgendamentos),
          Number(totalpassPresencas),
          Number(wellhubAgendamentos),
          Number(wellhubPresenca),
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