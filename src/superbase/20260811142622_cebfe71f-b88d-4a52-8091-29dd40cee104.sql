
CREATE TYPE public.app_role AS ENUM ('user','lawyer','admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_self_write" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "roles_self_read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role,'user'))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.lawyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  photo_url text,
  specializations text[] NOT NULL DEFAULT '{}',
  city text NOT NULL,
  fees integer NOT NULL DEFAULT 0,
  bio text NOT NULL DEFAULT '',
  bar_registration text,
  experience_years integer NOT NULL DEFAULT 0,
  languages text[] NOT NULL DEFAULT '{English,Bengali}',
  rating numeric(2,1) NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lawyers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.lawyers TO authenticated;
GRANT ALL ON public.lawyers TO service_role;
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lawyers_public_read" ON public.lawyers FOR SELECT USING (true);
CREATE POLICY "lawyers_admin_write" ON public.lawyers FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin') OR auth.uid() = user_id) WITH CHECK (public.has_role(auth.uid(),'admin') OR auth.uid() = user_id);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id uuid NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT 'Anonymous',
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_own_insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_own_delete" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.refresh_lawyer_rating()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE lid uuid;
BEGIN
  lid := COALESCE(NEW.lawyer_id, OLD.lawyer_id);
  UPDATE public.lawyers l SET
    rating = COALESCE((SELECT ROUND(AVG(rating)::numeric,1) FROM public.reviews WHERE lawyer_id = lid),0),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE lawyer_id = lid)
  WHERE l.id = lid;
  RETURN NULL;
END; $$;
CREATE TRIGGER reviews_rating_sync AFTER INSERT OR UPDATE OR DELETE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.refresh_lawyer_rating();

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id uuid NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_email text NOT NULL,
  slot_at timestamptz NOT NULL,
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_read" ON public.bookings FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.lawyers l WHERE l.id = lawyer_id AND l.user_id = auth.uid()));
CREATE POLICY "bookings_insert" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookings_update" ON public.bookings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.lawyers l WHERE l.id = lawyer_id AND l.user_id = auth.uid()));
CREATE POLICY "bookings_delete" ON public.bookings FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New conversation',
  language text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_sessions TO authenticated;
GRANT ALL ON public.chat_sessions TO service_role;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions_own" ON public.chat_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_own" ON public.chat_messages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  download_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.templates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.templates TO authenticated;
GRANT ALL ON public.templates TO service_role;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates_public_read" ON public.templates FOR SELECT USING (true);
CREATE POLICY "templates_admin_write" ON public.templates FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  summary text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT 'en',
  published_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "articles_public_read" ON public.articles FOR SELECT USING (true);
CREATE POLICY "articles_admin_write" ON public.articles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.glossary_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  definition text NOT NULL,
  example text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General'
);
GRANT SELECT ON public.glossary_terms TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.glossary_terms TO authenticated;
GRANT ALL ON public.glossary_terms TO service_role;
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "glossary_public_read" ON public.glossary_terms FOR SELECT USING (true);
CREATE POLICY "glossary_admin_write" ON public.glossary_terms FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.news_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  source text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  url text,
  category text NOT NULL DEFAULT 'General',
  published_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.news_items TO authenticated;
GRANT ALL ON public.news_items TO service_role;
ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news_public_read" ON public.news_items FOR SELECT USING (true);
CREATE POLICY "news_admin_write" ON public.news_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.lawyers (name, specializations, city, fees, bio, bar_registration, experience_years, rating, review_count) VALUES
('Adv. Farhana Rahman', ARRAY['Family Law','Divorce'], 'Dhaka', 3000, 'Family law specialist with a focus on divorce, custody and maintenance cases in the Dhaka Family Court.', 'BAR-DHK-11245', 12, 4.6, 0),
('Adv. Tanvir Ahmed', ARRAY['Labour Law','Employment'], 'Dhaka', 2500, 'Represents workers and employees in wrongful termination, unpaid wages and workplace harassment cases.', 'BAR-DHK-20981', 9, 4.4, 0),
('Adv. Nusrat Jahan', ARRAY['Tenant Rights','Property'], 'Chattogram', 2000, 'Handles landlord-tenant disputes, eviction notices and property registration matters.', 'BAR-CTG-33417', 7, 4.7, 0),
('Adv. Mahbub Alam', ARRAY['Criminal Law'], 'Dhaka', 4000, 'Criminal defence counsel practising in the Sessions Court and High Court Division.', 'BAR-DHK-10022', 18, 4.8, 0),
('Adv. Shirin Akter', ARRAY['Consumer Rights','Civil Law'], 'Sylhet', 1800, 'Consumer protection cases, defective goods claims and small civil suits.', 'BAR-SYL-55210', 6, 4.2, 0),
('Adv. Rezaul Karim', ARRAY['Corporate Law','Contracts'], 'Dhaka', 5000, 'Advises small businesses on company formation, shareholder agreements and commercial contracts.', 'BAR-DHK-14780', 15, 4.5, 0),
('Adv. Sadia Islam', ARRAY['Cyber Law','Women Rights'], 'Rajshahi', 2200, 'Digital Security Act cases, online harassment complaints and women''s rights advocacy.', 'BAR-RAJ-61033', 5, 4.9, 0),
('Adv. Kamrul Hasan', ARRAY['Land Law','Inheritance'], 'Khulna', 2400, 'Land mutation, boundary disputes and inheritance distribution under Muslim and Hindu family law.', 'BAR-KHL-40188', 11, 4.3, 0);

INSERT INTO public.glossary_terms (term, definition, example, category) VALUES
('Affidavit','A written statement of facts that you swear to be true in front of a notary or magistrate.','You file an affidavit to confirm a change of name.','Procedure'),
('Bail','Temporary release of an accused person while the case is ongoing, usually with conditions.','The court granted bail on a bond of BDT 50,000.','Criminal'),
('Plaintiff','The person who starts a civil case in court.','The plaintiff sued the landlord for the security deposit.','Civil'),
('Defendant','The person against whom a case is filed.','The defendant was ordered to pay damages.','Civil'),
('Injunction','A court order telling someone to stop doing something.','The court issued an injunction stopping the eviction.','Civil'),
('Power of Attorney','A document letting someone else act legally on your behalf.','He signed a power of attorney so his brother could sell the land.','Property'),
('FIR','First Information Report, the first police record of a reported crime.','She filed an FIR at the local thana after the theft.','Criminal'),
('Mutation','Updating land records to show the new owner after a transfer.','Mutation must be done at the AC Land office.','Property'),
('Gratuity','A lump sum an employer pays a worker for long service.','He received gratuity after 10 years of service.','Labour'),
('Decree','The formal decision of a civil court.','The decree ordered the return of the deposit.','Civil'),
('Cognizable Offence','A crime where police can arrest without a warrant.','Robbery is a cognizable offence.','Criminal'),
('Arbitration','Settling a dispute outside court through a neutral third party.','The contract required arbitration before any lawsuit.','Contracts');

INSERT INTO public.articles (title, slug, category, summary, content, language) VALUES
('Your rights as a tenant in Bangladesh','tenant-rights','Tenant','What a landlord can and cannot do about rent, deposits and eviction.','Under the Premises Rent Control Act, 1991, a landlord must give you a rent receipt for every payment. Rent cannot be increased more than once in two years. An advance deposit of more than one month''s rent is not permitted. You cannot be evicted without written notice and, if you refuse, only a court order can force you out. Keep every receipt and written message: they are your main evidence. If your landlord cuts your water or electricity to force you out, that is an offence and you may file a complaint with the Rent Controller.','en'),
('What to do if you are fired unfairly','unfair-termination','Labour','Notice pay, dues and how to file a complaint under the Labour Act.','The Bangladesh Labour Act, 2006 requires an employer to give a permanent worker either 120 days'' notice or payment in lieu. On termination you are entitled to your unpaid wages, earned leave encashment and, after five years of service, 30 days'' wages for each completed year. If your employer refuses, you may file a complaint with the Labour Inspector or a case in the Labour Court within two years. Collect your appointment letter, salary slips and any written communication before you leave the workplace.','en'),
('Consumer rights when you buy a defective product','consumer-rights','Consumer','Refunds, complaints and the Directorate of Consumer Rights Protection.','The Consumer Rights Protection Act, 2009 makes it an offence to sell expired, adulterated or misrepresented goods. You can file a written complaint with the Directorate of National Consumer Rights Protection (DNCRP) within 30 days of the incident. Attach the receipt, packaging and photos. If the complaint succeeds, you receive 25 percent of the fine imposed on the seller. Keep the product unused where possible and never rely only on a verbal promise from the shop.','en'),
('Filing a case of online harassment','cyber-harassment','Cyber','How to preserve evidence and report digital abuse safely.','If someone harasses you online, take full-screen screenshots that show the profile URL, the message and the date. Do not delete the conversation. Report the account to the platform and then file a complaint with the Cyber Crime Unit, or call the police helpline 999. Complaints under the Cyber Security Act must identify the exact posts complained of, so keeping links matters more than keeping images alone. You may ask the court for your identity to be protected during the proceedings.','en'),
('ভাড়াটিয়া হিসেবে আপনার অধিকার','tenant-rights-bn','Tenant','বাড়িওয়ালা ভাড়া, জামানত ও উচ্ছেদ নিয়ে কী করতে পারেন আর কী পারেন না।','১৯৯১ সালের বাড়ি ভাড়া নিয়ন্ত্রণ আইন অনুযায়ী বাড়িওয়ালা প্রতিটি ভাড়ার জন্য রসিদ দিতে বাধ্য। দুই বছরে একবারের বেশি ভাড়া বাড়ানো যায় না। এক মাসের ভাড়ার বেশি অগ্রিম নেওয়া আইনসম্মত নয়। লিখিত নোটিশ ছাড়া আপনাকে উচ্ছেদ করা যাবে না, আর আপনি রাজি না হলে কেবল আদালতের আদেশেই উচ্ছেদ সম্ভব। সব রসিদ ও বার্তা সংরক্ষণ করুন — এগুলোই আপনার প্রধান প্রমাণ।','bn'),
('চাকরি থেকে অন্যায়ভাবে বরখাস্ত হলে করণীয়','unfair-termination-bn','Labour','নোটিশ পে, পাওনা এবং শ্রম আদালতে অভিযোগ দাখিল।','২০০৬ সালের শ্রম আইন অনুযায়ী স্থায়ী শ্রমিককে ১২০ দিনের নোটিশ অথবা সমপরিমাণ অর্থ দিতে হবে। চাকরি অবসানে আপনি বকেয়া মজুরি, অর্জিত ছুটির টাকা এবং পাঁচ বছর চাকরির পর প্রতি বছরের জন্য ৩০ দিনের মজুরি পাবেন। মালিক অস্বীকার করলে দুই বছরের মধ্যে শ্রম আদালতে মামলা করা যায়। নিয়োগপত্র ও বেতনের কাগজপত্র আগেই সংগ্রহ করে রাখুন।','bn');

INSERT INTO public.news_items (title, source, summary, category, published_at) VALUES
('High Court issues directive on rent receipt enforcement','The Daily Star','Landlords in metropolitan areas must issue written rent receipts, with penalties for repeat non-compliance.','Tenant', now() - interval '2 days'),
('Labour Court digitises case filing across eight divisions','Prothom Alo','Workers can now submit termination and wage claims online, cutting filing time from weeks to days.','Labour', now() - interval '5 days'),
('DNCRP raises maximum fine for adulterated food products','Bdnews24','The consumer rights directorate announced higher penalties following a nationwide market drive.','Consumer', now() - interval '9 days'),
('New guidelines for handling online harassment complaints','New Age','Police cyber units receive standard operating procedures for evidence preservation in digital abuse cases.','Cyber', now() - interval '13 days'),
('Land mutation service extended to union digital centres','The Business Standard','Rural applicants can complete land record updates without travelling to the district office.','Property', now() - interval '18 days'),
('Legal aid budget increased for district committees','The Financial Express','Government legal aid offices receive additional funding to expand free representation for low-income litigants.','General', now() - interval '24 days');

INSERT INTO public.templates (title, category, description, body, fields) VALUES
('Rental Agreement','Property','A standard house or flat rental agreement between landlord and tenant.',
'RENTAL AGREEMENT

This agreement is made on {{date}} between {{landlord_name}} ("Landlord") of {{landlord_address}} and {{tenant_name}} ("Tenant").

1. The Landlord lets the premises at {{property_address}} to the Tenant.
2. The monthly rent is BDT {{rent}}, payable on or before the {{due_day}} day of each month.
3. The Tenant has paid an advance of BDT {{advance}}, refundable on vacating the premises.
4. The tenancy begins on {{start_date}} and continues month to month until terminated by one month written notice.
5. The Landlord shall issue a written receipt for every payment received.

Landlord: ______________________    Tenant: ______________________',
'[{"key":"date","label":"Date","type":"date"},{"key":"landlord_name","label":"Landlord full name","type":"text"},{"key":"landlord_address","label":"Landlord address","type":"text"},{"key":"tenant_name","label":"Tenant full name","type":"text"},{"key":"property_address","label":"Property address","type":"text"},{"key":"rent","label":"Monthly rent (BDT)","type":"number"},{"key":"due_day","label":"Rent due day","type":"text"},{"key":"advance","label":"Advance paid (BDT)","type":"number"},{"key":"start_date","label":"Tenancy start date","type":"date"}]'),
('Employment Offer Letter','Employment','A simple appointment letter for a permanent employee.',
'OFFER OF EMPLOYMENT

Date: {{date}}

Dear {{employee_name}},

We are pleased to offer you the position of {{designation}} at {{company_name}}, starting {{start_date}}.

Your gross monthly salary will be BDT {{salary}}. Your working hours are {{hours}} per week. Either party may end this employment with {{notice}} written notice, subject to the Bangladesh Labour Act, 2006.

Please sign below to accept this offer.

For {{company_name}}: ______________    Accepted by: ______________',
'[{"key":"date","label":"Date","type":"date"},{"key":"employee_name","label":"Employee name","type":"text"},{"key":"designation","label":"Designation","type":"text"},{"key":"company_name","label":"Company name","type":"text"},{"key":"start_date","label":"Start date","type":"date"},{"key":"salary","label":"Monthly salary (BDT)","type":"number"},{"key":"hours","label":"Weekly hours","type":"text"},{"key":"notice","label":"Notice period","type":"text"}]'),
('Legal Notice for Unpaid Dues','Recovery','A demand notice before filing a money recovery suit.',
'LEGAL NOTICE

Date: {{date}}
To: {{recipient_name}}, {{recipient_address}}

Under instructions from my client {{client_name}}, I serve you this notice regarding the outstanding sum of BDT {{amount}} due since {{due_date}} on account of {{reason}}.

You are called upon to pay the said amount within {{days}} days of receipt of this notice, failing which my client will initiate legal proceedings at your cost and risk.

Sincerely,
{{sender_name}}',
'[{"key":"date","label":"Date","type":"date"},{"key":"recipient_name","label":"Recipient name","type":"text"},{"key":"recipient_address","label":"Recipient address","type":"text"},{"key":"client_name","label":"Your name","type":"text"},{"key":"amount","label":"Amount due (BDT)","type":"number"},{"key":"due_date","label":"Due since","type":"date"},{"key":"reason","label":"Reason for the dues","type":"text"},{"key":"days","label":"Days to pay","type":"text"},{"key":"sender_name","label":"Sender name","type":"text"}]'),
('General Power of Attorney','Authorisation','Authorise another person to act on your behalf.',
'GENERAL POWER OF ATTORNEY

I, {{principal_name}}, son/daughter of {{parent_name}}, of {{principal_address}}, hereby appoint {{agent_name}} of {{agent_address}} as my lawful attorney to act on my behalf in respect of {{scope}}.

This authority takes effect from {{start_date}} and remains valid until revoked in writing.

Principal: ______________    Attorney: ______________    Date: {{date}}',
'[{"key":"principal_name","label":"Your full name","type":"text"},{"key":"parent_name","label":"Father/Mother name","type":"text"},{"key":"principal_address","label":"Your address","type":"text"},{"key":"agent_name","label":"Attorney name","type":"text"},{"key":"agent_address","label":"Attorney address","type":"text"},{"key":"scope","label":"Scope of authority","type":"text"},{"key":"start_date","label":"Effective from","type":"date"},{"key":"date","label":"Date","type":"date"}]'),
('Complaint to Consumer Rights Directorate','Consumer','Formal complaint about a defective or misrepresented product.',
'COMPLAINT UNDER THE CONSUMER RIGHTS PROTECTION ACT, 2009

To: The Director General, DNCRP
Date: {{date}}

Complainant: {{complainant_name}}, {{complainant_address}}, phone {{phone}}
Respondent: {{seller_name}}, {{seller_address}}

On {{purchase_date}} I purchased {{product}} for BDT {{price}}. The product was found to be {{problem}}. Despite my request, the seller refused a refund or replacement.

I request an investigation and appropriate action under the Act. Copies of the receipt and photographs are attached.

Signature: ______________',
'[{"key":"date","label":"Date","type":"date"},{"key":"complainant_name","label":"Your name","type":"text"},{"key":"complainant_address","label":"Your address","type":"text"},{"key":"phone","label":"Phone","type":"text"},{"key":"seller_name","label":"Seller name","type":"text"},{"key":"seller_address","label":"Seller address","type":"text"},{"key":"purchase_date","label":"Purchase date","type":"date"},{"key":"product","label":"Product","type":"text"},{"key":"price","label":"Price paid (BDT)","type":"number"},{"key":"problem","label":"What was wrong","type":"text"}]'),
('Rent Receipt','Property','Proof of rent payment issued by the landlord.',
'RENT RECEIPT

Received from {{tenant_name}} the sum of BDT {{amount}} being the rent for the month of {{month}} for the premises at {{property_address}}.

Date: {{date}}
Landlord: {{landlord_name}}
Signature: ______________',
'[{"key":"tenant_name","label":"Tenant name","type":"text"},{"key":"amount","label":"Amount (BDT)","type":"number"},{"key":"month","label":"Month","type":"text"},{"key":"property_address","label":"Property address","type":"text"},{"key":"date","label":"Date","type":"date"},{"key":"landlord_name","label":"Landlord name","type":"text"}]'),
('Resignation Letter','Employment','A clean resignation letter serving proper notice.',
'RESIGNATION LETTER

Date: {{date}}

To: {{manager_name}}, {{company_name}}

I am resigning from my position as {{designation}}, with my last working day being {{last_day}}, in accordance with my {{notice}} notice period.

I request settlement of my final dues including unpaid salary and encashment of earned leave.

Sincerely,
{{employee_name}}',
'[{"key":"date","label":"Date","type":"date"},{"key":"manager_name","label":"Manager name","type":"text"},{"key":"company_name","label":"Company name","type":"text"},{"key":"designation","label":"Your designation","type":"text"},{"key":"last_day","label":"Last working day","type":"date"},{"key":"notice","label":"Notice period","type":"text"},{"key":"employee_name","label":"Your name","type":"text"}]'),
('Non-Disclosure Agreement','Business','Keep shared business information confidential.',
'NON-DISCLOSURE AGREEMENT

This agreement is made on {{date}} between {{party_a}} and {{party_b}}.

1. Confidential Information means any non-public information shared for the purpose of {{purpose}}.
2. The receiving party shall not disclose the Confidential Information to any third party.
3. These obligations continue for {{years}} years from the date above.
4. This agreement is governed by the laws of Bangladesh.

{{party_a}}: ______________    {{party_b}}: ______________',
'[{"key":"date","label":"Date","type":"date"},{"key":"party_a","label":"First party","type":"text"},{"key":"party_b","label":"Second party","type":"text"},{"key":"purpose","label":"Purpose of sharing","type":"text"},{"key":"years","label":"Confidentiality period (years)","type":"number"}]'),
('Affidavit of Name Change','Procedure','Declare a change of name before a notary.',
'AFFIDAVIT

I, {{current_name}}, son/daughter of {{parent_name}}, of {{address}}, do hereby solemnly affirm as follows:

1. That my name recorded in official documents is {{current_name}}.
2. That I wish to be known henceforth as {{new_name}}.
3. That both names refer to one and the same person, namely myself.
4. That this affidavit is made for the purpose of {{purpose}}.

Deponent: ______________    Date: {{date}}',
'[{"key":"current_name","label":"Current name","type":"text"},{"key":"parent_name","label":"Father/Mother name","type":"text"},{"key":"address","label":"Address","type":"text"},{"key":"new_name","label":"New name","type":"text"},{"key":"purpose","label":"Purpose","type":"text"},{"key":"date","label":"Date","type":"date"}]'),
('Eviction Reply Notice','Property','Respond to an unlawful eviction notice from a landlord.',
'REPLY TO EVICTION NOTICE

Date: {{date}}
To: {{landlord_name}}, {{landlord_address}}

I received your notice dated {{notice_date}} asking me to vacate {{property_address}}.

I have occupied the premises since {{tenancy_start}} and all rent up to {{paid_until}} has been paid. Under the Premises Rent Control Act, 1991, I cannot be evicted without lawful grounds and a court order.

I therefore decline to vacate and reserve my right to seek relief from the Rent Controller.

{{tenant_name}}',
'[{"key":"date","label":"Date","type":"date"},{"key":"landlord_name","label":"Landlord name","type":"text"},{"key":"landlord_address","label":"Landlord address","type":"text"},{"key":"notice_date","label":"Date of their notice","type":"date"},{"key":"property_address","label":"Property address","type":"text"},{"key":"tenancy_start","label":"Tenancy started","type":"date"},{"key":"paid_until","label":"Rent paid until","type":"text"},{"key":"tenant_name","label":"Your name","type":"text"}]');
