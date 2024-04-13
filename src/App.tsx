import React from 'react';
import { Button, Flex, Stepper, TextInput, Tooltip } from '@mantine/core';
import { Socket, io } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { GameWrapper } from './Game/Game';
import { Lobby } from './Lobby/Lobby';
import { LoadingOverlay, PageCentered } from './Shared';

/**
 * In this game, players must place pieces horizontally, vertically, or diagonally.
 *
 * Win condition: the first player to place 3 of their pieces in a row in any of the directions above is the winner.
 *
 * The game board is a N x N board (depending on the total number of players).
 *
 * Each player will receive their own unique color each round and 5 pieces each.
 *
 * The player colors and playing order will switch every round based on a set order.
 *
 * Each turn, a player may either place a new piece or move an existing place.
 * - A new piece may only be placed on one square and up to 3 pieces may be stacked on one square.
 * - A new piece may be stacked on a space already occupied by another piece but the stacks may still only go up to three piece high.
 * - If the player's piece is the one that's on the top of the stack, they may move vertically, horizontally, or diagonally one space in any direction of their choosing. However, a player may not move their piece to a stack that already has three pieces. When moving a piece, only one piece may be moved at a time.
 * - If there are no available moves, a player must pass their turn.
 *
 */

type ListenEvents = {
  join_lobby: (data: { rooms: any; players: Array<any> }) => void;
};

type EmitEvents = {
  join_lobby: string;
};

export type BasePlayer = {
  id: string;
  name: string;
};
export type Room = {
  id: string;
  admin: string;
  players: BasePlayer[];
  can_start_game: boolean;
  is_full_capacity: boolean;
  is_game_started: boolean;
};

type UserInfo = {
  id: string;
  name: string;
};

enum NavigationState {
  INACTIVE = 1,
  LOBBY = 2,
  GAME = 3,
}

const LobbyAndGameWrapper = ({
  handleNavigationState,
  handleSelectRoomId,
  rooms,
  selectedRoom,
  socketInstance,
  userId,
}: {
  handleNavigationState: (state: NavigationState) => void;
  handleSelectRoomId: (roomId: string | null) => void;
  rooms: Record<string, Room>;
  selectedRoom: Room | null;
  socketInstance: Socket<
    DefaultEventsMap & ListenEvents,
    DefaultEventsMap & EmitEvents
  >;
  userId: string;
}) => {
  // Room handler functions
  const handleCreateRoom = async () => {
    const response = await socketInstance
      .timeout(5000)
      .emitWithAck('create_room');
    handleSelectRoomId(response.room_id);
  };

  const handleJoinRoom = async (roomId: string) => {
    await socketInstance.timeout(5000).emitWithAck('join_room', {
      room_id: roomId,
    });
    handleSelectRoomId(roomId);
  };

  const handleLeaveRoom = async (roomId: string) => {
    await socketInstance.timeout(5000).emitWithAck('leave_room', {
      room_id: roomId,
    });
    handleSelectRoomId(null);
  };

  const handleStartGame = async (roomId: string) => {
    await socketInstance.timeout(5000).emitWithAck('start_game', {
      room_id: roomId,
    });
    handleNavigationState(NavigationState.GAME);
  };

  const handleLeaveLobby = () => {
    handleNavigationState(NavigationState.INACTIVE);
    handleSelectRoomId(null);
    socketInstance.emit('leave_lobby');
    socketInstance.disconnect();
  };

  if (!selectedRoom || !selectedRoom.is_game_started) {
    return (
      <Lobby
        rooms={rooms}
        selectedRoom={selectedRoom}
        userId={userId}
        handleCreateRoom={handleCreateRoom}
        handleJoinRoom={handleJoinRoom}
        handleLeaveRoom={handleLeaveRoom}
        handleStartGame={handleStartGame}
        handleLeaveLobby={handleLeaveLobby}
      />
    );
  } else {
    return (
      <GameWrapper
        socket={socketInstance}
        handleLeaveLobby={handleLeaveLobby}
        userId={userId}
        roomId={selectedRoom.id}
      />
    );
  }
};

function App() {
  // Navigation handlers
  const [navigationState, setNavigationState] = React.useState<NavigationState>(
    NavigationState.INACTIVE
  );

  const [socketInstance, setSocketInstance] = React.useState<Socket<
    DefaultEventsMap & ListenEvents,
    DefaultEventsMap & EmitEvents
  > | null>(null);
  const [userInfo, setUserInfo] = React.useState<UserInfo | null>();
  const [username, setUsername] = React.useState<string | null>(
    localStorage.getItem('username')
  );
  const [selectedRoomId, setSelectedRoomId] = React.useState<string | null>(
    null
  );
  const [loading, setLoading] = React.useState(false);
  const [rooms, setRooms] = React.useState<Record<string, Room>>({});

  const handleJoinLobby = async () => {
    if ((!socketInstance || !socketInstance.connected) && !!username?.trim()) {
      setLoading(true);

      // Update local storage
      localStorage.setItem('username', username.trim());

      let socket = socketInstance;
      if (!socket) {
        socket = io('https://d7b3-152-44-232-226.ngrok-free.app', {
          transports: ['websocket'],
          cors: {
            origin: 'http://localhost:3000/',
          },
        });

        setSocketInstance(socket);
      }

      if (!socket.hasListeners('joined_lobby')) {
        socket.on('joined_lobby', (data) => {
          setRooms(data.rooms);
        });
      }

      if (!socket.hasListeners('joined_room')) {
        socket.on('joined_room', (data) => {
          setRooms(data.rooms);
        });
      }

      if (!socket.hasListeners('left_room')) {
        socket.on('left_room', (data) => {
          setRooms(data.rooms);
        });
      }

      if (!socket.hasListeners('created_room')) {
        socket.on('created_room', (data) => {
          setRooms(data.rooms);
        });
      }

      if (!socket.hasListeners('left_lobby')) {
        socket.on('left_lobby', (data) => {
          setRooms(data.rooms);
        });
      }

      if (!socket.hasListeners('started_game')) {
        socket.on('started_game', (data) => {
          setRooms(data.rooms);
        });
      }

      socket.connect();

      socket
        .timeout(5000)
        .emitWithAck('join_lobby', {
          name: username,
        })
        .then((resp) => {
          setLoading(false);
          setUserInfo({
            name: resp.player.name,
            id: resp.player.id,
          });
          setNavigationState(NavigationState.LOBBY);
        });
    }
  };

  React.useEffect(() => {
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [socketInstance]);

  const renderBody = () => {
    if (!userInfo || !socketInstance || !socketInstance.connected) {
      return (
        <Flex direction="column" align="center" justify="center" gap="lg">
          <TextInput
            aria-label="Username"
            placeholder="Enter your username"
            value={username ?? ''}
            onChange={(event) => setUsername(event.currentTarget.value)}
          />
          {!!username ? (
            <Button disabled={loading} onClick={handleJoinLobby}>
              Multiplayer
            </Button>
          ) : (
            <Tooltip label={'Enter a username to join multiplayer'}>
              <Button disabled onClick={handleJoinLobby}>
                Multiplayer
              </Button>
            </Tooltip>
          )}
        </Flex>
      );
    }

    const userId = userInfo.id;
    const selectedRoom = selectedRoomId ? rooms[selectedRoomId] : null;

    return (
      <LobbyAndGameWrapper
        handleNavigationState={(state) => setNavigationState(state)}
        handleSelectRoomId={(roomId) => setSelectedRoomId(roomId)}
        rooms={rooms}
        selectedRoom={selectedRoom}
        socketInstance={socketInstance}
        userId={userId}
      />
    );
  };

  return (
    <>
      <LoadingOverlay visible={loading} />
      <Flex
        pos="relative"
        w="100%"
        h="100%"
        direction="column"
        align="center"
        justify="top"
        p="xl"
        gap="xl"
      >
        <Stepper active={navigationState} allowNextStepsSelect={false}>
          <Stepper.Step
            label="Multiplayer"
            description="Create your username"
          />
          <Stepper.Step label="Lobby" description="Create or join a room" />
          <Stepper.Step label="Game" description="Play!" />
        </Stepper>

        {renderBody()}
      </Flex>
    </>
  );
}

export default App;
