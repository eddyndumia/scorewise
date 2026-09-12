import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { RequestsProvider } from './context/RequestsContext';
import { RequireUnlocked, RequireUnlockedOrRegistering } from './routes/RequireUnlocked';
import { Splash } from './screens/Splash/Splash';
import { Onboarding } from './screens/Onboarding/Onboarding';
import { SignUp } from './screens/Auth/SignUp';
import { Login } from './screens/Auth/Login';
import { Terms } from './screens/Terms/Terms';
import { StatementInstructions } from './screens/StatementInstructions/StatementInstructions';
import { PinSetup } from './screens/PinSetup/PinSetup';
import { PinEntry } from './screens/PinEntry/PinEntry';
import { Home } from './screens/Home/Home';
import { ConsentRequest } from './screens/ConsentRequest/ConsentRequest';
import { ActiveRequests } from './screens/ActiveRequests/ActiveRequests';
import { StatementUpload } from './screens/StatementUpload/StatementUpload';
import { TransactionReview } from './screens/TransactionReview/TransactionReview';
import { Profile } from './screens/Profile/Profile';
import { About } from './screens/About/About';
import { PrivacySecurity } from './screens/PrivacySecurity/PrivacySecurity';
import { AIAssistant } from './screens/AIAssistant/AIAssistant';
import { ScoreSimulator } from './screens/ScoreSimulator/ScoreSimulator';
import pageTransitionStyles from './components/PageTransition.module.css';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div key={location.pathname} className={pageTransitionStyles.enter}>
      <Routes location={location}>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/terms" element={<Terms />} />
        <Route
          path="/statement-instructions"
          element={
            <RequireUnlockedOrRegistering>
              <StatementInstructions />
            </RequireUnlockedOrRegistering>
          }
        />
        <Route path="/pin-setup" element={<PinSetup />} />
        <Route path="/pin-entry" element={<PinEntry />} />
        <Route
          path="/home"
          element={
            <RequireUnlocked>
              <Home />
            </RequireUnlocked>
          }
        />
        <Route
          path="/consent/:requestId"
          element={
            <RequireUnlocked>
              <ConsentRequest />
            </RequireUnlocked>
          }
        />
        <Route
          path="/requests"
          element={
            <RequireUnlocked>
              <ActiveRequests />
            </RequireUnlocked>
          }
        />
        <Route
          path="/statement-upload"
          element={
            <RequireUnlockedOrRegistering>
              <StatementUpload />
            </RequireUnlockedOrRegistering>
          }
        />
        <Route
          path="/statement-review"
          element={
            <RequireUnlockedOrRegistering>
              <TransactionReview />
            </RequireUnlockedOrRegistering>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireUnlocked>
              <Profile />
            </RequireUnlocked>
          }
        />
        <Route
          path="/profile/about"
          element={
            <RequireUnlocked>
              <About />
            </RequireUnlocked>
          }
        />
        <Route
          path="/profile/privacy-security"
          element={
            <RequireUnlocked>
              <PrivacySecurity />
            </RequireUnlocked>
          }
        />
        <Route
          path="/assistant"
          element={
            <RequireUnlocked>
              <AIAssistant />
            </RequireUnlocked>
          }
        />
        <Route
          path="/simulator"
          element={
            <RequireUnlocked>
              <ScoreSimulator />
            </RequireUnlocked>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <RequestsProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </RequestsProvider>
  );
}

export default App;
