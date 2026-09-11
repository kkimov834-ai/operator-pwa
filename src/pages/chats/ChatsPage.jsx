import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import { ChatService } from '../../services/chat.service';
import { useRole } from '../../hooks/useRole';
import SipPhone from './SipPhone';
import './ChatsPage.css';
import { useNavBarContext } from '../../components/NavBarContext';
import { ChevronLeft } from 'lucide-react';
import { Send, MessageSquare, AlertCircle, CheckCheck, Loader2, Paperclip, Mic, SlidersHorizontal, Volume2, VolumeX, PhoneOff } from 'lucide-react';




const SOCKET_URL = typeof import.meta !== "undefined" && import.meta.env?.VITE_SOCKET_URL 
    ? import.meta.env.VITE_SOCKET_URL 
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5001' // Lokal serveriniz (Node.js/Socket.io) yoxdursa ERR_CONNECTION_REFUSED verəcək
        : `${window.location.protocol}//${window.location.hostname}`);

const MessageMedia = ({ mediaUrl, text, isOperator }) => {
    // Временный обход проблемного CDN-домена для всех медиафайлов
    const targetUrl = mediaUrl && mediaUrl.includes('cdn.beinsystems.az')
        ? mediaUrl.replace('cdn.beinsystems.az', 'beinsystemsaz.fra1.cdn.digitaloceanspaces.com')
        : mediaUrl;

    if (!targetUrl) return null;

    const ext = targetUrl.split('?')[0].split('.').pop().toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
        return (
            <div className="flex flex-col gap-1">
                <img 
                    src={targetUrl} 
                    alt={text} 
                    className="max-w-full max-h-[220px] rounded-lg cursor-zoom-in border border-border/30"
                    onClick={() => window.open(targetUrl, '_blank')}
                />
                {text && text !== 'Fotoşəkil / Фотография' && text !== 'Photo' && <span className="text-xs mt-1 block">{text}</span>}
            </div>
        );
    } else if (['mp3', 'wav', 'ogg', 'webm', 'oga'].includes(ext)) {
        return (
            <div className="flex flex-col gap-1 w-[240px] max-w-full">
                <audio src={targetUrl} controls className="w-full h-8 mt-1" />
            </div>
        );
    } else {
        return (
            <div className="flex items-center gap-2 bg-black/5 p-2 rounded-lg border border-border/20">
                <Paperclip size={14} className="shrink-0" />
                <a 
                    href={targetUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`text-xs font-semibold underline break-all ${isOperator ? 'text-primary-foreground' : 'text-primary'}`}
                >
                    {text || 'Faylı Yüklə'}
                </a>
            </div>
        );
    }
};

const ChatsPage = () => {
    const { isSu } = useRole();
    const { themeStyles } = useNavBarContext();
    const s = themeStyles || {};
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [onlineClients, setOnlineClients] = useState(new Set());
    const [clientTyping, setClientTyping] = useState({}); // client_id -> boolean

    const [socketConnected, setSocketConnected] = useState(false);
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);
    const selectedChatRef = useRef(selectedChat);
    const messagesContainerRef = useRef(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const messagesRef = useRef(messages);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const [expandedGroups, setExpandedGroups] = useState({});
    const [isUploading, setIsUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);

    const [activeOperators, setActiveOperators] = useState([]);
    const [currentOperatorStatus, setCurrentOperatorStatus] = useState('free');

    // WebRTC Call States & Refs
    const [incomingCall, setIncomingCall] = useState(null);
    const [activeCall, setActiveCall] = useState(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isCallMuted, setIsCallMuted] = useState(false);

    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const callMediaRecorderRef = useRef(null);
    const callAudioChunksRef = useRef([]);
    const callAudioContextRef = useRef(null);
    const callTimerIntervalRef = useRef(null);
    const activeCallRef = useRef(null);
    const ringtoneIntervalRef = useRef(null);
    const ringtoneAudioContextRef = useRef(null);

    const [ownerFilter, setOwnerFilter] = useState('mine_and_queue');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showFilters, setShowFilters] = useState(false);

    // Мгновенная привязка и открытие чата при отправке сообщений
    const eagerlyAttachAndOpenChat = () => {
        if (!selectedChatRef.current) return;
        if (selectedChatRef.current.status === 'closed' || selectedChatRef.current.operator === null) {
            const updated = { ...selectedChatRef.current, status: 'open', operator: operatorName };
            setSelectedChat(updated);
            setChats(prev => prev.map(c => c.client_id === selectedChatRef.current.client_id ? updated : c));
        }
    };

    // Синхронизируем selectedChat с рефом
    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    const handleStatusChange = useCallback((status) => {
        setCurrentOperatorStatus(status);
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('change_operator_status', { status });
        }
    }, []);

    // === АВТОМАТИЧЕСКИЙ ПЕРЕХОД В СТАТУС "AWAY" (ФАСИЛЯ/ПЕРЕРЫВ) ПРИ НЕАКТИВНОСТИ ===
    useEffect(() => {
        if (!socketConnected || currentOperatorStatus !== 'free') return;

        let idleTimer = null;
        const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 минут

        const resetIdleTimer = () => {
            if (idleTimer) clearTimeout(idleTimer);
            
            idleTimer = setTimeout(() => {
                console.log('[Idle Tracker] Operator is idle. Switching to break.');
                handleStatusChange('away');
                toast.warning('Qeyri-aktiv olduğuna görə statusunuz "Fasilə" olaraq dəyişdirildi / Вы переведены в статус "Перерыв" из-за неактивности');
            }, IDLE_TIMEOUT);
        };

        const events = ['mousemove', 'keypress', 'mousedown', 'scroll', 'touchstart'];
        events.forEach(event => {
            window.addEventListener(event, resetIdleTimer);
        });

        resetIdleTimer();

        return () => {
            if (idleTimer) clearTimeout(idleTimer);
            events.forEach(event => {
                window.removeEventListener(event, resetIdleTimer);
            });
        };
    }, [socketConnected, currentOperatorStatus, handleStatusChange]);

    const toggleGroup = (groupName) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    const handleClaimChat = (clientId) => {
        if (socketRef.current && socketRef.current.connected) {
            setSelectedChat(prev => prev ? { ...prev, operator: operatorName } : null);
            setChats(prev => prev.map(c => c.client_id === clientId ? { ...c, operator: operatorName } : c));
            socketRef.current.emit('claim_chat', { client_id: clientId });
        }
    };

    const handleTransferChat = (clientId, targetOperator) => {
        if (socketRef.current && socketRef.current.connected) {
            setSelectedChat(null);
            setMessages([]);
            setChats(prev => prev.filter(c => c.client_id !== clientId));
            socketRef.current.emit('transfer_chat', { client_id: clientId, target_operator: targetOperator });
        }
    };

    const loadMoreMessages = () => {
        if (!selectedChat || loadingMore || !hasMoreMessages) return;

        const oldestMsg = messagesRef.current.find(m => m.id && m.id < 10000000000);
        if (!oldestMsg) {
            setHasMoreMessages(false);
            return;
        }

        setLoadingMore(true);
        const container = messagesContainerRef.current;
        const oldScrollHeight = container ? container.scrollHeight : 0;

        socketRef.current.emit('get_chat_messages', {
            client_id: selectedChat.client_id,
            before_id: oldestMsg.id,
            limit: 50
        }, (olderMessages) => {
            setLoadingMore(false);
            if (olderMessages && olderMessages.length > 0) {
                setMessages(prev => [...olderMessages, ...prev]);

                setTimeout(() => {
                    if (container) {
                        container.scrollTop = container.scrollHeight - oldScrollHeight;
                    }
                }, 10);

                if (olderMessages.length < 50) {
                    setHasMoreMessages(false);
                }
            } else {
                setHasMoreMessages(false);
            }
        });
    };

    const handleScroll = (e) => {
        const { scrollTop } = e.currentTarget;
        if (scrollTop === 0 && messagesRef.current.length > 0 && !loadingMore && hasMoreMessages) {
            loadMoreMessages();
        }
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedChat || !socketConnected) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('account', selectedChat.account || 'support');

        setIsUploading(true);
        try {
            const res = await fetch(`${SOCKET_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                eagerlyAttachAndOpenChat();
                socketRef.current.emit('operator_message', {
                    client_id: selectedChat.client_id,
                    client_name: selectedChat.client_name,
                    channel: selectedChat.channel,
                    text: file.name,
                    media_url: data.url,
                    account: selectedChat.account
                });

                setMessages((prev) => [...prev, {
                    id: Date.now() + Math.random(),
                    sender_type: 'operator',
                    text: file.name,
                    media_url: data.url,
                    created_at: new Date().toISOString()
                }]);
            } else {
                alert('Fayl yüklənə bilmədi.');
            }
        } catch (err) {
            console.error('File upload failed:', err);
            alert('Fayl yüklənərkən xəта baş verdi.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const startAudioRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            let options = {};
            if (MediaRecorder.isTypeSupported('audio/webm')) {
                options = { mimeType: 'audio/webm' };
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                options = { mimeType: 'audio/mp4' };
            } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
                options = { mimeType: 'audio/ogg' };
            }

            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const mimeType = mediaRecorder.mimeType || 'audio/webm';
                const ext = mimeType.includes('mp4') ? 'mp4' : (mimeType.includes('ogg') ? 'ogg' : 'webm');

                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                const file = new File([audioBlob], `voice_${Date.now()}.${ext}`, { type: mimeType });

                const formData = new FormData();
                formData.append('file', file);
                formData.append('account', selectedChat.account || 'support');

                try {
                    const res = await fetch(`${SOCKET_URL}/upload`, {
                        method: 'POST',
                        body: formData
                    });
                    const data = await res.json();
                    if (data.url) {
                        eagerlyAttachAndOpenChat();
                        socketRef.current.emit('operator_message', {
                            client_id: selectedChat.client_id,
                            client_name: selectedChat.client_name,
                            channel: selectedChat.channel,
                            text: 'Səsli mesaj / Голосовое сообщение',
                            media_url: data.url,
                            account: selectedChat.account
                        });

                        setMessages((prev) => [...prev, {
                            id: Date.now() + Math.random(),
                            sender_type: 'operator',
                            text: 'Səsli mesaj / Голосовое сообщение',
                            media_url: data.url,
                            created_at: new Date().toISOString()
                        }]);
                    }
                } catch (err) {
                    console.error('Voice upload failed:', err);
                }

                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start(250); // timeslice 250ms гарантирует сбор данных
            setIsRecording(true);
            setRecordingSeconds(0);
            
            recordingIntervalRef.current = setInterval(() => {
                setRecordingSeconds(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Failed to access microphone:', err);
            alert('Mikrofona icazə verilmədi.');
        }
    };

    const stopAudioRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        clearInterval(recordingIntervalRef.current);
    };

    // Получаем имя оператора из токена SSO
    const [operatorName, setOperatorName] = useState(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const u = decoded.userData || {};
                const login = u.login || '';
                const name = u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || login || 'Operator';
                
                // Если есть и имя, и логин, и они разные, делаем "Имя (логин)"
                if (login && name && name !== login) {
                    return `${name} (${login})`;
                }
                return name || login || 'Operator';
            } catch (e) {
                return 'Operator';
            }
        }
        return 'Operator';
    });

    // Автоматический скролл вниз
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, clientTyping]);

    // Загрузка списка чатов с PHP бэкенда
    const loadChatsList = async () => {
        const isConnected = socketRef.current && socketRef.current.connected;
        if (isConnected) {
            socketRef.current.emit('get_active_chats', {}, (activeChats) => {
                setChats(activeChats || []);
                setLoadingChats(false);
            });
        } else {
            try {
                setLoadingChats(true);
                const activeChats = await ChatService.getActiveChats();
                setChats(activeChats || []);
            } catch (error) {
                console.error('Failed to load active chats:', error);
            } finally {
                setLoadingChats(false);
            }
        }
    };

    // Загрузка сообщений конкретного чата
    const loadChatHistory = async (chat) => {
        if (!chat) return;
        setLoadingMessages(true);
        setSelectedChat(chat);
        
        // Локально сбрасываем счетчик непрочитанных
        setChats((prev) =>
            prev.map((c) =>
                c.client_id === chat.client_id ? { ...c, unread_count: 0 } : c
            )
        );
        
        const isConnected = socketRef.current && socketRef.current.connected;
        if (isConnected) {
            setHasMoreMessages(true);
            setLoadingMore(false);
            socketRef.current.emit('read_chat', { client_id: chat.client_id });
            socketRef.current.emit('get_chat_messages', { client_id: chat.client_id }, (history) => {
                setMessages(history || []);
                setLoadingMessages(false);
            });
        } else {
            try {
                const history = await ChatService.getMessages(chat.id);
                setMessages(history || []);
            } catch (error) {
                console.error('Failed to load messages:', error);
            } finally {
                setLoadingMessages(false);
            }
        }
    };

    // === СИНТЕТИЧЕСКИЙ РИНГТОН ДЛЯ ВХОДЯЩИХ ЗВОНКОВ ===
    const playIncomingRingtone = () => {
        try {
            if (ringtoneAudioContextRef.current) return;
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioCtx();
            ringtoneAudioContextRef.current = audioCtx;

            const playTone = () => {
                if (!ringtoneAudioContextRef.current) return;
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
            console.error('[ChatsPage] Failed to play synthetic ringtone:', e);
        }
    };

    const stopIncomingRingtone = () => {
        if (ringtoneIntervalRef.current) {
            clearInterval(ringtoneIntervalRef.current);
            ringtoneIntervalRef.current = null;
        }
        if (ringtoneAudioContextRef.current) {
            ringtoneAudioContextRef.current.close().catch(() => {});
            ringtoneAudioContextRef.current = null;
        }
    };

    // === МИКШИРОВАНИЕ И ЗАПИСЬ ЗВОНКА ===
    const startCallRecording = (localStream, remoteStream) => {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContextClass();
            callAudioContextRef.current = audioCtx;

            const localSource = audioCtx.createMediaStreamSource(localStream);
            const remoteSource = audioCtx.createMediaStreamSource(remoteStream);

            const destination = audioCtx.createMediaStreamDestination();

            localSource.connect(destination);
            remoteSource.connect(destination);

            const mixedStream = destination.stream;

            let options = {};
            if (MediaRecorder.isTypeSupported('audio/webm')) {
                options = { mimeType: 'audio/webm' };
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                options = { mimeType: 'audio/mp4' };
            } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
                options = { mimeType: 'audio/ogg' };
            }

            const mediaRecorder = new MediaRecorder(mixedStream, options);
            callMediaRecorderRef.current = mediaRecorder;
            callAudioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    callAudioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const actualMime = mediaRecorder.mimeType || 'audio/webm';
                const ext = actualMime.includes('mp4') ? 'm4a' : (actualMime.includes('ogg') ? 'ogg' : 'webm');
                const audioBlob = new Blob(callAudioChunksRef.current, { type: actualMime });

                if (audioBlob.size < 100) {
                    console.warn('[Operator Recording] Blob too small, skipping upload');
                    return;
                }

                const file = new File([audioBlob], `call_record_${Date.now()}.${ext}`, { type: actualMime });
                const formData = new FormData();
                formData.append('file', file);

                const currentCallInfo = activeCallRef.current;
                if (!currentCallInfo) {
                    console.warn('[Operator Recording] No active call info for recording');
                    return;
                }
                
                formData.append('account', currentCallInfo.account || 'support');

                try {
                    const res = await fetch(`${SOCKET_URL}/upload`, {
                        method: 'POST',
                        body: formData
                    });
                    const resData = await res.json();

                    if (resData.url && socketRef.current && socketRef.current.connected) {
                        socketRef.current.emit('operator_message', {
                            client_id: currentCallInfo.client_id,
                            client_name: currentCallInfo.client_name,
                            channel: 'widget',
                            text: '📞 Zəngin səsyazısı / Запись звонка',
                            media_url: resData.url,
                            account: currentCallInfo.account
                        });
                    }
                } catch (err) {
                    console.error('[Operator Recording] Failed to upload recording:', err);
                }
            };

            mediaRecorder.start(250);
            console.log('[Operator Recording] Recording started');
        } catch (e) {
            console.error('[Operator Recording] Failed to mix and record stream:', e);
        }
    };

    // === ОЧИСТКА ЗВОНКА ===
    const cleanupCall = () => {
        stopIncomingRingtone();

        if (callTimerIntervalRef.current) {
            clearInterval(callTimerIntervalRef.current);
            callTimerIntervalRef.current = null;
        }

        if (callMediaRecorderRef.current && callMediaRecorderRef.current.state !== 'inactive') {
            callMediaRecorderRef.current.stop();
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        if (peerConnectionRef.current) {
            try {
                peerConnectionRef.current.getSenders().forEach(sender => {
                    if (sender.track) sender.track.stop();
                });
                peerConnectionRef.current.getReceivers().forEach(receiver => {
                    if (receiver.track) receiver.track.stop();
                });
            } catch (e) {
                console.warn('[Operator WebRTC] Error stopping tracks:', e);
            }
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (callAudioContextRef.current) {
            callAudioContextRef.current.close().catch(() => {});
            callAudioContextRef.current = null;
        }

        const remoteAudio = document.getElementById('comm-remote-audio-el');
        if (remoteAudio) {
            remoteAudio.remove();
        }

        setIncomingCall(null);
        setActiveCall(null);
        activeCallRef.current = null;
        setCallDuration(0);
        setIsCallMuted(false);

        handleStatusChange('free');
    };

    // === НАСТРОЙКА WEBRTC ЗВОНКА НА СТОРОНЕ ОПЕРАТОРА ===
    const setupOperatorWebRTC = async (incoming) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;

            const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
            const pc = new RTCPeerConnection(configuration);
            peerConnectionRef.current = pc;

            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            pc.onicecandidate = (event) => {
                if (event.candidate && socketRef.current && socketRef.current.connected) {
                    socketRef.current.emit('webrtc_signal', {
                        target_socket: incoming.socket_id,
                        signal: { candidate: event.candidate }
                    });
                }
            };

            pc.ontrack = (event) => {
                console.log('[Operator WebRTC] Received remote audio track');
                const remoteStream = event.streams[0];
                
                const remoteAudio = document.createElement('audio');
                remoteAudio.srcObject = remoteStream;
                remoteAudio.autoplay = true;
                remoteAudio.id = 'comm-remote-audio-el';
                document.body.appendChild(remoteAudio);

                startCallRecording(stream, remoteStream);
            };

            socketRef.current.emit('call_accept', { target_socket: incoming.socket_id });

            const clientChat = chats.find(c => c.client_id === incoming.client_id) || {};
            const callInfo = {
                client_id: incoming.client_id,
                client_name: incoming.client_name,
                socket_id: incoming.socket_id,
                account: clientChat.account || 'support'
            };
            setActiveCall(callInfo);
            activeCallRef.current = callInfo;
            
            handleStatusChange('busy');

            setCallDuration(0);
            callTimerIntervalRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('[Operator WebRTC] Failed to set up WebRTC call:', err);
            cleanupCall();
        }
    };

    const toggleCallMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsCallMuted(!isCallMuted);
        }
    };

    const handleAcceptCall = () => {
        if (!incomingCall) return;
        stopIncomingRingtone();
        setupOperatorWebRTC(incomingCall);
        setIncomingCall(null);
    };

    const handleDeclineCall = () => {
        if (!incomingCall) return;
        stopIncomingRingtone();
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('call_hangup', { target_socket: incomingCall.socket_id });
        }
        setIncomingCall(null);
    };

    const handleHangupActiveCall = () => {
        const currentCall = activeCallRef.current;
        if (currentCall && socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('call_hangup', { target_socket: currentCall.socket_id });
        }
        cleanupCall();
    };

    // Соединение с сокет-хабом
    useEffect(() => {
        const socket = io(SOCKET_URL, {
            transports: ['polling', 'websocket']
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            setSocketConnected(true);
            socket.emit('register_operator', { name: operatorName });
            loadChatsList();
        });

        socket.on('disconnect', () => {
            setSocketConnected(false);
        });

        // Получение списка активных чатов из памяти сокета
        socket.on('active_chats_list', (data) => {
            setChats(data || []);
            setLoadingChats(false);
        });

        // Получение списка клиентов, которые сейчас онлайн
        socket.on('online_clients_list', (data) => {
            setOnlineClients(new Set(data || []));
        });

        // Получение списка активных операторов
        socket.on('active_operators_list', (data) => {
            setActiveOperators(data || []);
        });

        // Получение сообщений в реальном времени
        socket.on('message_received', (data) => {
            const currentSelected = selectedChatRef.current;
            if (currentSelected && currentSelected.client_id === data.client_id) {
                setMessages((prev) => [...prev, {
                    id: Date.now() + Math.random(),
                    sender_type: data.sender_type,
                    text: data.text,
                    media_url: data.media_url || null,
                    created_at: new Date().toISOString()
                }]);
            }
        });

        // Изменение онлайн статуса клиентов
        socket.on('client_status_change', (data) => {
            setOnlineClients((prev) => {
                const next = new Set(prev);
                if (data.status === 'online') {
                    next.add(data.client_id);
                } else {
                    next.delete(data.client_id);
                }
                return next;
            });
        });

        // Статус печати клиента
        socket.on('typing', (data) => {
            setClientTyping((prev) => ({
                ...prev,
                [data.client_id]: data.is_typing
            }));
        });

        // Входящие звонки
        socket.on('call_incoming', (data) => {
            console.log('[Operator Hub] Incoming WebRTC call:', data);
            setIncomingCall(data);
            playIncomingRingtone();
        });

        // WebRTC Сигнализация
        socket.on('webrtc_signal', async (data) => {
            console.log('[Operator Hub] Received WebRTC signal:', data);
            const pc = peerConnectionRef.current;
            if (!pc) return;
            
            const { signal } = data;
            if (signal.sdp) {
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                    if (signal.sdp.type === 'offer') {
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        socket.emit('webrtc_signal', {
                            target_socket: data.sender_socket,
                            signal: { sdp: answer }
                        });
                    }
                } catch (e) {
                    console.error('[Operator WebRTC] Error setting remote description / creating answer:', e);
                }
            } else if (signal.candidate) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
                } catch (e) {
                    console.error('[Operator WebRTC] Error adding ICE candidate:', e);
                }
            }
        });

        // Завершение звонка клиентом
        socket.on('call_hungup', () => {
            console.log('[Operator Hub] Call hung up by client');
            cleanupCall();
        });

        return () => {
            cleanupCall();
            socket.disconnect();
        };
    }, [operatorName]);



    // Отправка сообщения клиенту
    const handleSendMessage = () => {
        if (!inputText.trim() || !selectedChat || !socketConnected) return;

        const text = inputText.trim();

        eagerlyAttachAndOpenChat();

        // 1. Отправляем через сокет
        socketRef.current.emit('operator_message', {
            client_id: selectedChat.client_id,
            client_name: selectedChat.client_name,
            channel: selectedChat.channel,
            text: text,
            account: selectedChat.account
        });

        // 2. Отображаем у себя мгновенно
        setMessages((prev) => [...prev, {
            id: Date.now(),
            sender_type: 'operator',
            text: text,
            created_at: new Date().toISOString()
        }]);

        setInputText('');
        socketRef.current.emit('typing', { client_id: selectedChat.client_id, is_typing: false });
    };

    // Статус ввода ("Оператор пишет...")
    let typingTimeout = null;
    const handleInputChange = (e) => {
        setInputText(e.target.value);
        if (!socketConnected || !selectedChat) return;

        socketRef.current.emit('typing', { client_id: selectedChat.client_id, is_typing: true });

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socketRef.current.emit('typing', { client_id: selectedChat.client_id, is_typing: false });
        }, 2000);
    };

    // Закрытие чата (завершение обслуживания)
    const handleCloseChat = async (chatId, clientId) => {
        if (!window.confirm('Bu söhbəti tamamlamaq istədiyinizdən əminsiniz?')) return;
        
        if (socketConnected && clientId) {
            socketRef.current.emit('close_chat', { client_id: clientId }, () => {
                setSelectedChat(null);
                setMessages([]);
            });
        } else {
            try {
                await ChatService.closeChat(chatId);
                setSelectedChat(null);
                setMessages([]);
                loadChatsList();
            } catch (error) {
                console.error('Failed to close chat:', error);
            }
        }
    };

    // Полное удаление чата для su роли
    const handleDeleteChat = async (chatId, clientId) => {
        console.log('[Frontend] Запрос на удаление чата. chatId:', chatId, 'clientId:', clientId);
        if (!window.confirm('DİQQƏT: Bu söhbəti və bütün mesaj tarixçəsini (keşini) tamamilə silmək istədiyinizdən əminsiniz? Bu əməliyyat geri qaytarıla bilməz!')) return;
        try {
            const res = await ChatService.deleteChat(chatId, clientId);
            console.log('[Frontend] Результат удаления чата с бэкенда:', res);
            setSelectedChat(null);
            setMessages([]);
            loadChatsList();
        } catch (error) {
            console.error('[Frontend] Ошибка при удалении чата:', error);
        }
    };

    return (
        <div className="flex flex-col flex-1 gap-4 overflow-hidden h-full w-full mobile-chat-container" style={{ 
            '--card-bg': s?.cardBg || '#1e1b2e',
            '--card-bg-60': s?.cardBg ? `${s.cardBg}99` : 'rgba(30, 27, 46, 0.6)',
            '--bg-color': s?.navBg || '#161424',
            '--bg-color-50': s?.navBg ? `${s.navBg}80` : 'rgba(22, 20, 36, 0.5)',
            '--text-color': s?.text || '#ffffff',
            '--border-color': s?.border || '#2d2b3b',
            '--primary-color': '#7c3aed',
            '--text-muted': '#9ca3af',
            '--bg-muted': 'rgba(255,255,255,0.05)',
        }}>
            {/* Панель активного WebRTC звонка */}
            {activeCall && (
                <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex justify-between items-center shrink-0 shadow-lg animate-in slide-in-from-top duration-200">
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-3.5 w-3.5 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                        </span>
                        <div>
                            <div className="text-sm font-bold text-foreground">
                                Aktivi Zəng: <span className="text-primary font-extrabold">{activeCall.client_name}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                                Danışıq müddəti: <span className="font-bold text-emerald-500">{Math.floor(callDuration / 60).toString().padStart(2, '0')}:{Math.floor(callDuration % 60).toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            variant="ghost"
                            size="icon"
                            onClick={toggleCallMute}
                            className={`w-9 h-9 rounded-xl hover:bg-muted shrink-0 ${isCallMuted ? 'text-destructive bg-destructive/10 hover:bg-destructive/20 animate-pulse' : 'text-muted-foreground'}`}
                        >
                            {isCallMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                        <button
                            variant="destructive"
                            size="sm"
                            onClick={handleHangupActiveCall}
                            className="font-bold h-9 rounded-xl flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4"
                        >
                            <PhoneOff size={14} /> Asın
                        </button>
                    </div>
                </div>
            )}

            <div className="mobile-chat-container">
            {/* Левая часть: список чатов и телефон */}
            <div className="flex flex-col w-full md:w-[320px] lg:w-[380px] gap-4 shrink-0 overflow-hidden h-full">
                {/* Компонент АТС SIP-телефона */}
                <SipPhone />

                {/* Список активных обращений */}
                <div className="flex flex-col flex-1 bg-card/60 backdrop-blur-md border border-border/80 rounded-2xl overflow-hidden shadow-lg">
                    <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/10">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <MessageSquare size={16} /> Aktivi Çatlar
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                            {!socketConnected ? (
                                <span className="flex items-center text-xs text-destructive font-semibold gap-1 bg-destructive/10 px-2 py-0.5 rounded-full">
                                    <AlertCircle size={12} /> Oflayn
                                </span>
                            ) : (
                                <select
                                    value={currentOperatorStatus}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="h-7 rounded-full border border-border bg-background/50 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider focus:outline-none transition-colors cursor-pointer text-foreground"
                                >
                                    <option value="free">🟢 Sərbəst</option>
                                    <option value="away">🟡 Fasilə</option>
                                    <option value="busy">🔴 Məşğul</option>
                                    <option value="offline">⚫ Oflayn</option>
                                </select>
                            )}
                            {socketConnected && (
                                <button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`w-7 h-7 rounded-lg hover:bg-muted shrink-0 ${showFilters ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
                                >
                                    <SlidersHorizontal size={13} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Блок фильтров (сворачиваемый) */}
                    {showFilters && (
                        <div className="p-3 border-b border-border/40 bg-muted/5 flex flex-col gap-2 shrink-0 animate-in slide-in-from-top duration-150">
                            <div className="flex gap-2">
                                <select
                                    value={ownerFilter}
                                    onChange={(e) => setOwnerFilter(e.target.value)}
                                    className="flex-1 h-8 rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-semibold focus:outline-none transition-colors cursor-pointer text-muted-foreground"
                                >
                                    <option value="mine_and_queue">Növbə və Mənim</option>
                                    <option value="mine">Yalnız Mənim</option>
                                    <option value="queue">Yalnız Növbədəki</option>
                                    <option value="all">Bütün Operatorlar</option>
                                    {Array.from(new Set(chats.map(c => c.operator).filter(Boolean))).map(op => (
                                        <option key={op} value={op}>👤 {op}</option>
                                    ))}
                                </select>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-[110px] h-8 rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-semibold focus:outline-none transition-colors cursor-pointer text-muted-foreground"
                                >
                                    <option value="all">Bütün statuslar</option>
                                    <option value="open">Açıq (Aktiv)</option>
                                    <option value="closed">Bağlı (Tamam)</option>
                                </select>
                            </div>
                            
                            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground px-1">
                                <span>Sıralama:</span>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="h-6 rounded bg-transparent border-0 focus:outline-none transition-colors cursor-pointer text-primary font-bold"
                                >
                                    <option value="desc">⏱️ Yenidən köhnəyə</option>
                                    <option value="asc">⏱️ Köhnədən yeniyə</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto">
                        {loadingChats ? (
                            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground gap-2">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p className="text-xs">Söhbətlər yüklənir...</p>
                            </div>
                        ) : chats.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full min-h-[200px]">
                                <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
                                <p className="text-xs font-semibold">Aktiv söhbət yoxdur</p>
                            </div>
                        ) : (
                            <div className="p-2 flex flex-col gap-2">
                                {Object.entries(
                                    chats
                                    .filter(chat => {
                                        // 1. Фильтр по статусу
                                        if (statusFilter === 'open' && chat.status !== 'open') return false;
                                        if (statusFilter === 'closed' && chat.status !== 'closed') return false;

                                        // 2. Фильтр по владельцу
                                        if (ownerFilter === 'mine_and_queue') {
                                            return chat.operator === null || chat.operator === operatorName;
                                        }
                                        if (ownerFilter === 'mine') {
                                            return chat.operator === operatorName;
                                        }
                                        if (ownerFilter === 'queue') {
                                            return chat.operator === null && chat.status === 'open';
                                        }
                                        if (ownerFilter === 'all') {
                                            return true;
                                        }
                                        return chat.operator === ownerFilter;
                                    })
                                    .reduce((acc, chat) => {
                                        const group = (chat.status === 'open' && chat.operator === null)
                                            ? '📥 Növbədə: ' + (chat.account || 'Müstəqil / Telegram')
                                            : (chat.account || 'Müstəqil / Telegram');
                                        if (!acc[group]) acc[group] = [];
                                        acc[group].push(chat);
                                        return acc;
                                    }, {})
                                )
                                .map(([groupName, groupChats]) => {
                                    // Сортируем чаты внутри группы по updated_at
                                    const sortedChats = [...groupChats].sort((a, b) => {
                                        const timeA = new Date(a.updated_at).getTime();
                                        const timeB = new Date(b.updated_at).getTime();
                                        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
                                    });
                                    return [groupName, sortedChats];
                                })
                                // Сортируем группы: Очередь всегда сверху, остальные по новизне
                                .sort((a, b) => {
                                    const isAQueue = a[0].startsWith('📥 Növbədə:');
                                    const isBQueue = b[0].startsWith('📥 Növbədə:');
                                    if (isAQueue && !isBQueue) return -1;
                                    if (!isAQueue && isBQueue) return 1;
                                    
                                    const maxA = Math.max(...a[1].map(c => new Date(c.updated_at).getTime()));
                                    const maxB = Math.max(...b[1].map(c => new Date(c.updated_at).getTime()));
                                    return sortOrder === 'desc' ? maxB - maxA : maxA - maxB;
                                })
                                .map(([groupName, groupChats]) => {
                                    const isExpanded = expandedGroups[groupName] !== false;
                                    const groupIcon = '🏢';
                                    
                                    // Суммируем непрочитанные и проверяем неотвеченные в группе для закрытого состояния
                                    const groupUnreadCount = groupChats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
                                    const hasGroupUnanswered = groupChats.some(chat => chat.last_sender === 'client');

                                    return (
                                        <div key={groupName} className="flex flex-col gap-1 border-b border-border/20 pb-2 last:border-0 last:pb-0">
                                            <button
                                                onClick={() => toggleGroup(groupName)}
                                                className="flex justify-between items-center px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors w-full"
                                            >
                                                <span className="truncate pr-2">{groupIcon} {groupName} ({groupChats.length})</span>
                                                <div className="flex gap-1.5 items-center shrink-0">
                                                    {hasGroupUnanswered && !isExpanded && (
                                                        <span className="text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-black shadow-sm">
                                                            Cavab gözləyir
                                                        </span>
                                                    )}
                                                    {groupUnreadCount > 0 && !isExpanded && (
                                                        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-extrabold text-[9px] shadow-sm animate-pulse">
                                                            {groupUnreadCount}
                                                        </span>
                                                    )}
                                                    <span className="text-[8px] ml-1">{isExpanded ? '▼' : '►'}</span>
                                                </div>
                                            </button>
                                            
                                            {isExpanded && (
                                                <div className="flex flex-col gap-1 pl-1">
                                                    {groupChats.map((chat) => {
                                                        const isSelected = selectedChat?.id === chat.id;
                                                        const isOpen = chat.status === 'open';
                                                        const isOnline = isOpen && (onlineClients.has(chat.client_id) || chat.channel === 'telegram');
                                                        return (
                                                            <button
                                                                key={chat.id}
                                                                onClick={() => loadChatHistory(chat)}
                                                                className={`flex flex-col p-3 rounded-xl text-left transition-all border ${
                                                                    isSelected 
                                                                        ? 'bg-primary/10 border-primary/30 shadow-sm' 
                                                                        : 'bg-transparent border-transparent hover:bg-muted/40'
                                                                } ${!isOpen ? 'opacity-60' : ''}`}
                                                            >
                                                                <div className="flex justify-between items-start w-full gap-2">
                                                                    <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                                                                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOnline ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-muted-foreground/30'}`} />
                                                                        <span className="truncate max-w-[140px]">{chat.client_name}</span>
                                                                    </div>
                                                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                                        chat.channel === 'telegram' 
                                                                            ? 'bg-sky-500/10 text-sky-500 border border-sky-500/20' 
                                                                            : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                                                                    }`}>
                                                                        {chat.channel}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center w-full mt-2 gap-2">
                                                                    <div className="text-[10px] text-muted-foreground truncate font-medium">
                                                                        ID: {chat.client_id}
                                                                    </div>
                                                                    <div className="flex gap-1.5 items-center shrink-0">
                                                                        {!isOpen ? (
                                                                            <span className="text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/20">
                                                                                Tamamlanıb
                                                                            </span>
                                                                        ) : (
                                                                            <>
                                                                                {chat.last_sender === 'client' && (
                                                                                    <span className="text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-black shadow-sm">
                                                                                        Cavab gözləyir
                                                                                    </span>
                                                                                )}
                                                                                {chat.unread_count > 0 && (
                                                                                    <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-extrabold text-[9px] shadow-sm animate-pulse">
                                                                                        {chat.unread_count}
                                                                                    </span>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

                        

            {/* Правая часть: открытый чат */}
            <div className="flex flex-col flex-1 bg-card/60 backdrop-blur-md border border-border/80 rounded-2xl overflow-hidden shadow-lg h-full">
                {selectedChat ? (
                    <div className="flex flex-col h-full relative min-h-0">
                        {/* Шапка чата */}
                        <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex justify-center items-center">
                                    {selectedChat.client_name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-foreground">{selectedChat.client_name}</div>
                                    <div className="text-xs text-muted-foreground">Kanal: <span className="font-semibold uppercase">{selectedChat.channel}</span> | ID: {selectedChat.client_id}</div>
                                </div>
                            </div>
                            <div className="flex gap-2 items-center">
                                {selectedChat.status === 'open' && selectedChat.operator === operatorName && (
                                    <div className="relative">
                                        <select
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val) {
                                                    handleTransferChat(selectedChat.client_id, val);
                                                    e.target.value = '';
                                                }
                                            }}
                                            className="h-8 rounded-lg border border-border bg-background px-3 py-1 text-xs font-semibold focus:outline-none hover:bg-muted transition-colors cursor-pointer text-muted-foreground"
                                        >
                                            <option value="">Yönləndir...</option>
                                            {activeOperators
                                                .filter(op => op.name !== operatorName && op.status !== 'offline')
                                                .map(op => (
                                                     <option key={op.socketId} value={op.name}>
                                                         👤 {op.name} ({op.status === 'free' ? 'Sərbəst' : op.status === 'away' ? 'Fasilə' : 'Məşğul'})
                                                     </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                )}
                                {selectedChat.status === 'open' && selectedChat.operator === operatorName && (
                                    <button 
                                        variant="outline" 
                                        size="sm" 
                                        className="border-destructive/40 text-destructive hover:bg-destructive/10 font-semibold h-8"
                                        onClick={() => handleCloseChat(selectedChat.id, selectedChat.client_id)}
                                    >
                                        Söhbəti Tamamla
                                    </button>
                                )}
                                {isSu && (
                                    <button 
                                        variant="destructive" 
                                        size="sm" 
                                        className="bg-red-600 hover:bg-red-700 text-white font-semibold h-8"
                                        onClick={() => handleDeleteChat(selectedChat.id, selectedChat.client_id)}
                                    >
                                        Söhbəti Sil (Keşi təmizlə)
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Сообщения */}
                        <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 min-h-0">
                            {loadingMessages ? (
                                <div className="flex justify-center items-center h-40">
                                    <Loader2 className="animate-spin text-muted-foreground" size={24} />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {loadingMore && (
                                        <div className="flex justify-center py-2">
                                            <Loader2 className="animate-spin text-muted-foreground/60" size={16} />
                                        </div>
                                    )}
                                    {messages.map((msg, i) => {
                                        if (msg.sender_type === 'system') {
                                            return (
                                                <div key={msg.id || i} className="flex justify-center w-full my-2">
                                                    <span className="text-[11px] font-semibold bg-muted/65 text-muted-foreground px-3 py-1 rounded-full border border-border/20 shadow-sm">
                                                        ⚙️ {msg.text}
                                                    </span>
                                                </div>
                                            );
                                        }
                                        const isOperator = msg.sender_type === 'operator';
                                        return (
                                            <div 
                                                key={msg.id || i} 
                                                className={`flex flex-col max-w-[75%] ${isOperator ? 'self-end items-end' : 'self-start items-start'}`}
                                            >
                                                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                                                    isOperator 
                                                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                                                        : 'bg-muted border border-border/30 rounded-bl-none text-foreground'
                                                }`}>
                                                    {msg.media_url ? (
                                                        <MessageMedia mediaUrl={msg.media_url} text={msg.text} isOperator={isOperator} />
                                                    ) : (
                                                        msg.text
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground mt-1 font-semibold">
                                                    {isOperator ? `${msg.operator_name || 'Operator'} • ` : ''} 
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    
                                    {/* Индикатор печати клиента */}
                                    {clientTyping[selectedChat.client_id] && (
                                        <div className="self-start bg-muted/50 text-muted-foreground border border-border/20 text-xs italic px-3 py-1.5 rounded-full animate-pulse">
                                            Müştəri yazır...
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Подвал для ввода */}
                        {selectedChat.status === 'open' && selectedChat.operator === null ? (
                            <div className="p-6 border-t border-border/50 bg-muted/15 flex flex-col items-center justify-center gap-3">
                                <p className="text-xs font-semibold text-muted-foreground">Bu müraciət hələ qəbul edilməyib.</p>
                                <button 
                                    onClick={() => handleClaimChat(selectedChat.client_id)} 
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center gap-2 px-6 py-2 rounded-xl shadow-md transition-all active:scale-95 animate-pulse"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" className="mr-1"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                                    Söhbəti qəbul et
                                </button>
                            </div>
                        ) : selectedChat.status === 'open' && selectedChat.operator !== operatorName ? (
                            <div className="p-6 border-t border-border/50 bg-muted/15 flex flex-col items-center justify-center gap-1.5">
                                <span className="text-lg">👤</span>
                                <p className="text-xs font-bold text-muted-foreground text-center">
                                    Bu söhbət operator <span className="text-primary font-extrabold">{selectedChat.operator}</span> tərəfindən idarə olunur.
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 border-t border-border/50 bg-muted/10 flex gap-2 items-center">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    style={{ display: 'none' }} 
                                />
                                
                                <button 
                                    size="icon" 
                                    variant="ghost"
                                    onClick={handleAttachClick}
                                    disabled={!socketConnected || isUploading}
                                    className="text-muted-foreground hover:text-primary shrink-0"
                                >
                                    {isUploading ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <Paperclip size={18} />
                                    )}
                                </button>

                                <button 
                                    size="icon" 
                                    variant="ghost"
                                    onClick={isRecording ? stopAudioRecording : startAudioRecording}
                                    disabled={!socketConnected}
                                    className={`shrink-0 ${isRecording ? 'text-destructive bg-destructive/10 hover:bg-destructive/20 animate-pulse' : 'text-muted-foreground hover:text-primary'}`}
                                >
                                    <Mic size={18} />
                                </button>

                                <input 
                                    placeholder={isRecording ? `Səs yazılır... ${Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:${(recordingSeconds % 60).toString().padStart(2, '0')}` : "Mesajınızı bura yazın..."}
                                    value={inputText}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    disabled={!socketConnected || isRecording}
                                    className="flex-1 font-medium text-sm"
                                />
                                
                                {!isRecording && (
                                    <button 
                                        size="icon" 
                                        onClick={handleSendMessage} 
                                        disabled={!inputText.trim() || !socketConnected}
                                        className="bg-primary hover:bg-primary/95 text-primary-foreground shrink-0"
                                    >
                                        <Send size={16} />
                                    </button>
                                )}
                            </div>
                        )}

                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                        <MessageSquare size={48} className="stroke-[1.5] mb-4 text-muted-foreground/50" />
                        <h3 className="font-bold text-lg text-foreground mb-1">Dəstək Çatı Paneli</h3>
                        <p className="max-w-md text-sm font-medium">
                            Müştərilərlə söhbətə başlamaq üçün soldakı aktiv çatlardan birini seçin, yaxud SIP telefondan zəng etmək üçün istifadə edin.
                        </p>
                    </div>
                )}
            </div>
        </div>

            {/* Окно входящего WebRTC звонка */}
            {incomingCall && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-in fade-in duration-200">
                    <div className="bg-card/95 border border-border/80 rounded-2xl p-6 shadow-2xl w-[320px] text-center flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex justify-center items-center text-3xl animate-pulse">
                            📞
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-foreground">Входящий звонок</h3>
                            <p className="text-sm font-semibold text-muted-foreground mt-1">{incomingCall.client_name}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">ID: {incomingCall.client_id}</p>
                        </div>
                        <div className="flex gap-4 w-full mt-2">
                            <button 
                                variant="destructive" 
                                className="flex-1 font-bold h-10 rounded-xl"
                                onClick={handleDeclineCall}
                            >
                                Отклонить
                            </button>
                            <button 
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-10 rounded-xl"
                                onClick={handleAcceptCall}
                            >
                                Принять
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatsPage;
