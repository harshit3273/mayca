import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaUser, FaPaperPlane, FaTrash } from 'react-icons/fa';

// Simulated AI responses for common CA queries
const getAIResponse = (query) => {
  const q = query.toLowerCase();
  if (q.includes('gst') && q.includes('due')) return 'GST returns are generally due on the 20th of the following month for GSTR-3B. GSTR-1 is due on the 11th. For composition dealers, GSTR-4 is filed annually by 30th April. Always verify on the GST portal for any extensions.';
  if (q.includes('itr') && (q.includes('due') || q.includes('deadline'))) return 'For AY 2024-25, the ITR filing deadline for individuals is 31st July 2024. For businesses requiring audit, it is 31st October 2024. Late filing attracts a fee under Section 234F up to ₹5,000.';
  if (q.includes('tds') && q.includes('rate')) return 'TDS rates vary by section: Section 194C (contractors) — 1% individuals, 2% others; Section 194J (professionals) — 10%; Section 194H (commission) — 5%; Section 192 (salary) — as per slab rates. Verify current rates on the Income Tax portal.';
  if (q.includes('section 80c')) return 'Under Section 80C, deductions up to ₹1,50,000 are allowed for investments in PPF, ELSS, LIC premium, NSC, home loan principal, tuition fees, etc. This is available only under the old tax regime.';
  if (q.includes('new tax regime') || q.includes('old tax regime')) return 'Under the new tax regime (default from FY 2023-24), lower slab rates apply but most deductions like 80C, 80D are not available. The old regime allows deductions but has higher slab rates. The choice depends on your investment profile — evaluate both before filing.';
  if (q.includes('roc') || q.includes('annual return')) return 'Companies must file MGT-7 (Annual Return) within 60 days of AGM, and AOC-4 (Financial Statements) within 30 days of AGM. Late filing attracts additional fees of ₹100 per day. AGM should be held within 6 months of financial year end.';
  if (q.includes('advance tax')) return 'Advance tax is payable if total tax liability exceeds ₹10,000. Due dates: 15% by June 15, 45% by Sept 15, 75% by Dec 15, and 100% by March 15. Non-payment attracts interest under Sections 234B and 234C.';
  if (q.includes('hello') || q.includes('hi') || q.includes('help')) return 'Hello! I\'m your AI tax assistant. I can help you with questions about GST, ITR deadlines, TDS rates, ROC compliance, deductions under Section 80C, advance tax, and more. What would you like to know?';
  return 'That\'s a specific query that may require reviewing the latest circulars or notifications from the Income Tax Department or GSTN portal. I recommend consulting the official portals at incometax.gov.in or gst.gov.in, or referring to authoritative tax regulations for a definitive answer.';
};

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Hello! I\'m your AI tax assistant. Ask me about GST, ITR, TDS, ROC compliance, tax deductions, and more.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const response = getAIResponse(input);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: response, timestamp: new Date() }]);
      setTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const clearChat = () => {
    setMessages([{ id: 1, role: 'assistant', content: 'Chat cleared. How can I help you?', timestamp: new Date() }]);
  };

  const suggestions = ['GST due dates', 'ITR filing deadline 2024', 'TDS rates Section 194C', 'Section 80C deductions'];

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <FaRobot className="text-white text-lg" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">AI Tax Assistant</p>
            <p className="text-blue-200 text-xs">Always available</p>
          </div>
        </div>
        <button onClick={clearChat} className="flex items-center gap-1 text-white text-xs opacity-80 hover:opacity-100 bg-white bg-opacity-20 px-3 py-1.5 rounded-lg">
          <FaTrash className="text-xs" /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === 'assistant' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>
              {msg.role === 'assistant' ? <FaRobot className="text-xs" /> : <FaUser className="text-xs" />}
            </div>
            <div className={`max-w-sm rounded-2xl px-4 py-3 text-sm ${msg.role === 'assistant' ? 'bg-gray-100 text-gray-800 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'}`}>
              <p className="leading-relaxed">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.role === 'assistant' ? 'text-gray-400' : 'text-blue-200'}`}>
                {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <FaRobot className="text-xs" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-gray-100">
        {suggestions.map(s => (
          <button key={s} onClick={() => setInput(s)}
            className="flex-shrink-0 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="px-4 pb-4 pt-2 flex gap-2">
        <input
          type="text"
          placeholder="Ask about GST, ITR, TDS, ROC..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" disabled={!input.trim() || typing}
          className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors">
          <FaPaperPlane className="text-sm" />
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
