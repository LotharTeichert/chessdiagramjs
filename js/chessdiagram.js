/*
Copyright (c) 2013 Dr. Lothar Teichert 
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and 
associated documentation files (the "Software"), to deal in the Software without restriction, including 
without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial 
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT 
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var ChessDiagram = new function() {

// Workaround to get the img path
// We assume the img directory is a sibling of the script directory and its name is "img"
  var scripts = document.getElementsByTagName('script');          // get all scripts on the page, this one is the last!
  var path = scripts[scripts.length-1].src.split('?')[0];         // remove any ?query
  var imgPath = path.split('/').slice(0, -2).join('/') + '/img/'; // remove last filename parts and add directory name
  var pieceTheme = imgPath + 'chesspieces/wikipedia/{piece}.png';
// Options
  var languageIn = "English";
  var languageOut = "English";
  var orientation = 'white';
  var pgnFormat = '2';
  var divStyle = '-';
  var notationStyle = 'background-color:#f0f0f0;font-family:Lucida Console;font-size:12px;line-height:200%';
  var boardWidth = '240px';
  var showNotation = 1;
// values for showNotation = 1: traditional notation, 2: ChessBoard notation (inside board), 3: no notation, 

  var movePattern = { 
  K: [/(K(?:.?.?.{7})?x)/, /(x(?:.?.?.{7})?K)/],
  R: [/(R1{0,7}x)/, /(R.{8}(?:1.{8}){0,7}x)/, /(x1{0,7}R)/, /(x.{8}(?:1.{8}){0,7}R)/],
  B: [/(B.{9}(?:1.{9}){0,7}x)/, /(B.{7}(?:1.{7}){0,7}x)/, /(x.{9}(?:1.{9}){0,7}B)/, /(x.{7}(?:1.{7}){0,7}B)/],
  Q: [/(Q1{0,7}x)/, /(Q.{8}(?:1.{8}){0,7}x)/, /(Q.{9}(?:1.{9}){0,7}x)/, /(Q.{7}(?:1.{7}){0,7}x)/,
      /(x1{0,7}Q)/, /(x.{8}(?:1.{8}){0,7}Q)/, /(x.{9}(?:1.{9}){0,7}Q)/, /(x.{7}(?:1.{7}){0,7}Q)/],
  N: [/(N.{6}x)[^\/]/, /(N.{9}[^\/]x)/, /(N.{16}x)/, /(N.{18}x)/,
      /(x.{6}N)[^\/]/, /(x.{9}[^\/]N)/, /(x.{16}N)/, /(x.{18}N)/],
  k: [/(k(?:.?.?.{7})?x)/, /(x(?:.?.?.{7})?k)/],
  r: [/(r1{0,7}x)/, /(r.{8}(?:1.{8}){0,7}x)/, /(x1{0,7}r)/, /(x.{8}(?:1.{8}){0,7}r)/],
  b: [/(b.{9}(?:1.{9}){0,7}x)/, /(b.{7}(?:1.{7}){0,7}x)/, /(x.{9}(?:1.{9}){0,7}b)/, /(x.{7}(?:1.{7}){0,7}b)/],
  q: [/(q1{0,7}x)/, /(q.{8}(?:1.{8}){0,7}x)/, /(q.{9}(?:1.{9}){0,7}x)/, /(q.{7}(?:1.{7}){0,7}x)/,
      /(x1{0,7}q)/, /(x.{8}(?:1.{8}){0,7}q)/, /(x.{9}(?:1.{9}){0,7}q)/, /(x.{7}(?:1.{7}){0,7}q)/],
  n: [/(n.{6}x)[^\/]/, /(n.{9}[^\/]x)/, /(n.{16}x)/, /(n.{18}x)/,
      /(x.{6}n)[^\/]/, /(x.{9}[^\/]n)/, /(x.{16}n)/, /(x.{18}n)/] 
  };
  var pinPattern = {
  w: [/K1*o1*[rq]/, /K(?:.{8}1)*.{8}o(?:.{8}1)*.{8}[rq]/, /K(?:.{7}1)*.{7}o(?:.{7}1)*.{7}[bq]/, /K(?:.{9}1)*.{9}o(?:.{9}1)*.{9}[bq]/,
      /[rq]1*o1*K/, /[rq](?:.{8}1)*.{8}o(?:.{8}1)*.{8}K/, /[bq](?:.{7}1)*.{7}o(?:.{7}1)*.{7}K/, /[bq](?:.{9}1)*.{9}o(?:.{9}1)*.{9}K/],
  b: [/k1*o1*[RQ]/, /k(?:.{8}1)*.{8}o(?:.{8}1)*.{8}[RQ]/, /k(?:.{7}1)*.{7}o(?:.{7}1)*.{7}[BQ]/, /k(?:.{9}1)*.{9}o(?:.{9}1)*.{9}[BQ]/,
      /[RQ]1*o1*k/, /[RQ](?:.{8}1)*.{8}o(?:.{8}1)*.{8}k/, /[BQ](?:.{7}1)*.{7}o(?:.{7}1)*.{7}k/, /[BQ](?:.{9}1)*.{9}o(?:.{9}1)*.{9}k/]
  };
  var castlingPattern = /^(?:\d)*(?:\.)*O-O(-O)?/;
  var pieceMovePattern = /^(?:\d)*(?:\.)*([KQRBN])([a-h]?)([1-8]?)[-x:]?([a-h])([1-8])/;
  var pawnMovePattern = /^(?:\d)*(?:\.)*(?:P)?([a-h]?)([1-8]?)[-x:]?([a-h])([1-8]?)[x:]?=?([QBRN]?) ?(e\.?p)?/;
  var resultPattern = /[(?:1\-0)(?:0\-1)(?:1/2\-1/2)(?:\*)]/;

  var boards = [];
// This is a list of all diagrams on the page.
// Elements of "boards" are objects with
//   fens:          tree of fen strings
//   moves:         tree of move strings
//   board:         instance of ChessBoard
//   movePtr:       array of numbers indicating the diagram position in the move/fen-tree
//   id:            HTML-Id of DIV-tag to be used
//   dragPromotion: target + piece if a promotion takes place by dragging
//   lineMove:      number of move in the current line
//   lineFens:      array fen strings for current line
//   lineMoves:     array of move strings for current line
//   showPGN:       display status of the associated pgn div       

  var board, sideToMove, castle, ep, halfMoves, moveCount, moveParts;

  function makeMove(fen, move) {
// Computes new fen from old fen and move description.
// Move description may be in English or German 
//  (ambigous is a leading B which is treated as Bishop,
//   so avoid B in German).
// Accepts long and short notations, leading move numbers
//   and move decorations.

// Breakup fen for easy and readable access of parts
    var fenParts = fen.split(' ');
    board = fenParts[0];
    sideToMove = fenParts[1];
    castle = fenParts[2];
    ep = fenParts[3];
    halfMoves = fenParts[4];
    moveCount = fenParts[5];

// Expand board to apply regular expressions
    board = board.replace(/8/g, "11111111");
    board = board.replace(/7/g, "1111111");
    board = board.replace(/6/g, "111111");
    board = board.replace(/5/g, "11111");
    board = board.replace(/4/g, "1111");
    board = board.replace(/3/g, "111");
    board = board.replace(/2/g, "11");

// Breakup move and decide case

// Castling
    moveParts = castlingPattern.exec(move);
    if (moveParts) { handleCastling();
    } else {

// Piece move
      moveParts = pieceMovePattern.exec(move);
      if (moveParts) { handlePieceMove();
      } else {

// Pawn move
        moveParts = pawnMovePattern.exec(move);
        if (moveParts) { handlePawnMove();
        } else {

// No move
        };
      };
    };

// Compress board after move is done
    board = board.replace(/11111111/g, '8');
    board = board.replace(/1111111/g, '7');
    board = board.replace(/111111/g, '6');
    board = board.replace(/11111/g, '5');
    board = board.replace(/1111/g, '4');
    board = board.replace(/111/g, '3');
    board = board.replace(/11/g, '2');

    return board + ' ' + 
           ((sideToMove=='w') ? 'b' : 'w') + ' ' +
           ((castle == '') ? '-' : castle) + ' ' +
           ((ep.charAt(0) == '*') ? ep.substr(1, 2) : '-') + ' ' +
           ((halfMoves == '*') ? '0' : parseInt(halfMoves) + 1) + ' ' +
           ((sideToMove=='w') ? moveCount : (parseInt(moveCount) + 1));
  };

  function handleCastling() {
// moveParts[1] is null for king side (see regular expression)
    if (sideToMove == 'w') {
// White to move
      if (!moveParts[1]) {
// White king side castle
        board = board.substr(0, 67) + '1RK1';
      } else {
// White queen side castle
        board = board.substr(0, 63) + '11KR1' + board.substr(68, 3);
      };
      castle = castle.replace(/[QK]/g, '');
    } else {
// Black to move
      if (!moveParts[1]) {
// Black king side castle
        board = board.substr(0, 4) + '1rk1' + board.substr(8, 63);
      } else {
// Black queen side castle
        board = '11kr1' + board.substr(5, 66);
      };
      castle = castle.replace(/[qk]/g, '');
    };
    if (castle == '') { castle = '-' };
  };

  function handlePieceMove() {
// moveParts: 1: type of piece, 
//            2: column disambigator, 3: rank disambigator,
//            4: destination column, 5: destination rank

    var i, j, piece, destPos, pieceOnDestination, possibleMoves, moveDescription, 
        fromPosBehindDestination, fromPos, auxBoard, possiblePins;

    piece = moveParts[1];
    destPos = moveParts[4].charCodeAt(0) - 'a'.charCodeAt(0) + 
                  9 * ('8'.charCodeAt(0) - moveParts[5].charCodeAt(0));
    pieceOnDestination = board.charAt(destPos);

    if (sideToMove=='b') { piece = piece.toLowerCase(); };

// Replace destination by 'x'
    board = board.substr(0, destPos) + 'x' + board.substr(destPos + 1, 71);

    possibleMoves = movePattern[piece];
    fromPosBehindDestination = possibleMoves.length/2;
// Note that possibleMoves are ordered:
// First half: destPos is behind fromPos, second half: destPos is ahead of fromPos!
    for (i=0; i < possibleMoves.length; i++) { 
      moveDescription = possibleMoves[i].exec(board);
      if (moveDescription) {
        fromPos = (i < fromPosBehindDestination) ? 
                  (destPos - moveDescription[1].length + 1) : 
                  (destPos + moveDescription[1].length - 1);
// Check disambigators, if any
        if (((moveParts[2] == '') || 
             (moveParts[2] == String.fromCharCode('a'.charCodeAt(0) + fromPos % 9))) &&
            ((moveParts[3] == '') || 
             (moveParts[3] == String.fromCharCode('8'.charCodeAt(0) - (fromPos - fromPos % 9)/9)))) {

// Check legality (pins)
          auxBoard = board.substr(0, fromPos) + 'o' + board.substr(fromPos + 1, 80);
          possiblePins = pinPattern[sideToMove];
          for (j = 0; j < possiblePins.length; j++) {
            if (possiblePins[j].test(auxBoard)) {
              fromPos = -1;
              break;
            };
          };
        } else {
          fromPos = -1;
        };
// Take the first legal move allowed by disambigators
        if (fromPos >= 0) { break; };
      };
    };

    if (fromPos < 0) { 
// Error: no legal move desription
      board.replace(/x/, pieceOnDestination);
      return; 
    };

// Reset halfMoves counter?
    if (pieceOnDestination != '1') { halfMoves = '*'; };

// Castle state changed? 
    if (sideToMove == 'w') {
      if (piece == 'K') { castle.replace(/[KQ]/g, ''); };
      if (fromPos == 70) { castle.replace(/[K]/g, ''); };
      if (fromPos == 63) { castle.replace(/[Q]/g, ''); };
      if (destPos == 0)  { castle.replace(/[q]/g, ''); };
      if (destPos == 7)  { castle.replace(/[k]/g, ''); };
    } else {
      if (piece == 'k') { castle.replace(/[kq]/g, ''); };
      if (fromPos == 7) { castle.replace(/[k]/g, ''); };
      if (fromPos == 0) { castle.replace(/[q]/g, ''); };
      if (destPos == 63)  { castle.replace(/[Q]/g, ''); };
      if (destPos == 70)  { castle.replace(/[K]/g, ''); };
    };
    board = board.substr(0, fromPos) + '1' + board.substr(fromPos + 1, 71);
    board = board.substr(0, destPos) + piece + board.substr(destPos + 1, 71);
  };

  function handlePawnMove() {
// moveParts: 1: columns disambigator, 2: rank disambigator, 
//            3: destination column, 4: destination rank, 
//            5: promotion piece, 6: ep indicator
    var i, piece, destPos, fromPos, auxBoard, possiblePins;

    piece = (sideToMove == 'w') ? 'P' : 'p';
    if (moveParts[4] != '') {
// Destination given
      destPos = moveParts[3].charCodeAt(0) - 'a'.charCodeAt(0) + 
                9 * ('8'.charCodeAt(0) - moveParts[4].charCodeAt(0));
      if (ep == moveParts[3] + moveParts[4]) {
// ep capture
        board = board.substr(0, destPos) + 'x' + board.substr(destPos + 1, 71);
        board = board.substr(0, destPos + ((sideToMove=='w') ? 9 : -9)) + '1' + 
                board.substr(destPos + 1 + ((sideToMove=='w') ? 9 : -9), 71);
        if (moveParts[1] != '') {
// Disambigator given
          fromPos = destPos + ((sideToMove == 'w') ? 9 : -9) + 
                    ((moveParts[1] < moveParts[3]) ? -1 : 1);
        } else {
          fromPos = destPos + ((sideToMove == 'w') ? 8 : -10);
          if (board.charAt(fromPos) == piece) {
// Check legality (pins)
            auxBoard = board.substr(0, fromPos) + 'o' + board.substr(fromPos + 1, 80);
            possiblePins = pinPattern[sideToMove];
            for (i = 0; i < possiblePins.length; i++) {
              if (possiblePins[i].test(auxBoard)) {
                fromPos += 2;
                break;
              };
            };
          } else {
            fromPos += 2;
          };
        };
      } else {
// Not ep capture
        if (board.charAt(destPos) == '1') {
// No capture
          if (board.charAt(destPos + ((sideToMove == 'w') ? 9 : -9)) == '1') {
// Double step
            fromPos = destPos + ((sideToMove == 'w') ? 18 : -18);
            ep = '*' + String.fromCharCode('a'.charCodeAt(0) + destPos % 9) +
                 ((sideToMove == 'w') ? '3' : '6');
          } else {
// Single step
            fromPos = destPos + ((sideToMove == 'w') ? 9 : -9);
          };
        } else {
// Capture
          board = board.substr(0, destPos) + 'x' + board.substr(destPos + 1, 71);
          if (moveParts[1] != '') {
// Disambigator given
            fromPos = destPos + ((sideToMove == 'w') ? 9 : -9) + 
                      ((moveParts[1] < moveParts[3]) ? -1 : 1);
          } else {
            fromPos = destPos + ((sideToMove == 'w') ? 8 : -10);
            if (board.charAt(fromPos) == piece) {
// Check legality (pins)
              auxBoard = board.substr(0, fromPos) + 'o' + board.substr(fromPos + 1, 80);
              possiblePins = pinPattern[sideToMove];
              for (i = 0; i < possiblePins.length; i++) {
                if (possiblePins[i].test(auxBoard)) {
                  fromPos += 2;
                  break;
                };
              };
            } else {
              fromPos += 2;
            };
          };
        };
      };
    } else {
// Destination rank missing (must be a capture)
      if (moveParts[6] && (moveParts[6] != '')) {
// ep capture
        destPos = ep.charCodeAt(0) - 'a'.charCodeAt(0) + 
                  9 * ('8'.charCodeAt(0) - ep.charCodeAt(1));
        fromPos = destPos + ((sideToMove == 'w') ? 9 : -9) +
                  ((moveParts[1] < moveParts[3]) ? -1 : 1);
      } else {
// Check all pawns on disambigator column
        for (fromPos = moveParts[1].charCodeAt(0) - 'a'.charCodeAt(0) + 9;fromPos<62;fromPos+=9) {
          if (board.charAt(fromPos) == piece) {
            destPos = fromPos + ((moveParts[1]<moveParts[3]) ? 1 : -1) + ((sideToMove == 'w') ? -9 : 9);
            if (((sideToMove == 'w') && (board.charAt(destPos) >= 'a') && (board.charAt(destPos) <= 'z')) ||
                ((sideToMove != 'w') && (board.charAt(destPos) >= 'A') && (board.charAt(destPos) <= 'Z')) ||
                ((ep != '-') && (destPos == (ep.charCodeAt(0) - 'a'.charCodeAt(0) + 
                                             9 * ('8'.charCodeAt(0) - ep.charCodeAt(1)))))) {
              auxBoard = board.substr(0, fromPos) + 'o' + board.substr(fromPos + 1, 80);
              auxBoard = auxBoard.substr(0, destPos) + 'x' + auxBoard.substr(destPos + 1, 80);
              if ((ep != '-') && (destPos == (ep.charCodeAt(0) - 'a'.charCodeAt(0) + 
                                             9 * ('8'.charCodeAt(0) - ep.charCodeAt(1))))) {
                auxBoard = auxBoard.substr(0, destPos + ((sideToMove=='w') ? 9 : -9)) + '1' + 
                           auxBoard.substr(destPos + 1 + ((sideToMove=='w') ? 9 : -9), 71);
              };
              possiblePins = pinPattern[sideToMove];
              for (i = 0; i < possiblePins.length; i++) {
                if (possiblePins[i].test(auxBoard)) {
                  destPos = -1;
                  break;
                };
              };
              if (destPos >= 0) { break; };
            };
          };
          destPos = -1;
        };
      };
    };
    if (destPos < 0) { return; };
    if ((ep.length==2) && (destPos == (ep.charCodeAt(0) - 'a'.charCodeAt(0) + 
                                    9 * ('8'.charCodeAt(0) - ep.charCodeAt(1))))) {
      board = board.substr(0, destPos + ((sideToMove=='w') ? 9 : -9)) + '1' + 
              board.substr(destPos + 1 + ((sideToMove=='w') ? 9 : -9), 71);
    };
// Castle state changed? 
    if (sideToMove == 'w') {
      if (destPos == 0)  { castle.replace(/[q]/g, ''); };
      if (destPos == 7)  { castle.replace(/[k]/g, ''); };
    } else {
      if (destPos == 63)  { castle.replace(/[Q]/g, ''); };
      if (destPos == 70)  { castle.replace(/[K]/g, ''); };
    };
// Promotion?
    if (moveParts[5] != '') {
      piece = moveParts[5];
      if (sideToMove=='b') { piece = piece.toLowerCase(); };
    };
    board = board.substr(0, fromPos) + '1' + board.substr(fromPos + 1, 71);
    board = board.substr(0, destPos) + piece + board.substr(destPos + 1, 71);
    halfMoves = '*';
  };

// Promotion support in drag mode (callback functions for ChessBoard)

  onDrop = function(b, source, target, piece) {
// If a pawn is dropped on its last rank, promotion is to queen,
// but the user may drop it offboard to cycle through other pieces.
    if (((piece=='wP') && (target.charAt(1) == '8')) ||
        ((piece=='bP') && (target.charAt(1) == '1'))) {
// First offer: promote to queen
      boards[b].dragPromotion = target + piece.charAt(0) + 'Q';
    } else if ((target == 'offboard') && (source == boards[b].dragPromotion.substr(0, 2))) {
// Cycle through promotionPieces Q -> N -> R -> B -> Q ...
      boards[b].dragPromotion = source + 
                                piece.charAt(0) + 
                                (piece.charAt(1)=='Q' ? 'N' :
                                (piece.charAt(1)=='N' ? 'R' :
                                (piece.charAt(1)=='R' ? 'B' : 'Q')));
      return 'snapback';
    } else {
// Stop cycling through promotion pieces
      boards[b].dragPromotion = '';
    };
  };

  onSnapEnd = function(b) {
// Eventually do a promotion (prepared by "onDrop")
    bd = boards[b];
    if (bd.dragPromotion != '') {
      position = bd.board.position();
      position[bd.dragPromotion.substr(0, 2)] = bd.dragPromotion.substr(2,2);
      boards[b].board.position(position);
    };
  };

  function initFens(fens, moves) {
// Initialize the fens of the position before a move, for all moves of a line.
// The first one is already given, we set it again for simplicity.
    var oldFen, newFen;
    newFen = fens[0];
    for (var j = 0; j < moves.length; j++) {
      if (typeof(moves[j])=='string') {
        oldFen = newFen;
        fens[j] = oldFen;
        newFen = makeMove(oldFen, moves[j]);
      } else {
        fens[j] = [oldFen];
      };
    };
  };

/* language support ------------------------------------------------------------------------------------
Czech      P J S V D K 
Danish     B S L T D K 
Dutch      O P L T D K 
English    P N B R Q K   default + internal
Estonian   P R O V L K 
Finnish    P R L T D K 
French     P C F T D R 
German     B S L T D K 
Hungarian  G H F B V K 
Icelandic  P R B H D K 
Italian    P C A T D R 
Norwegian  B S L T D K 
Polish     P S G W H K 
Portuguese P C B T D R 
Romanian   P C N T D R 
Spanish    P C A T D R 
Swedish    B S L T D K 
output only:
Unicode    &#9817; .. &#9812; (White)
           &#9823; .. &#9818; (Black)
*/
  function replaceChain(s, fromTo) {
  // Do replaces in distinct order. fromTo is an array of two arrays. 
  // The first one is an array of regular expressions, the second an array of strings.
    var r = s;
    for (var i = 0; i< fromTo[0].length; i++){
      r = r.replace(fromTo[0][i], fromTo[1][i]);
    };
    return r;
  };

  var translateOutTable = { 
    Danish:     [[/N/g, /B/g, /R/g, /Q/g, /P/g],       ['S', 'L', 'T', 'D', 'B']],
    German:     [[/N/g, /B/g, /R/g, /Q/g, /P/g],       ['S', 'L', 'T', 'D', 'B']],
    Norwegian:  [[/N/g, /B/g, /R/g, /Q/g, /P/g],       ['S', 'L', 'T', 'D', 'B']],
    Swedish:    [[/N/g, /B/g, /R/g, /Q/g, /P/g],       ['S', 'L', 'T', 'D', 'B']],
    Czech:      [[/N/g, /B/g, /R/g, /Q/g],             ['J', 'S', 'V', 'D']],
    Finnish:    [[/B/g, /R/g, /Q/g, /N/g],             ['L', 'T', 'D', 'R']],
    Hungarian:  [[/N/g, /B/g, /R/g, /Q/g, /P/g],       ['F', 'F', 'B', 'V', 'G']],
    French:     [[/N/g, /B/g, /R/g, /Q/g, /K/g],       ['C', 'F', 'T', 'D', 'R']],
    Icelandic:  [[/R/g, /Q/g, /N/g],                   ['H', 'D', 'R']],
    Italian:    [[/N/g, /B/g, /R/g, /Q/g, /K/g],       ['C', 'A', 'T', 'D', 'R']],
    Spanish:    [[/N/g, /B/g, /R/g, /Q/g, /K/g],       ['C', 'A', 'T', 'D', 'R']],
    Polish:     [[/N/g, /B/g, /R/g, /Q/g],             ['S', 'G', 'W', 'H']],
    Portuguese: [[/N/g, /R/g, /Q/g, /K/g],             ['C', 'T', 'D', 'R']],
    Romanian:   [[/N/g, /B/g, /R/g, /Q/g, /K/g],       ['C', 'N', 'T', 'D', 'R']],
    Dutch:      [[/P/g, /N/g, /B/g, /R/g, /Q/g],       ['O', 'P', 'L', 'T', 'D']],
    Estonian:   [[/B/g, /R/g, /Q/g, /N/g],             ['O', 'V', 'L', 'R']],
    Unicodew:   [[/P/g, /N/g, /B/g, /R/g, /Q/g, /K/g], ['&#9817;', '&#9816;', '&#9815;', '&#9814;', '&#9813;', '&#9812']],
    Unicodeb:   [[/P/g, /N/g, /B/g, /R/g, /Q/g, /K/g], ['&#9823;', '&#9822;', '&#9821;', '&#9820;', '&#9819;', '&#9818']]
  };
  
  var translateInTable = { 
    Danish:     [[/B/g, /S/g, /L/g, /T/g, /D/g],       ['P', 'N', 'B', 'R', 'Q']],
    German:     [[/B/g, /S/g, /L/g, /T/g, /D/g],       ['P', 'N', 'B', 'R', 'Q']],
    Norwegian:  [[/B/g, /S/g, /L/g, /T/g, /D/g],       ['P', 'N', 'B', 'R', 'Q']],
    Swedish:    [[/B/g, /S/g, /L/g, /T/g, /D/g],       ['P', 'N', 'B', 'R', 'Q']],
    Czech:      [[/J/g, /S/g, /V/g, /D/g],             ['N', 'B', 'R', 'Q']],
    Finnish:    [[/R/g, /L/g, /T/g, /D/g],             ['N', 'B', 'R', 'Q']],
    Hungarian:  [[/G/g, /H/g, /B/g, /V/g, /F/g],       ['P', 'N', 'R', 'Q', 'B']],
    French:     [[/C/g, /F/g, /D/g, /R/g, /T/g],       ['N', 'B', 'Q', 'K', 'R']],
    Icelandic:  [[/R/g, /H/g, /D/g],                   ['N', 'R', 'Q']],
    Italian:    [[/C/g, /A/g, /D/g, /R/g, /T/g],       ['N', 'B', 'Q', 'K', 'R']],
    Spanish:    [[/C/g, /A/g, /D/g, /R/g, /T/g],       ['N', 'B', 'Q', 'K', 'R']],
    Polish:     [[/S/g, /G/g, /W/g, /H/g],             ['N', 'B', 'R', 'Q']],
    Portuguese: [[/C/g, /D/g, /R/g, /T/g],             ['N', 'Q', 'K', 'R']],
    Romanian:   [[/N/g, /D/g, /R/g, /T/g, /C/g],       ['B', 'Q', 'K', 'R', 'N']],
    Dutch:      [[/P/g, /L/g, /T/g, /D/g, /O/g],       ['N', 'B', 'R', 'Q', 'P']],
    Estonian:   [[/R/g, /O/g, /V/g, /L/g],             ['N', 'B', 'R', 'Q']],
  };

  function translateOut(move, player) {
// The move is in English. Translate it to languageOut.
// Only if languageOut == 'Unicode' player ('w' of 'b') is necessary.
    if (translateOutTable[languageOut]) {
      return replaceChain(move, translateOutTable[languageOut]);
    } else if (languageOut == 'Unicode') {
      return replaceChain(move, translateOutTable['Unicode' + player]);
    } else return move;
  };    

  function translateIn(move) {
// The move is in languageIn. Translate it to English.
// Languages using 'O' require correction of Castling.
    if (translateInTable[languageIn]) {
      move = replaceChain(move, translateInTable[languageIn]);
    };
    if (languageIn == "Dutch") { return move.replace(/P-P-P/g, 'O-O-O').replace(/P-P/g, 'O-O'); };
    if (languageIn == "Estonian") { return move.replace(/B-B-B/g, 'O-O-O').replace(/B-B/g, 'O-O'); };
    return move;
  };    

// Numeric annotation glyphs
  var NAG = [
  'null annotation', 
  '(!)', 
  '(?)', 
  '(!!)',
  '(??)', 
  '(!?)', 
  '(?!)', 
  'forced move (all others lose quickly)', 
  'singular move (no reasonable alternatives)', 
  'worst move', 
  'drawish position', 
  'equal chances, quiet position', 
  'equal chances, active position', 
  'unclear position', 
  'White has a slight advantage', 
  'Black has a slight advantage', 
  'White has a moderate advantage', 
  'Black has a moderate advantage', 
  'White has a decisive advantage', 
  'Black has a decisive advantage', 
  'White has a crushing advantage (Black should resign)', 
  'Black has a crushing advantage (White should resign)', 
  'White is in zugzwang', 
  'Black is in zugzwang', 
  'White has a slight space advantage', 
  'Black has a slight space advantage', 
  'White has a moderate space advantage', 
  'Black has a moderate space advantage', 
  'White has a decisive space advantage', 
  'Black has a decisive space advantage', 
  'White has a slight time (development) advantage', 
  'Black has a slight time (development) advantage', 
  'White has a moderate time (development) advantage', 
  'Black has a moderate time (development) advantage', 
  'White has a decisive time (development) advantage', 
  'Black has a decisive time (development) advantage', 
  'White has the initiative', 
  'Black has the initiative', 
  'White has a lasting initiative', 
  'Black has a lasting initiative', 
  'White has the attack', 
  'Black has the attack', 
  'White has insufficient compensation for material deficit', 
  'Black has insufficient compensation for material deficit', 
  'White has sufficient compensation for material deficit', 
  'Black has sufficient compensation for material deficit', 
  'White has more than adequate compensation for material deficit',
  'Black has more than adequate compensation for material deficit', 
  'White has a slight center control advantage', 
  'Black has a slight center control advantage', 
  'White has a moderate center control advantage', 
  'Black has a moderate center control advantage', 
  'White has a decisive center control advantage', 
  'Black has a decisive center control advantage', 
  'White has a slight kingside control advantage', 
  'Black has a slight kingside control advantage', 
  'White has a moderate kingside control advantage', 
  'Black has a moderate kingside control advantage', 
  'White has a decisive kingside control advantage', 
  'Black has a decisive kingside control advantage', 
  'White has a slight queenside control advantage', 
  'Black has a slight queenside control advantage', 
  'White has a moderate queenside control advantage', 
  'Black has a moderate queenside control advantage', 
  'White has a decisive queenside control advantage', 
  'Black has a decisive queenside control advantage', 
  'White has a vulnerable first rank', 
  'Black has a vulnerable first rank', 
  'White has a well protected first rank', 
  'Black has a well protected first rank', 
  'White has a poorly protected king', 
  'Black has a poorly protected king', 
  'White has a well protected king', 
  'Black has a well protected king', 
  'White has a poorly placed king', 
  'Black has a poorly placed king', 
  'White has a well placed king', 
  'Black has a well placed king', 
  'White has a very weak pawn structure', 
  'Black has a very weak pawn structure', 
  'White has a moderately weak pawn structure', 
  'Black has a moderately weak pawn structure', 
  'White has a moderately strong pawn structure', 
  'Black has a moderately strong pawn structure', 
  'White has a very strong pawn structure', 
  'Black has a very strong pawn structure', 
  'White has poor knight placement', 
  'Black has poor knight placement', 
  'White has good knight placement', 
  'Black has good knight placement', 
  'White has poor bishop placement', 
  'Black has poor bishop placement', 
  'White has good bishop placement', 
  'Black has good bishop placement', 
  'White has poor rook placement', 
  'Black has poor rook placement', 
  'White has good rook placement', 
  'Black has good rook placement', 
  'White has poor queen placement', 
  'Black has poor queen placement', 
  'White has good queen placement', 
  'Black has good queen placement', 
  'White has poor piece coordination', 
  'Black has poor piece coordination', 
  'White has good piece coordination', 
  'Black has good piece coordination', 
  'White has played the opening very poorly', 
  'Black has played the opening very poorly', 
  'White has played the opening poorly', 
  'Black has played the opening poorly', 
  'White has played the opening well', 
  'Black has played the opening well', 
  'White has played the opening very well', 
  'Black has played the opening very well', 
  'White has played the middlegame very poorly', 
  'Black has played the middlegame very poorly', 
  'White has played the middlegame poorly', 
  'Black has played the middlegame poorly',
  'White has played the middlegame well', 
  'Black has played the middlegame well', 
  'White has played the middlegame very well', 
  'Black has played the middlegame very well', 
  'White has played the ending very poorly', 
  'Black has played the ending very poorly', 
  'White has played the ending poorly', 
  'Black has played the ending poorly', 
  'White has played the ending well', 
  'Black has played the ending well', 
  'White has played the ending very well', 
  'Black has played the ending very well', 
  'White has slight counterplay', 
  'Black has slight counterplay',
  'White has moderate counterplay', 
  'Black has moderate counterplay', 
  'White has decisive counterplay', 
  'Black has decisive counterplay', 
  'White has moderate time control pressure', 
  'Black has moderate time control pressure', 
  'White has severe time control pressure', 
  'Black has severe time control pressure']; 

  function movePtr2String(movePtr) {
// this will translate a tree pointer to a string
    return '_' + movePtr.join('_');
  };
  
  function highlightMove_Board(bd, newMovePtr) {
  // A move was made in bd.
  // Lowlight the last move shown, highlight the new move shown.
    document.getElementById(bd.id + movePtr2String(bd.movePtr)).style['color'] = 'black'; 
    bd.movePtr = newMovePtr;
    document.getElementById(bd.id + movePtr2String(bd.movePtr)).style['color'] = 'red';
  };

  function togglePGN_Board(bd) {
// If there is no pgnDiv given, the pgn can be shown below the board.
// This function is invoked by a button to toggle the display on and off.
    if (bd.showPGN) {
      document.getElementById(bd.id + '_pgn').style["display"] = "none";
      bd.showPGN = false;
    } else {
      document.getElementById(bd.id + '_pgn').style["display"] = "inline";
      bd.showPGN = true;
    };
  };
    
  function setOrientation_Board(bd, side) {
// Sets the orientation of the board.
// Somewhat lengthy, because we may have our own traditional board notation. 
// Side is 'white', 'black', or 'flip'.
    var columns = 'hgfedcba';
    var rows = '12345678';
    bd.board.orientation(side);
    if (showNotation != 1) { return; };
    var t = document.getElementById(bd.id + '_table').firstChild;
    if (bd.board.orientation() == 'white') {
      columns = 'abcdefgh';
      rows = '87654321';
    };
    for (var i = 0;i < 8;i++) {
      t = t.nextSibling;
      t.innerHTML = columns.charAt(i);
    };
    t = t.parentNode;
    for (var i = 0;i < 8;i++) {
      t = t.nextSibling;
      t.firstChild.innerHTML = rows.charAt(i);
      t.lastChild.innerHTML = rows.charAt(i);
    };
    t = t.nextSibling.firstChild;
    for (var i = 0;i < 8;i++) {
      t = t.nextSibling;
      t.innerHTML = columns.charAt(i);
    };
  };

  function position_Board(bd, newMovePtr) {
// newMovePtr is an array to select a move in the move tree.
// It must point to a string in the move tree!
// This move will be visualized and its line will become the
// current line of the diagram.
// If necessary, missing fens will be initialized.
      var moves = bd.moves;
      var fens = bd.fens;
      var newFen, oldFen;
// Climb up to the selected line.
      for (var i = 0; i < newMovePtr.length-1; i++) {
        if (moves.length > fens.length) { 
// This line has not been shown so far, so compute all fen strings.
// (I'd like to avoid computing all fen strings of a game in advance.)
          initFens(fens, moves);
        };
        moves = moves[newMovePtr[i]];
        fens = fens[newMovePtr[i]];
      };
      if (moves.length > fens.length) {
        initFens(fens, moves);
      };
// Finally we reached the line corresponding to the length of newMovePtr.
      bd.lineMoves = moves;
      bd.lineFens = fens;
// We show the postion before the move without animation,
// make the move and show the position after the move with animation.
      var k = newMovePtr[newMovePtr.length-1];
      bd.board.position(fens[k], false);
      newFen = makeMove(fens[k], moves[k]);
      bd.board.position(newFen, true);
      bd.dragPromotion = '';
      document.getElementById(bd.id + '_num').innerHTML = 
        newFen.split(' ')[5] + '.';
      document.getElementById(bd.id + '_col').src = 
        imgPath + newFen.split(' ')[1] + '.png';
// Now let lineMove point to the move, that should be made in 
// the displayed position.
      bd.lineMove = k+1;
      while ((bd.lineMove < bd.lineMoves.length) &&
             (typeof(bd.lineMoves[bd.lineMove]) != 'string')) {
        bd.lineMove += 1;
      };
// At last highlight the text.
      highlightMove_Board(bd, newMovePtr);
    };

  function advRew_Board(bd, pos) {
// Advance or Rewind the position of board bd
//  - to starting position (pos = 0),
//  - to next position (pos > 0) or 
//  - to previous position (else).
// lineMoves[lineMove] is always a string!    

// Exception: there are no pgn data, so simply restore start position
    if (bd.moves.length==0) {
      bd.board.position(bd.fens[0]);
      return;
    };

    var movePtr = [];
    var newFen;
    for (var i=0;i<bd.movePtr.length;i++) { movePtr[i] = bd.movePtr[i] };
    if (bd.lineFens.length < bd.lineMoves.length) {
      initFens(bd.lineFens, bd.lineMoves);
    };
    if (pos == 0) { 
      bd.lineMove = 0;
      movePtr[movePtr.length-1] = 'x';
    } else if (pos > 0) {
      if (bd.lineMove < bd.lineMoves.length) {
        movePtr[movePtr.length-1] = bd.lineMove;
        bd.lineMove += 1;
        while ((bd.lineMove < bd.lineMoves.length) &&
               (typeof(bd.lineMoves[bd.lineMove]) != 'string')) {
          bd.lineMove += 1;
        };
      };
    } else {
      if (bd.lineMove > 0) {
        bd.lineMove -= 1;
        while ((bd.lineMove > 0) &&
               (typeof(bd.lineMoves[bd.lineMove]) != 'string')) {
          bd.lineMove -= 1;
        };
        if (bd.lineMove > 0) {
          var i = bd.lineMove - 1;
          while ((i > 0) &&
                 (typeof(bd.lineMoves[i]) != 'string')) {
            i -= 1;
          };
          movePtr[movePtr.length-1] = i;
        } else {
          movePtr[movePtr.length-1] = 'x';
        };
      };
    };
    bd.dragPromotion = '';
    if (bd.lineMove < bd.lineMoves.length) {
      newFen = bd.lineFens[bd.lineMove];
    } else {
      for (var i=bd.lineMove-1;i>=0;i--) {
        if (typeof(bd.lineMoves[i]) == 'string') {
          newFen = makeMove(bd.lineFens[i], bd.lineMoves[i]);
          break;
        };
      };
    };
    bd.board.position(newFen);
    document.getElementById(bd.id + '_num').innerHTML = 
      newFen.split(' ')[5] + '.';
    document.getElementById(bd.id + '_col').src = 
      imgPath + newFen.split(' ')[1] + '.png';
    highlightMove_Board(bd, movePtr);
  };

  function getOptions(options) {
// Overwrite options where given
    if (options['languageIn'])       { languageIn       = options['languageIn']; };
    if (options['languageOut'])      { languageOut      = options['languageOut']; };
    if (options['showNotation'])     { showNotation     = options['showNotation']; };
    if (options['boardWidth'])       { boardWidth       = options['boardWidth']; };
    if (options['pieceTheme'])       { pieceTheme       = options['pieceTheme']; };
    if (options['imgPath'])          { imgPath          = options['imgPath']; };
    if (options['notationStyle'])    { notationStyle    = options['notationStyle']; };
    if (options['divStyle'])         { divStyle         = options['divStyle']; };
    if (options['orientation'])      { orientation      = options['orientation']; };
    if (options['pgnFormat'])        { pgnFormat        = options['pgnFormat']; };
  };

  function parsePGN_Board(bd, bx, pgn) {
// Parsing the pgn data.
// We construct the move tree for replay and the pgnHtml for display at the same time.
// Result is the pgnHtml, the move tree is stored directly in the board.
// In some stacks for each nested variation we keep track of:
// - the moves (for replay later)
// - the prefix (for the onclick-event of the moves in the pgnHtml)
// - the player to move (for correctly increasing move numbers)
// - the moveNumber (for display in pgnHtml)
// We also keep track of parsing inside a comment and wether moves are interrupted
// by comments or variations.
    var noErrorsSoFar = true;
    var height = 0;
    var moveStack = [];
    var playerStack = [];
    var moveNumberStack = [];
    var prefixStack = [];
    var moves = [];
    var player = bd.fens[0].split(' ')[1];
    var moveNumber = parseInt(bd.fens[0].split(' ')[5]);
    var prefix = ' onclick="ChessDiagram.position(' + bx + ',['
    var insideComment = false;
    var movesInterrupted = true;
    var pgnHtml = '<span id="' + bd.id + '_x"></span>';
    var mv = '';
    var movePtr = [];
    if (pgnFormat != '0') { pgnHtml += '<b>'; };

// Replace end of line comments by parenthesis. So there is only one type of comments.
    var L = pgn.replace(/;([^\r]*)\r/g, '{$1}');
// Ensure all tokens (especially parenthesis) are separated by white space.
    L = L.replace(/([\(\)\{\}])/g, ' $1 ');
// Normalize white spaces (to one space) and split.
    L = L.replace(/\s+/g, ' ').split(' ');
    for (var i=0;i<L.length;i++) {
      if (insideComment) {
        if (L[i] == '}') {
// End of comment. 
          if (pgnFormat != '0') { 
            pgnHtml += ((height == 0) ? '<br /><b>' : '<i>');
          };
          insideComment = false;
          movesInterrupted = true;
        } else {
// Token inside comment is simply passed through to pgnHtml
// Give a warning if parenthesis may be unbalanced.
          if (L[i] == '{') {
            alert('"{" inside comment! ' + bd.id + ' ' + 
                   moveNumber + ' ' + height + ' ' + movePtr2String(movePtr));
          };
          pgnHtml += L[i] + ' ';
        };
      } else {
        if (L[i] == '{') {
// Begin of comment.
          if (pgnFormat != '0') {
// The first interruption in main line should begin in a new line!
            pgnHtml += (height == 0) ? (movesInterrupted ? '</b>' : '</b><br />') : '</i>';
          };
          insideComment = true;
        } else if (L[i] == '(') {
// Begin of variation. Push the stacks.
          moveStack[height] = moves;
          prefixStack[height] = prefix;
          playerStack[height] = player;
          moveNumberStack[height] = moveNumber;
          prefix +=  moves.length + ',';
          movePtr[height] = moves.length;
          moves[moves.length] = [];
          moves = moves[moves.length-1];
          player = (player=='w') ? 'b' : 'w';
          if (player == 'b') { moveNumber -= 1; };
          if (pgnFormat != '0') {
            if (height == 0) {
// The first interruption in main line should begin in a new line!
              pgnHtml += (movesInterrupted ? '</b>' : '</b><br />')
                         + '<span id="' + bd.id + movePtr2String(movePtr) 
                         + '_x" style="color:black"><i> ( ';
            } else {
              pgnHtml += '</i><span id="' + bd.id + movePtr2String(movePtr) 
                         + '_x" style="color:black"><i> ( ';
            };
          } else {
            pgnHtml += '<span id="' + bd.id + movePtr2String(movePtr) + '_x" style="color:black"> ( ';
          };
          height += 1;
          movesInterrupted = true;
        } else if (L[i] == ')') {
// End of variation. Pop the stacks.
          movePtr.length = height;
          height -= 1;
          if (height < 0) {
            alert(bd.id + ': )?');
            height = 0;
          }; 
          moves = moveStack[height];
          prefix = prefixStack[height];
          player = playerStack[height];
          moveNumber = moveNumberStack[height];
          if (pgnFormat != '0') { 
            pgnHtml += ((height == 0) ? ')</i></span><br /><b>' : ') </i></span><i>'); 
          } else {
            pgnHtml += ')</span> ';
          };
          movesInterrupted = true;
        } else if (/\$\d+/.test(L[i])){
// Numeric Annotation Glyph
          var n = parseInt(L[i].substr(1, L[i].length-1));
          if ((n > 0) && (n < NAG.length)) {
            if (pgnFormat != '0') {
              pgnHtml += (height == 0) ? ('</b>' + NAG[n] + ' <b>') : NAG[n] + ' ';
            } else {
              pgnHtml += NAG[n] + ' ';
            };
          };
        } else {            
// We completely ignore move numbers in pgn data and make our own!
          mv = translateIn(L[i].replace(/^\d*\.*/, ''));
          if (castlingPattern.test(mv) ||
              pieceMovePattern.test(mv) ||
              pawnMovePattern.test(mv) ||
// Allow "pass" in pgn data (for demonstrations):
              (mv == '-')) {
            if (player=='w') {
              pgnHtml += moveNumber + '. ';
              player = 'b';
            } else {
              if (movesInterrupted) {
                pgnHtml += moveNumber + '... ';
              };
              player = 'w';
              moveNumber += 1;
            };
            movePtr[height] = moves.length;
            pgnHtml += '<span id="' + bd.id + movePtr2String(movePtr) + '" style="color:black"' +
                       prefix + moves.length + '])">' + 
                       translateOut(mv, ((player=='w')?'b':'w')) + ' </span>'
            moves[moves.length] = mv;
            movesInterrupted = false;
          } else {
            if ((mv != '') && (!resultPattern.test(L[i])) && noErrorsSoFar) { 
              alert(languageIn + '?:' + mv + ' ' + bd.id + ' ' +
                    moveNumber + ' ' + height + ' ' + movePtr2String(movePtr));
              noErrorsSoFar = false;
            };
          };
        };
      };
    };
    if (pgnFormat != '0') { pgnHtml += '</b>'; };
// Warning, if height > 0 or insideComment
    if (height != 0) { alert(bd.id + ': (?'); };
    if (insideComment) { alert(bd.id + ': }?'); };

    bd.moves = moves;
    return pgnHtml;
  };

  function htmlDisplay_Board(bd, bx, pgnHtml, header, footer) {
// Constructing html for the board and controls.
    var html;
    if (showNotation==1) {
// Setup a frame for the traditional notation.
      html = header + '<table border="0" cellpadding="0" cellspacing="0" align="center"' +
               'style="' + notationStyle + '">' + 
               '<tr id="' + bd.id + '_table">' +
               '<th>&nbsp;&nbsp;&nbsp;</th><th>a</th><th>b</th><th>c</th><th>d</th>' +
               '<th>e</th><th>f</th><th>g</th><th>h</th><th>&nbsp;&nbsp;&nbsp;</th></tr>' +
               '<tr><th valign="middle">8</th><td colspan="8" rowspan="8">' +
               '<div id="' + bd.id + '_board" style="width:' + boardWidth + '"></div>' +
               '</td><th valign="middle">8</th></tr>' +
               '<tr><th valign="middle">7</th><th valign="middle">7</th></tr>' +
               '<tr><th valign="middle">6</th><th valign="middle">6</th></tr>' +
               '<tr><th valign="middle">5</th><th valign="middle">5</th></tr>' +
               '<tr><th valign="middle">4</th><th valign="middle">4</th></tr>' +
               '<tr><th valign="middle">3</th><th valign="middle">3</th></tr>' +
               '<tr><th valign="middle">2</th><th valign="middle">2</th></tr>' +
               '<tr><th valign="middle">1</th><th valign="middle">1</th></tr>' +
               '<tr><th>&nbsp</th><th>a</th><th>b</th><th>c</th><th>d</th>' +
               '<th>e</th><th>f</th><th>g</th><th>h</th><th>&nbsp;</th></tr></table>';
    } else {
// No extra frame for notation.
      html = header + '<br /><div id="' + bd.id + '_board" style="width:' + boardWidth + '"></div>';
    };
// Adding controls at the bottom.
    html += '<input type="button" onclick="ChessDiagram.setOrientation(' + bx + ', \'flip\');" value="&#x21bb" />' +
            '<input type="button" onclick="ChessDiagram.show(' + bx + ', 0);" value="|&lt;&lt;" />';
    if (bd.moves.length > 0) {
      html += 
         '<input type="button" onclick="ChessDiagram.show(' + bx + ', 1);" value=" &gt; " />' +
         '<input type="button" onclick="ChessDiagram.show(' + bx + ',-1);" value=" &lt; " />';
      if (!document.getElementById(bd.id + '_pgn')) {
        html += '<input type="button" onclick="ChessDiagram.togglePGN(' + bx + ');" value=" + " />';
      };
    };
    html = html +
         '&nbsp;<span id="' + bd.id + '_num">' + bd.fens[0].split(' ')[5] + '.</span>' +
         '&nbsp;<img id="' + bd.id + '_col" width="8" src="' + 
         imgPath + bd.fens[0].split(' ')[1] + '.png" />&nbsp;&nbsp;' +
         footer + '<br />';
// Display interactive pgn.
    if (document.getElementById(bd.id + '_pgn')) {
      document.getElementById(bd.id + '_pgn').innerHTML = pgnHtml;
    } else {
      html += '<span id="' + bd.id + '_pgn" style="display:none">' + pgnHtml + '</span>';
    };
    document.getElementById(bd.id).innerHTML = html;
    if (divStyle != '-') {
      for (var key in divStyle) { document.getElementById(bd.id).style[key] = divStyle[key]; };
    };
  };

// Public ------------------------------------------------------------------------------
  return {

    togglePGN: function(bx) {
// If there is no pgnDiv given, the pgn can be shown below the board.
// This function is invoked by a button to toggle the display on and off.
      togglePGN_Board(boards[bx]);
    },

    setOrientation: function(bx, side) {
// Sets the orientation of the board.
// Side is 'white', 'black', or 'flip'.
      setOrientation_Board(boards[bx], side);
    },

    position: function(bx, newMovePtr) {
// newMovePtr is an array to select a move in the move tree.
// This move will be visualized and its line will become the
// current line of the diagram.
      position_Board(boards[bx], newMovePtr);
    },

    show: function (bx, pos) {
// Advance or Rewind the position of board bd
//  - to starting position (pos = 0),
//  - to next position (pos > 0) or 
//  - to previous position (else).
      advRew_Board(boards[bx], pos);
    },

    diagram: function (id, fen, pgn, header, footer, options) {
// Generate a chess diagram in the div tag with id "id".
// The starting position is given by a fen string "fen".
// A move list is given by "pgn" (see comment in "makeMove" for accepted values).
// "header" and "footer" are html strings displayed above and below the diagram.
// Options may be used to override default values (the new values will hold
// until they are changed in another call to "diagram").

      if (options) {getOptions(options)};

      if (!header) { header = ''; };
      if (!footer) { footer = ''; };

      var bx = boards.length;
// if the id is in use, overwrite the old board in order to free the space
      for (var i=0;i<boards.length;i++) {
        if (boards[i].id == id) {
          bx = i;
          break;
        };
      };
      boards[bx] = {fens: [fen], id: id, dragPromotion: '',
                    lineMove: 0, movePtr: ['x'], showPGN: false};

      var pgnHtml = parsePGN_Board(boards[bx], bx, pgn);

// Construct html for the board and controls.
      htmlDisplay_Board(boards[bx], bx, pgnHtml, header, footer);

      boards[bx].board =  new ChessBoard(id + '_board', {
                                        draggable:     true, 
                                        dropOffBoard:  'trash', 
                                        showNotation:  (showNotation==2),
                                        pieceTheme:    pieceTheme, 
                                        position:      fen,
                                        orientation:   orientation,
                                        onDrop:        function(source, target, piece, newPos, oldPos, orientation) {
                                                         return onDrop(bx, source, target, piece); },
                                        onSnapEnd:     function() { onSnapEnd(bx); },
                                        onSnapbackEnd: function() { onSnapEnd(bx); }
                                        } );
      boards[bx].lineFens = boards[bx].fens;
      boards[bx].lineMoves = boards[bx].moves;
    }
  };
} () ;
