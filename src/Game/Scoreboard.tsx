import React from 'react';
import { Avatar, Flex, Table, Text, Tooltip } from '@mantine/core';
import type { Player } from '../utils/game';

type Props = {
  currentPlayerId: string;
  players: Record<string, Player>;
  winners: string[][];
};

export const Scoreboard = ({ currentPlayerId, players, winners }: Props) => {
  const renderRoundWinners = (roundWinners: string[]) => {
    if (roundWinners.length === 1) {
      const winnerId = roundWinners[0];
      const player = players[winnerId];
      return (
        <Table.Td>
          <Tooltip
            label={`${player.name}${
              currentPlayerId === winnerId ? ' (You)' : ''
            }`}
            withArrow
          >
            <Avatar color="indigo" radius="xl" />
          </Tooltip>
        </Table.Td>
      );
    } else {
      return (
        <Table.Td>
          <Flex gap="sm" align="center">
            <Text>Draw</Text>
            <Tooltip.Group openDelay={300} closeDelay={100}>
              <Avatar.Group spacing="sm">
                {roundWinners.map((p) => {
                  const player = players[p];
                  return (
                    <Tooltip key={player.id} label={player.name} withArrow>
                      <Avatar color="indigo" radius="xl" />
                    </Tooltip>
                  );
                })}
              </Avatar.Group>
            </Tooltip.Group>
          </Flex>
        </Table.Td>
      );
    }
  };

  return (
    <Table h="fit-content" borderColor="dark">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Round</Table.Th>
          <Table.Th>Results</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {winners.map((roundWinners, index) => (
          <Table.Tr key={`round-${index}`}>
            <Table.Td>{index + 1}</Table.Td>
            {renderRoundWinners(roundWinners)}
          </Table.Tr>
        ))}
        <Table.Tr>
          <Table.Td>{winners.length + 1}</Table.Td>
          <Table.Td>-</Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
};
