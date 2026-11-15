'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  Swords,
  Shield,
  Trash2,
  Copy,
  Check,
  ArrowRight,
  X,
  ExternalLink,
} from 'lucide-react';
import { useRankedSystem } from '../RankedContext';
import { getDivisionColor } from '../rankedEngine';
import { FriendUser } from '../types';

export const FriendsManagerCard: React.FC = () => {
  const router = useRouter();
  const {
    friends,
    addFriend,
    removeFriend,
    sendDirectChallenge,
    activeChallenge,
    clearChallenge,
  } = useRankedSystem();

  const [newUsername, setNewUsername] = useState('');
  const [addFeedback, setAddFeedback] = useState<string | null>(null);
  const [hasCopiedRoom, setHasCopiedRoom] = useState(false);

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    const success = addFriend(newUsername.trim());
    if (success) {
      setAddFeedback(`Added @${newUsername.trim()} as a friend!`);
      setNewUsername('');
    } else {
      setAddFeedback('User is already in your friends list or invalid.');
    }

    setTimeout(() => {
      setAddFeedback(null);
    }, 3000);
  };

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setHasCopiedRoom(true);
      setTimeout(() => setHasCopiedRoom(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Card: Friends List Header & Quick Add */}
      <div className="rounded-3xl border border-surface-border bg-surface p-6 sm:p-8 shadow-neon-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>Rivals & Comrades</span>
              </span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                {friends.length} Friends
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Friends Network</h2>
            <p className="mt-1 text-xs text-slate-400">
              Track your friends&apos; live typing status, division ranks, and challenge them to instant 1v1 duels.
            </p>
          </div>

          {/* Add Friend Form */}
          <form onSubmit={handleAddFriend} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Username..."
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="rounded-xl border border-surface-border bg-surface-muted px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all font-mono"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-neon-cyan transition-all active:scale-95 flex-shrink-0"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {addFeedback && (
          <div className="mt-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-2 text-xs text-cyan-300 font-medium">
            {addFeedback}
          </div>
        )}

        {/* Friends Roster Table/Cards */}
        <div className="mt-6 divide-y divide-surface-border">
          {friends.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No friends added yet. Add a username above to start building your network!
            </div>
          ) : (
            friends.map((friend) => {
              const divStyle = getDivisionColor(friend.division);
              return (
                <div
                  key={friend.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Avatar with Status Indicator */}
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-muted text-white font-mono font-bold text-sm border border-surface-border">
                        {friend.avatarSeed}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface ${
                          friend.status === 'online'
                            ? 'bg-emerald-400 animate-pulse'
                            : friend.status === 'racing'
                            ? 'bg-cyan-400 animate-pulse'
                            : 'bg-slate-600'
                        }`}
                        title={`Status: ${friend.status}`}
                      />
                    </div>

                    {/* Friend Identity & Stats */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{friend.displayName}</span>
                        <span className="text-xs text-slate-400 font-mono">@{friend.username}</span>
                        <span
                          className={`rounded-full px-2 py-0.2 text-[10px] font-bold border ${divStyle.border} ${divStyle.bg} ${divStyle.text}`}
                        >
                          {friend.division}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2.5 text-xs text-slate-400 font-mono">
                        <span>{friend.mmr} MMR</span>
                        <span>•</span>
                        <span>Peak {friend.peakWpm} WPM</span>
                        <span>•</span>
                        <span
                          className={
                            friend.status === 'online'
                              ? 'text-emerald-400'
                              : friend.status === 'racing'
                              ? 'text-cyan-400'
                              : 'text-slate-500'
                          }
                        >
                          {friend.status === 'racing'
                            ? 'In a Match'
                            : friend.status === 'online'
                            ? 'Online'
                            : friend.lastSeen || 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => sendDirectChallenge(friend)}
                      className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all active:scale-95"
                    >
                      <Swords className="h-3.5 w-3.5" />
                      <span>Challenge 1v1</span>
                    </button>

                    <button
                      onClick={() => removeFriend(friend.id)}
                      className="rounded-xl border border-surface-border bg-surface-muted/40 p-2 text-slate-500 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                      title="Remove Friend"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Direct Challenge Modal */}
      {activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-cyan-500/40 bg-surface p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Swords className="h-4 w-4" />
                <span>1v1 Direct Duel Created</span>
              </div>
              <button
                onClick={clearChallenge}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Private Duel Room Ready</h3>
              <p className="mt-1 text-xs text-slate-400">
                Share this room code with your friend, or enter the room now to await their arrival!
              </p>
            </div>

            {/* Room Code Display */}
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Duel Room Code
                </div>
                <div className="font-mono text-2xl font-black text-cyan-400 tracking-wider">
                  {activeChallenge.roomCode}
                </div>
              </div>
              <button
                onClick={() => handleCopyCode(activeChallenge.roomCode)}
                className="flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white transition-all"
              >
                {hasCopiedRoom ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const code = activeChallenge.roomCode;
                  clearChallenge();
                  router.push(`/compete?room=${code}`);
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-neon-cyan transition-all active:scale-95"
              >
                <span>Enter Duel Room</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={clearChallenge}
                className="rounded-xl border border-surface-border bg-surface-muted px-4 py-3 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
