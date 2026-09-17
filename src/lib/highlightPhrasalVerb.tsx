import { ReactNode } from 'react';

// 例文中の動詞の活用形は不規則動詞が多いため、辞書に無いものは規則活用のルールで生成する。
const IRREGULAR_VERBS: Record<string, string[]> = {
  break: ['break', 'breaks', 'broke', 'broken', 'breaking'],
  bring: ['bring', 'brings', 'brought', 'bringing'],
  catch: ['catch', 'catches', 'caught', 'catching'],
  come: ['come', 'comes', 'came', 'coming'],
  fall: ['fall', 'falls', 'fell', 'fallen', 'falling'],
  find: ['find', 'finds', 'found', 'finding'],
  get: ['get', 'gets', 'got', 'gotten', 'getting'],
  give: ['give', 'gives', 'gave', 'given', 'giving'],
  go: ['go', 'goes', 'went', 'gone', 'going'],
  grow: ['grow', 'grows', 'grew', 'grown', 'growing'],
  hang: ['hang', 'hangs', 'hung', 'hanging'],
  hear: ['hear', 'hears', 'heard', 'hearing'],
  hold: ['hold', 'holds', 'held', 'holding'],
  keep: ['keep', 'keeps', 'kept', 'keeping'],
  leave: ['leave', 'leaves', 'left', 'leaving'],
  let: ['let', 'lets', 'letting'],
  make: ['make', 'makes', 'made', 'making'],
  pay: ['pay', 'pays', 'paid', 'paying'],
  put: ['put', 'puts', 'putting'],
  run: ['run', 'runs', 'ran', 'running'],
  see: ['see', 'sees', 'saw', 'seen', 'seeing'],
  set: ['set', 'sets', 'setting'],
  show: ['show', 'shows', 'showed', 'shown', 'showing'],
  shut: ['shut', 'shuts', 'shutting'],
  sit: ['sit', 'sits', 'sat', 'sitting'],
  sleep: ['sleep', 'sleeps', 'slept', 'sleeping'],
  speak: ['speak', 'speaks', 'spoke', 'spoken', 'speaking'],
  spend: ['spend', 'spends', 'spent', 'spending'],
  stand: ['stand', 'stands', 'stood', 'standing'],
  stick: ['stick', 'sticks', 'stuck', 'sticking'],
  take: ['take', 'takes', 'took', 'taken', 'taking'],
  think: ['think', 'thinks', 'thought', 'thinking'],
  throw: ['throw', 'throws', 'threw', 'thrown', 'throwing'],
  wake: ['wake', 'wakes', 'woke', 'woken', 'waking'],
  wear: ['wear', 'wears', 'wore', 'worn', 'wearing'],
  write: ['write', 'writes', 'wrote', 'written', 'writing'],
};

// drop/step/plan のような「子音+短母音+子音」で終わる短い動詞は、
// -ed/-ing の前で最後の子音を重ねる（drop -> dropped, dropping）。
function hasShortVowelEnding(verb: string): boolean {
  return verb.length <= 5 && /[^aeiou][aeiou][^aeiouwxy]$/.test(verb);
}

function regularVerbForms(verb: string): string[] {
  const forms = new Set<string>([verb]);

  if (/(?:s|x|z|ch|sh)$/.test(verb)) {
    forms.add(`${verb}es`);
  } else if (/[^aeiou]y$/.test(verb)) {
    forms.add(`${verb.slice(0, -1)}ies`);
  } else {
    forms.add(`${verb}s`);
  }

  if (/[^aeiou]y$/.test(verb)) {
    forms.add(`${verb.slice(0, -1)}ied`);
  } else if (/e$/.test(verb)) {
    forms.add(`${verb}d`);
  } else if (hasShortVowelEnding(verb)) {
    forms.add(`${verb}${verb.slice(-1)}ed`);
  } else {
    forms.add(`${verb}ed`);
  }

  if (/e$/.test(verb) && !/ee$/.test(verb)) {
    forms.add(`${verb.slice(0, -1)}ing`);
  } else if (hasShortVowelEnding(verb)) {
    forms.add(`${verb}${verb.slice(-1)}ing`);
  } else {
    forms.add(`${verb}ing`);
  }

  return Array.from(forms);
}

function getVerbForms(verb: string): string[] {
  const lower = verb.toLowerCase();
  return IRREGULAR_VERBS[lower] ?? regularVerbForms(lower);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 例文中の該当する句動詞（動詞の活用形・副詞/前置詞）を太字にして返す。
 * 活用形の推定はベストエフォートであり、100%の精度は保証しない。
 */
export function highlightPhrasalVerb(sentence: string, verb: string, particle: string): ReactNode[] {
  const terms = [...getVerbForms(verb), particle].filter(Boolean).map(escapeRegExp);
  if (terms.length === 0) {
    return [sentence];
  }

  const pattern = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi');
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(sentence)) !== null) {
    if (match.index > lastIndex) {
      parts.push(sentence.slice(lastIndex, match.index));
    }
    parts.push(<strong key={key++}>{match[0]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < sentence.length) {
    parts.push(sentence.slice(lastIndex));
  }

  return parts;
}
