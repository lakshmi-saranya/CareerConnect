import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage        from "./pages/LoginPage";
import Dashboard        from "./pages/Dashboard";
import UploadResumePage from "./pages/UploadResumePage";
import JobMatchesPage   from "./pages/JobMatchesPage";
import DraftPage        from "./pages/DraftPage";
import ApplicationsPage from "./pages/ApplicationsPage";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles/global.css";
import "./styles/components.css";

const GOOGLE_CLIENT_ID = "639613693840-n25aulbovrmsq68bg0c2t3hu18cja8al.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected */}
            <Route path="/"            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/upload"      element={<ProtectedRoute><UploadResumePage /></ProtectedRoute>} />
            <Route path="/jobs"        element={<ProtectedRoute><JobMatchesPage /></ProtectedRoute>} />
            <Route path="/draft"       element={<ProtectedRoute><DraftPage /></ProtectedRoute>} />
            <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
