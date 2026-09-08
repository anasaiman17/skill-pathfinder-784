export type ParsedResume = {
  text: string
  name?: string
  email?: string
  phone?: string
  education?: string
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

export async function extractResumeText(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase()
  if (extension === "docx") {
    const mammoth = await import("mammoth/mammoth.browser")
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
    return result.value
  }
  if (extension === "pdf") {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
    const document = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
    const pages: string[] = []
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber)
      const content = await page.getTextContent()
      pages.push(content.items.map((item) => "str" in item ? item.str : "").join(" "))
    }
    return pages.join("\n")
  }
  return await file.text()
}
