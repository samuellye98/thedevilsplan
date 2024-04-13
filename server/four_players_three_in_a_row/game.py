import json_fix
from enum import Enum
from typing import List
from core.base_player import BasePlayer
from four_players_three_in_a_row.utils import (
    GRID_DIMENSION,
    Color,
    COLORS_ARRAY,
    Action,
    PossibleActions,
)
from four_players_three_in_a_row.player import Player
from four_players_three_in_a_row.board import Board


class GameState(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    GAME_OVER = "GAME_OVER"


class Game:
    def __init__(self, base_players: List[BasePlayer]):
        # TODO(Edge case): check numPlayers>=2 and numPlayers<=4

        self.game_state = GameState.IN_PROGRESS
        self.current_turn = 0
        self.current_round = 0
        self.max_rounds = 5
        self.max_players = 4  # TODO: Validate max players
        self.winners: List[List[str]] = []

        self.board = Board()

        self.player_ids: List[str] = []
        self.players: dict[str, Player] = {}
        for bp in base_players:
            p = Player(Color.RED, bp)
            self.player_ids.append(bp.id)
            self.players[bp.id] = p

        self.start_new_round()

    def __json__(self):
        return {
            "game_state": self.game_state,
            "winners": self.winners,
            "board": self.board,
            "player_ids": self.player_ids,
            "players": self.players,
            "current_turn": self.current_turn,
            "current_round": self.current_round,
        }

    def start_new_round(self):
        """
        This function starts a new round of the game by doing the following:
        - Reassigns the orders of the players and thus the colors assigned to each player.
        - Resets the currentTurn variable
        - Resets the board

        If the number of rounds has hit the maximum number of rounds, the game ends and returns the winner of the game
        """
        self.current_round += 1

        if self.current_round > self.max_rounds:
            self.game_state = GameState.GAME_OVER
            return

        last_player = self.player_ids.pop()
        self.player_ids.insert(0, last_player)
        for i in range(len(self.player_ids)):
            player = self.players[self.player_ids[i]]
            player.num_pieces = 5
            player.color = COLORS_ARRAY[i]

        self.board.reset_board()
        self.current_turn = 0

    def is_in_bounds(self, row: int, col: int) -> bool:
        return 0 <= row < GRID_DIMENSION and 0 <= col < GRID_DIMENSION

    def get_coordinates_to_check(self, row, col) -> List[List[tuple[int, int]]]:
        """
        Returns a list of coordinates to check for given a coordinate on the board.
        This checks the row, column, left diagonal, and right diagonal.
        """
        row_coordinates = [(row, col), (row, col + 1), (row, col + 2)]
        col_coordinates = [(row, col), (row + 1, col), (row + 2, col)]
        left_to_right_diagonal = [
            (row, col),
            (row + 1, col + 1),
            (row + 2, col + 2),
        ]
        right_to_left_diagonal = [
            (row, col),
            (row + 1, col - 1),
            (row + 2, col - 2),
        ]
        return [
            row_coordinates,
            col_coordinates,
            left_to_right_diagonal,
            right_to_left_diagonal,
        ]

    def maybe_players_won(self) -> List[str]:
        """
        Returns a list of players who may have won given a particular move.

        If a player moved an existing piece, we need to account for the possibilities of a draw, i.e.
        [1, 1, 1, 0], -> player 2 moved from (0,1) to (1,1) -> both players 1 and 2 won.
        [3, 2, 2, 3],
        [4, 4, 2, 4],
        [3, 3, 4, 2],
        """
        winning_colors = set()
        for row in range(GRID_DIMENSION):
            for col in range(GRID_DIMENSION):
                cell = self.board.value_at(row, col)
                # Proceed only if cell has a value and that value is not already a winning color
                if len(cell) == 0 or cell[-1] in winning_colors:
                    continue

                # Check row, col, left diagonal, and right diagonal
                list_of_coordinates = self.get_coordinates_to_check(row, col)
                for coordinates in list_of_coordinates:
                    # Validate that the last coordinate is in bounds since that's the most extreme
                    if not self.is_in_bounds(coordinates[-1][0], coordinates[-1][1]):
                        continue

                    colors = [
                        (
                            self.board.value_at(x, y)[-1]
                            if len(self.board.value_at(x, y)) > 0
                            else None
                        )
                        for x, y in coordinates
                    ]
                    all_equal = all(i == colors[0] for i in colors)
                    if colors[0] and all_equal:
                        winning_colors.add(colors[0])

        return list(
            filter(lambda id: self.players[id].color in winning_colors, self.player_ids)
        )

    def advance_player_turn(self):
        self.current_turn = (self.current_turn + 1) % len(self.player_ids)

    def execute_action_for_player(self, player_id: str, action: PossibleActions):
        """
        Executes an action for a player. This could either be moving an existing piece on the board or placing a new piece on the board

        Returns true if the player won the game and false otherwise.
        """
        if self.game_state == GameState.IN_PROGRESS:
            round_winners = []
            player = self.players[player_id]

            if action["type"] == Action.MOVE:
                self.board.value_at(action["from_row"], action["from_col"]).pop()
                self.board.value_at(action["to_row"], action["to_col"]).append(
                    player.color
                )
                round_winners = self.maybe_players_won()

            elif action["type"] == Action.PLACE:
                num_pieces = action["num_pieces"]
                cell = self.board.value_at(action["row"], action["col"])
                if 3 - len(cell) >= num_pieces:
                    for _ in range(num_pieces):
                        cell.append(player.color)
                    player.num_pieces -= num_pieces
                    round_winners = self.maybe_players_won()

            # Handle the case if the player won
            if round_winners:
                self.winners.append(round_winners)
                self.start_new_round()
                return True
            else:
                self.advance_player_turn()
                return False
