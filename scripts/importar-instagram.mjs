/* =====================================================================
   Importa as fotos de aprovados da EXPORTAÇÃO OFICIAL do Instagram
   e separa em moto (A) e carro (B) pela legenda.

   1. A escola pede a cópia dos dados no Instagram:
      Configurações > Central de Contas > Suas informações e permissões >
      Baixar suas informações > Algumas das suas informações > Conteúdo
      (marque "Publicações"), formato JSON, qualidade de mídia "Alta".
   2. O Instagram manda um link por e-mail com um .zip. Extraia o .zip.
   3. Rode (dentro de site/scripts):
        node importar-instagram.mjs "C:\caminho\da\pasta\extraida"
      Opções:
        --max 40          quantas fotos por categoria (padrão 40, as mais recentes)
        --desde 2025-01-01  só posts a partir desta data
   4. Confira as pastas em fotos-para-o-site/ e rode: npm run imagens

   O script só COPIA. Não altera a exportação nem a pasta fotos-cliente.
   Fotos sem legenda clara vão para fotos-para-o-site/revisar/ para
   alguém olhar e mover à mão.
   ===================================================================== */
import { readdirSync, readFileSync, statSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const pasta = args.find((a) => !a.startsWith("--") && !/^\d/.test(a));
const opt = (nome, padrao) => { const i = args.indexOf("--" + nome); return i > -1 ? args[i + 1] : padrao; };
const MAX = parseInt(opt("max", "40"), 10);
const DESDE = opt("desde", null);
const SAIDA = resolve(opt("saida", join(AQUI, "..", "..", "fotos-para-o-site")));

if (!pasta || !existsSync(pasta)) {
  console.log("Uso: node importar-instagram.mjs \"pasta-da-exportacao\" [--max 40] [--desde 2025-01-01]");
  process.exit(1);
}

/* O JSON do Instagram vem com acentos "quebrados" (UTF-8 lido como Latin-1). */
function consertar(s) {
  if (!s) return "";
  try { const r = Buffer.from(s, "latin1").toString("utf8"); return r.includes("\uFFFD") ? s : r; } catch { return s; }
}
function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

const RE_MOTO = /\b(moto|motos|motocicleta|motoca|categoria a|cat\.? ?a|habilitacao a|cnh a)\b/;
const RE_CARRO = /\b(carro|carros|automovel|categoria b|cat\.? ?b|habilitacao b|cnh b)\b/;
const RE_APROVADO = /aprovad/;

function acharJson(dir, achados = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) acharJson(p, achados);
    else if (/^posts_\d+\.json$/.test(e.name)) achados.push(p);
  }
  return achados;
}

const jsons = acharJson(pasta);
if (!jsons.length) { console.log("Não achei nenhum posts_1.json nessa pasta. Confira se o .zip foi extraído e se o formato é JSON."); process.exit(1); }

const posts = [];
for (const j of jsons) {
  const dados = JSON.parse(readFileSync(j, "utf8"));
  for (const item of Array.isArray(dados) ? dados : []) {
    const midias = item.media || [];
    const legenda = consertar(item.title || (midias[0] && midias[0].title) || "");
    const ts = item.creation_timestamp || (midias[0] && midias[0].creation_timestamp) || 0;
    midias.forEach((m, i) => posts.push({ uri: m.uri, legenda, ts, i }));
  }
}

const cont = { moto: 0, carro: 0, revisar: 0, videos: 0, ignorados: 0 };
const limite = { moto: MAX, carro: MAX };
posts.sort((a, b) => b.ts - a.ts);

for (const p of posts) {
  const data = new Date(p.ts * 1000).toISOString().slice(0, 10);
  if (DESDE && data < DESDE) { cont.ignorados++; continue; }
  const origem = join(pasta, p.uri || "");
  if (!p.uri || !existsSync(origem) || !statSync(origem).isFile()) { cont.ignorados++; continue; }
  const ext = extname(origem).toLowerCase();
  const nome = `${data}-${String(p.ts).slice(-6)}${p.i ? "-" + p.i : ""}${ext}`;
  if ([".mp4", ".mov"].includes(ext)) {
    mkdirSync(join(SAIDA, "videos-instagram"), { recursive: true });
    copyFileSync(origem, join(SAIDA, "videos-instagram", nome)); cont.videos++; continue;
  }
  if (![".jpg", ".jpeg", ".png", ".webp", ".heic"].includes(ext)) { cont.ignorados++; continue; }
  const t = norm(p.legenda);
  const moto = RE_MOTO.test(t), carro = RE_CARRO.test(t), aprovado = RE_APROVADO.test(t);
  let destino = "revisar";
  if (aprovado && moto && !carro) destino = "moto";
  else if (aprovado && carro && !moto) destino = "carro";
  if ((destino === "moto" || destino === "carro") && cont[destino] >= limite[destino]) { cont.ignorados++; continue; }
  if (destino === "revisar" && cont.revisar >= MAX) { cont.ignorados++; continue; }
  const dir = destino === "revisar" ? join(SAIDA, "revisar") : join(SAIDA, "aprovados", destino);
  mkdirSync(dir, { recursive: true });
  copyFileSync(origem, join(dir, nome));
  cont[destino]++;
}

console.log(`Posts lidos: ${posts.length}`);
console.log(`  moto (A):  ${cont.moto}  -> fotos-para-o-site/aprovados/moto`);
console.log(`  carro (B): ${cont.carro}  -> fotos-para-o-site/aprovados/carro`);
console.log(`  revisar:   ${cont.revisar}  -> fotos-para-o-site/revisar (legenda sem "aprovado" ou sem moto/carro)`);
console.log(`  vídeos:    ${cont.videos}  -> fotos-para-o-site/videos-instagram`);
console.log(`  ignorados: ${cont.ignorados} (limite --max, data ou formato)`);
console.log(`\nConfira as pastas (tire fotos de quem não autorizou) e rode: npm run imagens`);
