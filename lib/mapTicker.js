const rules = [
  { t:"AEO",  r:/\b(aeo|american eagle|aerie|jeans|denim)\b|\$AEO/i },
  { t:"LEVI", r:/\b(levi'?s?)\b|\$LEVI|(?<!american)\bdenim\b/i },
  { t:"ULTA", r:/\b(ulta|ulta beauty|makeup|beauty)\b|\$ULTA/i },
  { t:"VSCO", r:/victoria'?s secret|\bvsco\b|\blingerie\b|\bpink\b|\$VSCO/i },
];
export const mapTicker = (text="") => (rules.find(x=>x.r.test(text))?.t) || null;
