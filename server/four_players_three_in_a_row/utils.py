from enum import Enum
from typing import List, TypedDict


# Sets the grid dimensions for the 4 by 3 player game
GRID_DIMENSION = 4


class Color(str, Enum):
    """
    Represents the colors used by each player for a single round.
    """

    RED = "RED"
    GREEN = "GREEN"
    BLUE = "BLUE"
    YELLOW = "YELLOW"


# COLORS_ARRAY represents the order of a single round, i.e. player who is assigned RED always goes first.
COLORS_ARRAY: List[Color] = [Color.RED, Color.GREEN, Color.BLUE, Color.YELLOW]
type ColorGrid = List[List[List[Color]]]


def get_default_color_grid(
    n: int,
) -> ColorGrid:
    return [[[] for _ in range(n)] for _ in range(n)]


class Action(str, Enum):
    """
    Represents the action each player can take for a particular cell
    """

    PLACE = "PLACE"
    MOVE = "MOVE"
    PLACE_OR_MOVE = "PLACE_OR_MOVE"
    IMPOSSIBLE = "IMPOSSIBLE"


type ActionGrid = List[List[Action]]


def get_default_action_grid(
    n: int,
) -> ActionGrid:
    return [[[] for _ in range(n)] for _ in range(n)]


class MoveAction(TypedDict):
    """
    Represents a player moving an existing piece on the board from one cell to another cell
    """

    type: Action.MOVE
    from_row: int
    from_col: int
    to_row: int
    to_col: int


class PlaceAction(TypedDict):
    """
    Represents a player placing X number of pieces, represented by `num_pieces` from their available pieces onto the board.
    """

    type: Action.PLACE
    num_pieces: int
    row: int
    col: int


type PossibleActions = MoveAction | PlaceAction
