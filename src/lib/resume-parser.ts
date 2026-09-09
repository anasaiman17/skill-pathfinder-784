export type ParsedResume = {
  text: string
  name: string | undefined
  email: string | undefined
  phone: string | undefined
  education: string | undefined
  certifications: string[]
  jobTitles: string[]
  projects: string[]
}

function firstMatch(text: string, pattern: RegExp) {
  return text.match(pattern)?.[1]?.trim()
}

export function inspectResumeText(text: string): ParsedResume {
  const clean = text.replace(/\s+/g, " ").trim()
  const email = firstMatch(clean, /([\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/)
  const phone = firstMatch(clean, /((?:\+?\d[\d\s().-]{7,}\d))/)
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const name = lines.find((line) => /^[A-Za-z][A-Za-z .'-]{2,48}$/.test(line) && !/resume|curriculum|profile|experience|education/i.test(line))
  const certifications = Array.from(new Set((clean.match(/(?:AWS Certified|Azure Administrator|CompTIA [A-Z+]+|CISSP|ISTQB|PMP|ITIL|Certified [A-Za-z ]+)/gi) ?? [])))
  const jobTitles = Array.from(new Set((clean.match(/(?:software engineer|data analyst|cloud engineer|devops engineer|system administrator|network engineer|product manager|business analyst|cybersecurity analyst|frontend developer|backend developer|full stack developer|machine learning engineer|qa engineer)/gi) ?? [])))
  const projects = lines.filter((line) => /project|built|developed|implemented/i.test(line)).slice(0, 5)
  const education = lines.find((line) => /bachelor|master|degree|university|college|computer science|information technology/i.test(line))
  return { text, name, email, phone, education, certifications, jobTitles, projects }
}

async function readPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
  const workerUrl = (await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url")).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
  const data = new Uint8Array(await file.arrayBuffer())
  const document = await pdfjs.getDocument({ data, isEvalSupported: false, useSystemFonts: true }).promise
  const pages: string[] = []
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber)
    const content = await page.getTextContent()
    let line = ""
    let lastY: number | null = null
    const parts: string[] = []
    for (const item of content.items) {
      if (!("str" in item)) continue
      const y = Array.isArray(item.transform) ? Number(item.transform[5]) : null
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 4) {
        parts.push(line.trim())
        line = ""
      }
      line += item.str + (item.hasEOL ? "\n" : " ")
      lastY = y
    }
    parts.push(line.trim())
    pages.push(parts.filter(Boolean).join("\n"))
  }
  await document.destroy()
  return pages.join("\n")
}

function readLegacyDoc(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let out = ""
  for (let index = 0; index < bytes.length; index += 1) {
    const code = bytes[index] as number
    if (code === 13 || code === 10) out += "\n"
    else if (code >= 32 && code <= 126) out += String.fromCharCode(code)
    else if (code === 0 && bytes[index + 1] !== 0) continue
    else out += " "
  }
  return out
    .replace(/[^\S\n]{2,}/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 1 && /[A-Za-z]{2,}/.test(line))
    .join("\n")
}

export async function extractResumeText(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase()
  if (extension === "docx") {
    const mammoth = await import("mammoth/mammoth.browser")
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
    return result.value
  }
  if (extension === "pdf") return await readPdf(file)
  if (extension === "doc") return readLegacyDoc(await file.arrayBuffer())
  return await file.text()
}
