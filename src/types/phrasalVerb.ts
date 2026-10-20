// 一般向けAPIのレスポンス。meaning / translation は ?lang= で指定した言語のもの。
export interface PhrasalVerbExample {
  sentenceEn: string;
  translation: string;
}

export interface PhrasalVerb {
  id: string;
  verb: string;
  particle: string;
  meaning: string;
  examples: PhrasalVerbExample[];
}
