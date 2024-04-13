import json_fix
from core.base_player import BasePlayer
from four_players_three_in_a_row.utils import Color


class Player(BasePlayer):
    def __init__(self, color: Color, base_player: BasePlayer):
        super().__init__(
            base_player.id,
            base_player.name,
            base_player.created_at,
        )
        self.color = color

        self.num_pieces = 5

    def __json__(self):
        return {
            "id": self.id,
            "name": self.name,
            "created_at": self.created_at,
            "color": self.color,
            "num_pieces": self.num_pieces,
        }
