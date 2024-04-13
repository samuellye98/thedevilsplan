import { CoordinateSet } from '../Shared';
import { Board, GRID_DIMENSION, Player, SelectedPiece } from '../utils/game';

const isInBounds = (row: number, col: number): boolean => {
  return 0 <= row && row < GRID_DIMENSION && 0 <= col && col < GRID_DIMENSION;
};

const DIRECTIONS = [
  [-1, -1], // top left diagonal
  [-1, 0], // top
  [-1, 1], // top right diagonal
  [0, -1], // left
  [0, 1], // right
  [1, -1], // bottom left diagonal
  [1, 0], // bottom
  [1, 1], // bottom right diagonal
];

const getAvailableMovesForPiece = (
  board: Board,
  row: number,
  col: number
): CoordinateSet => {
  const coordinates = new CoordinateSet();
  for (const [x, y] of DIRECTIONS) {
    const newRow = row + x,
      newCol = col + y;

    // Check if in bounds and the existing stack is < 3
    if (isInBounds(newRow, newCol) && board[newRow][newCol].length < 3) {
      coordinates.add(newRow, newCol);
    }
  }
  return coordinates;
};

export const getAvailableActionsForPlayer = (
  board: Board,
  selectedPiece: SelectedPiece | null,
  isUsersTurn: boolean,
  usersPlayer: Player
): CoordinateSet => {
  if (!isUsersTurn) {
    return new CoordinateSet();
  }

  if (!selectedPiece) {
    // Find the initial pieces that we can select
    const res = new CoordinateSet();
    for (let i = 0; i < GRID_DIMENSION; i++) {
      for (let j = 0; j < GRID_DIMENSION; j++) {
        const cell = board[i][j];

        if (cell.length > 0 && cell[cell.length - 1] === usersPlayer.color) {
          res.add(i, j);
        }
      }
    }
    return res;
  }

  if (selectedPiece.type === 'placedPiece') {
    // Find the pieces that we can move an already placed piece on the board to
    return getAvailableMovesForPiece(
      board,
      selectedPiece.row,
      selectedPiece.col
    );
  } else {
    // selectedPiece.type === 'unplacedPiece'
    // Find the cells that we can place a new piece on
    const canPlacePiece = usersPlayer.num_pieces > 0;
    const res = new CoordinateSet();
    for (let i = 0; i < GRID_DIMENSION; i++) {
      for (let j = 0; j < GRID_DIMENSION; j++) {
        const cell = board[i][j];

        // Empty cell
        if (cell.length === 0 && canPlacePiece) {
          res.add(i, j);
        } else if (3 - cell.length >= selectedPiece.numPieces) {
          // Has stacked pieces
          res.add(i, j);
        }
      }
    }
    return res;
  }
};
