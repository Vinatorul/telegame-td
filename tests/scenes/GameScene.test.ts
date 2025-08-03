import { GameScene } from '../../src/scenes/GameScene';

describe('GameScene', () => {
  let gameScene: GameScene;

  beforeEach(() => {
    gameScene = new GameScene();

    gameScene['gameFieldContainer'] = {
      x: 0,
      y: 0,
      scale: 1,
      add: jest.fn()
    } as any;

    gameScene['towers'] = {
      getChildren: jest.fn().mockReturnValue([])
    } as any;

    gameScene['isDragging'] = false;
    gameScene['isPinching'] = false;
    gameScene['currentScale'] = 1;
  });

  test('handlePinchStart should set isPinching to true', () => {
    gameScene['handlePinchStart']({});

    expect(gameScene['isPinching']).toBe(true);
  });

  test('handlePinchStart should set isDragging to false if it was true', () => {
    gameScene['isDragging'] = true;

    gameScene['handlePinchStart']({});

    expect(gameScene['isDragging']).toBe(false);
    expect(gameScene['isPinching']).toBe(true);
  });

  test('handlePinchEnd should set isPinching to false', () => {
    gameScene['isPinching'] = true;

    gameScene['handlePinchEnd']({});

    expect(gameScene['isPinching']).toBe(false);
  });

  test('handleTouchDragStart should not set isDragging to true if isPinching is true', () => {
    gameScene['isPinching'] = true;

    gameScene['handleTouchDragStart']({ control: 'gameField' });

    expect(gameScene['isDragging']).toBe(false);
  });

  test('handleTouchDragStart should set isDragging to true if isPinching is false', () => {
    gameScene['isPinching'] = false;

    gameScene['handleTouchDragStart']({ control: 'gameField' });

    expect(gameScene['isDragging']).toBe(true);
  });
});
