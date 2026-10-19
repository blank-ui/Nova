"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  MessagesSquare,
  MessageSquare,
  Hash,
  Send,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Terminal,
  DollarSign,
  FolderKanban,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Clock,
  User,
  Plus,
  Edit3,
  Trash2,
  Zap,
  Layers,
  Shield,
  Megaphone,
  Check,
  AlertTriangle,
  Users,
  UserPlus,
  UserMinus,
  Paperclip,
  FileText,
  Download,
  Image as ImageIcon,
  ArrowLeft,
  Copy,
} from "lucide-react";
import { useToast } from "@/components/toast";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
}

export interface ProjectItem {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  paymentStatus?: string;
  client?: {
    id: string;
    name: string;
    email: string;
  } | null;
  _count?: {
    messages: number;
  };
  updatedAt?: Date | string;
}

export interface ChannelItem {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UnifiedMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  senderImage?: string | null;
  body: string;
  createdAt: string;
}

export interface AssignedMember {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string | null;
  };
}

export interface FileAttachmentMeta {
  url: string;
  name: string;
  size: number;
  type: string;
}

export interface TeamDiscussionsManagerProps {
  currentUserId: string;
  currentUserRole?: string | null;
  teamMembers: TeamMember[];
  projects?: ProjectItem[];
  channels?: ChannelItem[];
  initialProjectId?: string;
  initialRecipientId?: string;
  initialChannel?: string;
  initialMode?: "project" | "channel" | "direct";
}

const DEFAULT_CHANNELS: ChannelItem[] = [
  {
    id: "sc-gen",
    slug: "general",
    name: "general-studio",
    description: "Studio-wide announcements, syncs, and team collaboration",
    icon: "Hash",
  },
  {
    id: "sc-eng",
    slug: "engineering",
    name: "engineering-sprint",
    description: "Technical architecture, sprint tasks, code reviews, and deployments",
    icon: "Terminal",
  },
  {
    id: "sc-fin",
    slug: "finance",
    name: "finance-billing",
    description: "Commercial scopes, invoicing, milestone valuations, and client budgets",
    icon: "DollarSign",
  },
];

const AVAILABLE_ICONS: { [key: string]: React.ReactNode } = {
  Hash: <Hash size={15} />,
  Terminal: <Terminal size={15} />,
  DollarSign: <DollarSign size={15} />,
  Megaphone: <Megaphone size={15} />,
  Layers: <Layers size={15} />,
  Shield: <Shield size={15} />,
  Zap: <Zap size={15} />,
};

const PROJECT_QUICK_ACTIONS = [
  "🚀 Request sprint progress update",
  "📋 Clarify milestone requirements",
  "🗓️ Schedule a quick team sync",
  "💡 Review latest deliverables draft",
];

const CHANNEL_QUICK_ACTIONS = [
  "🚀 Studio sprint update ready for review",
  "🔍 Code review required on latest milestone",
  "💰 Commercial invoice & billing verification needed",
];

const DIRECT_QUICK_ACTIONS = [
  "👋 Quick sync when you have a moment?",
  "⚡ Blocked on milestone dependency",
  "✅ Task completed and ready for testing",
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Parses [FILE:{...}] tags from message body
function parseMessageContent(rawBody: string): {
  cleanText: string;
  attachment: FileAttachmentMeta | null;
} {
  const match = rawBody.match(/\[FILE:(\{.*?\})\]/);
  if (!match) {
    return { cleanText: rawBody, attachment: null };
  }

  try {
    const attachment: FileAttachmentMeta = JSON.parse(match[1]);
    const cleanText = rawBody.replace(match[0], "").trim();
    return { cleanText, attachment };
  } catch {
    return { cleanText: rawBody, attachment: null };
  }
}

export function TeamDiscussionsManager({
  currentUserId,
  currentUserRole = "DEVELOPER",
  teamMembers = [],
  projects: propProjects = [],
  channels: propChannels,
  initialProjectId,
  initialRecipientId,
  initialChannel = "general",
  initialMode,
}: TeamDiscussionsManagerProps) {
  const toast = useToast();
  const isClient = currentUserRole === "CLIENT";
  const isStaff = !isClient; // Admin, Developer, Finance

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Projects state
  const [projects, setProjects] = useState<ProjectItem[]>(propProjects);

  // Channels state
  const [channels, setChannels] = useState<ChannelItem[]>(() => {
    return propChannels && propChannels.length > 0 ? propChannels : DEFAULT_CHANNELS;
  });

  // Channel modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChannelMembersModal, setShowChannelMembersModal] = useState(false);
  const [channelMembers, setChannelMembers] = useState<AssignedMember[]>([]);
  const [channelFormName, setChannelFormName] = useState("");
  const [channelFormDesc, setChannelFormDesc] = useState("");
  const [channelFormIcon, setChannelFormIcon] = useState("Hash");
  const [isChannelSaving, setIsChannelSaving] = useState(false);

  // Project modals state
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showProjectMembersModal, setShowProjectMembersModal] = useState(false);
  const [projectFormName, setProjectFormName] = useState("");
  const [projectFormDesc, setProjectFormDesc] = useState("");
  const [projectFormStatus, setProjectFormStatus] = useState("IN_PROGRESS");
  const [projectMembers, setProjectMembers] = useState<AssignedMember[]>([]);
  const [projectClientOwner, setProjectClientOwner] = useState<any>(null);
  const [isProjectSaving, setIsProjectSaving] = useState(false);

  // File Attachment State
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<{
    name: string;
    size: number;
    type: string;
    previewUrl?: string;
  } | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox Preview for Images
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Mode: "project" | "channel" | "direct" (default to project folder)
  const [activeMode, setActiveMode] = useState<"project" | "channel" | "direct">(() => {
    if (initialMode) return initialMode;
    if (isClient) return "project";
    if (initialProjectId) return "project";
    if (initialRecipientId) return "direct";
    if (initialChannel) return "channel";
    return "project";
  });

  // Selected message for preview pane (null = preview pane closed/hidden by default)
  const [selectedMessageForPreview, setSelectedMessageForPreview] = useState<UnifiedMessage | null>(null);
  const [isCopiedPreviewText, setIsCopiedPreviewText] = useState(false);

  // Selected identifiers (empty by default: green area does not preview messages until thread is clicked)
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    if (initialProjectId && projects.some((p) => p.id === initialProjectId)) {
      return initialProjectId;
    }
    return "";
  });

  const [activeChannelSlug, setActiveChannelSlug] = useState<string>(() => {
    if (initialChannel) return initialChannel;
    return "";
  });

  const [activeRecipientId, setActiveRecipientId] = useState<string>(() => {
    if (initialRecipientId) return initialRecipientId;
    return "";
  });

  const [search, setSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inputText, setInputText] = useState("");
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isFirstLoadRef = useRef(true);

  // Fetch updated channels list
  const fetchChannels = useCallback(async () => {
    try {
      const res = await fetch("/api/team/channels");
      if (res.ok) {
        const data = await res.json();
        if (data.channels && Array.isArray(data.channels)) {
          setChannels(data.channels);
        }
      }
    } catch {
      // Keep existing channels if offline
    }
  }, []);

  useEffect(() => {
    if (!isClient) {
      fetchChannels();
    }
  }, [fetchChannels, isClient]);

  // Active items
  const activeProject = useMemo(() => {
    if (!activeProjectId) return null;
    return projects.find((p) => p.id === activeProjectId) || null;
  }, [projects, activeProjectId]);

  const activeRecipient = useMemo(() => {
    if (!activeRecipientId) return null;
    return teamMembers.find((m) => m.id === activeRecipientId) || null;
  }, [teamMembers, activeRecipientId]);

  const activeChannelObj = useMemo(() => {
    if (!activeChannelSlug) return null;
    return channels.find((c) => c.slug === activeChannelSlug) || null;
  }, [channels, activeChannelSlug]);

  // Track if a thread is open in the main canvas (false by default)
  const isThreadOpen = useMemo(() => {
    if (activeMode === "project") return !!activeProject;
    if (activeMode === "channel") return !!activeChannelObj;
    if (activeMode === "direct") return !!activeRecipient;
    return false;
  }, [activeMode, activeProject, activeChannelObj, activeRecipient]);

  // Closes open thread (reverts main canvas to standby)
  const handleCloseThread = useCallback(() => {
    setActiveProjectId("");
    setActiveChannelSlug("");
    setActiveRecipientId("");
    setSelectedMessageForPreview(null);
  }, []);

  // Load Channel Members
  const loadChannelMembers = useCallback(async (channelIdOrSlug: string) => {
    if (!channelIdOrSlug) return;
    try {
      const res = await fetch(`/api/team/channels/members?channelId=${encodeURIComponent(channelIdOrSlug)}`);
      if (res.ok) {
        const data = await res.json();
        setChannelMembers(data.members || []);
      }
    } catch (err) {
      console.error("Failed to load channel members:", err);
    }
  }, []);

  // Load Project Members
  const loadProjectMembers = useCallback(async (projectId: string) => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/portal/projects/${projectId}/members`);
      if (res.ok) {
        const data = await res.json();
        setProjectMembers(data.members || []);
        if (data.client) setProjectClientOwner(data.client);
      }
    } catch (err) {
      console.error("Failed to load project members:", err);
    }
  }, []);

  // Fetch members when active items change
  useEffect(() => {
    if (activeMode === "channel" && activeChannelObj) {
      loadChannelMembers(activeChannelObj.id || activeChannelObj.slug);
    } else if (activeMode === "project" && activeProjectId) {
      loadProjectMembers(activeProjectId);
    }
  }, [activeMode, activeChannelObj, activeProjectId, loadChannelMembers, loadProjectMembers]);

  // Other internal members (excluding current user)
  const otherMembers = useMemo(() => {
    return teamMembers.filter((m) => m.id !== currentUserId);
  }, [teamMembers, currentUserId]);

  // Filtered lists based on search
  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.client?.name && p.client.name.toLowerCase().includes(q)) ||
        p.status.toLowerCase().includes(q)
    );
  }, [projects, search]);

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return otherMembers;
    const q = search.toLowerCase();
    return otherMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
    );
  }, [otherMembers, search]);

  const filteredChannels = useMemo(() => {
    if (!search.trim()) return channels;
    const q = search.toLowerCase();
    return channels.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [channels, search]);

  // Fetch messages function depending on activeMode
  const fetchMessages = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setIsLoading(true);
      try {
        if (activeMode === "project") {
          if (!activeProjectId) {
            setMessages([]);
            return;
          }
          const res = await fetch(`/api/portal/projects/${activeProjectId}/messages?limit=100`);
          if (!res.ok) {
            throw new Error(`Failed to load project messages (${res.status})`);
          }
          const json = await res.json();
          const list = (json.data || []).map((m: any) => ({
            id: m.id,
            senderId: m.authorId,
            senderName: m.author?.name || "Member",
            senderRole: m.author?.role || "CLIENT",
            body: m.body,
            createdAt: m.createdAt,
          }));
          setMessages(list);
        } else if (activeMode === "channel") {
          if (!activeChannelSlug) {
            setMessages([]);
            return;
          }
          const res = await fetch(`/api/team/messages?channel=${encodeURIComponent(activeChannelSlug)}`);
          if (!res.ok) {
            throw new Error("Failed to load team messages");
          }
          const data = await res.json();
          const list = (data.messages || []).map((m: any) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.sender?.name || "Member",
            senderRole: m.sender?.role || "STAFF",
            senderImage: m.sender?.image,
            body: m.body,
            createdAt: m.createdAt,
          }));
          setMessages(list);
        } else if (activeMode === "direct") {
          if (!activeRecipientId) {
            setMessages([]);
            return;
          }
          const res = await fetch(`/api/team/messages?recipientId=${encodeURIComponent(activeRecipientId)}`);
          if (!res.ok) {
            throw new Error("Failed to load direct messages");
          }
          const data = await res.json();
          const list = (data.messages || []).map((m: any) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.sender?.name || "Member",
            senderRole: m.sender?.role || "STAFF",
            senderImage: m.sender?.image,
            body: m.body,
            createdAt: m.createdAt,
          }));
          setMessages(list);
        }
        setLastRefreshedAt(new Date());
      } catch (err: any) {
        if (!isSilent) {
          toast.error(err.message || "Could not load messages.");
        }
      } finally {
        if (!isSilent) setIsLoading(false);
      }
    },
    [activeMode, activeProjectId, activeRecipientId, activeChannelSlug, toast]
  );

  // Initial load and whenever mode or selection changes
  useEffect(() => {
    isFirstLoadRef.current = true;
    fetchMessages(false);
  }, [fetchMessages]);

  // Auto-scroll on initial load and when message count increases
  useEffect(() => {
    if (isFirstLoadRef.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      isFirstLoadRef.current = false;
    }
  }, [messages]);

  // Silent polling every 3 seconds for live message syncing
  useEffect(() => {
    let isCancelled = false;
    const interval = setInterval(() => {
      if (!isCancelled) {
        fetchMessages(true);
      }
    }, 3000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [fetchMessages]);

  // Handle File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size cannot exceed 15MB");
      return;
    }

    setAttachedFile(file);
    const isImg = file.type.startsWith("image/");
    setAttachmentPreview({
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: isImg ? URL.createObjectURL(file) : undefined,
    });
  };

  const handleRemoveAttachment = () => {
    setAttachedFile(null);
    if (attachmentPreview?.previewUrl) {
      URL.revokeObjectURL(attachmentPreview.previewUrl);
    }
    setAttachmentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Send message (with optional file upload)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if ((!text && !attachedFile) || isSending || isUploadingFile) return;

    if (text.length > 4000) {
      toast.error("Message exceeds 4,000 characters limit.");
      return;
    }

    setIsSending(true);
    let finalBody = text;

    try {
      // 1. Upload file if attached
      if (attachedFile) {
        setIsUploadingFile(true);
        const formData = new FormData();
        formData.append("file", attachedFile);

        const uploadRes = await fetch("/api/discussions/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "Failed to upload file attachment");
        }

        const fileMeta: FileAttachmentMeta = uploadData.file;
        const fileTag = `[FILE:${JSON.stringify(fileMeta)}]`;
        finalBody = finalBody ? `${finalBody}\n\n${fileTag}` : fileTag;
      }

      // 2. Dispatch message
      if (activeMode === "project") {
        if (!activeProjectId) {
          toast.error("No active project selected.");
          return;
        }
        const res = await fetch(`/api/portal/projects/${activeProjectId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: finalBody }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to send message to project thread.");
        }
        if (data.message) {
          const newMsg: UnifiedMessage = {
            id: data.message.id,
            senderId: data.message.authorId,
            senderName: data.message.author?.name || "You",
            senderRole: data.message.author?.role || currentUserRole || "MEMBER",
            body: data.message.body,
            createdAt: data.message.createdAt,
          };
          setMessages((prev) => [...prev, newMsg]);
        }
      } else {
        const payload: any = { body: finalBody };
        if (activeMode === "direct" && activeRecipientId) {
          payload.recipientId = activeRecipientId;
        } else {
          payload.channel = activeChannelSlug;
        }

        const res = await fetch("/api/team/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to dispatch message.");
        }

        if (data.message) {
          const newMsg: UnifiedMessage = {
            id: data.message.id,
            senderId: data.message.senderId,
            senderName: data.message.sender?.name || "You",
            senderRole: data.message.sender?.role || currentUserRole || "STAFF",
            senderImage: data.message.sender?.image,
            body: data.message.body,
            createdAt: data.message.createdAt,
          };
          setMessages((prev) => [...prev, newMsg]);
        }
      }

      setInputText("");
      handleRemoveAttachment();
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch message.");
    } finally {
      setIsSending(false);
      setIsUploadingFile(false);
    }
  };

  // Global Escape key listener: closes preview pane, lightbox, or active thread
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedMessageForPreview) {
          e.preventDefault();
          setSelectedMessageForPreview(null);
        } else if (lightboxUrl) {
          e.preventDefault();
          setLightboxUrl(null);
        } else if (isThreadOpen) {
          e.preventDefault();
          handleCloseThread();
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [selectedMessageForPreview, lightboxUrl, isThreadOpen, handleCloseThread]);

  const handleCopyMessageText = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setIsCopiedPreviewText(true);
    toast.success("Message text copied to clipboard");
    setTimeout(() => setIsCopiedPreviewText(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === "Escape") {
      if (selectedMessageForPreview) {
        setSelectedMessageForPreview(null);
        return;
      }
      if (inputText.trim()) {
        setInputText("");
        return;
      }
      handleCloseThread();
      if (mobileDrawerOpen) setMobileDrawerOpen(false);
      setShowCreateModal(false);
      setShowEditModal(false);
      setShowDeleteModal(false);
      setShowChannelMembersModal(false);
      setShowEditProjectModal(false);
      setShowProjectMembersModal(false);
      setLightboxUrl(null);
    }
  };

  const handleApplyQuickAction = (chipText: string) => {
    setInputText(chipText);
    textareaRef.current?.focus();
  };

  // -------------------------------------------------------------
  // CHANNEL MANAGEMENT (Create, Edit Name/Desc, Delete, Members)
  // -------------------------------------------------------------
  const handleOpenCreateChannel = () => {
    setChannelFormName("");
    setChannelFormDesc("");
    setChannelFormIcon("Hash");
    setShowCreateModal(true);
  };

  const handleCreateChannelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelFormName.trim() || isChannelSaving) return;

    setIsChannelSaving(true);
    try {
      const res = await fetch("/api/team/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: channelFormName,
          description: channelFormDesc,
          icon: channelFormIcon,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create studio channel");
      }

      toast.success(`Channel #${data.channel.name} created!`);
      setShowCreateModal(false);
      await fetchChannels();
      setActiveChannelSlug(data.channel.slug);
      setActiveMode("channel");
    } catch (err: any) {
      toast.error(err.message || "Failed to create channel");
    } finally {
      setIsChannelSaving(false);
    }
  };

  const handleOpenEditChannel = () => {
    if (!activeChannelObj) return;
    setChannelFormName(activeChannelObj.name);
    setChannelFormDesc(activeChannelObj.description || "");
    setChannelFormIcon(activeChannelObj.icon || "Hash");
    setShowEditModal(true);
  };

  const handleEditChannelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelFormName.trim() || isChannelSaving || !activeChannelObj) return;

    setIsChannelSaving(true);
    try {
      const res = await fetch("/api/team/channels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeChannelObj.id,
          name: channelFormName,
          description: channelFormDesc,
          icon: channelFormIcon,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update channel");
      }

      toast.success(`Channel name & settings updated!`);
      setShowEditModal(false);
      await fetchChannels();
      setActiveChannelSlug(data.channel.slug);
    } catch (err: any) {
      toast.error(err.message || "Failed to update channel");
    } finally {
      setIsChannelSaving(false);
    }
  };

  const handleDeleteChannel = async () => {
    if (!activeChannelObj || isChannelSaving) return;
    if (activeChannelObj.slug === "general") {
      toast.error("Default #general-studio channel cannot be deleted.");
      return;
    }

    setIsChannelSaving(true);
    try {
      const res = await fetch(`/api/team/channels?id=${encodeURIComponent(activeChannelObj.id)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete channel");
      }

      toast.success(`Channel #${activeChannelObj.name} deleted.`);
      setShowDeleteModal(false);
      await fetchChannels();
      setActiveChannelSlug("general");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete channel");
    } finally {
      setIsChannelSaving(false);
    }
  };

  // Add / Remove member in Channel
  const handleToggleChannelMember = async (targetUser: TeamMember) => {
    if (!activeChannelObj) return;
    const isAlreadyMember = channelMembers.some((m) => m.userId === targetUser.id);

    try {
      if (isAlreadyMember) {
        const res = await fetch("/api/team/channels/members", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channelId: activeChannelObj.id,
            userId: targetUser.id,
          }),
        });
        if (!res.ok) throw new Error("Failed to remove member");
        toast.info(`Removed ${targetUser.name} from #${activeChannelObj.name}`);
      } else {
        const res = await fetch("/api/team/channels/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channelId: activeChannelObj.id,
            userId: targetUser.id,
            role: "MEMBER",
          }),
        });
        if (!res.ok) throw new Error("Failed to add member");
        toast.success(`Added ${targetUser.name} to #${activeChannelObj.name}`);
      }
      await loadChannelMembers(activeChannelObj.id || activeChannelObj.slug);
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  };

  // -------------------------------------------------------------
  // PROJECT THREAD MANAGEMENT (Edit Name/Desc/Status, Add/Remove Users)
  // -------------------------------------------------------------
  const handleOpenEditProject = () => {
    if (!activeProject) return;
    setProjectFormName(activeProject.name);
    setProjectFormDesc(activeProject.description || "");
    setProjectFormStatus(activeProject.status || "IN_PROGRESS");
    setShowEditProjectModal(true);
  };

  const handleEditProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectFormName.trim() || isProjectSaving || !activeProject) return;

    setIsProjectSaving(true);
    try {
      const res = await fetch(`/api/portal/projects/${activeProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectFormName,
          description: projectFormDesc,
          status: projectFormStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update project thread");
      }

      toast.success("Project thread details updated!");
      setShowEditProjectModal(false);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id
            ? { ...p, name: projectFormName, description: projectFormDesc, status: projectFormStatus }
            : p
        )
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update project thread");
    } finally {
      setIsProjectSaving(false);
    }
  };

  // Add / Remove member in Project
  const handleToggleProjectMember = async (targetUser: TeamMember) => {
    if (!activeProject) return;
    const isAlreadyMember = projectMembers.some((m) => m.userId === targetUser.id);

    try {
      if (isAlreadyMember) {
        const res = await fetch(`/api/portal/projects/${activeProject.id}/members`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: targetUser.id }),
        });
        if (!res.ok) throw new Error("Failed to remove collaborator");
        toast.info(`Removed ${targetUser.name} from project thread`);
      } else {
        const res = await fetch(`/api/portal/projects/${activeProject.id}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: targetUser.id, role: "COLLABORATOR" }),
        });
        if (!res.ok) throw new Error("Failed to add collaborator");
        toast.success(`Assigned ${targetUser.name} to project thread`);
      }
      await loadProjectMembers(activeProject.id);
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  };

  // Helper for role styling
  const getRoleBadge = (role?: string) => {
    const r = (role || "").toUpperCase();
    if (r === "ADMIN") {
      return (
        <span
          style={{
            fontSize: 10,
            padding: "2px 7px",
            borderRadius: 6,
            fontWeight: 800,
            background: "var(--subtle-fill)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-hairline)",
            letterSpacing: "0.03em",
          }}
        >
          STUDIO LEAD
        </span>
      );
    }
    if (r === "DEVELOPER") {
      return (
        <span
          style={{
            fontSize: 10,
            padding: "2px 7px",
            borderRadius: 6,
            fontWeight: 800,
            background: "rgba(245, 158, 11, 0.12)",
            color: "#F59E0B",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            letterSpacing: "0.03em",
          }}
        >
          ENGINEER
        </span>
      );
    }
    if (r === "FINANCE") {
      return (
        <span
          style={{
            fontSize: 10,
            padding: "2px 7px",
            borderRadius: 6,
            fontWeight: 800,
            background: "rgba(59, 130, 246, 0.12)",
            color: "#3B82F6",
            border: "1px solid rgba(59, 130, 246, 0.25)",
            letterSpacing: "0.03em",
          }}
        >
          FINANCE
        </span>
      );
    }
    return (
      <span
        style={{
          fontSize: 10,
          padding: "2px 7px",
          borderRadius: 6,
          fontWeight: 800,
          background: "rgba(16, 185, 129, 0.12)",
          color: "#10B981",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          letterSpacing: "0.03em",
        }}
      >
        CLIENT
      </span>
    );
  };

  const quickActionChips = useMemo(() => {
    if (activeMode === "project") return PROJECT_QUICK_ACTIONS;
    if (activeMode === "channel") return CHANNEL_QUICK_ACTIONS;
    return DIRECT_QUICK_ACTIONS;
  }, [activeMode]);

  return (
    <div
      className="discussions-viewport-container animate-fade-in-up"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Compact Pinned Header Bar (Zero page scrolling, full fixed viewport app experience) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          paddingBottom: 12,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link
            href={
              isClient
                ? "/portal/projects"
                : currentUserRole === "ADMIN"
                ? "/admin"
                : currentUserRole === "FINANCE"
                ? "/finance"
                : "/developer"
            }
            title="Go back"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid var(--border-hairline)",
              background: "var(--surface-raised)",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={16} />
          </Link>

          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              {isClient ? "Discussions & Messages" : "Studio Discussions Command"}
            </h1>
            <span style={{ fontSize: 11, color: "var(--text-muted-crm)" }}>
              {isClient ? "Client project threads with studio engineers" : "Team collaboration & project discussions"}
            </span>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        {!isClient && (
          <div
            role="tablist"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              padding: 3,
              borderRadius: 10,
              background: "var(--surface-raised)",
              border: "1px solid var(--border-hairline)",
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "project"}
              onClick={() => {
                setActiveMode("project");
                setSelectedMessageForPreview(null);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: activeMode === "project" ? 800 : 600,
                cursor: "pointer",
                border: "none",
                background: activeMode === "project" ? "var(--brand-purple, #6C4CE0)" : "transparent",
                color: activeMode === "project" ? "#FFFFFF" : "var(--text-muted-crm)",
                boxShadow: activeMode === "project" ? "0 2px 6px rgba(108, 76, 255, 0.25)" : "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              <FolderKanban size={13} />
              <span>Projects ({projects.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "channel"}
              onClick={() => {
                setActiveMode("channel");
                setSelectedMessageForPreview(null);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: activeMode === "channel" ? 800 : 600,
                cursor: "pointer",
                border: "none",
                background: activeMode === "channel" ? "var(--brand-purple, #6C4CE0)" : "transparent",
                color: activeMode === "channel" ? "#FFFFFF" : "var(--text-muted-crm)",
                boxShadow: activeMode === "channel" ? "0 2px 6px rgba(108, 76, 255, 0.25)" : "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              <Hash size={13} />
              <span>Channels ({channels.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "direct"}
              onClick={() => {
                setActiveMode("direct");
                setSelectedMessageForPreview(null);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: activeMode === "direct" ? 800 : 600,
                cursor: "pointer",
                border: "none",
                background: activeMode === "direct" ? "var(--brand-purple, #6C4CE0)" : "transparent",
                color: activeMode === "direct" ? "#FFFFFF" : "var(--text-muted-crm)",
                boxShadow: activeMode === "direct" ? "0 2px 6px rgba(108, 76, 255, 0.25)" : "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              <User size={13} />
              <span>Direct ({otherMembers.length})</span>
            </button>
          </div>
        )}

        {/* Live Status Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 700,
              color: "#10B981",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              padding: "4px 9px",
              borderRadius: 99,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10B981",
                display: "inline-block",
              }}
            />
            <span>Live (3s Auto-Sync)</span>
          </div>
        </div>
      </div>

      {/* Main Discussions Layout Shell (Fills Remaining Viewport - Zero Page Overflow) */}
      <div
        className="discussions-app-shell"
        style={{
          display: "grid",
          gridTemplateColumns: selectedMessageForPreview
            ? "290px minmax(0, 1fr) 350px"
            : "310px minmax(0, 1fr)",
          gap: 16,
          alignItems: "stretch",
          flex: 1,
          minHeight: 0,
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Left Sidebar */}
        <aside
          className={`discussions-sidebar ${mobileDrawerOpen ? "mobile-open" : ""}`}
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border-hairline)",
            borderRadius: 18,
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            minHeight: 0,
            height: "100%",
            overflowY: "auto",
          }}
        >
          {/* Header in mobile mode with close button */}
          <div
            className="mobile-drawer-header"
            style={{
              display: "none",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 8,
              borderBottom: "1px solid var(--border-hairline)",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>
              Select Conversation
            </span>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                color: "var(--text-muted-crm)",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: "relative" }}>
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
              type="text"
              placeholder={
                activeMode === "project"
                  ? "Search projects..."
                  : activeMode === "channel"
                  ? "Search channels..."
                  : "Search team members..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 12px 7px 32px",
                borderRadius: 9,
                border: "1px solid var(--border-hairline)",
                background: "var(--card-bg-crm)",
                color: "var(--text-primary)",
                fontSize: 12,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* MODE 1: Projects List */}
          {activeMode === "project" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minHeight: 0, overflowY: "auto" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0 4px",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted-crm)",
                }}
              >
                <span>{isClient ? "My Projects" : "Client Projects"}</span>
                <span>({filteredProjects.length})</span>
              </div>

              {filteredProjects.map((p) => {
                const isSelected = activeProjectId === p.id;
                const statusColor =
                  p.status === "COMPLETED"
                    ? "#10B981"
                    : p.status === "IN_PROGRESS"
                    ? "#3B82F6"
                    : p.status === "REVIEW"
                    ? "#F59E0B"
                    : "#6B7280";

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setActiveProjectId(p.id);
                      setSelectedMessageForPreview(null);
                      setMobileDrawerOpen(false);
                    }}
                    style={{
                      padding: "9px 11px",
                      borderRadius: 11,
                      border: isSelected
                        ? "1.5px solid var(--border-hairline-light)"
                        : "1px solid transparent",
                      background: isSelected ? "var(--card-bg-crm)" : "transparent",
                      boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 9,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 7,
                        background: isSelected ? "var(--brand-purple, #6C4CE0)" : "var(--subtle-fill)",
                        color: isSelected ? "#FFFFFF" : "var(--text-muted-crm)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <FolderKanban size={15} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: isSelected ? 800 : 600,
                            color: "var(--text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.name}
                        </span>
                        <span
                          style={{
                            fontSize: 8,
                            fontWeight: 800,
                            padding: "1px 5px",
                            borderRadius: 4,
                            background: `${statusColor}18`,
                            color: statusColor,
                            border: `1px solid ${statusColor}33`,
                            textTransform: "uppercase",
                            flexShrink: 0,
                          }}
                        >
                          {p.status.replace("_", " ")}
                        </span>
                      </div>

                      {p.client && (
                        <div style={{ fontSize: 10, color: "var(--text-muted-crm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          Client: {p.client.name}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* MODE 2: Channels List */}
          {activeMode === "channel" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minHeight: 0, overflowY: "auto" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0 4px",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted-crm)",
                }}
              >
                <span>Channels ({filteredChannels.length})</span>
                {isStaff && (
                  <button
                    type="button"
                    onClick={handleOpenCreateChannel}
                    title="Add new studio channel"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 5,
                      background: "var(--subtle-fill)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-hairline)",
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={11} />
                    <span>New</span>
                  </button>
                )}
              </div>

              {filteredChannels.map((ch) => {
                const isSelected = activeChannelSlug === ch.slug;
                const iconComponent =
                  ch.icon && AVAILABLE_ICONS[ch.icon] ? AVAILABLE_ICONS[ch.icon] : <Hash size={14} />;

                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setActiveChannelSlug(ch.slug);
                      setSelectedMessageForPreview(null);
                      setMobileDrawerOpen(false);
                    }}
                    style={{
                      padding: "9px 11px",
                      borderRadius: 11,
                      border: isSelected
                        ? "1.5px solid var(--border-hairline-light)"
                        : "1px solid transparent",
                      background: isSelected ? "var(--card-bg-crm)" : "transparent",
                      boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 7,
                        background: isSelected ? "var(--brand-purple, #6C4CE0)" : "var(--subtle-fill)",
                        color: isSelected ? "#FFFFFF" : "var(--text-muted-crm)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {iconComponent}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: isSelected ? 800 : 600, color: "var(--text-primary)" }}>
                        #{ch.name}
                      </div>
                      {ch.description && (
                        <div style={{ fontSize: 10, color: "var(--text-muted-crm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {ch.description}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* MODE 3: Direct Messages List */}
          {activeMode === "direct" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minHeight: 0, overflowY: "auto" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0 4px",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted-crm)",
                }}
              >
                <span>Direct ({filteredMembers.length})</span>
              </div>

              {filteredMembers.map((member) => {
                const isSelected = activeRecipientId === member.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setActiveRecipientId(member.id);
                      setSelectedMessageForPreview(null);
                      setMobileDrawerOpen(false);
                    }}
                    style={{
                      padding: "9px 11px",
                      borderRadius: 11,
                      border: isSelected
                        ? "1.5px solid var(--border-hairline-light)"
                        : "1px solid transparent",
                      background: isSelected ? "var(--card-bg-crm)" : "transparent",
                      boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: isSelected ? "var(--brand-purple, #6C4CE0)" : "var(--subtle-fill)",
                        color: isSelected ? "#FFFFFF" : "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: isSelected ? 800 : 600,
                            color: "var(--text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {member.name}
                        </span>
                        {getRoleBadge(member.role)}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted-crm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {member.email}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Right Chat Canvas: FIXED DISPLAY, ONLY MESSAGES SCROLL */}
        <main
          style={{
            background: "var(--card-bg-crm)",
            border: "1px solid var(--border-hairline)",
            borderRadius: 18,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            height: "100%",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          {!isThreadOpen ? (
            /* Standby State: No thread previewed by default until clicked from left panel */
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 24px",
                textAlign: "center",
                color: "var(--text-primary)",
              }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border-hairline)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18,
                  color: "var(--brand-purple, #6C4CE0)",
                  boxShadow: "0 4px 20px rgba(108, 76, 255, 0.15)",
                }}
              >
                {activeMode === "project" ? (
                  <FolderKanban size={32} />
                ) : activeMode === "channel" ? (
                  <Hash size={32} />
                ) : (
                  <User size={32} />
                )}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px", color: "var(--text-primary)" }}>
                {activeMode === "project"
                  ? "Select a Project Thread"
                  : activeMode === "channel"
                  ? "Select a Studio Channel"
                  : "Select a Team Member"}
              </h3>

              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "var(--text-muted-crm)",
                  maxWidth: 460,
                  margin: "0 0 20px",
                }}
              >
                {activeMode === "project"
                  ? "Click any project from the left panel to open its discussion thread, review deliverables, and communicate with your team."
                  : activeMode === "channel"
                  ? "Click any channel from the left panel to join discussions, post announcements, and view team syncs."
                  : "Click any team member from the left panel to start a direct message conversation."}
              </p>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  borderRadius: 99,
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border-hairline)",
                  fontSize: 11,
                  color: "var(--text-muted-crm)",
                }}
              >
                <span>Click a thread on the left to open</span>
                <span>&middot;</span>
                <span>
                  Press <kbd style={{ padding: "1px 5px", borderRadius: 4, background: "var(--subtle-fill)", border: "1px solid var(--border-hairline)", fontWeight: 800, fontSize: 10 }}>ESC</kbd> to close
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Canvas Header (Pinned flex-shrink: 0) */}
              <div
                style={{
                  padding: "12px 18px",
                  borderBottom: "1px solid var(--border-hairline)",
                  background: "var(--surface-raised)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0,
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: activeMode === "direct" ? "50%" : 9,
                      background: "var(--brand-purple, #6C4CE0)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {activeMode === "project" ? (
                      <FolderKanban size={16} />
                    ) : activeMode === "direct" && activeRecipient ? (
                      activeRecipient.name.charAt(0).toUpperCase()
                    ) : activeChannelObj && activeChannelObj.icon && AVAILABLE_ICONS[activeChannelObj.icon] ? (
                      AVAILABLE_ICONS[activeChannelObj.icon]
                    ) : (
                      <Hash size={16} />
                    )}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <h2
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          margin: 0,
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {activeMode === "project" && activeProject
                          ? activeProject.name
                          : activeMode === "direct" && activeRecipient
                          ? activeRecipient.name
                          : activeChannelObj
                          ? `#${activeChannelObj.name}`
                          : ""}
                      </h2>

                      {activeMode === "project" && activeProject && (
                        <span
                          style={{
                            fontSize: 9,
                            padding: "1px 6px",
                        borderRadius: 5,
                        fontWeight: 800,
                        background: "var(--subtle-fill)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-hairline)",
                        textTransform: "uppercase",
                      }}
                    >
                      {activeProject.status.replace("_", " ")}
                    </span>
                  )}

                  {activeMode === "direct" && activeRecipient && getRoleBadge(activeRecipient.role)}
                </div>

                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted-crm)",
                    margin: "1px 0 0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {activeMode === "project" && activeProject
                    ? `Project discussion & deliverables ${
                        activeProject.client ? `with ${activeProject.client.name}` : ""
                      }`
                    : activeMode === "direct" && activeRecipient
                    ? `Direct 1-on-1 discussion with ${activeRecipient.email}`
                    : activeChannelObj?.description || "Studio channel discussion thread"}
                </p>
              </div>
            </div>

            {/* Action buttons & live sync indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0, flexWrap: "wrap" }}>
              {/* PROJECT THREAD CONTROLS */}
              {activeMode === "project" && activeProject && isStaff && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    type="button"
                    onClick={handleOpenEditProject}
                    title="Edit project thread name & details"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border-hairline)",
                      padding: "5px 9px",
                      borderRadius: 7,
                      cursor: "pointer",
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Edit Thread</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowProjectMembersModal(true)}
                    title="Add or remove users from project discussion"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border-hairline)",
                      padding: "5px 9px",
                      borderRadius: 7,
                      cursor: "pointer",
                    }}
                  >
                    <Users size={12} />
                    <span>Members ({projectMembers.length + (projectClientOwner ? 1 : 0)})</span>
                  </button>
                </div>
              )}

              {/* STUDIO CHANNEL CONTROLS */}
              {activeMode === "channel" && activeChannelObj && isStaff && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    type="button"
                    onClick={handleOpenEditChannel}
                    title="Edit channel name, description, or icon"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border-hairline)",
                      padding: "5px 9px",
                      borderRadius: 7,
                      cursor: "pointer",
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Edit Name</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowChannelMembersModal(true)}
                    title="Add or remove users from this channel"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border-hairline)",
                      padding: "5px 9px",
                      borderRadius: 7,
                      cursor: "pointer",
                    }}
                  >
                    <Users size={12} />
                    <span>Members ({channelMembers.length})</span>
                  </button>

                  {activeChannelObj?.slug !== "general" && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      title="Delete channel"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#EF4444",
                        background: "rgba(239, 68, 68, 0.08)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        padding: "5px 9px",
                        borderRadius: 7,
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}

              {activeMode === "project" && activeProject && (
                <Link
                  href={
                    currentUserRole === "ADMIN"
                      ? `/admin/projects/${activeProject.id}`
                      : `/portal/projects/${activeProject.id}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border-hairline)",
                    padding: "5px 9px",
                    borderRadius: 7,
                    textDecoration: "none",
                  }}
                >
                  <span>Project Hub</span>
                  <ExternalLink size={11} />
                </Link>
              )}

              <button
                type="button"
                onClick={() => fetchMessages(false)}
                title="Refresh messages now"
                style={{
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border-hairline)",
                  cursor: "pointer",
                  padding: "6px 8px",
                  borderRadius: 7,
                  color: "var(--text-muted-crm)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
              </button>

              <button
                type="button"
                onClick={handleCloseThread}
                title="Close discussion thread (Esc)"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted-crm)",
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border-hairline)",
                  padding: "5px 9px",
                  borderRadius: 7,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <X size={12} />
                <span>Close (Esc)</span>
              </button>
            </div>
          </div>

          {/* Messages Scroll Area: ONLY THIS BOX SCROLLS! */}
          <div
            className="discussions-messages-scroll-area"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {isLoading && messages.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  gap: 8,
                  color: "var(--text-muted-crm)",
                  fontSize: 13,
                }}
              >
                <Loader2 size={18} className="animate-spin" />
                <span>Synchronizing messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div
                style={{
                  margin: "auto",
                  textAlign: "center",
                  maxWidth: 460,
                  padding: "28px 16px",
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    background: "var(--subtle-fill)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                    color: "var(--text-primary)",
                  }}
                >
                  <MessageSquare size={24} />
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 5px", color: "var(--text-primary)" }}>
                  Start the conversation
                </h4>
                <p style={{ fontSize: 12, lineHeight: 1.5, margin: "0 0 16px", color: "var(--text-muted-crm)" }}>
                  {activeMode === "project"
                    ? "Post project updates, share deliverables, or attach images and PDF documents."
                    : activeMode === "direct" && activeRecipient
                    ? `Send a message to ${activeRecipient.name}. Messages synchronize instantly across both accounts.`
                    : `Be the first to share an update in #${activeChannelObj?.name || "channel"}.`}
                </p>

                {/* Quick starter chips */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 7 }}>
                  {quickActionChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyQuickAction(chip)}
                      style={{
                        background: "var(--surface-raised)",
                        border: "1px solid var(--border-hairline)",
                        borderRadius: 99,
                        padding: "5px 12px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                const formattedTime = isMounted
                  ? new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";
                const formattedDate = isMounted
                  ? new Date(msg.createdAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })
                  : "";

                const { cleanText, attachment } = parseMessageContent(msg.body);
                const isImage = attachment && attachment.type.startsWith("image/");
                const isPdf = attachment && attachment.type === "application/pdf";

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMe ? "flex-end" : "flex-start",
                      gap: 4,
                    }}
                  >
                    {!isMe && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 11,
                          color: "var(--text-muted-crm)",
                          marginLeft: 4,
                        }}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: "var(--subtle-fill)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: 800,
                            color: "var(--text-primary)",
                          }}
                        >
                          {msg.senderName.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                          {msg.senderName}
                        </span>
                        {getRoleBadge(msg.senderRole)}
                        {formattedTime && (
                          <>
                            <span>&middot;</span>
                            <span>
                              {formattedDate} {formattedTime}
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    <div
                      className="message-bubble-selectable"
                      onClick={() =>
                        setSelectedMessageForPreview((prev) =>
                          prev?.id === msg.id ? null : msg
                        )
                      }
                      title="Click to view message preview (Esc to close)"
                      style={{
                        maxWidth: "min(680px, 82%)",
                        padding: "10px 14px",
                        borderRadius: 15,
                        borderBottomRightRadius: isMe ? 3 : 15,
                        borderBottomLeftRadius: isMe ? 15 : 3,
                        background: isMe ? "var(--brand-purple, #6C4CE0)" : "var(--surface-raised)",
                        color: isMe ? "#FFFFFF" : "var(--text-primary)",
                        border: isMe ? "none" : "1px solid var(--border-hairline)",
                        fontSize: 13,
                        lineHeight: 1.5,
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                        cursor: "pointer",
                        outline:
                          selectedMessageForPreview?.id === msg.id
                            ? "2px solid var(--brand-purple, #6C4CE0)"
                            : "none",
                        outlineOffset: 2,
                        boxShadow:
                          selectedMessageForPreview?.id === msg.id
                            ? "0 0 0 4px rgba(108, 76, 255, 0.25), 0 4px 14px rgba(0,0,0,0.12)"
                            : isMe
                            ? "0 3px 12px rgba(108, 76, 255, 0.28)"
                            : "0 2px 6px rgba(0,0,0,0.06)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {/* Attached File Card Rendering */}
                      {attachment && (
                        <div style={{ marginBottom: cleanText ? 10 : 0 }}>
                          {isImage ? (
                            <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", maxWidth: 360 }}>
                              <img
                                src={attachment.url}
                                alt={attachment.name}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightboxUrl(attachment.url);
                                }}
                                style={{
                                  width: "100%",
                                  maxHeight: 280,
                                  objectFit: "cover",
                                  borderRadius: 10,
                                  cursor: "zoom-in",
                                  display: "block",
                                  background: "rgba(0,0,0,0.1)",
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 6,
                                  right: 6,
                                  background: "rgba(0,0,0,0.65)",
                                  color: "#FFFFFF",
                                  fontSize: 10,
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                }}
                              >
                                {formatFileSize(attachment.size)}
                              </div>
                            </div>
                          ) : (
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={attachment.name}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "8px 12px",
                                borderRadius: 10,
                                background: isMe ? "rgba(255,255,255,0.15)" : "var(--card-bg-crm)",
                                border: isMe ? "1px solid rgba(255,255,255,0.25)" : "1px solid var(--border-hairline)",
                                color: isMe ? "#FFFFFF" : "var(--text-primary)",
                                textDecoration: "none",
                                maxWidth: 360,
                              }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 6,
                                  background: "#EF4444",
                                  color: "#FFFFFF",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 900,
                                  fontSize: 11,
                                  flexShrink: 0,
                                }}
                              >
                                PDF
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {attachment.name}
                                </div>
                                <div style={{ fontSize: 10, opacity: 0.8 }}>
                                  {formatFileSize(attachment.size)} &middot; Click to download
                                </div>
                              </div>
                              <Download size={15} style={{ flexShrink: 0, opacity: 0.9 }} />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Clean Message Text */}
                      {cleanText && <div>{cleanText}</div>}
                    </div>

                    {isMe && formattedTime && (
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted-crm)",
                          marginRight: 4,
                        }}
                      >
                        {formattedTime}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Bar (when messages exist) */}
          {messages.length > 0 && !inputText && (
            <div
              style={{
                padding: "6px 18px",
                background: "var(--surface-raised)",
                borderTop: "1px solid var(--border-hairline)",
                display: "flex",
                alignItems: "center",
                gap: 7,
                overflowX: "auto",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted-crm)", flexShrink: 0 }}>
                Quick:
              </span>
              {quickActionChips.slice(0, 3).map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyQuickAction(chip)}
                  style={{
                    background: "var(--card-bg-crm)",
                    border: "1px solid var(--border-hairline)",
                    borderRadius: 99,
                    padding: "3px 9px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Pinned Message Composer Card (Pinned flex-shrink: 0) */}
          <div
            style={{
              padding: "10px 16px",
              borderTop: "1px solid var(--border-hairline)",
              background: "var(--surface-raised)",
              flexShrink: 0,
            }}
          >
            <form
              onSubmit={handleSendMessage}
              style={{
                background: "var(--card-bg-crm)",
                border: "1px solid var(--border-hairline)",
                borderRadius: 13,
                padding: "9px 13px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              }}
            >
              {/* Attachment Preview Badge (if file selected) */}
              {attachmentPreview && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border-hairline)",
                    fontSize: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    {attachmentPreview.type.startsWith("image/") ? (
                      <ImageIcon size={16} style={{ color: "var(--brand-purple, #6C4CE0)", flexShrink: 0 }} />
                    ) : (
                      <FileText size={16} style={{ color: "#EF4444", flexShrink: 0 }} />
                    )}
                    <span style={{ fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {attachmentPreview.name}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-muted-crm)" }}>
                      ({formatFileSize(attachmentPreview.size)})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    title="Remove attachment"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted-crm)",
                      padding: 2,
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeMode === "project" && activeProject
                    ? `Message ${activeProject.name} thread or attach files...`
                    : activeMode === "direct" && activeRecipient
                    ? `Message ${activeRecipient.name} directly...`
                    : `Message #${activeChannelObj?.name || "channel"}...`
                }
                rows={2}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  outline: "none",
                  resize: "none",
                  fontFamily: "inherit",
                  lineHeight: 1.4,
                  boxSizing: "border-box",
                }}
              />

              {/* Composer Toolbar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                  paddingTop: 5,
                  borderTop: "1px solid var(--border-hairline-light)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* File Attachment Input & Button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,application/pdf"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach Image or PDF document"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: 6,
                      background: attachedFile ? "var(--brand-purple, #6C4CE0)" : "var(--surface-raised)",
                      color: attachedFile ? "#FFFFFF" : "var(--text-primary)",
                      border: "1px solid var(--border-hairline)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Paperclip size={13} />
                    <span>{attachedFile ? "Attached" : "Attach File"}</span>
                  </button>

                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--text-muted-crm)" }}>
                    <span style={{ padding: "1px 4px", borderRadius: 4, background: "var(--subtle-fill)", fontWeight: 700 }}>
                      ↵ Enter
                    </span>
                    <span>to send</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color: "var(--text-muted-crm)" }}>
                    {4000 - inputText.length} left
                  </span>

                  <button
                    type="submit"
                    disabled={isSending || isUploadingFile || (!inputText.trim() && !attachedFile)}
                    style={{
                      padding: "7px 15px",
                      borderRadius: 8,
                      background:
                        isSending || isUploadingFile || (!inputText.trim() && !attachedFile)
                          ? "var(--subtle-fill)"
                          : "var(--brand-purple, #6C4CE0)",
                      color:
                        isSending || isUploadingFile || (!inputText.trim() && !attachedFile)
                          ? "var(--text-muted-crm)"
                          : "#FFFFFF",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor:
                        isSending || isUploadingFile || (!inputText.trim() && !attachedFile)
                          ? "not-allowed"
                          : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      border: "none",
                      boxShadow:
                        isSending || (!inputText.trim() && !attachedFile)
                          ? "none"
                          : "0 2px 6px rgba(108, 76, 255, 0.3)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {isSending || isUploadingFile ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Send size={13} />
                    )}
                    <span>{isUploadingFile ? "Uploading..." : isSending ? "Sending..." : "Send"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}
    </main>

        {/* RIGHT PREVIEW PANE: Only rendered when a message is selected; closes on ESC */}
        {selectedMessageForPreview && (() => {
          const previewParsed = parseMessageContent(selectedMessageForPreview.body);
          const att = previewParsed.attachment;
          const isSenderMe = selectedMessageForPreview.senderId === currentUserId;

          return (
            <aside
              className="discussions-preview-pane"
              style={{
                background: "var(--card-bg-crm)",
                border: "1px solid var(--border-hairline)",
                borderRadius: 18,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                height: "100%",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
            >
              {/* Preview Header */}
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border-hairline)",
                  background: "var(--surface-raised)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "var(--brand-purple, #6C4CE0)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles size={14} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <h3
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          margin: 0,
                          color: "var(--text-primary)",
                        }}
                      >
                        Message Preview
                      </h3>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          padding: "1px 5px",
                          borderRadius: 4,
                          background: "var(--subtle-fill)",
                          color: "var(--text-muted-crm)",
                          border: "1px solid var(--border-hairline)",
                        }}
                      >
                        ESC to close
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMessageForPreview(null)}
                  title="Close preview pane (Esc)"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    color: "var(--text-muted-crm)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    flexShrink: 0,
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Preview Scrollable Content */}
              <div
                style={{
                  padding: 16,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  flex: 1,
                  minHeight: 0,
                }}
              >
                {/* Sender Card */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border-hairline)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "var(--brand-purple, #6C4CE0)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {selectedMessageForPreview.senderName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>
                        {selectedMessageForPreview.senderName}
                      </span>
                      {getRoleBadge(selectedMessageForPreview.senderRole)}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted-crm)", marginTop: 2 }}>
                      {isSenderMe ? "You (Active Session)" : "Thread Participant"}
                    </div>
                  </div>
                </div>

                {/* Metadata Details (Context & Timestamp) */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      padding: "9px 11px",
                      borderRadius: 10,
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border-hairline)",
                    }}
                  >
                    <div style={{ fontSize: 9, fontWeight: 800, color: "var(--text-muted-crm)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Context
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {activeMode === "project" && activeProject
                        ? activeProject.name
                        : activeMode === "channel" && activeChannelObj
                        ? `#${activeChannelObj.name}`
                        : "Direct Message"}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "9px 11px",
                      borderRadius: 10,
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border-hairline)",
                    }}
                  >
                    <div style={{ fontSize: 9, fontWeight: 800, color: "var(--text-muted-crm)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Sent At
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>
                      {new Date(selectedMessageForPreview.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                {/* Message Body Preview */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted-crm)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Message Content
                    </span>
                    {previewParsed.cleanText && (
                      <button
                        type="button"
                        onClick={() => handleCopyMessageText(previewParsed.cleanText)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 11,
                          color: "var(--brand-purple, #6C4CE0)",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "2px 4px",
                        }}
                      >
                        {isCopiedPreviewText ? <Check size={12} /> : <Copy size={12} />}
                        <span>{isCopiedPreviewText ? "Copied" : "Copy"}</span>
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border-hairline)",
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "var(--text-primary)",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      maxHeight: 220,
                      overflowY: "auto",
                    }}
                  >
                    {previewParsed.cleanText || (
                      <span style={{ color: "var(--text-muted-crm)", fontStyle: "italic", fontSize: 12 }}>
                        Attachment only (no text body)
                      </span>
                    )}
                  </div>
                </div>

                {/* Attached File Preview (if present) */}
                {att && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted-crm)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Attachment Preview
                    </span>

                    {att.type.startsWith("image/") ? (
                      <div
                        style={{
                          padding: 10,
                          borderRadius: 12,
                          background: "var(--surface-raised)",
                          border: "1px solid var(--border-hairline)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            borderRadius: 8,
                            overflow: "hidden",
                            background: "rgba(0,0,0,0.06)",
                            maxHeight: 200,
                          }}
                        >
                          <img
                            src={att.url}
                            alt={att.name}
                            onClick={() => setLightboxUrl(att.url)}
                            style={{
                              width: "100%",
                              maxHeight: 200,
                              objectFit: "contain",
                              cursor: "zoom-in",
                              display: "block",
                            }}
                          />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {att.name}
                            </div>
                            <div style={{ fontSize: 10, color: "var(--text-muted-crm)" }}>
                              {formatFileSize(att.size)}
                            </div>
                          </div>

                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={att.name}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "4px 9px",
                              borderRadius: 6,
                              background: "var(--brand-purple, #6C4CE0)",
                              color: "#FFFFFF",
                              fontSize: 11,
                              fontWeight: 700,
                              textDecoration: "none",
                              flexShrink: 0,
                            }}
                          >
                            <Download size={12} />
                            Download
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          background: "var(--surface-raised)",
                          border: "1px solid var(--border-hairline)",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            background: "#EF4444",
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 900,
                            fontSize: 11,
                            flexShrink: 0,
                          }}
                        >
                          PDF
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {att.name}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--text-muted-crm)" }}>
                            {formatFileSize(att.size)}
                          </div>
                        </div>
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={att.name}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "6px 10px",
                            borderRadius: 6,
                            background: "var(--brand-purple, #6C4CE0)",
                            color: "#FFFFFF",
                            fontSize: 11,
                            fontWeight: 700,
                            textDecoration: "none",
                            flexShrink: 0,
                          }}
                        >
                          <Download size={13} />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Action: Quote in Composer */}
                <div style={{ marginTop: "auto", paddingTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      const quoteHeader = `> [${selectedMessageForPreview.senderName}]: ${
                        previewParsed.cleanText
                          ? previewParsed.cleanText.slice(0, 80)
                          : previewParsed.attachment?.name || "Attachment"
                      }\n\n`;
                      setInputText((prev) => quoteHeader + prev);
                      textareaRef.current?.focus();
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 9,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--surface-raised)",
                      color: "var(--text-primary)",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <MessageSquare size={13} />
                    Quote in Composer
                  </button>
                </div>
              </div>
            </aside>
          );
        })()}
      </div>

      {/* LIGHTBOX MODAL FOR IMAGES */}
      {lightboxUrl && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxUrl(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.88)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: 24,
            cursor: "zoom-out",
          }}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <img
              src={lightboxUrl}
              alt="Enlarged view"
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                borderRadius: 12,
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              }}
            />
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              style={{
                position: "absolute",
                top: -36,
                right: 0,
                background: "none",
                border: "none",
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <X size={18} />
              <span>Close</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: Create Channel Modal */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            className="animate-fade-in-up"
            style={{
              background: "var(--card-bg-crm)",
              border: "1px solid var(--border-hairline)",
              borderRadius: 18,
              padding: 24,
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                <Plus size={18} />
                <span>Create Studio Channel</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted-crm)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateChannelSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                  Channel Name *
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted-crm)", fontWeight: 700 }}>
                    #
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. client-feedback or design-sync"
                    value={channelFormName}
                    onChange={(e) => setChannelFormName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px 9px 28px",
                      borderRadius: 10,
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
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                  Description
                </label>
                <textarea
                  placeholder="Purpose of this channel..."
                  value={channelFormDesc}
                  onChange={(e) => setChannelFormDesc(e.target.value)}
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                    resize: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                  Channel Icon
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {Object.keys(AVAILABLE_ICONS).map((iconKey) => {
                    const isSelected = channelFormIcon === iconKey;
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setChannelFormIcon(iconKey)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          border: isSelected ? "1.5px solid var(--border-hairline-light)" : "1px solid var(--border-hairline)",
                          background: isSelected ? "var(--brand-purple, #6C4CE0)" : "var(--surface-raised)",
                          color: isSelected ? "#FFFFFF" : "var(--text-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        {AVAILABLE_ICONS[iconKey]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8, paddingTop: 12, borderTop: "1px solid var(--border-hairline)" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChannelSaving || !channelFormName.trim()}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 10,
                    border: "none",
                    background: "var(--brand-purple, #6C4CE0)",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: isChannelSaving ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {isChannelSaving && <Loader2 size={14} className="animate-spin" />}
                  <span>Create Channel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Channel Name/Desc Modal */}
      {showEditModal && activeChannelObj && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            className="animate-fade-in-up"
            style={{
              background: "var(--card-bg-crm)",
              border: "1px solid var(--border-hairline)",
              borderRadius: 18,
              padding: 24,
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                <Edit3 size={18} />
                <span>Edit Channel #{activeChannelObj.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted-crm)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditChannelSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                  Channel Name *
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted-crm)", fontWeight: 700 }}>
                    #
                  </span>
                  <input
                    type="text"
                    required
                    value={channelFormName}
                    onChange={(e) => setChannelFormName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px 9px 28px",
                      borderRadius: 10,
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
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                  Description
                </label>
                <textarea
                  value={channelFormDesc}
                  onChange={(e) => setChannelFormDesc(e.target.value)}
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                    resize: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                  Channel Icon
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {Object.keys(AVAILABLE_ICONS).map((iconKey) => {
                    const isSelected = channelFormIcon === iconKey;
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setChannelFormIcon(iconKey)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          border: isSelected ? "1.5px solid var(--border-hairline-light)" : "1px solid var(--border-hairline)",
                          background: isSelected ? "var(--brand-purple, #6C4CE0)" : "var(--surface-raised)",
                          color: isSelected ? "#FFFFFF" : "var(--text-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        {AVAILABLE_ICONS[iconKey]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8, paddingTop: 12, borderTop: "1px solid var(--border-hairline)" }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChannelSaving || !channelFormName.trim()}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 10,
                    border: "none",
                    background: "var(--brand-purple, #6C4CE0)",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: isChannelSaving ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {isChannelSaving && <Loader2 size={14} className="animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Manage Channel Members Modal */}
      {showChannelMembersModal && activeChannelObj && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            className="animate-fade-in-up"
            style={{
              background: "var(--card-bg-crm)",
              border: "1px solid var(--border-hairline)",
              borderRadius: 18,
              padding: 24,
              width: "100%",
              maxWidth: 500,
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Users size={18} />
                  <span>Channel Members &middot; #{activeChannelObj.name}</span>
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted-crm)" }}>
                  Assign team members to collaborate in this channel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowChannelMembersModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted-crm)" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Member search filter */}
            <div style={{ position: "relative", marginBottom: 14 }}>
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
                type="text"
                placeholder="Filter studio team members..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 32px",
                  borderRadius: 10,
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-raised)",
                  color: "var(--text-primary)",
                  fontSize: 12,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Team members list */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }}>
              {teamMembers
                .filter(
                  (m) =>
                    !memberSearch.trim() ||
                    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                    m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
                    m.role.toLowerCase().includes(memberSearch.toLowerCase())
                )
                .map((member) => {
                  const isMember = channelMembers.some((cm) => cm.userId === member.id);
                  return (
                    <div
                      key={member.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        borderRadius: 12,
                        background: "var(--surface-raised)",
                        border: "1px solid var(--border-hairline)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "var(--subtle-fill)",
                            color: "var(--text-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {member.name}
                            </span>
                            {getRoleBadge(member.role)}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted-crm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {member.email}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleChannelMember(member)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          border: isMember ? "1px solid rgba(239, 68, 68, 0.3)" : "none",
                          background: isMember ? "rgba(239, 68, 68, 0.1)" : "var(--brand-purple, #6C4CE0)",
                          color: isMember ? "#EF4444" : "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          flexShrink: 0,
                          transition: "all 0.15s ease",
                        }}
                      >
                        {isMember ? (
                          <>
                            <UserMinus size={13} />
                            <span>Remove</span>
                          </>
                        ) : (
                          <>
                            <UserPlus size={13} />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--border-hairline)" }}>
              <button
                type="button"
                onClick={() => setShowChannelMembersModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "var(--brand-purple, #6C4CE0)",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Channel Confirmation */}
      {showDeleteModal && activeChannelObj && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            className="animate-fade-in-up"
            style={{
              background: "var(--card-bg-crm)",
              border: "1px solid var(--border-hairline)",
              borderRadius: 18,
              padding: 24,
              width: "100%",
              maxWidth: 420,
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.12)",
                color: "#EF4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <AlertTriangle size={22} />
            </div>

            <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 6px", color: "var(--text-primary)" }}>
              Delete #{activeChannelObj.name}?
            </h3>

            <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--text-muted-crm)", margin: "0 0 20px" }}>
              Are you sure you want to delete this channel? All team members will lose access to
              this discussion thread.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: "9px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-raised)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteChannel}
                disabled={isChannelSaving}
                style={{
                  padding: "9px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "#EF4444",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isChannelSaving ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {isChannelSaving && <Loader2 size={14} className="animate-spin" />}
                <span>Delete Channel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Edit Project Thread Details Modal */}
      {showEditProjectModal && activeProject && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            className="animate-fade-in-up"
            style={{
              background: "var(--card-bg-crm)",
              border: "1px solid var(--border-hairline)",
              borderRadius: 18,
              padding: 24,
              width: "100%",
              maxWidth: 460,
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                <Edit3 size={18} />
                <span>Edit Project Thread</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditProjectModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted-crm)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditProjectSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={projectFormName}
                  onChange={(e) => setProjectFormName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 10,
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
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                  Status
                </label>
                <select
                  value={projectFormStatus}
                  onChange={(e) => setProjectFormStatus(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="PLANNING">Planning</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Under Review</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ON_HOLD">On Hold</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                  Description
                </label>
                <textarea
                  value={projectFormDesc}
                  onChange={(e) => setProjectFormDesc(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                    resize: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8, paddingTop: 12, borderTop: "1px solid var(--border-hairline)" }}>
                <button
                  type="button"
                  onClick={() => setShowEditProjectModal(false)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProjectSaving || !projectFormName.trim()}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 10,
                    border: "none",
                    background: "var(--brand-purple, #6C4CE0)",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: isProjectSaving ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {isProjectSaving && <Loader2 size={14} className="animate-spin" />}
                  <span>Save Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Manage Project Members Modal */}
      {showProjectMembersModal && activeProject && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            className="animate-fade-in-up"
            style={{
              background: "var(--card-bg-crm)",
              border: "1px solid var(--border-hairline)",
              borderRadius: 18,
              padding: 24,
              width: "100%",
              maxWidth: 520,
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Users size={18} />
                  <span>Project Thread Members</span>
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted-crm)" }}>
                  Assign collaborators and team members to {activeProject.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProjectMembersModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted-crm)" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Client Owner Card */}
            {(projectClientOwner || activeProject.client) && (
              <div
                style={{
                  padding: "9px 12px",
                  borderRadius: 11,
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.2)",
                      color: "#10B981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {(projectClientOwner?.name || activeProject.client?.name || "C").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                      {projectClientOwner?.name || activeProject.client?.name}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted-crm)" }}>
                      {projectClientOwner?.email || activeProject.client?.email}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    padding: "2px 7px",
                    borderRadius: 5,
                    background: "rgba(16, 185, 129, 0.2)",
                    color: "#10B981",
                  }}
                >
                  CLIENT OWNER
                </span>
              </div>
            )}

            {/* Member search filter */}
            <div style={{ position: "relative", marginBottom: 12 }}>
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
                type="text"
                placeholder="Search studio engineers & staff..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 32px",
                  borderRadius: 10,
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-raised)",
                  color: "var(--text-primary)",
                  fontSize: 12,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Team members list */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }}>
              {teamMembers
                .filter(
                  (m) =>
                    !memberSearch.trim() ||
                    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                    m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
                    m.role.toLowerCase().includes(memberSearch.toLowerCase())
                )
                .map((member) => {
                  const isAssigned = projectMembers.some((pm) => pm.userId === member.id);
                  return (
                    <div
                      key={member.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "9px 12px",
                        borderRadius: 11,
                        background: "var(--surface-raised)",
                        border: "1px solid var(--border-hairline)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: "var(--subtle-fill)",
                            color: "var(--text-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {member.name}
                            </span>
                            {getRoleBadge(member.role)}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--text-muted-crm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {member.email}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleProjectMember(member)}
                        style={{
                          padding: "5px 11px",
                          borderRadius: 7,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          border: isAssigned ? "1px solid rgba(239, 68, 68, 0.3)" : "none",
                          background: isAssigned ? "rgba(239, 68, 68, 0.1)" : "var(--brand-purple, #6C4CE0)",
                          color: isAssigned ? "#EF4444" : "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          flexShrink: 0,
                          transition: "all 0.15s ease",
                        }}
                      >
                        {isAssigned ? (
                          <>
                            <UserMinus size={12} />
                            <span>Remove</span>
                          </>
                        ) : (
                          <>
                            <UserPlus size={12} />
                            <span>Assign</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--border-hairline)" }}>
              <button
                type="button"
                onClick={() => setShowProjectMembersModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "var(--brand-purple, #6C4CE0)",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global & Responsive Overrides: Complete Fixed Viewport Experience */}
      <style>{`
        /* Lock outer wrappers on discussions pages so whole page NEVER scrolls */
        .admin-page-wrapper:has(.discussions-viewport-container),
        .client-portal-wrapper:has(.discussions-viewport-container) {
          height: 100vh !important;
          max-height: 100vh !important;
          overflow: hidden !important;
          padding-bottom: 8px !important;
        }

        .admin-app-shell:has(.discussions-viewport-container) {
          height: calc(100vh - 20px) !important;
          max-height: calc(100vh - 20px) !important;
          overflow: hidden !important;
          padding: 16px 24px !important;
        }

        .admin-body-layout:has(.discussions-viewport-container) {
          height: calc(100vh - 84px) !important;
          max-height: calc(100vh - 84px) !important;
          overflow: hidden !important;
          margin-top: 4px !important;
        }

        .admin-body-layout:has(.discussions-viewport-container) > main {
          height: 100% !important;
          max-height: 100% !important;
          overflow: hidden !important;
        }

        .admin-body-layout:has(.discussions-viewport-container) > main > div:first-child {
          height: 100% !important;
          max-height: 100% !important;
          overflow: hidden !important;
        }

        .admin-body-layout:has(.discussions-viewport-container) footer {
          display: none !important;
        }

        .message-bubble-selectable {
          transition: transform 0.1s ease, filter 0.15s ease, box-shadow 0.15s ease !important;
        }
        .message-bubble-selectable:hover {
          filter: brightness(1.04);
        }

        @media (max-width: 1180px) {
          .discussions-app-shell {
            grid-template-columns: 280px minmax(0, 1fr) !important;
          }
          .discussions-preview-pane {
            position: fixed !important;
            top: 64px !important;
            right: 18px !important;
            bottom: 20px !important;
            width: 360px !important;
            max-width: calc(100vw - 36px) !important;
            z-index: 105 !important;
            box-shadow: 0 16px 48px rgba(0,0,0,0.45) !important;
          }
        }

        @media (max-width: 900px) {
          .discussions-app-shell {
            grid-template-columns: 1fr !important;
          }
          .discussions-sidebar {
            display: none !important;
          }
          .discussions-sidebar.mobile-open {
            display: flex !important;
            position: fixed !important;
            top: 60px !important;
            left: 14px !important;
            right: 14px !important;
            bottom: 16px !important;
            z-index: 100 !important;
            box-shadow: 0 12px 40px rgba(0,0,0,0.4) !important;
          }
          .mobile-drawer-header {
            display: flex !important;
          }
          .discussions-preview-pane {
            top: 14px !important;
            left: 14px !important;
            right: 14px !important;
            bottom: 14px !important;
            width: auto !important;
            max-width: none !important;
            z-index: 120 !important;
          }
        }
      `}</style>
    </div>
  );
}
