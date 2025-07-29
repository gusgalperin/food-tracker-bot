require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const { google } = require('googleapis');
const moment = require('moment-timezone');

// Comprobar variables de entorno obligatorias
const {
  TELEGRAM_BOT_TOKEN,
  SPREADSHEET_ID,
  GOOGLE_APPLICATION_CREDENTIALS,
} = process.env;

if (!TELEGRAM_BOT_TOKEN) {
  console.error('Error: falta la variable TELEGRAM_BOT_TOKEN en el entorno.');
  process.exit(1);
}
if (!SPREADSHEET_ID) {
  console.error('Error: falta la variable SPREADSHEET_ID en el entorno.');
  process.exit(1);
}
if (!GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Error: falta la variable GOOGLE_APPLICATION_CREDENTIALS en el entorno.');
  process.exit(1);
}

// Crear instancia del bot de Telegram
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

/**
 * Añade una fila a la hoja de cálculo con los valores proporcionados.
 * @param {Array<string>} values
 */
async function appendRow(values) {
  // Configurar autenticación con Google
  const auth = new google.auth.GoogleAuth({
    keyFile: GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  // Definir el rango (la hoja por defecto se llama "Sheet1"; ajusta si tu hoja tiene otro nombre)
  const range = 'Sheet1!A:E';
  // Añadir la fila
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [values],
    },
  });
}

/**
 * Analiza el caption para obtener el tipo de comida y la descripción.
 * @param {string} caption
 * @returns {{ mealType: string, description: string }}
 */
function parseCaption(caption) {
  if (!caption) {
    return { mealType: 'otro', description: '' };
  }
  const parts = caption.trim().split(/\s+/);
  const rawType = parts.shift() || '';
  const lowered = rawType.toLowerCase();
  let mealType = 'otro';
  if (['desayuno', 'almuerzo', 'cena'].includes(lowered)) {
    mealType = lowered;
  }
  const description = parts.join(' ').trim();
  return { mealType, description };
}

// Escuchar mensajes con foto
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const photos = msg.photo;
  if (!photos || photos.length === 0) {
    bot.sendMessage(chatId, 'Por favor, envía una foto junto con una descripción.');
    return;
  }
  const { mealType, description } = parseCaption(msg.caption);
  const largestPhoto = photos[photos.length - 1];
  const fileId = largestPhoto.file_id;
  // Obtener fecha y hora actuales en la zona horaria de Buenos Aires
  const now = moment().tz('America/Argentina/Buenos_Aires');
  const date = now.format('YYYY-MM-DD');
  const time = now.format('HH:mm:ss');
  const values = [date, time, mealType, description, fileId];
  try {
    await appendRow(values);
    bot.sendMessage(chatId, '¡Comida registrada exitosamente!');
  } catch (error) {
    console.error('Error al escribir en la hoja de cálculo:', error);
    bot.sendMessage(chatId, 'Ocurrió un error al guardar la comida. Inténtalo nuevamente más tarde.');
  }
});

// Informar al usuario si envía un mensaje que no es foto
bot.on('message', (msg) => {
  if (!msg.photo) {
    bot.sendMessage(msg.chat.id, 'Envía una foto con una descripción, por ejemplo:\n`almuerzo Milanesa con puré`', { parse_mode: 'Markdown' });
  }
});