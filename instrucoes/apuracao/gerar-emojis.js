// Gera assets/emojis-pt.js (tabela de emojis com nomes em português) a partir de dados oficiais do Unicode e do CLDR.
// Uso (raiz do projeto):  node instrucoes/apuracao/gerar-emojis.js
//   (opcional) node ... <emoji-test.txt> <annotations-pt.json>   — usa arquivos já baixados em vez de baixar de novo.
// Regras: só emojis "fully-qualified", versão <= 13.1 (desenham em Windows 10/11 e Android recente), sem tom de pele,
// sem bandeiras de países (Windows mostra letras no lugar), sem o grupo "Component".
const fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const VERSAO_MAX = 13.1;
const URL_TESTE = 'https://unicode.org/Public/emoji/latest/emoji-test.txt';
const URL_PT = 'https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-annotations-full/annotations/pt/annotations.json';

function baixar(url, destino) { execFileSync('curl', ['-sL', '-o', destino, url]); return destino; }
const tmp = os.tmpdir();
const arqTeste = process.argv[2] || baixar(URL_TESTE, path.join(tmp, 'emoji-test.txt'));
const arqPt = process.argv[3] || baixar(URL_PT, path.join(tmp, 'pt-annotations.json'));

const semVS = s => s.replace(/️/g, '');
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const anot = JSON.parse(fs.readFileSync(arqPt, 'utf8')).annotations.annotations;
const anotPorSemVS = {}; for (const k of Object.keys(anot)) anotPorSemVS[semVS(k)] = anot[k];

const GRUPOS = { // grupo do Unicode -> id, nome, ícone da aba
  'Smileys & Emotion': ['rostos', 'Rostos', '😀'], 'People & Body': ['pessoas', 'Pessoas', '🧑'],
  'Animals & Nature': ['animais', 'Animais e natureza', '🐶'], 'Food & Drink': ['comidas', 'Comidas e bebidas', '🍔'],
  'Travel & Places': ['viagens', 'Viagens e lugares', '✈️'], 'Activities': ['atividades', 'Atividades', '⚽'],
  'Objects': ['objetos', 'Objetos', '💡'], 'Symbols': ['simbolos', 'Símbolos', '❤️'], 'Flags': ['simbolos', 'Símbolos', '❤️'],
};
const ordem = ['rostos', 'pessoas', 'animais', 'comidas', 'viagens', 'atividades', 'objetos', 'simbolos'];
const porId = {}; let grupoAtual = null, subAtual = null, total = 0, semNome = 0;

for (const linha of fs.readFileSync(arqTeste, 'utf8').split('\n')) {
  let m;
  if ((m = linha.match(/^# group: (.+)$/))) { grupoAtual = m[1].trim(); continue; }
  if ((m = linha.match(/^# subgroup: (.+)$/))) { subAtual = m[1].trim(); continue; }
  m = linha.match(/^([0-9A-F ]+?)\s*;\s*fully-qualified\s*#\s*(\S+)\s+E(\d+\.\d+)\s+(.+)$/);
  if (!m || !GRUPOS[grupoAtual]) continue;
  const [, cps, emoji, ver, nomeEn] = m;
  if (parseFloat(ver) > VERSAO_MAX) continue;
  if (/1F3F[B-F]/.test(cps)) continue;                                  // tons de pele
  if (grupoAtual === 'Flags' && subAtual !== 'flag') continue;           // só 🏁🚩🏳️..., sem bandeiras de países
  const a = anot[emoji] || anotPorSemVS[semVS(emoji)];
  if (!a) { semNome++; }
  const nome = a ? a.tts[0] : nomeEn;
  const chaves = norm([nome, ...(a ? a.default : [nomeEn])].join(' '));
  const [id, nomeGrupo, ico] = GRUPOS[grupoAtual];
  (porId[id] = porId[id] || { id, nome: nomeGrupo, ico, e: [] }).e.push([emoji, nome, [...new Set(chaves.split(/\s+/))].join(' ')]);
  total++;
}

// Grupo curado: o que mais aparece em planilha de gastos (só entra o que existe na base acima).
const CURADO = '💰 💵 💴 💶 💷 💸 💳 🧾 🏦 🪙 📈 📉 📊 💹 🛒 🛍️ 🏪 🏬 🍔 🍕 🍟 🥗 🍎 🥦 🥩 🥖 🍳 🍝 🍣 🍰 🍫 🍿 ☕ 🍺 🍷 🥤 🏠 🏡 🏢 🏗️ 🛋️ 🛏️ 🚿 🧹 🧺 🔌 💡 🔥 💧 📶 📱 💻 🖥️ 🎧 📺 🎮 📚 🎓 ✏️ 🏫 💊 🩺 🏥 🦷 💇 💅 🧴 👕 👗 👟 👜 🚗 🚕 🚌 🚇 🚲 🛵 ⛽ 🛠️ 🔧 🅿️ ✈️ 🏖️ 🏨 🎁 🎉 🎂 💍 🐶 🐱 🐾 🍼 🧸 🎬 🎵 ⚽ 🏋️ 🌳 💼 🧑‍💻 📦 📎 📋 ✅ ⭐ ❤️ 🏷️'.split(' ');
const todos = {}; for (const g of Object.values(porId)) for (const e of g.e) todos[semVS(e[0])] = e;
const curado = CURADO.map(e => todos[semVS(e)]).filter(Boolean);
const faltaram = CURADO.filter(e => !todos[semVS(e)]);

const grupos = [{ id: 'financas', nome: 'Finanças e casa', ico: '💰', e: curado }, ...ordem.map(id => porId[id]).filter(Boolean)];
const cab = `/* Tabela de emojis com nomes em português. GERADO por instrucoes/apuracao/gerar-emojis.js — não edite à mão.
   Fontes: Unicode emoji-test.txt (emojis até a versão ${VERSAO_MAX}) e CLDR annotations pt. Copyright © Unicode, Inc. Distribuído sob a
   Unicode License v3 (https://www.unicode.org/license.txt). */\n`;
fs.writeFileSync(path.resolve(__dirname, '../../assets/emojis-pt.js'), cab + 'window.EMOJIS=' + JSON.stringify({ grupos }) + ';\n');
console.log('emojis:', total, '| sem nome pt:', semNome, '| curados:', curado.length, '| faltaram no curado:', faltaram.join(' ') || '-');
console.log(grupos.map(g => g.id + '=' + g.e.length).join('  '));
