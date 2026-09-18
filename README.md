# Your AI Co-pilot

Build a modern, responsive AI Workplace Productivity Assistant as a frontend-only SaaS web application.

Core Requirement

All email drafts, meeting summaries, action items, decisions, deadlines, and task schedules must be AI-generated dynamically from the user’s input. Do not use generic, hardcoded, or pre-written responses.

Features

1. Smart Email Generator

User enters the email purpose/details.

AI generates a complete professional email.

Tone options: Formal, Friendly, Persuasive.

Generated email is editable and copyable.

2. Meeting Notes Summarizer

User pastes lengthy meeting notes.

AI generates a concise summary.

AI extracts Action Items, Decisions, Responsible Persons, and Deadlines when available.

Output is editable and copyable.

3. AI Task Planner

User enters their tasks, priorities, and deadlines.

AI creates a daily or weekly schedule.

AI prioritizes tasks based on urgency, importance, and deadlines.

Generated schedule is editable.

UI

Modern, clean SaaS dashboard.

Dark grey/charcoal colour palette.

Sidebar navigation: Dashboard, Email Generator, Meeting Summarizer, Task Planner.

Fully responsive for desktop, tablet, and mobile.

Use professional cards, forms, buttons, icons, and clear AI output sections.

Include loading, empty, and error states.

AI Integration

Connect each feature to an AI model/API so responses are generated dynamically.

Use structured AI prompts tailored to each feature.

Never return fixed sample answers as the actual result.

Clearly indicate when content is AI-generated.

Data & Backend

No backend, database, authentication, or persistent storage.

Do not save user inputs or AI outputs.

Keep the application lightweight and suitable for a prototype.

Responsible AI

Include a visible disclaimer:
“AI-generated content may contain errors. Always review and verify outputs before using them for important workplace decisions or communications. Do not enter confidential or sensitive information.”

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/579cefa6-f231-4275-9974-76d0411f99a3).

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
