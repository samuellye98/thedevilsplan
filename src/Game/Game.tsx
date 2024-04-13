import React from 'react';
import { Flex, Text } from '@mantine/core';
import type { Socket } from 'socket.io-client';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { getAvailableActionsForPlayer } from '../utils/actions';
import { SelectedPiece, IGame } from '../utils/game';
import { LoadingState } from '../Shared';
import { UnplacedPiece } from '../Piece/UnplacedPiece';
import { Scoreboard } from './Scoreboard';
import { GameOverModal } from './GameOverModal';
import { GameBoard } from './GameBoard';

type GameWrapperProps = {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
  handleLeaveLobby: () => void;
  roomId: string;
  userId: string;
};

type GameProps = {
  game: IGame;
  playerOrder: string[];
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
  roomId: string;
  userId: string;
};

const Game = ({ game, playerOrder, socket, roomId, userId }: GameProps) => {
  const [selectedPiece, setSelectedPiece] =
    React.useState<SelectedPiece | null>(null);

  const {
    board,
    player_ids: playerIds,
    players,
    current_turn: currentTurn,
    winners,
  } = game;

  const currentPlayerId = playerIds[currentTurn];
  const usersPlayer = players[userId];
  const isUsersTurn = userId === currentPlayerId;

  const availableActions = React.useMemo(
    () =>
      getAvailableActionsForPlayer(
        board,
        selectedPiece,
        isUsersTurn,
        usersPlayer
      ),
    [board, usersPlayer, isUsersTurn, selectedPiece]
  );

  const handleAction = (row: number, col: number) => {
    if (selectedPiece?.type === 'placedPiece') {
      socket.emit('handle_move_action', {
        user_id: userId,
        room_id: roomId,
        from_row: selectedPiece?.row,
        from_col: selectedPiece?.col,
        to_row: row,
        to_col: col,
      });
      setSelectedPiece(null);
    } else if (selectedPiece?.type === 'unplacedPiece') {
      socket.emit('handle_place_action', {
        user_id: userId,
        room_id: roomId,
        num_pieces: selectedPiece.numPieces,
        row,
        col,
      });
      setSelectedPiece(null);
    } else {
      setSelectedPiece(null);
    }
  };

  const renderRemainingPieces = () => {
    return (
      <Flex gap="sm" direction="column">
        <Flex
          gap="md"
          style={{
            backgroundColor: '#997950',
          }}
        >
          {Array.from({ length: usersPlayer.num_pieces }, () => null).map(
            (_, index) => (
              <UnplacedPiece
                key={`unplaced-piece-${index}`}
                isUsersTurn={isUsersTurn}
                numPieces={usersPlayer.num_pieces}
                pieceIndex={index}
                playerColor={usersPlayer.color}
                selectedPiece={selectedPiece}
                handleSelectedPiece={setSelectedPiece}
              />
            )
          )}
        </Flex>

        <Text>
          {selectedPiece?.type === 'unplacedPiece'
            ? `You selected ${selectedPiece.numPieces} pieces to place`
            : `You can select up to ${Math.min(
                3,
                usersPlayer.num_pieces
              )} pieces to place`}
        </Text>
      </Flex>
    );
  };

  return (
    <Flex gap="xl" direction="row" align="flex-start">
      <Flex gap="lg" direction="column" align="center" justify="center">
        <GameBoard
          availableActions={availableActions}
          board={board}
          currentPlayerId={currentPlayerId}
          isUsersTurn={isUsersTurn}
          players={players}
          playerOrder={playerOrder}
          selectedPiece={selectedPiece}
          userId={userId}
          handleAction={handleAction}
          handleSelectedPiece={(p) => setSelectedPiece(p)}
        />
        {renderRemainingPieces()}
      </Flex>

      <Scoreboard
        currentPlayerId={usersPlayer.id}
        players={players}
        winners={winners}
      />
    </Flex>
  );
};

export const GameWrapper = ({
  socket,
  handleLeaveLobby,
  roomId,
  userId,
}: GameWrapperProps) => {
  const [game, setGame] = React.useState<IGame | null>(null);
  const initialPlayerOrder = React.useRef<string[]>([]); // Keeps track of the original player IDs around the board

  React.useEffect(() => {
    // Fetch game data on mount
    const fetchGameData = async () => {
      const response = await socket
        .timeout(5000)
        .emitWithAck('fetch_game_data', {
          room_id: roomId,
        });

      setGame(response.game);

      // Order the player order such that the current user is always the "first" player
      const playerIds: string[] = response.game.player_ids;
      const pos = playerIds.findIndex((id) => id === userId);
      initialPlayerOrder.current = [playerIds[pos]]
        .concat(playerIds.slice(pos + 1))
        .concat(playerIds.slice(0, pos));
    };
    fetchGameData();
  }, []);

  React.useEffect(() => {
    if (!socket.hasListeners('send_game_data')) {
      socket.on('send_game_data', (data) => {
        setGame(data.game);
      });
    }
  }, [socket, userId]);

  if (!game) {
    return <LoadingState />;
  }

  return (
    <>
      <Game
        socket={socket}
        game={game}
        roomId={roomId}
        userId={userId}
        playerOrder={initialPlayerOrder.current}
      />
      {game.game_state === 'GAME_OVER' && (
        <GameOverModal
          game={game}
          userId={userId}
          handleLeaveLobby={handleLeaveLobby}
        />
      )}
    </>
  );
};
