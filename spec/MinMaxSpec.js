import * as BoardModel from '../js/BoardModel.js';
import * as MinMax from '../js/MinMax.js';
import * as Player from '../js/Player.js';

const sevenTimes = [0,1,2,3,4,5,6];
const PlayerScore = MinMax.SAME_PLAYER_CELL_SCORE;
const emtpyScore = MinMax.EMTPY_CELL_SCORE;

describe("MinMax", ()=> {

    let boardModel = new BoardModel.BoardModel();

    let cp = new Player.Player("cp", {isHuman : false});
    let p2 = new Player.Player("p2", {isHuman : true});
    cp.initPlayer(p2);

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
            expect(MinMax.evaluateCell(boardModel.columns[i].cells[0], boardModel, cp)).toBe(scores[i]);
            expect(MinMax.evaluateCell(boardModel.columns[i].cells[0], boardModel, p2)).toBe(scores[i]);    
        });
        //evaluate board
        expect(MinMax.evaluate(boardModel, p2)).toBe(scores.reduce((sum, score)=>sum+score, 0));

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
            expect(MinMax.evaluateCell(boardModel.columns[i].cells[0], boardModel, cp)).toBe(scores[i]);
        });
        //evaluate board
        expect(MinMax.evaluate(boardModel, cp)).toBe(scores.reduce((sum, score)=>sum+score, 0));

        
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
            expect(MinMax.evaluateCell(boardModel.columns[i].cells[0], boardModel, p2)).toBe(scores[i]);    
        });
        //evaluate board
        expect(MinMax.evaluate(boardModel, p2)).toBe(scores.reduce((sum, score)=>sum+score, 0));
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

        expect(MinMax.evaluateCell(boardModel.columns[0].cells[5], boardModel, cp)).toBe(score);

        
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

        expect(MinMax.evaluateCell(boardModel.columns[3].cells[5], boardModel, cp)).toBe(score);
    });


    it("should be able to be evaluate a winning position", ()=>{

        boardModel.init( [ 
            [0, cp, cp, cp]
        ]);
        expect(MinMax.pickColumn(boardModel, cp, 1)).toBe(0);
        
        boardModel.init( [ 
            [0, cp],
            [0, cp],
            [0, cp],
        ]);

        expect(MinMax.pickColumn(boardModel, cp,1)).toBe(1);

        boardModel.init( [ 
            [ 0,  0, cp, p2],
            [ 0, cp, p2, cp],
            [cp, p2, p2, p2],
        ]);

        expect(MinMax.pickColumn(boardModel,cp, 1)).toBe(3);

    });

    it("should be able to defend against a winning position", ()=>{

        boardModel.init( [ 
            [p2, p2, p2]
        ]);
        expect(MinMax.pickColumn(boardModel,cp, 2)).toBe(3);
        
        boardModel.init( [ 
            [0, p2],
            [0, p2],
            [0, p2],
        ]);

        expect(MinMax.pickColumn(boardModel, cp, 2)).toBe(1);

        boardModel.init( [ 
            [ 0,  0, p2, cp],
            [ 0, p2, cp, cp],
            [p2, cp, p2, p2],
        ]);

        expect(MinMax.pickColumn(boardModel,cp, 2)).toBe(3);

    });

    
    it("win instead of defend", ()=>{

        boardModel.init( [ 
            [ 0, cp],
            [ 0, cp],
            [ 0, cp],
            [p2, p2, p2, 0, ]
        ]);
        expect(MinMax.pickColumn(boardModel, cp, 2)).toBe(1);

        boardModel.init( [ 
            [ 0,  0, p2, cp],
            [ 0, p2, cp, p2],
            [p2, cp, cp, cp],
        ]);

        expect(MinMax.pickColumn(boardModel,cp,  2)).toBe(4);
    });

    
    it("win with 2 moves", ()=>{

        boardModel.init( [ 
            [  0, 0,  0,  0,  0],
            [  0, 0,  0, cp, p2],
            [ cp, 0, cp, cp, p2],
            [ p2, 0, cp, p2, cp]
        ]);
        expect(MinMax.pickColumn(boardModel, cp, 3)).toBe(1);

    });
});
