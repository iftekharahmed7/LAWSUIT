import { useState } from "react";

type Lang = "en" | "bn";
type DocType = "rental" | "notice";
type FieldType = "text" | "textarea" | "date" | "number";

interface Field {
  id: string;
  label: { en: string; bn: string };
  type: FieldType;
  required?: boolean;
}

const RENTAL_FIELDS: Field[] = [
  { id: "landlordName", label: { en: "Landlord's full name", bn: "বাড়িওয়ালার পূর্ণ নাম" }, type: "text", required: true },
  { id: "landlordAddress", label: { en: "Landlord's address", bn: "বাড়িওয়ালার ঠিকানা" }, type: "textarea", required: true },
  { id: "tenantName", label: { en: "Tenant's full name", bn: "ভাড়াটিয়ার পূর্ণ নাম" }, type: "text", required: true },
  { id: "tenantAddress", label: { en: "Tenant's address", bn: "ভাড়াটিয়ার ঠিকানা" }, type: "textarea", required: true },
  { id: "propertyAddress", label: { en: "Property address", bn: "সম্পত্তির ঠিকানা" }, type: "textarea", required: true },
  { id: "monthlyRent", label: { en: "Monthly rent (BDT)", bn: "মাসিক ভাড়া (টাকা)" }, type: "number", required: true },
  { id: "securityDeposit", label: { en: "Security deposit (BDT)", bn: "জামানত (টাকা)" }, type: "number", required: true },
  { id: "leaseStartDate", label: { en: "Lease start date", bn: "চুক্তি শুরুর তারিখ" }, type: "date", required: true },
  { id: "leaseDurationMonths", label: { en: "Lease duration (months)", bn: "চুক্তির মেয়াদ (মাস)" }, type: "number", required: true },
  { id: "noticePeriodMonths", label: { en: "Notice period to end tenancy (months)", bn: "চুক্তি বাতিলের নোটিশ মেয়াদ (মাস)" }, type: "number", required: true },
];

const NOTICE_FIELDS: Field[] = [
  { id: "senderName", label: { en: "Your full name", bn: "আপনার পূর্ণ নাম" }, type: "text", required: true },
  { id: "senderAddress", label: { en: "Your address", bn: "আপনার ঠিকানা" }, type: "textarea", required: true },
  { id: "recipientName", label: { en: "Recipient's full name", bn: "প্রাপকের পূর্ণ নাম" }, type: "text", required: true },
  { id: "recipientAddress", label: { en: "Recipient's address", bn: "প্রাপকের ঠিকানা" }, type: "textarea", required: true },
  { id: "noticeDate", label: { en: "Date of notice", bn: "নোটিশের তারিখ" }, type: "date", required: true },
  { id: "complianceDays", label: { en: "Days given to comply", bn: "প্রতিকারের জন্য নির্ধারিত সময় (দিন)" }, type: "number", required: true },
  { id: "factsDescription", label: { en: "Describe what happened", bn: "ঘটনার বিবরণ" }, type: "textarea", required: true },
  { id: "demandDescription", label: { en: "What are you demanding?", bn: "আপনি কী দাবি করছেন?" }, type: "textarea", required: true },
];

function fmtDate(value: string, lang: Lang): string {
  if (!value) return "____";
  const d = new Date(value + "T00:00:00");
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime()) || !months) return "";
  d.setMonth(d.getMonth() + months);
  return fmtDate(d.toISOString().slice(0, 10), "en");
}

function fill(v: string | undefined) {
  return <span className="border-b border-stone-900 px-1 font-medium">{v || "____________"}</span>;
}

function RentalPreview({ v, lang }: { v: Record<string, string>; lang: Lang }) {
  const t = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const endDate = addMonths(v.leaseStartDate, Number(v.leaseDurationMonths || 0));
  return (
    <div className="font-serif">
      <h2 className="text-center text-xl font-semibold">{t("Rental Agreement", "বাড়ি ভাড়ার চুক্তিপত্র")}</h2>
      <p className="mt-6">
        {t(`This Rental Agreement is made on ${fmtDate(v.leaseStartDate, lang)}, between:`, `এই চুক্তিপত্রটি ${fmtDate(v.leaseStartDate, lang)} তারিখে সম্পাদিত হলো:`)}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="border border-stone-300 p-4">
          <p className="text-xs uppercase tracking-wide text-stone-500">{t("Landlord", "বাড়িওয়ালা")}</p>
          <p className="mt-1">{fill(v.landlordName)}<br />{fill(v.landlordAddress)}</p>
        </div>
        <div className="border border-stone-300 p-4">
          <p className="text-xs uppercase tracking-wide text-stone-500">{t("Tenant", "ভাড়াটিয়া")}</p>
          <p className="mt-1">{fill(v.tenantName)}<br />{fill(v.tenantAddress)}</p>
        </div>
      </div>
      <p className="mt-6 font-semibold">{t("1. The property", "১. সম্পত্তি")}</p>
      <p>{t("The Landlord lets out the property at", "বাড়িওয়ালা নিম্নবর্ণিত সম্পত্তিটি ভাড়া দিতে সম্মত হলেন")} {fill(v.propertyAddress)}.</p>
      <p className="mt-4 font-semibold">{t("2. Rent", "২. ভাড়া")}</p>
      <p>{t("Monthly rent:", "মাসিক ভাড়া:")} {t("BDT", "৳")} {fill(v.monthlyRent)}. {t("Security deposit:", "জামানত:")} {t("BDT", "৳")} {fill(v.securityDeposit)}, {t("refundable at the end of tenancy.", "চুক্তি শেষে ফেরতযোগ্য।")}</p>
      <p className="mt-4 font-semibold">{t("3. Duration", "৩. মেয়াদ")}</p>
      <p>{t(`${v.leaseDurationMonths || "__"} months, from ${fmtDate(v.leaseStartDate, lang)} to ${endDate || "____"}.`, `${v.leaseDurationMonths || "__"} মাস, ${fmtDate(v.leaseStartDate, lang)} থেকে ${endDate || "____"} পর্যন্ত।`)}</p>
      <p className="mt-4 font-semibold">{t("4. Ending the tenancy", "৪. চুক্তি বাতিল")}</p>
      <p>{t(`Either party may terminate with ${v.noticePeriodMonths || "__"} months' written notice.`, `যেকোনো পক্ষ ${v.noticePeriodMonths || "__"} মাসের লিখিত নোটিশে চুক্তি বাতিল করতে পারবেন।`)}</p>
      <div className="mt-12 flex justify-between gap-8 text-center text-sm">
        <div className="flex-1"><p className="border-t border-stone-900 pt-1">{t("Landlord's signature", "বাড়িওয়ালার স্বাক্ষর")}</p></div>
        <div className="flex-1"><p className="border-t border-stone-900 pt-1">{t("Tenant's signature", "ভাড়াটিয়ার স্বাক্ষর")}</p></div>
      </div>
      <p className="mt-10 text-center text-xs text-stone-500">
        {t("Drafted with LawSuite — not legal advice. Have a lawyer review before signing.", "LawSuite-এর মাধ্যমে তৈরি — আইনি পরামর্শ নয়। স্বাক্ষরের আগে আইনজীবীর পরামর্শ নিন।")}
      </p>
    </div>
  );
}

function NoticePreview({ v, lang }: { v: Record<string, string>; lang: Lang }) {
  const t = (en: string, bn: string) => (lang === "bn" ? bn : en);
  return (
    <div className="font-serif">
      <h2 className="text-center text-xl font-semibold">{t("Legal Notice", "আইনি নোটিশ")}</h2>
      <p className="mt-6">{t("Date:", "তারিখ:")} {fill(fmtDate(v.noticeDate, lang))}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="border border-stone-300 p-4">
          <p className="text-xs uppercase tracking-wide text-stone-500">{t("From", "প্রেরক")}</p>
          <p className="mt-1">{fill(v.senderName)}<br />{fill(v.senderAddress)}</p>
        </div>
        <div className="border border-stone-300 p-4">
          <p className="text-xs uppercase tracking-wide text-stone-500">{t("To", "প্রাপক")}</p>
          <p className="mt-1">{fill(v.recipientName)}<br />{fill(v.recipientAddress)}</p>
        </div>
      </div>
      <p className="mt-6 font-semibold">{t("1. Background", "১. পটভূমি")}</p>
      <p>{fill(v.factsDescription)}</p>
      <p className="mt-4 font-semibold">{t("2. Demand", "২. দাবি")}</p>
      <p>{fill(v.demandDescription)}</p>
      <p className="mt-2">
        {t(`You are called upon to comply within ${v.complianceDays || "__"} days of receipt, failing which legal proceedings may follow.`, `এই নোটিশ প্রাপ্তির ${v.complianceDays || "__"} দিনের মধ্যে প্রতিকার করতে অনুরোধ করা হলো, ব্যর্থ হলে আইনি ব্যবস্থা নেওয়া হতে পারে।`)}
      </p>
      <div className="mt-12 text-sm">
        <p className="inline-block border-t border-stone-900 pt-1">{fill(v.senderName)}</p>
      </div>
      <p className="mt-10 text-center text-xs text-stone-500">
        {t("Drafted with LawSuite — not legal advice. Consider having a lawyer review before sending.", "LawSuite-এর মাধ্যমে তৈরি — আইনি পরামর্শ নয়। পাঠানোর আগে আইনজীবীর মাধ্যমে যাচাই করুন।")}
      </p>
    </div>
  );
}

export default function Templates() {
  const [docType, setDocType] = useState<DocType>("rental");
  const [lang, setLang] = useState<Lang>("en");
  const [values, setValues] = useState<Record<string, string>>({});

  const fields = docType === "rental" ? RENTAL_FIELDS : NOTICE_FIELDS;

  function setField(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 2rem; }
        }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-emerald-950">Document templates</h1>
          <p className="mt-2 text-stone-600">Fill a guided form, get a formatted document ready to print or save as PDF.</p>
        </div>
        <div className="flex overflow-hidden rounded-md border border-stone-300 text-sm">
          <button onClick={() => setLang("en")} className={`px-3 py-1.5 ${lang === "en" ? "bg-emerald-950 text-white" : "text-stone-600"}`}>English</button>
          <button onClick={() => setLang("bn")} className={`px-3 py-1.5 ${lang === "bn" ? "bg-emerald-950 text-white" : "text-stone-600"}`}>বাংলা</button>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => { setDocType("rental"); setValues({}); }}
          className={`rounded-md px-4 py-2 text-sm font-medium ${docType === "rental" ? "bg-amber-500 text-emerald-950" : "border border-stone-300 text-stone-600"}`}
        >
          Rental Agreement
        </button>
        <button
          onClick={() => { setDocType("notice"); setValues({}); }}
          className={`rounded-md px-4 py-2 text-sm font-medium ${docType === "notice" ? "bg-amber-500 text-emerald-950" : "border border-stone-300 text-stone-600"}`}
        >
          Legal Notice
        </button>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[380px_1fr]">
        <div>
          {fields.map((f) => (
            <div key={f.id} className="mb-5">
              <label className="mb-1 block text-sm text-stone-600">
                {f.label[lang]}{f.required && <span className="text-red-500"> *</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  rows={2}
                  value={values[f.id] || ""}
                  onChange={(e) => setField(f.id, e.target.value)}
                  className="w-full rounded-md border border-stone-300 px-3 py-2 focus:border-amber-400 focus:outline-none"
                />
              ) : (
                <input
                  type={f.type}
                  value={values[f.id] || ""}
                  onChange={(e) => setField(f.id, e.target.value)}
                  className="w-full rounded-md border border-stone-300 px-3 py-2 focus:border-amber-400 focus:outline-none"
                />
              )}
            </div>
          ))}

          <button
            onClick={() => window.print()}
            className="mt-2 w-full rounded-md bg-emerald-950 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-900"
          >
            Download / Print PDF
          </button>
          <p className="mt-2 text-xs text-stone-400">
            Opens your browser's print dialog — choose "Save as PDF" as the destination.
          </p>
        </div>

        <div className="print-area">
          <div className="rounded-lg border border-stone-200 bg-white p-10 shadow-sm">
            {docType === "rental" ? <RentalPreview v={values} lang={lang} /> : <NoticePreview v={values} lang={lang} />}
          </div>
        </div>
      </div>
    </div>
  );
}
