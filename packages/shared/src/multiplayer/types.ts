import { PassageDifficulty, TestMode } from '../types';

export type RoomStatus = 'WAITING' | 'COUNTDOWN' | 'RACING' | 'FINISHED';

export interface RoomConfig {
  mode: TestMode;
  targetDuration: number; // e.g. 15, 30, 60
  targetWords: number; // e.g. 10, 25, 50, 100
  difficulty: PassageDifficulty;
  punctuation: boolean;
  numbers: boolean;
  maxPlayers: number;
  isPrivate: boolean;
}

export interface RoomParticipant {
  id: string; // Unique socket or participant identifier
  userId?: string;
  username: string;
  avatarUrl?: string;
  isHost: boolean;
  isReady: boolean;
  progress: number; // 0 to 100 percentage
  currentWpm: number;
  accuracy: number;
  isFinished: boolean;
  finishTimeSeconds?: number;
  placement?: number;
  isBot?: boolean;
  botSpeedWpm?: number;
}

export interface RoomChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface MultiplayerRoom {
  id: string;
  code: string;
  hostId: string;
  status: RoomStatus;
  config: RoomConfig;
  passage: string;
  participants: RoomParticipant[];
  countdownRemaining: number;
  raceStartTime?: number;
  createdAt: number;
}

export interface WsMessage<T = unknown> {
  type: string;
  payload: T;
  requestId?: string;
  timestamp: number;
}

export interface RaceSubmission {
  roomCode: string;
  participantId: string;
  finalWpm: number;
  accuracy: number;
  durationSeconds: number;
  totalCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
}

export interface AntiCheatValidationResult {
  isValid: boolean;
  reason?: string;
}

export interface BotRosterPreset {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'demon';
  targetWpm: number;
  accuracy: number;
  avatarColor: string;
}
