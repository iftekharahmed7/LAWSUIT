require('dotenv').config();
const mongoose = require('mongoose');
const LegalNews = require('../models/LegalNews');

const newsItems = [
  {
    title: 'Bangladesh Labour (Amendment) Act 2026 takes effect',
    summary:
      'Parliament passed sweeping reforms to the Bangladesh Labour Act 2006, effective 10 April 2026. Changes include a wider definition of "worker" that now covers gig-platform and self-employed workers for union rights, a new five-tier trade union registration system starting at 20 workers, an explicit ban on employer blacklisting of union members, a new Workplace Accident Compensation Fund, and expanded maternity leave.',
    category: 'labor',
    sourceUrl: 'https://www.tbsnews.net/bangladesh/parliament-passes-labour-bill-layoff-compensation-trade-union-rights-among-key-reforms',
    sourceName: 'The Business Standard',
    publishedDate: new Date('2026-04-09'),
  },
  {
    title: 'Dhaka North City Corporation issues new house rent guidelines',
    summary:
      'DNCC announced guidelines stating landlords should not raise rent within 2 years of a tenancy starting, and that annual rent should not exceed 15% of a property\'s market value. These are city-level guidelines building on the (rarely enforced) House Rent Control Act 1991, not a new law - but they give tenants a concrete number to point to when a rent increase feels unreasonable.',
    category: 'property',
    sourceUrl: 'https://en.prothomalo.com/bangladesh/city/y0i366pedr',
    sourceName: 'Prothom Alo English',
    publishedDate: new Date('2026-01-20'),
  },
  {
    title: 'Consumer group pushes to overhaul the 2009 Consumer Rights Act',
    summary:
      'The Consumers Association of Bangladesh (CAB) says the Consumer Rights Protection Act 2009 is no longer fit for purpose given the rise of e-commerce fraud, and is pushing for a dedicated consumer court or tribunal plus stronger penalties beyond fines alone. This is a reform proposal, not yet passed into law - worth knowing if you\'re dealing with an online purchase dispute today, since the current 2009 Act is still what applies.',
    category: 'consumer',
    sourceUrl: 'https://observerbd.com/news/585853',
    sourceName: 'The Daily Observer',
    publishedDate: new Date('2026-08-01'),
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding legal news...');

  for (const item of newsItems) {
    const exists = await LegalNews.findOne({ title: item.title });
    if (exists) {
      console.log(`Skipping (already exists): ${item.title}`);
      continue;
    }
    await LegalNews.create(item);
    console.log(`Added: ${item.title}`);
  }

  console.log('Done.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
