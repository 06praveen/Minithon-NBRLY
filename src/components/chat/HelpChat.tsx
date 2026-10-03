import React, { useState, useEffect, useRef, useCallback } from 'react';
import { requestsApi } from '../../api/requests';
import { ChatMessage, ChatConversation, User } from '../../types';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Send, MessageSquare, Shield, Clock } from 'lucide-react';

interface HelpChatProps {
  requestId: string;
  requestTitle: string;
  currentUser: User;
  onNewMessage?: () => void;
}

export const HelpChat: React.FC<HelpChatProps> = ({
  requestId,
  requestTitle,
  currentUser,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [inputContent, setInputContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  }, []);

  // Fetch chat history from API
  const fetchChat = useCallback(async (isPolling = false) => {
    try {
      const data = await requestsApi.getChat(requestId);
      if (data) {
        setConversation(data.conversation);
        setMessages((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(data.messages)) {
            return data.messages;
          }
          return prev;
        });
        setError(null);
      }
    } catch (err: any) {
      if (!isPolling) {
        const msg = err.response?.data?.message || err.message || 'Unable to load chat.';
        setError(msg);
      }
    } finally {
      if (!isPolling) {
        setLoading(false);
      }
    }
  }, [requestId]);

  // Initial load
  useEffect(() => {
    fetchChat(false);
  }, [fetchChat]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(!isFirstLoad.current);
      isFirstLoad.current = false;
    }
  }, [messages, scrollToBottom]);

  // Polling every 3.5 seconds while open
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChat(true);
    }, 3500);

    return () => clearInterval(interval);
  }, [fetchChat]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = inputContent.trim();
    if (!content || sending) return;

    setSending(true);
    setInputContent('');

    try {
      const newMsg = await requestsApi.sendMessage(requestId, content);
      setMessages((prev) => [...prev, newMsg]);
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send message.';
      setError(msg);
      setInputContent(content); // restore on error
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white border border-nbrly-border rounded-panel shadow-lifted overflow-hidden flex flex-col h-[480px]">
      
      {/* ─── Chat Header ─── */}
      <div className="p-4 border-b border-nbrly-border bg-paper flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-lime/40 border border-charcoal/20 flex items-center justify-center text-charcoal">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-heading uppercase tracking-wider text-charcoal">HELP CHAT</span>
              <span className="text-[10px] bg-lime px-2 py-0.5 rounded-full font-semibold text-charcoal border border-charcoal/10 uppercase">
                PRIVATE
              </span>
            </div>
            <p className="text-xs text-muted-gray truncate max-w-[240px] sm:max-w-md font-sans">
              {requestTitle}
            </p>
          </div>
        </div>

        {/* Participants summary */}
        {conversation && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-gray font-sans border-l border-nbrly-border pl-3">
            <div className="flex -space-x-2">
              <Avatar src={conversation.requester?.avatar} name={conversation.requester?.name || 'Requester'} size="sm" className="border-2 border-white" />
              {conversation.helper && (
                <Avatar src={conversation.helper?.avatar} name={conversation.helper?.name || 'Helper'} size="sm" className="border-2 border-white" />
              )}
            </div>
            <span className="text-[11px] font-medium text-charcoal">
              {conversation.requester?.name.split(' ')[0]} & {conversation.helper?.name.split(' ')[0] || 'Helper'}
            </span>
          </div>
        )}
      </div>

      {/* ─── Chat Messages Body ─── */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF9F6]">
        
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-2 text-muted-gray">
            <div className="w-6 h-6 border-2 border-charcoal border-t-lime rounded-full animate-spin" />
            <p className="text-xs font-sans">Connecting to help chat...</p>
          </div>
        ) : error && messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <Shield className="w-8 h-8 text-muted-gray mb-1" />
            <p className="text-xs font-bold uppercase tracking-wider text-charcoal">Private Conversation</p>
            <p className="text-xs text-muted-gray max-w-xs">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          /* Empty Chat State */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="w-12 h-12 rounded-full bg-lime/30 border border-charcoal/10 flex items-center justify-center text-charcoal mb-1">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold font-heading text-charcoal uppercase">Start the conversation</h4>
            <p className="text-xs text-muted-gray font-sans max-w-xs leading-relaxed">
              Coordinate time, location, and specific task details here safely with your neighbor.
            </p>
          </div>
        ) : (
          /* Messages list */
          messages.map((msg) => {
            const isMine = msg.senderId === currentUser.id || (currentUser.name && msg.senderName === currentUser.name);

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-[10px] font-bold text-charcoal/70 uppercase">
                    {isMine ? 'You' : msg.senderName}
                  </span>
                  <span className="text-[10px] text-muted-gray flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>

                <div
                  className={`p-3 text-xs leading-relaxed font-sans rounded-panel max-w-[85%] sm:max-w-[75%] break-words ${
                    isMine
                      ? 'bg-lime text-charcoal border border-charcoal/20 shadow-subtle'
                      : 'bg-white text-charcoal border border-nbrly-border shadow-subtle'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── Chat Message Input Bar ─── */}
      <form onSubmit={handleSend} className="p-3 border-t border-nbrly-border bg-white flex items-center gap-2">
        <input
          type="text"
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          placeholder="Write a message to coordinate help..."
          disabled={loading || !!error && messages.length === 0}
          maxLength={1000}
          className="flex-1 bg-paper border border-nbrly-border rounded-button px-3.5 py-2 text-xs text-charcoal placeholder:text-muted-gray focus:outline-none focus:border-charcoal font-sans transition-colors"
        />
        <Button
          type="submit"
          variant="lime"
          size="sm"
          disabled={!inputContent.trim() || sending || loading}
          className="shrink-0 px-4 font-bold"
        >
          {sending ? (
            <span className="w-3.5 h-3.5 border-2 border-charcoal border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              SEND <Send className="w-3.5 h-3.5 ml-1" />
            </>
          )}
        </Button>
      </form>

    </div>
  );
};
