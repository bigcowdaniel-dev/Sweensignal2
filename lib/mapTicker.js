const rules = [
  { t: "AEO", r: /\baeo\b|american eagle|aerie|jeans|denim/i },
  { t: "LEVI", r: /\blevi'?s?\b|denim/i },
  { t: "ULTA", r: /\bulta\b|ulta beauty|makeup|beauty/i },
  { t: "VSCO", r: /victoria'?s secret|victoria secret|\bvsco\b|lingerie|\bpink\b/i },
];

export const mapTicker = (text) => (text && rules.find((x) => x.r.test(text))?.t) || null;





