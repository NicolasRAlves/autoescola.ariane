/* =====================================================================
   Otimiza as fotos do site (gera WebP + JPG em 2 tamanhos)

   Onde colocar as fotos ANTES de rodar (fora da pasta site, para os
   originais pesados não irem para a hospedagem):

     site-auto-escola-ariane/fotos-para-o-site/
       aprovados/moto/   -> fotos de aprovados da categoria A
       aprovados/carro/  -> fotos de aprovados da categoria B
       fotos/            -> fachada, frota, aula, equipe (nome livre)
       videos/           -> Reels em .mp4 (opcional)

   Como rodar (dentro de site/scripts):
     npm install          (só na primeira vez)
     npm run imagens

   O que acontece:
   - aprovados  -> assets/img/aprovados/<id>-600.(webp|jpg) e <id>-1080.(webp|jpg)
                   e o arquivo data/aprovados.js é reescrito com a lista
   - fotos      -> assets/img/fotos/<nome>-800.webp, -1600.webp e -1600.jpg
                   (depois coloque o <nome> em data/config.js > fotos)
   - videos     -> copiados para assets/video + poster .jpg (precisa do ffmpeg)

   Os originais em fotos-para-o-site e em fotos-cliente NUNCA são alterados.
   ===================================================================== */
import { readdirSync, existsSync, mkdirSync, readFileSync, writeFileSync, statSync, copyFileSync } from "node:fs";
import { join, parse, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import vm from "node:vm";
import sharp from "sharp";

const AQUI = dirname(fileURLToPath(import.meta.url));
const SITE = join(AQUI, "..");
const ENTRADA = process.argv[2] || join(SITE, "..", "fotos-para-o-site");
const SAIDA_APROV = join(SITE, "assets", "img", "aprovados");
const SAIDA_FOTOS = join(SITE, "assets", "img", "fotos");
const SAIDA_VIDEO = join(SITE, "assets", "video");
const LISTA = join(SITE, "data", "aprovados.js");
const EXT = /\.(jpe?g|png|webp|avif|tiff?)$/i;

function slug(nome) {
  return nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "foto";
}
function arquivos(pasta, re = EXT) {
  if (!existsSync(pasta)) return [];
  return readdirSync(pasta).filter((f) => re.test(f)).map((f) => join(pasta, f));
}
function lerListaAtual() {
  if (!existsSync(LISTA)) return [];
  try {
    const ctx = { window: {} };
    vm.runInNewContext(readFileSync(LISTA, "utf8"), ctx);
    return ctx.window.ARIANE_APROVADOS || [];
  } catch { return []; }
}
const kb = (p) => (statSync(p).size / 1024).toFixed(0) + " KB";

async function gerar(origem, destinoBase, larguras) {
  const img = sharp(origem, { failOn: "none" }).rotate(); // respeita a orientação do celular
  const meta = await img.metadata();
  const saidas = {};
  for (const w of larguras) {
    const pipeline = sharp(origem, { failOn: "none" }).rotate().resize({ width: w, withoutEnlargement: true });
    const webp = `${destinoBase}-${w}.webp`;
    const jpg = `${destinoBase}-${w}.jpg`;
    const info = await pipeline.clone().webp({ quality: 78 }).toFile(webp);
    await pipeline.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(jpg);
    saidas[w] = { w: info.width, h: info.height, webp, jpg };
  }
  return { meta, saidas };
}

async function aprovados() {
  mkdirSync(SAIDA_APROV, { recursive: true });
  const atual = new Map(lerListaAtual().map((f) => [f.id, f]));
  const lista = [];
  for (const [sub, cat] of [["moto", "A"], ["carro", "B"]]) {
    const fotos = arquivos(join(ENTRADA, "aprovados", sub));
    for (const origem of fotos) {
      const id = `${cat.toLowerCase()}-${slug(parse(origem).name)}`;
      const { saidas } = await gerar(origem, join(SAIDA_APROV, id), [600, 1080]);
      const g = saidas[1080];
      const anterior = atual.get(id) || {};
      lista.push({ id, categoria: cat, w: g.w, h: g.h, ...(anterior.alt ? { alt: anterior.alt } : {}) });
      console.log(`  aprovado ${cat}  ${parse(origem).base}  ->  ${id}  (${kb(saidas[600].webp)} / ${kb(g.webp)})`);
    }
  }
  /* mais recentes primeiro, se o nome começar com data (2026-10-27-...) */
  lista.sort((a, b) => b.id.slice(2).localeCompare(a.id.slice(2)));
  const linhas = lista.map((f) => "  " + JSON.stringify(f)).join(",\n");
  const cabecalho = readFileSync(LISTA, "utf8").split("window.ARIANE_APROVADOS")[0];
  writeFileSync(LISTA, `${cabecalho}window.ARIANE_APROVADOS = [\n${linhas}\n];\n`, "utf8");
  console.log(`\n${lista.length} fotos de aprovados em data/aprovados.js`);
}

async function fotos() {
  mkdirSync(SAIDA_FOTOS, { recursive: true });
  const lista = arquivos(join(ENTRADA, "fotos"));
  for (const origem of lista) {
    const nome = slug(parse(origem).name);
    const { saidas } = await gerar(origem, join(SAIDA_FOTOS, nome), [800, 1600]);
    console.log(`  foto  ${parse(origem).base}  ->  "${nome}"  (${kb(saidas[1600].webp)})`);
  }
  if (lista.length) console.log(`\nColoque os nomes acima em data/config.js > fotos (ex.: fachada: "fachada").`);
}

function videos() {
  const lista = arquivos(join(ENTRADA, "videos"), /\.(mp4|mov|m4v)$/i);
  if (!lista.length) return;
  mkdirSync(SAIDA_VIDEO, { recursive: true });
  for (const origem of lista) {
    const nome = slug(parse(origem).name);
    const mb = statSync(origem).size / 1048576;
    const destino = join(SAIDA_VIDEO, nome + parse(origem).ext.toLowerCase());
    copyFileSync(origem, destino);
    try {
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", "1", "-i", origem, "-frames:v", "1", "-q:v", "4", join(SAIDA_VIDEO, nome + ".jpg")]);
    } catch { console.log("  (ffmpeg não encontrado: crie o poster .jpg à mão)"); }
    console.log(`  vídeo ${parse(origem).base}  ->  ${nome}  (${mb.toFixed(1)} MB)${mb > 8 ? "  ATENÇÃO: acima de 8 MB, vale recomprimir" : ""}`);
  }
  console.log(`\nAdicione cada vídeo em data/config.js > videos.`);
}

console.log(`Lendo fotos de: ${ENTRADA}\n`);
await aprovados();
await fotos();
videos();
console.log("\nPronto.");
