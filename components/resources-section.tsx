import { ExternalLink } from 'lucide-react'

export const resources = [
  {
    name: 'World Health Organization (WHO)',
    description: 'Global public health guidance, disease information, and outbreak updates.',
    url: 'https://www.who.int/',
    tag: 'Global',
  },
  {
    name: 'Centers for Disease Control (CDC)',
    description: 'US public health authority for diseases, vaccines, and prevention.',
    url: 'https://www.cdc.gov/',
    tag: 'United States',
  },
  {
    name: 'National Health Service (NHS)',
    description: 'Trusted UK health advice, conditions library, and symptom guidance.',
    url: 'https://www.nhs.uk/',
    tag: 'United Kingdom',
  },
  {
    name: 'National Institutes of Health (NIH)',
    description: 'Biomedical research and reliable, peer-reviewed health information.',
    url: 'https://www.nih.gov/',
    tag: 'Research',
  },
  {
    name: 'MedlinePlus',
    description: 'Consumer-friendly health information from the US National Library of Medicine.',
    url: 'https://medlineplus.gov/',
    tag: 'Reference',
  },
  {
    name: 'PubMed',
    description: 'Search millions of peer-reviewed biomedical studies and journal articles.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/',
    tag: 'Peer-reviewed',
  },
]

export function ResourcesSection({ heading = true }: { heading?: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      {heading && (
        <div className="max-w-2xl">
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Reliable resources
          </h2>
          <p className="mt-3 text-pretty text-lg leading-relaxed text-muted-foreground">
            When you want to dig deeper, start with the organisations that set the global standard for medical evidence.
          </p>
        </div>
      )}

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <a
            key={resource.name}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                {resource.tag}
              </span>
              <ExternalLink
                className="size-4 text-muted-foreground transition-colors group-hover:text-primary"
                aria-hidden="true"
              />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{resource.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{resource.description}</p>
          </a>
        ))}
      </div>
    </section>
  )
}
