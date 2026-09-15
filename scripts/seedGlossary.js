require('dotenv').config();
const mongoose = require('mongoose');
const GlossaryTerm = require('../models/GlossaryTerm');

const terms = [
  { term: 'Affidavit', category: 'general',
    definition: 'A written statement sworn to be true, signed in front of a notary or authorized official. Often required to formally declare facts - like a change of name or address - to a court or government office.' },
  { term: 'Power of Attorney', category: 'general',
    definition: 'A legal document giving someone else the authority to act on your behalf - for example, to manage property or sign documents for you - usually for a specific purpose or time period.' },
  { term: 'Plaintiff', category: 'general',
    definition: 'The person or party who brings a case to court, claiming another party (the defendant) has wronged them.' },
  { term: 'Defendant', category: 'general',
    definition: 'The person or party being accused or sued in a court case.' },
  { term: 'Stay Order', category: 'general',
    definition: "A court order that temporarily pauses an action - such as an eviction or a lower court's ruling - until the matter is properly heard." },
  { term: 'Bail', category: 'criminal',
    definition: 'A conditional release of an accused person before trial, sometimes requiring a surety (a person who guarantees the accused will appear in court) or a deposit.' },
  { term: 'FIR (First Information Report)', category: 'criminal',
    definition: 'The written document police create when they first receive information about a cognizable offence (a serious crime they can investigate and arrest for without needing prior court permission). Filing an FIR is usually the first formal step in a criminal case.' },
  { term: 'Cognizable Offence', category: 'criminal',
    definition: 'A serious crime (such as theft or assault) for which police can arrest a suspect and start an investigation without needing a magistrate\'s prior approval - as opposed to a non-cognizable offence, which requires court permission first.' },
  { term: 'Mutation (Land Record)', category: 'property',
    definition: "The official process of updating government land records to reflect a change of ownership - for example, after a sale, inheritance, or gift. Without mutation, the previous owner may still appear as the legal owner in records." },
  { term: 'Deed of Gift (Heba)', category: 'property',
    definition: 'A legal document transferring ownership of property to someone else without payment, typically between family members, registered to be legally valid.' },
  { term: 'Tenancy Agreement', category: 'property',
    definition: 'A contract between a landlord and tenant setting out the terms of renting a property - rent amount, duration, deposit, and each party\'s responsibilities.' },
  { term: 'Vakalatnama', category: 'general',
    definition: 'A document authorizing a lawyer (advocate) to represent and act on your behalf in a specific court case - required before a lawyer can formally appear for you.' },
  { term: 'Alimony', category: 'family',
    definition: "Financial support one spouse may be ordered to pay another after separation or divorce, intended to help the receiving spouse maintain a reasonable standard of living." },
  { term: 'Guardianship', category: 'family',
    definition: "A legal arrangement giving a person (the guardian) responsibility for the care, property, or affairs of someone who cannot fully manage their own - typically a minor child." },
  { term: 'Talaq', category: 'family',
    definition: 'The Islamic legal process of divorce initiated by the husband, which under Bangladeshi law must still be formally registered and follows a notice period before it takes effect.' },
  { term: 'Termination (Employment)', category: 'labor',
    definition: "The formal ending of an employment relationship by the employer. Depending on the reason and the worker's length of service, it may require notice, a written explanation, or severance pay." },
  { term: 'Severance Pay', category: 'labor',
    definition: "Compensation paid to an employee when their job ends through no fault of their own - such as retrenchment or company closure - usually calculated based on length of service." },
  { term: 'Trade Union', category: 'labor',
    definition: 'An organization formed by workers to collectively negotiate with employers over wages, working conditions, and other workplace issues.' },
  { term: 'Warranty', category: 'consumer',
    definition: "A guarantee from a seller or manufacturer that a product will work as described for a certain period, and that they'll repair, replace, or refund it if it doesn't." },
  { term: 'Consumer Complaint', category: 'consumer',
    definition: 'A formal report filed - for example with the Department of National Consumer Rights Protection (DNCRP) - about being sold defective goods, overcharged, or misled by a seller.' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding glossary terms...');

  for (const item of terms) {
    const exists = await GlossaryTerm.findOne({ term: item.term });
    if (exists) {
      console.log(`Skipping (already exists): ${item.term}`);
      continue;
    }
    await GlossaryTerm.create(item);
    console.log(`Added: ${item.term}`);
  }

  console.log('Done.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
