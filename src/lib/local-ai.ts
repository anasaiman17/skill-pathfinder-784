import { allCatalogSkills } from "@/lib/career-catalog"

// Offline analysis engine. Runs entirely in the browser: no API keys, no network calls.
export type DetectedSkill = { name: string; level: "Beginner" | "Intermediate" | "Advanced" | "Expert"; evidence: string; mentions: number }
export type ResumeInsight = {
  summary: string
  detectedSkills: DetectedSkill[]
  yearsExperience: number | null
  seniority: "Entry" | "Mid" | "Senior"
  sections: string[]
}

const extraAliases: Record<string, string> = {
  js: "JavaScript", ts: "TypeScript", k8s: "Kubernetes", ml: "Machine Learning", ai: "Artificial Intelligence",
  gcp: "Google Cloud", "node js": "Node.js", nodejs: "Node.js", postgres: "PostgreSQL", "ms sql": "SQL Server",
}

function escape(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function countMentions(haystack: string, term: string) {
  const pattern = new RegExp(`(?<![A-Za-z0-9+#.])${escape(term.toLowerCase())}(?![A-Za-z0-9+#])`, "g")
  return (haystack.match(pattern) ?? []).length
}

function levelFor(term: string, text: string, mentions: number): DetectedSkill["level"] {
  const window = new RegExp(`.{0,80}${escape(term.toLowerCase())}.{0,80}`, "g")
  const context = (text.match(window) ?? []).join(" ")
  const years = Number(context.match(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)/)?.[1] ?? 0)
  if (/expert|architect|lead|principal|\b(?:[6-9]|1\d)\s*\+?\s*(?:years?|yrs?)/.test(context) || years >= 6) return "Expert"
  if (/advanced|senior|extensive|4\s*\+?\s*years?|5\s*\+?\s*years?/.test(context) || years >= 4 || mentions >= 4) return "Advanced"
  if (/basic|beginner|familiar|exposure|learning|coursework/.test(context)) return "Beginner"
  if (mentions >= 2 || years >= 1) return "Intermediate"
  return "Beginner"
}

export function analyzeResume(rawText: string): ResumeInsight {
  const text = rawText.toLowerCase().replace(/\s+/g, " ")
  const vocabulary = new Map<string, string>()
  for (const skill of allCatalogSkills) vocabulary.set(skill.toLowerCase(), skill)
  for (const [alias, canonical] of Object.entries(extraAliases)) vocabulary.set(alias, canonical)

  const found = new Map<string, DetectedSkill>()
  for (const [term, canonical] of vocabulary) {
    const mentions = countMentions(text, term)
    if (!mentions) continue
    const level = levelFor(term, text, mentions)
    const existing = found.get(canonical)
    if (existing && existing.mentions >= mentions) continue
    found.set(canonical, { name: canonical, level, evidence: term, mentions })
  }

  const yearMatches = Array.from(rawText.matchAll(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:professional\s*|industry\s*|hands-on\s*)?experience/gi))
    .map((match) => Number(match[1]))
    .filter((value) => value > 0 && value < 45)
  const yearsExperience = yearMatches.length ? Math.max(...yearMatches) : null
  const seniority = yearsExperience === null ? (/senior|lead|architect/.test(text) ? "Senior" : "Entry") : yearsExperience >= 7 ? "Senior" : yearsExperience >= 3 ? "Mid" : "Entry"

  const sectionWords = ["summary", "objective", "education", "experience", "projects", "skills", "certifications", "achievements"]
  const sections = sectionWords.filter((word) => new RegExp(`(^|\\n)\\s*${word}\\b`, "i").test(rawText))

  const detectedSkills = Array.from(found.values()).sort((a, b) => b.mentions - a.mentions)
  const top = detectedSkills.slice(0, 5).map((skill) => skill.name).join(", ")
  const summary = detectedSkills.length
    ? `Found ${detectedSkills.length} skills${top ? ` — strongest signals: ${top}` : ""}. Profile reads as ${seniority.toLowerCase()} level${yearsExperience ? ` with about ${yearsExperience} years of experience` : ""}.`
    : "No recognisable technical skills were found in this document."

  return { summary, detectedSkills, yearsExperience, seniority, sections }
}
