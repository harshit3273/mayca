import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FaPaperPlane, FaComments, FaCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const ClientChat = () => {
  const { user } = useAuth();
  const [caUser, setCaUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (user && user.assignedCA) {
      setCaUser(user.assignedCA);
    }
    setLoading(false);
  }, [user]);

  const loadMessages = useCallback(async (silent = false) => {
    if (!caUser) return;
    try {
      const { data } = await API.get(`/messages/${caUser._id}`);
      setMessages(data);
    } catch { if (!silent) toast.error('Failed to load messages'); }
  }, [caUser]);

  useEffect(() => {
    if (!caUser) return;
    loadMessages();
    pollRef.current = setInterval(() => loadMessages(true), 20000);
    return () => clearInterval(pollRef.current);
  }, [loadMessages, caUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending || !caUser) return;
    setSending(true);
    try {
      const { data } = await API.post('/messages', { recipientId: caUser._id, content: input.trim() });
      setMessages(prev => [...prev, data]);
      setInput('');
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

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

  const grouped = messages.reduce((g, m) => {
    const day = new Date(m.createdAt).toDateString();
    if (!g[day]) g[day] = [];
    g[day].push(m);
    return g;
  }, {});

  if (loading) return <LoadingSpinner message="Connecting to your CA..." />;

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Header */}
      <div className={`px-5 py-4 flex items-center gap-3 ${caUser ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-100'}`}>
        {caUser ? (
          <>
            <div className="relative">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-white font-bold">
                {caUser.name?.charAt(0).toUpperCase()}
              </div>
              <FaCircle className="absolute -bottom-0.5 -right-0.5 text-green-400 text-xs" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">{caUser.name}</p>
              <p className="text-blue-200 text-xs">Your Chartered Accountant · Online</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
              <FaComments className="text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">Chat with CA</p>
              <p className="text-gray-400 text-xs">Not yet connected</p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 bg-slate-50">
        {!caUser ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FaComments className="text-blue-400 text-3xl" />
            </div>
            <p className="font-semibold text-gray-700 mb-1">Not connected yet</p>
            <p className="text-gray-400 text-sm max-w-xs">
              Your CA needs to send you the first message to establish the connection. Please contact your CA firm.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FaPaperPlane className="text-blue-400 text-2xl" />
            </div>
            <p className="font-semibold text-gray-700 mb-1">Start the conversation</p>
            <p className="text-gray-400 text-sm">Send a message to {caUser.name}</p>
          </div>
        ) : (
          Object.entries(grouped).map(([day, msgs]) => (
            <div key={day}>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium px-2">{formatDate(msgs[0].createdAt)}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              {msgs.map(msg => {
                const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                return (
                  <div key={msg._id} className={`flex mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {!isMine && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mr-2 mt-1">
                        {caUser.name?.charAt(0)}
                      </div>
                    )}
                    <div className={`max-w-xs rounded-2xl px-4 py-2.5 shadow-sm ${isMine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'}`}>
                      {!isMine && <p className="text-xs font-semibold text-blue-600 mb-1">{caUser.name}</p>}
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-xs mt-1 text-right ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>{formatTime(msg.createdAt)}</p>
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
          placeholder={caUser ? `Message ${caUser.name}...` : 'Connect with your CA first...'}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50 focus:bg-white disabled:opacity-50 max-h-32"
          value={input}
          rows={1}
          disabled={!caUser}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
        />
        <button type="submit" disabled={!input.trim() || sending || !caUser}
          className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0">
          {sending
            ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
            : <FaPaperPlane className="text-sm" />}
        </button>
      </form>
    </div>
  );
};

export default ClientChat;
