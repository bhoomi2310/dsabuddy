import { useState, useEffect, useCallback } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { Sidebar, DashboardSkeleton } from "./components";
import { Dashboard } from "./Dashboard";
import { Analytics } from "./Analytics";
import { PYQs } from "./PYQs";
import { Leaderboard } from "./Leaderboard";
import { Settings } from "./Settings";
import { InterviewForum } from "./InterviewForum";
import { QuestionView } from "./QuestionView";

import { API_BASE_URL } from "@/config/constants";
import { useUserStore } from "@/store/useUserStore";

export function DashboardPage() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(() => {
    const path = location.pathname;
    if (path.startsWith("/dashboard/forum")) return "forum";
    if (path.startsWith("/dashboard/analytics")) return "analytics";
    if (path.startsWith("/dashboard/pyqs")) return "pyqs";
    if (path.startsWith("/dashboard/leaderboard")) return "leaderboard";
    if (path.startsWith("/dashboard/settings")) return "settings";
    return "dashboard";
  });
  const [selectedQuestionSlug, setSelectedQuestionSlug] = useState("two-sum");
  const storeUser = useUserStore((state) => state.user);
  const [firstLoad, setFirstLoad] = useState(!storeUser);

  const setUser = useUserStore((state) => state.setUser);
  const [platforms, setPlatforms] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("dsabuddy_user");
    localStorage.removeItem("dsabuddy_dashboard_cache");
    window.location.href = "/login";
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/dashboard/forum")) {
      setActiveSection("forum");
    } else if (path.startsWith("/dashboard/analytics")) {
      setActiveSection("analytics");
    } else if (path.startsWith("/dashboard/pyqs")) {
      setActiveSection("pyqs");
    } else if (path.startsWith("/dashboard/leaderboard")) {
      setActiveSection("leaderboard");
    } else if (path.startsWith("/dashboard/settings")) {
      setActiveSection("settings");
    } else {
      setActiveSection("dashboard");
    }
  }, [location.pathname]);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      setError(null);

      const headers = { Authorization: `Bearer ${token}` };
      const [userRes, platRes, analyticsRes, compRes] = await Promise.all([
        fetch(`${API_BASE_URL}/auth/me`, { headers }),
        fetch(`${API_BASE_URL}/platform-connections`, { headers }),
        fetch(`${API_BASE_URL}/daily-activity/analytics`, { headers }),
        fetch(`${API_BASE_URL}/companies`, { headers }),
      ]);

      let hasError = false;
      if (!userRes.ok) {
        hasError = true;
        console.error("User fetch failed:", userRes.status);
      }
      if (!platRes.ok) {
        hasError = true;
        console.error("Platforms fetch failed:", platRes.status);
      }
      if (!analyticsRes.ok) {
        hasError = true;
        console.error("Analytics fetch failed:", analyticsRes.status);
      }
      if (!compRes.ok) {
        hasError = true;
        console.error("Companies fetch failed:", compRes.status);
      }

      if (hasError) {
        setError(
          "Failed to fetch some dashboard data. Please try again later.",
        );
      }

      let updatedCache = {};
      try {
        const cachedData = localStorage.getItem("dsabuddy_dashboard_cache");
        if (cachedData) {
          updatedCache = JSON.parse(cachedData);
        }
      } catch (e) {}

      if (userRes.ok) {
        const resData = await userRes.json();
        const u = resData.user || resData;
        setUser(u);
        updatedCache.user = u;
      }
      if (platRes.ok) {
        const platData = await platRes.json();
        const p = platData.platformConnections || platData;
        setPlatforms(p);
        updatedCache.platforms = p;
      }
      if (analyticsRes.ok) {
        const a = await analyticsRes.json();
        setAnalytics(a);
        updatedCache.analytics = a;
      }
      if (compRes.ok) {
        const c = await compRes.json();
        const companiesArray = Array.isArray(c) ? c : c.companies || [];
        setCompanies(companiesArray);
        updatedCache.companies = companiesArray;
      }

      try {
        localStorage.setItem(
          "dsabuddy_dashboard_cache",
          JSON.stringify(updatedCache),
        );
      } catch (e) {
        console.error("Failed to write dashboard cache", e);
      }
    } catch (e) {
      console.error("Failed to fetch dashboard data", e);
      setError("Network error occurred while fetching dashboard data.");
    } finally {
      setFirstLoad(false);
    }
  }, [setUser]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Load from cache immediately so the user has something to see instantly
    try {
      const cachedData = localStorage.getItem("dsabuddy_dashboard_cache");
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (parsed.user) setUser(parsed.user);
        if (parsed.platforms) setPlatforms(parsed.platforms);
        if (parsed.analytics) setAnalytics(parsed.analytics);
        if (parsed.companies) {
          const companiesArray = Array.isArray(parsed.companies)
            ? parsed.companies
            : parsed.companies.companies || [];
          setCompanies(companiesArray);
        }
      }
    } catch (e) {
      console.error("Failed to load dashboard cache", e);
    }

    fetchData();
  }, [fetchData, setUser]);

  const handleSelectQuestion = (slug) => {
    setSelectedQuestionSlug(slug);
    setActiveSection("problems");
  };

  const renderSection = () => {
    if (firstLoad && !storeUser) {
      return <DashboardSkeleton />;
    }
    switch (activeSection) {
      case "dashboard":
        return (
          <Dashboard
            user={storeUser}
            platforms={platforms}
            analytics={analytics}
            onUpdate={fetchData}
          />
        );
      case "problems":
        return <QuestionView titleSlug={selectedQuestionSlug} />;
      case "analytics":
        return <Analytics analytics={analytics} />;
      case "pyqs":
        return (
          <PYQs companies={companies} onSelectQuestion={handleSelectQuestion} />
        );
      case "leaderboard":
        return <Leaderboard user={storeUser} />;
      case "settings":
        return <Settings platforms={platforms} onUpdate={fetchData} />;
      case "forum":
        return <InterviewForum />;
      default:
        return (
          <Dashboard
            user={storeUser}
            platforms={platforms}
            analytics={analytics}
            onUpdate={fetchData}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#000000]">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        user={storeUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 ml-0 md:ml-20 flex flex-col h-screen overflow-hidden pt-16 md:pt-0">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6 flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-400 font-bold"
                >
                  ×
                </button>
              </div>
            )}
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
