import vader from "vader-sentiment";

export function vaderScore(text) {
  try {
    return vader.SentimentIntensityAnalyzer.polarity_scores(text || "").compound;
  } catch {
    return 0;
  }
}

export function labelFromCompound(compound) {
  if (compound >= 0.3) return "positive";
  if (compound <= -0.3) return "negative";
  return "neutral";
}

export const isStrongPositive = (score) => score >= 0.6;





