import uuid
from core.base_player import BasePlayer
from core.room import Room


class PlayerRoomMismatch(Exception):
    pass


class PlayerNotFound(Exception):
    pass


class RoomNotFound(Exception):
    pass


class PlayerNotAdmin(Exception):
    pass


class GameLobby:
    def __init__(self, name: str, capacity_of_room: int):
        self.name: str = name
        self.all_players: dict[uuid.UUID, BasePlayer] = {}
        self.rooms: dict[uuid.UUID, Room] = {}
        self.capacity_of_room = capacity_of_room

    def get_room(self, room_id: str) -> Room:
        """
        Retrieves the Room object given a room_id and raises an exception if the room is not found.
        """
        if room_id not in self.rooms:
            raise RoomNotFound("Room not found!")
        else:
            return self.rooms[room_id]

    def join_lobby(self, player: BasePlayer) -> None:
        """
        Handler function for when a player joins a multiplayer lobby
        """
        self.all_players[player.id] = player

    def leave_lobby(self, user_id: str) -> None:
        """
        Handler function for when a player leaves a multiplayer lobby.

        If the player has joined a room, we should remove the player from that room as well.
        """
        if user_id not in self.all_players:
            raise PlayerNotFound("Player not found!")
        else:
            player = self.all_players[user_id]

            if player.room_id:
                self.leave_room(user_id, player.room_id)

            del self.all_players[user_id]

    def create_new_room(self, user_id: str) -> Room:
        """
        Handler function for when a new room is created.

        Associate the player who created the room with the room.
        """
        if user_id not in self.all_players:
            raise PlayerNotFound("Player not found!")

        else:
            player = self.all_players[user_id]
            room_id = str(uuid.uuid4())
            room = Room(room_id, player, self.capacity_of_room)
            self.rooms[room_id] = room

            player.join_room(room_id)

            return room

    def join_room(self, user_id: BasePlayer, room_id: str) -> Room:
        """
        Handler function for when a player joins a room.

        Associate the player with the room.
        """
        if user_id not in self.all_players:
            raise PlayerNotFound("Player not found!")
        else:
            player = self.all_players[user_id]
            room = self.get_room(room_id)
            room.add_player(player)
            return room

    def leave_room(self, user_id: str, room_id: str) -> None:
        """
        Handler function for when a player left a room.

        De-associate the player with the room.

        Also, delete the room if there are no more players.
        """
        if user_id not in self.all_players:
            raise PlayerNotFound("Player not found!")
        else:
            player = self.all_players[user_id]
            if player.room_id != room_id:
                raise PlayerRoomMismatch("Player does not belong to this room!")

            room = self.get_room(room_id)
            room.remove_player(player)

            # Delete the room if there are no more players
            if len(room.players) == 0:
                del self.rooms[room_id]

    def start_game_for_room(self, user_id: str, room_id: str) -> None:
        """
        Handler function for starting a game for a specific room.

        The user id who is starting the game must be the admin for the room.
        """
        room = self.get_room(room_id)
        if room.admin.id == user_id:
            room.start_game()
        else:
            raise PlayerNotAdmin("Player does not have permission to start the game.")
