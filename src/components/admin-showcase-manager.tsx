"use client";

import { useState } from "react";
import {
  GitBranch,
  Image as ImageIcon,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  Sparkles,
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface AvailableRepo {
  name: string;
  description: string;
  language: string;
  stars: number;
}

interface GalleryItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  category: string;
  repoName?: string | null;
  projectUrl?: string | null;
  createdAt: string;
}

interface AdminShowcaseManagerProps {
  initialGithubUser: string;
  initialVisibleRepos: string[];
  initialAvailableRepos: AvailableRepo[];
  initialGalleryItems: GalleryItem[];
}

export function AdminShowcaseManager({
  initialGithubUser,
  initialVisibleRepos,
  initialAvailableRepos,
  initialGalleryItems,
}: AdminShowcaseManagerProps) {
  const [activeTab, setActiveTab] = useState<"github" | "gallery">("github");

  // GitHub configuration state
  const [githubUser, setGithubUser] = useState(initialGithubUser);
  const [visibleRepos, setVisibleRepos] = useState<string[]>(initialVisibleRepos);
  const [availableRepos, setAvailableRepos] = useState<AvailableRepo[]>(initialAvailableRepos);
  const [githubSaving, setGithubSaving] = useState(false);
  const [githubSyncing, setGithubSyncing] = useState(false);
  const [customRepoInput, setCustomRepoInput] = useState("");
  const [githubMessage, setGithubMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Gallery items state
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialGalleryItems);
  const [showAddModal, setShowAddModal] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [galleryMessage, setGalleryMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New gallery form state
  const [newTitle, setNewTitle] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("UI/UX Design");
  const [newRepoName, setNewRepoName] = useState("");
  const [newProjectUrl, setNewProjectUrl] = useState("");

  // Search and filter state
  const [repoSearch, setRepoSearch] = useState("");
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState("ALL");

  const filteredRepos = availableRepos.filter((r) =>
    r.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(repoSearch.toLowerCase())) ||
    (r.language && r.language.toLowerCase().includes(repoSearch.toLowerCase()))
  );

  const filteredGallery = galleryItems.filter((g) =>
    galleryCategoryFilter === "ALL" || g.category === galleryCategoryFilter
  );

  function applyPreset(preset: {
    title: string;
    imageUrl: string;
    category: string;
    repoName: string;
    projectUrl: string;
    description: string;
  }) {
    setNewTitle(preset.title);
    setNewImageUrl(preset.imageUrl);
    setNewCategory(preset.category);
    setNewRepoName(preset.repoName);
    setNewProjectUrl(preset.projectUrl);
    setNewDescription(preset.description);
    setShowAddModal(true);
  }

  function selectAllRepos() {
    const allNames = availableRepos.map((r) => r.name);
    setVisibleRepos(Array.from(new Set([...visibleRepos, ...allNames])));
  }

  function deselectAllRepos() {
    setVisibleRepos([]);
  }

  // Toggle repository visibility
  function toggleRepoVisibility(repoName: string) {
    if (visibleRepos.includes(repoName)) {
      setVisibleRepos(visibleRepos.filter((r) => r !== repoName));
    } else {
      setVisibleRepos([...visibleRepos, repoName]);
    }
  }

  // Add custom repo name manually
  function addCustomRepo() {
    const trimmed = customRepoInput.trim();
    if (trimmed && !visibleRepos.includes(trimmed)) {
      setVisibleRepos([...visibleRepos, trimmed]);
      if (!availableRepos.some((r) => r.name.toLowerCase() === trimmed.toLowerCase())) {
        setAvailableRepos([
          { name: trimmed, description: "Manual showcase item", language: "Custom", stars: 0 },
          ...availableRepos,
        ]);
      }
      setCustomRepoInput("");
    }
  }

  // Save GitHub settings
  async function handleSaveGithub(e: React.FormEvent) {
    e.preventDefault();
    setGithubSaving(true);
    setGithubMessage(null);

    try {
      const res = await fetch("/api/admin/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubUser: githubUser.trim(),
          visibleRepos,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save GitHub settings");

      setGithubMessage({
        type: "success",
        text: `Configured @${data.githubUser} with ${visibleRepos.length} showcased repositories.`,
      });
    } catch (err) {
      setGithubMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error saving GitHub configuration",
      });
    } finally {
      setGithubSaving(false);
    }
  }

  // Sync / refresh repos from GitHub for entered username
  async function handleSyncRepos() {
    setGithubSyncing(true);
    setGithubMessage(null);

    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(githubUser.trim())}/repos?sort=updated&per_page=60`);
      if (!res.ok) throw new Error(`Could not fetch repos for user @${githubUser}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        const mapped: AvailableRepo[] = data.map((r: { name: string; description: string; language: string; stargazers_count: number }) => ({
          name: r.name,
          description: r.description || "",
          language: r.language || "TypeScript",
          stars: r.stargazers_count || 0,
        }));
        setAvailableRepos(mapped);
        setGithubMessage({
          type: "success",
          text: `Fetched ${mapped.length} repositories from @${githubUser}.`,
        });
      }
    } catch (err) {
      setGithubMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to sync GitHub repositories",
      });
    } finally {
      setGithubSyncing(false);
    }
  }

  // Create new gallery item
  async function handleAddGalleryItem(e: React.FormEvent) {
    e.preventDefault();
    setGalleryBusy(true);
    setGalleryMessage(null);

    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          imageUrl: newImageUrl,
          description: newDescription,
          category: newCategory,
          repoName: newRepoName || null,
          projectUrl: newProjectUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add showcase item");

      setGalleryItems([data.item, ...galleryItems]);
      setShowAddModal(false);
      setNewTitle("");
      setNewImageUrl("");
      setNewDescription("");
      setNewProjectUrl("");
      setNewRepoName("");
      setGalleryMessage({ type: "success", text: "Screenshot showcase item created!" });
    } catch (err) {
      setGalleryMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to add showcase item",
      });
    } finally {
      setGalleryBusy(false);
    }
  }

  // Delete gallery item
  async function handleDeleteGalleryItem(id: string) {
    if (!window.confirm("Delete this showcase screenshot?")) return;

    try {
      const res = await fetch(`/api/admin/gallery?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete item");

      setGalleryItems(galleryItems.filter((item) => item.id !== id));
      setGalleryMessage({ type: "success", text: "Item deleted." });
    } catch (err) {
      setGalleryMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Delete failed",
      });
    }
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* Top Header */}
      <div>
        <h1 style={{ fontSize: 28, letterSpacing: "-.05em", margin: "0 0 6px", color: "var(--ink)" }}>
          Studio Showcase, GitHub & Screenshot Gallery
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
          Control which GitHub repositories are featured across Nova, and manage screenshot showcases of your builds and designs.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
        <button
          type="button"
          onClick={() => setActiveTab("github")}
          className={`button ${activeTab === "github" ? "" : "button-outline"}`}
          style={{ padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
        >
          <GitBranch size={15} /> GitHub Account & Visible Repos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("gallery")}
          className={`button ${activeTab === "gallery" ? "" : "button-outline"}`}
          style={{ padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
        >
          <ImageIcon size={15} /> Screenshot Gallery ({galleryItems.length})
        </button>
      </div>

      {/* ================================================================= */}
      {/* TAB 1: GITHUB CONFIGURATION                                       */}
      {/* ================================================================= */}
      {activeTab === "github" && (
        <div style={{ display: "grid", gap: 20 }}>
          {githubMessage && (
            <div
              role="status"
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: githubMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
                color: githubMessage.type === "success" ? "#065f46" : "#991b1b",
                border: `1px solid ${githubMessage.type === "success" ? "#a7f3d0" : "#fecaca"}`,
              }}
            >
              {githubMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{githubMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveGithub} className="card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 18, letterSpacing: "-.03em", margin: "0 0 16px", color: "var(--ink)" }}>
              GitHub Profile & Visibility Controls
            </h2>

            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <label className="auth-label" style={{ display: "block", marginBottom: 6 }}>
                  Configured GitHub Username or Organization
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontWeight: 700 }}>
                    @
                  </span>
                  <input
                    type="text"
                    value={githubUser}
                    onChange={(e) => setGithubUser(e.target.value)}
                    required
                    placeholder="blank-ui"
                    className="field"
                    style={{ paddingLeft: 30 }}
                  />
                </div>
              </div>

              <div style={{ alignSelf: "flex-end", display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={handleSyncRepos}
                  disabled={githubSyncing || !githubUser.trim()}
                  className="button button-outline"
                  style={{ padding: "10px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
                >
                  {githubSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  <span>Fetch Repos</span>
                </button>

                <button
                  type="submit"
                  disabled={githubSaving}
                  className="button"
                  style={{ padding: "10px 20px", fontSize: 13 }}
                >
                  {githubSaving ? "Saving..." : "Save Visibility Settings"}
                </button>
              </div>
            </div>

            {/* Quick manual repo adder */}
            <div style={{ padding: "14px 18px", borderRadius: 12, background: "var(--paper)", border: "1px solid var(--line)", marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                Add Custom Repo Name to Showcase
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={customRepoInput}
                  onChange={(e) => setCustomRepoInput(e.target.value)}
                  placeholder="e.g. Nova, my-web-app"
                  className="field"
                  style={{ fontSize: 12, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={addCustomRepo}
                  className="button button-outline"
                  style={{ padding: "8px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* Selection Grid */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                    Select Repositories to Show on Website ({visibleRepos.length} selected)
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    Checked repositories appear on the studio portfolio and code showcase.
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="search"
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                    placeholder="Search repos..."
                    className="field"
                    style={{ fontSize: 12, padding: "5px 10px", width: 160 }}
                  />
                  <button
                    type="button"
                    onClick={selectAllRepos}
                    style={{ background: "none", border: "none", color: "var(--blue)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                  >
                    Select All
                  </button>
                  <span style={{ color: "var(--line)" }}>|</span>
                  <button
                    type="button"
                    onClick={deselectAllRepos}
                    style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {availableRepos.length === 0 ? (
                <div style={{ padding: "30px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                  No repositories loaded. Click &quot;Fetch Repos&quot; above to discover repositories for @{githubUser}.
                </div>
              ) : filteredRepos.length === 0 ? (
                <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                  No repositories match &quot;{repoSearch}&quot;.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {filteredRepos.map((repo) => {
                    const isSelected = visibleRepos.includes(repo.name);
                    return (
                      <div
                        key={repo.name}
                        onClick={() => toggleRepoVisibility(repo.name)}
                        style={{
                          padding: "14px 16px",
                          borderRadius: 12,
                          border: isSelected ? "2px solid #6C4CFF" : "1px solid var(--line)",
                          background: isSelected ? "rgba(108,76,255,0.04)" : "var(--paper)",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 10,
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
                            <FolderGit2 size={14} style={{ color: isSelected ? "#6C4CFF" : "var(--muted)" }} />
                            <span>{repo.name}</span>
                          </div>
                          {repo.description && (
                            <p style={{ fontSize: 11, color: "var(--muted)", margin: "4px 0 0", lineHeight: 1.4 }}>
                              {repo.description}
                            </p>
                          )}
                          <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 10, color: "var(--muted)" }}>
                            <span>{repo.language}</span>
                            {repo.stars > 0 && <span>★ {repo.stars}</span>}
                          </div>
                        </div>

                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 6,
                            border: isSelected ? "none" : "1px solid var(--line)",
                            background: isSelected ? "#6C4CFF" : "transparent",
                            display: "grid",
                            placeItems: "center",
                            color: "#fff",
                            flexShrink: 0,
                          }}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: SCREENSHOT & WORK GALLERY                                  */}
      {/* ================================================================= */}
      {activeTab === "gallery" && (
        <div style={{ display: "grid", gap: 20 }}>
          {galleryMessage && (
            <div
              role="status"
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: galleryMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
                color: galleryMessage.type === "success" ? "#065f46" : "#991b1b",
                border: `1px solid ${galleryMessage.type === "success" ? "#a7f3d0" : "#fecaca"}`,
              }}
            >
              {galleryMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{galleryMessage.text}</span>
            </div>
          )}

          {/* Action Header Banner */}
          <div
            className="card"
            style={{
              padding: "18px 22px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
              borderLeft: "4px solid #6C4CFF",
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
                <span>Screenshot & Mockup Showcase Management</span>
                <span style={{ fontSize: 11, background: "rgba(108,76,255,0.12)", color: "#6C4CFF", padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>
                  {galleryItems.length} items
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>
                Add responsive web mockups, mobile screenshots, and client prototypes to display on the public portfolio.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(!showAddModal)}
              className={showAddModal ? "button button-outline" : "button"}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10 }}
            >
              {showAddModal ? (
                <>
                  <ChevronUp size={16} /> Hide Add Form
                </>
              ) : (
                <>
                  <Plus size={16} /> Add Screenshot
                </>
              )}
            </button>
          </div>

          {/* =============================================================== */}
          {/* INLINE ADD SCREENSHOT FORM (RENDERED PROMINENTLY AT TOP)        */}
          {/* =============================================================== */}
          {showAddModal && (
            <div
              className="card animate-fade-in-up admin-showcase-form"
              style={{
                padding: "28px 32px",
                border: "2px solid rgba(108, 76, 255, 0.35)",
                background: "var(--paper)",
                borderRadius: 18,
                boxShadow: "0 10px 30px rgba(108, 76, 255, 0.08)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div className="eyebrow" style={{ color: "#6C4CFF", display: "flex", alignItems: "center", gap: 6 }}>
                    <Sparkles size={14} /> Studio Portfolio Showcase
                  </div>
                  <h2 style={{ fontSize: 22, letterSpacing: "-.04em", margin: "4px 0 0", color: "var(--ink)" }}>
                    Add Screenshot or Build Mockup
                  </h2>
                  <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 0" }}>
                    Fill out the fields or click a demo preset below to instantly populate sample metadata.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="button button-outline"
                  style={{ padding: "6px 14px", fontSize: 12, borderRadius: 8 }}
                >
                  ✕ Close
                </button>
              </div>

              {/* Quick Presets */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 20, padding: "12px 16px", borderRadius: 12, background: "var(--background)", border: "1px solid var(--line)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>
                  Quick Fill Demo:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      title: "Nova Studio Web Platform",
                      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
                      category: "Full-Stack Application",
                      repoName: "Nova",
                      projectUrl: "https://github.com/blank-ui/Nova",
                      description: "Enterprise multi-role studio platform with live inquiry CRM, authentication, and client dashboards.",
                    })
                  }
                  className="button button-outline"
                  style={{ padding: "4px 10px", fontSize: 11, borderRadius: 6 }}
                >
                  Full-Stack Platform
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      title: "All Sky Fares Booking Interface",
                      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
                      category: "Dashboard & Operations",
                      repoName: "Nova",
                      projectUrl: "https://allskyfares.com",
                      description: "Modern travel ticketing interface and real-time operations engine for All Sky Fares LLC.",
                    })
                  }
                  className="button button-outline"
                  style={{ padding: "4px 10px", fontSize: 11, borderRadius: 6 }}
                >
                  Operations Dashboard
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      title: "Modern Dark UI Design System",
                      imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
                      category: "UI/UX Design",
                      repoName: "Nova",
                      projectUrl: "",
                      description: "High-contrast dark-mode component architecture with fluid typography and micro-interactions.",
                    })
                  }
                  className="button button-outline"
                  style={{ padding: "4px 10px", fontSize: 11, borderRadius: 6 }}
                >
                  UI/UX Design
                </button>
              </div>

              <form onSubmit={handleAddGalleryItem} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
                <div style={{ display: "grid", gap: 14 }}>
                  <div>
                    <label htmlFor="shot-title" className="auth-label" style={{ display: "block", marginBottom: 6 }}>
                      Showcase Title *
                    </label>
                    <input
                      id="shot-title"
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Nova Studio Web Platform"
                      className="field"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div>
                    <label htmlFor="shot-img" className="auth-label" style={{ display: "block", marginBottom: 6 }}>
                      Screenshot / Mockup Image URL *
                    </label>
                    <input
                      id="shot-img"
                      type="url"
                      required
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or /assets/..."
                      className="field"
                      style={{ width: "100%" }}
                    />
                    <p style={{ fontSize: 11, color: "var(--muted)", margin: "4px 0 0" }}>
                      Direct public web URL to PNG, JPG, or WEBP image.
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label htmlFor="shot-cat" className="auth-label" style={{ display: "block", marginBottom: 6 }}>
                        Category
                      </label>
                      <select
                        id="shot-cat"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="field"
                        style={{ width: "100%" }}
                      >
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="Full-Stack Application">Full-Stack Application</option>
                        <option value="E-Commerce Experience">E-Commerce Experience</option>
                        <option value="Dashboard & Operations">Dashboard & Operations</option>
                        <option value="Mobile / Prototype">Mobile / Prototype</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="shot-repo" className="auth-label" style={{ display: "block", marginBottom: 6 }}>
                        Linked Repo (Optional)
                      </label>
                      <input
                        id="shot-repo"
                        type="text"
                        value={newRepoName}
                        onChange={(e) => setNewRepoName(e.target.value)}
                        placeholder="Nova"
                        className="field"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="shot-url" className="auth-label" style={{ display: "block", marginBottom: 6 }}>
                      Live Prototype / Demo URL (Optional)
                    </label>
                    <input
                      id="shot-url"
                      type="url"
                      value={newProjectUrl}
                      onChange={(e) => setNewProjectUrl(e.target.value)}
                      placeholder="https://..."
                      className="field"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div>
                    <label htmlFor="shot-desc" className="auth-label" style={{ display: "block", marginBottom: 6 }}>
                      Description (Optional)
                    </label>
                    <textarea
                      id="shot-desc"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Summary of client challenge, architecture, or design system..."
                      rows={3}
                      className="field"
                      style={{ resize: "vertical", width: "100%" }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                    <button type="submit" disabled={galleryBusy} className="button" style={{ padding: "10px 22px" }}>
                      {galleryBusy ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save Screenshot"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="button button-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Live Image Preview Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <label className="auth-label">Live Screenshot Preview</label>
                  <div
                    style={{
                      height: 250,
                      borderRadius: 14,
                      border: "2px dashed var(--line)",
                      background: "var(--background)",
                      overflow: "hidden",
                      display: "grid",
                      placeItems: "center",
                      position: "relative",
                    }}
                  >
                    {newImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={newImageUrl}
                        alt="Preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div style={{ textAlign: "center", color: "var(--muted)", padding: 20 }}>
                        <ImageIcon size={36} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Real-time Mockup Preview</span>
                        <p style={{ fontSize: 11, margin: "4px 0 0", color: "var(--muted)" }}>
                          Paste an image link on the left or select a Quick Fill demo above.
                        </p>
                      </div>
                    )}
                    {newCategory && (
                      <span
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: "rgba(16,19,34,0.8)",
                          color: "#fff",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {newCategory}
                      </span>
                    )}
                  </div>
                  {newTitle && (
                    <div style={{ padding: 14, borderRadius: 10, background: "var(--background)", border: "1px solid var(--line)" }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{newTitle}</div>
                      {newDescription && (
                        <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 0", lineHeight: 1.4 }}>
                          {newDescription}
                        </p>
                      )}
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
                        Category: <strong style={{ color: "var(--blue)" }}>{newCategory}</strong>
                        {newRepoName && ` · Repo: ${newRepoName}`}
                        {newProjectUrl && ` · Live Link Attached`}
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Category Filter Chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>
              Filter:
            </span>
            {[
              { label: "All Items", value: "ALL" },
              { label: "UI/UX Design", value: "UI/UX Design" },
              { label: "Full-Stack Application", value: "Full-Stack Application" },
              { label: "Dashboard & Operations", value: "Dashboard & Operations" },
              { label: "E-Commerce Experience", value: "E-Commerce Experience" },
              { label: "Mobile / Prototype", value: "Mobile / Prototype" },
            ].map((cat) => {
              const isSelected = galleryCategoryFilter === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setGalleryCategoryFilter(cat.value)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 600,
                    border: isSelected ? "1px solid #6C4CFF" : "1px solid var(--line)",
                    background: isSelected ? "rgba(108,76,255,0.12)" : "var(--paper)",
                    color: isSelected ? "#6C4CFF" : "var(--muted)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Screenshot Items Grid */}
          {galleryItems.length === 0 ? (
            <div className="card" style={{ padding: "50px 20px", textAlign: "center", color: "var(--muted)" }}>
              <ImageIcon size={36} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px", color: "var(--ink)" }}>
                No screenshots added yet
              </h3>
              <p style={{ fontSize: 13, margin: "0 0 16px" }}>
                Add your first project mockup or screenshot to showcase work on the studio portfolio.
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="button"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Plus size={14} /> Add First Screenshot
              </button>
            </div>
          ) : filteredGallery.length === 0 ? (
            <div className="card" style={{ padding: "30px 20px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              No screenshots match category &quot;{galleryCategoryFilter}&quot;.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  className="card card-hover-glow"
                  style={{
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    {/* Image Preview Container */}
                    <div
                      style={{
                        height: 200,
                        width: "100%",
                        background: "var(--line)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: "rgba(16,19,34,0.75)",
                          color: "#fff",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {item.category}
                      </span>
                    </div>

                    <div style={{ padding: 18 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px", color: "var(--ink)" }}>
                        {item.title}
                      </h3>
                      {item.description && (
                        <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 10px", lineHeight: 1.5 }}>
                          {item.description}
                        </p>
                      )}
                      {item.repoName && (
                        <div style={{ fontSize: 11, color: "var(--blue)", fontWeight: 600 }}>
                          Repo: {item.repoName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "12px 18px",
                      borderTop: "1px solid var(--line)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {item.projectUrl ? (
                      <a
                        href={item.projectUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 12, color: "var(--blue)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}
                      >
                        <span>Live Preview</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>Screenshot only</span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryItem(item.id)}
                      title="Delete screenshot item"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: 4,
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .admin-showcase-form {
            padding: 20px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
