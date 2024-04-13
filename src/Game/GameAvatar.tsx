import React from 'react';
import { Avatar, Flex, Text } from '@mantine/core';
import { Player } from '../utils/game';
import { BasePiece } from '../Piece/BasePiece';

export enum Position {
  BOTTOM = 0,
  LEFT = 1,
  TOP = 2,
  RIGHT = 3,
}

type Props = {
  currentPlayerId: string;
  userId: string;
  playerOrder: string[];
  players: Record<string, Player>;
  position: Position;
};

export const GameAvatar = ({
  currentPlayerId,
  userId,
  playerOrder,
  players,
  position,
}: Props) => {
  const playerId = playerOrder[position];
  const player = players[playerId];
  if (!player) {
    return null;
  }

  const isCurrentTurn = playerId === currentPlayerId;
  const isUsersPlayer = playerId === userId;

  const renderPlayerName = () => {
    if (isUsersPlayer) {
      return `${player.name} (You)`;
    } else {
      return player.name;
    }
  };

  const renderRemainingPieces = () => {
    if (isUsersPlayer) {
      return null;
    }

    return (
      <Flex direction="row" gap="xs" align="center" justify="center">
        <BasePiece
          playerColor={player.color}
          size={10}
          disabled
          selectedColor={null}
        />
        <Text>{`×${player.num_pieces}`}</Text>
      </Flex>
    );
  };

  return (
    <Flex direction="column" gap="sm" align="center" justify="center">
      <Flex direction="column" gap="xs" align="center" justify="center">
        <Avatar radius="lg" />
        <Text fw={isCurrentTurn ? 700 : 400}>{renderPlayerName()}</Text>
      </Flex>
      {renderRemainingPieces()}
    </Flex>
  );
};
