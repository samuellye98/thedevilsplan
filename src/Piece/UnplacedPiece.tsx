import React from 'react';
import { Color } from '../utils/colors';
import type { SelectedPiece } from '../utils/game';
import { BasePiece, NO_OP, PieceProps } from './BasePiece';

type Props = {
  isUsersTurn: boolean;
  numPieces: number;
  pieceIndex: number;
  playerColor: Color;
  selectedPiece: SelectedPiece | null;
  handleSelectedPiece: (selectedPiece: SelectedPiece | null) => void;
};

/**
 * Renders an unplaced piece (not on the game board) that a player can place onto the board.
 * A player can place a maximum of 3 pieces on the board but they must all be in the same cell.
 */
export const UnplacedPiece = ({
  isUsersTurn,
  numPieces,
  pieceIndex,
  playerColor,
  selectedPiece,
  handleSelectedPiece,
}: Props) => {
  const canBeSelected =
    selectedPiece?.type === 'unplacedPiece' &&
    pieceIndex === numPieces - 1 - Math.min(2, selectedPiece.numPieces);

  const isSelected =
    selectedPiece?.type === 'unplacedPiece' &&
    pieceIndex > numPieces - 1 - selectedPiece.numPieces;

  const getPieceProps = (): PieceProps => {
    /**
     * Behavior:
     * - When a piece is selected to be moved or placed on the board, it will be highlighted in yellow. The cells or pieces it can move onto will be highlighted white.
     * - When there are no pieces selected, the piece that CAN be selected should be highlighted in yellow.
     *
     * States:
     * 1. No selected piece
     * - selectedColor: lastPiece ? yellow : none (we only allow the last unplaced piece to be selected)
     * - handleClick: set selected piece
     *
     * 2. An unplaced piece is selected
     * - selectedColor: yellow
     * - handleClick: unset selected piece if it's the only one selected or decrement numPieces if more than one selected
     *
     * 3. When an unplaced piece is already selected, another unplaced piece could be selected (since the maximum is 3)
     * - selectedColor: white (to indicate it can be selected)
     * - handleClick: increment numPieces
     */

    if (!isUsersTurn) {
      return NO_OP;
    }

    const isLastPiece = pieceIndex === numPieces - 1;

    // State 1
    if (!selectedPiece) {
      return {
        selectedColor: isLastPiece ? 'yellow' : null,
        handleClick: () => {
          if (isLastPiece) {
            handleSelectedPiece({
              type: 'unplacedPiece',
              numPieces: 1,
            });
          }
        },
      };
    }

    // State 2
    if (isSelected) {
      return {
        selectedColor: 'yellow',
        handleClick: () => {
          if (selectedPiece.numPieces === 1) {
            handleSelectedPiece(null);
          } else {
            handleSelectedPiece({
              type: 'unplacedPiece',
              numPieces: selectedPiece.numPieces - 1,
            });
          }
        },
      };
    }

    // State 3
    if (canBeSelected) {
      return {
        selectedColor: 'white',
        handleClick: () => {
          handleSelectedPiece({
            type: 'unplacedPiece',
            numPieces: selectedPiece.numPieces + 1,
          });
        },
      };
    }

    return NO_OP;
  };

  const pieceProps = getPieceProps();

  return <BasePiece playerColor={playerColor} {...pieceProps} />;
};
