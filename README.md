# Skill Navigator

Build a full-stack "AI Skill Gap Analyzer" web application.

TECH STACK

- Frontend: HTML, CSS, JavaScript

- Backend: Python

- Database: MySQL

- Libraries: pandas, numpy for data processing

- Dataset: structured data covering job roles, skills, courses, certifications, and skill requirements

CORE WORKFLOW

User Login → Profile/Resume → Skill Extraction → Skill Analysis → Job Selection →

Skill Requirement → Skill Gap → Match Percentage → Recommendations → Learning Roadmap → 

Progress Tracking → Dashboard

MODULES TO IMPLEMENT

1. User & Profile Management

   - Registration, login/authentication, and session handling

   - Users can add/update personal, educational, and career details

2. Resume Upload & Skill Extraction

   - Users upload a resume (PDF/DOC)

   - Backend parses the resume and extracts technical skills, programming languages,

     tools, technologies, and certifications

   - Handle varying resume formats/layouts via text preprocessing

3. Current Skill Analysis

   - Categorize extracted skills by proficiency level and area of expertise

   - Normalize skill names so variants (e.g. "Python Programming" vs "Python") are

     treated as the same skill

4. Job Role & Industry Selection

   - Let users pick a target role/industry (e.g. Data Analyst, Data Scientist,

     ML Engineer, Software Developer)

   - Maintain a reference dataset of required skills per role/industry

5. Skill Gap Identification

   - Compare user's current skills against the selected role's required skills

   - Flag missing skills and skills that exist but are below the required level

6. Skill Match Percentage

   - Calculate and display a quantitative match score between user's profile

     and the target role's requirements

7. Course & Certification Recommendations

   - Recommend certifications/courses/resources targeted at the identified gaps

   - Filter recommendations by relevance to the user's specific gaps and chosen role

8. Personalized Learning Roadmap

   - Generate a step-by-step sequenced learning plan to close the skill gaps

9. Learning Progress Tracking

   - Let users mark courses/certifications as in-progress or completed

   - Reflect progress over time

10. Dashboard

    - Single visual view summarizing: current skills, skill gaps, match percentage,

      recommendations, and learning progress

    - Should be simple and easy to read (charts/progress bars preferred over raw tables)

DATA HANDLING NOTES

- Use pandas/numpy for cleaning, deduplicating, and preprocessing skill/job datasets

- Design the job-role-to-skill mapping as a structured, extensible dataset (not hardcoded

  per role) so new roles can be added easily

NON-FUNCTIONAL REQUIREMENTS

- Reasonable response time on skill extraction and gap analysis (no unnecessary delays)

- Clean, understandable UI for non-technical users (students/job seekers)

- Modular architecture: frontend, backend, database, skill-analysis engine, and

  recommendation engine should be loosely coupled and independently testable

OUT OF SCOPE FOR NOW (future enhancements, don't build yet)

- Real-time job market scraping / live job portal integration

- LinkedIn integration

- AI career chatbot / AI interview prep

- Salary prediction

- Mobile app, multilingual support

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/91188e3a-30c4-4c35-a886-164d239b6894).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
