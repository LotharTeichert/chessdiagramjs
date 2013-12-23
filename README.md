# chessdiagramjs

This is a javascript implementation of a "living" chess diagram to be used on web pages.

It is an application of the nice chessboard.js of Chris Oakman which in turn depends on json and jQuery.

## Usage
```html
<html>
<head>
 <title>Lucena Position</title>
 <link rel="stylesheet" href="../css/chessboard-0.3.0.css" />
 <script type="text/javascript" src="../js/json3.js"></script>
 <script type="text/javascript" src="../js/jquery-2.0.3.js"></script>
 <script type="text/javascript" src="../js/chessboard-0.3.0.js"></script>
 <script type="text/javascript" src="../js/chessdiagram.js"></script>
</head>
...
<div id="diag02" style="float:right;margin:0 8;width:290px"></div>
<script>
ChessDiagram.diagram('diag02', 
  '1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1',
  '1. Rd1+ Ke7 2. Rd4!  Ra1 3. Kc7 Rc1+ 4. Kb6 Rb1+ 5. Kc6 Rc1+ 6. Kb5 Rb1+ 7. Rb4!',
  '<b>The Lucena position</b><br />',
  'White wins<br />');
</script>
...
```
This will show a chessboard with three buttons to play back and forth in the provided move list.
At any point you may make your own moves on the board by dragging pieces around to check other variations.
See ["Lucena.htm"](http://www.lteichert.de/chessdiagramjs/examples/Lucena.htm) for an explanation of a chess endgame that I copied from wikipedia. I replaced all the pictures by "living" diagrams and think it's less cumbersome to read.

The only method of the generated object **ChessDiagram** that you have to know is **ChessDiagram.diagram**. It takes 5 or 6 parameters:
* The id of a div tag on the web page (where the board is placed).
* The description of the initial position as a FEN string.
* A list of moves in algebraic notation, long or short, English or German, move numbers and move decorations allowed (basically a copy of the explaining text on the web page).
* Some header string.
* Some footer string.
* Optional: an object of options overriding default values.

Make sure you give a correct FEN string and valid moves. No legality checks are made but the disambigation of algebraic short notation relies on proper setup.

The options object may contain:
* *boardWidth* (default `'240px'`): width of the board. Adjust the width of the surrounding div *id*, if any is given, factoring in the width of the board notation!
* *showNotation* (default `1`): 
 * 1 = show traditional board notation, 
 * 2 = show chessboardjs style board notation (inside board), 
 * 3 = no board notation
* *notationStyle* (default `'background-color:#f0f0f0;font-family:Lucida Console;font-size:12px;line-height:200%'`): this is the style of a table tag containing the board in its center and the notation (if showNotation = 1) as its first and last rows and columns. Try other values than the given one for changing appearance or when you changed *boardWidth*.
* *imgPath* (default is a guess from the html script tag assuming the img directory is a sibling of the script directory): give the path to the immages explicitly, if the guess is wrong.
* *pieceTheme* (default is the guessed *imgPath* + 'chesspieces/wikipedia/{piece}.png'): the pieceTheme of chessboardjs. 
 
If you call ChessDiagram.diagram with options, the new options will hold until they are again overridden by a call to ChessDiagram.diagram with options.


## Code Highlights
The function "makeMove(fen, move)" is the heart of ChessDiagram. It takes a FEN string (Forsyth Edwards notation, an easy standard description of a chess position) and a move string in algebraic notation (see the example above) and computes the FEN string of the resulting position. This is done by some complex applications of the RegExp object in javascript, without fiddling around with internal board representations.

## ToDo
* Completing documentation.
* Checking more browsers for correct functionality.
* Checking all branches of move generation.
* More features?
* Convincing the guys from wikipedia to use these diagrams instead of pictures.  :))
