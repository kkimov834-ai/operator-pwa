import React, { useState, useEffect, useRef } from 'react';
import JsSIP from 'jssip';
import { Phone, PhoneOff, Settings, Volume2, VolumeX, Check, X, ShieldAlert } from 'lucide-react';

const SipPhone = ({ themeStyles }) => {
    const s = themeStyles || {};
    // Настройки SIP
    const [sipUser, setSipUser] = useState(() => localStorage.getItem('sip_user') || '');
    const [sipPass, setSipPass] = useState(() => localStorage.getItem('sip_pass') || '');
    const [sipHost, setSipHost] = useState(() => localStorage.getItem('sip_host') || 'vats.az');
    const [wsUrl, setWsUrl] = useState(() => localStorage.getItem('sip_ws_url') || 'wss://vats.az:8089/ws');

    // Состояние подключения и звонка
    const [ua, setUa] = useState(null);
    const [status, setStatus] = useState('Disconnected'); // Disconnected, Connecting, Registered, RegistrationFailed
    const [session, setSession] = useState(null);
    const [callState, setCallState] = useState('Idle'); // Idle, Incoming, Calling, Active
    const [remoteNumber, setRemoteNumber] = useState('');
    const [dialNumber, setDialNumber] = useState('');
    
    const [showSettings, setShowSettings] = useState(false);
    const [mute, setMute] = useState(false);
    const [duration, setDuration] = useState(0);

    const timerRef = useRef(null);
    const ringtoneIntervalRef = useRef(null);
    const audioContextRef = useRef(null);
    const remoteAudioRef = useRef(null);

    // Сохранение настроек в LocalStorage
    const saveSettings = () => {
        localStorage.setItem('sip_user', sipUser);
        localStorage.setItem('sip_pass', sipPass);
        localStorage.setItem('sip_host', sipHost);
        localStorage.setItem('sip_ws_url', wsUrl);
        setShowSettings(false);
        
        if (ua) {
            ua.stop();
        }
        initSip();
    };

    // Генерация телефонного гудка (Web Audio API)
    const playSyntheticRingtone = () => {
        try {
            if (audioContextRef.current) return;
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioCtx;

            const playTone = () => {
                if (!audioContextRef.current) return;
                const osc1 = audioCtx.createOscillator();
                const osc2 = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(440, audioCtx.currentTime);
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(480, audioCtx.currentTime);

                gain.gain.setValueAtTime(0, audioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.3, audioCtx.currentTime + 1.8);
                gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2.0);

                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(audioCtx.destination);

                osc1.start();
                osc2.start();
                osc1.stop(audioCtx.currentTime + 2.0);
                osc2.stop(audioCtx.currentTime + 2.0);
            };

            playTone();
            ringtoneIntervalRef.current = setInterval(playTone, 3000);
        } catch (e) {
            console.error('Failed to play synthetic ringtone:', e);
        }
    };

    const stopSyntheticRingtone = () => {
        if (ringtoneIntervalRef.current) {
            clearInterval(ringtoneIntervalRef.current);
            ringtoneIntervalRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    };

    // Инициализация JsSIP
    const initSip = () => {
        if (!sipUser || !sipPass || !sipHost || !wsUrl) {
            setStatus('Disconnected');
            return;
        }

        setStatus('Connecting');

        const socket = new JsSIP.WebSocketInterface(wsUrl);
        const configuration = {
            sockets: [socket],
            uri: `sip:${sipUser}@${sipHost}`,
            password: sipPass,
            register: true
        };

        const newUa = new JsSIP.UA(configuration);
        
        newUa.on('connected', () => console.log('JsSIP connected to WebSocket'));
        newUa.on('disconnected', () => {
            console.log('JsSIP disconnected');
            setStatus('Disconnected');
        });
        
        newUa.on('registered', () => {
            console.log('JsSIP registered');
            setStatus('Registered');
        });
        
        newUa.on('registrationFailed', (e) => {
            console.error('JsSIP registration failed:', e.cause);
            setStatus('RegistrationFailed');
        });

        newUa.on('newRTCSession', (data) => {
            const newSession = data.session;
            setSession(newSession);

            if (newSession.direction === 'incoming') {
                setCallState('Incoming');
                setRemoteNumber(newSession.remote_identity.uri.user);
                playSyntheticRingtone();
            } else {
                setCallState('Calling');
                setRemoteNumber(newSession.remote_identity.uri.user);
            }

            newSession.on('accepted', () => {
                setCallState('Active');
                stopSyntheticRingtone();
                setDuration(0);
            });

            newSession.on('ended', () => {
                setCallState('Idle');
                setSession(null);
                stopSyntheticRingtone();
            });

            newSession.on('failed', (e) => {
                console.warn('Call failed:', e.cause);
                setCallState('Idle');
                setSession(null);
                stopSyntheticRingtone();
            });

            newSession.on('peerconnection', (e) => {
                const pc = e.peerconnection;
                pc.ontrack = (event) => {
                    if (remoteAudioRef.current) {
                        remoteAudioRef.current.srcObject = event.streams[0];
                        remoteAudioRef.current.play().catch(err => console.error('Audio play error:', err));
                    }
                };
            });
        });

        newUa.start();
        setUa(newUa);
    };

    // Запуск таймера разговора
    useEffect(() => {
        if (callState === 'Active') {
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
            setDuration(0);
        }
        return () => clearInterval(timerRef.current);
    }, [callState]);

    useEffect(() => {
        initSip();
        return () => {
            if (ua) ua.stop();
            stopSyntheticRingtone();
        };
    }, []);

    // Принятие звонка
    const answerCall = () => {
        if (session) {
            session.answer({
                mediaConstraints: { audio: true, video: false }
            });
        }
    };

    // Сброс звонка
    const hangupCall = () => {
        if (session) {
            session.terminate();
        }
    };

    // Совершение звонка
    const makeCall = () => {
        if (!ua || status !== 'Registered' || !dialNumber) return;
        const callSession = ua.call(`sip:${dialNumber}@${sipHost}`, {
            mediaConstraints: { audio: true, video: false }
        });
        setSession(callSession);
    };

    // Отключение/Включение микрофона
    const toggleMute = () => {
        if (session) {
            if (mute) {
                session.unmute();
            } else {
                session.mute();
            }
            setMute(!mute);
        }
    };

    // Форматирование времени разговора
    const formatDuration = (sec) => {
        const mins = Math.floor(sec / 60).toString().padStart(2, '0');
        const secs = (sec % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', backgroundColor: s.cardBg || '#1e1b2e',
            border: `1px solid ${s.border || '#2d2b3b'}`, borderRadius: '12px', padding: '10px',
            width: '100%', flexShrink: 0
        }}>
            <audio ref={remoteAudioRef} id="sip-remote-audio" autoPlay style={{ display: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                <div 
                    title={status === 'Registered' ? 'АТС Qoşulub' : status === 'Connecting' ? 'Qoşulur...' : 'АТС Qoşulmayıb'}
                    style={{
                        width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                        backgroundColor: status === 'Registered' ? '#10b981' : status === 'Connecting' ? '#f59e0b' : '#ef4444',
                        boxShadow: status === 'Registered' ? '0 0 6px #10b981' : 'none'
                    }} 
                />

                {callState === 'Idle' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                        <input 
                            placeholder="Telefon nömrəsi" 
                            value={dialNumber} 
                            onChange={(e) => setDialNumber(e.target.value)} 
                            disabled={status !== 'Registered'}
                            style={{
                                height: '28px', fontSize: '12px', fontWeight: 'bold', padding: '0 8px', flex: 1,
                                backgroundColor: s.navBg || 'rgba(0,0,0,0.2)', border: `1px solid ${s.border || 'transparent'}`,
                                color: s.text || '#fff', borderRadius: '6px', outline: 'none'
                            }}
                        />
                        <button 
                            disabled={status !== 'Registered' || !dialNumber}
                            onClick={makeCall}
                            style={{
                                backgroundColor: status !== 'Registered' || !dialNumber ? 'gray' : '#10b981', 
                                color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '6px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}
                        >
                            <Phone size={12} />
                        </button>
                    </div>
                )}

                {callState === 'Incoming' && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: 0,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '8px', padding: '2px 8px'
                    }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#10b981', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '8px' }}>
                            📞 Gələn: {remoteNumber}
                        </span>
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                            <button onClick={hangupCall} style={{ width: '24px', height: '24px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <X size={14} />
                            </button>
                            <button onClick={answerCall} style={{ width: '24px', height: '24px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Check size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {callState === 'Calling' && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: 0,
                        backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)',
                        borderRadius: '8px', padding: '2px 8px'
                    }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#f59e0b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '8px' }}>
                            📞 Zəng: {remoteNumber}
                        </span>
                        <button onClick={hangupCall} style={{ width: '24px', height: '24px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                            <PhoneOff size={12} />
                        </button>
                    </div>
                )}

                {callState === 'Active' && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: 0,
                        backgroundColor: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)',
                        borderRadius: '8px', padding: '2px 8px'
                    }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#7c3aed', marginRight: '4px', flexShrink: 0 }}>{formatDuration(duration)}</span>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '8px', color: s.text || '#fff' }}>
                            👤 {remoteNumber}
                        </span>
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                            <button onClick={toggleMute} style={{ width: '24px', height: '24px', backgroundColor: mute ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: mute ? '#ef4444' : (s.text || '#fff'), border: 'none', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                {mute ? <VolumeX size={12} /> : <Volume2 size={12} />}
                            </button>
                            <button onClick={hangupCall} style={{ width: '24px', height: '24px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <PhoneOff size={12} />
                            </button>
                        </div>
                    </div>
                )}

                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    style={{
                        width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'transparent',
                        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: s.text || '#9ca3af', cursor: 'pointer', flexShrink: 0
                    }}
                >
                    <Settings size={13} />
                </button>
            </div>

            {showSettings && (
                <div style={{
                    display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: s.navBg || 'rgba(0,0,0,0.2)',
                    border: `1px solid ${s.border || 'transparent'}`, borderRadius: '8px', padding: '8px', marginTop: '8px', width: '100%'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <input 
                            style={{ height: '28px', fontSize: '10px', padding: '0 6px', backgroundColor: s.cardBg, color: s.text, border: `1px solid ${s.border}`, borderRadius: '4px' }}
                            placeholder="SIP User (Məs: 101)" 
                            value={sipUser} 
                            onChange={(e) => setSipUser(e.target.value)} 
                        />
                        <input 
                            style={{ height: '28px', fontSize: '10px', padding: '0 6px', backgroundColor: s.cardBg, color: s.text, border: `1px solid ${s.border}`, borderRadius: '4px' }}
                            type="password"
                            placeholder="SIP Şifrə" 
                            value={sipPass} 
                            onChange={(e) => setSipPass(e.target.value)} 
                        />
                        <input 
                            style={{ height: '28px', fontSize: '10px', padding: '0 6px', backgroundColor: s.cardBg, color: s.text, border: `1px solid ${s.border}`, borderRadius: '4px' }}
                            placeholder="SIP Registrar" 
                            value={sipHost} 
                            onChange={(e) => setSipHost(e.target.value)} 
                        />
                        <input 
                            style={{ height: '28px', fontSize: '10px', padding: '0 6px', backgroundColor: s.cardBg, color: s.text, border: `1px solid ${s.border}`, borderRadius: '4px' }}
                            placeholder="Websocket URL" 
                            value={wsUrl} 
                            onChange={(e) => setWsUrl(e.target.value)} 
                        />
                    </div>
                    <button onClick={saveSettings} style={{ height: '28px', fontSize: '10px', fontWeight: 'bold', width: '100%', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Yadda Saxla
                    </button>
                </div>
            )}

            {status === 'Disconnected' && !sipUser && (
                <div style={{
                    marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '6px', fontSize: '9px',
                    color: '#ef4444', lineHeight: 1.2, width: '100%'
                }}>
                    <ShieldAlert size={12} style={{ flexShrink: 0 }} />
                    <span>Zəng üçün dişli çarxa klikləyərək АТС məlumatlarını daxil edin.</span>
                </div>
            )}
        </div>
    );
};

export default SipPhone;
