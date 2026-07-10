import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FaPaperPlane, FaComments, FaSearch, FaCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const CAMessages = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  // Load clients
  useEffect(() => {
    API.get('/clients?limit=200').then(r => setClients(r.data.clients)).catch(() => { });
  }, []);

  // Load messages for selected client
  const loadMessages = useCallback(async (silent = false) => {
    if (!selectedClient) return;
    if (!silent) setLoadingMsgs(true);
    try {
      const { data } = await API.get(`/messages/${selectedClient._id}`);
      setMessages(data);
    } catch { if (!silent) toast.error('Failed to load messages'); }
    finally { if (!silent) setLoadingMsgs(false); }
  }, [selectedClient]);

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 5 seconds
    pollRef.current = setInterval(() => loadMessages(true), 20000);
    return () => clearInterval(pollRef.current);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedClient || sending) return;
    setSending(true);
    try {
      const { data } = await API.post('/messages', { recipientId: selectedClient._id, content: input.trim() });
      setMessages(prev => [...prev, data]);
      setInput('');
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  const filteredClients = clients.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d) => {
    const date = new Date(d);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const day = new Date(msg.createdAt).toDateString();
    if (!groups[day]) groups[day] = [];
    groups[day].push(msg);
    return groups;
  }, {});

  return (
    <div className="flex h-[calc(100vh-130px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── Client list sidebar ── */}
      <div className="w-64 border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="font-semibold text-sm text-gray-900 mb-2">Conversations</p>
          <div className="relative">
            <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input type="text" placeholder="Search clients..."
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredClients.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-8">No clients found</p>
          ) : filteredClients.map(c => (
            <button key={c._id} onClick={() => setSelectedClient(c)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${selectedClient?._id === c._id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''}`}>
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <FaCircle className="absolute -bottom-0.5 -right-0.5 text-green-400 text-xs" />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${selectedClient?._id === c._id ? 'text-blue-700' : 'text-gray-900'}`}>{c.name}</p>
                <p className="text-xs text-gray-400 truncate">{c.businessName || c.email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat area ── */}
      {!selectedClient ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FaComments className="text-blue-400 text-3xl" />
            </div>
            <p className="font-semibold text-gray-700">Select a client</p>
            <p className="text-sm text-gray-400 mt-1">Choose a client from the left to start messaging</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 bg-white shadow-sm">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {selectedClient.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{selectedClient.name}</p>
              <p className="text-xs text-gray-400 truncate">{selectedClient.email}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
              <FaCircle className="text-xs" /> Active
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-slate-50">
            {loadingMsgs ? <LoadingSpinner message="Loading messages..." /> :
              messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">No messages yet</p>
                    <p className="text-gray-300 text-xs mt-1">Send a message to {selectedClient.name}</p>
                  </div>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([day, msgs]) => (
                  <div key={day}>
                    {/* Date divider */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400 font-medium px-2">{formatDate(msgs[0].createdAt)}</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                    {msgs.map((msg, i) => {
                      const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                      const showAvatar = !isMine && (i === 0 || msgs[i - 1]?.sender?._id !== msg.sender?._id);
                      return (
                        <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
                          {!isMine && (
                            <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mr-2 mt-1 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                              {selectedClient.name.charAt(0)}
                            </div>
                          )}
                          <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2.5 shadow-sm ${isMine
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                            }`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'} text-right`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2 items-end">
            <textarea
              placeholder={`Message ${selectedClient.name}...`}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50 focus:bg-white max-h-32"
              value={input}
              rows={1}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); }
              }}
            />
            <button type="submit" disabled={!input.trim() || sending}
              className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0">
              {sending
                ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                : <FaPaperPlane className="text-sm" />
              }
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CAMessages;
