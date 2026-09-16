import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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
import Helpline from "./pages/Helpline";
import MyBookings from "./pages/MyBookings";
import Documents from "./pages/Documents";
import DocumentDetail from "./pages/DocumentDetail";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  return (
    <AuthProvider>
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
            <Route path="/helpline" element={<Helpline />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/:id" element={<DocumentDetail />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
