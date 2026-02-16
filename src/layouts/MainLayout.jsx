import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    Menu,
    X,
    CreditCard,
    Moon,
    Sun,
    DollarSign
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useDarkMode();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Clients', href: '/clients', icon: Users },
        { name: 'Invoices', href: '/invoices', icon: FileText },
        { name: 'Expenses', href: '/expenses', icon: DollarSign },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center justify-between px-6 border-b">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                            B
                        </div>
                        BusinessBox
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <li key={item.name}>
                                    <Link
                                        to={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="border-t p-4 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-sm font-medium text-muted-foreground">Theme</span>
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            JS
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium">Jane Smith</p>
                            <p className="truncate text-xs text-muted-foreground">Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="flex h-16 items-center justify-between border-b bg-card px-6 lg:hidden">
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="-ml-2 p-2 text-muted-foreground hover:text-foreground lg:hidden"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <span className="ml-4 font-semibold">Dashboard</span>
                    </div>
                    <button
                        onClick={() => setIsDark(!isDark)}
                        className="p-2 text-muted-foreground hover:text-foreground"
                    >
                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
