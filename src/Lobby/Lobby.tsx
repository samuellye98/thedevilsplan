import React from 'react';
import { Avatar, Button, Flex, Tooltip, UnstyledButton } from '@mantine/core';
import type { Room } from '../App';
import { getStronglyTypedValues } from '../utils/typing';

type Props = {
  rooms: Record<string, Room>;
  selectedRoom: Room | null;
  userId: string;
  handleCreateRoom: () => void;
  handleJoinRoom: (roomId: string) => void;
  handleLeaveRoom: (roomId: string) => void;
  handleStartGame: (roomId: string) => void;
  handleLeaveLobby: () => void;
};

export const Lobby = ({
  rooms,
  selectedRoom,
  userId,
  handleCreateRoom,
  handleJoinRoom,
  handleLeaveRoom,
  handleStartGame,
  handleLeaveLobby,
}: Props) => {
  const renderActionButtons = () => {
    return (
      <Flex justify="center" align="center" gap="md">
        <Button disabled={!!selectedRoom} onClick={handleCreateRoom}>
          Create room
        </Button>
        <Button
          disabled={!selectedRoom}
          onClick={() => {
            if (selectedRoom) {
              handleLeaveRoom(selectedRoom.id);
            }
          }}
        >
          Leave room
        </Button>
        <Button onClick={handleLeaveLobby}>Leave lobby</Button>
      </Flex>
    );
  };

  const renderStartGameButton = (roomId: string) => {
    if (selectedRoom?.id !== roomId) {
      return null;
    }
    if (selectedRoom.admin !== userId) {
      return null;
    }

    return (
      <Button
        disabled={!selectedRoom.can_start_game}
        onClick={() => handleStartGame(selectedRoom.id)}
      >
        Start game
      </Button>
    );
  };

  return (
    <Flex
      gap="md"
      justify="start"
      align="center"
      direction="column"
      p="lg"
      style={{
        border: '1px color red',
      }}
      w="100%"
      h="100%"
    >
      {renderActionButtons()}
      <Flex
        gap="md"
        justify="center"
        align="flex-start"
        direction="row"
        wrap="wrap"
      >
        {getStronglyTypedValues(rooms).map(
          (room) =>
            !room.is_game_started && (
              <Flex
                key={room.id}
                direction="column"
                gap="md"
                justify="center"
                align="center"
              >
                <UnstyledButton
                  h="200px"
                  w="200px"
                  bg="cyan"
                  p="md"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '1px solid cyan',
                    borderRadius: '16px',
                  }}
                  disabled={room.is_full_capacity || !!selectedRoom}
                  onClick={() => handleJoinRoom(room.id)}
                >
                  <Tooltip.Group openDelay={300} closeDelay={100}>
                    <Avatar.Group spacing="sm">
                      {room.players.map((p) => (
                        <Tooltip
                          key={p.id}
                          label={p.name}
                          withArrow
                          opened={p.id === userId ? true : undefined}
                        >
                          <Avatar color="indigo" radius="xl" />
                        </Tooltip>
                      ))}
                    </Avatar.Group>
                  </Tooltip.Group>
                </UnstyledButton>

                {renderStartGameButton(room.id)}
              </Flex>
            )
        )}
      </Flex>
    </Flex>
  );
};
