"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GitBranch,
  Image as ImageIcon,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  Sparkles,
  Star,
  Search,
  X,
  Code,
  Layers,
} from "lucide-react";
import {
  PageHeader,
  SectionCard,
  Badge,
  EmptyState,
  ConfirmModal,
} from "@/components/admin-ui";
import { useToast } from "@/components/toast";

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
  const toast = useToast();

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
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Keyboard shortcut: Escape closes modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowAddModal(false);
        setItemToDelete(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  function selectAllRepos() {
    const allNames = availableRepos.map((r) => r.name);
    setVisibleRepos(Array.from(new Set([...visibleRepos, ...allNames])));
  }

  function deselectAllRepos() {
    setVisibleRepos([]);
  }

  function toggleRepoVisibility(repoName: string) {
    if (visibleRepos.includes(repoName)) {
      setVisibleRepos(visibleRepos.filter((r) => r !== repoName));
    } else {
      setVisibleRepos([...visibleRepos, repoName]);
    }
  }

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
        text: `Saved @${data.githubUser} showcase with ${visibleRepos.length} featured repositories.`,
      });
      toast.success("GitHub showcase preferences saved.", "Showcase Updated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error saving GitHub configuration";
      setGithubMessage({ type: "error", text: msg });
      toast.error(msg, "Save Failed");
    } finally {
      setGithubSaving(false);
    }
  }

  async function handleSyncRepos() {
    setGithubSyncing(true);
    setGithubMessage(null);

    try {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(githubUser.trim())}/repos?sort=updated&per_page=60`
      );
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
          text: `Synced ${mapped.length} public repositories from @${githubUser}.`,
        });
        toast.success(`Retrieved ${mapped.length} repositories from GitHub.`, "Sync Complete");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to sync GitHub repositories";
      setGithubMessage({ type: "error", text: msg });
      toast.error(msg, "Sync Error");
    } finally {
      setGithubSyncing(false);
    }
  }

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
      toast.success("Showcase screenshot published to gallery.", "Item Created");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add showcase item";
      setGalleryMessage({ type: "error", text: msg });
      toast.error(msg, "Creation Failed");
    } finally {
      setGalleryBusy(false);
    }
  }

  function handleDeleteGalleryItem(id: string) {
    setItemToDelete(id);
  }

  async function confirmDeleteGalleryItem() {
    if (!itemToDelete) return;
    const id = itemToDelete;
    setItemToDelete(null);

    try {
      const res = await fetch(`/api/admin/gallery?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete item");

      setGalleryItems(galleryItems.filter((item) => item.id !== id));
      toast.success("Gallery item deleted.", "Removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed", "Error");
    }
  }

  return (
    <div className="animate-fade-in-up">
      {/* Page Header with Headline Stats Strip */}
      <PageHeader
        titleLine1="GitHub &"
        titleLine2="Gallery"
        backHref="/admin"
        stats={[
          {
            icon: <GitBranch size={18} strokeWidth={1.8} />,
            value: availableRepos.length,
            badgeLabel: "Repos",
            badgeVariant: "neutral",
            caption: `Connected to @${githubUser}`,
          },
          {
            icon: <Sparkles size={18} strokeWidth={1.8} />,
            value: visibleRepos.length,
            badgeLabel: "Featured",
            badgeVariant: "warning",
            caption: "Visible on public showcase",
          },
          {
            icon: <ImageIcon size={18} strokeWidth={1.8} />,
            value: galleryItems.length,
            badgeLabel: "Mockups",
            badgeVariant: "info",
            caption: "Screenshot gallery builds",
          },
        ]}
      />

      {/* Tabs Row: GitHub vs Gallery */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            onClick={() => setActiveTab("github")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: "var(--radius-pill)",
              fontSize: 12,
              fontWeight: activeTab === "github" ? 700 : 500,
              border: activeTab === "github" ? "none" : "1px solid var(--border-hairline)",
              background: activeTab === "github" ? "var(--ink-crm)" : "var(--surface-raised)",
              color: activeTab === "github" ? "#FFFFFF" : "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            <GitBranch size={15} />
            <span>GitHub Repositories ({visibleRepos.length}/{availableRepos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gallery")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: "var(--radius-pill)",
              fontSize: 12,
              fontWeight: activeTab === "gallery" ? 700 : 500,
              border: activeTab === "gallery" ? "none" : "1px solid var(--border-hairline)",
              background: activeTab === "gallery" ? "var(--ink-crm)" : "var(--surface-raised)",
              color: activeTab === "gallery" ? "#FFFFFF" : "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            <ImageIcon size={15} />
            <span>Screenshot Gallery ({galleryItems.length})</span>
          </button>
        </div>

        {activeTab === "gallery" && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: "var(--radius-pill)",
              background: "var(--ink-crm)",
              color: "var(--ink-crm-text, #FFFFFF)",
              border: "none",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Plus size={15} />
            <span>Add Screenshot Item</span>
          </button>
        )}
      </div>

      {/* ================================================================= */}
      {/* TAB 1: GITHUB REPOSITORIES                                        */}
      {/* ================================================================= */}
      {activeTab === "github" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* GitHub Config Bar */}
          <SectionCard title="GitHub Studio Configuration">
            <form onSubmit={handleSaveGithub}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 260 }}>
                  <label htmlFor="gh-user-input" style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                    Organization / User:
                  </label>
                  <div style={{ position: "relative", flex: 1 }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontWeight: 700,
                        color: "var(--text-muted-crm)",
                        fontSize: 13,
                      }}
                    >
                      @
                    </span>
                    <input
                      id="gh-user-input"
                      type="text"
                      value={githubUser}
                      onChange={(e) => setGithubUser(e.target.value)}
                      required
                      placeholder="e.g. blank-ui"
                      style={{
                        width: "100%",
                        padding: "8px 14px 8px 28px",
                        borderRadius: "var(--radius-pill)",
                        border: "1px solid var(--border-hairline)",
                        background: "var(--surface-raised)",
                        fontSize: 12,
                        fontWeight: 600,
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={handleSyncRepos}
                    disabled={githubSyncing}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "var(--radius-pill)",
                      border: "1px solid var(--border-hairline)",
                      background: "var(--surface-raised)",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <RefreshCw size={13} className={githubSyncing ? "animate-spin" : ""} />
                    <span>{githubSyncing ? "Syncing..." : "Sync Repos"}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={githubSaving}
                    style={{
                      padding: "8px 20px",
                      borderRadius: "var(--radius-pill)",
                      border: "none",
                      background: "var(--accent-blue)",
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Check size={14} />
                    <span>{githubSaving ? "Saving..." : "Save Visibility"}</span>
                  </button>
                </div>
              </div>
            </form>
          </SectionCard>

          {/* Repo Controls & Search Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                type="button"
                onClick={selectAllRepos}
                style={{
                  fontSize: 11,
                  padding: "5px 12px",
                  borderRadius: 99,
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-raised)",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAllRepos}
                style={{
                  fontSize: 11,
                  padding: "5px 12px",
                  borderRadius: 99,
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-raised)",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Clear All
              </button>
            </div>

            <div style={{ position: "relative", minWidth: 260 }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted-crm)",
                }}
              />
              <input
                type="search"
                placeholder="Search repositories..."
                value={repoSearch}
                onChange={(e) => setRepoSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 14px 8px 32px",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-raised)",
                  fontSize: 12,
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Repos Grid (StatTile-style cards in responsive grid) */}
          {filteredRepos.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {filteredRepos.map((repo) => {
                const isSelected = visibleRepos.includes(repo.name);
                return (
                  <div
                    key={repo.name}
                    onClick={() => toggleRepoVisibility(repo.name)}
                    style={{
                      background: "var(--surface-raised)",
                      borderRadius: "var(--radius-tile)",
                      padding: "18px 20px",
                      border: isSelected ? "2px solid var(--accent-blue)" : "1px solid var(--border-hairline)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div>
                      {/* Top Row: Language tag, star count, and external link */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--text-secondary)",
                            background: "var(--card-bg-crm)",
                            padding: "3px 8px",
                            borderRadius: 6,
                          }}
                        >
                          {repo.language}
                        </span>

                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted-crm)", fontWeight: 600 }}>
                            <Star size={12} fill="#F59E0B" color="#F59E0B" /> {repo.stars}
                          </span>
                          <a
                            href={`https://github.com/${githubUser}/${repo.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Open ${repo.name} on GitHub`}
                            style={{ color: "var(--text-muted-crm)" }}
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h4 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                        {repo.name}
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          lineHeight: 1.5,
                          maxHeight: 54,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {repo.description || "Public repository from studio profile."}
                      </p>
                    </div>

                    {/* Bottom Pill Status */}
                    <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 12px",
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 700,
                          background: isSelected ? "var(--accent-blue)" : "var(--subtle-fill)",
                          color: isSelected ? "#FFFFFF" : "var(--text-secondary)",
                        }}
                      >
                        {isSelected ? <Check size={12} strokeWidth={2.5} /> : null}
                        {isSelected ? "Showcased" : "Hidden"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <SectionCard title="Repository Search">
              <EmptyState
                icon={<GitBranch size={24} />}
                title="No repositories found"
                description="Try syncing with GitHub or adjusting your search term."
              />
            </SectionCard>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: SCREENSHOT GALLERY                                         */}
      {/* ================================================================= */}
      {activeTab === "gallery" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Gallery Category Filter Pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {[
              { label: "All Items", value: "ALL" },
              { label: "UI/UX Design", value: "UI/UX Design" },
              { label: "Full-Stack App", value: "Full-Stack App" },
              { label: "Mobile App", value: "Mobile App" },
              { label: "SaaS Platform", value: "SaaS Platform" },
            ].map((tab) => {
              const isSelected = galleryCategoryFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setGalleryCategoryFilter(tab.value)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "var(--radius-pill)",
                    fontSize: 12,
                    fontWeight: isSelected ? 700 : 500,
                    border: isSelected ? "none" : "1px solid var(--border-hairline)",
                    background: isSelected ? "var(--ink-crm)" : "var(--surface-raised)",
                    color: isSelected ? "var(--ink-crm-text, #FFFFFF)" : "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Gallery Items Grid */}
          {filteredGallery.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 20,
              }}
            >
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "var(--surface-raised)",
                    borderRadius: "var(--radius-tile)",
                    overflow: "hidden",
                    border: "1px solid var(--border-hairline)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{ position: "relative", width: "100%", height: 190, background: "var(--subtle-fill)" }}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div style={{ position: "absolute", top: 12, left: 12 }}>
                      <Badge variant="brand">{item.category}</Badge>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h4 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                        {item.title}
                      </h4>
                      {item.description && (
                        <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border-hairline-light)" }}>
                      <div style={{ display: "flex", gap: 10 }}>
                        {item.projectUrl && (
                          <a
                            href={item.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              color: "var(--accent-blue)",
                              textDecoration: "none",
                            }}
                          >
                            Live Demo <ExternalLink size={11} />
                          </a>
                        )}
                        {item.repoName && (
                          <span style={{ fontSize: 11, color: "var(--text-muted-crm)", fontWeight: 600 }}>
                            {item.repoName}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteGalleryItem(item.id)}
                        aria-label={`Delete ${item.title}`}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          border: "none",
                          background: "transparent",
                          color: "#dc2626",
                          cursor: "pointer",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <SectionCard title="Screenshot Showcase Gallery">
              <EmptyState
                icon={<ImageIcon size={24} />}
                title="No screenshot mockups in gallery"
                description="Click 'Add Screenshot Item' above to upload mockup previews of your builds."
              />
            </SectionCard>
          )}
        </div>
      )}

      {/* Add Screenshot Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 1000,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface-raised)",
              borderRadius: 24,
              width: "min(480px, 100%)",
              padding: 28,
              boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
              border: "1px solid var(--border-hairline)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--accent-blue)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>
                    Add Screenshot Showcase
                  </h3>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted-crm)" }}>
                    Publish a design or web build to public gallery
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted-crm)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddGalleryItem} style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5 }}>
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-Powered CRM Dashboard"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 14,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--card-bg-crm)",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5 }}>
                  Image URL / Asset Path *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 14,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--card-bg-crm)",
                    fontSize: 13,
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5 }}>
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 14,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--card-bg-crm)",
                      fontSize: 13,
                    }}
                  >
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Full-Stack App">Full-Stack App</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="SaaS Platform">SaaS Platform</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5 }}>
                    Repository (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Nova"
                    value={newRepoName}
                    onChange={(e) => setNewRepoName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 14,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--card-bg-crm)",
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5 }}>
                  Live Demo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://app.example.com"
                  value={newProjectUrl}
                  onChange={(e) => setNewProjectUrl(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 14,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--card-bg-crm)",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5 }}>
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Key deliverables, design system tokens, or technology stack..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 14,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--card-bg-crm)",
                    fontSize: 13,
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 99,
                    border: "1px solid var(--border-hairline)",
                    background: "transparent",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={galleryBusy}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 99,
                    border: "none",
                    background: "var(--ink-crm)",
                    color: "var(--ink-crm-text, #FFFFFF)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {galleryBusy ? "Publishing..." : "Publish Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        title="Delete Showcase Item?"
        message="Permanently delete this showcase screenshot? This cannot be undone."
        confirmLabel="Delete Item"
        variant="danger"
        onConfirm={confirmDeleteGalleryItem}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
