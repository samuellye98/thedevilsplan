import json_fix
from core.base_player import BasePlayer
from four_players_three_in_a_row.game import Game


class RoomClosedException(Exception):
    pass


class RoomMaxCapacityException(Exception):
    pass


class PlayerNotInRoom(Exception):
    pass


class NotEnoughPlayers(Exception):
    pass


class GameAlreadyStarted(Exception):
    pass


class PlayerNotAuthorized(Exception):
    pass


class Room:
    def __init__(self, room_id: str, player: BasePlayer, capacity: int):
        self.room_id = room_id
        self.players: set[BasePlayer] = set([player])
        self.admin: BasePlayer = player
        self.capacity: int = capacity
        self.game: Game | None = None

    def add_player(self, player: BasePlayer) -> None:
        if self.game:
            raise RoomClosedException("You cannot join an ongoing game.")

        if len(self.players) == self.capacity:
            raise RoomMaxCapacityException("The room is at capacity")

        self.players.add(player)
        player.join_room(self.room_id)

    def remove_player(self, player: BasePlayer) -> None:
        if player not in self.players:
            raise PlayerNotInRoom("Player is not in this room.")

        self.players.remove(player)
        player.leave_room()

    def get_game(self, user_id: str) -> Game | None:
        """
        Retrieves the Game object given for the room.

        Validates that the user belongs to the current room.
        """
        valid_user = any([p.id == user_id for p in self.players])
        if not valid_user:
            raise PlayerNotAuthorized(
                "Player does not have authorization to access this data."
            )
        else:
            return self.game

    def start_game(self) -> Game:
        """
        Starts the game for the current room
        """
        if len(self.players) < 2:
            raise NotEnoughPlayers("Not enough players to start the game!")

        if self.game:
            raise GameAlreadyStarted("Game is already started!")

        self.game = Game(list(self.players))
        return self.game

    def __json__(self):
        return {
            "id": self.room_id,
            "admin": self.admin.id,
            "players": list(self.players),
            "can_start_game": len(self.players) >= 2,
            "is_full_capacity": len(self.players) == self.capacity,
            "is_game_started": bool(self.game),
        }
