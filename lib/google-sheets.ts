import { google } from "googleapis";

const SPREADSHEET_ID = "19YtiW2t80RkgHYRendsfvtYfl_2FDvHXRj2gPZ1BUqQ";

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export function getSheets() {
  const auth = getAuth();
  return {
    sheets: google.sheets({ version: "v4", auth }),
    spreadsheetId: SPREADSHEET_ID,
  };
}
