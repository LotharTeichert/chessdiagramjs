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

  var movePattern = { 
  K: [/(K(?:.?.?.{7})?x)/, /(x(?:.?.?.{7})?K)/],
  R: [/(R1{0,7}x)/, /(R.{8}(?:1.{8}){0,7}x)/, /(x1{0,7}R)/, /(x.{8}(?:1.{8}){0,7}R)/],
  B: [/(B.{9}(?:1.{9}){0,7}x)/, /(B.{7}(?:1.{7}){0,7}x)/, /(x.{9}(?:1.{9}){0,7}B)/, /(x.{7}(?:1.{7}){0,7}B)/],
  Q: [/(Q1{0,7}x)/, /(Q.{8}(?:1.{8}){0,7}x)/, /(Q.{9}(?:1.{9}){0,7}x)/, /(Q.{7}(?:1.{7}){0,7}x)/,
      /(x1{0,7}Q)/, /(x.{8}(?:1.{8}){0,7}Q)/, /(x.{9}(?:1.{9}){0,7}Q)/, /(x.{7}(?:1.{7}){0,7}Q)/],
  N: [/(N.{6}x)[^\/]/, /(N.{9}[^\/]x)/, /(N.{15}[^\/]x)/, /(N.{17}[^\/]x)/,
      /(x.{6}N)[^\/]/, /(x.{9}[^\/]N)/, /(x.{15}[^\/]N)/, /(x.{17}[^\/]N)/],
  k: [/(k(?:.?.?.{7})?x)/, /(x(?:.?.?.{7})?k)/],
  r: [/(r1{0,7}x)/, /(r.{8}(?:1.{8}){0,7}x)/, /(x1{0,7}r)/, /(x.{8}(?:1.{8}){0,7}r)/],
  b: [/(b.{9}(?:1.{9}){0,7}x)/, /(b.{7}(?:1.{7}){0,7}x)/, /(x.{9}(?:1.{9}){0,7}b)/, /(x.{7}(?:1.{7}){0,7}b)/],
  q: [/(q1{0,7}x)/, /(q.{8}(?:1.{8}){0,7}x)/, /(q.{9}(?:1.{9}){0,7}x)/, /(q.{7}(?:1.{7}){0,7}x)/,
      /(x1{0,7}q)/, /(x.{8}(?:1.{8}){0,7}q)/, /(x.{9}(?:1.{9}){0,7}q)/, /(x.{7}(?:1.{7}){0,7}q)/],
  n: [/(n.{6}x)[^\/]/, /(n.{9}[^\/]x)/, /(n.{15}[^\/]x)/, /(n.{17}[^\/]x)/,
      /(x.{6}n)[^\/]/, /(x.{9}[^\/]n)/, /(x.{15}[^\/]n)/, /(x.{17}[^\/]n)/] 
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

  var boards = [];
// This is a list of all diagrams on the page.
// Elements of "boards" are objects with
//   fens:          tree of fen strings
//   moves:         tree of move strings
//   board:         instance of ChessBoard
//   movePtr:       array of numbers indicating the diagram position in the move/fen-tree
//   id:            HTML-Id of DIV-tag to be used
//   dragPromotion: target + piece if a promotion takes place by dragging

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
        board = '11rk1' + board.substr(5, 66);
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

// Promotion support in drag mode 

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

// Workaround to get the img path
// We assume the img directory is a sibling of the script directory and its name is "img"
  var scripts = document.getElementsByTagName('script');          // get all scripts on the page, this one is the last!
  var path = scripts[scripts.length-1].src.split('?')[0];         // remove any ?query
  var imgPath = path.split('/').slice(0, -2).join('/') + '/img/'; // remove last filename parts and add directory name
  var pieceTheme = imgPath + 'chesspieces/wikipedia/{piece}.png';

  var languageIn = "English";
  var languageOut = "English";
  var divStyle = '-';
  var notationStyle = 'background-color:#f0f0f0;font-family:Lucida Console;font-size:12px;line-height:200%';
  var boardWidth = '240px';
  var showNotation = 1;
// values for showNotation = 1: traditional notation, 2: ChessBoard notation (inside board), 3: no notation, 

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
  function moveTree(moves, prefix, m, p) {
// generate a string of spans for each move
    var s = '';
    var moveOut;
    for (var i = 0; i < moves.length; i++) {
      if (typeof(moves[i]) == 'string') {
/* output language support
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
*/
        moveOut = moves[i];
        switch (languageOut) {
        case "German":
        case "Danish":
        case "Norwegian":
        case "Swedish":
          moveOut = moveOut.replace(/N/g, 'S').replace(/B/g, 'L').replace(/R/g, 'T').replace(/Q/g, 'D').replace(/P/g, 'B');
          break;
        case "Czech":
          moveOut = moveOut.replace(/N/g, 'J').replace(/B/g, 'S').replace(/R/g, 'V').replace(/Q/g, 'D');
          break;
        case "Finnish":
          moveOut = moveOut.replace(/B/g, 'L').replace(/R/g, 'T').replace(/Q/g, 'D').replace(/N/g, 'R');
          break;
        case "French":
          moveOut = moveOut.replace(/N/g, 'C').replace(/B/g, 'F').replace(/R/g, 'T').replace(/Q/g, 'D').replace(/K/g, 'R');
          break;
        case "Hungarian":
          moveOut = moveOut.replace(/N/g, 'H').replace(/B/g, 'F').replace(/R/g, 'B').replace(/Q/g, 'V').replace(/P/g, 'G');
          break;
        case "Icelandic":
          moveOut = moveOut.replace(/R/g, 'H').replace(/Q/g, 'D').replace(/N/g, 'R');
          break;
        case "Italian":
        case "Spanish":
          moveOut = moveOut.replace(/N/g, 'C').replace(/B/g, 'A').replace(/R/g, 'T').replace(/Q/g, 'D').replace(/K/g, 'R');
          break;
        case "Polish":
          moveOut = moveOut.replace(/N/g, 'S').replace(/B/g, 'G').replace(/R/g, 'W').replace(/Q/g, 'H');
          break;
        case "Portuguese":
          moveOut = moveOut.replace(/N/g, 'C').replace(/R/g, 'T').replace(/Q/g, 'D').replace(/K/g, 'R');
          break;
        case "Romanian":
          moveOut = moveOut.replace(/N/g, 'C').replace(/B/g, 'N').replace(/R/g, 'T').replace(/Q/g, 'D').replace(/K/g, 'R');
          break;
        case "Dutch":
          moveOut = moveOut.replace(/P/g, 'O').replace(/N/g, 'P').replace(/B/g, 'L').replace(/R/g, 'T').replace(/Q/g, 'D');
          break;
        case "Estonian":
          moveOut = moveOut.replace(/B/g, 'O').replace(/R/g, 'V').replace(/Q/g, 'L').replace(/N/g, 'R');
          break;
        };
        if (p == 'w') {
          s += (' ' + m + '.' + prefix + i + '])">' + moveOut + '</span> ');
          p = 'b';
        } else {
          if (i==0) {
            s += (' ' + m + '...' + prefix + i + '])">' + moveOut + '</span> ');
          } else {
            s += (prefix + i + '])">' + moveOut + '</span> ');
          };
          m += 1;
          p = 'w';
        };
      } else {
        if (p == 'w') {
          s += ('(' + moveTree(moves[i], prefix + i + ',', m-1, 'b') + ')');
        } else {
          s += ('(' + moveTree(moves[i], prefix + i + ',', m, 'w') + ')');
        };
      };
    };
    return s;
  };
// Public ------------------------------------------------------------------------------
  return {

    togglePGN: function(b) {
      if (boards[b].showPGN) {
        document.getElementById(boards[b].id + '_pgn').style["display"] = "none";
        boards[b].showPGN = false;
      } else {
        document.getElementById(boards[b].id + '_pgn').style["display"] = "inline";
        boards[b].showPGN = true;
      };
    },

    m: function(b, newMovePtr) {
// b is the number of a diagram.
// newMovePtr is an array to select a move in the move tree.
// This move will be visualized and its line will become the
// currently line of the diagram.
// If necessary, missing fens will be initialized.
      var bd = boards[b];
      var moves = bd.moves;
      var fens = bd.fens;
      var newFen, oldFen;
      for (var i = 0; i < newMovePtr.length-1; i++) {
        if (moves.length > fens.length) { 
// this line has not been shown so far, so compute all fen strings.
          initFens(fens, moves);
        };
        moves = moves[newMovePtr[i]];
        fens = fens[newMovePtr[i]];
      };
      if (moves.length > fens.length) {
        initFens(fens, moves);
      };
      var k = newMovePtr[newMovePtr.length-1];
      bd.board.position(fens[k], false);
      newFen = makeMove(fens[k], moves[k]);
      bd.board.position(newFen, true);
      bd.dragPromotion = '';
      document.getElementById(bd.id + '_num').innerHTML = 
        newFen.split(' ')[5] + '.';
      document.getElementById(bd.id + '_col').src = 
        imgPath + newFen.split(' ')[1] + '.png';
      bd.lineMoves = moves;
      bd.lineFens = fens;
      bd.movePtr = k+1;
      if (bd.movePtr < bd.lineMoves.length) {
        if (typeof(bd.lineMoves[bd.movePtr]) != 'string') {
          bd.movePtr += 1;
        };
      };
    },

    show: function (b, pos) {
// Show the diagram boards[b] ...
//  ... in starting position (pos = 0),
//  next position (pos > 0) or previous position (else).
// lineMoves[movePtr] is always a string!
// if lineMoves[movePtr] is not a string then lineMoves[movePtr-1] is!
      var newFen;
      var bd = boards[b];
      if (bd.lineFens.length < bd.lineMoves.length) {
        initFens(bd.lineFens, bd.lineMoves);
      };
      if (pos == 0) { 
        bd.movePtr = 0;
      } else if (pos > 0) {
        if (bd.movePtr < bd.lineMoves.length) {
          bd.movePtr += 1;
          if (bd.movePtr < bd.lineMoves.length) {
            if (typeof(bd.lineMoves[bd.movePtr]) != 'string') {
              bd.movePtr += 1;
            };
          };
        };
      } else {
        if (bd.movePtr > 0) {
          bd.movePtr -= 1;
          if (typeof(bd.lineMoves[bd.movePtr]) != 'string') {
            bd.movePtr -= 1;
          };
        };
      };
      bd.dragPromotion = '';
      if (bd.movePtr < bd.lineMoves.length) {
        newFen = bd.lineFens[bd.movePtr];
      } else {
        if (typeof(bd.lineMoves[bd.movePtr-1]) != 'string') {
          newFen = makeMove(bd.lineFens[bd.movePtr-2], bd.lineMoves[bd.movePtr-2]);
        } else {
          newFen = makeMove(bd.lineFens[bd.movePtr-1], bd.lineMoves[bd.movePtr-1]);
        };
      };
      bd.board.position(newFen);
      document.getElementById(bd.id + '_num').innerHTML = 
        newFen.split(' ')[5] + '.';
      document.getElementById(bd.id + '_col').src = 
        imgPath + newFen.split(' ')[1] + '.png';
    },

    diagram: function (id, fen, pgn, header, footer, options) {
// Generate a chess diagram in div tag with id "id".
// The starting position is giben by a fen string "fen".
// A move list is given by "pgn" (see comment in "makeMove" for accepted values).
// "header" and "footer" are html strings displayed above and below the diagram.
// options may be used to override default values (the new values will hold
// until they are changed in another call to "diagram").

      if (options) {
        if (options['languageIn'])    { languageIn    = options['languageIn']; };
        if (options['languageOut'])   { languageOut   = options['languageOut']; };
        if (options['showNotation'])  { showNotation  = options['showNotation']; };
        if (options['boardWidth'])    { boardWidth    = options['boardWidth']; };
        if (options['pieceTheme'])    { pieceTheme    = options['pieceTheme']; };
        if (options['imgPath'])       { imgPath       = options['imgPath']; };
        if (options['notationStyle']) { notationStyle = options['notationStyle']; };
        if (options['divStyle'])      { divStyle      = options['divStyle']; };
      };
      var bd = boards.length;
      if (!header) { header = ''; };
      if (!footer) { footer = ''; };
      var demoBoard = {};
      boards[bd] = demoBoard;
      demoBoard.fens = [fen];
      demoBoard.id = id;
      demoBoard.dragPromotion = '';

// ensure all tokens are separated by white space
      var L = pgn.replace(/([\(\)])/g, ' $1 ');
/* input language support
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
*/
      switch (languageIn) {
        case "German":
        case "Danish":
        case "Norwegian":
        case "Swedish":
          L = L.replace(/B/g, 'P').replace(/S/g, 'N').replace(/L/g, 'B').replace(/T/g, 'R').replace(/D/g, 'Q');
          break;
        case "Czech":
          L = L.replace(/J/g, 'N').replace(/S/g, 'B').replace(/V/g, 'R').replace(/D/g, 'Q');
          break;
        case "Finnish":
          L = L.replace(/R/g, 'N').replace(/L/g, 'B').replace(/T/g, 'R').replace(/D/g, 'Q');
          break;
        case "French":
          L = L.replace(/C/g, 'N').replace(/F/g, 'B').replace(/D/g, 'Q').replace(/R/g, 'K').replace(/T/g, 'R');
          break;
        case "Hungarian":
          L = L.replace(/G/g, 'P').replace(/H/g, 'N').replace(/B/g, 'R').replace(/V/g, 'Q').replace(/F/g, 'B');
          break;
        case "Icelandic":
          L = L.replace(/R/g, 'N').replace(/H/g, 'R').replace(/D/g, 'Q');
          break;
        case "Italian":
        case "Spanish":
          L = L.replace(/C/g, 'N').replace(/A/g, 'B').replace(/D/g, 'Q').replace(/R/g, 'K').replace(/T/g, 'R');
          break;
        case "Polish":
          L = L.replace(/S/g, 'N').replace(/G/g, 'B').replace(/W/g, 'R').replace(/H/g, 'Q');
          break;
        case "Portuguese":
          L = L.replace(/C/g, 'N').replace(/D/g, 'Q').replace(/R/g, 'K').replace(/T/g, 'R');
          break;
        case "Romanian":
          L = L.replace(/N/g, 'B').replace(/D/g, 'Q').replace(/R/g, 'K').replace(/T/g, 'R').replace(/C/g, 'N');
          break;
        case "Dutch":
          L = L.replace(/P/g, 'N').replace(/L/g, 'B').replace(/T/g, 'R').replace(/D/g, 'Q').replace(/O/g, 'P');
          L = L.replace(/P-P-P/g, 'O-O-O').replace(/P-P/g, 'O-O');
          break;
        case "Estonian":
          L = L.replace(/R/g, 'N').replace(/O/g, 'B').replace(/V/g, 'R').replace(/L/g, 'Q');
          L = L.replace(/B-B-B/g, 'O-O-O').replace(/B-B/g, 'O-O');
          break;
      };
      L = L.replace(/\s+/g, ' ').split(' ');
// build move tree from PGN data
      var moveList = [];
      var height = 0;
      var moves = [];
      for (var i=0;i<L.length;i++) {
        L[i] = L[i].replace(/^\d*\.*/, '');
        if (L[i]=='(') {
          moves[moves.length] = [];
          moveList[height] = moves;
          moves = moves[moves.length-1];
          height += 1;
        } else if (L[i]==')') {
          height -= 1;
          moves = moveList[height];
        } else if (castlingPattern.test(L[i]) ||
                   pieceMovePattern.test(L[i]) ||
                   pawnMovePattern.test(L[i])) {
          moves[moves.length] = L[i];
        };
      };
      demoBoard.moves = moves;
      var html;
      if (showNotation==1) {
        html = header + '<table border="0" cellpadding="0" cellspacing="0" align="center"' +
                 'style="' + notationStyle + '">' +
                 '<tr><th>&nbsp;&nbsp;&nbsp;</th><th>a</th><th>b</th><th>c</th><th>d</th><th>e</th><th>f</th><th>g</th><th>h</th><th>&nbsp;&nbsp;&nbsp;</th></tr>' +
                 '<tr><th valign="middle">8</th><td colspan="8" rowspan="8">' +
                 '<div id="' + id + '_board" style="width:' + boardWidth + '"></div>' +
                 '</td><th valign="middle">8</th></tr>' +
                 '<tr><th valign="middle">7</th><th valign="middle">7</th></tr>' +
                 '<tr><th valign="middle">6</th><th valign="middle">6</th></tr>' +
                 '<tr><th valign="middle">5</th><th valign="middle">5</th></tr>' +
                 '<tr><th valign="middle">4</th><th valign="middle">4</th></tr>' +
                 '<tr><th valign="middle">3</th><th valign="middle">3</th></tr>' +
                 '<tr><th valign="middle">2</th><th valign="middle">2</th></tr>' +
                 '<tr><th valign="middle">1</th><th valign="middle">1</th></tr>' +
                 '<tr><th>&nbsp</th><th>a</th><th>b</th><th>c</th><th>d</th><th>e</th><th>f</th><th>g</th><th>h</th><th>&nbsp;</th></tr></table>' +
                 '<input type="button" onclick="ChessDiagram.show(' + bd + ', 0);" value="| &lt;" />';
      } else {
        html = header +
                 '<br /><div id="' + id + '_board" style="width:' + boardWidth + '"></div>' +
                 '<input type="button" onclick="ChessDiagram.show(' + bd + ', 0);" value="| &lt;" />';
      };

      if (demoBoard.moves.length > 0) {
        html = html +
           '<input type="button" onclick="ChessDiagram.show(' + bd + ', 1);" value=" &gt; " />' +
           '<input type="button" onclick="ChessDiagram.show(' + bd + ',-1);" value=" &lt; " />' +
           '<input type="button" onclick="ChessDiagram.togglePGN(' + bd + ');" value=" + " />';
      };
      html = html +
           '&nbsp;<span id="' + id + '_num">' + fen.split(' ')[5] + '.</span>' +
           '&nbsp;<img id="' + id + '_col" width="8" src="' + imgPath + fen.split(' ')[1] + '.png" />&nbsp;&nbsp;' +
           footer + '<br />';
// interactive move tree
      html = html + '<span id="' + id + '_pgn" style="display:none">' +
             moveTree(moves, ' <span onclick="ChessDiagram.m(' + bd + ',[',
             parseInt(fen.split(' ')[5]), fen.split(' ')[1]) + 
             '</span>';
      document.getElementById(id).innerHTML = html;
      if (divStyle != '-') {
        for (var key in divStyle) { document.getElementById(id).style[key] = divStyle[key]; };
      };
      demoBoard.board =  new ChessBoard(id + '_board', {
                                        draggable:     true, 
                                        dropOffBoard:  'trash', 
                                        showNotation:  (showNotation==2),
                                        pieceTheme:    pieceTheme, 
                                        position:      fen,
                                        onDrop:        function(source, target, piece, newPos, oldPos, orientation) {
                                                         return onDrop(bd, source, target, piece); },
                                        onSnapEnd:     function() { onSnapEnd(bd); },
                                        onSnapbackEnd: function() { onSnapEnd(bd); }
                                        } );
      demoBoard.movePtr = 0;
      demoBoard.lineFens = demoBoard.fens;
      demoBoard.lineMoves = demoBoard.moves;
      demoBoard.showPGN = false;
    }
  };
} () ;
