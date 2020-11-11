import * as BoardModel from '../src/BoardModel.js';
import * as ComputerStrategy from '../src/ComputerStrategy.js';
import * as Player from '../src/Player.js';

const sevenTimes = [0,1,2,3,4,5,6];
const PlayerScore = ComputerStrategy.SAME_PLAYER_CELL_SCORE;
const emtpyScore = ComputerStrategy.EMTPY_CELL_SCORE;

describe("ComputerStrategy", ()=> {

    let boardModel = new BoardModel.BoardModel();

    let cp = new Player.Player("cp", false);
    let p2 = new Player.Player("p2", true);
    cp.setNextPlayer(p2);

    let score = 0;
    let scores = [];

    it("should be able to be evaluate an empty board", ()=>{

        boardModel.init( [ []  ]);

        //              vertical + diagonal + horizontal
        // column #0 :      3    +      3   +   3 
        scores.push(emtpyScore * (3 + 3 + 3));
        // column #1 :      3   +       3   +   4 
        scores.push(emtpyScore * (3 + 3 + 4)) ;
        // column #2 :      3           3       5
        scores.push(emtpyScore * (3 + 3 + 5) );
        // column #3 :      3           6       6
        scores.push( emtpyScore * (3 + 6 + 6) );
        // column #4 :      3           3       5
        scores.push(emtpyScore * (3 + 3 + 5));
        // column #5 :      3           3       4
        scores.push(emtpyScore * (3 + 3 + 4)) ;
        // column #6 :      3           3       3
        scores.push(emtpyScore * (3 + 3 + 3));

        //evaluate each cell
        sevenTimes.forEach((i)=>{
            expect(ComputerStrategy.evaluateCell(boardModel.columns[i].cells[0], boardModel, cp)).toBe(scores[i]);
            expect(ComputerStrategy.evaluateCell(boardModel.columns[i].cells[0], boardModel, p2)).toBe(scores[i]);    
        });
        //evaluate board
        expect(ComputerStrategy.evaluate(boardModel, p2)).toBe(scores.reduce((sum, score)=>sum+score, 0));

        //play on column #3
        boardModel.play(boardModel.columns[3], cp);

        scores = [];
        //              vertical + diagonal + horizontal    current cell
        // column #0 :      3    +      3   +   (2+ 1 Player) 
        scores.push(emtpyScore * (3 * 2 + 2) + 1 * PlayerScore);
        // column #1 :      3   +       3   +   (3+ 1 Player)
        scores.push(emtpyScore * (3 * 3) + 1 * PlayerScore);
        // column #2 :      3           3       (4 + 1 Player)
        scores.push(emtpyScore * (3 * 2 + 4) + 1 * PlayerScore);
        // column #3 :      3           6       6               1 
        scores.push( emtpyScore * (3 + 6 + 6) + 1 * PlayerScore);
        // column #4 :      3           3       (4 + 1 Player)
        scores.push(emtpyScore * (3 * 2 + 4) + 1 * PlayerScore);
        // column #5 :      3           3        (3+ 1 Player)
        scores.push(emtpyScore * (3 * 3) + 1 * PlayerScore);
        // column #6 :      3           3       2+ 1 player
        scores.push(emtpyScore * (3 * 2 + 2) + 1 * PlayerScore);

        //evaluate each cell for computer player
        sevenTimes.forEach((i)=>{
            expect(ComputerStrategy.evaluateCell(boardModel.columns[i].cells[0], boardModel, cp)).toBe(scores[i]);
        });
        //evaluate board
        expect(ComputerStrategy.evaluate(boardModel, cp)).toBe(scores.reduce((sum, score)=>sum+score, 0));

        
        scores = [];
        //              vertical + diagonal + horizontal    current cell
        // column #0 :      3    +      3   +   0 
        scores.push(emtpyScore * (3 + 3) ) ;
        // column #1 :      3   +       3       0
        scores.push(emtpyScore * (3 + 3) );
        // column #2 :      3           3       0
        scores.push(emtpyScore * (3 + 3) );
        // column #3 :      0           0       0                
        scores.push( emtpyScore * 0 );
        // column #4 :      3           3       0
        scores.push(emtpyScore * (3 + 3) );
        // column #5 :      3           3       0
        scores.push(emtpyScore * (3 + 3) );
        // column #6 :      3           3       0
        scores.push(emtpyScore * (3 + 3) );

        //evaluate each cell for p2 player
        sevenTimes.forEach((i)=>{
            expect(ComputerStrategy.evaluateCell(boardModel.columns[i].cells[0], boardModel, p2)).toBe(scores[i]);    
        });
        //evaluate board
        expect(ComputerStrategy.evaluate(boardModel, p2)).toBe(scores.reduce((sum, score)=>sum+score, 0));
    });

    it("should be able to be evaluate almost complete column", ()=>{

        boardModel.init( [ 
            [],
            [p2],
            [cp],
            [p2],
            [cp],
            [p2],
        ]);

        //              vertical + diagonal + horizontal
        // column #0 :      0    +      3   +   3 
        score = emtpyScore * (0 + 3 + 3);

        expect(ComputerStrategy.evaluateCell(boardModel.columns[0].cells[5], boardModel, cp)).toBe(score);

        
        boardModel.init( [ 
            [0,0,0,0],
            [0,0,0,p2],
            [0,0,0,cp],
            [0,0,0,p2],
            [0,0,0,cp],
            [0,0,0,p2],
        ]);

        //              vertical + diagonal + horizontal
        // column #0 :      0    +      3   +   3 
        score = emtpyScore * (0 + 6 + 6);

        expect(ComputerStrategy.evaluateCell(boardModel.columns[3].cells[5], boardModel, cp)).toBe(score);
    });


    it("should be able to be evaluate a winning position", ()=>{

        boardModel.init( [ 
            [0, cp, cp, cp]
        ]);
        expect(cp.strategy.pickColumn(boardModel, 1)).toBe(0);
        
        boardModel.init( [ 
            [0, cp],
            [0, cp],
            [0, cp],
        ]);

        expect(cp.strategy.pickColumn(boardModel, 1)).toBe(1);

        boardModel.init( [ 
            [ 0,  0, cp, p2],
            [ 0, cp, p2, cp],
            [cp, p2, p2, p2],
        ]);

        expect(cp.strategy.pickColumn(boardModel, 1)).toBe(3);

    });

    it("should be able to defend against a winning position", ()=>{

        boardModel.init( [ 
            [p2, p2, p2]
        ]);
        expect(cp.strategy.pickColumn(boardModel, 2)).toBe(3);
        
        boardModel.init( [ 
            [0, p2],
            [0, p2],
            [0, p2],
        ]);

        expect(cp.strategy.pickColumn(boardModel, 2)).toBe(1);

        boardModel.init( [ 
            [ 0,  0, p2, cp],
            [ 0, p2, cp, cp],
            [p2, cp, p2, p2],
        ]);

        expect(cp.strategy.pickColumn(boardModel,2)).toBe(3);

    });

    
    it("win instead of defend", ()=>{

        boardModel.init( [ 
            [ 0, cp],
            [ 0, cp],
            [ 0, cp],
            [p2, p2, p2, 0, ]
        ]);
        expect(cp.strategy.pickColumn(boardModel, 2)).toBe(1);

        boardModel.init( [ 
            [ 0,  0, p2, cp],
            [ 0, p2, cp, p2],
            [p2, cp, cp, cp],
        ]);

        expect(cp.strategy.pickColumn(boardModel, 2)).toBe(4);
    });

    
    it("win with 2 moves", ()=>{

        boardModel.init( [ 
            [  0, 0,  0,  0,  0],
            [  0, 0,  0, cp, p2],
            [ cp, 0, cp, cp, p2],
            [ p2, 0, cp, p2, cp]
        ]);
        expect(cp.strategy.pickColumn(boardModel, 3)).toBe(1);

    });
});