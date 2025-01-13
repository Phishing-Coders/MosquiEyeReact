import '@ionic/react/css/core.css';
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Ovitrap from "./scenes/ovitrap";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import LoginPage from "./scenes/loginPage";
import Profile from "./scenes/profile";
import MapPage from "./scenes/maps";
import Scan from "./scenes/scan";
import Analysis from "./scenes/analysis";
import QRScan from "./scenes/qrscan/index";
import AnalysisHistory from "./scenes/analysisHistory";
import { useMediaQuery, Box } from "@mui/material";

import MobileNavigation from "./components/MobileNavigation";
import { setupIonicReact } from "@ionic/react";
import { IonApp, IonContent } from '@ionic/react';
import { useUser } from '@clerk/clerk-react';

setupIonicReact();

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();
  const { user } = useUser();
  const isMobile = useMediaQuery("(max-width:600px)");

  const userRole = user?.organizationMemberships?.[0]?.role;

  useEffect(() => {
    if (user && user.id) {
      fetch("/api/users/saveUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          role: userRole,
        }),
      })
        .then((res) => res.json())
        .then((data) => console.log("User synced:", data))
        .catch((err) => console.error("Sync error:", err));
    }
  }, [user]);

  const routes = [
    { path: "/dashboard", element: <Dashboard />, permission: "dashboard" },
    { path: "/team", element: <Team />, permission: "team" },
    { path: "/contacts", element: <Contacts />, permission: "contacts" },
    { path: "/ovitrap", element: <Ovitrap />, permission: "ovitrap" },
    { path: "/form", element: <Form />, permission: "form" },
    { path: "/bar", element: <Bar/>, permission: "bar" },
    { path: "/pie", element: <Pie/>, permission: "pie" },
    { path: "/line", element: <Line/>, permission: "line" },
    { path: "/faq", element: <FAQ />, permission: "faq" },
    { path: "calendar", element: <Calendar />, permission: "calendar" },
    { path: "/geography", element: <Geography />, permission: "geography" },
    { path: "/profile", element: <Profile />, permission: "profile" },
    { path: "/maps", element: <MapPage />, permission: "maps" },
    { path: "/scan", element: <Scan />, permission: "scan" },
    { path: "/analysis", element: <Analysis />, permission: "analysis" },
    { path: "/analysisHistory", element: <AnalysisHistory />, permission: "analysisHistory" },
    { path: "/qrscan", element: <QRScan />, permission: "qrscan" },
  ];

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {isAuthenticated && <Sidebar isSidebar={isSidebar} />}
          <main className="content">
            {isAuthenticated && <Topbar setIsSidebar={setIsSidebar} />}
            <Box sx={{ 
                height: '100%',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                pb: isMobile ? '56px' : 0
              }}>
            <Routes>
              <Route
                path="/"
                element={
                  !isAuthenticated ? (
                    <LoginPage />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />

              {routes.map(({ path, element, permission }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <ProtectedRoute
                      element={element}
                      permission={permission}
                    />
                  }
                />
              ))}

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />

              {/* <Route
                path="/dashboard"
                element={
                  isAuthenticated ? (
                    <Dashboard />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/team"
                element={
                  isAuthenticated ? <Team /> : <Navigate to="/" replace />
                }
              />
              <Route
                path="/contacts"
                element={
                  isAuthenticated ? <Contacts /> : <Navigate to="/" replace />
                }
              />
              <Route
                path="/invoices"
                element={
                  isAuthenticated ? <Invoices /> : <Navigate to="/" replace />
                }
              />
              <Route
                path="/form"
                element={
                  isAuthenticated ? <Form /> : <Navigate to="/" replace />
                }
              />
              <Route
                path="/bar"
                element={
                  isAuthenticated ? <Bar /> : <Navigate to="/" replace />
                }
              />
              <Route
                path="/pie"
                element={
                  isAuthenticated ? <Pie /> : <Navigate to="/" replace />
                }
              />
              <Route
                path="/line"
                element={
                  isAuthenticated ? <Line /> : <Navigate to="/" replace />
                }
              />
              <Route
                path="/faq"
                element={
                  isAuthenticated ? <FAQ /> : <Navigate to="/" replace />
                }
              />
              <Route
                path="/calendar"
                element={
                  isAuthenticated ? <Calendar /> : <Navigate to="/" replace />
                }
              />
              <Route
                path="/geography"
                element={
                  isAuthenticated ? <Geography /> : <Navigate to="/" replace />
                }
              />
              <Route
                path="/profile"
                element={
                  isAuthenticated ? <Profile /> : <Navigate to="/" replace />
                }
              />
              <Route
                path="/maps"
                element={
                  isAuthenticated ? <MapPage /> : <Navigate to="/" replace />
                }
              />
              <Route
              path="/scan"
              element={
                isAuthenticated ? <Scan /> : <Navigate to="/" replace />
              }
              />
              <Route
              path="/qrscan"
              element={
                isAuthenticated ? <QRScan /> : <Navigate to="/" replace />
              }
              />
              <Route
              path="/analysis"
              element={
                isAuthenticated ? <Analysis /> : <Navigate to="/" replace />
              }
              /> */}
            </Routes>
            </Box>
            {isAuthenticated && isMobile && <MobileNavigation />}
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
