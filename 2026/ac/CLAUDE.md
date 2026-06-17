# CLAUDE.md — Artist Studio Context

This file is the standing context for all conversations about an artist's practice. Load it at the start of any project session. It maps the theoretical frameworks, critical tools, and practical knowledge available from a completed Artist Commons (AC) program — 23 lessons, 23 summary files, and 20 Claude Code slash commands — and provides routing guidance for applying them to studio work, critique, analysis, writing, and professional decisions.

---

## Who This Is For

The artist working in this directory has completed a professional certificate program in visual art covering art history, philosophy of art, semiotics, generative/AI art, interactive art, appropriation, quilting as contemporary practice, IP law, portfolio building, and curator outreach. The program materials are in this directory; summaries are in `summaries/` and slash commands are in `.claude/commands/`.

When discussing the artist's work, apply frameworks from this program rather than defaulting to generic art commentary. The goal in every conversation is to help the artist think more precisely — about what they are making, why it means what it means, who is watching, and what it is saying.

---

## What Is Available

### Summaries (`2026/ac/summaries/`)
Twenty-three markdown files, one per lesson. Each covers: overview, key concepts and frameworks, artists and works referenced, core takeaways, and studio reflection questions. Read these when you need the full detail of a framework before applying it.

### Slash Commands (`.claude/commands/`)
Twenty interactive skill prompts. Each walks the artist through a structured studio exercise using the lesson's frameworks. Invoke by typing `/command-name` followed by a description of the work.

---

## Task-to-Framework Routing Guide

Use this to decide which framework or command to reach for based on what the artist needs.

### Analyzing or describing a work (yours or another artist's)
- Start with `/visual-analysis` (Feldman Method: describe → analyze → interpret → evaluate). This is the foundational tool for any close reading of a visual work.
- For works that use text as a visual element, add `/text-in-art` (Part 1: Dada, Cubism, Constructivism, Surrealism; Part 2: conceptual art, feminist art, AIDS activism, and text moved out of the gallery into public/commercial circulation).
- For works involving moving image, interaction, or digital media, add `/interactivity-analysis` or `/narrative-interactivity`.

### Critiquing work in a group or cohort setting
- Use `/better-crit` (8-step framework: start with effect, never lead with opinion, use observation/effect/evidence structure).

### Asking "what does this mean?" or "how does it communicate?"
- For sign types and symbolic logic: `/semiotics-analysis` (Peirce's icon/index/symbol; Goodman's denotation/exemplification/expression; Carroll's intentionalism; Walton's category).
- For the larger systems that make signs readable: `/meaning-conditions` (Saussure's code; Barthes's myth; Hall's encoding/decoding; Eco's open work). This is the right tool when the question is not "what is this sign?" but "what system makes this readable, and who can read it?"
- For text specifically embedded in visual work: `/text-in-art`.

### Asking "what kind of thing am I making?" or "what is art?"
- For analytic philosophy of art: `/analytic-philosophy` (mimesis, formalism, institutional theory, Weitz's open concept).
- For continental philosophy: `/what-am-i-making` (Benjamin on aura, Heidegger on strange tools, Adorno on autonomy through refusal, Rancière on the distribution of the sensible).
- These two commands form a complete philosophical toolkit — analytic for ontological questions (is this art?), continental for political/experiential questions (what does art do in the world?).

### Working with technology, algorithms, or AI
- For AI and vision systems: `/ai-art-context` (regimes of vision, optical unconscious, society of spectacle, database logic — Manovich).
- For generative art and chance-based systems: `/systems-uncertainty` (control/randomness spectrum from Paleolithic to on-chain; four types of randomness; cybernetics).
- For interactive works: `/interactivity-analysis` (object-to-field shift; three cybernetic conflicts: control, constraints, black box).
- For narrative and database structures: `/narrative-interactivity` (ergodic text; database vs. narrative logic; game vs. play; Net Art as political act).

### Examining influence, sources, and originality
- Use `/originality-audit` (Kirby Ferguson's copy/transform/combine; guild copying as learning; fair use factors; Wiley/Ringgold insertion and reclamation framework).

### Working with craft, textile, or material-based logic
- For history and global traditions: `/quilting-history` (piecing/layering; Kantha, Bojagi/Jogakpo, Sashiko/Boro; wabi-sabi; mottainai).
- For quilting as conceptual framework applicable to any medium: `/quilting-contemporary` (quilt as verb not noun; palimpsest; story quilts; memorial and activism). This command is useful even if the artist does not work with fabric — the quilting logic (select disparate elements, layer and piece, stitch to unify while showing seams) applies to any practice.

### Writing about the work (statements, essays, applications)
- Use `/write-about-art` (three-question framework; word-list brainstorm method; specificity as primary virtue; anti-generality discipline; and the full revision practice from Lesson 140 — hotspotting, editing hacks, and writing partners). Reach for the revision half when the artist already has a draft and needs to sharpen it, not generate it.
- For criticism that reaches a public audience: `/cultural-criticism` (Alissa Wilkinson's model of criticism as expansion; pseudonarrative; how business shapes form).

### Professional and practical decisions
- Building or editing a portfolio: `/portfolio-review` (portfolio as persuasion; gather/edit/sequence; six sequencing methods; grouping vs. weaving).
- Reaching out to curators or galleries: `/approach-curator` (warm vs. cold outreach; dream list of 15–20; curator vs. gallerist distinction; studio visit sequencing).
- Preparing a pitch or exhibition proposal: `/curator-pitch` (three exhibition pillars: date/location/artist; post-show strategy; warm introductions).
- Navigating copyright or fair use: `/ip-art-check` (bundle of sticks; copyright at creation vs. registration; idea/expression dichotomy; cease-and-desist discipline).

---

## Core Frameworks — Reference

These are the most frequently applicable frameworks. Have them at hand in any session without reading the full summaries.

### Feldman Method (Lesson 103 · `/visual-analysis`)
Four-phase close reading: **Describe** (inventory what is literally present — no interpretation), **Analyze** (formal relationships: composition, line, color, texture, scale, space), **Interpret** (what does the work mean? what is it doing?), **Evaluate** (how well does it do it, by what criteria?). Never skip description — most weak criticism jumps straight to interpretation.

### Saussure / Barthes / Hall / Eco (Lesson 136 · `/meaning-conditions`)
- **Code (Saussure):** Signs mean relationally, not essentially. Ask: what system makes this readable, and who has access to it?
- **Myth (Barthes):** Denotation → connotation → myth (history disguised as nature). Ask: what myth is already in the material before the artist begins?
- **Encoding/Decoding (Hall):** Artist encodes; audience decodes from their social position. Dominant / negotiated / oppositional readings. Ask: who is my decoder and what is their position?
- **Open Work (Eco):** Closed → guided → open → underbuilt. Artist builds conditions; viewer completes meaning. Underbuilt is a failure, not a virtue.

### Peirce / Goodman / Carroll / Walton (Lesson 127 · `/semiotics-analysis`)
- **Peirce:** Icon (resemblance), index (causal trace), symbol (arbitrary convention).
- **Goodman:** Denotation (refers to), exemplification (refers back to a property it has), expression (metaphorically exemplifies).
- **Carroll:** Moderate actual intentionalism — meaning is constrained by what the artist could plausibly have meant.
- **Walton:** Category membership shapes perception. Knowing a work is a collage changes how you read every mark.

### Benjamin / Heidegger / Adorno / Rancière (Lesson 120 · `/what-am-i-making`)
- **Benjamin:** Aura — the presence of the original in time and place. Mechanical reproduction dissolves aura but opens political possibility.
- **Heidegger:** Art as aletheia — unconcealment. Strange tools: when a tool breaks, you see it as it is. Art breaks the tool of ordinary perception.
- **Adorno:** Autonomy through refusal. Art resists the culture industry by refusing easy consumption. Difficulty is not a defect.
- **Rancière:** Distribution of the sensible — who is allowed to be seen, heard, counted. Art intervenes in what is perceptible.

### Analytic Philosophy of Art (Lesson 107 · `/analytic-philosophy`)
Four theories of what art is: **Mimesis** (representation of reality), **Formalism** (significant form — Bell; aesthetic emotion), **Institutional Theory** (Dickie — art is what the artworld confers), **Open Concept** (Weitz — art resists necessary and sufficient conditions; family resemblance; classification is always provisional).

### Copy / Transform / Combine (Lesson 129 · `/originality-audit`)
Kirby Ferguson's three-step frame for examining any work's relationship to its sources. All creative work copies, transforms, and combines. The question is whether the transformation is sufficient to constitute a new object with its own meaning — and whether you know your sources well enough to own them.

### 8-Step Crit Framework (Lesson 109 · `/better-crit`)
1. Describe the formal properties. 2. State the effect the work has on you. 3. Connect effect to specific observation. 4. Propose an interpretation. 5. Test against other elements. 6. Consider alternative readings. 7. Evaluate effectiveness. 8. Identify next studio move. Never lead with opinion. Use the structure: **observation → effect → evidence**.

### Encoding / Openness (Lesson 136 · `/meaning-conditions`)
Before finalizing any work, run it through Eco's four-degree check: Is the viewer given enough to complete the meaning (guided/open) or is the structure so loose it collapses (underbuilt)? The open work is not the vague work — it is the precisely structured invitation.

### Write About Your Art (Lessons 133–137, 140 · `/write-about-art`)
Three-question framework: (1) **What is it?** — concrete, specific, what does it look like? (2) **What might it mean?** — scaffolding for viewer understanding, broad themes grounded in the work, write from wonder not answers. (3) **Why does it matter?** — traceable to questions 1–2, personal stakes, reasons to care.

**Key concepts:** Specificity as primary virtue (not "explores themes of memory" but the exact imagery that makes it specific to you). Word-list brainstorming: 30–50 words → find unexpected ones → build sentences. Free-writing exercises to generate material. Avoid art clichés ("interrogates," "liminal," "explores themes") — if you've heard it before, rewrite. Scaffolding as primary job: set up conditions for viewers to think more deeply, not explain everything away. The open work is precisely structured, not vague.

**Revision (Lesson 140):** Editing — not drafting — is the real writing. The statement is a roadmap, not the journey; composition is nonlinear (the thesis is found by writing, so the opening is often written last). Core exercise is **hotspotting** (mark the few strongest sentences, rewrite fresh text around each, sub it back in). Editing hacks make familiar text strange again: read aloud, change the font, print and edit by hand, cut the preamble, swap words for connotation (*aroma* vs. *odor*). Sentence craft: one thought per sentence, vary rhythm, pick verbs of muscle. Use writing partners, swapped drafts, and the Red Star exercise (mark where attention drifts) to get out of your own head.

---

## Guidelines for This Claude Instance

When working on any art project in this directory, apply these orientations:

**For critique and analysis:** Use Feldman as the entry point for any close reading. Never move from description to interpretation without the analytic step. When analyzing another artist's work, also reach for the most relevant framework from semiotics, philosophy, or cultural criticism.

**For theoretical framing:** Match the philosophical register to the question. Analytic frameworks (Lesson 107) answer "what kind of thing is this?" Continental frameworks (Lesson 120) answer "what does this do in the world politically and experientially?" Semiotic frameworks (Lessons 127, 136) answer "how does it mean, and for whom?"

**For writing:** Default to `/write-about-art` as a starting point. Push toward maximum specificity. Resist abstractions that could apply to any work. The test: could this sentence appear in a different artist's statement? If yes, it is not specific enough.

**For professional advice:** Always check whether the question is primarily about relationships (curator outreach), documents (portfolio), positioning (pitch), or rights (IP). Route accordingly.

**For new or unfamiliar territory:** If the artist's work touches technology, AI, or interactive systems, reach for Lessons 105, 108, 116, or 119 before speaking generally. The conceptual vocabulary in those summaries is more precise than generalist AI-and-art discourse.

**Default orientation:** The artist in this program has been trained to think rigorously about their practice. Match that rigor. Prefer a precise question over a comfortable answer. Prefer a framework over a generalization. Prefer one specific sentence over three vague ones.

---

## Full Lesson Index

| # | Topic | Summary | Slash Command |
|---|-------|---------|---------------|
| 103 | Visual Analysis (Feldman Method) | `summaries/103_Visual_Analysis.md` | `/visual-analysis` |
| 105 | Machines Learn To See (regimes of vision, AI) | `summaries/105_Machines_Learn_To_See.md` | `/ai-art-context` |
| 107 | Philosophy of Art: Analytic Canon | `summaries/107_Philosophy_Analytic_Canon.md` | `/analytic-philosophy` |
| 108 | Systems Learn Uncertainty (generative art) | `summaries/108_Systems_Learn_Uncertainty.md` | `/systems-uncertainty` |
| 109 | How to Crit Better | `summaries/109_How_to_Crit_Better.md` | `/better-crit` |
| 113 | How to Build a Portfolio | `summaries/113_Portfolio.md` | `/portfolio-review` |
| 116 | Architecture of Interactivity | `summaries/116_Architecture_of_Interactivity.md` | `/interactivity-analysis` |
| 118 | Interview: Alissa Wilkinson (cultural criticism) | `summaries/118_Interview_Alissa_Wilkinson.md` | `/cultural-criticism` |
| 119 | Narrative Interactivity | `summaries/119_Narrative_Interactivity.md` | `/narrative-interactivity` |
| 120 | Philosophy of Art: Continental (Benjamin/Heidegger/Adorno/Rancière) | `summaries/120_Philosophy_Part2.md` | `/what-am-i-making` |
| 123 | How to Approach Curators and Galleries | `summaries/123_Approaching_Curators_Galleries.md` | `/approach-curator` |
| 125 | Quilting Part 1 (history and global traditions) | `summaries/125_Quilting_Part1.md` | `/quilting-history` |
| 126 | Panel with Curators | `summaries/126_Curator_Panel.md` | `/curator-pitch` |
| 127 | Semiotics (Peirce/Goodman/Carroll/Walton) | `summaries/127_Semiotics.md` | `/semiotics-analysis` |
| 129 | Nothing Is Original (appropriation) | `summaries/129_Nothing_Is_Original.md` | `/originality-audit` |
| 130 | Quilting Part 2 (as concept and activism) | `summaries/130_Quilting_Part2.md` | `/quilting-contemporary` |
| 131 | IP Law Interview (David Shein) | `summaries/131_IP_Law_Interview.md` | `/ip-art-check` |
| 133 | How to Write About Your Art Part 1 | `summaries/133_Write_About_Art.md` | `/write-about-art` |
| 135 | Text in Visual Art Part 1 (Dada/Cubism/Surrealism) | `summaries/135_Text_in_Visual_Art.md` | `/text-in-art` |
| 136 | Philosophy of Art: How Does It Mean? Part 2 (Saussure/Barthes/Hall/Eco) | `summaries/136_Philosophy_How_Does_It_Mean_Part2.md` | `/meaning-conditions` |
| 137 | How to Write About Your Art Part 2 (scaffolding, clichés, meaning) | `summaries/137_Write_About_Art_Part2.md` | `/write-about-art` |
| 138 | Visiting Artist: Sasha Stiles — Crafting Systems (generative poetry, systems-based artwork) | `summaries/138_Visiting_Artist_Sasha_Stiles.md` | — (see `/systems-uncertainty`, `/write-about-art`) |
| 139 | Text in Visual Art Part 2 (conceptual art, feminist art, AIDS activism) | `summaries/139_Text_in_Visual_Art_Part2.md` | `/text-in-art` |
| 140 | How to Write About Your Art Part 3 (revision, hotspotting, editing) | `summaries/140_Write_About_Art_Part3.md` | `/write-about-art` |
