import React from 'react';
import { Avatar, Button, Flex, Modal, Text, Tooltip } from '@mantine/core';
import { IGame } from '../utils/game';
import { getStronglyTypedKeys } from '../utils/typing';

type Props = {
  game: IGame;
  userId: string;
  handleLeaveLobby: () => void;
};

// TODO: Force player to leave the room after 30s
export const GameOverModal = ({ game, handleLeaveLobby, userId }: Props) => {
  const winners = React.useMemo(() => {
    let highestScore = 0;
    const { winners } = game;
    const scores = winners.reduce((acc, roundWinners) => {
      roundWinners.forEach((player) => {
        if (!acc[player]) {
          acc[player] = 1;
        } else {
          acc[player] += 1;
        }
        highestScore = Math.max(acc[player], highestScore);
      });
      return acc;
    }, {} as Record<string, number>);
    return getStronglyTypedKeys(scores)
      .filter((playerId) => scores[playerId] === highestScore)
      .map((playerId) => game.players[playerId]);
  }, [game]);

  const renderWinner = () => {
    if (winners.length > 1) {
      return <Text>It's a draw!</Text>;
    }

    const winner = winners[0];
    if (winner.id === userId) {
      return <Text>You won!</Text>;
    }

    return <Text>{`${winner.name} won!`}</Text>;
  };

  return (
    <Modal
      opened
      onClose={handleLeaveLobby}
      title={
        <Text fw={700} size="xl">
          Game over
        </Text>
      }
    >
      <Flex direction="column" gap="lg" justify="center" align="center">
        <Tooltip.Group openDelay={300} closeDelay={100}>
          <Avatar.Group spacing="lg">
            {winners.map((player) => {
              return (
                <Tooltip key={player.id} label={player.name} withArrow>
                  <Avatar color="indigo" radius="lg" size="xl" />
                </Tooltip>
              );
            })}
          </Avatar.Group>
        </Tooltip.Group>

        {renderWinner()}

        <Button onClick={handleLeaveLobby}>Exit game</Button>
      </Flex>
    </Modal>
  );
};
