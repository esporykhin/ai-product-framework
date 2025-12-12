---
inclusion: always
---

# Documentation Standards

## Core Principle

**Structured, maintainable documentation that scales with the project.** Each feature gets its own folder with a standardized set of files. No dumping everything into a single directory.

## Documentation Structure

### Root `docs/` Folder

Contains only project-wide documentation:
- `ARCHITECTURE.md` - System design, tech stack, folder structure
- `CONTRIBUTING.md` - Development setup, workflow, git conventions
- Feature folders (see below)

### Feature Documentation Structure

Each feature MUST have its own folder: `docs/[feature-name]/`

**Required Files:**

1. **`README.md`** - Feature overview
   - What the feature does (user perspective)
   - Key capabilities and use cases
   - Screenshots or examples if applicable

2. **`TECHNICAL.md`** - Technical implementation
   - Architecture and component structure
   - Data flow and state management
   - API integrations and external dependencies
   - File organization within feature folder
   - Key functions and utilities

3. **`LOGIC.md`** - Business logic and workflows
   - User workflows and interaction patterns
   - Business rules and validation logic
   - Decision trees and conditional flows
   - Edge cases and error handling
   - System analyst perspective

**Optional Files:**

- `API.md` - API contracts if feature has backend integration
- `TESTING.md` - Testing strategy and test cases
- `MIGRATION.md` - Migration guides for breaking changes

### Example Structure

```
docs/
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── chat/
│   ├── README.md          # Chat feature overview
│   ├── TECHNICAL.md       # Component structure, state management
│   └── LOGIC.md           # Message flow, context attachment logic
├── research/
│   ├── README.md          # Research module overview
│   ├── TECHNICAL.md       # API integration, source extraction
│   └── LOGIC.md           # Research workflow, validation logic
└── strategy/
    ├── README.md          # Strategy generation overview
    ├── TECHNICAL.md       # Multi-step AI workflow implementation
    └── LOGIC.md           # Strategy scoring, prioritization logic
```

## File Content Guidelines

### README.md (Feature Overview)

```markdown
# [Feature Name]

## Overview
Brief description of what the feature does.

## Key Capabilities
- Capability 1
- Capability 2

## User Workflows
1. User does X
2. System responds with Y

## Related Features
Links to related documentation
```

### TECHNICAL.md (Implementation)

```markdown
# [Feature Name] - Technical Implementation

## Architecture
Component hierarchy and relationships

## Components
- `ComponentName.tsx` - Purpose and responsibilities
- Key props and state

## Data Flow
How data moves through the feature

## State Management
What state is stored, where, and why

## API Integration
External calls and data transformations

## File Structure
```
src/features/[feature]/
├── FeatureApp.tsx
├── components/
└── views/
```

## Key Functions
- `functionName()` - What it does and when to use it
```

### LOGIC.md (Business Logic)

```markdown
# [Feature Name] - Business Logic

## User Workflows

### Workflow 1: [Name]
1. User action
2. System validation
3. Business rule application
4. Result

## Business Rules
- Rule 1: Condition → Action
- Rule 2: Validation logic

## Decision Trees
When X happens:
- If condition A → outcome 1
- If condition B → outcome 2

## Edge Cases
- Edge case 1: How it's handled
- Edge case 2: Validation and error message

## Data Validation
Input requirements and constraints
```

## Documentation Workflow

### When Adding a New Feature

1. **Create feature folder**: `docs/[feature-name]/`
2. **Create required files**: `README.md`, `TECHNICAL.md`, `LOGIC.md`
3. **Document as you build**: Update docs alongside code
4. **Review before PR**: Ensure all three files are complete

### When Updating a Feature

1. **Identify affected docs**: Which of the 3 files need updates?
2. **Update relevant sections**: Keep docs in sync with code
3. **Don't create new files**: Update existing structure
4. **Maintain consistency**: Follow established format

### When Removing a Feature

1. **Archive or delete**: Move feature folder to `docs/archive/` or delete
2. **Update references**: Remove links from other docs
3. **Update ARCHITECTURE.md**: Reflect current system state

## AI Assistant Rules

### Documentation Creation

**DO:**
- Create feature folder with 3 required files when user adds new feature
- Follow standardized structure and templates
- Update existing docs when code changes
- Ask which file to update if ambiguous (README vs TECHNICAL vs LOGIC)

**DON'T:**
- Create standalone markdown files outside feature folders
- Create summary or changelog files after tasks
- Dump all docs into root `docs/` folder
- Create documentation for minor changes or bug fixes

### Response Behavior

- Keep summaries minimal (2-3 sentences)
- No verbose recaps or bullet lists in summaries
- No "work completed" documentation files
- Only document when explicitly requested or when adding major features

## Maintenance

### Regular Reviews

- Quarterly review of all feature docs for accuracy
- Remove outdated information
- Update examples to match current code
- Consolidate redundant information

### Documentation Debt

- Fix inaccuracies immediately when discovered
- Update docs when refactoring features
- Keep technical details current with implementation
- Maintain consistency across all feature folders

## Language Conventions

- **Russian**: User-facing descriptions, workflows, business logic
- **English**: Technical terms, code examples, function names
- **Mixed**: Use English for technical concepts, Russian for explanations

## Quality Checklist

Before considering documentation complete:

- [ ] Feature folder exists in `docs/[feature-name]/`
- [ ] All 3 required files present (README, TECHNICAL, LOGIC)
- [ ] README explains what feature does from user perspective
- [ ] TECHNICAL covers implementation details and architecture
- [ ] LOGIC documents business rules and workflows
- [ ] Code examples are accurate and up-to-date
- [ ] Links to related features work
- [ ] Language conventions followed
- [ ] No redundant or outdated information
