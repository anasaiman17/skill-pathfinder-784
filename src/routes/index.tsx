import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, BookOpen, BriefcaseBusiness, Check, ChevronRight, CircleUserRound, FileText, Flame, FolderOpen, Gauge, GraduationCap, LayoutDashboard, Lightbulb, ListChecks, LockKeyhole, Menu, Pencil, Plus, Radar, RotateCcw, Save, Settings2, Sparkles, Target, TrendingUp, Upload, X, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Skillwise — AI Skill Gap Analyzer" },
      { name: "description", content: "Build a focused learning plan from your resume, skills, and target career role." },
      { property: "og:title", content: "Skillwise — AI Skill Gap Analyzer" },
      { property: "og:description", content: "Turn your current skills into a clear, achievable career roadmap." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Section = "overview" | "profile" | "analysis" | "roadmap";
type ResourceStatus = "not-started" | "in-progress" | "completed";
type RoleKey = "Data Analyst" | "Data Scientist" | "ML Engineer" | "Software Developer";

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

const STORAGE_KEY = "skillwise-local-state-v1";
const roleRequirements: Record<RoleKey, { skill: string; level: string; weight: number }[]> = {
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

const resources = [
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
  return Object.entries(skillAliases).filter(([alias]) => lower.includes(alias)).map(([, skill]) => skill);
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

  function saveProfile() {
    setSaved(true);
    setNotice("Profile saved locally");
    window.setTimeout(() => setNotice(""), 2600);
  }

  function handleResume(file: File) {
    setNotice("");
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      if (text.length > 20) {
        setResumeDraft(text);
        updateState({ resumeText: text, resumeName: file.name });
        setNotice(`${file.name} added — skills are ready to review`);
      } else {
        setNotice("This file needs a text copy to extract skills. Paste your resume below to continue.");
        updateState({ resumeName: file.name });
      }
      window.setTimeout(() => setNotice(""), 4200);
    };
    reader.readAsText(file);
  }

  function saveResume() {
    const found = extractSkills(resumeDraft);
    updateState({ resumeText: resumeDraft, skills: Array.from(new Set([...state.skills, ...found])) });
    setNotice(found.length ? `${found.length} skill${found.length === 1 ? "" : "s"} added from your resume` : "Resume saved locally");
    window.setTimeout(() => setNotice(""), 3200);
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
    setNotice("Local workspace reset");
    window.setTimeout(() => setNotice(""), 2600);
  }

  const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "profile", label: "My profile", icon: CircleUserRound },
    { id: "analysis", label: "Skill analysis", icon: Radar },
    { id: "roadmap", label: "Learning roadmap", icon: ListChecks },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className={`app-sidebar fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col px-5 py-6 transition-transform lg:static lg:translate-x-0 ${mobileMenu ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-11 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><Sparkles className="h-5 w-5" /></div>
            <div><div className="font-display text-lg font-semibold tracking-tight">skillwise</div><div className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/55">career clarity</div></div>
          </div>
          <div className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-sidebar-foreground/40">Workspace</div>
          <nav className="space-y-1" aria-label="Main navigation">
            {navItems.map(({ id, label, icon: Icon }) => <Button key={id} variant="ghost" onClick={() => { setSection(id); setMobileMenu(false); }} className={`w-full justify-start gap-3 rounded-md px-3 py-2.5 text-sm ${section === id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}><Icon className="h-4 w-4" />{label}{id === "analysis" && analysis.missing.length > 0 && <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1 text-[10px] font-bold text-sidebar-primary-foreground">{analysis.missing.length}</span>}</Button>)}
          </nav>
          <div className="mt-auto space-y-5">
            <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/55 p-4">
              <div className="mb-3 flex items-center justify-between"><span className="text-xs font-medium">Roadmap progress</span><span className="text-xs text-sidebar-foreground/55">{completedCount}/5</span></div>
              <Progress value={completedCount * 20} className="h-1.5 bg-sidebar-foreground/15" />
              <div className="mt-3 flex items-center gap-2 text-[11px] text-sidebar-foreground/55"><Flame className="h-3.5 w-3.5 text-sidebar-primary" /> Keep your momentum going</div>
            </div>
            <div className="flex items-center gap-2 px-2 text-[11px] text-sidebar-foreground/45"><LockKeyhole className="h-3.5 w-3.5" /> Saved on this device</div>
          </div>
        </aside>

        {mobileMenu && <Button aria-label="Close navigation" variant="ghost" className="fixed inset-0 z-30 h-full w-full rounded-none bg-foreground/20 lg:hidden" onClick={() => setMobileMenu(false)} />}
        <main className="min-w-0 flex-1">
          <header className="flex h-[76px] items-center justify-between border-b border-border bg-card/70 px-5 md:px-10">
            <div className="flex items-center gap-3"><Button aria-label="Open navigation" variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenu(true)}><Menu /></Button><div className="hidden text-sm text-muted-foreground md:block">Workspace <ChevronRight className="mx-1 inline h-3.5 w-3.5" /> <span className="font-medium text-foreground">{navItems.find((item) => item.id === section)?.label}</span></div><div className="text-sm font-semibold md:hidden">skillwise</div></div>
            <div className="flex items-center gap-2 md:gap-5"><div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><span className="h-2 w-2 rounded-full bg-chart-3" /> Local workspace</div><Button aria-label="Reset local workspace" variant="ghost" size="icon" onClick={resetLocalData} title="Reset local workspace"><RotateCcw /></Button><div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">{state.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div></div>
          </header>
          <div className="app-grain min-h-[calc(100vh-76px)] px-5 py-7 md:px-10 md:py-9">
            {notice && <div className="fixed right-5 top-5 z-50 flex max-w-sm items-center gap-2 rounded-md bg-foreground px-4 py-3 text-sm text-background shadow-lg"><Check className="h-4 w-4 text-sidebar-primary" />{notice}</div>}
            {section === "overview" && <Overview state={state} score={analysis.score} missing={analysis.missing} recommended={recommended} completedCount={completedCount} setSection={setSection} />}
            {section === "profile" && <ProfileView state={state} updateState={updateState} newSkill={newSkill} setNewSkill={setNewSkill} addSkill={addSkill} saveProfile={saveProfile} saved={saved} />}
            {section === "analysis" && <AnalysisView state={state} score={analysis.score} allSkills={allSkills} requirements={requirements} matches={analysis.matches} missing={analysis.missing} resumeDraft={resumeDraft} setResumeDraft={setResumeDraft} handleResume={handleResume} saveResume={saveResume} setSection={setSection} />}
            {section === "roadmap" && <RoadmapView state={state} resources={roadmapResources} missing={analysis.missing} toggleResource={toggleResource} />}
          </div>
        </main>
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="app-kicker mb-2">{eyebrow}</div><h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-[2.65rem]">{title}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p></div>{action}</div>;
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 49;
  return <div className="relative h-36 w-36 shrink-0"><svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-label={`${score}% match`} role="img"><circle cx="60" cy="60" r="49" fill="none" stroke="var(--color-secondary)" strokeWidth="9" /><circle cx="60" cy="60" r="49" fill="none" stroke="var(--color-primary)" strokeLinecap="round" strokeWidth="9" strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * score) / 100} /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-display text-3xl font-semibold">{score}%</span><span className="text-[10px] uppercase tracking-widest text-muted-foreground">match</span></div></div>;
}

function Overview({ state, score, missing, recommended, completedCount, setSection }: { state: AppState; score: number; missing: { skill: string; level: string }[]; recommended: typeof resources; completedCount: number; setSection: (section: Section) => void }) {
  return <div className="mx-auto max-w-[1240px] app-fade-in"><PageHeading eyebrow="Good morning, {name}" title={`${state.name.split(" ")[0]}'s career cockpit`} description="A clear view of where you are now, what to learn next, and how close you are to your next role." action={<Button onClick={() => setSection("analysis")} className="h-11 gap-2"><Radar className="h-4 w-4" /> Run analysis <ChevronRight className="h-4 w-4" /></Button>} />
    <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr_1fr]">
      <div className="app-panel relative overflow-hidden rounded-lg p-6 md:p-7"><div className="absolute right-5 top-5 text-primary/20"><Target className="h-24 w-24" /></div><div className="app-kicker mb-6">Target role</div><div className="relative flex items-center gap-6"><ScoreRing score={score} /><div><div className="font-display text-xl font-semibold">{state.targetRole}</div><p className="mt-1 max-w-[190px] text-sm leading-5 text-muted-foreground">{missing.length ? `${missing.length} skills to strengthen for this role.` : "You are covering the core requirements."}</p><Button variant="link" className="mt-3 h-auto p-0 text-xs" onClick={() => setSection("analysis")}>View skill breakdown <ChevronRight className="h-3.5 w-3.5" /></Button></div></div></div>
      <StatCard icon={FileText} label="Resume status" value={state.resumeName ? "Ready to review" : "Not added yet"} detail={state.resumeName || "Add a resume to extract skills"} onClick={() => setSection("analysis")} />
      <StatCard icon={TrendingUp} label="Learning progress" value={`${completedCount} completed`} detail={completedCount ? "Nice work — keep building" : "Start your first roadmap item"} onClick={() => setSection("roadmap")} />
    </div>
    <div className="mt-7 grid gap-7 xl:grid-cols-[1.25fr_0.75fr]">
      <section className="app-panel rounded-lg p-6 md:p-7"><div className="mb-6 flex items-start justify-between"><div><div className="app-kicker mb-2">Your next moves</div><h2 className="font-display text-xl font-semibold">Close the most valuable gaps</h2></div><Button variant="ghost" size="sm" onClick={() => setSection("roadmap")}>Full roadmap <ChevronRight className="h-3.5 w-3.5" /></Button></div><div className="space-y-3">{recommended.slice(0, 3).map((resource, index) => <div key={resource.id} className="flex items-center gap-4 rounded-md border border-border bg-background/55 p-4"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${resource.accent === "amber" ? "bg-accent/25 text-accent-foreground" : "bg-primary/10 text-primary"}`}><span className="font-display text-sm font-semibold">0{index + 1}</span></div><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{resource.title}</div><div className="mt-1 text-xs text-muted-foreground">{resource.provider} · {resource.duration}</div></div><Badge variant="secondary" className="hidden sm:inline-flex">{resource.skill}</Badge><ChevronRight className="h-4 w-4 text-muted-foreground" /></div>)}{recommended.length === 0 && <EmptyState icon={Check} text="Your core skills are covered. Explore resources to grow beyond the requirements." />}</div></section>
      <section className="app-panel rounded-lg p-6 md:p-7"><div className="app-kicker mb-2">Momentum</div><h2 className="font-display text-xl font-semibold">Keep your streak alive</h2><div className="mt-7 flex items-end gap-3"><div className="font-display text-5xl font-semibold">{completedCount}</div><div className="pb-1 text-sm text-muted-foreground">roadmap items<br />completed</div></div><div className="mt-6"><Progress value={completedCount * 20} className="h-2" /><div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>Getting started</span><span>{Math.round(completedCount * 20)}%</span></div></div><div className="mt-7 border-t border-border pt-5 text-sm leading-6 text-muted-foreground"><Lightbulb className="mb-1 mr-2 inline h-4 w-4 text-accent-foreground" /> A small, consistent step today compounds into a career change.</div></section>
    </div>
  </div>;
}

function StatCard({ icon: Icon, label, value, detail, onClick }: { icon: typeof FileText; label: string; value: string; detail: string; onClick: () => void }) {
  return <Button variant="ghost" onClick={onClick} className="app-panel h-auto min-h-[176px] flex-col items-start justify-between rounded-lg p-6 text-left hover:-translate-y-0.5 hover:bg-card md:p-7"><div className="flex w-full items-center justify-between"><div className="app-kicker">{label}</div><Icon className="h-5 w-5 text-primary" /></div><div><div className="font-display text-lg font-semibold">{value}</div><div className="mt-1 text-xs text-muted-foreground">{detail}</div></div></Button>;
}

function ProfileView({ state, updateState, newSkill, setNewSkill, addSkill, saveProfile, saved }: { state: AppState; updateState: (patch: Partial<AppState>) => void; newSkill: string; setNewSkill: (value: string) => void; addSkill: () => void; saveProfile: () => void; saved: boolean }) {
  return <div className="mx-auto max-w-[1020px] app-fade-in"><PageHeading eyebrow="Your foundation" title="Make it personal" description="Keep your career context up to date so every recommendation feels relevant." action={<Button onClick={saveProfile} className="gap-2"><Save className="h-4 w-4" /> {saved ? "Saved" : "Save profile"}</Button>} /><div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr]"><section className="app-panel rounded-lg p-6 md:p-7"><div className="mb-6 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><CircleUserRound className="h-5 w-5" /></div><div><h2 className="font-display text-lg font-semibold">About you</h2><p className="text-xs text-muted-foreground">Used only on this device</p></div></div><div className="space-y-4"><Field label="Full name"><input value={state.name} onChange={(e) => updateState({ name: e.target.value })} className="app-input" /></Field><Field label="Email address"><input type="email" value={state.email} onChange={(e) => updateState({ email: e.target.value })} className="app-input" /></Field><Field label="Current position"><input value={state.currentPosition} onChange={(e) => updateState({ currentPosition: e.target.value })} className="app-input" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Experience"><input value={state.experience} onChange={(e) => updateState({ experience: e.target.value })} className="app-input" /></Field><Field label="Education"><input value={state.education} onChange={(e) => updateState({ education: e.target.value })} className="app-input" /></Field></div></div></section><section className="app-panel rounded-lg p-6 md:p-7"><div className="mb-6 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent/25 text-accent-foreground"><BriefcaseBusiness className="h-5 w-5" /></div><div><h2 className="font-display text-lg font-semibold">Career direction</h2><p className="text-xs text-muted-foreground">Choose the role you want to grow into</p></div></div><Field label="Target role"><select value={state.targetRole} onChange={(e) => updateState({ targetRole: e.target.value as RoleKey })} className="app-input"><option>Data Analyst</option><option>Data Scientist</option><option>ML Engineer</option><option>Software Developer</option></select></Field><div className="mt-8 border-t border-border pt-6"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-semibold">Current skills</h3><p className="mt-1 text-xs text-muted-foreground">Add what you already know</p></div><Badge variant="secondary">{state.skills.length} skills</Badge></div><div className="flex flex-wrap gap-2">{state.skills.map((skill) => <span key={skill} className="group flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium">{skill}<Button variant="ghost" size="icon" aria-label={`Remove ${skill}`} className="-mr-1 h-5 w-5 rounded-full p-0 opacity-50 hover:opacity-100" onClick={() => updateState({ skills: state.skills.filter((item) => item !== skill) })}><X className="h-3 w-3" /></Button></span>)}</div><div className="mt-5 flex gap-2"><input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder="Add a skill..." className="app-input" /><Button variant="outline" size="icon" aria-label="Add skill" onClick={addSkill}><Plus /></Button></div></div></section></div></div>;
}

function AnalysisView({ state, score, allSkills, requirements, matches, missing, resumeDraft, setResumeDraft, handleResume, saveResume, setSection }: { state: AppState; score: number; allSkills: string[]; requirements: { skill: string; level: string; weight: number }[]; matches: { skill: string; level: string }[]; missing: { skill: string; level: string }[]; resumeDraft: string; setResumeDraft: (value: string) => void; handleResume: (file: File) => void; saveResume: () => void; setSection: (section: Section) => void }) {
  return <div className="mx-auto max-w-[1240px] app-fade-in"><PageHeading eyebrow="Understand your edge" title="Skill analysis" description={`See how your current profile maps to the ${state.targetRole} role, then turn gaps into a practical plan.`} action={<Button onClick={() => setSection("roadmap")} variant="outline" className="gap-2"><ListChecks className="h-4 w-4" /> Open roadmap</Button>} /><div className="grid gap-7 xl:grid-cols-[0.9fr_1.1fr]"><section className="app-panel rounded-lg p-6 md:p-7"><div className="mb-5 flex items-center justify-between"><div><div className="app-kicker mb-2">Step 01 · Profile input</div><h2 className="font-display text-xl font-semibold">Add your resume</h2></div><FileText className="h-6 w-6 text-primary" /></div><label className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-primary/40 bg-primary/5 px-5 py-8 text-center transition-colors hover:bg-primary/10"><input type="file" accept=".txt,.md,.doc,.docx,.pdf" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleResume(file); }} /><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-card text-primary shadow-sm"><Upload className="h-5 w-5" /></div><span className="text-sm font-semibold">{state.resumeName || "Choose a resume file"}</span><span className="mt-1 text-xs text-muted-foreground">Text-based files can be read instantly</span></label><div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground"><span className="h-px flex-1 bg-border" /> or paste text <span className="h-px flex-1 bg-border" /></div><textarea value={resumeDraft} onChange={(e) => setResumeDraft(e.target.value)} placeholder="Paste your resume text here..." className="app-input min-h-[148px] resize-y leading-6" /><Button onClick={saveResume} className="mt-3 w-full gap-2"><Sparkles className="h-4 w-4" /> Extract skills locally</Button></section><section className="app-panel rounded-lg p-6 md:p-7"><div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><div className="app-kicker mb-2">Step 02 · Match signal</div><h2 className="font-display text-xl font-semibold">Your role fit</h2><p className="mt-1 text-xs text-muted-foreground">Compared against {requirements.length} core requirements for {state.targetRole}</p></div><ScoreRing score={score} /></div><div className="mb-7 grid grid-cols-2 gap-3"><div className="rounded-md bg-primary/8 p-4"><div className="text-2xl font-semibold text-primary">{matches.length}</div><div className="mt-1 text-xs text-muted-foreground">Skills covered</div></div><div className="rounded-md bg-accent/15 p-4"><div className="text-2xl font-semibold text-accent-foreground">{missing.length}</div><div className="mt-1 text-xs text-muted-foreground">Skills to grow</div></div></div><div className="space-y-4">{requirements.map((requirement) => { const covered = matches.some((item) => item.skill === requirement.skill); return <div key={requirement.skill}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-medium">{requirement.skill}</span><span className={covered ? "text-chart-3" : "text-muted-foreground"}>{covered ? "Covered" : requirement.level}</span></div><Progress value={covered ? 100 : 18} className={covered ? "h-2 [&>div]:bg-chart-3" : "h-2 [&>div]:bg-accent"} /></div>; })}</div></section></div><section className="mt-7 app-panel rounded-lg p-6 md:p-7"><div className="mb-5 flex items-center justify-between"><div><div className="app-kicker mb-2">Your skill inventory</div><h2 className="font-display text-xl font-semibold">Detected and added skills</h2></div><Badge variant="secondary">{allSkills.length} total</Badge></div><div className="flex flex-wrap gap-2">{allSkills.map((skill) => <Badge key={skill} variant={requirements.some((item) => item.skill === skill) ? "default" : "outline"}>{skill}</Badge>)}</div></section></div>;
}

function RoadmapView({ state, resources: roadmapResources, missing, toggleResource }: { state: AppState; resources: typeof resources; missing: { skill: string; level: string }[]; toggleResource: (id: string, status: ResourceStatus) => void }) {
  return <div className="mx-auto max-w-[1080px] app-fade-in"><PageHeading eyebrow="A plan you can follow" title="Learning roadmap" description={`A sequenced path to become a stronger ${state.targetRole}. Start with the gaps that unlock the most progress.`} action={<div className="flex items-center gap-2 rounded-md bg-accent/15 px-3 py-2 text-xs font-medium text-accent-foreground"><Zap className="h-4 w-4" /> {missing.length} focus areas</div>} /><div className="relative space-y-4 before:absolute before:bottom-8 before:left-[21px] before:top-8 before:w-px before:bg-border md:before:left-[25px]">{roadmapResources.map((resource, index) => { const status = state.resourceStatuses[resource.id] ?? "not-started"; return <div key={resource.id} className="relative flex gap-4 md:gap-6"><div className={`z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-background ${status === "completed" ? "bg-chart-3 text-primary-foreground" : status === "in-progress" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground shadow-sm"}`}>{status === "completed" ? <Check className="h-4 w-4" /> : <span className="font-display text-sm font-semibold">{String(index + 1).padStart(2, "0")}</span>}</div><div className="app-panel mb-1 min-w-0 flex-1 rounded-lg p-5 md:p-6"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant="secondary">{resource.type}</Badge><span className="text-xs text-muted-foreground">{resource.skill}</span></div><h2 className="font-display text-lg font-semibold">{resource.title}</h2><p className="mt-1 text-xs text-muted-foreground">{resource.provider} · {resource.duration}</p></div><div className="flex shrink-0 gap-2">{status !== "completed" && <Button variant={status === "in-progress" ? "secondary" : "outline"} size="sm" onClick={() => toggleResource(resource.id, status === "in-progress" ? "not-started" : "in-progress")}>{status === "in-progress" ? "In progress" : "Start learning"}</Button>}{status === "in-progress" && <Button size="sm" onClick={() => toggleResource(resource.id, "completed")}><Check className="h-3.5 w-3.5" /> Complete</Button>}{status === "completed" && <Button variant="ghost" size="sm" onClick={() => toggleResource(resource.id, "not-started")}>Completed <RotateCcw className="h-3.5 w-3.5" /></Button>}</div></div></div></div>; })}</div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>{children}</label>; }
function EmptyState({ icon: Icon, text }: { icon: typeof Check; text: string }) { return <div className="flex items-center gap-3 rounded-md border border-dashed border-border p-5 text-sm text-muted-foreground"><Icon className="h-4 w-4 text-chart-3" />{text}</div>; }
