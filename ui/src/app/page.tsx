'use client';

import { useState, useRef, useEffect } from 'react';
import './globals.css';
import './professional.css';
import LoginScreen from './LoginScreen';
import SettingsModal from './SettingsModal';

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  reasoning?: string[];
  modelUsed?: string;
  timestamp: Date;
  fileInfo?: {
    filename: string;
    type: string;
    summary: string;
  };
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showReasoning, setShowReasoning] = useState<{ [key: string]: boolean }>({});

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState(false); // Image generation mode
  const [viewerImage, setViewerImage] = useState<string | null>(null); // Image lightbox viewer
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null); // Message being edited
  const [editedText, setEditedText] = useState<string>(''); // Edited message text

  // Auto-detect image mode from prompt
  const detectAndSetImageMode = (prompt: string) => {
    const imgKeywords = ['image', 'picture', 'photo', 'draw', 'generate', 'create', 'visualize'];
    const hasImageIntent = imgKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
    if (hasImageIntent && !imageMode) {
      setImageMode(true);
      return true;
    }
    return false;
  };

  // Start editing a message
  const startEditingMessage = (messageId: string, currentText: string) => {
    setEditingMessageId(messageId);
    setEditedText(currentText);
  };

  // Save edited message and regenerate
  const saveEditedMessage = async () => {
    if (!editingMessageId || !editedText.trim()) return;

    // Find the message index
    const messageIndex = messages.findIndex(m => m.id === editingMessageId);
    if (messageIndex === -1) return;

    // Update the message
    const updatedMessages = [...messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      text: editedText
    };

    // Remove all messages after this one
    const newMessages = updatedMessages.slice(0, messageIndex + 1);
    setMessages(newMessages);

    // Clear editing state
    setEditingMessageId(null);
    setEditedText('');

    // Regenerate response
    setIsLoading(true);
    try {
      // Auto-detect and activate image mode if needed
      detectAndSetImageMode(editedText);

      // If image mode is active, prepend "image of" to force image generation
      const finalPrompt = imageMode ? `image of ${editedText}` : editedText;

      // Prepare memory context (reduced to last 3 messages to prevent token overflow)
      const historyContext = newMessages
        .slice(-3)  // Only last 3 messages instead of 10
        .filter(m => m.text)  // Filter out messages without text
        .map(m => {
          const text = (m.text || '').substring(0, 200);  // Limit each message to 200 chars
          return `${m.type === 'user' ? 'User' : 'AI'}: ${text}`;
        })
        .join('\n');

      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: finalPrompt,
          context: systemPrompt ? `System Instructions: ${systemPrompt}\n\n${historyContext}` : historyContext,
          use_reasoning: true,
        }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: data.response,
        reasoning: data.reasoning || [],
        modelUsed: data.model_used,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error regenerating:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const synthRef = useRef<any>(null); // Use any to avoid TS issues with window.speechSynthesis
  const recognitionRef = useRef<any>(null); // Store recognition instance

  useEffect(() => {
    // Load User
    const savedUser = localStorage.getItem('vasi_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    // Load System Prompt
    const savedPrompt = localStorage.getItem('vasi_system_prompt');
    if (savedPrompt) setSystemPrompt(savedPrompt);

    // Load Chats
    const savedChats = localStorage.getItem('vasi_chats');
    if (savedChats) {
      const parsed = JSON.parse(savedChats);
      setChats(parsed);
      if (parsed.length > 0) {
        setCurrentChatId(parsed[0].id);
        setMessages(parsed[0].messages);
      } else {
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  // Save Chats persistence
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('vasi_chats', JSON.stringify(chats));
    }
  }, [chats]);

  // Sync Messages to Current Chat
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      setChats(prev => prev.map(c =>
        c.id === currentChatId
          ? {
            ...c,
            messages,
            title: messages[0].text ? messages[0].text.substring(0, 30) : 'New Chat'
          }
          : c
      ));
    }
  }, [messages]);

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      timestamp: Date.now()
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setMessages([]);
  };

  const loadChat = (chat: ChatSession) => {
    setCurrentChatId(chat.id);
    setMessages(chat.messages);
  };

  const saveSystemPrompt = (prompt: string) => {
    setSystemPrompt(prompt);
    localStorage.setItem('vasi_system_prompt', prompt);
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('vasi_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('vasi_user');
    setShowSettings(false);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let response;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('message', inputValue || 'Analyze this document');
        formData.append('file', selectedFile);

        response = await fetch('http://127.0.0.1:8000/api/chat-with-document', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Auto-detect and activate image mode if needed
        detectAndSetImageMode(inputValue);

        // If image mode is active, prepend "image of" to force image generation
        const finalPrompt = imageMode ? `image of ${inputValue}` : inputValue;

        // Prepare memory context (reduced to last 3 messages to prevent token overflow)
        const historyContext = messages
          .slice(-3)  // Only last 3 messages instead of 10
          .filter(m => m.text)  // Filter out messages without text
          .map(m => {
            const text = (m.text || '').substring(0, 200);  // Limit each message to 200 chars
            return `${m.type === 'user' ? 'User' : 'AI'}: ${text}`;
          })
          .join('\n');

        response = await fetch('http://127.0.0.1:8000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: finalPrompt,
            context: systemPrompt ? `System Instructions: ${systemPrompt}\n\n${historyContext}` : historyContext,
            use_reasoning: true,
          }),
        });
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: data.response,
        reasoning: data.reasoning || [],
        modelUsed: data.model_used,
        timestamp: new Date(),
        fileInfo: data.document_info,
      };

      setMessages(prev => [...prev, aiMessage]);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: 'Error: Could not connect to AI backend. Please make sure the API is running.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleReasoning = (messageId: string) => {
    setShowReasoning(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const toggleListening = () => {
    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      // Start listening
      if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true; // Keep listening until manually stopped
        recognition.interimResults = true; // Show interim results
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        let finalTranscript = '';

        recognition.onstart = () => {
          setIsListening(true);
          finalTranscript = '';
        };

        recognition.onend = () => {
          setIsListening(false);
          recognitionRef.current = null;
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          // Update input with final + interim
          setInputValue(finalTranscript + interimTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          recognitionRef.current = null;
        };

        recognitionRef.current = recognition;
        recognition.start();
      } else {
        alert("Voice Input is only supported in Chrome/Edge/Safari.");
      }
    }
  };

  const handleSpeak = (message: Message) => {
    // 1. Controls Logic: Toggle (Start / Stop)
    if (speakingId === message.id) {
      if (synthRef.current) synthRef.current.cancel();
      setAudioState('idle');
      setSpeakingId(null);
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Voice output not supported.");
      return;
    }

    if (!synthRef.current) synthRef.current = window.speechSynthesis;

    // Stop others
    synthRef.current.cancel();
    setSpeakingId(message.id);
    setAudioState('playing');

    // Get Voice
    const voices = synthRef.current.getVoices();
    const voice = voices.find((v: any) => v.name.includes("Google US English")) ||
      voices.find((v: any) => v.lang.startsWith("en-US")) ||
      voices.find((v: any) => v.lang.startsWith("en")) ||
      voices[0];

    // Smart Text
    let speakableText = message.text;
    speakableText = speakableText.replace(/```[\s\S]*?```/g, ". I have generated the code solution below. ");
    speakableText = speakableText.replace(/https?:\/\/\S+/g, " a link. ");
    speakableText = speakableText.replace(/[*#_`[\]]/g, "");
    speakableText = speakableText.replace(/\s+/g, " ").trim();
    if (!speakableText || speakableText.length < 2) speakableText = "Here is the result.";

    // Truncate
    if (speakableText.length > 4000) speakableText = speakableText.substring(0, 4000) + "...";

    const utterance = new SpeechSynthesisUtterance(speakableText);
    if (voice) utterance.voice = voice;
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => { setAudioState('idle'); setSpeakingId(null); };
    utterance.onerror = (e) => {
      console.warn("Speech warning:", e);
      setAudioState('idle');
      setSpeakingId(null);
    };

    synthRef.current.speak(utterance);
  };

  const handleStopSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setAudioState('idle');
    setSpeakingId(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <>
      {showSettings && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
          onLogout={handleLogout}
          systemPrompt={systemPrompt}
          onSaveSystemPrompt={saveSystemPrompt}
        />
      )}
      <div className="app-layout">
        {/* Sidebar */}
        <div className="sidebar-pro">
          <div className="sidebar-header">
            <button className="new-chat-btn" onClick={createNewChat}>
              <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>+</span> New Chat
            </button>
          </div>

          <div className="sidebar-history">
            {chats.map(chat => (
              <button
                key={chat.id}
                className={`history-item ${currentChatId === chat.id ? 'active' : ''}`}
                onClick={() => loadChat(chat)}
              >
                {chat.title}
              </button>
            ))}
          </div>

          <div className="sidebar-footer" style={{ position: 'relative' }}>
            {showProfileMenu && (
              <div className="profile-menu-popover">
                <button
                  className="profile-menu-item"
                  onClick={() => { setShowSettings(true); setShowProfileMenu(false); }}
                >
                  <span style={{ fontSize: '1.2rem' }}>⚙️</span> Customize Vasi AI
                </button>
                <button
                  className="profile-menu-item"
                  onClick={() => { setTheme(theme === 'light' ? 'dark' : 'light'); setShowProfileMenu(false); }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{theme === 'light' ? '🌙' : '☀️'}</span> {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </button>
                <div className="profile-menu-divider"></div>
                <button
                  className="profile-menu-item"
                  onClick={handleLogout}
                  style={{ color: '#ef4444' }}
                >
                  <span style={{ fontSize: '1.2rem' }}>🚪</span> Log out
                </button>
              </div>
            )}
            <button className="user-profile-sidebar" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div className="user-avatar-small">{user?.avatar}</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.name}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Vasi AI Ultra</span>
              </div>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content-wrapper">
          <main className="main-content-pro">
            <div className="chat-container-pro">
              {/* Messages Area */}
              <div className="messages-area-pro">
                {messages.length === 0 && (
                  <div className="welcome-screen">
                    <div className="welcome-header">
                      <h1 className="welcome-title">Vasi AI</h1>
                      <p className="welcome-subtitle">How can I help you today?</p>
                    </div>

                    <div className="suggestion-cards">
                      <button className="suggestion-card" onClick={() => setInputValue('Write a Python function to sort a list')}>
                        <div className="suggestion-title">Code Generation</div>
                        <div className="suggestion-text">Write a Python function to sort a list</div>
                      </button>
                      <button className="suggestion-card" onClick={() => setInputValue('Explain how neural networks work')}>
                        <div className="suggestion-title">Explanations</div>
                        <div className="suggestion-text">Explain how neural networks work</div>
                      </button>
                      <button className="suggestion-card" onClick={() => fileInputRef.current?.click()}>
                        <div className="suggestion-title">Document Analysis</div>
                        <div className="suggestion-text">Upload and analyze documents</div>
                      </button>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id} className={`message-pro ${message.type}`}>
                    <div className="message-avatar-pro">
                      {message.type === 'user' ? 'U' : 'V'}
                    </div>
                    <div className="message-content-pro">
                      {/* Edit Mode for User Messages */}
                      {message.type === 'user' && editingMessageId === message.id ? (
                        <div style={{ width: '100%' }}>
                          <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            style={{
                              width: '100%',
                              minHeight: '80px',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '2px solid #3b82f6',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-primary)',
                              fontSize: '0.95rem',
                              fontFamily: 'inherit',
                              resize: 'vertical'
                            }}
                            autoFocus
                          />
                          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            <button
                              onClick={saveEditedMessage}
                              style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: 600
                              }}
                            >
                              Save & Regenerate
                            </button>
                            <button
                              onClick={() => {
                                setEditingMessageId(null);
                                setEditedText('');
                              }}
                              style={{
                                padding: '8px 16px',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="message-text-pro">
                            {message.text ? (
                              <div>
                                {message.text.split(/(```[\s\S]*?```)/g).map((part, index) => {
                                  if (part.startsWith('```')) {
                                    // Code Block
                                    const match = part.match(/```(\w*)\n([\s\S]*?)```/);
                                    const language = match ? match[1] : '';
                                    const code = match ? match[2] : part.slice(3, -3);

                                    return (
                                      <div key={index} className="code-block-wrapper">
                                        <div className="code-header">
                                          <span className="code-lang">{language || 'code'}</span>
                                          <button
                                            className="copy-btn"
                                            onClick={() => navigator.clipboard.writeText(code)}
                                          >
                                            Copy
                                          </button>
                                        </div>
                                        <pre className="code-block-pro">
                                          <code>{code}</code>
                                        </pre>
                                      </div>
                                    );
                                  } else {
                                    // Regular Text with Bold & Image support
                                    return (
                                      <span key={index} style={{ whiteSpace: 'pre-wrap' }}>
                                        {part.split(/(!\[.*?\]\(.*?\))/g).map((subPart, i) => {
                                          const imgMatch = subPart.match(/!\[(.*?)\]\((.*?)\)/);
                                          if (imgMatch) {
                                            return (
                                              <div key={i} className="generated-image-container" style={{ margin: '15px 0', position: 'relative', display: 'inline-block' }}>
                                                <img
                                                  src={imgMatch[2]}
                                                  alt={imgMatch[1]}
                                                  onClick={() => setViewerImage(imgMatch[2])}
                                                  style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '500px',
                                                    borderRadius: '12px',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                                    display: 'block',
                                                    cursor: 'zoom-in',
                                                    transition: 'transform 0.2s'
                                                  }}
                                                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                />
                                                <a
                                                  href={imgMatch[2]}
                                                  download={`vasi-ai-${Date.now()}.jpg`}
                                                  style={{
                                                    position: 'absolute',
                                                    top: '10px',
                                                    right: '10px',
                                                    background: 'rgba(0,0,0,0.5)',
                                                    backdropFilter: 'blur(8px)',
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    border: '1px solid rgba(255,255,255,0.15)',
                                                    cursor: 'pointer',
                                                    opacity: 0.7
                                                  }}
                                                  onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(59,130,246,0.9)';
                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                    e.currentTarget.style.opacity = '1';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.4)';
                                                  }}
                                                  onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.opacity = '0.7';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                  }}
                                                  title="Download Image"
                                                >
                                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="7 10 12 15 17 10" />
                                                    <line x1="12" y1="15" x2="12" y2="3" />
                                                  </svg>
                                                </a>
                                              </div>
                                            );
                                          }

                                          // Bold Logic for text segments
                                          return subPart.split(/(\*\*.*?\*\*)/g).map((text, j) => {
                                            if (text.startsWith('**') && text.endsWith('**')) {
                                              return <strong key={j} className="formatted-bold">{text.slice(2, -2)}</strong>;
                                            }

                                            // Check for HTML links (download buttons)
                                            if (text.includes('<a href=')) {
                                              return <span key={j} dangerouslySetInnerHTML={{ __html: text }} />;
                                            }

                                            return <span key={j}>{text}</span>;
                                          });
                                        })}
                                      </span>
                                    );
                                  }
                                })}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--accent-primary)', opacity: 0.7 }}>Thinking... (or empty response)</span>
                            )}
                          </div>

                          {message.fileInfo && (
                            <div className="file-info-pro">
                              <div className="file-name-pro">{message.fileInfo.filename}</div>
                              <div className="file-meta-pro">{message.fileInfo.type} • {message.fileInfo.summary}</div>
                            </div>
                          )}

                          {/* Reasoning chain hidden by user request */}

                          {/* Model badge hidden by user request */}
                        </>
                      )}

                      {message.type === 'ai' && message.text && (
                        <div className="msg-actions-row" style={{ display: 'flex', gap: '15px', marginTop: '12px' }}>
                          <button
                            className="msg-action-btn"
                            onClick={() => handleSpeak(message)}
                            title={speakingId === message.id ? "Stop Speaking" : "Explain Practically"}
                            style={{
                              fontSize: '0.95rem',
                              padding: '8px 12px',
                              fontWeight: 500,
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              color: speakingId === message.id ? '#ef4444' : 'inherit'
                            }}
                          >
                            <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>
                              {speakingId === message.id ? '⏹️' : '🔈'}
                            </span>
                            {speakingId === message.id ? 'Stop Explaining' : 'Explain'}
                          </button>

                          <button
                            className="msg-action-btn"
                            onClick={() => navigator.clipboard.writeText(message.text)}
                            title="Copy Text"
                            style={{
                              fontSize: '0.95rem',
                              padding: '8px 12px',
                              borderRadius: '8px'
                            }}
                          >
                            <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>📋</span> Copy
                          </button>
                        </div>
                      )}

                      {/* Edit button for user messages (only last one) */}
                      {message.type === 'user' && messages[messages.length - 1]?.id === message.id && editingMessageId !== message.id && (
                        <div style={{ marginTop: '8px' }}>
                          <button
                            onClick={() => startEditingMessage(message.id, message.text)}
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(255,255,255,0.2)',
                              color: 'var(--text-primary)',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                              e.currentTarget.style.borderColor = '#3b82f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                            }}
                            title="Edit message"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="message-pro ai">
                    <div className="message-avatar-pro">V</div>
                    <div className="message-content-pro">
                      <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              < div className="input-area-pro" >
                <div className="input-container-pro">
                  {selectedFile && (
                    <div className="file-preview-pro">
                      <div className="file-preview-content">
                        <span className="file-preview-name">{selectedFile.name}</span>
                        <span className="file-preview-size">{formatFileSize(selectedFile.size)}</span>
                      </div>
                      <button
                        className="file-remove-btn"
                        onClick={() => setSelectedFile(null)}
                        aria-label="Remove file"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <div className="input-wrapper-pro">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.docx,.txt,.md,.xlsx,.csv,.png,.jpg,.jpeg"
                      hidden
                    />
                    <button
                      className="attach-btn-pro"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Attach file"
                      title="Upload document or image"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                      </svg>
                    </button>

                    <button
                      className={`mic-btn-pro ${isListening ? 'listening' : ''}`}
                      onClick={toggleListening}
                      aria-label="Voice Input"
                      title="Speak to Vasi AI"
                    >
                      <span style={{ fontSize: '1.2rem' }}>{isListening ? '🛑' : '🎤'}</span>
                    </button>

                    <button
                      className={`image-mode-btn ${imageMode ? 'active' : ''}`}
                      onClick={() => setImageMode(!imageMode)}
                      aria-label="Image Generation Mode"
                      title={imageMode ? "Image Mode ON - All prompts generate images" : "Image Mode OFF - Click to activate"}
                      style={{
                        background: imageMode ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'var(--bg-secondary)',
                        border: imageMode ? '2px solid #667eea' : '2px solid var(--border-color)',
                        color: imageMode ? 'white' : 'var(--text-primary)',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        boxShadow: imageMode ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none',
                        transform: imageMode ? 'scale(1.05)' : 'scale(1)'
                      }}
                      onMouseEnter={(e) => {
                        if (!imageMode) {
                          e.currentTarget.style.background = 'var(--bg-hover)';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!imageMode) {
                          e.currentTarget.style.background = 'var(--bg-secondary)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      {imageMode && <span style={{ fontSize: '0.75rem' }}>ON</span>}
                    </button>

                    <textarea
                      ref={textareaRef}
                      className="message-input-pro"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Message Vasi AI..."
                      rows={1}
                    />

                    <button
                      className="send-btn-pro"
                      onClick={handleSendMessage}
                      disabled={isLoading || (!inputValue.trim() && !selectedFile)}
                      aria-label="Send message"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Right Sidebar - Dynamic Info Panel */}
        <aside className="right-sidebar">
          <div className="visualizer-box">
            <div className="pulse-circle"></div>
            <div className="pulse-ring"></div>
          </div>

          <div className="info-card">
            <div className="info-label">Current Session</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ opacity: 0.7 }}>Status</span>
              <span style={{ color: '#4ade80' }}>Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Model</span>
              <span>Vasi Ultra</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-label">System Stats</div>
            <div className="info-value" style={{ fontSize: '2rem', marginBottom: '5px' }}>98<span style={{ fontSize: '1rem', opacity: 0.5 }}>%</span></div>
            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Optimal Performance</div>
          </div>

          <div className="info-card">
            <div className="info-label"> Capabilities</div>
            <div>
              <span className="feature-tag">Code Analysis</span>
              <span className="feature-tag">Voice Mode</span>
              <span className="feature-tag">Data Vis</span>
              <span className="feature-tag">Auto-Fix</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
