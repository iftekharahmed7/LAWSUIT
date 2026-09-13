import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const sections = [
  {
    id: "tenant",
    title: "Tenant rights",
    points: [
      "Under the House Rent Control Act 1991, landlords cannot evict a tenant without proper notice or cut off utilities (water, electricity, gas) to force them out - this is a recognized method of illegal harassment, not a legal shortcut.",
      "You're generally entitled to a rent receipt for every payment. Keep these - they're your main evidence in a dispute.",
      "Security deposits should be returned at the end of a tenancy, minus any genuinely documented damage - not withheld as a default.",
      "Rent increases should be reasonable and not arbitrary. Some city corporations (e.g. DNCC) have issued guidelines suggesting increases shouldn't happen more than once every 2 years - though enforcement varies, so this is a useful reference point in a negotiation, not a guaranteed cap.",
      "In practice, the rent controller system created by the 1991 Act is weakly enforced - most disputes are resolved through direct negotiation, local mediation, or a lawyer's demand letter rather than filing with a rent controller.",
    ],
  },
  {
    id: "labor",
    title: "Labor rights",
    points: [
      "The Bangladesh Labour (Amendment) Act 2026 broadened who counts as a \"worker\" - coverage now extends to more job types, including some gig and platform workers, for trade union purposes.",
      "Employers are explicitly barred from blacklisting workers or trade union members, or setting up unions under their own control.",
      "You're generally entitled to a written explanation and notice period before termination - abrupt, unexplained dismissal is not standard practice under the law, even if it happens often in practice.",
      "Maternity leave entitlements exist and were expanded under the 2026 amendment - if you're denied this, that's worth raising with a lawyer or labor rights organization.",
      "Workplace accidents are covered by a compensation fund created under the 2026 amendment - you don't have to simply absorb the cost of a workplace injury yourself.",
    ],
  },
  {
    id: "consumer",
    title: "Consumer rights",
    points: [
      "The Consumer Rights Protection Act 2009 lets you file a complaint directly with the Department of National Consumer Rights Protection (DNCRP) - you don't need a lawyer to start this process.",
      "You're protected against adulterated food/medicine, counterfeit goods, false advertising, and inflated pricing under this Act.",
      "For online purchases specifically: non-delivery, misleading product descriptions, and refusal to refund are common, recognized complaint categories - keep your order confirmation, payment proof, and any chat/email correspondence as evidence.",
      "Consumer groups have publicly argued the 2009 Act is outdated for e-commerce disputes and are pushing for reform - so if a complaint moves slowly, that's a real, acknowledged gap, not just bad luck.",
    ],
  },
];

export default function KnowYourRights() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-3xl text-emerald-950">Know your rights</h1>
      <p className="mt-2 text-stone-600">
        Plain-language guides to tenant, labor, and consumer rights under Bangladeshi law.
      </p>

      <Accordion type="single" collapsible className="mt-8">
        {sections.map((section) => (
          <AccordionItem key={section.id} value={section.id}>
            <AccordionTrigger className="font-serif text-lg text-emerald-950">
              {section.title}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc space-y-3 pl-5 text-stone-700">
                {section.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <p className="mt-10 text-xs text-stone-400">
        This is general legal information, not legal advice, and laws and enforcement practices change.
        For your specific situation, consult a qualified lawyer or use the "Ask AI" or "Find a lawyer" pages.
      </p>
    </div>
  );
}
