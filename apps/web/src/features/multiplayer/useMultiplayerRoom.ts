'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BOT_PRESETS,
  DEFAULT_ROOM_CONFIG,
  MultiplayerRoom,
  RaceSubmission,
  RoomChatMessage,
  RoomConfig,
  RoomParticipant,
  WsMessage,
  calculateBotProgress,
  compareRacerRank,
  generatePassage,
  generateRoomCode,
} from '@keysmasher/shared';
import { ConnectionStatus, UseMultiplayerRoomReturn } from './types';
import { useAuth } from '@/features/auth/AuthContext';

const DEFAULT_WS_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? 'wss://localhost:3001'
    : 'ws://localhost:3001');

export function useMultiplayerRoom(): UseMultiplayerRoomReturn {
  const { user } = useAuth();
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [countdownRemaining, setCountdownRemaining] = useState<number>(5);
  const [chatMessages, setChatMessages] = useState<RoomChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const participantIdRef = useRef<string>(
    typeof window !== 'undefined'
      ? `guest-${Math.random().toString(36).substring(2, 9)}`
      : 'guest-server'
  );
  const lastProgressSentRef = useRef<number>(0);
  const simIntervalsRef = useRef<{ countdown?: NodeJS.Timeout; bots?: NodeJS.Timeout }>({});

  const username =
    user?.displayName ||
    user?.username ||
    (user?.email ? user.email.split('@')[0] : 'Guest Typist');

  const clearError = useCallback(() => setError(null), []);

  // Cleanup helper for simulated room timers
  const clearSimTimers = useCallback(() => {
    if (simIntervalsRef.current.countdown) {
      clearInterval(simIntervalsRef.current.countdown);
      simIntervalsRef.current.countdown = undefined;
    }
    if (simIntervalsRef.current.bots) {
      clearInterval(simIntervalsRef.current.bots);
      simIntervalsRef.current.bots = undefined;
    }
  }, []);

  // Send message over WebSocket
  const sendWs = useCallback(
    (type: string, payload: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const msg: WsMessage = {
          type,
          payload,
          timestamp: Date.now(),
        };
        wsRef.current.send(JSON.stringify(msg));
        return true;
      }
      return false;
    },
    []
  );

  // Initialize WebSocket connection
  const connectWs = useCallback((): Promise<boolean> => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      try {
        setConnectionStatus('connecting');
        const ws = new WebSocket(DEFAULT_WS_URL);

        const connectionTimeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            ws.close();
            setConnectionStatus('simulated');
            resolve(false);
          }
        }, 1500);

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          setConnectionStatus('connected');
          resolve(true);
        };

        ws.onmessage = (event) => {
          try {
            const data: WsMessage<any> = JSON.parse(event.data);
            const { type, payload } = data;

            switch (type) {
              case 'room:state_update':
                setRoom(payload);
                if (payload.countdownRemaining !== undefined) {
                  setCountdownRemaining(payload.countdownRemaining);
                }
                break;
              case 'race:countdown_tick':
                setCountdownRemaining(payload.secondsRemaining);
                break;
              case 'race:started':
                setCountdownRemaining(0);
                break;
              case 'race:player_progress':
                setRoom((prev) => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    participants: prev.participants.map((p) =>
                      p.id === payload.participantId
                        ? {
                            ...p,
                            progress: payload.progress,
                            currentWpm: payload.currentWpm,
                            accuracy: payload.accuracy,
                          }
                        : p
                    ),
                  };
                });
                break;
              case 'race:player_finished':
                setRoom((prev) => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    participants: prev.participants.map((p) =>
                      p.id === payload.participantId
                        ? {
                            ...p,
                            isFinished: true,
                            placement: payload.placement,
                            currentWpm: payload.finalWpm,
                            accuracy: payload.accuracy,
                            finishTimeSeconds: payload.finishTimeSeconds,
                          }
                        : p
                    ),
                  };
                });
                break;
              case 'race:all_finished':
                setRoom((prev) => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    status: 'FINISHED',
                    participants: payload.finalResults || prev.participants,
                  };
                });
                break;
              case 'room:chat_message':
                setChatMessages((prev) => [...prev.slice(-49), payload]);
                break;
              case 'room:error':
                setError(payload.message || 'An unexpected room error occurred.');
                break;
              default:
                break;
            }
          } catch {
            // Ignore malformed payloads
          }
        };

        ws.onerror = () => {
          clearTimeout(connectionTimeout);
          setConnectionStatus('simulated');
          resolve(false);
        };

        ws.onclose = () => {
          wsRef.current = null;
          setConnectionStatus((curr) => (curr === 'connected' ? 'disconnected' : curr));
        };

        wsRef.current = ws;
      } catch {
        setConnectionStatus('simulated');
        resolve(false);
      }
    });
  }, []);

  // Teardown on unmount
  useEffect(() => {
    return () => {
      clearSimTimers();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [clearSimTimers]);

  // Create room
  const createRoom = useCallback(
    async (customConfig?: Partial<RoomConfig>): Promise<boolean> => {
      clearError();
      const connected = await connectWs();

      const config: RoomConfig = {
        ...DEFAULT_ROOM_CONFIG,
        ...customConfig,
      };

      if (connected) {
        return sendWs('room:create', {
          config,
          username,
          userId: user?.id,
        });
      }

      // Simulated local room fallback
      const roomCode = generateRoomCode();
      const passage = generatePassage({
        mode: config.mode,
        targetWordCount: (config.targetWords as 10 | 25 | 50 | 100) || 25,
        durationSeconds: (config.targetDuration as 15 | 30 | 60 | 120) || 30,
        difficulty: config.difficulty,
        includePunctuation: config.punctuation,
        includeNumbers: config.numbers,
      });

      const hostParticipant: RoomParticipant = {
        id: participantIdRef.current,
        userId: user?.id,
        username,
        avatarUrl: user?.avatarUrl,
        isHost: true,
        isReady: true,
        progress: 0,
        currentWpm: 0,
        accuracy: 100,
        isFinished: false,
      };

      // Automatically add a demo bot racer in simulated mode so solo players have a race target!
      const botPreset = BOT_PRESETS[1]; // Cadence Bot (65 WPM)
      const botParticipant: RoomParticipant = {
        id: `bot-cadence-${Date.now()}`,
        username: `${botPreset.name} [BOT]`,
        isHost: false,
        isReady: true,
        progress: 0,
        currentWpm: 0,
        accuracy: botPreset.accuracy,
        isFinished: false,
        isBot: true,
        botSpeedWpm: botPreset.targetWpm,
      };

      const localRoom: MultiplayerRoom = {
        id: `local-room-${roomCode}`,
        code: roomCode,
        hostId: participantIdRef.current,
        status: 'WAITING',
        config,
        passage,
        participants: [hostParticipant, botParticipant],
        countdownRemaining: 5,
        createdAt: Date.now(),
      };

      setRoom(localRoom);
      setConnectionStatus('simulated');
      return true;
    },
    [clearError, connectWs, sendWs, username, user?.id, user?.avatarUrl]
  );

  // Join room
  const joinRoom = useCallback(
    async (roomCode: string): Promise<boolean> => {
      clearError();
      const normalizedCode = roomCode.trim().toUpperCase();
      if (!normalizedCode) {
        setError('Please enter a valid room code.');
        return false;
      }

      const connected = await connectWs();
      if (connected) {
        return sendWs('room:join', {
          roomCode: normalizedCode,
          username,
          userId: user?.id,
        });
      }

      // Simulated room join
      setError('Cannot connect to live server. Entering offline simulated arena.');
      return false;
    },
    [clearError, connectWs, sendWs, username, user?.id]
  );

  // Leave room
  const leaveRoom = useCallback(() => {
    clearSimTimers();
    if (room) {
      sendWs('room:leave', { roomCode: room.code });
    }
    setRoom(null);
    setChatMessages([]);
  }, [clearSimTimers, room, sendWs]);

  // Toggle ready
  const toggleReady = useCallback(
    (isReady?: boolean) => {
      if (!room) return;

      if (sendWs('room:ready', { roomCode: room.code, isReady })) {
        return;
      }

      // Local simulated update
      setRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.id === participantIdRef.current
              ? { ...p, isReady: isReady !== undefined ? isReady : !p.isReady }
              : p
          ),
        };
      });
    },
    [room, sendWs]
  );

  // Update config
  const updateConfig = useCallback(
    (newConfig: Partial<RoomConfig>) => {
      if (!room) return;

      if (sendWs('room:update_config', { roomCode: room.code, config: newConfig })) {
        return;
      }

      // Local simulated config update
      const updatedConfig = { ...room.config, ...newConfig };
      const newPassage = generatePassage({
        mode: updatedConfig.mode,
        targetWordCount: (updatedConfig.targetWords as 10 | 25 | 50 | 100) || 25,
        durationSeconds: (updatedConfig.targetDuration as 15 | 30 | 60 | 120) || 30,
        difficulty: updatedConfig.difficulty,
        includePunctuation: updatedConfig.punctuation,
        includeNumbers: updatedConfig.numbers,
      });

      setRoom((prev) => (prev ? { ...prev, config: updatedConfig, passage: newPassage } : null));
    },
    [room, sendWs]
  );

  // Add bot
  const addBot = useCallback(
    (difficulty: 'easy' | 'medium' | 'hard' | 'demon' = 'medium') => {
      if (!room) return;

      if (sendWs('room:add_bot', { roomCode: room.code, difficulty })) {
        return;
      }

      const preset =
        BOT_PRESETS.find((b) => b.difficulty === difficulty) || BOT_PRESETS[1];

      const botParticipant: RoomParticipant = {
        id: `bot-${preset.difficulty}-${Date.now()}`,
        username: `${preset.name} [BOT]`,
        isHost: false,
        isReady: true,
        progress: 0,
        currentWpm: 0,
        accuracy: preset.accuracy,
        isFinished: false,
        isBot: true,
        botSpeedWpm: preset.targetWpm,
      };

      setRoom((prev) =>
        prev ? { ...prev, participants: [...prev.participants, botParticipant] } : null
      );
    },
    [room, sendWs]
  );

  // Kick bot
  const kickBot = useCallback(
    (botId: string) => {
      if (!room) return;

      if (sendWs('room:kick_bot', { roomCode: room.code, botId })) {
        return;
      }

      setRoom((prev) =>
        prev
          ? {
              ...prev,
              participants: prev.participants.filter((p) => p.id !== botId),
            }
          : null
      );
    },
    [room, sendWs]
  );

  // Start race
  const startRace = useCallback(() => {
    if (!room) return;

    if (sendWs('race:start', { roomCode: room.code })) {
      return;
    }

    // Local simulated race countdown and progression
    clearSimTimers();
    setCountdownRemaining(5);

    setRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'COUNTDOWN',
        countdownRemaining: 5,
        participants: prev.participants.map((p) => ({
          ...p,
          progress: 0,
          currentWpm: 0,
          isFinished: false,
          finishTimeSeconds: undefined,
          placement: undefined,
        })),
      };
    });

    let currentCount = 5;
    simIntervalsRef.current.countdown = setInterval(() => {
      currentCount -= 1;
      setCountdownRemaining(currentCount);

      if (currentCount <= 0) {
        clearInterval(simIntervalsRef.current.countdown);
        simIntervalsRef.current.countdown = undefined;

        const startTime = Date.now();
        setRoom((prev) => (prev ? { ...prev, status: 'RACING', raceStartTime: startTime } : null));

        // Start bot loop
        simIntervalsRef.current.bots = setInterval(() => {
          setRoom((prev) => {
            if (!prev || prev.status !== 'RACING') {
              clearInterval(simIntervalsRef.current.bots);
              return prev;
            }

            const elapsedSeconds = (Date.now() - startTime) / 1000;
            const updated = prev.participants.map((p, idx) => {
              if (!p.isBot || p.isFinished) return p;

              const tick = calculateBotProgress(
                elapsedSeconds,
                p.botSpeedWpm || 65,
                prev.passage.length,
                idx + 1
              );

              const isFinishingNow = tick.isFinished && !p.isFinished;
              return {
                ...p,
                progress: tick.progress,
                currentWpm: tick.currentWpm,
                isFinished: tick.isFinished,
                finishTimeSeconds: isFinishingNow
                  ? Math.round(elapsedSeconds * 10) / 10
                  : p.finishTimeSeconds,
              };
            });

            // Dynamically assign placements among finished racers by Speed + Accuracy composite score
            const finishedRacers = updated
              .filter((x) => x.isFinished)
              .sort(compareRacerRank);

            finishedRacers.forEach((x, idx) => {
              x.placement = idx + 1;
            });

            const allFinished = updated.every((p) => p.isFinished);
            if (allFinished) {
              const finalSorted = [...updated].sort(compareRacerRank);
              finalSorted.forEach((x, idx) => {
                x.placement = idx + 1;
              });
            }

            return {
              ...prev,
              status: allFinished ? 'FINISHED' : prev.status,
              participants: updated,
            };
          });
        }, 300);
      }
    }, 1000);
  }, [clearSimTimers, room, sendWs]);

  // Send progress (throttled ~150ms)
  const sendProgress = useCallback(
    (progress: number, currentWpm: number, accuracy: number) => {
      if (!room || room.status !== 'RACING') return;

      const now = Date.now();
      if (now - lastProgressSentRef.current < 150 && progress < 100) {
        return;
      }
      lastProgressSentRef.current = now;

      if (sendWs('race:progress', { roomCode: room.code, progress, currentWpm, accuracy })) {
        return;
      }

      // Local simulated participant progress
      setRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.id === participantIdRef.current
              ? {
                  ...p,
                  progress: Math.min(100, Math.max(0, Math.round(progress * 10) / 10)),
                  currentWpm: Math.round(currentWpm),
                  accuracy: Math.round(accuracy * 10) / 10,
                }
              : p
          ),
        };
      });
    },
    [room, sendWs]
  );

  // Send finish
  const sendFinish = useCallback(
    (submission: RaceSubmission) => {
      if (!room || room.status !== 'RACING') return;

      if (sendWs('race:finish', submission)) {
        return;
      }

      // Local simulated race finish
      setRoom((prev) => {
        if (!prev) return null;

        const updated = prev.participants.map((p) =>
          p.id === participantIdRef.current
            ? {
                ...p,
                isFinished: true,
                progress: 100,
                currentWpm: Math.round(submission.finalWpm),
                accuracy: Math.round(submission.accuracy * 10) / 10,
                finishTimeSeconds: Math.round(submission.durationSeconds * 10) / 10,
              }
            : p
        );

        // Dynamically assign placements among finished racers by Speed + Accuracy composite score
        const finishedRacers = updated
          .filter((x) => x.isFinished)
          .sort(compareRacerRank);

        finishedRacers.forEach((x, idx) => {
          x.placement = idx + 1;
        });

        const allFinished = updated.every((p) => p.isFinished);
        if (allFinished) {
          const finalSorted = [...updated].sort(compareRacerRank);
          finalSorted.forEach((x, idx) => {
            x.placement = idx + 1;
          });
        }

        return {
          ...prev,
          status: allFinished ? 'FINISHED' : prev.status,
          participants: updated,
        };
      });
    },
    [room, sendWs]
  );

  // Rematch
  const sendRematch = useCallback(() => {
    if (!room) return;

    if (sendWs('room:rematch', { roomCode: room.code })) {
      return;
    }

    clearSimTimers();
    const newPassage = generatePassage({
      mode: room.config.mode,
      targetWordCount: (room.config.targetWords as 10 | 25 | 50 | 100) || 25,
      durationSeconds: (room.config.targetDuration as 15 | 30 | 60 | 120) || 30,
      difficulty: room.config.difficulty,
      includePunctuation: room.config.punctuation,
      includeNumbers: room.config.numbers,
    });

    setCountdownRemaining(5);
    setRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'WAITING',
        passage: newPassage,
        countdownRemaining: 5,
        raceStartTime: undefined,
        participants: prev.participants.map((p) => ({
          ...p,
          isReady: p.isHost || p.isBot ? true : false,
          progress: 0,
          currentWpm: 0,
          isFinished: false,
          finishTimeSeconds: undefined,
          placement: undefined,
        })),
      };
    });
  }, [clearSimTimers, room, sendWs]);

  // Send chat
  const sendChat = useCallback(
    (text: string) => {
      if (!room || !text.trim()) return;

      const trimmed = text.trim().slice(0, 150);
      if (sendWs('room:chat', { roomCode: room.code, text: trimmed })) {
        return;
      }

      setChatMessages((prev) => [
        ...prev.slice(-49),
        {
          id: `local-msg-${Date.now()}`,
          senderId: participantIdRef.current,
          senderName: username,
          text: trimmed,
          timestamp: Date.now(),
        },
      ]);
    },
    [room, sendWs, username]
  );

  const currentParticipant =
    room?.participants.find((p) => p.id === participantIdRef.current) || null;
  const isHost = currentParticipant?.isHost ?? false;

  return {
    room,
    currentParticipant,
    isHost,
    connectionStatus,
    countdownRemaining,
    chatMessages,
    error,
    clearError,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    updateConfig,
    addBot,
    kickBot,
    startRace,
    sendProgress,
    sendFinish,
    sendRematch,
    sendChat,
    setLocalRoom: setRoom,
  };
}
