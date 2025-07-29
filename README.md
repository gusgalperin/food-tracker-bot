# Food Tracker Bot

Este proyecto implementa un bot de Telegram que permite registrar comidas enviando una foto con una descripción breve. El bot guarda la fecha, la hora, el tipo de comida, la descripción y el identificador de la foto en una hoja de cálculo de Google Sheets.

## Requisitos

- Node.js (v18 o superior).
- Una cuenta de servicio de Google con permisos para editar la hoja de cálculo.
- Un bot de Telegram creado con BotFather y su correspondiente token.

## Configuración de Google Sheets

1. Crea una nueva hoja de cálculo en Google Sheets con las columnas `Fecha`, `Hora`, `Tipo`, `Descripción` y `FotoFileId` (en ese orden).
2. Copia el ID de la hoja. El ID es la cadena que aparece en la URL entre `/d/` y `/edit`.
3. Entra en [Google Cloud Console](https://console.cloud.google.com/) y crea un proyecto nuevo.
4. Habilita la API de Google Sheets para ese proyecto.
5. Crea una **cuenta de servicio** y descarga el archivo JSON de credenciales. Renombra el archivo a `credentials.json` (o cualquier nombre que prefieras) y coloca el archivo en la raíz del proyecto (`food-tracker-bot/`).
6. Comparte la hoja de cálculo con el correo de la cuenta de servicio, dándole permisos de **Editor**.

## Variables de entorno

Antes de ejecutar el bot, define las siguientes variables de entorno:

```
TELEGRAM_BOT_TOKEN=tu_token_de_bot
SPREADSHEET_ID=el_id_de_tu_hoja
GOOGLE_APPLICATION_CREDENTIALS=ruta/al/archivo/credentials.json
```

Puedes crear un archivo `.env` o exportarlas en tu terminal antes de ejecutar `node index.js`. Asegúrate de no compartir estos valores públicamente.

## Instalación y ejecución

1. Instala las dependencias:

```
npm install
```

2. Inicia el bot:

```
npm start
```

El bot comenzará a escuchar mensajes entrantes.

## Uso

Envía una foto a tu bot con una descripción en el siguiente formato:

```
<tipo_de_comida> <descripción>
```

Dónde `tipo_de_comida` debe ser una de las siguientes palabras (no importa mayúsculas/minúsculas):

- `desayuno`
- `almuerzo`
- `cena`

Ejemplo:

```
almuerzo Ensalada de pollo con aguacate
```

El bot registrará la fecha y hora de recepción en la zona horaria `America/Argentina/Buenos_Aires`. El resto de la descripción se guardará tal cual. El identificador de la foto de Telegram (`file_id`) se almacena en la quinta columna para poder recuperarla más adelante mediante la API de Telegram.

Si no se reconoce el tipo de comida, el bot lo registrará como `otro`.

## Licencia

Este proyecto está disponible bajo la licencia MIT.