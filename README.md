# RetroHub Web

Emulador retro en el navegador, instalable como app (PWA). Sin servidor: las ROMs y las partidas se guardan en el almacenamiento local del dispositivo.

**Usar:** https://tecladooscuro.github.io/retrohub-web/

## Consolas soportadas

Game Boy · Game Boy Color · Game Boy Advance · NES · SNES · Nintendo 64 · Nintendo DS

## Uso

1. Abre la web (en iPad: Safari → Compartir → «Añadir a pantalla de inicio» para instalarla como app; así el almacenamiento es persistente).
2. Añade la ROM (botón o arrastrar).
3. Pulsa ▶ Jugar. La partida del juego y los estados se guardan localmente.

## Dónde encontrar ROMs

Colección recomendada (Nintendo, bastante completa):
https://r-roms.github.io/Nintendo/nintendo-games

## Técnico

- Emulación: [EmulatorJS](https://emulatorjs.org) 4.2.3 (núcleos RetroArch vía WebAssembly, servidos desde CDN fijado por versión).
- ROMs: IndexedDB del navegador.
- Estados de guardado: slots en IndexedDB por juego.
- Hosting: GitHub Pages (rama `main`, raíz).
