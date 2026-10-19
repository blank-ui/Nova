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
  ArrowLeft,
  UploadCloud,
  Upload,
  Link as LinkIcon,
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

  // Image upload states & direct file support
  const [imageUploadMode, setImageUploadMode] = useState<"upload" | "url">("upload");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  async function uploadImageFile(file: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP, GIF).", "Invalid File");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size must be 10MB or less.", "File Too Large");
      return;
    }

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/gallery/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      setNewImageUrl(data.url);
      setUploadedFileName(file.name);
      toast.success("Screenshot uploaded successfully!", "Image Uploaded");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      toast.error(msg, "Upload Error");
    } finally {
      setIsUploadingImage(false);
    }
  }

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

  // Support pasting image from clipboard (e.g. Snipping tool / screenshots)
  useEffect(() => {
    if (!showAddModal) return;

    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            uploadImageFile(file);
            break;
          }
        }
      }
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [showAddModal]);

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
    if (!newImageUrl.trim()) {
      toast.error("Please upload an image file or provide an image URL.", "Image Required");
      return;
    }

    setGalleryBusy(true);
    setGalleryMessage(null);

    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          imageUrl: newImageUrl.trim(),
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
      setUploadedFileName(null);
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

  if (showAddModal) {
    return (
      <div className="animate-fade-in-up" style={{ width: "100%", maxWidth: 840, margin: "0 auto", paddingBottom: 40 }}>
        {/* Navigation Bar */}
        <div style={{ marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setShowAddModal(false)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-secondary)",
              background: "var(--card-bg-crm)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "var(--radius-pill)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <ArrowLeft size={16} /> Back to Showcase Portfolio
          </button>
        </div>

        <SectionCard
          title="Add Screenshot Showcase Item"
          headerRight={
            <Badge variant="info">Gallery Publication</Badge>
          }
        >
          <p style={{ margin: "-8px 0 20px", fontSize: 13, color: "var(--text-muted-crm)" }}>
            Publish a design, web build, or prototype screenshot to the public Nova project gallery.
          </p>

          <form onSubmit={handleAddGalleryItem} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                Project Title <span style={{ color: "var(--accent-blue)" }}>*</span>
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
                  borderRadius: 12,
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-raised)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Screenshot / Project Image Upload */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700, display: "block", color: "var(--text-secondary)" }}>
                  Screenshot / Project Image <span style={{ color: "var(--accent-blue)" }}>*</span>
                </label>
                <div style={{ display: "inline-flex", padding: 2, background: "var(--surface-raised)", borderRadius: 99, border: "1px solid var(--border-hairline)" }}>
                  <button
                    type="button"
                    onClick={() => setImageUploadMode("upload")}
                    style={{
                      padding: "4px 12px",
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 99,
                      border: "none",
                      background: imageUploadMode === "upload" ? "var(--card-bg-crm)" : "transparent",
                      color: imageUploadMode === "upload" ? "var(--text-primary)" : "var(--text-muted-crm)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      boxShadow: imageUploadMode === "upload" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <UploadCloud size={13} /> Direct Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadMode("url")}
                    style={{
                      padding: "4px 12px",
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 99,
                      border: "none",
                      background: imageUploadMode === "url" ? "var(--card-bg-crm)" : "transparent",
                      color: imageUploadMode === "url" ? "var(--text-primary)" : "var(--text-muted-crm)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      boxShadow: imageUploadMode === "url" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <LinkIcon size={13} /> Image URL
                  </button>
                </div>
              </div>

              {/* Mode 1: Direct File Upload */}
              {imageUploadMode === "upload" && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImageFile(file);
                    }}
                  />

                  {newImageUrl ? (
                    /* Image Uploaded Preview Card */
                    <div
                      style={{
                        padding: 16,
                        borderRadius: 14,
                        border: "1px solid var(--border-hairline)",
                        background: "var(--surface-raised)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: "rgba(16, 185, 129, 0.15)",
                              color: "#10B981",
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            <CheckCircle2 size={18} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                              {uploadedFileName || "Image Uploaded"}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-muted-crm)" }}>
                              Ready for gallery publication · {newImageUrl}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            style={{
                              padding: "6px 12px",
                              fontSize: 12,
                              fontWeight: 600,
                              borderRadius: "var(--radius-pill)",
                              border: "1px solid var(--border-hairline)",
                              background: "var(--card-bg-crm)",
                              color: "var(--text-primary)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Upload size={12} /> Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNewImageUrl("");
                              setUploadedFileName(null);
                            }}
                            style={{
                              padding: "6px 12px",
                              fontSize: 12,
                              fontWeight: 600,
                              borderRadius: "var(--radius-pill)",
                              border: "1px solid var(--border-hairline)",
                              background: "var(--card-bg-crm)",
                              color: "var(--accent-red, #EF4444)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <X size={12} /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Visual Preview */}
                      <div
                        style={{
                          width: "100%",
                          maxHeight: 280,
                          borderRadius: 10,
                          overflow: "hidden",
                          background: "var(--card-bg-crm)",
                          border: "1px solid var(--border-hairline)",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: 8,
                        }}
                      >
                        <img
                          src={newImageUrl}
                          alt="Showcase Preview"
                          style={{
                            maxWidth: "100%",
                            maxHeight: 260,
                            borderRadius: 6,
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Dropzone when no image yet */
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) uploadImageFile(file);
                      }}
                      onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                      style={{
                        padding: "36px 20px",
                        borderRadius: 14,
                        border: isDragOver
                          ? "2px dashed var(--accent-blue, #2F54EB)"
                          : "2px dashed var(--border-hairline)",
                        background: isDragOver
                          ? "rgba(47, 84, 235, 0.05)"
                          : "var(--surface-raised)",
                        cursor: isUploadingImage ? "wait" : "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {isUploadingImage ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                          <Loader2 size={32} className="animate-spin" color="var(--accent-blue)" />
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                            Uploading screenshot...
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted-crm)" }}>
                            Saving and validating image integrity
                          </div>
                        </div>
                      ) : (
                        <>
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              background: "rgba(47, 84, 235, 0.1)",
                              color: "var(--accent-blue, #2F54EB)",
                              display: "grid",
                              placeItems: "center",
                              marginBottom: 12,
                            }}
                          >
                            <UploadCloud size={24} />
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                            Click to upload or drag & drop screenshot
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted-crm)", marginBottom: 10 }}>
                            PNG, JPG, WEBP, or GIF (up to 10 MB)
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: "var(--text-secondary)",
                              padding: "4px 10px",
                              borderRadius: 99,
                              background: "var(--card-bg-crm)",
                              border: "1px solid var(--border-hairline)",
                            }}
                          >
                            Tip: You can also paste screenshots directly (Ctrl+V)
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2: External Image URL */}
              {imageUploadMode === "url" && (
                <div>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-... or /uploads/gallery/..."
                    value={newImageUrl}
                    onChange={(e) => {
                      setNewImageUrl(e.target.value);
                      setUploadedFileName(null);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--surface-raised)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />

                  {/* Live preview for URL */}
                  {newImageUrl && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: 10,
                        borderRadius: 10,
                        background: "var(--surface-raised)",
                        border: "1px solid var(--border-hairline)",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 60,
                          height: 44,
                          borderRadius: 6,
                          overflow: "hidden",
                          background: "var(--card-bg-crm)",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={newImageUrl}
                          alt="Preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                          URL Preview Active
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted-crm)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {newImageUrl}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNewImageUrl("");
                          setUploadedFileName(null);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-muted-crm)",
                          cursor: "pointer",
                          padding: 4,
                        }}
                        title="Clear URL"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                    cursor: "pointer",
                  }}
                >
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Full-Stack App">Full-Stack App</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="SaaS Platform">SaaS Platform</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
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
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
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
                  borderRadius: 12,
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-raised)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                Description <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted-crm)" }}>(Optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Key deliverables, design system tokens, or technology stack..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: 70,
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-raised)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Action Buttons Footer */}
            <div
              style={{
                paddingTop: 18,
                borderTop: "1px solid var(--border-hairline-light)",
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-raised)",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={galleryBusy}
                style={{
                  padding: "10px 24px",
                  borderRadius: "var(--radius-pill)",
                  border: "none",
                  background: "var(--ink-crm)",
                  color: "var(--ink-crm-text, #FFFFFF)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: galleryBusy ? "not-allowed" : "pointer",
                  opacity: galleryBusy ? 0.7 : 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.15s ease",
                }}
              >
                {galleryBusy ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  "Publish Item"
                )}
              </button>
            </div>
          </form>
        </SectionCard>
      </div>
    );
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
              color: activeTab === "github" ? "var(--ink-crm-text, #FFFFFF)" : "var(--text-secondary)",
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
              color: activeTab === "gallery" ? "var(--ink-crm-text, #FFFFFF)" : "var(--text-secondary)",
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
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
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
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
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
