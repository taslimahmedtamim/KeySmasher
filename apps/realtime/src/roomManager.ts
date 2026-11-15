import {
  BOT_PRESETS,
  DEFAULT_ROOM_CONFIG,
  MultiplayerRoom,
  RaceSubmission,
  RoomConfig,
  RoomParticipant,
  calculateBotProgress,
  generatePassage,
  generateRoomCode,
  validateRaceSubmission,
} from '@keysmasher/shared';

export type BroadcastFunction = (
  roomCode: string,
  event: string,
  payload: any
) => void;

export class RoomManager {
  private rooms: Map<string, MultiplayerRoom> = new Map();
  private countdownTimers: Map<string, NodeJS.Timeout> = new Map();
  private botTimers: Map<string, NodeJS.Timeout> = new Map();

  public getRoom(roomCode: string): MultiplayerRoom | undefined {
    return this.rooms.get(roomCode.toUpperCase());
  }

  public getAllRooms(): MultiplayerRoom[] {
    return Array.from(this.rooms.values());
  }

  public getActiveRoomCount(): number {
    return this.rooms.size;
  }

  /**
   * Generates a passage matching the given room configuration.
   */
  private generateRoomPassage(config: RoomConfig): string {
    return generatePassage({
      mode: config.mode,
      targetWordCount: (config.targetWords as 10 | 25 | 50 | 100) || 25,
      durationSeconds: (config.targetDuration as 15 | 30 | 60 | 120) || 30,
      difficulty: config.difficulty || 'intermediate',
      includePunctuation: config.punctuation || false,
      includeNumbers: config.numbers || false,
    });
  }

  /**
   * Creates a new multiplayer room and establishes the caller as the host.
   */
  public createRoom(
    hostInfo: { id: string; username: string; userId?: string },
    customConfig?: Partial<RoomConfig>
  ): MultiplayerRoom {
    let roomCode = generateRoomCode();
    while (this.rooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    const config: RoomConfig = {
      ...DEFAULT_ROOM_CONFIG,
      ...customConfig,
    };

    const passage = this.generateRoomPassage(config);

    const hostParticipant: RoomParticipant = {
      id: hostInfo.id,
      userId: hostInfo.userId,
      username: hostInfo.username,
      isHost: true,
      isReady: true, // Host is ready by default
      progress: 0,
      currentWpm: 0,
      accuracy: 100,
      isFinished: false,
    };

    const room: MultiplayerRoom = {
      id: `room-${Date.now()}-${roomCode}`,
      code: roomCode,
      hostId: hostInfo.id,
      status: 'WAITING',
      config,
      passage,
      participants: [hostParticipant],
      countdownRemaining: 5,
      createdAt: Date.now(),
    };

    this.rooms.set(roomCode, room);
    return room;
  }

  /**
   * Adds a participant to an existing room.
   */
  public joinRoom(
    roomCode: string,
    participantInfo: { id: string; username: string; userId?: string }
  ): { success: boolean; room?: MultiplayerRoom; error?: string } {
    const normalizedCode = roomCode.trim().toUpperCase();
    const room = this.rooms.get(normalizedCode);

    if (!room) {
      return { success: false, error: 'Room not found. Check the room code and try again.' };
    }

    if (room.status === 'RACING') {
      return { success: false, error: 'A race is already in progress in this room.' };
    }

    if (room.participants.length >= room.config.maxPlayers) {
      return { success: false, error: 'This room is currently full.' };
    }

    // Check if participant already exists in room
    const existingIndex = room.participants.findIndex(
      (p) => p.id === participantInfo.id || (p.userId && p.userId === participantInfo.userId)
    );

    if (existingIndex >= 0) {
      // Reconnection: update participant id and return room
      room.participants[existingIndex].id = participantInfo.id;
      return { success: true, room };
    }

    const newParticipant: RoomParticipant = {
      id: participantInfo.id,
      userId: participantInfo.userId,
      username: participantInfo.username,
      isHost: false,
      isReady: false,
      progress: 0,
      currentWpm: 0,
      accuracy: 100,
      isFinished: false,
    };

    room.participants.push(newParticipant);
    return { success: true, room };
  }

  /**
   * Removes a participant from a room and handles host migration or room deletion.
   */
  public leaveRoom(
    roomCode: string,
    participantId: string
  ): { room?: MultiplayerRoom; deleted: boolean } {
    const normalizedCode = roomCode.trim().toUpperCase();
    const room = this.rooms.get(normalizedCode);
    if (!room) {
      return { deleted: false };
    }

    // Filter out participant
    room.participants = room.participants.filter((p) => p.id !== participantId);

    // If only bots remain or empty, clear room and timers
    const humanParticipants = room.participants.filter((p) => !p.isBot);
    if (humanParticipants.length === 0) {
      this.clearRoomTimers(normalizedCode);
      this.rooms.delete(normalizedCode);
      return { deleted: true };
    }

    // If host left, elect new host
    if (room.hostId === participantId) {
      const nextHost = humanParticipants[0];
      nextHost.isHost = true;
      room.hostId = nextHost.id;
    }

    return { room, deleted: false };
  }

  /**
   * Toggles or sets participant ready state.
   */
  public toggleReady(
    roomCode: string,
    participantId: string,
    forcedReady?: boolean
  ): MultiplayerRoom | null {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'WAITING') return null;

    const participant = room.participants.find((p) => p.id === participantId);
    if (!participant) return null;

    participant.isReady = forcedReady !== undefined ? forcedReady : !participant.isReady;
    return room;
  }

  /**
   * Updates room configuration (Host only).
   */
  public updateConfig(
    roomCode: string,
    participantId: string,
    newConfig: Partial<RoomConfig>
  ): MultiplayerRoom | null {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'WAITING' || room.hostId !== participantId) {
      return null;
    }

    room.config = {
      ...room.config,
      ...newConfig,
    };

    // Regenerate passage to match new difficulty or length
    room.passage = this.generateRoomPassage(room.config);
    return room;
  }

  /**
   * Adds an AI Bot racer to the room.
   */
  public addBot(
    roomCode: string,
    participantId: string,
    difficulty: 'easy' | 'medium' | 'hard' | 'demon' = 'medium'
  ): MultiplayerRoom | null {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'WAITING' || room.hostId !== participantId) {
      return null;
    }

    if (room.participants.length >= room.config.maxPlayers) {
      return null;
    }

    const preset =
      BOT_PRESETS.find((b) => b.difficulty === difficulty) || BOT_PRESETS[1];

    const botId = `bot-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const botParticipant: RoomParticipant = {
      id: botId,
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

    room.participants.push(botParticipant);
    return room;
  }

  /**
   * Removes an AI Bot racer from the room.
   */
  public removeBot(
    roomCode: string,
    participantId: string,
    botId: string
  ): MultiplayerRoom | null {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'WAITING' || room.hostId !== participantId) {
      return null;
    }

    room.participants = room.participants.filter((p) => p.id !== botId);
    return room;
  }

  /**
   * Initiates the synchronized 5-second countdown and begins the race.
   */
  public startRace(roomCode: string, hostParticipantId: string, broadcast: BroadcastFunction): boolean {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'WAITING' || room.hostId !== hostParticipantId) {
      return false;
    }

    // Reset all participants for the new race
    room.status = 'COUNTDOWN';
    room.countdownRemaining = 5;
    room.participants.forEach((p) => {
      p.progress = 0;
      p.currentWpm = 0;
      p.isFinished = false;
      p.finishTimeSeconds = undefined;
      p.placement = undefined;
    });

    this.clearRoomTimers(room.code);
    broadcast(room.code, 'room:state_update', room);

    // 1-second countdown tick interval
    const countdownInterval = setInterval(() => {
      room.countdownRemaining -= 1;
      broadcast(room.code, 'race:countdown_tick', { secondsRemaining: room.countdownRemaining });

      if (room.countdownRemaining <= 0) {
        clearInterval(countdownInterval);
        this.countdownTimers.delete(room.code);

        // Transition to RACING
        room.status = 'RACING';
        room.raceStartTime = Date.now();
        broadcast(room.code, 'race:started', {
          passage: room.passage,
          startTime: room.raceStartTime,
        });
        broadcast(room.code, 'room:state_update', room);

        // Start bot loop if room contains bot participants
        this.startBotLoop(room, broadcast);
      }
    }, 1000);

    this.countdownTimers.set(room.code, countdownInterval);
    return true;
  }

  /**
   * Starts periodic progress ticks for AI Bot racers.
   */
  private startBotLoop(room: MultiplayerRoom, broadcast: BroadcastFunction) {
    const bots = room.participants.filter((p) => p.isBot);
    if (bots.length === 0) return;

    const botInterval = setInterval(() => {
      if (room.status !== 'RACING' || !room.raceStartTime) {
        clearInterval(botInterval);
        this.botTimers.delete(room.code);
        return;
      }

      const elapsedSeconds = (Date.now() - room.raceStartTime) / 1000;
      let allBotsFinished = true;

      bots.forEach((bot, index) => {
        if (bot.isFinished) return;

        const targetWpm = bot.botSpeedWpm || 65;
        const tick = calculateBotProgress(
          elapsedSeconds,
          targetWpm,
          room.passage.length,
          index + 1
        );

        bot.progress = tick.progress;
        bot.currentWpm = tick.currentWpm;

        broadcast(room.code, 'race:player_progress', {
          participantId: bot.id,
          progress: bot.progress,
          currentWpm: bot.currentWpm,
          accuracy: bot.accuracy,
        });

        if (tick.isFinished && !bot.isFinished) {
          bot.isFinished = true;
          bot.finishTimeSeconds = Math.round(elapsedSeconds * 10) / 10;
          const currentFinishedCount = room.participants.filter((p) => p.isFinished).length;
          bot.placement = currentFinishedCount;

          broadcast(room.code, 'race:player_finished', {
            participantId: bot.id,
            placement: bot.placement,
            finalWpm: bot.currentWpm,
            accuracy: bot.accuracy,
            finishTimeSeconds: bot.finishTimeSeconds,
          });
        } else {
          allBotsFinished = false;
        }
      });

      // Check if all racers in room are finished
      const allFinished = room.participants.every((p) => p.isFinished);
      if (allFinished) {
        clearInterval(botInterval);
        this.botTimers.delete(room.code);
        room.status = 'FINISHED';
        broadcast(room.code, 'race:all_finished', {
          finalResults: room.participants,
        });
        broadcast(room.code, 'room:state_update', room);
      }
    }, 400);

    this.botTimers.set(room.code, botInterval);
  }

  /**
   * Handles live typing progress from a racer.
   */
  public handleProgress(
    roomCode: string,
    participantId: string,
    progress: number,
    currentWpm: number,
    accuracy: number
  ): MultiplayerRoom | null {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'RACING') return null;

    const participant = room.participants.find((p) => p.id === participantId);
    if (!participant || participant.isFinished) return null;

    participant.progress = Math.min(100, Math.max(0, Math.round(progress * 10) / 10));
    participant.currentWpm = Math.max(0, Math.round(currentWpm));
    participant.accuracy = Math.min(100, Math.max(0, Math.round(accuracy * 10) / 10));

    return room;
  }

  /**
   * Handles race completion submission with anti-cheat validation.
   */
  public handleFinish(
    roomCode: string,
    submission: RaceSubmission,
    broadcast: BroadcastFunction
  ): { room: MultiplayerRoom; placement: number } | null {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'RACING') return null;

    const participant = room.participants.find((p) => p.id === submission.participantId);
    if (!participant || participant.isFinished) return null;

    // Run anti-cheat verification
    const validation = validateRaceSubmission(submission, room.passage);
    if (!validation.isValid) {
      broadcast(room.code, 'room:error', {
        message: `Submission rejected: ${validation.reason}`,
      });
      return null;
    }

    participant.isFinished = true;
    participant.progress = 100;
    participant.currentWpm = Math.round(submission.finalWpm);
    participant.accuracy = Math.round(submission.accuracy * 10) / 10;
    participant.finishTimeSeconds = Math.round(submission.durationSeconds * 10) / 10;

    // Assign placement based on finishing order
    const finishedCount = room.participants.filter((p) => p.isFinished).length;
    participant.placement = finishedCount;

    broadcast(room.code, 'race:player_finished', {
      participantId: participant.id,
      placement: participant.placement,
      finalWpm: participant.currentWpm,
      accuracy: participant.accuracy,
      finishTimeSeconds: participant.finishTimeSeconds,
    });

    // If all participants have finished, transition to FINISHED
    const allFinished = room.participants.every((p) => p.isFinished);
    if (allFinished) {
      this.clearRoomTimers(room.code);
      room.status = 'FINISHED';
      broadcast(room.code, 'race:all_finished', {
        finalResults: room.participants,
      });
    }

    broadcast(room.code, 'room:state_update', room);
    return { room, placement: participant.placement };
  }

  /**
   * Resets the room for a rematch while keeping participants.
   */
  public rematch(roomCode: string, hostParticipantId: string): MultiplayerRoom | null {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'FINISHED' || room.hostId !== hostParticipantId) {
      return null;
    }

    this.clearRoomTimers(room.code);

    room.status = 'WAITING';
    room.countdownRemaining = 5;
    room.raceStartTime = undefined;
    room.passage = this.generateRoomPassage(room.config);

    room.participants.forEach((p) => {
      p.isReady = p.isHost || p.isBot ? true : false;
      p.progress = 0;
      p.currentWpm = 0;
      p.isFinished = false;
      p.finishTimeSeconds = undefined;
      p.placement = undefined;
    });

    return room;
  }

  /**
   * Cleans up all intervals associated with a room.
   */
  public clearRoomTimers(roomCode: string) {
    const countdown = this.countdownTimers.get(roomCode);
    if (countdown) {
      clearInterval(countdown);
      this.countdownTimers.delete(roomCode);
    }

    const botTimer = this.botTimers.get(roomCode);
    if (botTimer) {
      clearInterval(botTimer);
      this.botTimers.delete(roomCode);
    }
  }

  /**
   * Shuts down all rooms and intervals (used during server shutdown).
   */
  public destroy() {
    this.rooms.forEach((_, code) => {
      this.clearRoomTimers(code);
    });
    this.rooms.clear();
  }
}
