import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  FileSpreadsheet,
  FileCode,
  Archive,
  Film,
  Music,
  Download,
  Eye,
  X,
  Search,
  UserPlus,
  Circle,
  ArrowLeft,
  Smile,
  ExternalLink,
  Check,
  CheckCheck,
  File,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import UserProfileModal from '../components/UserProfileModal';

// Quick emojis array for quick reactions
const EMOJIS = ['👍', '❤️', '🔥', '🎉', '💡', '🚀', '🙌', '😊'];

export default function Chat() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Attachments & Profile modal state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState(null);
  const [profileModalUser, setProfileModalUser] = useState(null);
  
  // New Chat Modal state
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  // Typing & Drag-Drop state
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Loading states
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch initial conversations list & handle query parameters
  useEffect(() => {
    const initChat = async () => {
      try {
        setLoadingConversations(true);
        const res = await axios.get('/messages/conversations');
        if (res.data.success) {
          const fetchedConvs = res.data.data;
          setConversations(fetchedConvs);

          const targetUserId = searchParams.get('userId');
          const targetConvId = searchParams.get('conversationId');

          if (targetUserId && targetUserId !== 'undefined' && targetUserId !== 'null') {
            await openOrCreateUserConversation(targetUserId);
          } else if (targetConvId && targetConvId !== 'undefined' && targetConvId !== 'null') {
            const found = fetchedConvs.find((c) => c._id === targetConvId);
            if (found) {
              setActiveConversation(found);
              await fetchMessages(found._id);
            }
          } else if (fetchedConvs.length > 0) {
            setActiveConversation(fetchedConvs[0]);
            await fetchMessages(fetchedConvs[0]._id);
          }
        }
      } catch (err) {
        console.error('Error in initChat:', err);
        toast.error(err.response?.data?.message || 'Failed to load conversations', { id: 'load-conversations-error' });
      } finally {
        setLoadingConversations(false);
      }
    };

    initChat();
  }, [searchParams]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = ({ conversationId, message }) => {
      // Update conversations list (last message & order)
      setConversations((prev) =>
        prev.map((c) => {
          if (c._id === conversationId) {
            return {
              ...c,
              lastMessage: {
                text: message.text || (message.attachments?.length ? 'Attachment' : ''),
                sender: message.sender,
                timestamp: message.createdAt,
              },
              updatedAt: new Date().toISOString(),
            };
          }
          return c;
        }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );

      // If active conversation matches, add message to stream
      if (activeConversation && activeConversation._id === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        scrollToBottom();
      } else {
        // Show toast notification for incoming message
        const senderName = message.sender?.name || 'Someone';
        toast.custom((t) => (
          <div
            onClick={() => {
              toast.dismiss(t.id);
              openConversationById(conversationId);
            }}
            className="bg-gray-800/95 border border-primary-500/30 text-white p-3 rounded-xl shadow-2xl flex items-center space-x-3 cursor-pointer hover:bg-gray-700/95 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center overflow-hidden font-bold">
              {message.sender?.avatar ? (
                <img src={message.sender.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                senderName[0]
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">{senderName}</p>
              <p className="text-xs text-gray-300 line-clamp-1">
                {message.text || 'Sent an attachment'}
              </p>
            </div>
          </div>
        ));
      }
    };

    const handleUserTyping = ({ conversationId }) => {
      if (activeConversation && activeConversation._id === conversationId) {
        setPartnerIsTyping(true);
      }
    };

    const handleUserStopTyping = ({ conversationId }) => {
      if (activeConversation && activeConversation._id === conversationId) {
        setPartnerIsTyping(false);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStopTyping', handleUserStopTyping);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStopTyping', handleUserStopTyping);
    };
  }, [socket, activeConversation]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, partnerIsTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const res = await axios.get('/messages/conversations');
      if (res.data.success) {
        setConversations(res.data.data);
        if (res.data.data.length > 0 && !searchParams.get('userId') && !searchParams.get('conversationId')) {
          setActiveConversation(res.data.data[0]);
          fetchMessages(res.data.data[0]._id);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load conversations', { id: 'load-conversations-error' });
    } finally {
      setLoadingConversations(false);
    }
  };

  const openConversationById = async (convId) => {
    if (!convId || convId === 'undefined' || convId === 'null') return;
    try {
      setLoadingMessages(true);
      const targetConv = conversations.find((c) => c._id === convId);
      if (targetConv) {
        setActiveConversation(targetConv);
        await fetchMessages(convId);
      } else {
        const res = await axios.get('/messages/conversations');
        if (res.data.success) {
          setConversations(res.data.data);
          const found = res.data.data.find((c) => c._id === convId);
          if (found) {
            setActiveConversation(found);
            await fetchMessages(found._id);
          }
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load conversation', { id: 'load-conversation-error' });
    } finally {
      setLoadingMessages(false);
    }
  };

  const openOrCreateUserConversation = async (targetUserId) => {
    if (!targetUserId || targetUserId === 'undefined' || targetUserId === 'null') return;
    try {
      setLoadingMessages(true);
      const res = await axios.get(`/messages/conversations/${targetUserId}`);
      if (res.data.success) {
        const conv = res.data.data;
        setActiveConversation(conv);

        // Add to conversations list if not present
        setConversations((prev) => {
          if (prev.some((c) => c._id === conv._id)) return prev;
          return [conv, ...prev];
        });

        await fetchMessages(conv._id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to open conversation', { id: 'open-conv-error' });
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      setLoadingMessages(true);
      const res = await axios.get(`/messages/${convId}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load chat history');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setSearchParams({ conversationId: conv._id });
    fetchMessages(conv._id);
  };

  // Get recipient participant details from conversation
  const getPartner = (conv) => {
    if (!conv || !conv.participants || conv.participants.length === 0) return null;
    const currentUserId = (user?._id || user?.id)?.toString();
    const other = conv.participants.find((p) => {
      const pId = (p?._id || p)?.toString();
      return pId && pId !== currentUserId;
    });
    return other || conv.participants[0];
  };

  // File Upload Handlers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate size (max 25MB)
    const validFiles = files.filter((file) => {
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds maximum size of 25MB`);
        return false;
      }
      return true;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    e.target.value = null; // reset input
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Typing emitter
  const handleInputChange = (e) => {
    setNewMessageText(e.target.value);

    if (!socket || !activeConversation) return;

    const partner = getPartner(activeConversation);
    if (!partner) return;

    socket.emit('typing', {
      conversationId: activeConversation._id,
      recipientId: partner._id,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', {
        conversationId: activeConversation._id,
        recipientId: partner._id,
      });
    }, 2000);
  };

  // Send Message with Attachments
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() && selectedFiles.length === 0) return;
    if (!activeConversation) return;

    const partner = getPartner(activeConversation);
    if (!partner) return;

    setSendingMessage(true);
    let uploadedAttachments = [];

    try {
      // 1. Upload files first if selected
      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append('file', file);
          
          const uploadRes = await axios.post('/messages/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          if (uploadRes.data.success) {
            uploadedAttachments.push(uploadRes.data.data);
          }
        }
      }

      // 2. Send message payload
      const payload = {
        conversationId: activeConversation._id,
        recipientId: partner._id,
        text: newMessageText.trim(),
        attachments: uploadedAttachments,
      };

      const res = await axios.post('/messages', payload);

      if (res.data.success) {
        const sentMsg = res.data.data;
        setMessages((prev) => [...prev, sentMsg]);
        setNewMessageText('');
        setSelectedFiles([]);
        setShowEmojiPicker(false);

        // Update local conversation list order
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConversation._id
              ? {
                  ...c,
                  lastMessage: {
                    text: sentMsg.text || (sentMsg.attachments?.length ? 'Attachment' : ''),
                    sender: sentMsg.sender,
                    timestamp: sentMsg.createdAt,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : c
          ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );

        // Stop typing indicator
        if (socket) {
          socket.emit('stopTyping', {
            conversationId: activeConversation._id,
            recipientId: partner._id,
          });
        }

        scrollToBottom();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
      setUploadingFiles(false);
    }
  };

  // User search for New Chat Modal
  const handleSearchUsers = async (e) => {
    const term = e.target.value;
    setUserSearchTerm(term);

    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchingUsers(true);
      const res = await axios.get(`/users/search?name=${encodeURIComponent(term)}`);
      if (res.data.success) {
        const currentUserId = user._id || user.id;
        setSearchResults(res.data.data.filter((u) => u._id !== currentUserId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingUsers(false);
    }
  };

  // Drag & Drop File Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter((f) => f.size <= 25 * 1024 * 1024);
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  // Icon selector based on attachment file category
  const renderAttachmentIcon = (fileType, fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (fileType === 'image') return <ImageIcon className="text-purple-400" size={24} />;
    if (fileType === 'video') return <Film className="text-rose-400" size={24} />;
    if (fileType === 'audio') return <Music className="text-amber-400" size={24} />;
    if (ext === 'pdf') return <FileText className="text-red-400" size={24} />;
    if (['doc', 'docx'].includes(ext)) return <FileText className="text-blue-400" size={24} />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileSpreadsheet className="text-emerald-400" size={24} />;
    if (['js', 'json', 'html', 'css', 'py'].includes(ext)) return <FileCode className="text-cyan-400" size={24} />;
    if (['zip', 'rar', '7z'].includes(ext)) return <Archive className="text-orange-400" size={24} />;
    return <File className="text-gray-400" size={24} />;
  };

  // Filter conversations in sidebar
  const filteredConversations = conversations.filter((c) => {
    const partner = getPartner(c);
    if (!partner) return false;
    const nameMatch = partner.name.toLowerCase().includes(searchQuery.toLowerCase());
    const lastMsgMatch = c.lastMessage?.text?.toLowerCase()?.includes(searchQuery.toLowerCase());
    return nameMatch || lastMsgMatch;
  });

  const partner = getPartner(activeConversation);
  const isPartnerOnline = partner && onlineUsers.includes(partner._id);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-16 relative select-none"
    >
      <div className="flex-1 flex h-[calc(100vh-10.5rem)] min-h-[580px] max-h-[850px] w-full gap-3 relative">
      {/* Drag and drop full screen overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-primary-950/90 backdrop-blur-md border-4 border-dashed border-primary-400 rounded-2xl flex flex-col items-center justify-center text-center p-6"
          >
            <Paperclip className="w-16 h-16 text-primary-400 animate-bounce mb-3" />
            <h3 className="text-2xl font-bold text-white">Drop files here to attach</h3>
            <p className="text-gray-300 text-sm mt-1">Supports images, videos, audio, PDF, DOCX, and documents up to 25MB</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── LEFT SIDEBAR: CONVERSATIONS ───────────────────────────── */}
      <div
        className={`w-full md:w-80 lg:w-96 bg-gray-900/70 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          activeConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Messages</span>
              <span className="bg-primary-500/20 text-primary-300 text-xs px-2 py-0.5 rounded-full font-medium">
                {conversations.length}
              </span>
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewChatModal(true)}
              className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white p-2 rounded-xl flex items-center space-x-1.5 text-xs font-semibold shadow-md shadow-primary-900/50 cursor-pointer"
            >
              <UserPlus size={16} />
              <span>New Chat</span>
            </motion.button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary-500/50 transition-all"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {loadingConversations ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin text-primary-400" size={24} />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-gray-400 text-sm">No conversations found.</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="mt-3 text-xs text-primary-400 hover:text-primary-300 font-medium underline cursor-pointer"
              >
                Start a new chat with a skill exchanger
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const partnerUser = getPartner(conv);
              if (!partnerUser) return null;
              const isOnline = onlineUsers.includes(partnerUser._id);
              const isActive = activeConversation?._id === conv._id;

              return (
                <motion.div
                  key={conv._id}
                  whileHover={{ x: 3 }}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center space-x-3 relative ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600/30 to-primary-800/20 border border-primary-500/40 shadow-lg'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {/* User Avatar + Online Dot */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary-900/60 border border-white/10 overflow-hidden flex items-center justify-center text-white font-bold">
                      {partnerUser.avatar ? (
                        <img src={partnerUser.avatar} alt={partnerUser.name} className="w-full h-full object-cover" />
                      ) : (
                        partnerUser.name?.[0]?.toUpperCase() || 'U'
                      )}
                    </div>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-gray-900 rounded-full animate-pulse" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-sm font-semibold text-white truncate">{partnerUser.name}</h4>
                      <span className="text-[10px] text-gray-400 ml-1">
                        {conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {conv.lastMessage?.text || 'No messages yet'}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── RIGHT WINDOW: ACTIVE CHAT ────────────────────────────── */}
      <div
        className={`flex-1 bg-gray-900/70 backdrop-blur-xl border border-white/10 rounded-2xl flex-col overflow-hidden transition-all ${
          activeConversation ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeConversation && partner ? (
          <>
            {/* Active Header */}
            <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between bg-gray-900/40">
              <div
                onClick={() => setProfileModalUser(partner)}
                className="flex items-center space-x-3 cursor-pointer group"
                title="Click to view full user details"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveConversation(null);
                  }}
                  className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary-900/60 border border-white/10 overflow-hidden flex items-center justify-center text-white font-bold group-hover:border-primary-400 transition-colors">
                    {partner.avatar ? (
                      <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover" />
                    ) : (
                      partner.name?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  {isPartnerOnline && (
                    <span className="absolute bottom-0 right-0 w-3 bg-emerald-500 border-2 border-gray-900 rounded-full h-3" />
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-primary-300 transition-colors flex items-center space-x-2">
                    <span>{partner.name}</span>
                  </h3>
                  <p className="text-xs text-gray-400 flex items-center space-x-1">
                    {partnerIsTyping ? (
                      <span className="text-primary-400 font-semibold animate-pulse">typing...</span>
                    ) : isPartnerOnline ? (
                      <span className="text-emerald-400">Online</span>
                    ) : (
                      <span>Offline</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Link to Profile Page */}
              <Link
                to={`/profile/${partner._id || partner}`}
                className="flex items-center space-x-1.5 text-xs bg-white/10 hover:bg-white/20 text-gray-200 px-3.5 py-2 rounded-xl border border-white/10 transition-all hover:scale-105 cursor-pointer"
              >
                <span>Profile</span>
                <ExternalLink size={14} />
              </Link>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="animate-spin text-primary-400" size={28} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400">
                    <Send size={28} />
                  </div>
                  <h4 className="text-lg font-semibold text-white">Say hello to {partner.name}!</h4>
                  <p className="text-xs text-gray-400 max-w-sm">
                    Start exchanging skills, arrange learning sessions, or share documents & media right here.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const currentUserId = user._id || user.id;
                  const isMe = (msg.sender?._id || msg.sender) === currentUserId;

                  return (
                    <motion.div
                      key={msg._id || msg.createdAt}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] sm:max-w-[70%] space-y-2`}>
                        <div
                          className={`p-3.5 rounded-2xl text-sm relative border ${
                            isMe
                              ? 'bg-gradient-to-br from-primary-600 to-purple-700 text-white border-primary-400/40 rounded-br-none shadow-lg shadow-purple-950/40'
                              : 'bg-gray-800/90 text-gray-100 border-white/10 rounded-bl-none shadow-md'
                          }`}
                        >
                          {/* Text Content */}
                          {msg.text && <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>}

                          {/* Attachments rendering */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="space-y-2 mt-2">
                              {msg.attachments.map((att, idx) => (
                                <div key={idx} className="rounded-xl overflow-hidden">
                                  {/* IMAGE */}
                                  {att.fileType === 'image' && (
                                    <div
                                      onClick={() => setLightboxMedia(att.url)}
                                      className="relative group cursor-pointer rounded-xl overflow-hidden border border-white/10 max-h-64"
                                    >
                                      <img src={att.url} alt={att.fileName} className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Eye className="text-white" size={24} />
                                      </div>
                                    </div>
                                  )}

                                  {/* VIDEO */}
                                  {att.fileType === 'video' && (
                                    <video controls className="w-full rounded-xl border border-white/10 max-h-64">
                                      <source src={att.url} />
                                      Your browser does not support video play.
                                    </video>
                                  )}

                                  {/* AUDIO */}
                                  {att.fileType === 'audio' && (
                                    <audio controls className="w-full rounded-lg">
                                      <source src={att.url} />
                                    </audio>
                                  )}

                                  {/* DOCUMENT / OTHER */}
                                  {['document', 'other'].includes(att.fileType) && (
                                    <div className="flex items-center justify-between p-3 bg-black/30 border border-white/10 rounded-xl space-x-3">
                                      <div className="flex items-center space-x-2.5 min-w-0">
                                        {renderAttachmentIcon(att.fileType, att.fileName)}
                                        <div className="min-w-0">
                                          <p className="font-medium text-xs text-white truncate max-w-[180px] sm:max-w-[240px]">
                                            {att.fileName}
                                          </p>
                                          {att.fileSize > 0 && (
                                            <p className="text-[10px] text-gray-400">
                                              {(att.fileSize / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      <a
                                        href={att.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download={att.fileName}
                                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
                                      >
                                        <Download size={16} />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Timestamp & Read Receipt */}
                          <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] opacity-70">
                            <span>
                              {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMe && (
                              <span>
                                {msg.readBy?.length > 1 ? (
                                  <CheckCheck size={14} className="text-cyan-300 inline" />
                                ) : (
                                  <Check size={14} className="text-gray-300 inline" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* File Attachments Draft Preview Area */}
            {selectedFiles.length > 0 && (
              <div className="px-4 py-2 bg-gray-950/80 border-t border-white/10 flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-semibold text-gray-400 flex-shrink-0">Attachments:</span>
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 bg-white/10 border border-white/20 text-white text-xs px-2.5 py-1 rounded-xl flex-shrink-0"
                  >
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    <button
                      onClick={() => removeSelectedFile(idx)}
                      className="text-gray-400 hover:text-rose-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Emoji Reaction bar popup */}
            {showEmojiPicker && (
              <div className="px-4 py-2 bg-gray-800/90 border-t border-white/10 flex items-center space-x-2 overflow-x-auto">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setNewMessageText((prev) => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-xl hover:scale-125 transition-transform p-1 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-gray-900/60 flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.csv"
              />

              {/* Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="Attach document or media"
              >
                <Paperclip size={18} />
              </button>

              {/* Emoji Button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-400 transition-colors cursor-pointer"
                title="Add emoji"
              >
                <Smile size={18} />
              </button>

              {/* Message Input */}
              <input
                type="text"
                placeholder="Type a message or drop files..."
                value={newMessageText}
                onChange={handleInputChange}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary-500/60 transition-all"
              />

              {/* Send Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={sendingMessage || (!newMessageText.trim() && selectedFiles.length === 0)}
                className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary-900/50 cursor-pointer flex items-center justify-center"
              >
                {sendingMessage ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </motion.button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400 shadow-xl">
              <FileText size={36} />
            </div>
            <h3 className="text-xl font-bold text-white">Select or start a conversation</h3>
            <p className="text-sm text-gray-400 max-w-md">
              Chat in real-time, exchange knowledge, arrange skill swap sessions, and share documents or files securely.
            </p>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-primary-500/30 transition-all text-sm cursor-pointer"
            >
              Start New Chat
            </button>
          </div>
        )}
      </div>
      </div>

      {/* ─── NEW CHAT MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {showNewChatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Start a New Chat</h3>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search user by name..."
                  value={userSearchTerm}
                  onChange={handleSearchUsers}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                {searchingUsers ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="animate-spin text-primary-400" size={20} />
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">
                    {userSearchTerm ? 'No users found matching your search.' : 'Type a name to search users.'}
                  </p>
                ) : (
                  searchResults.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => {
                        setShowNewChatModal(false);
                        openOrCreateUserConversation(u._id);
                      }}
                      className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-900/60 overflow-hidden flex items-center justify-center font-bold text-white">
                          {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white">{u.name}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{u.bio || 'Skill Exchanger'}</p>
                        </div>
                      </div>
                      <Send size={16} className="text-primary-400" />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── LIGHTBOX PREVIEW MODAL FOR IMAGES ───────────────────────── */}
      <AnimatePresence>
        {lightboxMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxMedia(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <img src={lightboxMedia} alt="" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
            <button className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full hover:bg-white/20">
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── USER PROFILE MODAL OVERLAY ───────────────────────────────── */}
      {profileModalUser && (
        <UserProfileModal
          user={profileModalUser}
          userId={profileModalUser._id || profileModalUser}
          isOpen={!!profileModalUser}
          onClose={() => setProfileModalUser(null)}
        />
      )}
    </div>
  );
}
