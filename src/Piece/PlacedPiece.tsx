import React from 'react';
import { Color } from '../utils/colors';
import { CoordinateSet } from '../Shared';
import type { SelectedPiece } from '../utils/game';
import { BasePiece, NO_OP, PieceProps } from './BasePiece';

type Props = {
  availableActions: CoordinateSet;
  isUsersTurn: boolean;
  cell: Color[];
  row: number;
  col: number;
  selectedPiece: SelectedPiece | null;
  handleAction: (row: number, col: number) => void;
  handleSelectedPiece: (selectedPiece: SelectedPiece | null) => void;
};

/**
 * Renders a placed piece (a pice that is on the game board) that a player can move (if it's the topmost piece) or place another piece on (if the stack is < 3)
 */
export const PlacedPiece = ({
  availableActions,
  isUsersTurn,
  cell,
  row,
  col,
  selectedPiece,
  handleAction,
  handleSelectedPiece,
}: Props) => {
  const isPossibleAction = availableActions.has(row, col); // either a piece can be placed here or moved from here

  // If an empty cell, we only highlight it if there is a possible action
  if (cell.length === 0) {
    if (isPossibleAction) {
      return (
        <div
          style={{
            borderRadius: '50%',
            height: '50px',
            width: '50px',
            border: '1px solid',
            cursor: 'pointer',
            borderColor: '#fff',
            boxShadow: `#fff 0 0 10px`,
          }}
          onClick={() => handleAction(row, col)}
        />
      );
    }
    return null;
  }

  const isSelectedPiece =
    selectedPiece?.type === 'placedPiece' &&
    selectedPiece.row === row &&
    selectedPiece.col === col;

  const getPieceProps = (): PieceProps => {
    /**
     * Behavior:
     * - When a piece is selected to be moved or placed on the board, it will be highlighted in yellow. The cells or pieces it can move onto will be highlighted white.
     * - When there are no pieces selected, the piece that CAN be selected should be highlighted in yellow.
     *
     * States:
     * 1. No selected piece
     * - selectedColor: canBeSelected ? yellow : null
     * - handleClick: canBeSelected ? set selected piece : null
     *
     * 2. The current piece is selected
     * - selectedColor: yellow
     * - handleClick: unset selected piece
     *
     * 3. When a selected piece can be placed on another piece (regardless of whether it's the player's color or another player's color as long as the stack is < 3)
     * - selectedColor: white (to indicate it can be placed on)
     * - handleClick: calls handleAction
     */

    if (!isUsersTurn) {
      return NO_OP;
    }

    if (!selectedPiece && isPossibleAction) {
      return {
        selectedColor: 'yellow',
        handleClick: () => {
          handleSelectedPiece({ type: 'placedPiece', row, col });
        },
      };
    } else if (isSelectedPiece) {
      return {
        selectedColor: 'yellow',
        handleClick: () => {
          handleSelectedPiece(null);
        },
      };
    } else if (isPossibleAction) {
      return {
        selectedColor: 'white',
        handleClick: () => {
          handleAction(row, col);
        },
      };
    }

    return NO_OP;
  };

  const pieceProps = getPieceProps();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <BasePiece playerColor={cell[cell.length - 1]} {...pieceProps} />
      {cell.reduce((acc, c) => acc + c.charAt(0), '')}
    </div>
  );
};
