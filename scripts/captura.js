// Captura un estado de la app con Playwright, para compararlo con su wireframe.
//
// Uso:
//   npm run captura -- <spec> <estado> [opciones] [pasos...]
//
// Ejemplo:
//   npm run captura -- 07-completar-mision formulario "clic:Ver misiones" "clic:Completar"
//
// Guarda docs/specs/<spec>/capturas/<estado>-movil.png (390 px) y
// <estado>-escritorio.png (1280 px). La app tiene que estar corriendo (npm run dev).
//
// Opciones:
//   --anchos 390          solo móvil (por defecto: 390,1280)
//   --url <url>           por defecto http://localhost:5173
//
// Pasos, en orden:
//   clic:<texto del botón>          pulsa el primer botón habilitado con ese texto exacto
//   escribir:<etiqueta>=<valor>     escribe en el primer campo con esa etiqueta exacta
//   esperar:<texto>                 espera a que ese texto aparezca en pantalla
//   lento                           desde aquí, las respuestas de Supabase tardan 5 s
//   sin-red                         desde aquí, las llamadas a Supabase fallan

import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const [spec, estado] = args;
if (!spec || !estado || spec.startsWith('--') || estado.startsWith('--')) {
  console.error(
    'Uso: npm run captura -- <spec> <estado> [--anchos 390,1280] [--url URL] [pasos...]',
  );
  process.exit(1);
}

let anchos = [390, 1280];
let url = 'http://localhost:5173';
const pasos = [];
for (let i = 2; i < args.length; i++) {
  if (args[i] === '--anchos') anchos = args[++i].split(',').map(Number);
  else if (args[i] === '--url') url = args[++i];
  else pasos.push(args[i]);
}

const nombreAncho = (ancho) =>
  ancho === 390 ? 'movil' : ancho === 1280 ? 'escritorio' : String(ancho);
const carpeta = path.join('docs', 'specs', spec, 'capturas');
mkdirSync(carpeta, { recursive: true });
const origenApp = new URL(url).origin;
const esDeFuera = (peticion) => new URL(peticion.url()).origin !== origenApp;

function fallar(mensaje) {
  console.error(mensaje);
  process.exit(1);
}

const navegador = await chromium.launch();
try {
  for (const ancho of anchos) {
    const pagina = await navegador.newPage({ viewport: { width: ancho, height: 900 } });
    try {
      await pagina.goto(url, { waitUntil: 'networkidle' });
    } catch {
      fallar(`No pude abrir ${url}. ¿Está corriendo npm run dev?`);
    }

    for (const paso of pasos) {
      const [accion, ...resto] = paso.split(':');
      const valor = resto.join(':');
      try {
        if (accion === 'clic') {
          await pagina
            .getByRole('button', { name: valor, exact: true, disabled: false })
            .first()
            .click({ timeout: 5000 });
        } else if (accion === 'escribir') {
          const [etiqueta, texto = ''] = valor.split('=');
          await pagina.getByLabel(etiqueta, { exact: true }).first().fill(texto, { timeout: 5000 });
        } else if (accion === 'esperar') {
          await pagina.getByText(valor).first().waitFor({ timeout: 10000 });
        } else if (accion === 'lento') {
          await pagina.route('**/*', async (ruta) => {
            if (!esDeFuera(ruta.request())) return ruta.continue();
            await new Promise((r) => setTimeout(r, 5000));
            return ruta.continue().catch(() => {});
          });
        } else if (accion === 'sin-red') {
          await pagina.route('**/*', (ruta) =>
            esDeFuera(ruta.request()) ? ruta.abort() : ruta.continue(),
          );
        } else {
          fallar(`Paso desconocido: «${paso}». Usa clic:, escribir:, esperar:, lento o sin-red.`);
        }
      } catch {
        fallar(
          `No pude ejecutar «${paso}» a ${ancho} px. Revisa que el texto o la etiqueta sean exactamente los que se ven en pantalla.`,
        );
      }
    }

    await pagina.waitForTimeout(300);
    const archivo = path.join(carpeta, `${estado}-${nombreAncho(ancho)}.png`);
    await pagina.screenshot({ path: archivo, fullPage: true });
    console.log(archivo);
    await pagina.close();
  }
} finally {
  await navegador.close();
}