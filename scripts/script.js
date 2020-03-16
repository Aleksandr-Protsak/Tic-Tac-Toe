$(document).ready(function() {

    const theBoard = new Board();
    const ai = new aiMinimaks();
    const isActivePlayer1 = 'Player 1';

    let kindOfGame = $('input:checked').val();
    let isActivePlayer ='Player 1';

    theBoard.locationBoard();

    $('input').click(function(e){
        kindOfGame = e.target.value;
    });

    $('.playing-field div').click(playerMove);
        
    function playerMove() { 
        if($('.result-text').text())
            $('.result-text').empty();
            
        let col = $(this).attr('col');
        let row = $(this).attr('row');
        let point =[row, col];
        let player = isActivePlayer;

        theBoard.playGame(kindOfGame, player, point);

        (kindOfGame == 'player-player' && player == 'Player 1') ? isActivePlayer = 'Player 2' : isActivePlayer = 'Player 1' ;
    }

    function Board() {

        this.matrixResult = [];

        this.winner;

        this.locationBoard = function(){
            for(let i=0; i < 3; i++){
                this.matrixResult[i] = [];
                for(let j = 0; j < 3; j++){
                    this.matrixResult[i][j] = 0;
                    let idAtribute = i * 3 + j + 1;
                    $('.playing-field').append(`<div id=${idAtribute} col=${j} row=${i}>`);
                }
            }
        };

        this.clone = function(){
            let newBoard = new Board();

            for(let row = 0; row < 3; row++){
                newBoard.matrixResult[row] = [];
                for(let col = 0; col < 3; col++){
                    newBoard.matrixResult[row][col] = this.matrixResult[row][col];
                }
            }
            newBoard.fullItem = newBoard.runsOut();

            return newBoard;
        };

        this.updateCell = function(player, point, draw){
            let row = parseInt(point[0]);
            let col = parseInt(point[1]);
            
            (player == isActivePlayer1) ? this.matrixResult[row][col] = 1 : this.matrixResult[row][col] = -1;

           if(draw) this.drawIcon(player, point);
           this.winner = player;
        };

        this.drawIcon = function(player, point){
            let row = parseInt(point[0]);
            let col = parseInt(point[1]);
            let targetDiv = $(`div[row=${row}][col=${col}]`);

            (player == isActivePlayer1) ? targetDiv.append('X') : targetDiv.append('O');
            targetDiv.css({'pointer-events': 'none'});
        };

        this.playGame = function(kindOfGame, player, point){
            
            if(!this.winnerGame() && kindOfGame == 'player-player'){
                this.updateCell(player, point);
            }if(!this.winnerGame() && kindOfGame == 'player-computer'){
                this.updateCell(player, point);
                if(this.runsOut() !== 0)
                    this.updateCell('Computer', ai.getBestMove(theBoard), true);
            }
            this.drawIcon(player, point);
            this.gameOver(this.winner);
        };

        this.getAvailableMoves = function() {
            let moves = [];
            
            for(let i = 0; i < 3; i++)
                for(let j = 0; j < 3; j++)
                    if(this.matrixResult[i][j] == 0)
                        moves.push([i, j]);
            
            return moves;
        };

        this.winnerGame = function(){
            return this.checkLine() || this.checkDiagonal();
        };

        this.checkLine = function(){
            for(let i=0; i < 3; i++){

                let sumRow = this.matrixResult[i][0] + this.matrixResult[i][1] + this.matrixResult[i][2];
                let sumCol = this.matrixResult[0][i] + this.matrixResult[1][i] + this.matrixResult[2][i];

                if(sumRow == 3 || sumRow == -3 || sumCol == 3 || sumCol == -3){
                    return true;
                }
            }
        };

        this.checkDiagonal = function(){
            for(let j=0; j < 1; j++){
                let sumDiagonal1 = this.matrixResult[j][j] + this.matrixResult[j+1][j+1] + this.matrixResult[j+2][j+2];

                if(sumDiagonal1 == 3 || sumDiagonal1 == -3){
                    return true;
                }
            } 
            for(let j=1; j > 0; j--){
                let sumDiagonal2 = this.matrixResult[j-1][j+1] + this.matrixResult[j][j] + this.matrixResult[j+1][j-1];

                if(sumDiagonal2 == 3 || sumDiagonal2 == -3){
                    return true;
                }
            } 
        };

        this.runsOut = function(){
            let emptyCell = 9;
            for(let i=0; i < 3; i++){
                for(let j = 0; j < 3; j++){
                    if(this.matrixResult[i][j] != 0){
                        emptyCell -=1;
                    }
                }
            }
            return emptyCell;
        };
    
        this.gameOver = function(winner){
            if(this.winnerGame() || this.runsOut() == 0){
                if(this.winnerGame())
                     $('.result-text').text(`${winner} won the game!`);
                else
                    $('.result-text').text('The game was a draw!');

                setTimeout(function(){
                     $('.playing-field').empty();
                     theboard = new Board();
                     theBoard.locationBoard();
                     isActivePlayer = 'Player 1';
                     $('.playing-field div').click(playerMove);
                    }, 300);
            }
        };
    };

 
    function aiMinimaks() {
        this.max = 10;

        this.min = -10;

        this.player2 = 'Computer';

        this.minimax = function(board, player) {
            let bestScore = -10,
                currScore = 0,
                moves = board.getAvailableMoves();
            
            if(board.fullItem == 1 || board.winnerGame()){
                return this.evaluate(board);
            }
            
            if(player == this.player2) {
                bestScore = this.min;

                for(let move in moves) {
                    let newBoard = board.clone();
                    newBoard.updateCell(this.player2, moves[move]);
                    currScore = this.minimax(newBoard, isActivePlayer1);

                    if(currScore > bestScore) {
                        bestScore = currScore;
                    }
                }
                return bestScore;
            }
            
            if(player == isActivePlayer1) {
                bestScore = this.max;

                for(let move in moves) {
                    let newBoard = board.clone();
                    newBoard.updateCell(isActivePlayer1, moves[move]);
                    currScore = this.minimax(newBoard, this.player2);

                    if(currScore < bestScore) {
                        bestScore = currScore;
                    }
                }
                return bestScore;
            }
        };

        this.getBestMove = function(board) {
            let bestScore = this.min;
            let currScore;
            let bestMove = null;
            let moves = board.getAvailableMoves();
            const corners = [[0, 0], [0, 2], [2, 0], [2, 2]];

            if(board.runsOut() === 8 && board.matrixResult[1][1] === 0)
                return [1, 1];
            else if(board.runsOut() === 8 && board.matrixResult[1][1] === 1)
                return corners[Math.floor(Math.random() * 4)];

            for(let move in moves) {
                let newBoard = board.clone();
                newBoard.updateCell(this.player2, moves[move]);
                currScore = this.minimax(newBoard, isActivePlayer1);

                if(currScore > bestScore) {
                    bestScore = currScore;
                    bestMove = moves[move];
                }
            }

            return bestMove;
        };

        this.evaluate = function(board) {
            let score = 0;
            
            score += this.evaluateLine(board, 0, 0, 0, 1, 0, 2);  
            score += this.evaluateLine(board, 1, 0, 1, 1, 1, 2);  
            score += this.evaluateLine(board, 2, 0, 2, 1, 2, 2);  
            score += this.evaluateLine(board, 0, 0, 1, 0, 2, 0);  
            score += this.evaluateLine(board, 0, 1, 1, 1, 2, 1);  
            score += this.evaluateLine(board, 0, 2, 1, 2, 2, 2);  
            score += this.evaluateLine(board, 0, 0, 1, 1, 2, 2);  
            score += this.evaluateLine(board, 0, 2, 1, 1, 2, 0);  

            return score;
        };
        
        this.evaluateLine = function(board, r1, c1, r2, c2, r3, c3) {
            let score = 0;
            
            if(board.matrixResult[r1][c1] === -1)
                score = 1;
            else if(board.matrixResult[r1][c1] === 1)
                score = -1;
            
            if(board.matrixResult[r2][c2] === -1){
                if(score == 1) 
                    score = 10;
                else if (score === -1)
                    return 0;
                else 
                    score = 1;
            }
            else if(board.matrixResult[r2][c2] === 1){
                if(score == -1) 
                    score = -10;
                else if (score === 1) 
                    return 0;
                else 
                    score = -1;
            }
    
            if(board.matrixResult[r3][c3] === -1){
                if(score > 1) 
                    score *= 10;
                else if (score < 0)
                    return 0;
                else 
                    score = 1;
            }
            else if(board.matrixResult[r3][c3] === 1){
                if(score < 0)
                    score *= 10;
                else if (score > 1) 
                    return 0;
                else
                    score = -1;
            }
            return score;
        }
    }
});