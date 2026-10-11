"use client";

import React, { useState, useEffect } from "react";
import { GitBranch, Star, GitFork, ArrowUpRight, Loader2, GitCommit, RefreshCw } from "lucide-react";
import type { GitHubRepo } from "@/app/api/github/route";

export function GitHubActivity({ defaultUser = "anshu1008" }: { defaultUser?: string }) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [user, setUser] = useState(defaultUser);
  const [userInput, setUserInput] = useState(defaultUser);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setError(null);
        const res = await fetch(`/api/github?user=${encodeURIComponent(defaultUser)}`);
        const data = await res.json();
        if (!active) return;
        if (!res.ok && !data.repos) {
          throw new Error(data.error || "Failed to load GitHub activity");
        }
        setRepos(data.repos || []);
        setIsFallback(Boolean(data.isFallback));
        setUser(data.user || defaultUser);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "GitHub connection error");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [defaultUser]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = userInput.trim();
    if (!trimmed) return;

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/github?user=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok && !data.repos) {
        throw new Error(data.error || "Failed to load GitHub activity");
      }
      setRepos(data.repos || []);
      setIsFallback(Boolean(data.isFallback));
      setUser(data.user || trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "GitHub connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card" style={{ padding: 28, marginTop: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--blue)" }}>
            <GitBranch size={14} /> Git / GitHub Integration
          </div>
          <h2 style={{ fontSize: "clamp(20px, 3.5vw, 26px)", letterSpacing: "-.04em", margin: "6px 0 4px" }}>
            Real Engineering Activity
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
            Connected to GitHub account: <strong style={{ color: "var(--ink)" }}>@{user}</strong>
            {isFallback && <span style={{ marginLeft: 8, color: "var(--amber)" }}>(Offline preview mode)</span>}
          </p>
        </div>

        {/* Change account / refresh form */}
        <form onSubmit={handleConnect} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="GitHub username"
            className="field"
            style={{ padding: "8px 12px", fontSize: 13, width: 150 }}
            aria-label="GitHub username to inspect"
          />
          <button
            type="submit"
            disabled={loading}
            className="button button-outline"
            style={{ padding: "8px 14px", fontSize: 12, borderRadius: 10, display: "inline-flex", gap: 6 }}
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Sync
          </button>
        </form>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "#fee2e2", color: "#991b1b", borderRadius: 10, fontSize: 12, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0", gap: 10, color: "var(--muted)" }}>
          <Loader2 size={20} className="animate-spin" />
          <span style={{ fontSize: 13 }}>Connecting to GitHub API...</span>
        </div>
      ) : repos.length === 0 ? (
        <div style={{ padding: "30px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
          No public repositories found for @{user}.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {repos.map((repo) => (
            <div
              key={repo.name}
              style={{
                padding: 18,
                borderRadius: 14,
                border: "1px solid var(--line)",
                background: "var(--paper)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--ink)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      textDecoration: "none",
                    }}
                  >
                    <GitCommit size={15} style={{ color: "var(--blue)" }} />
                    {repo.name}
                    <ArrowUpRight size={13} style={{ color: "var(--muted)" }} />
                  </a>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "'DM Mono', monospace",
                      color: "var(--blue)",
                      background: "var(--lav, #eeebff)",
                      padding: "2px 6px",
                      borderRadius: 6,
                    }}
                  >
                    {repo.language}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)", margin: "8px 0 0", lineHeight: 1.6 }}>
                  {repo.description}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--muted)", paddingTop: 10, borderTop: "1px solid var(--line)" }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Star size={12} style={{ color: "var(--amber)" }} /> {repo.stargazers_count}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <GitFork size={12} /> {repo.forks_count}
                  </span>
                </div>
                <span>Updated {new Date(repo.updated_at).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
