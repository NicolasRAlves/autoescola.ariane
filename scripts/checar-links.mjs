/* =====================================================================
   Verifica links e arquivos do site.
     npm run links             -> confere todos os arquivos locais
     npm run links -- --externos -> também testa os links externos
   Sai com código 1 se encontrar arquivo local quebrado.
   ===================================================================== */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const externos = process.argv.includes("--externos");

function htmls(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return ["scripts", "node_modules"].includes(e.name) ? [] : htmls(p);
    return e.name.endsWith(".html") ? [p] : [];
  });
}

function existe(alvo) {
  if (!existsSync(alvo)) return false;
  if (statSync(alvo).isDirectory()) return existsSync(join(alvo, "index.html"));
  return true;
}

const quebrados = [];
const ext = new Map();
let total = 0;

for (const arq of htmls(SITE)) {
  const html = readFileSync(arq, "utf8");
  const refs = [];
  for (const m of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) refs.push(m[1]);
  for (const m of html.matchAll(/\ssrcset="([^"]*)"/g)) m[1].split(",").forEach((s) => refs.push(s.trim().split(/\s+/)[0]));
  for (const m of html.matchAll(/url\(([^)]+)\)/g)) refs.push(m[1].replace(/["']/g, ""));
  const ehPagina404 = arq.endsWith(sep + "404.html") && dirname(arq) === SITE;

  for (let r of refs) {
    r = r.replace(/&amp;/g, "&");
    if (!r || r.startsWith("#") || /^(mailto:|tel:|data:|javascript:)/.test(r)) continue;
    if (/^https?:\/\//.test(r)) { if (!ext.has(r)) ext.set(r, relative(SITE, arq)); continue; }
    const limpo = decodeURIComponent(r.split("#")[0].split("?")[0]);
    if (!limpo) continue;
    const alvo = limpo.startsWith("/") ? join(SITE, limpo) : join(dirname(arq), limpo);
    total++;
    if (!existe(alvo)) quebrados.push(`${relative(SITE, arq)}  ->  ${r}`);
  }
  if (ehPagina404) continue;
}

/* arquivos citados dentro dos CSS */
for (const css of ["assets/css/style.css", "assets/fonts/fonts.css"]) {
  const p = join(SITE, css);
  if (!existsSync(p)) { quebrados.push(`(faltando) ${css}`); continue; }
  for (const m of readFileSync(p, "utf8").matchAll(/url\(([^)]+)\)/g)) {
    const r = m[1].replace(/["']/g, "");
    if (r.startsWith("data:") || r.startsWith("http")) continue;
    total++;
    if (!existe(join(dirname(p), r))) quebrados.push(`${css}  ->  ${r}`);
  }
}

console.log(`Arquivos locais conferidos: ${total}`);
if (quebrados.length) {
  console.log(`\nQUEBRADOS (${quebrados.length}):`);
  quebrados.forEach((q) => console.log("  " + q));
} else {
  console.log("Nenhum arquivo local quebrado.");
}

/* o próprio domínio (canonical, og:image) só existe depois de publicar */
const cfg = readFileSync(join(SITE, "data", "config.js"), "utf8");
const dominio = (/siteUrl:\s*"([^"]+)"/.exec(cfg) || [])[1];
if (dominio) {
  const proprios = [...ext.keys()].filter((u) => u.startsWith(dominio));
  proprios.forEach((u) => ext.delete(u));
  console.log(`(${proprios.length} links para ${dominio} ignorados: são do próprio site publicado)`);
}

if (externos) {
  console.log(`\nTestando ${ext.size} links externos...`);
  for (const [url, onde] of ext) {
    try {
      const r = await fetch(url, { method: "GET", redirect: "follow", headers: { "user-agent": "Mozilla/5.0 checar-links" }, signal: AbortSignal.timeout(15000) });
      console.log(`  ${r.ok ? "ok " : r.status}  ${url}${r.ok ? "" : "  (em " + onde + ")"}`);
    } catch (e) {
      console.log(`  ERRO ${url}  (${e.name})`);
    }
  }
} else {
  console.log(`(${ext.size} links externos não testados; use --externos)`);
}

process.exit(quebrados.length ? 1 : 0);
