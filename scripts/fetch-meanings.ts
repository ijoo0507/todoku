/**
 * Fetches English meanings for all JLPT words + common anime vocab from Jisho.
 * Run this LOCALLY (not on Vercel) — Jisho blocks cloud IPs but not home IPs.
 *
 *   npx tsx scripts/fetch-meanings.ts
 *
 * Output: src/data/meanings.json
 * Commit the result — the app uses it as a static lookup, no API calls at runtime.
 * Re-run any time to expand coverage or refresh meanings.
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';

// ── Load .env.local (not needed here but consistent with other scripts) ──
try {
  const env = readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
} catch {}

// ── All words to look up ──
const JLPT_WORDS = [
  // N5
  '食べる','飲む','見る','聞く','話す','読む','書く','行く','来る','帰る',
  '入る','出る','起きる','寝る','買う','売る','持つ','使う','教える','習う',
  '働く','休む','遊ぶ','泳ぐ','走る','乗る','降りる','開ける','閉める','洗う',
  '作る','切る','押す','引く','待つ','会う','知る','分かる','できる','ある',
  'いる','する','なる','思う','言う','見える','聞こえる','始まる','終わる',
  '好き','嫌い','大きい','小さい','新しい','古い','良い','悪い','高い','安い',
  '長い','短い','暑い','寒い','暖かい','涼しい','難しい','易しい','楽しい',
  '悲しい','嬉しい','怖い','忙しい','暇','元気','大丈夫','上手','下手',
  '有名','親切','静か','綺麗',
  '人','子供','大人','男','女','父','母','兄','姉','弟','妹','友達','先生',
  '学生','生徒','名前','家族','学校','家','部屋','日本','国','駅','空港',
  '銀行','病院','郵便局','店','公園','ドア','窓','机','椅子','本','雑誌',
  '新聞','電車','バス','車','飛行機','水','食べ物','ご飯','パン','肉','魚',
  '野菜','果物','コーヒー','お茶','天気','雨','雪','晴れ','春','夏','秋','冬',
  '今日','明日','昨日','今','朝','昼','夜','年','月','日','時','分','秒',
  '言葉','日本語','英語',
  // N4
  '運動する','旅行する','説明する','練習する','準備する','確認する','参加する',
  '連絡する','相談する','報告する','送る','受け取る','借りる','貸す','払う',
  '決める','変える','続ける','止める','増える','減る','困る','心配する',
  '喜ぶ','怒る','泣く','笑う','驚く','急ぐ','疲れる','調べる','比べる',
  '集める','集まる','別れる','迎える','誘う','断る','申し込む','予約する',
  '痛い','熱い','冷たい','甘い','辛い','苦い','美味しい','正しい','大切',
  '必要','十分','同じ','特別','普通','便利','危険','安全','複雑','簡単',
  '仕事','会社','社員','給料','電話','手紙','メール','映画','音楽','スポーツ',
  'ゲーム','料理','洗濯','掃除','買い物','散歩','運転','練習','勉強','試験',
  '合格','失敗','成功','努力','計画','予定','約束','注意',
  '地下鉄','新幹線','バイク','自転車','道','橋','建物','ビル','マンション',
  'アパート','図書館','美術館','博物館','レストラン','コンビニ','スーパー',
  '問題','理由','目的','方法','場所','時間','機会','経験','記憶','感情',
  '意味','意見','考え','気持ち','関係','様子',
  '体','頭','手','足','目','耳','口','鼻','心','病気','薬','医者','看護師',
  '初めて','最近','将来','世界','社会','文化','自然','科学','技術','教育',
  // N3
  '影響','結果','原因','状況','場合','立場','態度','可能性','情報','知識',
  '判断','決定','対策','目標','課題','法律','規則','制度','政策','選挙',
  '政治','経済','産業','農業','工業','商業','輸出','輸入','貿易','競争',
  '協力','交流','交渉','契約','責任','義務','権利','民主','歴史','伝統',
  '文明','芸術','哲学','宗教','信仰','精神','心理','意識','論理','理論',
  '仮説','事実','根拠','証拠','財政','税金','収入','支出','投資','資源',
  'エネルギー','環境','重要','深刻','具体的','抽象的','様々','多様','一般的',
  '独特','自由','平等','正直','誠実','積極的','消極的',
  '解決する','発展する','変化する','増加する','減少する','分析する','研究する',
  '調査する','観察する','発見する','証明する','実現する','達成する','改善する',
  '実施する','導く','支える','乗り越える','取り組む','表す','示す','認める',
  '否定する','批判する','評価する','比較する','選択する','優先する','確保する',
  '維持する','促進する','妨げる',
  // N2
  '概念','抽象','客観的','主観的','論理的','合理的','倫理的','道徳的',
  '革新的','根本的','本質的','矛盾','調和','貢献','損失','利益','均衡',
  '対立','体系','構造','機能','効果','効率','認識','解釈','推測','想像',
  '創造','発想',
];

const ANIME_WORDS = [
  // combat/drama
  '戦う','逃げる','守る','探す','助ける','倒す','諦める','信じる','叫ぶ',
  '願う','輝く','震える','微笑む','叶う','消える','現れる','変わる',
  '壊れる','壊す','繋がる','繋ぐ','進む','戻る','向かう','近づく','離れる',
  '抱える','捨てる','拾う','触れる','見つける','迷う','悩む','苦しむ',
  '傷つく','癒す','救う','裏切る','許す','誓う','祈る','叶える','覚える',
  '忘れる','気づく','感じる','見せる','伝える','呼ぶ','答える','頷く',
  '振り返る','踏み出す','立ち上がる','立ち向かう','手放す','手伝う',
  '失う','得る','与える','奪う','意識する','目指す','頑張る',
  '生き残る','乗り切る','踏ん張る','気にする','大事にする','無理する','無視する',
  '集中する','リラックスする',
  // nouns - emotions/abstract
  '仲間','夢','希望','未来','過去','現在','運命','使命','力','魔法',
  '勇気','愛','愛情','絆','友情','信頼','笑顔','涙','怒り','恐れ',
  '悲しみ','喜び','孤独','後悔','誇り','覚悟','嘘','秘密','真実',
  '奇跡','運','才能','限界','挑戦','冒険','旅','戦い','戦争','平和',
  '正義','悪','敵','味方','仲','魂','命','体力','気力','感謝','尊敬',
  '嫉妬','本当',
  // nouns - nature/poetic
  '空','星','光','影','風','花','海','川','山','森','扉','鍵','翼',
  '声','歌','音','瞳','心臓','胸','指','髪',
  // adjectives
  '眩しい','懐かしい','切ない','温かい','羨ましい','冷たい',
  // adverbs
  'ずっと','きっと','やっと','まだ','もう','もっと','ただ','まるで',
  '少し','全て','全部',
];

const ALL_WORDS = [...new Set([...JLPT_WORDS, ...ANIME_WORDS])];

const OUT_PATH = path.join(process.cwd(), 'src/data/meanings.json');

// Load existing to allow resuming
let existing: Record<string, string> = {};
if (existsSync(OUT_PATH)) {
  try { existing = JSON.parse(readFileSync(OUT_PATH, 'utf8')); } catch {}
}

const todo = ALL_WORDS.filter(w => !(w in existing));
console.log(`Total: ${ALL_WORDS.length} words | Already done: ${ALL_WORDS.length - todo.length} | To fetch: ${todo.length}`);

async function fetchMeaning(word: string): Promise<string | null> {
  const url = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const data = await res.json();
  const results = data?.data ?? [];

  // Try exact match first
  const exact = results.find((e: { japanese?: { word?: string; reading?: string }[] }) =>
    e.japanese?.some((j: { word?: string; reading?: string }) => j.word === word || j.reading === word)
  ) ?? results[0];

  const defs = exact?.senses?.[0]?.english_definitions as string[] | undefined;
  return defs?.length ? defs.slice(0, 3).join(', ') : null;
}

async function main() {
  const results = { ...existing };
  let fetched = 0;
  let notFound = 0;

  for (let i = 0; i < todo.length; i++) {
    const word = todo[i];
    try {
      const meaning = await fetchMeaning(word);
      if (meaning) {
        results[word] = meaning;
        fetched++;
        process.stdout.write(`✓ ${word}: ${meaning}\n`);
      } else {
        notFound++;
        process.stdout.write(`— ${word}: not found\n`);
      }
    } catch (e) {
      process.stdout.write(`✗ ${word}: error (${e})\n`);
    }

    // Save every 20 words in case of crash
    if ((i + 1) % 20 === 0) {
      writeFileSync(OUT_PATH, JSON.stringify(results, null, 2));
      console.log(`\n💾 Saved progress (${i + 1}/${todo.length})\n`);
    }

    // Polite delay — 250ms between requests
    await new Promise(r => setTimeout(r, 250));
  }

  writeFileSync(OUT_PATH, JSON.stringify(results, null, 2));
  console.log(`\n✅ Done! ${fetched} meanings found, ${notFound} not found.`);
  console.log(`📄 Saved to src/data/meanings.json — commit this file.`);
}

main().catch(err => { console.error(err); process.exit(1); });
