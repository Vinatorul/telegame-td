import { TileMap, TileType } from '../../src/systems/TileMap';

describe('TileMap', () => {
  let mockScene: any;
  let mockContainer: any;
  let tileMap: TileMap;
  const tileSize = 40;
  const width = 800;
  const height = 800;

  beforeEach(() => {
    mockScene = {
      add: {
        graphics: jest.fn().mockReturnValue({
          clear: jest.fn().mockReturnThis(),
          lineStyle: jest.fn().mockReturnThis(),
          strokeRect: jest.fn().mockReturnThis(),
          fillStyle: jest.fn().mockReturnThis(),
          fillRect: jest.fn().mockReturnThis()
        })
      }
    };

    mockContainer = {
      add: jest.fn()
    };

    tileMap = new TileMap(mockScene as any, width, height, tileSize, mockContainer as any);
  });

  test('should initialize with correct properties', () => {
    expect(tileMap).toBeDefined();
    expect(tileMap['tileSize']).toBe(tileSize);
    expect(tileMap['gridWidth']).toBe(20);
    expect(tileMap['gridHeight']).toBe(20);
    expect(tileMap['width']).toBe(20 * tileSize);
    expect(tileMap['height']).toBe(20 * tileSize);
    expect(mockScene.add.graphics).toHaveBeenCalled();
    expect(mockContainer.add).toHaveBeenCalled();
  });

  test('should convert pixel coordinates to grid coordinates', () => {
    const pixelX = 85;
    const pixelY = 125;

    const { gridX, gridY } = tileMap.pixelToGrid(pixelX, pixelY);

    expect(gridX).toBe(Math.floor(pixelX / tileSize));
    expect(gridY).toBe(Math.floor(pixelY / tileSize));
  });

  test('should convert grid coordinates to pixel coordinates', () => {
    const gridX = 2;
    const gridY = 3;

    const { x, y } = tileMap.gridToPixel(gridX, gridY);

    expect(x).toBe((gridX + 0.5) * tileSize);
    expect(y).toBe((gridY + 0.5) * tileSize);
  });

  test('should create a path and mark tiles as path tiles', () => {
    const pathCoords = [
      [10, 0],
      [10, 5],
      [5, 5],
      [5, 10],
      [15, 10]
    ];

    const path = tileMap.createPath(pathCoords);

    expect(path).toBeDefined();

    pathCoords.forEach(([y, x]) => {
      expect(tileMap.getTileType(x, y)).toBe(TileType.PATH);
    });

    expect(tileMap.getTileType(0, 0)).toBe(TileType.EMPTY);
  });

  test('should allow placing towers on empty tiles', () => {
    const gridX = 3;
    const gridY = 4;

    expect(tileMap.canPlaceTower(gridX, gridY)).toBe(true);

    const result = tileMap.placeTower(gridX, gridY);

    expect(result).toBe(true);
    expect(tileMap.getTileType(gridX, gridY)).toBe(TileType.TOWER);
  });

  test('should not allow placing towers on non-empty tiles', () => {
    const gridX = 3;
    const gridY = 4;

    tileMap.placeTower(gridX, gridY);

    expect(tileMap.canPlaceTower(gridX, gridY)).toBe(false);

    const result = tileMap.placeTower(gridX, gridY);

    expect(result).toBe(false);
  });

  test('should not allow placing towers outside the grid', () => {
    const gridX = -1;
    const gridY = 4;

    expect(tileMap.canPlaceTower(gridX, gridY)).toBe(false);

    const result = tileMap.placeTower(gridX, gridY);

    expect(result).toBe(false);
  });

  test('should remove towers from the grid', () => {
    const gridX = 3;
    const gridY = 4;

    tileMap.placeTower(gridX, gridY);
    expect(tileMap.getTileType(gridX, gridY)).toBe(TileType.TOWER);

    const result = tileMap.removeTower(gridX, gridY);

    expect(result).toBe(true);
    expect(tileMap.getTileType(gridX, gridY)).toBe(TileType.EMPTY);
  });

  test('should not remove towers that do not exist', () => {
    const gridX = 3;
    const gridY = 4;

    const result = tileMap.removeTower(gridX, gridY);

    expect(result).toBe(false);
  });

  test('should render the tilemap', () => {
    tileMap.render();

    expect(tileMap['graphics'].clear).toHaveBeenCalled();
  });

  test('should highlight a tile', () => {
    const gridX = 3;
    const gridY = 4;

    tileMap.highlightTile(gridX, gridY, true);

    expect(tileMap['graphics'].lineStyle).toHaveBeenCalled();
    expect(tileMap['graphics'].strokeRect).toHaveBeenCalled();
  });

  test('should clear highlight by re-rendering', () => {
    const renderSpy = jest.spyOn(tileMap, 'render');

    tileMap.clearHighlight();

    expect(renderSpy).toHaveBeenCalled();
  });

  test('should return grid dimensions', () => {
    const dimensions = tileMap.getGridDimensions();

    expect(dimensions).toEqual({
      width: 20,
      height: 20
    });
  });
});
