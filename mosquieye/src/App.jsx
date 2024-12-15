import '@ionic/react/css/core.css';
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
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

import { setupIonicReact } from "@ionic/react";
import { IonButton, IonDatetime } from '@ionic/react';

setupIonicReact();

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();

  // if (!isLoaded) {
  //   return <div>Loading...</div>;
  // }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {isAuthenticated && <Sidebar isSidebar={isSidebar} />}
          <main className="content">
            {isAuthenticated && <Topbar setIsSidebar={setIsSidebar} />}
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
              <Route
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
              path="/analysis"
              element={
                isAuthenticated ? <Analysis /> : <Navigate to="/" replace />
              }
              />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
