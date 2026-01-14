import React, { useState } from 'react';

interface SettingsModalProps {
    onClose: () => void;
    user: any;
    onLogout: () => void;
    systemPrompt: string;
    onSaveSystemPrompt: (prompt: string) => void;
}

export default function SettingsModal({ onClose, user, onLogout, systemPrompt, onSaveSystemPrompt }: SettingsModalProps) {
    const [prompt, setPrompt] = useState(systemPrompt);

    const handleSave = () => {
        onSaveSystemPrompt(prompt);
        onClose();
    };

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Settings</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '10px', fontSize: '1rem', opacity: 0.8 }}>Custom Instructions</h3>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="How would you like Vasi AI to respond? (e.g. 'Be concise', 'Talk like a pirate')"
                        style={{
                            width: '100%', height: '100px', padding: '10px',
                            background: 'var(--bg-primary)', color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)', borderRadius: '8px', resize: 'vertical'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '10px', fontSize: '1rem', opacity: 0.8 }}>Account</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', marginBottom: '15px' }}>
                        <div className="user-avatar-small" style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>{user?.avatar}</div>
                        <div>
                            <div style={{ fontWeight: 600 }}>{user?.name}</div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{user?.email}</div>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        style={{
                            width: '100%', padding: '8px', background: 'none', color: '#dc2626',
                            border: '1px solid #fee2e2', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        Sign Out
                    </button>
                </div>

                <button
                    onClick={handleSave}
                    style={{
                        width: '100%', padding: '12px', background: '#2563eb', color: 'white',
                        border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                    }}
                >
                    Save & Close
                </button>
            </div>
        </div>
    );
}
