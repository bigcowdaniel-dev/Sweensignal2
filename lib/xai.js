import OpenAI from "openai";

export const XAI_MODEL = process.env.XAI_MODEL || "grok-3-mini";
export const USE_XAI = (process.env.USE_XAI ?? "true").toLowerCase() !== "false";
export const USE_VADER = (process.env.USE_VADER ?? "true").toLowerCase() !== "false";
export const USE_XAI_LIVE_SEARCH = (process.env.USE_XAI_LIVE_SEARCH ?? "false").toLowerCase() === "true";
export const XAI_SEARCH_MODE = process.env.XAI_SEARCH_MODE || "on"; // on|auto|off
export const XAI_MAX_SEARCH_RESULTS = Number(process.env.XAI_MAX_SEARCH_RESULTS || 10);
export const XAI_FROM_DAYS = Number(process.env.XAI_FROM_DAYS || 30);
export const XAI_SOURCES = (process.env.XAI_SOURCES || "web,news")
  .split(",").map((s) => s.trim()).filter(Boolean);

export const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});





