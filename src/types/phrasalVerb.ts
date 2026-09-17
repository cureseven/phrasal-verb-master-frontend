export interface PhrasalVerbExample {
  sentenceEn: string;
  sentenceJa: string;
}

export interface PhrasalVerb {
  id: string;
  verb: string;
  particle: string;
  meaningJa: string;
  examples: PhrasalVerbExample[];
}
