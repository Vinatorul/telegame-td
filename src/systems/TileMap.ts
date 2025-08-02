import * as Phaser from 'phaser';
import { PATH_COLOR } from '../config';

export enum TileType {
  EMPTY = 0,
  PATH = 1,
  TOWER = 2,
  OBSTACLE = 3
}

export class TileMap {
  private scene: Phaser.Scene;
  private tileSize: number;
  private gridWidth: number;
  private gridHeight: number;
  private tiles: TileType[][];
  private graphics: Phaser.GameObjects.Graphics;
  private width: number;
  private height: number;
  private container: Phaser.GameObjects.Container;

  constructor(
    scene: Phaser.Scene,
    width: number,
    height: number,
    tileSize: number,
    container: Phaser.GameObjects.Container
  ) {
    this.scene = scene;
    this.tileSize = tileSize;
    this.container = container;

    this.gridWidth = 20;
    this.gridHeight = 20;

    this.width = this.gridWidth * this.tileSize;
    this.height = this.gridHeight * this.tileSize;

    this.graphics = scene.add.graphics();
    this.container.add(this.graphics);

    this.resetTiles();
  }

  private resetTiles(): void {
    this.tiles = Array(this.gridHeight)
      .fill(null)
      .map(() => Array(this.gridWidth).fill(TileType.EMPTY));
  }

  public createPath(path: number[][]): Phaser.Curves.Path {
    const phaserPath = new Phaser.Curves.Path();

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (this.tiles[y][x] === TileType.PATH) {
          this.tiles[y][x] = TileType.EMPTY;
        }
      }
    }

    path.forEach(point => {
      const [gridY, gridX] = point;
      if (gridY >= 0 && gridY < this.gridHeight && gridX >= 0 && gridX < this.gridWidth) {
        this.tiles[gridY][gridX] = TileType.PATH;
      }
    });

    if (path.length > 0) {
      const startPoint = this.gridToPixel(path[0][1], path[0][0]);
      phaserPath.moveTo(startPoint.x, startPoint.y);

      for (let i = 1; i < path.length; i++) {
        const point = this.gridToPixel(path[i][1], path[i][0]);
        phaserPath.lineTo(point.x, point.y);
      }
    }

    return phaserPath;
  }

  public canPlaceTower(gridX: number, gridY: number): boolean {
    if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
      return false;
    }

    return this.tiles[gridY][gridX] === TileType.EMPTY;
  }

  public placeTower(gridX: number, gridY: number): boolean {
    if (!this.canPlaceTower(gridX, gridY)) {
      return false;
    }

    this.tiles[gridY][gridX] = TileType.TOWER;
    return true;
  }

  public removeTower(gridX: number, gridY: number): boolean {
    if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
      return false;
    }

    if (this.tiles[gridY][gridX] === TileType.TOWER) {
      this.tiles[gridY][gridX] = TileType.EMPTY;
      return true;
    }

    return false;
  }

  public getTileType(gridX: number, gridY: number): TileType {
    if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
      return TileType.OBSTACLE;
    }

    return this.tiles[gridY][gridX];
  }

  public pixelToGrid(x: number, y: number): { gridX: number; gridY: number } {
    const gridX = Math.floor(x / this.tileSize);
    const gridY = Math.floor(y / this.tileSize);

    return { gridX, gridY };
  }

  public gridToPixel(gridX: number, gridY: number): { x: number; y: number } {
    const x = (gridX + 0.5) * this.tileSize;
    const y = (gridY + 0.5) * this.tileSize;

    return { x, y };
  }

  public render(): void {
    this.graphics.clear();

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const tileType = this.tiles[y][x];
        const tileX = x * this.tileSize;
        const tileY = y * this.tileSize;

        if (tileType === TileType.PATH) {
          this.graphics.fillStyle(PATH_COLOR, 1);
          this.graphics.fillRect(tileX, tileY, this.tileSize, this.tileSize);
        } else if (tileType === TileType.EMPTY) {
          this.graphics.lineStyle(1, 0xcccccc, 0.3);
          this.graphics.strokeRect(tileX, tileY, this.tileSize, this.tileSize);
        }
      }
    }
  }

  public highlightTile(gridX: number, gridY: number, valid: boolean): void {
    if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
      return;
    }

    const tileX = gridX * this.tileSize;
    const tileY = gridY * this.tileSize;

    this.graphics.lineStyle(2, valid ? 0x00ff00 : 0xff0000, 0.8);
    this.graphics.strokeRect(tileX, tileY, this.tileSize, this.tileSize);
  }

  public clearHighlight(): void {
    this.render();
  }

  public resize(width: number, height: number): void {
    console.log(`TileMap.resize called with width=${width}, height=${height}`);
    console.log(`Current tileSize=${this.tileSize}`);

    this.width = this.gridWidth * this.tileSize;
    this.height = this.gridHeight * this.tileSize;

    console.log(`Grid dimensions: ${this.gridWidth}x${this.gridHeight}`);
    console.log(`TileMap dimensions after resize: ${this.width}x${this.height}`);
  }

  public getGridDimensions(): { width: number; height: number } {
    return {
      width: this.gridWidth,
      height: this.gridHeight
    };
  }
}
