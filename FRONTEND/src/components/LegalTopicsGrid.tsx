import React from "react";

interface TopicCard {
  number: string;
  title: string;
  description: string;
  href: string;
}

const topics: TopicCard[] = [
  {
    number: "01",
    title: "Tenant Rights",
    description: "Evictions, deposits, and lease disputes explained.",
    href: "/topics/tenant-rights",
  },
  {
    number: "02",
    title: "Workplace",
    description: "Wrongful termination, dues, and workplace disputes.",
    href: "/topics/workplace",
  },
  {
    number: "03",
    title: "Contracts",
    description: "Understand what you're signing before you sign it.",
    href: "/topics/contracts",
  },
  {
    number: "04",
    title: "Family",
    description: "Marriage, custody, and inheritance basics.",
    href: "/topics/family",
  },
];

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
    maxWidth: "420px",
  },
  card: {
    display: "block",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid rgba(212, 175, 55, 0.35)",
    background: "rgba(255, 255, 255, 0.03)",
    textDecoration: "none",
    color: "#f5f1e6",
    transition: "border-color 0.2s ease, transform 0.2s ease, background 0.2s ease",
  },
  number: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#d4af37",
    marginBottom: "8px",
    letterSpacing: "0.05em",
  },
  title: {
    display: "block",
    fontSize: "17px",
    fontWeight: 700,
    marginBottom: "6px",
  },
  description: {
    display: "block",
    fontSize: "13px",
    lineHeight: 1.4,
    color: "rgba(245, 241, 230, 0.7)",
  },
};

export default function LegalTopicsGrid() {
  return (
    <div style={styles.grid}>
      {topics.map((topic) => (
        
          key={topic.href}
          href={topic.href}
          style={styles.card}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#d4af37";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.35)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
          }}
        >
          <span style={styles.number}>{topic.number}</span>
          <span style={styles.title}>{topic.title}</span>
          <span style={styles.description}>{topic.description}</span>
        </a>
      ))}
    </div>
  );
}
