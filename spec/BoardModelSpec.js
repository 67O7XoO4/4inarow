import * as BoardModel from '../src/BoardModel.js';
import * as Player from '../src/Player.js';

let p1 = new Player.Player("p1");
let p2 = new Player.Player("p2");

let p3 = new Player.Player("p3");
let p4 = new Player.Player("p4");

let p5 = new Player.Player("p5");
let p6 = new Player.Player("p6");
let p7 = new Player.Player("p7");
let p8 = new Player.Player("p8");
let p9 = new Player.Player("p9");

describe("BoardModel", ()=> {

  let boardModel = new BoardModel.BoardModel();
    
  it("should be able to be instanciated ", ()=>{
    expect(boardModel).toBeInstanceOf(BoardModel.BoardModel);
  });

  let boardAsArray = [
    [0, 0, 0, p1          ],
    [0, 0, 0, p1, p2, 0, 0],
  ];
  let checkInit = function(boardModel){
    
    expect(boardModel.columns[0].isEmpty()).toBeTrue();
    expect(boardModel.columns[1].isEmpty()).toBeTrue();
    expect(boardModel.columns[2].isEmpty()).toBeTrue();
    
    expect(boardModel.columns[3].isEmpty()).toBeFalse();

    expect(boardModel.columns[3].cells[0].isEmpty()).toBeFalse();
    expect(boardModel.columns[3].cells[0].value).toBe(p1);
    expect(boardModel.columns[3].cells[1].value).toBe(p1);
    expect(boardModel.columns[3].cells[2].isEmpty()).toBeTrue();
    
    expect(boardModel.columns[4].cells[0].value).toBe(p2);
    expect(boardModel.columns[4].cells[1].isEmpty()).toBeTrue();

    expect(boardModel.columns[5].cells[0].isEmpty()).toBeTrue();
    expect(boardModel.columns[6].cells[0].isEmpty()).toBeTrue();
  }

  it("should be able to be cleared and initialized ", ()=>{
    boardModel.init([[]]);
    boardModel.play(boardModel.columns[0], p1);

    boardModel.init(boardAsArray);
    checkInit(boardModel);
  });

  
  it("should be able to be cloned", ()=>{
    boardModel.init(boardAsArray);

    let otherBoard = boardModel.clone();
    
    checkInit(otherBoard);
  });

  it("should be able to be complete", ()=>{
    boardModel.init( [
      [0 , p1, p1, p1, p1, p1, p1],
      [p1, p1, p1, p1, p1, p1, p1],
      [p1, p1, p1, p1, p1, p1, p1],
      [p1, p1, p1, p1, p1, p1, p1],
      [p1, p1, p1, p1, p1, p1, p1],
      [p1, p1, p1, p1, p1, p1, p1],
    ]);

    expect(boardModel.columns[0].isComplete()).toBeFalse();
    expect(boardModel.isComplete()).toBeFalse();
    
    boardModel.play(boardModel.columns[0], p1);

    expect(boardModel.columns[0].isComplete()).toBeTrue();
    expect(boardModel.isComplete()).toBeTrue();

  });

  
  it("should be able to find last and first cell, do play and undo", ()=>{
    boardModel.init( [
      [0, p1],
    ]);

    expect(boardModel.columns[0].getLastPlayedCell()).toBeUndefined();
    expect(boardModel.columns[1].getLastPlayedCell().value).toBe(p1);

    expect(boardModel.columns[0].getFirstCell().isEmpty()).toBeTrue();
    expect(boardModel.columns[1].getFirstCell().value).toBe(p1);
    
    boardModel.play(boardModel.columns[1], p2);

    expect(boardModel.columns[1].getLastPlayedCell().value).toBe(p2);

    boardModel.columns[1].removeLastPlay();
    
    expect(boardModel.columns[1].getLastPlayedCell().value).toBe(p1);
    
    boardModel.columns[1].removeLastPlay();
    
    expect(boardModel.columns[1].getLastPlayedCell()).toBeUndefined();
    expect(boardModel.columns[1].isEmpty()).toBeTrue();
  });

  
  it("should be able to iterate trough the board", ()=>{
    boardModel.init( [
      [p3, p4, 0],
      [0 , p1, p2],
    ]);

    let str = '';
    boardModel.forEachCell((col, cell)=>{
      str+=cell.value.name + ' ';
    });
    expect(str).toMatch('^- p3 - - - - p1 p4 - - - - p2 -');
  });

  it("should be able to select a column by its num and play on it", ()=>{
    boardModel.init( [
      [0 , p1, p2],
    ]);
    boardModel.setSelectedColumn(3);

    expect(boardModel.columns[3].isEmpty()).toBeTrue();

    boardModel.playAtSelectedColumn(p3);

    expect(boardModel.columns[3].isEmpty()).toBeFalse();
    expect(boardModel.columns[3].getLastPlayedCell().value).toBe(p3);

    boardModel.play(boardModel.columns[3], p4);

    expect(boardModel.columns[3].getLastPlayedCell().value).toBe(p4);
  });

  it("should not be able to play on a complete column", ()=>{
    boardModel.init( [
      [0 ],
      [p1],
      [p1],
      [p1],
      [p1],
      [p1],
    ]);
    expect(boardModel.isComplete()).toBeFalse();
    
    boardModel.play(boardModel.columns[0], p1);

    expect(boardModel.columns[0].isComplete()).toBeTrue();

    expect( ()=>{
      boardModel.play(boardModel.columns[0], p1) ;
    }).toThrow();
  });

  it("should be able to get previous/next/sibling of a given cell", ()=>{
    boardModel.init( [
      [p3, p6 ,p9 ],
      [p2, p5 ,p8 ],
      [p1, p4 ,p7 ],
    ]);
    let p5Cell = boardModel.columns[1].cells[1];

    expect(p5Cell.value).toBe(p5);

    expect(boardModel.getPrevious(p5Cell).value).toBe(p4);
    expect(boardModel.getNext(p5Cell).value).toBe(p6);
    
    expect(boardModel.getLeftSibling(p5Cell).value).toBe(p2);
    expect(boardModel.getRightSibling(p5Cell).value).toBe(p8);
    
    expect(boardModel.getLeftPreviousSibling(p5Cell).value).toBe(p1);
    expect(boardModel.getRightPreviousSibling(p5Cell).value).toBe(p7);
    
    expect(boardModel.getLeftNextSibling(p5Cell).value).toBe(p3);
    expect(boardModel.getRightNextSibling(p5Cell).value).toBe(p9);
  });

  
  it("should Not be able to get previous/next/sibling on border cell", ()=>{
    boardModel.init( [
      [p3, 0, 0, 0, 0, 0, p4 ],
      [p1, 0, 0, 0, 0, 0, p2 ],
      [p1, 0, 0, 0, 0, 0, p2 ],
      [p1, 0, 0, 0, 0, 0, p2 ],
      [p1, 0, 0, 0, 0, 0, p2 ],
      [p1, 0, 0, 0, 0, 0, p2 ]
    ]);
    let cell = boardModel.columns[0].cells[0];
    expect(cell.value).toBe(p1);

    expect(boardModel.getPrevious(cell)).toBeNull();
    expect(boardModel.getLeftSibling(cell)).toBeNull();
    expect(boardModel.getLeftPreviousSibling(cell)).toBeNull();
    expect(boardModel.getLeftNextSibling(cell)).toBeNull();

    cell = boardModel.columns[0].cells[5];
    expect(cell.value).toBe(p3);

    expect(boardModel.getNext(cell)).toBeNull();
    expect(boardModel.getLeftSibling(cell)).toBeNull();
    expect(boardModel.getLeftPreviousSibling(cell)).toBeNull();
    expect(boardModel.getLeftNextSibling(cell)).toBeNull();

    cell = boardModel.columns[6].cells[0];
    expect(cell.value).toBe(p2);

    expect(boardModel.getPrevious(cell)).toBeNull();
    expect(boardModel.getRightSibling(cell)).toBeNull();
    expect(boardModel.getRightPreviousSibling(cell)).toBeNull();
    expect(boardModel.getRightNextSibling(cell)).toBeNull();


    cell = boardModel.columns[6].cells[5];
    expect(cell.value).toBe(p4);

    expect(boardModel.getNext(cell)).toBeNull();
    expect(boardModel.getRightSibling(cell)).toBeNull();
    expect(boardModel.getRightPreviousSibling(cell)).toBeNull();
    expect(boardModel.getRightNextSibling(cell)).toBeNull();
  });

  describe("check If Last Play Win", ()=> {
  
    it("vertical", ()=>{
      
      boardModel.init( [
        [0 ],
        [p1 ],
        [p1 ]
      ]);

      boardModel.play(boardModel.columns[0], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeFalse();

      boardModel.play(boardModel.columns[0], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeTrue();

    });

    it("Horizontal right", ()=>{
      
      boardModel.init( [
        [p1,p1 ]
      ]);

      boardModel.play(boardModel.columns[2], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeFalse();

      boardModel.play(boardModel.columns[3], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeTrue();
      
      boardModel.init( [
        [p1,p1 ]
      ]);

      boardModel.play(boardModel.columns[3], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeFalse();

      boardModel.play(boardModel.columns[2], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeTrue();

    });
    it("Horizontal left", ()=>{

      boardModel.init( [
        [0, 0, p1,p1 ]
      ]);

      boardModel.play(boardModel.columns[1], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeFalse();

      boardModel.play(boardModel.columns[0], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeTrue();
      
      boardModel.init( [
        [0, 0, p1,p1 ]
      ]);

      boardModel.play(boardModel.columns[0], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeFalse();

      boardModel.play(boardModel.columns[1], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeTrue();

    });

    
    it("diag up to bottom right", ()=>{
      
      boardModel.init( [
        [p1,  0,  0,  0 ],
        [p2, p1,  0,  0 ],
        [p2, p2,  0,  0 ],
        [p2, p2, p2,  0 ]
      ]);

      boardModel.play(boardModel.columns[2], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeFalse();

      boardModel.play(boardModel.columns[3], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeTrue();

      boardModel.init( [
        [p1,  0,  0,  0 ],
        [p2, p1,  0,  0 ],
        [p2, p2,  0,  0 ],
        [p2, p2, p2,  0 ]
      ]);
      boardModel.play(boardModel.columns[3], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeFalse();

      boardModel.play(boardModel.columns[2], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeTrue();
    });

    it("diag up to bottom  left", ()=>{

      boardModel.init( [
        [ 0,  0,  0,  0 ],
        [p2,  0,  0,  0 ],
        [p2, p2,  p1, 0 ],
        [p2, p2, p2, p1 ]
      ]);

      boardModel.play(boardModel.columns[1], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeFalse();

      boardModel.play(boardModel.columns[0], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeTrue();

      boardModel.init( [
        [ 0,  0,  0,  0 ],
        [p2,  0,  0,  0 ],
        [p2, p2,  p1, 0 ],
        [p2, p2, p2, p1 ]
      ]);
      boardModel.play(boardModel.columns[0], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeFalse();

      boardModel.play(boardModel.columns[1], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeTrue();    });

    });


    it("diag bottom to up left", ()=>{
      
      boardModel.init( [
        [  0,  0,  0, p1 ],
        [  0,  0, p1, p2 ],
        [  0,  0, p2, p2 ],
        [  0, p2, p2, p2 ]
      ]);

      boardModel.play(boardModel.columns[1], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeFalse();

      boardModel.play(boardModel.columns[0], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeTrue();

      boardModel.init( [
        [  0,  0,  0, p1 ],
        [  0,  0, p1, p2 ],
        [  0,  0, p2, p2 ],
        [  0, p2, p2, p2 ]
      ]);

      boardModel.play(boardModel.columns[0], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeFalse();

      boardModel.play(boardModel.columns[1], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeTrue();
    });

    it("diag up to bottom right", ()=>{

      boardModel.init( [
        [  0,  0,  0,  0 ],
        [  0,  0,  0, p2 ],
        [  0, p1, p2, p2 ],
        [ p1, p2, p2, p2 ]
      ]);

      boardModel.play(boardModel.columns[2], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeFalse();

      boardModel.play(boardModel.columns[3], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeTrue();

      boardModel.init( [
        [  0,  0,  0,  0 ],
        [  0,  0,  0, p2 ],
        [  0, p1, p2, p2 ],
        [ p1, p2, p2, p2 ]
      ]);

      boardModel.play(boardModel.columns[3], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeFalse();

      boardModel.play(boardModel.columns[2], p1);
      expect(boardModel.checkIfLastPlayWin()).toBeTrue();
    });

});//check If Last Play Win
