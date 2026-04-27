import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import GlobalStyles from './theme/GlobalStyles';
import useAuth from './hooks/useAuth';
import Login from './pages/login/Login';
import Summary from './pages/summary/Summary';
import Tasks from './pages/tasks/Tasks';
import Calendar from './pages/calendar/Calendar';
import Notebook from './components/notebook/Notebook';
import NotebookToggle from './components/notebook/NotebookToggle';
import MarginLayout from './components/margins/MarginLayout';

export default function App() {
    const { user, loading } = useAuth();

    const [open, setOpen] = useState(false);
    const [closing, setClosing] = useState(false);
    const [mounted, setMounted] = useState(false);

    function openNotebook() {
        setMounted(true);
        setClosing(false);
        setOpen(true);
    }

    function closeNotebook() {
        setOpen(false);
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            setMounted(false);
        }, 350);
    }

    function toggleNotebook() {
        if (closing) return;
        open ? closeNotebook() : openNotebook();
    }

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape' && open) closeNotebook();
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    if (loading) return null;

    if (!user) {
        return (
            <ThemeProvider>
                <GlobalStyles />
                <Login />
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider>
            <GlobalStyles />
            <BrowserRouter>
                <MarginLayout notebookOpen={open}>
                    <Routes>
                        <Route path="/summary" element={<Summary />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="*" element={<Navigate to="/summary" replace />} />
                    </Routes>
                </MarginLayout>
                <NotebookToggle open={open} onToggle={toggleNotebook} />
                {mounted && <Notebook closing={closing} />}
            </BrowserRouter>
        </ThemeProvider>
    );
}