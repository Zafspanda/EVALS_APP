import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from '@clerk/clerk-react';
import Dashboard from './views/Dashboard';
import EvaluationView from './views/EvaluationView';
import ImportView from './views/ImportView';
import './App.scss';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <SignedIn>
          <header className="app__header">
            <div className="app__header-content">
              <h1 className="app__title">Evals App</h1>
              <nav className="app__nav">
                <Link to="/">Dashboard</Link>
                <Link to="/import">Import</Link>
                <Link to="/traces/1">Traces</Link>
              </nav>
              <div className="app__user">
                <UserButton />
              </div>
            </div>
          </header>

          <main className="app__main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/import" element={<ImportView />} />
              <Route path="/traces/:id" element={<EvaluationView />} />
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
