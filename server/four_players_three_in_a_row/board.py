import json_fix
from typing import List
from four_players_three_in_a_row.utils import (
    GRID_DIMENSION,
    Color,
    get_default_color_grid,
)


class Board:
    def __init__(self):
        self.grid = get_default_color_grid(GRID_DIMENSION)

    def reset_board(self):
        """
        Resets the board to the default state
        """
        self.grid = get_default_color_grid((GRID_DIMENSION))

    def value_at(self, row: int, col: int) -> List[Color]:
        return self.grid[row][col]

    def __json__(self):
        return self.grid
