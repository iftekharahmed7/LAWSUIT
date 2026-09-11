import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AskAI from "./pages/AskAI";
import Lawyers from "./pages/Lawyers";
import Glossary from "./pages/Glossary";
import Templates from "./pages/Templates";
import KnowYourRights from "./pages/KnowYourRights";
import LegalNews from "./pages/LegalNews";
import SummariseDocument from "./pages/SummariseDocument";
// Your original backend-testing page — kept around at /api-tester so you
// don't lose it. If this import errors, open ApiTester.tsx and check
// whether it uses "export default" — if not, change this to a named
// import instead, e.g. `import { ApiTester } from "./ApiTester";`;

export default function App() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ask" element={<AskAI />} />
          <Route path="/lawyers" element={<Lawyers />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/rights" element={<KnowYourRights />} />
          <Route path="/news" element={<LegalNews />} />
          <Route path="/summarise" element={<SummariseDocument />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
