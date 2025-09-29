# ![ChatJR](https://i.imgur.com/Ifpd7Ay.png)

ChatJR es una herramienta de chat y/o widget superpuesto que unifica mensajes y eventos de **Twitch**, **YouTube**, **TikTok**, **Kick**, **Streamlabs**, **StreamElements**, **Patreon**, **TipeeeStream**, **Ko-Fi** y **Fourthwall**.

![ChatJR Config UI](https://i.imgur.com/ezrWaI2.png)

## 🛠️ Configuración

Asegúrate de que tus cuentas de **Twitch**, **YouTube** y **Kick** estén conectadas en **Streamer.bot**. También debes tener instalada la **aplicación de escritorio TikFinity** y tu cuenta en **TikTok** configurada. **AMBAS APLICACIONES DEBEN EJECUTARSE EN EL MISMO ORDENADOR**.

If you have both of these ready, follow these steps:

1. En **Streamer.bot**, importa el archivo [ChatJR.sb](https://github.com/JotaRodriii/chatrd/blob/main/chatrd.sb) a tu **Streamer.bot**.
2. Ve a **Servidor/Clientes → Servidor WebSocket** y asegúrate de que está en funcionamiento.
5. Abre la [página de configuración](https://JotaRodriii.github.io/chatrd) en tu navegador.
6. Elige las opciones que desees.
7. Haz clic en **«Copiar URL»**.
8. Añade la URL copiada como fuente del navegador en OBS. O utilízala en tu navegador para leer el chat. 😊
9. Para **Streamlabs**, **StreamElements**, **Patreon**, **TipeeeStream**, **Ko-Fi** y **Fourthwall**, debes conectarlos a tu cuenta de Streamer.Bot en su sitio web. Sigue los enlaces del tutorial en cada sección que se presenta en la [página de configuración](https://JotaRodriii.github.io/chatrd).

---

## 🔊 Configuración de TTS con Speaker.Bot

1. Vaya a **Configuración → Servidor WebSocket** y haga clic en *Iniciar servidor*. Asegúrese de marcar también la casilla *Inicio automático*.
2. Copie la IP y el puerto en los campos de ChatRD Speaker.bot.
3. Vaya a **Configuración → Motor de voz** y añada el servicio TTS que prefiera. (Sapi5 es el predeterminado de Windows).
4. Vaya a **Configuración → Alias de voz**, asígnele un nombre y haga clic en **Añadir** justo al lado.
5. En la columna izquierda, haga clic en el **SpeakerBot** que acaba de añadir y, en la sección **¡Hablar!**, seleccione la voz que desea utilizar y haga clic en **Añadir**. (Si utiliza Sapi5, le recomiendo utilizar *Microsoft Zira Desktop* como voz).
6. Añada el nombre del alias en el campo *Alias de voz* de ChatRD.

---

## 💬 Enviar mensajes a TikTok
Para enviar mensajes a **TikTok** utilizando el *campo de chat*, debes hacer lo siguiente en **TikFinity**:

1. Asegúrate de que estás conectado a tu cuenta de TikTok en **TikFinity**. Si no es así, ve a **Configuración → Inicio de sesión en TikTok** y haz clic en *Iniciar sesión en TikTok*.
2. Ve a **Configuración → Conexión Streamer.Bot** y escribe la IP y el PUERTO que estás utilizando en tu **Streamer.Bot** y, a continuación, haz clic en *Probar conexión*.

![Configuración de TikFinity → Conexión Streamer.Bot](https://i.imgur.com/h0QDnNX.png)

3. Ve a **Chatbot → Mensajes de Streamer.Bot** y activa *Permitir que Streamer.Bot envíe mensajes a TikFinity*. 

![Chatbot → Mensajes de Streamer.Bot](https://i.imgur.com/IGQ5xQq.png)

---

## 💻 Comandos compatibles con el campo de chat

**Comandos para Twitch**
- /me (mensaje)
- /clip
- /announce (mensaje)
- /announceblue (mensaje)
- /announcegreen (mensaje)
- /announceorange (mensaje)
- /announcepurple (mensaje)
- /clear
- /slow (duración en segundos)
- /slowoff
- /emoteonly
- /emoteonlyoff
- /subscribers
- /subscribersoff
- /commercial (duración en segundos)
- /timeout (usuario) (duración) (motivo)
- /untimeout (usuario)
- /ban (usuario) (motivo)
- /unban (usuario)
- /mod (usuario)
- /unmod (usuario)
- /vip (usuario)
- /unvip (usuario)
- /shoutout (usuario)
- /raid (usuario)
- /unraid
- /settitle (título de la transmisión)
- /setgame (nombre del juego)

**Comandos para YouTube**
- /yt/title (título de la transmisión)
- /yt/timeout (ID de usuario) (duración en segundos)
- /yt/ban (ID de usuario)

**Comandos para expulsar**
- /kick/title (título de la transmisión)
- /kick/category (título de la categoría de la transmisión)
- /kick/timeout (usuario) (duración en segundos)
- /kick/untimeout (usuario)
- /kick/ban (usuario) (motivo)
- /kick/unban (usuario)

**TikTok**
- Los comandos de TikTok no son compatibles.


---

## ❓ Preguntas frecuentes
**- ¿Puedo utilizarlo para leer mi chat?**
R: Sí, puedes. Puedes abrirlo en tu navegador, utilizarlo como superposición de chat y/o utilizarlo como dock en OBS.

**- ¿Qué pasa con los emoticonos de los miembros de YouTube?**
R: YouTube no expone sus emojis de membresía/socios a Streamer.bot. Tendrías que añadirlos manualmente en la sección «Emoticonos solo para miembros» de ChatRD.

**- ¿Puedo configurar TTS para que solo lea los eventos que yo quiera?**
R: No. ChatRD envía chats, eventos o ambos a Speaker.bot.

**- Los eventos de TikTok ya no funcionan, ¿qué debo hacer?**
R: Asegúrate de que tu TikFinity está conectado a tu cuenta y de que estás en directo.

**- Los eventos Kick no funcionan o tardan demasiado en aparecer, ¿qué debo hacer?**
R: La API de Kick es muy lenta en horas punta. Se ha informado en [Streamer.bot](https://discord.streamer.bot/) Discord (consulte la sección html-css-js) que, en ocasiones, las respuestas pueden tardar hasta 60 segundos en transmitirse. Espero que en el futuro inviertan más dinero en sus servidores.

**- ¿Se pueden añadir otras plataformas de streaming/pago?**
R: ChatRD utiliza Streamer.Bot en el 95 % de todas las iteraciones de la plataforma. *TikFinity* está perfectamente integrado a través de WebSockets. Por lo tanto, si la plataforma tiene alguna integración con Streamer.bot o tiene una API WebSocket decente (no WebHooks), no dudes en sugerirlo. Aparte de eso, no hay planes de añadir más plataformas.

**- ¿Puedo personalizarlo?**
R: Si te refieres a los estilos visuales, puedes añadir los tuyos propios utilizando el campo *Custom CSS* en la ventana Browser Source Properties de OBS. Puedes utilizar las herramientas de desarrollo de tu navegador para inspeccionar los elementos que deseas cambiar. **No proporcionaré asistencia si tienes pensado personalizar códigos que podrían dañar ChatRD**.

---

## ✨ Créditos

Creado con ❤️ por **JotaRodriii**  

🔗 [GitHub](https://github.com/JotaRodriii) • [Twitch](https://twitch.tv/JotaRodriii) • [YouTube](https://youtube.com/@JotaRodriii) • [Kick](https://kick.com/JotaRodriii) • [TikTok](https://tiktok.com/@JotaRodriii) • [Twitter / X](https://twitter.com/JotaRodriii)  