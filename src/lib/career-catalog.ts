export type ExperienceLevel = "Entry" | "Mid" | "Senior" | "Lead"
export type JobCategory = "Support" | "Infrastructure" | "Cloud & DevOps" | "Software" | "Data & AI" | "Cybersecurity" | "Testing" | "Business & Design"

export type JobRecord = {
  title: string
  category: JobCategory
  description: string
  requiredSkills: string[]
  preferredSkills: string[]
  tools: string[]
  certifications: string[]
  education: string
  experience: ExperienceLevel
  responsibilities: string[]
  growth: string
  relatedRoles: string[]
}

export const roleCatalog = {
  "IT Support Engineer": ["Windows", "Hardware", "Networking", "Troubleshooting", "Ticketing"],
  "Help Desk Technician": ["Windows", "Hardware", "Networking", "Customer Support", "Troubleshooting"],
  "Desktop Support Engineer": ["Windows", "Active Directory", "Hardware", "Networking", "Troubleshooting"],
  "System Administrator": ["Linux", "Windows Server", "Networking", "Active Directory", "PowerShell", "Bash"],
  "Linux Administrator": ["Linux", "Bash", "Networking", "SSH", "Systemd", "Security"],
  "Windows Administrator": ["Windows Server", "Active Directory", "DNS", "DHCP", "PowerShell"],
  "Infrastructure Engineer": ["Linux", "Windows Server", "Networking", "Virtualization", "Cloud"],
  "Infrastructure Architect": ["Networking", "Servers", "Cloud", "Virtualization", "Architecture"],
  "Network Administrator": ["TCP/IP", "Routing", "Switching", "VLAN", "DNS", "DHCP"],
  "Network Engineer": ["TCP/IP", "Routing", "Switching", "VLAN", "OSPF", "BGP", "Firewalls"],
  "Network Architect": ["Network Design", "Routing", "Switching", "Security", "Cloud Networking"],
  "NOC Engineer": ["Networking", "Monitoring", "TCP/IP", "Troubleshooting", "Incident Management"],
  "Network Security Engineer": ["Firewalls", "VPN", "IDS/IPS", "TCP/IP", "Network Security"],
  "Cloud Engineer": ["AWS", "Azure", "Google Cloud", "Linux", "Networking", "IAM", "Terraform", "Docker"],
  "Cloud Administrator": ["AWS", "Azure", "Google Cloud", "IAM", "Virtual Machines", "Storage", "Networking"],
  "Cloud Architect": ["Cloud Architecture", "Networking", "Security", "IAM", "Scalability", "Terraform"],
  "Cloud Security Engineer": ["Cloud Security", "IAM", "Networking", "Encryption", "Security Monitoring"],
  "Cloud Network Engineer": ["VPC/VNet", "Routing", "VPN", "DNS", "Load Balancing", "Firewalls"],
  "DevOps Engineer": ["Linux", "Git", "CI/CD", "Docker", "Kubernetes", "Terraform", "Cloud"],
  "DevSecOps Engineer": ["DevOps", "Security", "CI/CD", "Docker", "Kubernetes", "SAST/DAST"],
  "Site Reliability Engineer": ["Linux", "Cloud", "Kubernetes", "Monitoring", "Automation", "Python"],
  "Platform Engineer": ["Cloud", "Kubernetes", "Terraform", "CI/CD", "Linux", "Automation"],
  "Kubernetes Engineer": ["Kubernetes", "Docker", "Helm", "Linux", "Networking", "Terraform"],
  "Automation Engineer": ["Python", "Bash", "PowerShell", "Ansible", "APIs", "Automation"],
  "Software Developer": ["Programming", "OOP", "Git", "SQL", "APIs", "Debugging"],
  "Software Engineer": ["Programming", "DSA", "OOP", "Git", "System Design", "Databases"],
  "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "Angular", "Vue", "Git"],
  "Backend Developer": ["Java", "Python", "Node.js", "APIs", "SQL", "Databases", "Git"],
  "Full Stack Developer": ["HTML", "CSS", "JavaScript", "React", "Backend", "SQL", "APIs"],
  "Web Developer": ["HTML", "CSS", "JavaScript", "Web Frameworks", "Git"],
  "Java Developer": ["Java", "Spring Boot", "SQL", "REST APIs", "Git", "OOP"],
  "Python Developer": ["Python", "Django", "Flask", "FastAPI", "SQL", "APIs", "Git"],
  ".NET Developer": ["C#", ".NET", "ASP.NET", "SQL", "REST APIs", "Git"],
  "C++ Developer": ["C++", "OOP", "DSA", "STL", "Multithreading", "Git"],
  "Mobile App Developer": ["Kotlin", "Java", "Android", "APIs", "Databases", "Git"],
  "Application Developer": ["Programming", "SQL", "APIs", "SDLC", "Debugging"],
  "Software Architect": ["System Design", "Architecture", "Microservices", "Cloud", "Security"],
  "Database Administrator": ["SQL", "Backup/Recovery", "Database Security", "Performance Tuning"],
  "Database Engineer": ["SQL", "Database Design", "Performance", "Replication", "Cloud"],
  "Data Analyst": ["SQL", "Excel", "Power BI", "Tableau", "Statistics", "Data Visualization"],
  "Data Engineer": ["Python", "SQL", "ETL", "Spark", "Kafka", "Airflow", "Cloud"],
  "Data Scientist": ["Python", "Statistics", "Machine Learning", "SQL", "Pandas"],
  "Data Architect": ["Data Modeling", "SQL", "Cloud", "Data Warehousing", "Architecture"],
  "BI Developer": ["SQL", "Power BI", "Tableau", "Data Modeling", "ETL"],
  "Big Data Engineer": ["Python", "Scala", "Spark", "Hadoop", "Kafka", "SQL"],
  "Machine Learning Engineer": ["Python", "Machine Learning", "TensorFlow", "PyTorch", "SQL", "MLOps"],
  "ML Engineer": ["Python", "Machine Learning", "Docker", "TensorFlow", "SQL", "Cloud"],
  "AI Engineer": ["Python", "Machine Learning", "Deep Learning", "APIs", "Cloud"],
  "Generative AI Engineer": ["Python", "LLMs", "RAG", "APIs", "Vector Databases", "Prompt Engineering"],
  "NLP Engineer": ["Python", "NLP", "Transformers", "LLMs", "Deep Learning"],
  "Computer Vision Engineer": ["Python", "OpenCV", "Deep Learning", "Computer Vision"],
  "MLOps Engineer": ["Python", "Machine Learning", "Docker", "Kubernetes", "CI/CD", "Cloud"],
  "Cybersecurity Analyst": ["Networking", "Linux", "SIEM", "Threat Analysis", "Incident Response"],
  "SOC Analyst": ["SIEM", "Networking", "Linux", "Log Analysis", "Incident Response"],
  "Security Engineer": ["Firewalls", "IAM", "IDS/IPS", "Encryption", "Linux"],
  "Cybersecurity Engineer": ["Network Security", "Cloud Security", "IAM", "SIEM", "Vulnerability Management"],
  "Security Architect": ["Security Architecture", "Cloud", "Networking", "Zero Trust", "IAM"],
  "Penetration Tester": ["Linux", "Networking", "Nmap", "Burp Suite", "OWASP", "Web Security"],
  "Ethical Hacker": ["Linux", "Networking", "Vulnerability Testing", "OWASP", "Security Tools"],
  "Incident Response Analyst": ["SIEM", "Forensics", "Malware Analysis", "Incident Response"],
  "Vulnerability Analyst": ["Vulnerability Scanning", "CVE", "Risk Assessment", "Security Tools"],
  "IAM Engineer": ["Active Directory", "Entra ID", "IAM", "SSO", "MFA", "RBAC"],
  "Application Security Engineer": ["OWASP", "Secure Coding", "SAST", "DAST", "DevSecOps"],
  "GRC Analyst": ["Risk Management", "ISO 27001", "NIST", "Compliance", "Auditing"],
  "IT Auditor": ["IT Controls", "Risk", "Compliance", "Auditing", "Cybersecurity"],
  "QA Engineer": ["Manual Testing", "Automation", "SDLC", "Test Cases", "Bug Tracking"],
  "Manual Tester": ["Functional Testing", "Regression Testing", "Test Cases", "Bug Tracking"],
  "Automation Tester": ["Selenium", "Playwright", "Cypress", "Java", "Python", "JavaScript", "API Testing"],
  "Performance Tester": ["JMeter", "Load Testing", "Performance Analysis", "Monitoring"],
  "API Tester": ["REST APIs", "Postman", "SQL", "Automation", "HTTP"],
  "Test Lead": ["Test Strategy", "Automation", "QA", "Agile", "Leadership"],
  "Business Analyst": ["Requirements", "SQL", "Excel", "Documentation", "Communication"],
  "Systems Analyst": ["Systems Analysis", "SQL", "Requirements", "Documentation"],
  "IT Consultant": ["IT Architecture", "Business Analysis", "Cloud", "Communication"],
  "Technical Consultant": ["Technical Architecture", "Cloud", "Networking", "Troubleshooting"],
  "IT Project Manager": ["Project Management", "Agile", "Scrum", "Planning", "Communication"],
  "Scrum Master": ["Scrum", "Agile", "Facilitation", "Leadership", "Communication"],
  "Product Manager": ["Product Strategy", "Agile", "Analytics", "Communication", "Leadership"],
  "IT Manager": ["IT Operations", "Infrastructure", "Security", "Leadership", "Budgeting"],
  "IT Service Desk Analyst": ["ITIL", "Ticketing", "Troubleshooting", "Windows", "Communication"],
  "IT Operations Engineer": ["Linux", "Windows", "Networking", "Monitoring", "Automation"],
  "Application Support Engineer": ["SQL", "Linux", "Application Troubleshooting", "APIs", "Monitoring"],
  "Release Engineer": ["Git", "CI/CD", "Jenkins", "Automation", "Deployment"],
  "Build Engineer": ["Git", "Build Systems", "CI/CD", "Scripting", "Automation"],
  "Systems Engineer": ["Linux", "Windows", "Networking", "Virtualization", "Cloud"],
  "Virtualization Engineer": ["VMware", "Hyper-V", "Virtual Machines", "Networking", "Storage"],
  "VMware Administrator": ["VMware vSphere", "ESXi", "vCenter", "Storage", "Networking"],
  "Hardware Engineer": ["Computer Hardware", "Electronics", "Troubleshooting", "Networking"],
  "IT Hardware Technician": ["Hardware", "Windows", "Networking", "Troubleshooting"],
  "UI Designer": ["Figma", "UI Design", "Typography", "Visual Design"],
  "UX Designer": ["UX Research", "Wireframing", "Prototyping", "Figma"],
  "UI/UX Designer": ["Figma", "UX", "UI", "Prototyping", "User Research"],
  "Product Designer": ["UI/UX", "Figma", "User Research", "Product Thinking"],
  "Game Developer": ["C++", "C#", "Unity", "Unreal", "Game Physics", "3D"],
  "IoT Engineer": ["Embedded Systems", "C/C++", "Python", "Networking", "Sensors"],
  "Robotics Engineer": ["Python", "C++", "Robotics", "ROS", "Computer Vision"],
  "Blockchain Developer": ["Solidity", "Ethereum", "Web3", "JavaScript", "Smart Contracts"],
  "ERP Consultant": ["ERP Systems", "Business Processes", "SQL", "Configuration"],
  "SAP Consultant": ["SAP", "Business Processes", "SQL", "Configuration"],
  "Technical Writer": ["Documentation", "Technical Knowledge", "Communication", "Markdown"],
  "Solutions Architect": ["Cloud", "System Design", "Networking", "Security", "APIs"],
  "Enterprise Architect": ["Architecture", "Cloud", "IT Strategy", "Security", "Governance"],
  "CTO": ["Technology Strategy", "Architecture", "Leadership", "Business"],
  "CIO": ["IT Strategy", "Governance", "Leadership", "Risk Management"],
} as const;

export type RoleKey = keyof typeof roleCatalog

const categoryFor = (title: string): JobCategory => {
  if (["IT Support Engineer", "Help Desk Technician", "Desktop Support Engineer", "IT Service Desk Analyst", "Technical Support Engineer", "IT Hardware Technician"].includes(title)) return "Support"
  if (["System Administrator", "Linux Administrator", "Windows Administrator", "Network Administrator", "Network Engineer", "Infrastructure Engineer", "Infrastructure Architect", "Network Architect", "NOC Engineer", "Virtualization Engineer", "VMware Administrator", "Hardware Engineer", "Systems Engineer"].includes(title)) return "Infrastructure"
  if (["Cloud Engineer", "Cloud Administrator", "Cloud Architect", "Cloud Security Engineer", "Cloud Network Engineer", "DevOps Engineer", "DevSecOps Engineer", "Site Reliability Engineer", "Platform Engineer", "Kubernetes Engineer", "Automation Engineer", "MLOps Engineer", "Release Engineer", "Build Engineer"].includes(title)) return "Cloud & DevOps"
  if (["Data Analyst", "Data Engineer", "Data Scientist", "Data Architect", "BI Developer", "Big Data Engineer", "Machine Learning Engineer", "ML Engineer", "AI Engineer", "Generative AI Engineer", "NLP Engineer", "Computer Vision Engineer"].includes(title)) return "Data & AI"
  if (["Cybersecurity Analyst", "SOC Analyst", "Security Engineer", "Cybersecurity Engineer", "Security Architect", "Penetration Tester", "Ethical Hacker", "Incident Response Analyst", "Vulnerability Analyst", "IAM Engineer", "Application Security Engineer", "GRC Analyst", "IT Auditor", "Network Security Engineer"].includes(title)) return "Cybersecurity"
  if (["QA Engineer", "Manual Tester", "Automation Tester", "Performance Tester", "API Tester", "Test Lead"].includes(title)) return "Testing"
  if (["Business Analyst", "Systems Analyst", "IT Consultant", "Technical Consultant", "IT Project Manager", "Scrum Master", "Product Manager", "IT Manager", "UI Designer", "UX Designer", "UI/UX Designer", "Product Designer", "Technical Writer", "ERP Consultant", "SAP Consultant", "CTO", "CIO", "Enterprise Architect", "Solutions Architect"].includes(title)) return "Business & Design"
  return "Software"
}

const preferredByCategory: Record<JobCategory, string[]> = {
  Support: ["ITIL", "PowerShell", "Active Directory"],
  Infrastructure: ["Ansible", "VMware", "Monitoring"],
  "Cloud & DevOps": ["Helm", "Ansible", "Jenkins"],
  Software: ["Testing", "System Design", "Agile"],
  "Data & AI": ["Docker", "Cloud", "Data Visualization"],
  Cybersecurity: ["Python", "Cloud Security", "SIEM"],
  Testing: ["Git", "CI/CD", "API Testing"],
  "Business & Design": ["Leadership", "Documentation", "Analytics"],
}

const certificationByCategory: Record<JobCategory, string[]> = {
  Support: ["CompTIA A+", "ITIL Foundation"],
  Infrastructure: ["CompTIA Network+", "Microsoft Certified"],
  "Cloud & DevOps": ["AWS Certified", "Azure Administrator"],
  Software: ["Cloud Practitioner", "Scrum certification"],
  "Data & AI": ["Google Data Analytics", "Azure Data Scientist"],
  Cybersecurity: ["CompTIA Security+", "CISSP"],
  Testing: ["ISTQB Foundation", "ISTQB Advanced"],
  "Business & Design": ["PMP", "ITIL Foundation"],
}

export const jobs: JobRecord[] = Object.entries(roleCatalog).map(([title, skills], index) => {
  const category = categoryFor(title)
  const experience: ExperienceLevel = index % 5 === 0 ? "Senior" : index % 3 === 0 ? "Mid" : "Entry"
  return {
    title, category, description: `${title} professionals design, operate, and improve dependable technology solutions for modern teams.`,
    requiredSkills: [...skills], preferredSkills: preferredByCategory[category], tools: [...skills].slice(0, 4), certifications: certificationByCategory[category],
    education: category === "Business & Design" ? "Relevant degree or equivalent practical experience" : "Computer science, information technology, or equivalent experience",
    experience, responsibilities: [`Build and improve ${title.toLowerCase()} workflows`, "Collaborate with technical and business partners", "Document solutions and measure outcomes"],
    growth: `Progress toward senior ${title}, technical leadership, or a related specialist role.`, relatedRoles: [title, ...Object.keys(roleCatalog).filter((role) => role !== title && categoryFor(role) === category).slice(0, 2)],
  }
})

export const categories: JobCategory[] = ["Support", "Infrastructure", "Cloud & DevOps", "Software", "Data & AI", "Cybersecurity", "Testing", "Business & Design"]
export const experienceLevels: ExperienceLevel[] = ["Entry", "Mid", "Senior", "Lead"]
export const allCatalogSkills = Array.from(new Set(Object.values(roleCatalog).flat())).sort()
