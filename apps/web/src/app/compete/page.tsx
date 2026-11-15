'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Swords,
  Plus,
  Key,
  Trophy,
  Radio,
  Bot,
  AlertCircle,
  Shield,
  Zap,
  History,
  Medal,
} from 'lucide-react';
import {
  useMultiplayerRoom,
  RoomCreateModal,
  RoomJoinCard,
  RoomLobbyView,
  RaceCountdownOverlay,
  RaceArena,
  RacePodium,
} from '@/features/multiplayer';
import {
  LeaderboardPeriod,
  UserCompetitionStatsCard,
  LeaderboardTable,
  RecentBattlesList,
  computeCompetitionStats,
  getGlobalLeaderboard,
  getStoredRaceHistory,
} from '@/features/leaderboard';
import {
  RankedQueueCard,
  TournamentBracketView,
  FriendsManagerCard,
} from '@/features/ranked';
import { useAuth } from '@/features/auth/AuthContext';

function CompeteContent() {
  const searchParams = useSearchParams();
  const initialRoomCode = searchParams.get('room');
  const { user } = useAuth();

  const {
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
    addBot,
    kickBot,
    startRace,
    sendProgress,
    sendFinish,
    sendRematch,
    sendChat,
  } = useMultiplayerRoom();

  const [hubTab, setHubTab] = useState<
    'arena' | 'ranked' | 'tournament' | 'friends' | 'leaderboard' | 'history'
  >('arena');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>('all-time');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [raceHistory, setRaceHistory] = useState(() => getStoredRaceHistory());

  // Reload history when room is closed or finished
  useEffect(() => {
    if (!room) {
      setRaceHistory(getStoredRaceHistory());
    }
  }, [room]);

  // Auto-join if room code exists in URL
  useEffect(() => {
    if (initialRoomCode && !room) {
      joinRoom(initialRoomCode);
    }
  }, [initialRoomCode, room, joinRoom]);

  const handleJoin = async (code: string): Promise<boolean> => {
    setIsJoining(true);
    try {
      return await joinRoom(code);
    } finally {
      setIsJoining(false);
    }
  };

  const handleInstantBotMatch = async () => {
    const success = await createRoom({
      mode: 'words',
      targetWords: 25,
      difficulty: 'intermediate',
    });
    if (success) {
      setTimeout(() => {
        addBot('hard');
      }, 100);
    }
  };

  // Compute live user stats and leaderboard
  const userStats = computeCompetitionStats(raceHistory);
  const leaderboardEntries = getGlobalLeaderboard(
    leaderboardPeriod,
    'all',
    user
      ? {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          bestWpm: userStats.bestWpm,
          accuracy: userStats.avgAccuracy,
        }
      : undefined
  );

  return (
    <div className="pt-6 pb-28 sm:pt-8 sm:pb-36 min-h-screen page-enter">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Error Toast Alert */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300 shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. ROOM ACTIVE STATES */}
        {room ? (
          <div>
            {/* Synchronized Countdown Overlay */}
            {room.status === 'COUNTDOWN' && (
              <RaceCountdownOverlay secondsRemaining={countdownRemaining} />
            )}

            {/* WAITING: In Lobby */}
            {room.status === 'WAITING' && (
              <RoomLobbyView
                room={room}
                currentParticipantId={currentParticipant?.id || ''}
                isHost={isHost}
                onStartRace={startRace}
                onToggleReady={() => toggleReady()}
                onLeaveRoom={leaveRoom}
                onAddBot={addBot}
                onKickBot={kickBot}
                chatMessages={chatMessages}
                onSendChat={sendChat}
                connectionStatus={connectionStatus}
              />
            )}

            {/* COUNTDOWN or RACING: In Live Arena */}
            {(room.status === 'COUNTDOWN' || room.status === 'RACING') && (
              <RaceArena
                room={room}
                currentParticipantId={currentParticipant?.id || ''}
                onSendProgress={sendProgress}
                onSendFinish={sendFinish}
                onLeaveRoom={leaveRoom}
              />
            )}

            {/* FINISHED: Podium Rankings */}
            {room.status === 'FINISHED' && (
              <RacePodium
                room={room}
                currentParticipantId={currentParticipant?.id || ''}
                isHost={isHost}
                onRematch={sendRematch}
                onLeaveRoom={leaveRoom}
              />
            )}
          </div>
        ) : (
          /* 2. ARENA HUB (No room joined yet) */
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-surface-border pb-6 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                  <Swords className="h-3.5 w-3.5" />
                  <span>Real-Time Multiplayer Arena</span>
                </div>
                <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                  Competitive Typing Arena & Rankings
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Race live against friends, global typists, and climb the international division leaderboards.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleInstantBotMatch}
                  className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all"
                >
                  <Bot className="h-4 w-4" />
                  <span>Practice vs AI Ghost</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-neon-purple transition-all hover:bg-purple-500"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Private Room</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs (Battle Arena vs Ranked Duel vs Tournaments vs Friends vs Global Leaderboards vs My History) */}
            <div className="flex items-center border-b border-surface-border gap-2 sm:gap-6 text-sm font-bold overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setHubTab('arena')}
                className={`flex items-center gap-2 pb-3 border-b-2 whitespace-nowrap transition-all ${
                  hubTab === 'arena'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Swords className="h-4 w-4" />
                <span>Battle Arena</span>
              </button>

              <button
                type="button"
                onClick={() => setHubTab('ranked')}
                className={`flex items-center gap-2 pb-3 border-b-2 whitespace-nowrap transition-all ${
                  hubTab === 'ranked'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="h-4 w-4 text-cyan-400" />
                <span>Ranked Duel</span>
              </button>

              <button
                type="button"
                onClick={() => setHubTab('tournament')}
                className={`flex items-center gap-2 pb-3 border-b-2 whitespace-nowrap transition-all ${
                  hubTab === 'tournament'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Trophy className="h-4 w-4 text-amber-400" />
                <span>Tournaments</span>
              </button>

              <button
                type="button"
                onClick={() => setHubTab('friends')}
                className={`flex items-center gap-2 pb-3 border-b-2 whitespace-nowrap transition-all ${
                  hubTab === 'friends'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Friends & Rivals</span>
              </button>

              <button
                type="button"
                onClick={() => setHubTab('leaderboard')}
                className={`flex items-center gap-2 pb-3 border-b-2 whitespace-nowrap transition-all ${
                  hubTab === 'leaderboard'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Medal className="h-4 w-4 text-amber-300" />
                <span>Global Leaderboards</span>
              </button>

              <button
                type="button"
                onClick={() => setHubTab('history')}
                className={`flex items-center gap-2 pb-3 border-b-2 whitespace-nowrap transition-all ${
                  hubTab === 'history'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <History className="h-4 w-4 text-slate-400" />
                <span>My Battle History ({raceHistory.length})</span>
              </button>
            </div>

            {/* TAB CONTENT 1: BATTLE ARENA */}
            {hubTab === 'arena' && (
              <div className="space-y-8 animate-fade-in">
                {/* Join Card Banner */}
                <div className="max-w-2xl">
                  <RoomJoinCard onJoin={handleJoin} isLoading={isJoining} />
                </div>

                {/* Battle Features & Modes */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 pt-2">
                  <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-xl">
                    <div className="mb-4 inline-flex rounded-xl bg-purple-500/10 p-3 text-purple-400 border border-purple-500/20">
                      <Key className="h-6 w-6" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Private Battle Lobbies</h2>
                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                      Generate instant 6-character room codes. Choose word count, time duration, vocabulary difficulty, and customize punctuation or numbers.
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <Zap className="h-3.5 w-3.5" />
                      <span>Live & Ready</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-xl">
                    <div className="mb-4 inline-flex rounded-xl bg-cyan-500/10 p-3 text-cyan-400 border border-cyan-500/20">
                      <Radio className="h-6 w-6" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Synchronized Multi-Lane Race</h2>
                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                      Synchronized 5-second countdowns, subpixel hardware-accelerated typing caret, live progress broadcast, and multi-lane overtaking telemetry.
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                      <Zap className="h-3.5 w-3.5" />
                      <span>Live & Ready</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-xl">
                    <div className="mb-4 inline-flex rounded-xl bg-amber-500/10 p-3 text-amber-400 border border-amber-500/20">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Victory Podium & Rankings</h2>
                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                      Gold, Silver, Bronze victory podium with complete finish time breakdowns, WPM, and 1-click Rematch flow for non-stop battles.
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <Trophy className="h-3.5 w-3.5" />
                      <span>Live & Ready</span>
                    </div>
                  </div>
                </div>

                {/* Fair Play & Anti-Cheat Notice */}
                <div className="rounded-2xl border border-surface-border/60 bg-surface-muted/30 p-5 flex items-center gap-4 text-xs text-slate-400">
                  <Shield className="h-5 w-5 text-purple-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-300">Server-Authoritative Anti-Cheat Enabled: </span>
                    All race starts, durations, character counts, and submissions are validated against standard touch-typing physical speed bounds.
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: RANKED MATCHMAKING */}
            {hubTab === 'ranked' && (
              <div className="space-y-6 animate-fade-in">
                <RankedQueueCard />
              </div>
            )}

            {/* TAB CONTENT: TOURNAMENT BRACKETS */}
            {hubTab === 'tournament' && (
              <div className="space-y-6 animate-fade-in">
                <TournamentBracketView />
              </div>
            )}

            {/* TAB CONTENT: FRIENDS & RIVALS */}
            {hubTab === 'friends' && (
              <div className="space-y-6 animate-fade-in">
                <FriendsManagerCard />
              </div>
            )}

            {/* TAB CONTENT: GLOBAL LEADERBOARDS */}
            {hubTab === 'leaderboard' && (
              <div className="space-y-6 animate-fade-in">
                <UserCompetitionStatsCard
                  stats={userStats}
                  username={user?.displayName || user?.username || 'Guest Competitor'}
                />
                <LeaderboardTable
                  entries={leaderboardEntries}
                  period={leaderboardPeriod}
                  onPeriodChange={setLeaderboardPeriod}
                  currentUserId={user?.id}
                />
              </div>
            )}

            {/* TAB CONTENT 3: MY BATTLE HISTORY */}
            {hubTab === 'history' && (
              <div className="space-y-6 animate-fade-in">
                <UserCompetitionStatsCard
                  stats={userStats}
                  username={user?.displayName || user?.username || 'Guest Competitor'}
                />
                <RecentBattlesList
                  history={raceHistory}
                  onStartRace={() => {
                    setHubTab('arena');
                    handleInstantBotMatch();
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Create Room Modal */}
        <RoomCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={createRoom}
        />
      </div>
    </div>
  );
}

export default function CompetePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center text-sm font-semibold text-slate-400">
          Loading Arena...
        </div>
      }
    >
      <CompeteContent />
    </Suspense>
  );
}
