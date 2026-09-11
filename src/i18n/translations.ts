// Translation dictionary for LawSuite.
// Add new keys here as you build more pages — every key must exist in both
// "en" and "bn" or TypeScript will complain (see the Translations type below).

export type Language = "en" | "bn";

export const translations = {
  en: {
    nav: {
      home: "Home",
      chat: "AI Assistant",
      summarizer: "Document Summarizer",
      lawyers: "Find a Lawyer",
      glossary: "Glossary",
      templates: "Templates",
      rights: "Know Your Rights",
      helpline: "Helpline",
      news: "News",
      dashboard: "Dashboard",
      login: "Log in",
    },
    common: {
      loading: "Loading...",
      submit: "Submit",
      cancel: "Cancel",
      save: "Save",
      search: "Search",
    },
  },
  bn: {
    nav: {
      home: "হোম",
      chat: "এআই সহায়ক",
      summarizer: "ডকুমেন্ট সারসংক্ষেপ",
      lawyers: "আইনজীবী খুঁজুন",
      glossary: "পরিভাষা",
      templates: "টেমপ্লেট",
      rights: "আপনার অধিকার জানুন",
      helpline: "হেল্পলাইন",
      news: "সংবাদ",
      dashboard: "ড্যাশবোর্ড",
      login: "লগ ইন",
    },
    common: {
      loading: "লোড হচ্ছে...",
      submit: "জমা দিন",
      cancel: "বাতিল",
      save: "সংরক্ষণ",
      search: "অনুসন্ধান",
    },
  },
} as const;

export type Translations = typeof translations.en;