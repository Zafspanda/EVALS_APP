import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import AppHeader from './components/AppHeader';
import Dashboard from './views/Dashboard';
import TracesView from './views/TracesView';
import TraceDetailView from './views/TraceDetailView';
import ImportView from './views/ImportView';
import './App.scss';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <SignedIn>
          <AppHeader />

          <main className="app__main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/traces" element={<TracesView />} />
              <Route path="/trace/:id" element={<TraceDetailView />} />
              <Route path="/import" element={<ImportView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </SignedIn>

        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </div>
    </BrowserRouter>
  );
}

export default App;
