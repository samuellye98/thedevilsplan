import React from 'react';
import { COLORS, Color, SELECTED_COLORS, SelectedColor } from '../utils/colors';
import { UnstyledButton } from '@mantine/core';

export type PieceProps = {
  selectedColor: SelectedColor | null;
  disabled?: boolean;
  handleClick?: () => void;
};

export const NO_OP: PieceProps = {
  selectedColor: null,
  disabled: true,
};

type Props = {
  playerColor: Color;
  size?: number;
} & PieceProps;

/**
 * This component represents a game piece
 */
export const BasePiece = ({
  disabled,
  playerColor,
  selectedColor,
  handleClick,
  size = 50,
}: Props) => {
  return (
    <UnstyledButton
      onClick={handleClick}
      disabled={disabled}
      style={{
        borderRadius: '50%',
        height: `${size}px`,
        width: `${size}px`,
        backgroundColor: COLORS[playerColor],
        border: '1px solid',
        cursor: selectedColor && !disabled ? 'pointer' : 'default',
        borderColor: selectedColor
          ? SELECTED_COLORS[selectedColor]
          : COLORS[playerColor],
        boxShadow: selectedColor
          ? `${SELECTED_COLORS[selectedColor]} 0 0 10px`
          : 'none',
      }}
    />
  );
};
