'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Crown,
  Bot,
  User,
  Play,
  LogOut,
  Share2,
  Plus,
  Trash2,
  Send,
  MessageSquare,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { BOT_PRESETS, MultiplayerRoom, RoomChatMessage } from '@keysmasher/shared';

interface RoomLobbyViewProps {
  room: MultiplayerRoom;
  currentParticipantId: string;
  isHost: boolean;
  onStartRace: () => void;
  onToggleReady: () => void;
  onLeaveRoom: () => void;
  onAddBot: (difficulty: 'easy' | 'medium' | 'hard' | 'demon') => void;
  onKickBot: (botId: string) => void;
  chatMessages: RoomChatMessage[];
  onSendChat: (text: string) => void;
  connectionStatus: string;
}

export function RoomLobbyView({
  room,
  currentParticipantId,
  isHost,
  onStartRace,
  onToggleReady,
  onLeaveRoom,
  onAddBot,
  onKickBot,
  chatMessages,
  onSendChat,
  connectionStatus,
}: RoomLobbyViewProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showBotMenu, setShowBotMenu] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const currentParticipant = room.participants.find((p) => p.id === currentParticipantId);
  const allHumansReady = room.participants
    .filter((p) => !p.isBot)
    .every((p) => p.isReady || p.isHost);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/compete?room=${room.code}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onSendChat(chatInput);
      setChatInput('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Battle Lobby Active
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-medium text-slate-400">
                {connectionStatus === 'simulated' ? 'Offline Simulated Arena' : 'Live WebSocket Sync'}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-wider text-white font-mono sm:text-3xl">
                ROOM: <span className="text-purple-400">{room.code}</span>
              </h1>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-all"
                title="Copy Room Code"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all"
                title="Share Invite Link"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Share Link'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onLeaveRoom}
              className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Leave Room</span>
            </button>
          </div>
        </div>

        {/* Room Rules & Passage Settings */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-surface-border pt-4">
          <span className="text-xs font-semibold text-slate-400 mr-1">Arena Settings:</span>
          <span className="rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-bold text-white capitalize">
            {room.config.mode === 'words' ? `${room.config.targetWords} Words` : `${room.config.targetDuration}s Time`}
          </span>
          <span className="rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-bold text-purple-300 capitalize">
            {room.config.difficulty} Difficulty
          </span>
          {room.config.punctuation && (
            <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 text-xs font-semibold text-cyan-300">
              @#$ Punctuation
            </span>
          )}
          {room.config.numbers && (
            <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 text-xs font-semibold text-cyan-300">
              123 Numbers
            </span>
          )}
          <span className="ml-auto text-xs font-semibold text-slate-500">
            {room.participants.length} / {room.config.maxPlayers} Racers
          </span>
        </div>
      </div>

      {/* Main Grid: Racers Roster (2/3) + In-Room Chat (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Racers Grid (Col Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Racers Roster ({room.participants.length})
            </h2>

            {/* Host: Add AI Ghost Typist */}
            {isHost && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowBotMenu(!showBotMenu)}
                  disabled={room.participants.length >= room.config.maxPlayers}
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all disabled:opacity-50"
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span>+ Add AI Ghost Typist</span>
                </button>

                {showBotMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-surface-border bg-surface p-2 shadow-2xl z-30">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                      Select Ghost Speed:
                    </div>
                    {BOT_PRESETS.map((bot) => (
                      <button
                        key={bot.id}
                        type="button"
                        onClick={() => {
                          onAddBot(bot.difficulty);
                          setShowBotMenu(false);
                        }}
                        className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-slate-300 hover:bg-surface-muted hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: bot.avatarColor }}
                          />
                          <span>{bot.name}</span>
                        </div>
                        <span className="font-mono text-purple-400 font-bold">{bot.targetWpm} WPM</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {room.participants.map((participant) => {
              const isMe = participant.id === currentParticipantId;

              return (
                <div
                  key={participant.id}
                  className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${
                    isMe
                      ? 'border-purple-500/50 bg-purple-950/20 shadow-neon-purple'
                      : 'border-surface-border bg-surface/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border font-bold text-sm ${
                          participant.isBot
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                            : isMe
                            ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                            : 'bg-surface-muted border-surface-border text-slate-300'
                        }`}
                      >
                        {participant.isBot ? (
                          <Bot className="h-5 w-5" />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      {participant.isHost && (
                        <div
                          className="absolute -top-1.5 -right-1.5 rounded-full bg-amber-500 p-1 text-slate-950 shadow-md"
                          title="Room Host"
                        >
                          <Crown className="h-2.5 w-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">
                          {participant.username}
                        </span>
                        {isMe && (
                          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                            (You)
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 mt-0.5">
                        {participant.isBot ? (
                          <span className="font-mono text-cyan-400">
                            AI Target: ~{participant.botSpeedWpm} WPM
                          </span>
                        ) : participant.isHost ? (
                          <span className="text-amber-400/90 font-medium">Battle Host</span>
                        ) : (
                          <span className="text-slate-500">Challenger</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Ready Badge */}
                    {participant.isReady || participant.isHost ? (
                      <div className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
                        <Check className="h-3 w-3 stroke-[3]" />
                        <span>Ready</span>
                      </div>
                    ) : (
                      <div className="rounded-full border border-surface-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-slate-400">
                        Not Ready
                      </div>
                    )}

                    {/* Kick Bot Button */}
                    {isHost && participant.isBot && (
                      <button
                        type="button"
                        onClick={() => onKickBot(participant.id)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                        title="Remove Bot"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="rounded-2xl border border-surface-border bg-surface p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-white">
                {isHost
                  ? 'All Set to Race?'
                  : currentParticipant?.isReady
                  ? 'Waiting for Host to start...'
                  : 'Ready Up to Race!'}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isHost
                  ? 'Starting triggers a synchronized 5-second countdown for all racers.'
                  : 'Let the battle host know you are in position.'}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!isHost && (
                <button
                  type="button"
                  onClick={onToggleReady}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all ${
                    currentParticipant?.isReady
                      ? 'border border-surface-border bg-surface-muted text-slate-300 hover:text-white'
                      : 'border border-emerald-500 bg-emerald-600 text-white shadow-lg hover:bg-emerald-500'
                  }`}
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>{currentParticipant?.isReady ? 'Cancel Ready' : 'Ready Up'}</span>
                </button>
              )}

              {isHost && (
                <button
                  type="button"
                  onClick={onStartRace}
                  disabled={!allHumansReady && room.participants.length > 1}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-8 py-3 text-sm font-black tracking-wide text-white shadow-neon-purple hover:bg-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>START BATTLE</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Room Chat (Col Span 1) */}
        <div className="rounded-2xl border border-surface-border bg-surface flex flex-col h-[400px]">
          <div className="p-4 border-b border-surface-border flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Arena Comms
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-500">
                <Radio className="h-6 w-6 mb-2 opacity-50" />
                <span>Room chat is quiet.</span>
                <span className="text-[11px] text-slate-600">Send a greeting or challenge!</span>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-purple-300">{msg.senderName}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="mt-0.5 rounded-lg bg-surface-muted/60 px-2.5 py-1.5 text-slate-200 inline-block max-w-full break-words">
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="p-3 border-t border-surface-border flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send quick battle message..."
              maxLength={120}
              className="flex-1 rounded-xl border border-surface-border bg-surface-muted px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="rounded-xl bg-purple-600 px-3 py-2 text-white hover:bg-purple-500 transition-colors disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
