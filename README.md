# Verabl

Evidence-based health information you can trust: a guided symptom checker, a health-claim fact checker,
a myth-vs-fact library and plain-language guides to common conditions.

**No AI at runtime.** Every answer on the site comes from hand-curated data in `lib/data/`, with links to
the NHS, CDC, WHO, NIH, MedlinePlus and other reputable publishers. The symptom checker applies fixed
rules (red flags, urgent flags, how long, how bad, higher-risk groups), and the fact checker matches
claims against reviewed entries by keywords. A claim that has not been reviewed gets
"not in our database", never a guess.

The site is a fully static Next.js export, hosted on GitHub Pages.

## Data

| File | What |
| --- | --- |
| `lib/data/symptoms.json` | Symptoms with red flags, urgent flags, common causes, self-care, when to see a doctor |
| `lib/data/myths.json` | Health claims with a rating (false / misleading / mostly true / true), the facts and sources |
| `lib/data/conditions.json` | Common conditions: symptoms, causes, treatment, prevention, emergency signs |
| `lib/data/types.ts` | The shape of each record and the allowed categories |

To add or edit an entry, edit the JSON and run:

```bash
pnpm validate      # checks every record against the schema and the source allow-list
pnpm check-links   # checks that every source URL still resolves
```

## Develop

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`).
One-time setup: repository **Settings → Pages → Source: GitHub Actions**. For a custom domain, add it in
the same Pages settings and point the domain's DNS at GitHub Pages.

## Disclaimer

Verabl provides general educational information, not medical advice, diagnosis or treatment. In an
emergency, call your local emergency number.
