import { CellCodeEnum } from "./enums";

/* Defining the structure of the cell. */
export interface CellStructure {
	type: string | number;
	y: number;
	x: number;
	id: number;
	label: CellCodeEnum | string;
	isOpened: boolean;
	isMine: boolean;
	isMineExploded: boolean;
	isCenterZero?: boolean;
	openedIdClassName?: string;
}

/* Defining the structure of the board. */
export interface BoardStructure {
	board: number[][] | any[][];
}