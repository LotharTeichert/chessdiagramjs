# chessdiagramjs

This is a javascript implementation of a "living" chess diagram to be used on web pages.

It relies on the nice chessboard.js of Chris Oakman which in turn depends on json and jQuery.

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
<div id="diag02" style="float:right;margin:0 8;width:280px"></div>
<script>
ChessDiagram.diagram('diag02', 
  '1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1',
  '1. Rd1+ Ke7 2. Rd4!  Ra1 3. Kc7 Rc1+ 4. Kb6 Rb1+ 5. Kc6 Rc1+ 6. Kb5 Rb1+ 7. Rb4!',
  '<b>The Lucena position</b><br />',
  'White wins<br />');
</script>
...
```
This will show a chessboard with three buttons to play back and forth in a provided movelist.
At any point you may make your own moves on the board by dragging pieces around to check other variations.
See "Lucena.htm" in the examples for an explanation of a chess endgame that I copied from wikipedia. I replaced all the pictures by "living" diagrams and think it's less cumbersome to read.

The only method of the object ChessDiagram that you have to know is "diagram". It takes 5 parameters:
* The id of a div tag on the web page (where the board is placed).
* The description of the initial position as a FEN string.
* A list of moves in algebraic notation, long or short, English or German, move numbers and move decorations allowed (basically a copy of the explaining text on the web page).
* Some header string.
* Some footer string.

Make sure you give a correct FEN string and valid moves. No legality checks are made but the disambigation of algebraic short notation relies on proper setup.


## Code Highlights
The function "makeMove(fen, move)" is the heart of the ChessDiagram. It takes a FEN string (Forsyth Edwards notation, an easy standard description of a chess position) and a move string in algebraic notation (see the example above) and computes the FEN string of the resulting position. This is done by some complex aptplications of the RegExp object in javascript, without fiddling around with internal board representations.

## ToDo
* Completing documentation.
* Checking more browsers for correct functionality.
* Checking all branches of move generation.
* More functionalies?
* Convincing the guys from wikipedia to use these diagrams instead of pictures.  :))
