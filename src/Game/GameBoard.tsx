import React from 'react';
import { Board, Player, SelectedPiece } from '../utils/game';
import { PlacedPiece } from '../Piece/PlacedPiece';
import { Flex } from '@mantine/core';
import { CoordinateSet } from '../Shared';
import { GameAvatar, Position } from './GameAvatar';

type Props = {
  availableActions: CoordinateSet;
  board: Board;
  currentPlayerId: string;
  isUsersTurn: boolean;
  players: Record<string, Player>;
  playerOrder: string[];
  selectedPiece: SelectedPiece | null;
  userId: string;
  handleAction: (row: number, col: number) => void;
  handleSelectedPiece: (piece: SelectedPiece | null) => void;
};

export const GameBoard = ({
  availableActions,
  board,
  currentPlayerId,
  isUsersTurn,
  players,
  playerOrder,
  selectedPiece,
  userId,
  handleAction,
  handleSelectedPiece,
}: Props) => {
  return (
    <Flex direction="column" gap="xl" align="center" justify="center">
      <GameAvatar
        currentPlayerId={currentPlayerId}
        userId={userId}
        playerOrder={playerOrder}
        players={players}
        position={Position.TOP}
      />
      <Flex direction="row" gap="xl" align="center" justify="center">
        <GameAvatar
          currentPlayerId={currentPlayerId}
          userId={userId}
          playerOrder={playerOrder}
          players={players}
          position={Position.LEFT}
        />
        <Flex direction="column">
          {board.map((arr, row) => {
            return (
              <Flex key={`grid-row-${row}`}>
                {arr.map((_, col) => {
                  return (
                    <Flex
                      key={`row-${row}_col-${col}`}
                      aria-label={`row-${row}_col-${col}`}
                      style={{
                        backgroundColor: '#997950',
                        border: '1px solid black',
                      }}
                      justify="center"
                      align="center"
                      h="100px"
                      w="100px"
                    >
                      <PlacedPiece
                        availableActions={availableActions}
                        isUsersTurn={isUsersTurn}
                        cell={board[row][col]}
                        row={row}
                        col={col}
                        selectedPiece={selectedPiece}
                        handleAction={handleAction}
                        handleSelectedPiece={handleSelectedPiece}
                      />
                    </Flex>
                  );
                })}
              </Flex>
            );
          })}
        </Flex>
        <GameAvatar
          currentPlayerId={currentPlayerId}
          userId={userId}
          playerOrder={playerOrder}
          players={players}
          position={Position.RIGHT}
        />
      </Flex>

      <GameAvatar
        currentPlayerId={currentPlayerId}
        userId={userId}
        playerOrder={playerOrder}
        players={players}
        position={Position.BOTTOM}
      />
    </Flex>
  );
};
