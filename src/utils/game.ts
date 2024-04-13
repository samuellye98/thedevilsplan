import type { Color } from './colors';

export const GRID_DIMENSION = 4;

export type Board = Color[][][];

export type Player = {
  id: string;
  name: string;
  color: Color;
  created_at: number;
  num_pieces: number;
};

export type SelectedPiece =
  | {
      type: 'unplacedPiece';
      numPieces: number;
    }
  | {
      type: 'placedPiece';
      row: number;
      col: number;
    };

export type IGame = {
  game_state: 'IN_PROGRESS' | 'GAME_OVER';
  board: Board;
  player_ids: string[];
  winners: string[][];
  players: Record<string, Player>;
  current_turn: number;
  current_round: number;
};
