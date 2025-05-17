# Monitor de Tokens en Abstract

Este proyecto permite monitorear la creación de nuevos tokens en la red blockchain de Abstract y enviar notificaciones a un canal de Telegram cuando se detecta un token nuevo.

## ¿Qué hace este proyecto?

- 📡 Monitorea en tiempo real la blockchain de Abstract
- 🔍 Detecta cuando se crea un nuevo token
- 📊 Obtiene información del token (nombre, símbolo, supply)
- 📱 Envía notificaciones a un canal de Telegram

## Requisitos previos

Para utilizar este proyecto no necesitas saber programar, pero deberás tener instalado:

1. [Node.js](https://nodejs.org/) (versión 14 o superior)
2. Un editor de texto simple (como Notepad, Bloc de notas, o [Visual Studio Code](https://code.visualstudio.com/))
3. Un bot de Telegram (instrucciones más abajo)

## Paso 1: Configuración inicial

1. Descarga este proyecto a tu computadora
2. Abre una ventana de terminal o línea de comandos:
   - En Windows: Busca "cmd" o "PowerShell" en el menú de inicio
   - En Mac: Abre la aplicación "Terminal"
   - En Linux: Abre la terminal
3. Navega hasta la carpeta del proyecto usando el comando `cd` seguido de la ruta donde descargaste el proyecto
4. Instala las dependencias necesarias con:
   ```
   npm install
   ```

## Paso 2: Crear un bot de Telegram

1. Abre Telegram y busca a `@BotFather`
2. Inicia una conversación y escribe `/newbot`
3. Sigue las instrucciones para crear un bot:
   - Dale un nombre a tu bot
   - Dale un nombre de usuario (debe terminar en "bot")
4. `@BotFather` te dará un token que se ve así: `123456789:ABCdefGhIJKlmnOPQRstUVwxYZ`
5. Guarda este token, lo necesitarás más adelante

## Paso 3: Crear un canal de Telegram

1. En Telegram, crea un nuevo canal (toca en el ícono de lápiz y selecciona "Nuevo canal")
2. Dale un nombre y descripción a tu canal
3. Añade tu bot como administrador del canal
4. Para obtener el ID del canal:
   - Envía un mensaje al canal
   - Visita https://api.telegram.org/botTU_TOKEN/getUpdates 
   - Reemplaza "TU_TOKEN" con el token que obtuviste del BotFather
   - Busca en la respuesta JSON un valor `"chat":{"id":-1001234567890}` 
   - El número (incluyendo el signo negativo) es el ID de tu canal

## Paso 4: Configurar variables de entorno

1. En la carpeta del proyecto, crea un archivo llamado `.env` (con el punto al inicio)
2. Abre el archivo con un editor de texto y añade las siguientes líneas:

```
ABSTRACT_RPC_URL=https://api.mainnet.abs.xyz
ABSTRACT_CONTRACT_DEPLOYER=0x0000000000000000000000000000000000008006
TELEGRAM_BOT_TOKEN=TU_TOKEN_DEL_BOT
TELEGRAM_CHANNEL_ID=TU_ID_DEL_CANAL
```

3. Reemplaza:
   - `TU_TOKEN_DEL_BOT` con el token que obtuviste de BotFather
   - `TU_ID_DEL_CANAL` con el ID del canal que encontraste en el paso anterior

## Paso 5: Ejecutar el monitor

1. En la terminal o línea de comandos, asegúrate de estar en la carpeta del proyecto
2. Ejecuta el siguiente comando:
   ```
   node token_monitor.js
   ```
3. Deberías ver un mensaje que dice: "Monitoreando nuevos tokens en Abstract..."
4. Deja esta ventana abierta mientras quieras que el monitor siga funcionando

## Preguntas frecuentes

### ¿Puedo ejecutar esto en segundo plano?

Sí, puedes usar herramientas como [PM2](https://pm2.keymetrics.io/) para ejecutar el script en segundo plano:

1. Instala PM2: `npm install -g pm2`
2. Inicia el monitor: `pm2 start token_monitor.js`
3. Para detenerlo: `pm2 stop token_monitor.js`

### ¿Qué es Abstract?

Abstract es una red blockchain basada en Arbitrum, especializada en el desarrollo y despliegue de tokens y contratos inteligentes.

### ¿Cómo puedo saber si está funcionando?

El script mostrará mensajes en la terminal cuando esté monitoreando bloques. Cuando detecte un nuevo token, enviará un mensaje a tu canal de Telegram.

### ¿Consume mucha internet o recursos?

El script hace solicitudes a la red de Abstract cada vez que se crea un nuevo bloque, pero el consumo de recursos es bajo y no debería afectar significativamente tu conexión a internet o el rendimiento de tu computadora.

## Solución de problemas

### El script muestra errores al iniciarse

Asegúrate de:
- Haber instalado correctamente las dependencias con `npm install`
- Tener el archivo `.env` configurado correctamente
- Tener conexión a internet

### No recibo mensajes en Telegram

Verifica que:
- El bot esté añadido como administrador del canal
- El ID del canal en `.env` sea correcto (debe incluir el signo negativo)
- El token del bot en `.env` sea correcto

### Aparece un error de "missing r"

Este es un error conocido con algunas transacciones de la red. El script está diseñado para manejar este error y continuar monitoreando.

## Personalización

Si quieres personalizar el mensaje de Telegram, puedes editar la sección correspondiente en el archivo `token_monitor.js` (líneas 140-145 aproximadamente).


Si necesitas ayuda, puedes abrir un issue en la página del proyecto o contactar al desarrollador.

---

Desarrollado para monitorear tokens en la red Abstract. 