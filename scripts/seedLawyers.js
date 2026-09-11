require('dotenv').config();
const mongoose = require('mongoose');
const Lawyer = require('../models/Lawyer');

const lawyers = [
  { name: 'Farah Ahmed', specialization: 'family', bio: 'Family and divorce law specialist focused on amicable resolutions.', experienceYears: 8, location: 'Dhanmondi, Dhaka', contact: { phone: '+8801711000001', email: 'farah.ahmed@example.com' }, rating: 4.7 },
  { name: 'Rezaul Karim', specialization: 'property', bio: 'Property disputes, land registration, and tenancy law.', experienceYears: 12, location: 'Gulshan, Dhaka', contact: { phone: '+8801711000002', email: 'rezaul.karim@example.com' }, rating: 4.5 },
  { name: 'Nusrat Jahan', specialization: 'criminal', bio: 'Criminal defense with a decade of trial experience.', experienceYears: 10, location: 'Chattogram', contact: { phone: '+8801711000003', email: 'nusrat.jahan@example.com' }, rating: 4.8 },
  { name: 'Shahriar Kabir', specialization: 'labor', bio: 'Workplace disputes, wrongful termination, and labor rights.', experienceYears: 6, location: 'Uttara, Dhaka', contact: { phone: '+8801711000004', email: 'shahriar.kabir@example.com' }, rating: 4.3 },
  { name: 'Tania Islam', specialization: 'consumer', bio: 'Consumer protection and e-commerce fraud cases.', experienceYears: 5, location: 'Sylhet', contact: { phone: '+8801711000005', email: 'tania.islam@example.com' }, rating: 4.6 },
  { name: 'Imran Hossain', specialization: 'corporate', bio: 'Corporate law, contracts, and business registration.', experienceYears: 15, location: 'Motijheel, Dhaka', contact: { phone: '+8801711000006', email: 'imran.hossain@example.com' }, rating: 4.9 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding lawyers...');

  for (const lawyer of lawyers) {
    const exists = await Lawyer.findOne({ name: lawyer.name });
    if (exists) {
      console.log(`Skipping (already exists): ${lawyer.name}`);
      continue;
    }
    await Lawyer.create(lawyer);
    console.log(`Added: ${lawyer.name}`);
  }

  console.log('Done.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
