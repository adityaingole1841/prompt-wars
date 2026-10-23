import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  PhoneCall,
  HeartHandshake,
  Sparkles,
  AlertOctagon,
  Trash2,
  Loader2,
} from 'lucide-react';
import { SupportedLanguage } from '../types/emergency';
import { SPEECH_LANG_MAP } from '../utils/translations';
import { ChatMessage, generateEmergencyChatResponse } from '../utils/chatSafetyEngine';
import {
  isSpeechRecognitionSupported,
  createSpeechRecognizer,
  SpeechRecognitionController,
} from '../utils/speechRecognition';

const SUGGESTED_QUESTIONS = [
  '🩺 Fever & severe headache home care',
  '🫁 How do I do hands-only CPR?',
  '🩸 First aid for severe bleeding',
  '🐕 Dog bite first aid & rabies steps',
  '🧠 Panic attack grounding (5-4-3-2-1)',
  '🤍 Feeling hopeless & depressed (Tele-MANAS)',
  '🌪️ What to do during an earthquake',
  '🌊 Flood & waterlogging safety tips',
  '🎒 72-hour emergency go-bag supplies',
  '☀️ Extreme heatwave & loo safety',
  '⚡ Thunderstorm & lightning 30-30 rule',
  '😷 Bad air quality (AQI) & smog tips',
];

interface AIChatbotProps {
  language?: SupportedLanguage;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ language = 'en' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **Emergency, Health, Mental Health, Disaster & Weather AI Assistant**.\n\nAsk me anything in **English, Hindi (हिन्दी), or Marathi (मराठी)** about:\n• 🩺 **Health & First Aid:** High fever, vomiting, burns, cuts, dog/snake bites, CPR, choking, medicines\n• 🧠 **Mental Health:** Panic relief, anxiety grounding, depression, free counseling (Tele-MANAS 14416)\n• 🌪️ **Disaster Survival:** Earthquakes, floods, cyclones, fires, landslides, emergency go-bag\n• ☀️ **Weather Hazards:** Heatwaves (loo), heavy rain, lightning safety, poor AQI/smog, cold waves\n\n🚨 **Note:** If this is an immediate life-threatening emergency, please dial **112** right now. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      urgency: 'LOW',
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognizerRef = useRef<SpeechRecognitionController | null>(null);
  const speechBaseTextRef = useRef<string>('');

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Cleanup speech synthesis and recognition on unmount
  useEffect(() => {
    return () => {
      speechRecognizerRef.current?.stop();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Voice Input with Anti-Echo
  const toggleVoiceInput = () => {
    if (isRecording) {
      speechRecognizerRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setSpeechError('Speech recognition is not supported in this browser.');
      return;
    }

    // Stop speech synthesis first to prevent microphone acoustic feedback loop
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }

    speechBaseTextRef.current = input.trim();
    setSpeechError(null);

    const recognizer = createSpeechRecognizer({
      lang: SPEECH_LANG_MAP[language] || 'en-IN',
      onStart: () => {
        setIsRecording(true);
      },
      onResult: (sessionText, isFinal) => {
        const base = speechBaseTextRef.current;
        const separator = base.length > 0 ? ' ' : '';
        setInput(base + separator + sessionText);
        if (isFinal) {
          setIsRecording(false);
        }
      },
      onError: (err) => {
        setSpeechError(err);
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      },
    });

    if (recognizer) {
      speechRecognizerRef.current = recognizer;
      recognizer.start();
    }
  };

  // Text-To-Speech with Anti-Echo
  const handleSpeak = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device.');
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    // Stop mic recognition before speaking to prevent acoustic echo
    if (isRecording) {
      speechRecognizerRef.current?.stop();
      setIsRecording(false);
    }

    window.speechSynthesis.cancel();
    // Clean markdown characters for clearer speech
    const cleanText = text.replace(/[*#_`>]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.lang = SPEECH_LANG_MAP[language] || 'en-IN';

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Copy message
  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      alert('Failed to copy text.');
    }
  };

  // Send message
  const handleSendMessage = async (userText: string) => {
    const textToSend = userText.trim();
    if (!textToSend || isLoading) return;

    // Stop recording and speech synthesis
    if (isRecording) {
      speechRecognizerRef.current?.stop();
      setIsRecording(false);
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newThread = [...messages, userMessage];
    setMessages(newThread);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newThread.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        urgency: data.urgency,
        suggestedAction: data.suggestedAction,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.warn('Backend chat API failed, using client safety engine:', err);
      const fallback = generateEmergencyChatResponse(textToSend);
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: fallback.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        urgency: fallback.urgency,
        suggestedAction: fallback.suggestedAction,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const clearChat = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: `Chat history cleared. How can I help you with emergency first aid, CPR, or safety guidance?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        urgency: 'LOW',
      },
    ]);
  };

  return (
    <section className="safety-card chat-card-container" aria-label="AI Safety Assistant Chatbot">
      {/* Chat Header */}
      <div className="chat-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div className="chat-avatar-bot">
            <Bot size={22} color="#ffffff" />
          </div>
          <div>
            <h2 className="chat-header-title">
              <span>Emergency AI Assistant</span>
              <span className="chat-live-badge">Live</span>
            </h2>
            <p className="chat-header-sub">
              Ask any question about health symptoms, mental health, disasters & weather safety
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn-chat-clear"
          onClick={clearChat}
          title="Clear chat history"
          aria-label="Clear chat history"
        >
          <Trash2 size={16} />
          <span>Clear</span>
        </button>
      </div>

      {/* Immediate Emergency Warning Banner */}
      <div className="chat-warning-banner" role="alert">
        <AlertOctagon size={18} className="flex-shrink-0" />
        <span>
          <strong>Emergency Rule:</strong> In an active life-threatening situation, dial{' '}
          <strong>112</strong> immediately. Do not rely on chat for dispatcher response.
        </span>
      </div>

      {/* Suggested Questions Carousel / Chips */}
      <div className="chat-suggestions-wrap">
        <span className="suggestions-label">
          <Sparkles size={14} />
          <span>Common questions:</span>
        </span>
        <div className="suggestions-row">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              className="chat-suggestion-chip"
              onClick={() => handleSendMessage(q)}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Thread */}
      <div className="chat-messages-thread" role="log" aria-live="polite">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`chat-message-row ${isUser ? 'row-user' : 'row-assistant'}`}
            >
              {!isUser && (
                <div className="message-bot-icon">
                  <Bot size={18} />
                </div>
              )}

              <div className={`message-bubble ${isUser ? 'bubble-user' : 'bubble-assistant'}`}>
                {/* Formatted Content */}
                <div className="message-text" style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>

                {/* Direct Action Badge if recommended */}
                {!isUser && msg.suggestedAction === 'call_112' && (
                  <div className="msg-action-box">
                    <a href="tel:112" className="btn-msg-call-112">
                      <PhoneCall size={14} />
                      <span>Call 112 Right Now</span>
                    </a>
                  </div>
                )}

                {!isUser && msg.suggestedAction === 'call_telemanas' && (
                  <div className="msg-action-box">
                    <a href="tel:14416" className="btn-msg-call-telemanas">
                      <HeartHandshake size={14} />
                      <span>Call Tele-MANAS (14416)</span>
                    </a>
                  </div>
                )}

                {/* Message Footer: Timestamp, Read Aloud, Copy */}
                <div className="message-meta-row">
                  <span className="message-time">{msg.timestamp}</span>

                  {!isUser && (
                    <div className="message-actions-tools">
                      <button
                        type="button"
                        className="btn-msg-tool"
                        onClick={() => handleSpeak(msg.id, msg.content)}
                        aria-label={
                          speakingMessageId === msg.id ? 'Stop audio readout' : 'Read message aloud'
                        }
                        title="Read aloud"
                      >
                        {speakingMessageId === msg.id ? (
                          <VolumeX size={14} color="#dc2626" />
                        ) : (
                          <Volume2 size={14} />
                        )}
                        <span>{speakingMessageId === msg.id ? 'Stop' : 'Read'}</span>
                      </button>

                      <button
                        type="button"
                        className="btn-msg-tool"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        aria-label="Copy message text"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check size={14} color="#15803d" />
                        ) : (
                          <Copy size={14} />
                        )}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="chat-message-row row-assistant">
            <div className="message-bot-icon">
              <Bot size={18} />
            </div>
            <div className="message-bubble bubble-assistant typing-bubble">
              <Loader2 size={18} className="animate-spin" />
              <span>Analyzing safety instructions...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Error Notice */}
      {speechError && (
        <div className="chat-error-notice">
          <span>{speechError}</span>
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleFormSubmit} className="chat-input-form">
        <button
          type="button"
          className={`btn-chat-mic ${isRecording ? 'recording' : ''}`}
          onClick={toggleVoiceInput}
          title={isRecording ? 'Stop microphone' : 'Voice input (Echo-Free)'}
          aria-label={isRecording ? 'Stop microphone' : 'Voice input'}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <input
          type="text"
          className="chat-text-input"
          placeholder={isRecording ? 'Listening without echo...' : 'Type your emergency or first aid question...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          aria-label="Ask emergency question"
        />

        <button
          type="submit"
          className="btn-chat-send"
          disabled={!input.trim() || isLoading}
          aria-label="Send message"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </section>
  );
};
