# Project Workflow & Conventions

A reusable process document for AI-assisted software development with Claude Code. Covers spec-driven planning, triple-tracker discipline, commit hygiene, and deployment workflows.

---

## 1. Project Initialization

### 1.1 Repository Setup
```bash
# Create repo
gh repo create <name> --private  # or --public
git clone <url> && cd <name>

# Initialize Claude Code context
claude
> /init  # Generates CLAUDE.md with project conventions
```

### 1.2 CLAUDE.md — Project Constitution
Create or refine `CLAUDE.md` at repo root. This file is loaded into every Claude Code conversation.

Must include:
- **Stack** — framework, language, build tools
- **Architecture** — key files, data flow, directory structure
- **Rules** — coding conventions, what NOT to do
- **Workflow** — commit practices, checkpoint rules (see §3)

```markdown
# Project Name

## Stack
React + Vite. No external UI libraries. All styles inline.

## Architecture
- src/data/schema.js — single source of truth for all data
- src/components/ — reusable UI components
- src/pages/ — route-level pages

## Rules
- Never use Tailwind, MUI, or any component library
- Keep schema.js as the single source of truth
- Theme tokens live in src/theme.js

## Workflow — Commits & Checkpoints
- ALWAYS commit after completing each phase or significant milestone
- Create git tags for major phase completions (e.g., phase-1, phase-2)
- Never accumulate multiple phases of work without committing
- Stage specific files per commit — no blanket git add .
- Push to remote after each phase commit
- Update ALL tracking systems (GitHub Issues, Project Board, spec-kitty)
```

### 1.3 spec-kitty Setup
```bash
# Install
uv tool install spec-kitty-cli

# Initialize in project
spec-kitty init . --ai claude --force

# Create spec and plan
spec-kitty agent specify  # generates kitty-specs/<name>/spec.md
spec-kitty agent plan     # generates kitty-specs/<name>/plan.md
spec-kitty agent tasks    # generates kitty-specs/<name>/tasks.md + task prompts
```

### 1.4 GitHub Project Board
```bash
# Create project board
gh project create --title "Project Name" --owner <username>

# Note the project number (e.g., #8)
gh project list --owner <username>
```

### 1.5 GitHub Issues — One Per Work Package
```bash
# Create issues for each work package
gh issue create --title "wp-001: Description" --body "## Work Package
...
## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2" --label "infra,priority:high"

# Add to project board
gh project item-add <project-number> --owner <username> --url <issue-url>
```

### 1.6 Labels
Create labels that match your project structure:
```bash
for label in infra content priority:high priority:medium; do
  gh label create "$label" --repo <owner>/<repo>
done
# Add module-specific labels as needed
```

---

## 2. The Triple-Tracker System

Every piece of work is tracked in three places simultaneously. **Work is NOT done until all three reflect the current state.**

### 2.1 Git (Source of Truth)
| Action | Command |
|--------|---------|
| Stage specific files | `git add src/file1.jsx src/file2.jsx` (never `git add .`) |
| Commit with message | `git commit -m "Phase N: what changed and why"` |
| Tag milestones | `git tag phase-N-description` |
| Push | `git push origin main --tags` |

### 2.2 GitHub (Issues + Project Board)
| Action | Command |
|--------|---------|
| Close issue with ref | `gh issue close N --comment "Done in <hash>. Description."` |
| Move board item to Done | `gh project item-edit --project-id <PVT_id> --id <PVTI_id> --field-id <status_field> --single-select-option-id <done_option>` |
| Verify board state | `gh project item-list <number> --owner <user> --format json` |

### 2.3 spec-kitty (Kanban)
| Action | Command |
|--------|---------|
| Move task to done | `spec-kitty agent tasks move-task WP01 --to done --note "Completed" --force` |
| Check kanban status | `spec-kitty agent tasks status` |
| Push auto-commits | `git push origin main` (spec-kitty auto-commits lane changes) |

### 2.4 The Sync Check
After every milestone, run this verification:
```bash
# 1. Git — clean working tree, pushed
git status && git log --oneline origin/main..HEAD

# 2. GitHub — issues closed, board updated
gh issue list --state open --json number,title
gh project item-list <N> --owner <user> --format json | python3 -c "
import json, sys
data = json.load(sys.stdin)
done = [i for i in data['items'] if i['status'] == 'Done']
todo = [i for i in data['items'] if i['status'] == 'Todo']
print(f'Done: {len(done)}, Todo: {len(todo)}')"

# 3. spec-kitty — kanban matches
spec-kitty agent tasks status
```

---

## 3. Commit & Checkpoint Discipline

### 3.1 When to Commit
- After **every completed phase** or significant milestone
- After **every bug fix**
- After **every feature addition** (no matter how small)
- Before switching to a different task
- **NEVER** accumulate multiple phases without committing

### 3.2 Commit Message Format
```
Phase N: Short description of what changed

- Bullet point details
- What was added/changed/fixed
- Reference issue numbers if relevant

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

Use heredoc for multi-line messages:
```bash
git commit -m "$(cat <<'EOF'
Phase 5: Add Lesson 01 — full Quantum Country-style lesson

- 19 MCQ cards across 4 sets
- Prose sections with code blocks and comparison tables
- SRS tracking functional

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

### 3.3 Git Tags
```bash
# Tag format: phase-N or phase-N-description
git tag phase-1
git tag phase-6-l2l3
git tag phase-13-polish

# Always push tags
git push origin main --tags
```

### 3.4 What NOT to Do
- `git add .` or `git add -A` — stages everything including secrets
- `git commit --amend` after hook failure — amends the WRONG commit
- `git push --force` to main — destroys others' work
- `--no-verify` — bypasses safety checks
- Accumulating work across multiple phases without committing

---

## 4. Issue & Task Lifecycle

### 4.1 Creating Issues Before Implementation
**Always create the issue/task BEFORE starting work.** This ensures:
- The work is tracked from the start
- You have acceptance criteria before coding
- The project board reflects what's in progress

```bash
# 1. Create GitHub issue
gh issue create --title "wp-NNN: Description" --body "..." --label "labels"

# 2. Add to project board
gh project item-add <N> --owner <user> --url <issue-url>

# 3. Create spec-kitty task prompt
cat > kitty-specs/<spec>/tasks/WPNN-name.md << 'EOF'
---
id: WPNN
title: Description
lane: doing
---
Description of what needs to be done.
EOF

# 4. Commit the task creation
git add kitty-specs/ && git commit -m "Add WPNN: description" && git push
```

### 4.2 Completing Work
After implementation is done:
```bash
# 1. Build passes
npm run build

# 2. Commit specific files
git add src/specific-files.jsx
git commit -m "WPNN: what was done"
git tag phase-N-description  # if milestone
git push origin main --tags

# 3. Close GitHub issue
gh issue close NN --comment "Done in <hash>. Description."

# 4. Move spec-kitty task
spec-kitty agent tasks move-task WPNN --to done --note "Completed" --force
git push origin main  # push spec-kitty auto-commit

# 5. Deploy if applicable
npm run deploy
```

---

## 5. Deployment Workflow

### 5.1 GitHub Pages (Vite/React)
```bash
# package.json scripts
"build": "vite build",
"deploy": "npm run build && gh-pages -d dist"

# First-time setup
npm install --save-dev gh-pages

# Make repo public (required for free GitHub Pages)
gh repo edit <owner>/<repo> --visibility public --accept-visibility-change-consequences

# Enable Pages
gh api repos/<owner>/<repo>/pages -X POST --input - <<'EOF'
{"source":{"branch":"gh-pages","path":"/"}}
EOF

# Deploy
npm run deploy

# If gh-pages lock file issues:
find node_modules/.cache/gh-pages -name "*.lock" -delete
npx gh-pages -d dist
```

### 5.2 SPA Routing on GitHub Pages
Add `public/404.html` for client-side routing:
```html
<!DOCTYPE html>
<html><head><script>
  var path = window.location.pathname.replace('/<repo-name>', '');
  sessionStorage.setItem('spa-redirect', path);
  window.location.replace('/<repo-name>/');
</script></head></html>
```

And in `index.html`:
```html
<script>
  (function() {
    var redirect = sessionStorage.getItem('spa-redirect');
    if (redirect) {
      sessionStorage.removeItem('spa-redirect');
      window.history.replaceState(null, '', '/<repo-name>' + redirect);
    }
  })();
</script>
```

---

## 6. Directory Structure Convention

```
project/
├── CLAUDE.md                    # Project constitution (always loaded)
├── .claude/
│   ├── settings.json            # Permissions + hooks
│   ├── commands/                # Custom slash commands
│   ├── agents/                  # Custom subagents
│   ├── skills/                  # On-demand expertise
│   └── mcp.json                 # MCP server config
├── kitty-specs/
│   └── <spec-name>/
│       ├── spec.md              # Feature specification
│       ├── plan.md              # Technical plan
│       ├── tasks.md             # Work packages index + kanban table
│       ├── tasks/               # Individual WP prompt files
│       │   ├── WP01-name.md
│       │   ├── WP02-name.md
│       │   └── ...
│       └── research/            # Research notes
├── src/                         # Source code
├── public/                      # Static assets
├── package.json
└── vite.config.js
```

---

## 7. Work Package Naming

| Range | Category | Example |
|-------|----------|---------|
| WP01-WP05 | Infrastructure | Project config, theme, components |
| WP06-WP20 | Core content | Lessons, pages, features |
| WP21-WP23 | Polish & deploy | Review system, deploy |
| WP24+ | Post-launch fixes | Bug fixes, UX improvements, new features |

Format: `wp-NNN: Short imperative description`
- `wp-001: Project config & rename`
- `wp-024: Tighten landing page scroll`
- `wp-036: Add comparison page`

---

## 8. When Things Go Wrong

### Git lock files
```bash
rm -f .git/HEAD.lock .git/index.lock
# If VS Code holds the lock, close the repo folder or disable git.enabled
```

### gh-pages cache corruption
```bash
find node_modules/.cache/gh-pages -name "*.lock" -delete
npx gh-pages -d dist
```

### spec-kitty task not found
Tasks need both a prompt file in `tasks/` AND an entry in `tasks.md`. If `move-task` fails, the prompt file is missing.

### Build fails after edits
Always `npm run build` before committing. Never commit broken code.

### Pre-commit hook fails
The commit did NOT happen. Fix the issue, re-stage, create a NEW commit. Never `--amend` (that modifies the previous successful commit).

---

## 9. Quick Reference — The Completion Checklist

After every piece of work, verify ALL of these:

- [ ] Code changes committed with descriptive message
- [ ] Specific files staged (not `git add .`)
- [ ] Tag created for milestones (`git tag phase-N`)
- [ ] Pushed to remote (`git push origin main --tags`)
- [ ] GitHub issue closed with commit reference
- [ ] GitHub Project board item moved to Done
- [ ] spec-kitty task moved to done
- [ ] spec-kitty auto-commit pushed
- [ ] Build passes (`npm run build`)
- [ ] Deployed if applicable (`npm run deploy`)
- [ ] All three tracking systems verified in sync

---

## 10. Claude Code Memory — What to Save

Save these as persistent memories so future sessions follow the same workflow:

```markdown
# feedback_always_commit.md
ALWAYS commit after every phase/milestone. Create git tags. Never accumulate work.

# feedback_update_all_trackers.md
Update ALL 3 systems: git (commits+tags), GitHub (issues+board), spec-kitty (kanban).
Work is NOT done until all trackers reflect current state.
```

---

*This document was extracted from the claude-code-anki project (81 commits, 14 tags, 43 work packages, 30+ GitHub issues). Adapt the specifics to your project but keep the discipline.*
