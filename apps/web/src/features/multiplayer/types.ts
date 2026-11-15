import {
  MultiplayerRoom,
  RoomChatMessage,
  RoomConfig,
  RoomParticipant,
  RaceSubmission,
} from '@keysmasher/shared';

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'simulated';

export interface UseMultiplayerRoomReturn {
  room: MultiplayerRoom | null;
  currentParticipant: RoomParticipant | null;
  isHost: boolean;
  connectionStatus: ConnectionStatus;
  countdownRemaining: number;
  chatMessages: RoomChatMessage[];
  error: string | null;
  clearError: () => void;
  createRoom: (config?: Partial<RoomConfig>) => Promise<boolean>;
  joinRoom: (roomCode: string) => Promise<boolean>;
  leaveRoom: () => void;
  toggleReady: (isReady?: boolean) => void;
  updateConfig: (config: Partial<RoomConfig>) => void;
  addBot: (difficulty?: 'easy' | 'medium' | 'hard' | 'demon') => void;
  kickBot: (botId: string) => void;
  startRace: () => void;
  sendProgress: (progress: number, currentWpm: number, accuracy: number) => void;
  sendFinish: (submission: RaceSubmission) => void;
  sendRematch: () => void;
  sendChat: (text: string) => void;
  setLocalRoom: (room: MultiplayerRoom | null) => void;
}
