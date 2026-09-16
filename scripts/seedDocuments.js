require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('../models/Document');

const documents = [
  {
    title: 'Sample Rental Agreement',
    category: 'agreement',
    content: `RENTAL AGREEMENT

This Rental Agreement is made on 1 October 2026, between:

Landlord: Karim Rahman, of House 12, Road 5, Dhanmondi, Dhaka
Tenant: Fahim Islam, of House 3, Road 2, Mohammadpur, Dhaka

1. The Property
The Landlord agrees to let out the flat located at House 12, Road 5, Dhanmondi, Dhaka, Unit 4B, approximately 1200 sq ft, semi-furnished.

2. Rent
Monthly rent: BDT 25,000, payable on or before the 5th of each month.
Security deposit: BDT 50,000, refundable at the end of the tenancy subject to the condition of the property.

3. Duration
This tenancy shall run for 12 months, commencing 1 October 2026 and ending 1 October 2027, unless renewed or terminated earlier.

4. Ending the Tenancy
Either party may terminate this agreement by giving the other party at least 2 months' written notice.

5. General Conditions
The Tenant shall not sublet the property without the Landlord's prior written consent. The Tenant is responsible for utility bills during the tenancy. The Landlord is responsible for structural repairs.

This is a sample for reference only - use the "Templates" page to generate your own.`,
  },
  {
    title: 'Sample Legal Notice - Demand for Payment',
    category: 'notice',
    content: `LEGAL NOTICE

Date: 15 September 2026

From: Rina Begum, House 8, Road 3, Uttara, Dhaka
To: Jamal Traders, Shop 22, New Market, Dhaka

Subject: Demand for payment of outstanding dues

Dear Sir/Madam,

1. Background
On 10 August 2026, I supplied goods worth BDT 85,000 to your establishment against invoice #JT-2026-114, payable within 30 days of delivery.

2. Demand
Despite repeated verbal requests, the amount remains unpaid as of this date. You are hereby called upon to settle the outstanding amount of BDT 85,000 within 15 days of receipt of this notice, failing which I shall be constrained to initiate appropriate legal proceedings against you, entirely at your risk, cost, and consequence.

Yours faithfully,
Rina Begum

This is a sample for reference only - use the "Templates" page to generate your own.`,
  },
  {
    title: 'Sample General Affidavit',
    category: 'affidavit',
    content: `AFFIDAVIT

I, Nasrin Akter, daughter of Abul Kashem, residing at House 15, Road 7, Banani, Dhaka, holding NID no. 1234567890, do hereby solemnly affirm and declare as follows:

1. That my correct name is Nasrin Akter, and due to a clerical error in my birth registration, it was recorded as "Nasreen Akter."

2. That both names refer to one and the same person, namely myself.

3. That this affidavit is being executed for the purpose of correcting the said discrepancy in my official records.

That the statements made above are true to the best of my knowledge and belief, and nothing material has been concealed therefrom.

Place: Dhaka
Date: 15 September 2026

Signature of Deponent
Identified & attested by (Notary/Advocate)

This is a sample for reference only - affidavits typically require notarization to take effect.`,
  },
  {
    title: 'Sample Freelance Service Contract',
    category: 'contract',
    content: `SERVICE CONTRACT

This Contract is entered into on 1 September 2026 between:

Client: BrightPath Solutions Ltd., Gulshan-1, Dhaka
Service Provider: Tanvir Ahmed, freelance web developer

1. Scope of Work
The Service Provider agrees to design and develop a company website for the Client, including up to 6 pages, a contact form, and basic SEO setup, to be delivered within 4 weeks of this contract's signing.

2. Payment
Total fee: BDT 60,000, payable as 50% (BDT 30,000) upfront and 50% (BDT 30,000) upon delivery and Client approval.

3. Revisions
The Service Provider will provide up to 2 rounds of revisions at no extra cost. Additional revisions will be billed at BDT 1,500/hour.

4. Ownership
Upon full payment, all rights to the delivered website transfer to the Client. The Service Provider retains the right to showcase the work in their portfolio.

5. Termination
Either party may terminate this contract with 7 days' written notice. Work completed up to that point will be billed proportionally.

This is a sample for reference only - have a lawyer review any real contract before signing.`,
  },
  {
    title: 'Sample Petition to Local Authority',
    category: 'petition',
    content: `PETITION

To
The Executive Engineer,
Dhaka Water Supply and Sewerage Authority (WASA),
Mirpur Zone, Dhaka.

Subject: Petition regarding irregular water supply in Block C, Mirpur-10

Respected Sir/Madam,

We, the undersigned residents of Block C, Mirpur-10, wish to bring to your kind attention that our area has been experiencing highly irregular water supply for the past two months, often limited to 2-3 hours per day.

This has caused significant hardship to over 40 households in the area, particularly affecting elderly residents and families with young children.

We therefore request your good office to kindly investigate the matter and take necessary steps to restore regular water supply at the earliest.

We shall remain grateful for your prompt attention to this matter.

Yours faithfully,
[Names and signatures of petitioners]
Block C Residents' Committee, Mirpur-10, Dhaka

This is a sample for reference only.`,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding sample documents...');

  for (const doc of documents) {
    const exists = await Document.findOne({ title: doc.title });
    if (exists) {
      console.log(`Skipping (already exists): ${doc.title}`);
      continue;
    }
    await Document.create(doc);
    console.log(`Added: ${doc.title}`);
  }

  console.log('Done.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
