import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import LoginView from "@/views/LoginView";
import BracketView from "@/views/BracketView";
import QuizStageView from "@/views/QuizStageView";
import ContestantView from "@/views/ContestantView";
import AudienceView from "@/views/AudienceView";

export default function App() {
  return (
    <AppProvider>
      <div className="size-full">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginView />} />
            <Route path="/host/bracket" element={<BracketView />} />
            <Route path="/host/quiz" element={<QuizStageView />} />
            <Route path="/contestant/:teamId" element={<Navigate to="/" replace />} />
            {/* Redirect old url structure for teams that refreshed */}
            <Route path="/contestant/:groupId/:teamId" element={<Navigate to="/" replace />} />
            <Route path="/audience" element={<AudienceView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AppProvider>
  );
}
