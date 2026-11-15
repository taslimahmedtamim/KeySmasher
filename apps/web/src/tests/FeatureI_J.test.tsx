import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CompetePage from '../app/compete/page';
import { RoomCreateModal } from '../features/multiplayer/components/RoomCreateModal';
import { RoomJoinCard } from '../features/multiplayer/components/RoomJoinCard';
import { RoomLobbyView } from '../features/multiplayer/components/RoomLobbyView';
import { RaceTrack } from '../features/multiplayer/components/RaceTrack';
import { RacePodium } from '../features/multiplayer/components/RacePodium';
import { RaceCountdownOverlay } from '../features/multiplayer/components/RaceCountdownOverlay';
import { MultiplayerRoom, RoomParticipant } from '@keysmasher/shared';

// Mock navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

// Mock AuthContext
vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-1',
      username: 'ApexTypist',
      displayName: 'Apex Typist',
      email: 'apex@keysmasher.io',
    },
    isLoading: false,
    isGuest: false,
  }),
}));

describe('Feature I & J: Real-Time Multiplayer Arena & Races', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CompetePage (Arena Hub)', () => {
    it('renders the competitive multiplayer arena hub when not in a room', () => {
      render(<CompetePage />);

      expect(screen.getByText(/Competitive Typing/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create Private Room/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Practice vs AI Ghost/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e.g. KS-9421 or B4X9Q1/i)).toBeInTheDocument();
      expect(screen.getByText(/Private Battle Lobbies/i)).toBeInTheDocument();
      expect(screen.getByText(/Synchronized Multi-Lane Race/i)).toBeInTheDocument();
      expect(screen.getByText(/Victory Podium & Rankings/i)).toBeInTheDocument();
    });

    it('opens and closes the Create Room Modal', async () => {
      render(<CompetePage />);

      const createBtn = screen.getByRole('button', { name: /Create Private Room/i });
      fireEvent.click(createBtn);

      expect(screen.getByText(/Create Private Battle Arena/i)).toBeInTheDocument();
      expect(screen.getByText(/Passage Mode/i)).toBeInTheDocument();

      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelBtn);

      expect(screen.queryByText(/Create Private Battle Arena/i)).not.toBeInTheDocument();
    });
  });

  describe('RoomCreateModal', () => {
    it('allows customizing room mode, duration, difficulty, and modifiers', async () => {
      const onCreateMock = vi.fn().mockResolvedValue(true);
      const onCloseMock = vi.fn();

      render(
        <RoomCreateModal isOpen={true} onClose={onCloseMock} onCreate={onCreateMock} />
      );

      // Change mode to time
      const timeModeBtn = screen.getByRole('button', { name: /^time$/i });
      fireEvent.click(timeModeBtn);
      expect(screen.getByText(/Time Duration/i)).toBeInTheDocument();

      // Select 60s
      const durationBtn = screen.getByRole('button', { name: /^60s$/i });
      fireEvent.click(durationBtn);

      // Select Expert difficulty
      const expertBtn = screen.getByRole('button', { name: /^expert$/i });
      fireEvent.click(expertBtn);

      // Toggle punctuation
      const punctBtn = screen.getByRole('button', { name: /@#\$ Punctuation/i });
      fireEvent.click(punctBtn);

      // Submit
      const submitBtn = screen.getByRole('button', { name: /Create Arena/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(onCreateMock).toHaveBeenCalledWith(
          expect.objectContaining({
            mode: 'time',
            targetDuration: 60,
            difficulty: 'expert',
            punctuation: true,
          })
        );
      });
    });
  });

  describe('RoomJoinCard', () => {
    it('capitalizes input and calls onJoin with clean code', () => {
      const onJoinMock = vi.fn().mockResolvedValue(true);
      render(<RoomJoinCard onJoin={onJoinMock} />);

      const input = screen.getByPlaceholderText(/e.g. KS-9421 or B4X9Q1/i);
      fireEvent.change(input, { target: { value: 'ks-7492' } });

      expect(input).toHaveValue('KS-7492');

      const joinBtn = screen.getByRole('button', { name: /Join Arena/i });
      fireEvent.click(joinBtn);

      expect(onJoinMock).toHaveBeenCalledWith('KS-7492');
    });
  });

  describe('RoomLobbyView', () => {
    const mockRoom: MultiplayerRoom = {
      id: 'room-1',
      code: 'KS9482',
      hostId: 'p-1',
      status: 'WAITING',
      config: {
        mode: 'words',
        targetWords: 25,
        targetDuration: 30,
        difficulty: 'intermediate',
        punctuation: true,
        numbers: false,
        maxPlayers: 8,
        isPrivate: true,
      },
      passage: 'Speed is the byproduct of accuracy and consistent finger cadence.',
      participants: [
        {
          id: 'p-1',
          username: 'ApexTypist',
          isHost: true,
          isReady: true,
          progress: 0,
          currentWpm: 0,
          accuracy: 100,
          isFinished: false,
        },
        {
          id: 'bot-1',
          username: 'Cadence Bot [BOT]',
          isHost: false,
          isReady: true,
          progress: 0,
          currentWpm: 0,
          accuracy: 97,
          isFinished: false,
          isBot: true,
          botSpeedWpm: 65,
        },
      ],
      countdownRemaining: 5,
      createdAt: Date.now(),
    };

    it('displays room code, arena settings, and participant cards', () => {
      render(
        <RoomLobbyView
          room={mockRoom}
          currentParticipantId="p-1"
          isHost={true}
          onStartRace={vi.fn()}
          onToggleReady={vi.fn()}
          onLeaveRoom={vi.fn()}
          onAddBot={vi.fn()}
          onKickBot={vi.fn()}
          chatMessages={[]}
          onSendChat={vi.fn()}
          connectionStatus="connected"
        />
      );

      expect(screen.getByText('KS9482')).toBeInTheDocument();
      expect(screen.getByText(/25 Words/i)).toBeInTheDocument();
      expect(screen.getByText(/intermediate Difficulty/i)).toBeInTheDocument();
      expect(screen.getByText(/@#\$ Punctuation/i)).toBeInTheDocument();
      expect(screen.getByText('ApexTypist')).toBeInTheDocument();
      expect(screen.getByText('Cadence Bot [BOT]')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /START BATTLE/i })).toBeInTheDocument();
    });

    it('allows host to open AI Ghost Typist menu and select a bot', () => {
      const onAddBotMock = vi.fn();
      render(
        <RoomLobbyView
          room={mockRoom}
          currentParticipantId="p-1"
          isHost={true}
          onStartRace={vi.fn()}
          onToggleReady={vi.fn()}
          onLeaveRoom={vi.fn()}
          onAddBot={onAddBotMock}
          onKickBot={vi.fn()}
          chatMessages={[]}
          onSendChat={vi.fn()}
          connectionStatus="connected"
        />
      );

      const addBotBtn = screen.getByRole('button', { name: /\+ Add AI Ghost Typist/i });
      fireEvent.click(addBotBtn);

      expect(screen.getByText(/Select Ghost Speed:/i)).toBeInTheDocument();
      expect(screen.getByText(/Cyclone Bot/i)).toBeInTheDocument();

      fireEvent.click(screen.getByText(/Cyclone Bot/i));
      expect(onAddBotMock).toHaveBeenCalledWith('hard');
    });

    it('sends in-room chat message', () => {
      const onSendChatMock = vi.fn();
      render(
        <RoomLobbyView
          room={mockRoom}
          currentParticipantId="p-1"
          isHost={true}
          onStartRace={vi.fn()}
          onToggleReady={vi.fn()}
          onLeaveRoom={vi.fn()}
          onAddBot={vi.fn()}
          onKickBot={vi.fn()}
          chatMessages={[]}
          onSendChat={onSendChatMock}
          connectionStatus="connected"
        />
      );

      const chatInput = screen.getByPlaceholderText(/Send quick battle message/i);
      fireEvent.change(chatInput, { target: { value: 'Good luck everyone!' } });
      fireEvent.submit(chatInput.closest('form')!);

      expect(onSendChatMock).toHaveBeenCalledWith('Good luck everyone!');
    });
  });

  describe('RaceCountdownOverlay', () => {
    it('renders the large pulsing countdown numbers', () => {
      const { rerender } = render(<RaceCountdownOverlay secondsRemaining={3} />);
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText(/SYNCHRONIZING RACE ENGINE/i)).toBeInTheDocument();

      rerender(<RaceCountdownOverlay secondsRemaining={1} />);
      expect(screen.getByText('1')).toBeInTheDocument();

      rerender(<RaceCountdownOverlay secondsRemaining={0} />);
      expect(screen.queryByText(/SYNCHRONIZING/i)).not.toBeInTheDocument();
    });
  });

  describe('RaceTrack', () => {
    const participants: RoomParticipant[] = [
      {
        id: 'p-1',
        username: 'ApexTypist',
        isHost: true,
        isReady: true,
        progress: 75,
        currentWpm: 92,
        accuracy: 98,
        isFinished: false,
      },
      {
        id: 'bot-1',
        username: 'Cadence Bot [BOT]',
        isHost: false,
        isReady: true,
        progress: 50,
        currentWpm: 65,
        accuracy: 97,
        isFinished: false,
        isBot: true,
      },
    ];

    it('renders racer progress bars, WPM indicators, and positions', () => {
      render(<RaceTrack participants={participants} currentParticipantId="p-1" />);

      expect(screen.getByText(/Live Arena Race Track/i)).toBeInTheDocument();
      expect(screen.getByText('ApexTypist')).toBeInTheDocument();
      expect(screen.getByText('Cadence Bot [BOT]')).toBeInTheDocument();
      expect(screen.getByText(/75%/i)).toBeInTheDocument();
      expect(screen.getByText(/50%/i)).toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
    });
  });

  describe('RacePodium', () => {
    const finishedRoom: MultiplayerRoom = {
      id: 'room-1',
      code: 'KS9482',
      hostId: 'p-1',
      status: 'FINISHED',
      config: {
        mode: 'words',
        targetWords: 25,
        targetDuration: 30,
        difficulty: 'intermediate',
        punctuation: false,
        numbers: false,
        maxPlayers: 8,
        isPrivate: true,
      },
      passage: 'Sample passage for race testing.',
      participants: [
        {
          id: 'p-1',
          username: 'ApexTypist',
          isHost: true,
          isReady: true,
          progress: 100,
          currentWpm: 105,
          accuracy: 99,
          isFinished: true,
          finishTimeSeconds: 12.4,
          placement: 1,
        },
        {
          id: 'bot-1',
          username: 'Cadence Bot [BOT]',
          isHost: false,
          isReady: true,
          progress: 100,
          currentWpm: 68,
          accuracy: 97,
          isFinished: true,
          finishTimeSeconds: 18.2,
          placement: 2,
          isBot: true,
        },
      ],
      countdownRemaining: 0,
      createdAt: Date.now(),
    };

    it('renders 1st and 2nd place podium graphic and scoreboard', () => {
      const onRematchMock = vi.fn();
      render(
        <RacePodium
          room={finishedRoom}
          currentParticipantId="p-1"
          isHost={true}
          onRematch={onRematchMock}
          onLeaveRoom={vi.fn()}
        />
      );

      expect(screen.getByText(/Victory Podium & Rankings/i)).toBeInTheDocument();
      expect(screen.getByText(/Full Arena Scoreboard/i)).toBeInTheDocument();
      expect(screen.getAllByText('ApexTypist').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('105').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('12.4s')).toBeInTheDocument();

      const rematchBtn = screen.getByRole('button', { name: /Rematch • Return to Lobby/i });
      fireEvent.click(rematchBtn);
      expect(onRematchMock).toHaveBeenCalled();
    });
  });
});
