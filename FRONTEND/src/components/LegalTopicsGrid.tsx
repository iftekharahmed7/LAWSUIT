import React from "react";
import "../styles/legalTopicsGrid.css";

interface TopicCard {
  number: string;
  title: string;
  description: string;
  href: string;
}

const topics: TopicCard[] = [
  { number: "01", title: "Tenant Rights", description: "Evictions, deposits, and lease disputes explained.", href: "/topics/tenant-rights" },
  { number: "02", title: "Workplace", description: "Wrongful termination, dues, and workplace disputes.", href: "/topics/workplace" },
  { number: "03", title: "Contracts", description: "Understand what you are signing before you sign it.", href: "/topics/contracts" },
  { number: "04", title: "Family", description: "Marriage, custody, and inheritance basics.", href: "/topics/family" },
];

export default function LegalTopicsGrid() {
  return (
    <div className="legal-topics-grid">
      {topics.map((topic) => (
        <a key={topic.href} href={topic.href} className="legal-topic-card">
          <span className="legal-topic-number">{topic.number}</span>
          <span className="legal-topic-title">{topic.title}</span>
          <span className="legal-topic-description">{topic.description}</span>
        </a>
      ))}
    </div>
  );
}
