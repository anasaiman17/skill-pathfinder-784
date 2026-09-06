import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleCheck,
  Compass,
  FileText,
  Flame,
  GraduationCap,
  Menu,
  Plus,
  Radar,
  RotateCcw,
  Save,
  ShieldCheck,
  Target,
  TrendingUp,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Skillwise — AI Skill Gap Analyzer" },
      { name: "description", content: "Turn your current skills into a clear, local learning roadmap for the career you want." },
      { property: "og:title", content: "Skillwise — AI Skill Gap Analyzer" },
      { property: "og:description", content: "See your skill gap, choose a target role, and follow a focused learning plan saved on your device." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Section = "overview" | "profile" | "analysis" | "roadmap";
type ResourceStatus = "not-started" | "in-progress" | "completed";
type RoleKey = "Data Analyst" | "Data Scientist" | "ML Engineer" | "Software Developer";
type Requirement = { skill: string; level: string; weight: number };

type Profile = {
  name: string;
  email: string;
  currentPosition: string;
  experience: string;
  education: string;
  targetRole: RoleKey;
  skills: string[];
  resumeText: string;
  resumeName: string;
};

type AppState = Profile & { resourceStatuses: Record<string, ResourceStatus> };
type Resource = { id: string; title: string; provider: string; type: string; skill: string; duration: string; accent: "teal" | "amber" | "blue" | "coral" };

const STORAGE_KEY = "skillwise-local-state-v1";

const roleRequirements: Record<RoleKey, Requirement[]> = {
  "Data Analyst": [
    { skill: "SQL", level: "Intermediate", weight: 1.2 },
    { skill: "Excel", level: "Intermediate", weight: 0.8 },
    { skill: "Statistics", level: "Intermediate", weight: 1 },
    { skill: "Python", level: "Beginner", weight: 0.9 },
    { skill: "Tableau", level: "Beginner", weight: 0.8 },
    { skill: "Data storytelling", level: "Intermediate", weight: 0.7 },
  ],
  "Data Scientist": [
    { skill: "Python", level: "Advanced", weight: 1.2 },
    { skill: "Statistics", level: "Advanced", weight: 1.1 },
    { skill: "Machine learning", level: "Intermediate", weight: 1.2 },
    { skill: "SQL", level: "Intermediate", weight: 0.8 },
    { skill: "Pandas", level: "Intermediate", weight: 0.9 },
    { skill: "TensorFlow", level: "Beginner", weight: 0.7 },
  ],
  "ML Engineer": [
    { skill: "Python", level: "Advanced", weight: 1.1 },
    { skill: "Machine learning", level: "Advanced", weight: 1.2 },
    { skill: "Docker", level: "Intermediate", weight: 1 },
    { skill: "TensorFlow", level: "Intermediate", weight: 1 },
    { skill: "SQL", level: "Beginner", weight: 0.6 },
    { skill: "Cloud deployment", level: "Beginner", weight: 0.8 },
  ],
  "Software Developer": [
    { skill: "JavaScript", level: "Intermediate", weight: 1.1 },
    { skill: "React", level: "Intermediate", weight: 1 },
    { skill: "Git", level: "Intermediate", weight: 0.8 },
    { skill: "Testing", level: "Beginner", weight: 0.8 },
    { skill: "APIs", level: "Intermediate", weight: 0.9 },
    { skill: "SQL", level: "Beginner", weight: 0.6 },
  ],
};

const resources: Resource[] = [
  { id: "sql", title: "SQL for Data Analysis", provider: "DataCamp", type: "Course", skill: "SQL", duration: "6 weeks", accent: "teal" },
  { id: "stats", title: "Statistics with Python", provider: "Coursera", type: "Specialization", skill: "Statistics", duration: "8 weeks", accent: "amber" },
  { id: "python", title: "Python Data Science Handbook", provider: "O'Reilly", type: "Book", skill: "Python", duration: "4 weeks", accent: "blue" },
  { id: "tableau", title: "Tableau Desktop Specialist", provider: "Tableau", type: "Certification", skill: "Tableau", duration: "3 weeks", accent: "coral" },
  { id: "ml", title: "Machine Learning Foundations", provider: "Google", type: "Certificate", skill: "Machine learning", duration: "10 weeks", accent: "teal" },
  { id: "react", title: "Meta Front-End Developer", provider: "Meta", type: "Certificate", skill: "React", duration: "12 weeks", accent: "blue" },
  { id: "docker", title: "Docker Foundations", provider: "Docker", type: "Course", skill: "Docker", duration: "2 weeks", accent: "amber" },
  { id: "storytelling", title: "Data Visualization & Storytelling", provider: "LinkedIn Learning", type: "Course", skill: "Data storytelling", duration: "2 weeks", accent: "coral" },
];

const defaultProfile: AppState = {
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  currentPosition: "Marketing coordinator",
  experience: "2 years",
  education: "B.A. Communications",
  targetRole: "Data Analyst",
  skills: ["Excel", "Communication", "Project management"],
  resumeText: "",
  resumeName: "",
  resourceStatuses: {},
};

const skillAliases: Record<string, string> = {
  "python programming": "Python", python: "Python", sql: "SQL", "structured query language": "SQL",
  excel: "Excel", statistics: "Statistics", pandas: "Pandas", tableau: "Tableau", javascript: "JavaScript",
  typescript: "TypeScript", react: "React", git: "Git", docker: "Docker", tensorflow: "TensorFlow",
  "machine learning": "Machine learning", ml: "Machine learning", "data storytelling": "Data storytelling",
  apis: "APIs", testing: "Testing", "cloud deployment": "Cloud deployment", communication: "Communication",
  "project management": "Project management",
};

function normalizeSkill(value: string) {
  return skillAliases[value.trim().toLowerCase()] ?? value.trim();
}

function extractSkills(text: string) {
  const lower = text.toLowerCase();
  return Array.from(new Set(Object.entries(skillAliases).filter(([alias]) => lower.includes(alias)).map(([, skill]) => skill)));
}

function readLocalState(): AppState {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

function Index() {
  const [state, setState] = useState<AppState>(readLocalState);
  const [section, setSection] = useState<Section>("overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [resumeDraft, setResumeDraft] = useState(state.resumeText);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const allSkills = useMemo(() => Array.from(new Set([...state.skills, ...extractSkills(state.resumeText)])), [state.skills, state.resumeText]);
  const requirements = roleRequirements[state.targetRole];
  const analysis = useMemo(() => {
    const current = allSkills.map(normalizeSkill);
    const matches = requirements.filter((requirement) => current.includes(requirement.skill));
    const missing = requirements.filter((requirement) => !current.includes(requirement.skill));
    const total = requirements.reduce((sum, item) => sum + item.weight, 0);
    const matched = matches.reduce((sum, item) => sum + item.weight, 0);
    return { matches, missing, score: Math.round((matched / total) * 100) };
  }, [allSkills, requirements]);
  const recommended = resources.filter((resource) => analysis.missing.some((item) => item.skill === resource.skill));
  const completedCount = Object.values(state.resourceStatuses).filter((status) => status === "completed").length;
  const roadmapResources = [...recommended, ...resources.filter((resource) => !recommended.includes(resource))].slice(0, 5);

  function updateState(patch: Partial<AppState>) {
    setState((current) => ({ ...current, ...patch }));
    setSaved(false);
  }

  function showNotice(message: string, duration = 3000) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), duration);
  }

  function saveProfile() {
    setSaved(true);
    showNotice("Profile saved on this device");
  }

  function handleResume(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      if (text.length > 20 && !file.type.includes("pdf") && !file.name.match(/\.docx?$/i)) {
        setResumeDraft(text);
        updateState({ resumeText: text, resumeName: file.name });
        showNotice(`${file.name} added — skills are ready to review`, 4200);
      } else {
        updateState({ resumeName: file.name });
        showNotice("File saved locally. Paste its text below to extract skills.", 4200);
      }
    };
    reader.readAsText(file);
  }

  function saveResume() {
    const found = extractSkills(resumeDraft);
    updateState({ resumeText: resumeDraft, skills: Array.from(new Set([...state.skills, ...found])) });
    showNotice(found.length ? `${found.length} skill${found.length === 1 ? "" : "s"} added from your resume` : "Resume saved on this device");
  }

  function addSkill() {
    const skill = normalizeSkill(newSkill);
    if (!skill || allSkills.some((item) => item.toLowerCase() === skill.toLowerCase())) return;
    updateState({ skills: [...state.skills, skill] });
    setNewSkill("");
  }

  function toggleResource(id: string, status: ResourceStatus) {
    updateState({ resourceStatuses: { ...state.resourceStatuses, [id]: status } });
  }

  function resetLocalData() {
    setState(defaultProfile);
    setResumeDraft("");
    showNotice("Local workspace reset");
  }

  const navItems: { id: Section; label: string }[] = [
    { id: "overview", label: "Dashboard" },
    { id: "analysis", label: "New assessment" },
    { id: "profile", label: "My profile" },
    { id: "roadmap", label: "Roadmap" },
  ];

  function goTo(nextSection: Section) {
    setSection(nextSection);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative z-20 mx-auto flex w-full max-w-[1240px] items-center justify-between px-5 py-6 md:px-8 lg:py-7">
        <button type="button" className="flex items-center gap-2.5 text-left" onClick={() => goTo("overview")} aria-label="Go to Skillwise dashboard">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-cyan shadow-[4px_4px_0_var(--cyan)]"><Compass className="h-5 w-5" /></span>
          <span className="font-display text-[1.22rem] font-bold tracking-tight text-ink">skill<span className="text-cyan">wise</span></span>
        </button>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-ink/65 md:flex" aria-label="Primary navigation">
          {navItems.slice(0, 2).map((item) => <Button key={item.id} variant="ghost" onClick={() => goTo(item.id)} className={`h-auto p-0 text-ink/65 hover:bg-transparent hover:text-ink ${section === item.id ? "text-ink" : ""}`}>{item.label}</Button>)}
           <Button asChild variant="outline" className="h-9 rounded-lg border-ink/15 bg-transparent px-4 text-ink hover:bg-card"><Link to="/auth">Sign in</Link></Button>
          <Button variant="outline" onClick={() => goTo("profile")} className="h-9 rounded-lg border-ink/15 bg-transparent px-4 text-ink hover:bg-card">Open profile</Button>
        </nav>
        <Button aria-label="Open navigation" variant="ghost" size="icon" className="text-ink md:hidden" onClick={() => setMobileMenu((open) => !open)}><Menu /></Button>
         {mobileMenu && <nav className="absolute left-5 right-5 top-[72px] flex flex-col gap-2 rounded-xl border border-ink/10 bg-card p-3 shadow-xl md:hidden" aria-label="Mobile navigation">{navItems.map((item) => <Button key={item.id} variant="ghost" onClick={() => goTo(item.id)} className="justify-start text-ink">{item.label}</Button>)}<Button asChild variant="outline" className="justify-start text-ink"><Link to="/auth">Sign in</Link></Button><Button variant="outline" onClick={resetLocalData} className="justify-start text-ink"><RotateCcw /> Reset local data</Button></nav>}
      </header>

      {notice && <div role="status" className="fixed right-5 top-5 z-50 flex max-w-sm items-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm text-ink-foreground shadow-xl"><CircleCheck className="h-4 w-4 text-cyan" />{notice}</div>}

      <main className="mx-auto w-full max-w-[1240px] px-5 pb-16 md:px-8">
        {section === "overview" && <Overview state={state} score={analysis.score} missing={analysis.missing} recommended={recommended} completedCount={completedCount} setSection={goTo} />}
        {section === "profile" && <ProfileView state={state} updateState={updateState} newSkill={newSkill} setNewSkill={setNewSkill} addSkill={addSkill} saveProfile={saveProfile} saved={saved} />}
        {section === "analysis" && <AnalysisView state={state} score={analysis.score} allSkills={allSkills} requirements={requirements} matches={analysis.matches} missing={analysis.missing} resumeDraft={resumeDraft} setResumeDraft={setResumeDraft} handleResume={handleResume} saveResume={saveResume} setSection={goTo} />}
        {section === "roadmap" && <RoadmapView state={state} resources={roadmapResources} missing={analysis.missing} toggleResource={toggleResource} />}
      </main>

      <footer className="mx-auto flex w-full max-w-[1240px] items-center justify-between border-t border-ink/10 px-5 py-5 text-xs text-ink/45 md:px-8">
        <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan" /> Your work stays in this browser.</span>
        <Button variant="ghost" size="sm" onClick={resetLocalData} className="h-auto p-0 text-ink/55 hover:bg-transparent hover:text-ink"><RotateCcw className="h-3.5 w-3.5" /> Reset data</Button>
      </footer>
    </div>
  );
}

function Overview({ state, score, missing, recommended, completedCount, setSection }: { state: AppState; score: number; missing: Requirement[]; recommended: Resource[]; completedCount: number; setSection: (section: Section) => void }) {
  const firstName = state.name.trim().split(" ")[0] || "there";
  const nextResource = recommended[0] ?? resources[0];
  const technicalScore = Math.min(100, Math.round((state.skills.filter((skill) => skill !== "Communication" && skill !== "Project management").length / 5) * 100));
  const softScore = state.skills.some((skill) => skill === "Communication" || skill === "Project management") ? 64 : 32;

  return <div className="app-fade-in pt-12 md:pt-16 lg:pt-24">
    <section className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
      <div>
        <div className="mb-7 flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-cyan"><span className="h-2 w-2 rounded-full bg-cyan" /> Your next move, made clear</div>
        <h1 className="max-w-[650px] font-display text-[3.45rem] font-extrabold leading-[0.98] tracking-tight text-ink sm:text-[4.7rem] lg:text-[5.3rem]">Turn your<br />ambition<br /><span className="text-cyan">into a roadmap.</span></h1>
        <p className="mt-8 max-w-[500px] text-base leading-7 text-ink/60 md:text-lg">Understand where you stand, see what the industry expects, and get a learning plan built around the career you want.</p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <Button onClick={() => setSection("analysis")} className="relative h-13 rounded-none bg-ink px-7 text-sm font-bold text-ink-foreground shadow-[5px_5px_0_var(--cyan)] hover:bg-ink/90 hover:shadow-[2px_2px_0_var(--cyan)]"><span>Find my skill gaps</span><ArrowRight /></Button>
          <Button variant="ghost" onClick={() => setSection("profile")} className="h-auto gap-2 p-0 text-sm font-bold text-ink hover:bg-transparent hover:text-cyan">Review my profile <ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="mt-10 flex items-center gap-3 text-xs font-semibold text-ink/40"><div className="flex -space-x-2"><span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-cyan text-[0.58rem] text-ink">AL</span><span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-mint text-[0.58rem] text-ink">JM</span><span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-accent text-[0.58rem] text-ink">SK</span><span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-ink text-[0.58rem] text-ink-foreground">+</span></div><span>Built for focused career progress</span></div>
      </div>

      <div className="relative mx-auto w-full max-w-[520px] lg:mr-4">
        <div className="absolute -inset-5 -z-10 rotate-[-4deg] rounded-[2rem] bg-mint/55" />
        <div className="absolute -right-2 -top-7 -z-10 h-24 w-44 rotate-[12deg] rounded-[2rem] bg-cyan/20" />
        <div className="relative rotate-[1.5deg] rounded-2xl bg-ink p-7 text-ink-foreground shadow-2xl transition-transform duration-500 hover:rotate-0 sm:p-9">
          <div className="flex items-start justify-between gap-5"><div><div className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ink-foreground/45">Your career snapshot</div><div className="mt-1 text-xs text-ink-foreground/25">Updated just now</div></div><ScoreRing score={score} dark /></div>
          <div className="mt-8 flex items-end gap-3"><span className="font-display text-[4.3rem] font-extrabold leading-none">{score}%</span><span className="mb-1 flex items-center gap-1 text-[0.65rem] font-bold text-cyan"><TrendingUp className="h-3 w-3" /> local analysis</span></div>
          <div className="mt-9 space-y-5"><SnapshotBar label="Technical skills" value={technicalScore} dark /><SnapshotBar label="Soft skills" value={softScore} dark /><SnapshotBar label="Role readiness" value={score} dark /></div>
           <Button variant="ghost" onClick={() => setSection("roadmap")} className="mt-9 flex h-auto w-full items-center justify-between rounded-xl bg-ink-foreground/5 p-4 text-left text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"><span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan/15 text-cyan"><Zap className="h-4 w-4" /></span><span><span className="block text-[0.58rem] font-bold uppercase tracking-[0.16em] text-ink-foreground/35">Next on your roadmap</span><span className="mt-1 block text-sm font-semibold">{nextResource?.title ?? "Choose a learning resource"}</span></span></span><ChevronRight className="h-4 w-4 text-ink-foreground/35" /></Button>
          <div className="absolute -bottom-7 -right-8 flex items-center gap-3 rounded-xl border border-ink/5 bg-card p-3.5 text-ink shadow-xl sm:-right-12"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan/15 text-cyan"><Target className="h-5 w-5" /></span><span><strong className="block text-xs">{missing.length} skills to unlock</strong><small className="text-[0.65rem] text-ink/45">for {state.targetRole}</small></span></div>
        </div>
      </div>
    </section>

    <section className="mt-24 grid gap-8 border-t border-ink/10 pt-9 md:grid-cols-3 md:gap-10">
      <JourneyStep number="01" title="Assess your starting point" detail={`${state.skills.length} skills, experience, and goals`} onClick={() => setSection("profile")} />
      <JourneyStep number="02" title="See the real gap" detail={`${missing.length} focus areas for ${state.targetRole}`} onClick={() => setSection("analysis")} />
      <JourneyStep number="03" title="Move forward with confidence" detail={`${completedCount} roadmap items completed`} onClick={() => setSection("roadmap")} />
    </section>
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-xs text-ink/40"><span>{firstName}'s workspace · {state.targetRole}</span><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-mint" /> Saved locally on this device</span></div>
  </div>;
}

function JourneyStep({ number, title, detail, onClick }: { number: string; title: string; detail: string; onClick: () => void }) {
  return <Button variant="ghost" onClick={onClick} className="group flex h-auto items-start gap-5 p-0 text-left hover:bg-transparent"><span className="font-display text-xl font-bold text-cyan/65">{number}</span><span className="flex-1"><strong className="block text-sm font-bold text-ink">{title}</strong><small className="mt-1 block text-xs text-ink/45">{detail}</small></span><ArrowUpRight className="mt-0.5 h-4 w-4 text-ink/15 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Button>;
}

function SnapshotBar({ label, value, dark = false }: { label: string; value: number; dark?: boolean }) {
  return <div><div className={`mb-2 flex justify-between text-[0.63rem] font-bold uppercase tracking-[0.08em] ${dark ? "text-ink-foreground/45" : "text-ink/45"}`}><span>{label}</span><span className={dark ? "text-ink-foreground/80" : "text-ink"}>{value}%</span></div><div className={`h-1.5 w-full overflow-hidden rounded-full ${dark ? "bg-ink-foreground/10" : "bg-ink/10"}`}><div className="h-full rounded-full bg-cyan transition-all" style={{ width: `${value}%` }} /></div></div>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="mb-9 flex flex-col justify-between gap-5 border-b border-ink/10 pb-7 md:flex-row md:items-end"><div><div className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-cyan">{eyebrow}</div><h1 className="font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">{title}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-ink/60">{description}</p></div>{action}</div>;
}

function ScoreRing({ score, dark = false }: { score: number; dark?: boolean }) {
  const circumference = 2 * Math.PI * 49;
  return <div className="relative h-16 w-16 shrink-0"><svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-label={`${score}% match`} role="img"><circle cx="60" cy="60" r="49" fill="none" stroke={dark ? "oklch(1 0 0 / 12%)" : "var(--secondary)"} strokeWidth="7" /><circle cx="60" cy="60" r="49" fill="none" stroke="var(--cyan)" strokeLinecap="round" strokeWidth="7" strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * score) / 100} /></svg><span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${dark ? "text-ink-foreground" : "text-ink"}`}>{score}</span></div>;
}

function ProfileView({ state, updateState, newSkill, setNewSkill, addSkill, saveProfile, saved }: { state: AppState; updateState: (patch: Partial<AppState>) => void; newSkill: string; setNewSkill: (value: string) => void; addSkill: () => void; saveProfile: () => void; saved: boolean }) {
  return <div className="app-fade-in pt-12 md:pt-16"><PageHeading eyebrow="Your foundation" title="Make it personal" description="Keep your career context up to date so every recommendation feels relevant." action={<Button onClick={saveProfile} className="gap-2 bg-ink text-ink-foreground hover:bg-ink/90"><Save className="h-4 w-4" /> {saved ? "Saved" : "Save profile"}</Button>} /><div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><section className="blueprint-panel"><PanelTitle icon={FileText} title="About you" detail="Used only on this device" /><div className="space-y-4"><Field label="Full name"><input value={state.name} onChange={(e) => updateState({ name: e.target.value })} className="app-input" /></Field><Field label="Email address"><input type="email" value={state.email} onChange={(e) => updateState({ email: e.target.value })} className="app-input" /></Field><Field label="Current position"><input value={state.currentPosition} onChange={(e) => updateState({ currentPosition: e.target.value })} className="app-input" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Experience"><input value={state.experience} onChange={(e) => updateState({ experience: e.target.value })} className="app-input" /></Field><Field label="Education"><input value={state.education} onChange={(e) => updateState({ education: e.target.value })} className="app-input" /></Field></div></div></section><section className="blueprint-panel"><PanelTitle icon={BriefcaseBusiness} title="Career direction" detail="Choose the role you want to grow into" /><Field label="Target role"><select value={state.targetRole} onChange={(e) => updateState({ targetRole: e.target.value as RoleKey })} className="app-input"><option>Data Analyst</option><option>Data Scientist</option><option>ML Engineer</option><option>Software Developer</option></select></Field><div className="mt-8 border-t border-ink/10 pt-6"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-bold text-ink">Current skills</h2><p className="mt-1 text-xs text-ink/50">Add what you already know</p></div><Badge variant="secondary">{state.skills.length} skills</Badge></div><div className="flex flex-wrap gap-2">{state.skills.map((skill) => <span key={skill} className="flex items-center gap-1.5 rounded-md border border-ink/10 bg-background px-2.5 py-1.5 text-xs font-medium text-ink">{skill}<Button variant="ghost" size="icon" aria-label={`Remove ${skill}`} className="-mr-1 h-5 w-5 rounded-full p-0 text-ink/50 hover:bg-ink/5 hover:text-ink" onClick={() => updateState({ skills: state.skills.filter((item) => item !== skill) })}><X className="h-3 w-3" /></Button></span>)}</div><div className="mt-5 flex gap-2"><input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder="Add a skill..." className="app-input" /><Button variant="outline" size="icon" aria-label="Add skill" onClick={addSkill}><Plus /></Button></div></div></section></div></div>;
}

function AnalysisView({ state, score, allSkills, requirements, matches, missing, resumeDraft, setResumeDraft, handleResume, saveResume, setSection }: { state: AppState; score: number; allSkills: string[]; requirements: Requirement[]; matches: Requirement[]; missing: Requirement[]; resumeDraft: string; setResumeDraft: (value: string) => void; handleResume: (file: File) => void; saveResume: () => void; setSection: (section: Section) => void }) {
  return <div className="app-fade-in pt-12 md:pt-16"><PageHeading eyebrow="Understand your edge" title="Skill analysis" description={`See how your current profile maps to the ${state.targetRole} role, then turn gaps into a practical plan.`} action={<Button onClick={() => setSection("roadmap")} variant="outline" className="gap-2 border-ink/15 text-ink hover:bg-card"><BarChart3 className="h-4 w-4" /> Open roadmap</Button>} /><div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"><section className="blueprint-panel"><PanelTitle icon={FileText} title="Add your resume" detail="Text-based files can be read instantly" /><label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-cyan/50 bg-cyan/5 px-5 py-8 text-center transition-colors hover:bg-cyan/10"><input type="file" accept=".txt,.md,.doc,.docx,.pdf" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleResume(file); }} /><span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-card text-cyan shadow-sm"><Upload className="h-5 w-5" /></span><span className="text-sm font-bold text-ink">{state.resumeName || "Choose a resume file"}</span><span className="mt-1 text-xs text-ink/50">Or paste the text below</span></label><textarea value={resumeDraft} onChange={(e) => setResumeDraft(e.target.value)} placeholder="Paste your resume text here..." className="app-input mt-5 min-h-[165px] resize-y leading-6" /><Button onClick={saveResume} className="mt-3 w-full gap-2 bg-ink text-ink-foreground hover:bg-ink/90"><Zap className="h-4 w-4 text-cyan" /> Extract skills locally</Button></section><section className="blueprint-panel"><div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><div className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-cyan">Step 02 · Match signal</div><h2 className="font-display text-2xl font-extrabold text-ink">Your role fit</h2><p className="mt-1 text-xs text-ink/50">Compared against {requirements.length} core requirements for {state.targetRole}</p></div><ScoreRing score={score} /></div><div className="mb-7 grid grid-cols-2 gap-3"><div className="rounded-lg bg-cyan/10 p-4"><div className="text-2xl font-bold text-cyan-foreground">{matches.length}</div><div className="mt-1 text-xs text-ink/50">Skills covered</div></div><div className="rounded-lg bg-accent/20 p-4"><div className="text-2xl font-bold text-accent-foreground">{missing.length}</div><div className="mt-1 text-xs text-ink/50">Skills to grow</div></div></div><div className="space-y-4">{requirements.map((requirement) => { const covered = matches.some((item) => item.skill === requirement.skill); return <div key={requirement.skill}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-semibold text-ink">{requirement.skill}</span><span className={covered ? "text-mint-foreground" : "text-ink/45"}>{covered ? "Covered" : requirement.level}</span></div><Progress value={covered ? 100 : 18} className={covered ? "h-2 bg-mint/25 [&>div]:bg-mint" : "h-2 bg-accent/20 [&>div]:bg-accent"} /></div>; })}</div></section></div><section className="blueprint-panel mt-6"><div className="mb-5 flex items-center justify-between"><div><div className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-cyan">Your skill inventory</div><h2 className="font-display text-2xl font-extrabold text-ink">Detected and added skills</h2></div><Badge variant="secondary">{allSkills.length} total</Badge></div><div className="flex flex-wrap gap-2">{allSkills.map((skill) => <Badge key={skill} variant={requirements.some((item) => item.skill === skill) ? "default" : "outline"}>{skill}</Badge>)}</div></section></div>;
}

function RoadmapView({ state, resources: roadmapResources, missing, toggleResource }: { state: AppState; resources: Resource[]; missing: Requirement[]; toggleResource: (id: string, status: ResourceStatus) => void }) {
  return <div className="app-fade-in pt-12 md:pt-16"><PageHeading eyebrow="A plan you can follow" title="Learning roadmap" description={`A sequenced path to become a stronger ${state.targetRole}. Start with the gaps that unlock the most progress.`} action={<div className="flex items-center gap-2 rounded-full bg-accent/20 px-3 py-2 text-xs font-bold text-accent-foreground"><Zap className="h-4 w-4" /> {missing.length} focus areas</div>} /><div className="relative space-y-4 before:absolute before:bottom-8 before:left-[21px] before:top-8 before:w-px before:bg-ink/10 md:before:left-[25px]">{roadmapResources.map((resource, index) => { const status = state.resourceStatuses[resource.id] ?? "not-started"; return <div key={resource.id} className="relative flex gap-4 md:gap-6"><div className={`z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-background ${status === "completed" ? "bg-mint text-mint-foreground" : status === "in-progress" ? "bg-cyan text-cyan-foreground" : "bg-card text-ink/45 shadow-sm"}`}>{status === "completed" ? <Check className="h-4 w-4" /> : <span className="font-display text-sm font-bold">{String(index + 1).padStart(2, "0")}</span>}</div><div className="blueprint-panel mb-1 min-w-0 flex-1 p-5 md:p-6"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant="secondary">{resource.type}</Badge><span className="text-xs text-ink/45">{resource.skill}</span></div><h2 className="font-display text-lg font-extrabold text-ink">{resource.title}</h2><p className="mt-1 text-xs text-ink/50">{resource.provider} · {resource.duration}</p></div><div className="flex shrink-0 gap-2">{status !== "completed" && <Button variant={status === "in-progress" ? "secondary" : "outline"} size="sm" onClick={() => toggleResource(resource.id, status === "in-progress" ? "not-started" : "in-progress")}>{status === "in-progress" ? "In progress" : "Start learning"}</Button>}{status === "in-progress" && <Button size="sm" onClick={() => toggleResource(resource.id, "completed")}><Check className="h-3.5 w-3.5" /> Complete</Button>}{status === "completed" && <Button variant="ghost" size="sm" onClick={() => toggleResource(resource.id, "not-started")}>Completed <RotateCcw className="h-3.5 w-3.5" /></Button>}</div></div></div></div>; })}</div></div>;
}

function PanelTitle({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return <div className="mb-6 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan/10 text-cyan"><Icon className="h-5 w-5" /></span><div><h2 className="font-display text-lg font-extrabold text-ink">{title}</h2><p className="text-xs text-ink/50">{detail}</p></div></div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-ink/55">{label}</span>{children}</label>; }