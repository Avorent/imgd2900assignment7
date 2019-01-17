/*
game.js for Perlenspiel 3.3.x
Last revision: 2018-10-14 (BM)

Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
This version of Perlenspiel (3.3.x) is hosted at <https://ps3.perlenspiel.net>
Perlenspiel is Copyright © 2009-18 Worcester Polytechnic Institute.
This file is part of the standard Perlenspiel 3.3.x devkit distribution.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with the Perlenspiel devkit. If not, see <http://www.gnu.org/licenses/>.
*/

/*
This JavaScript file is a template for creating new Perlenspiel 3.3.x games.
By default, all event-handling function templates are COMMENTED OUT (using block-comment syntax), and are therefore INACTIVE.
Uncomment and add code to the event handlers required by your project.
Any unused event-handling function templates can be safely deleted.
Refer to the tutorials and documentation at <https://ps3.perlenspiel.net> for details.
*/

/*
The following comment lines are for JSHint <https://jshint.com>, a tool for monitoring code quality.
You may find them useful if your development environment is configured to support JSHint.
If you don't use JSHint (or are using it with a configuration file), you can safely delete these lines.
*/

/* jshint browser : true, devel : true, esversion : 5, freeze : true */
/* globals PS : true */

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.init() event handler:


var G, data; // establish global namespace

( function () {
 var id; // sprite identifier
 var xpos = 0; // x-pos of sprite
 var ypos = 0; // y-pos of sprite

 var floorPlane = 0;
 var actorPlane = 6;

 var path = null; // path to follow, null if none
 var step = 0; // current step on path

 // Timer function, called every 1/10th sec

 function tick () {
 var p, nx, ny;

 if ( path ) { // path ready (not null)?
 // Get next point on path

 p = path[ step ];
 nx = p[ 0 ]; // next x-pos
 ny = p[ 1 ]; // next y-pos

 // If actor already at next pos,
 // path is exhausted, so nuke it

 if ( ( xpos === nx ) && ( ypos === ny ) ) {
 path = null;
 return;
 }

 // Move sprite to next position

 PS.spriteMove( id, nx, ny );
 xpos = nx; // update xpos
 ypos = ny; // and ypos

 step += 1; // point to next step

 // If no more steps, nuke path

 if ( step >= path.length ) {
 path = null;
 }
 }
 }

 function drawCircle (x0, y0, radius, canvas) {
  var ripplePlane = 5;
 	var x = radius-1;
 	var y = 0;
 	var dx = 1;
 	var dy = 1;
 	var diameter = radius * 2;
 	var decisionOver2 = dx - diameter;   // Decision criterion divided by 2 evaluated at x=r, y=0
 	var imageWidth = G.width;
 	var imageHeight = G.height;
 	var context = canvas.getContext('2d');
 	var imageData = context.getImageData(0, 0, imageWidth, imageHeight);
 	var pixelData = imageData.data;
 	var makePixelIndexer = function (width) { // Not sure what this is - PL
 		return function (i, j) {
 			var index = CHANNELS_PER_PIXEL * (j * width + i);
 			//index points to the Red channel of pixel
 			//at column i and row j calculated from top left
 			return index;
 		};
 	};
 	var pixelIndexer = makePixelIndexer(imageWidth);
 	var drawPixel = function (x, y) {
 		var idx = pixelIndexer(x,y);
 		pixelData[idx] = 255;	//red
 		pixelData[idx + 1] = 0;	//green
 		pixelData[idx + 2] = 255;//blue
 		pixelData[idx + 3] = 255;//alpha
 	};

 	while (x >= y) {
 		drawPixel(x + x0, y + y0);
 		drawPixel(y + x0, x + y0);
 		drawPixel(-x + x0, y + y0);
 		drawPixel(-y + x0, x + y0);
 		drawPixel(-x + x0, -y + y0);
 		drawPixel(-y + x0, -x + y0);
 		drawPixel(x + x0, -y + y0);
 		drawPixel(y + x0, -x + y0);
 		if (decisionOver2 <= 0)
 		{
 		    y++;
 			decisionOver2 += dy; // Change in decision criterion for y -> y+1
 			dy += 2;
 		}
 		if (decisionOver2 > 0)
 		{
 			x--;
 			dx += 2;
 			decisionOver2 += (-diameter) + dx; // Change for y -> y+1, x -> x-1
 		}
 	}

 	context.putImageData(imageData, 0, 0);
 }

 G = {
 width : 32, // width of grid
 height : 32, // height of grid

 // Draw floor and initialize sprite

 drawMap : function () {
 var x, y, val;

 // Create random blue ocean floor

 PS.gridPlane( floorPlane );
 for ( y = 0; y < G.height; y += 1 ) {
 for ( x = 0; x < G.width; x += 1 ) {
 val1 = ( PS.random( 30 ) - 1 ) + 150;
 val2 = ( PS.random( 30 ) - 1 ) + 180;
 val3 = ( PS.random( 32 ) - 1 ) + 224;
 PS.color( x, y, val1, val2, val3);
 }
 }

 // Create 1x1 solid white sprite
 // Place on plane 1 in center of grid

 id = PS.spriteSolid( 1, 1 );
 PS.spriteSolidColor( id, PS.COLOR_WHITE );
 PS.spritePlane( id, actorPlane );
 PS.spriteMove( id, xpos, ypos );

 // Start the timer function
 // Run at 60 frames/sec (every x ticks)

 PS.timerStart( 1, tick );
 },

 // move( x, y )
 // Set up new path

 move : function ( x, y ) {
 var line;

 // Calc a line from current position
 // to touched position

 line = PS.line( xpos, ypos, x, y );

 // If line is not empty,
 // make it the new path

 if ( line.length > 0 ) {
 path = line;
 step = 0; // start at beginning
 }


 }
 };
}() );

PS.init = function( system, options ) {
	"use strict"; // Do not remove this directive!
	// Uncomment the following code line
	// to verify operation:

	// PS.debug( "PS.init() called\n" );

	// This function should normally begin
	// with a call to PS.gridSize( x, y )
	// where x and y are the desired initial
	// dimensions of the grid.
	// Call PS.gridSize() FIRST to avoid problems!
	// The sample call below sets the grid to the
	// default dimensions (8 x 8).
	// Uncomment the following code line and change
	// the x and y parameters as needed.

	PS.gridSize( G.width, G.height ); // init grid
	PS.border( PS.ALL, PS.ALL, 0 ); // no borders
	// PS.radius( PS.ALL, PS.ALL, 50 ); // circle
	G.drawMap(); // init walls & sprite

	// This is also a good place to display
	// your game title or a welcome message
	// in the status line above the grid.
	// Uncomment the following code line and
	// change the string parameter as needed.

	// Add any other initialization code you need here.
 // var myLoader;

 // Image loading function
 // Called when image loads successfully
 // [data] parameter will contain imageData

 // var myLoader = function ( imageData ){
 // var data;
 // data = imageData;
 // var x, y, ptr, color;

 // Report imageData in debugger

 PS.debug( "Loaded " + imageData.source +
 ":\nid = " + imageData.id +
 "\nwidth = " + imageData.width +
 "\nheight = " + imageData.height +
 "\nformat = " + imageData.pixelSize + "\n" );

 // Extract colors from imageData and
 // assign them to the beads

 // ptr = 0; // init pointer into data array
 // for ( y = 0; y < 3; y += 1 ) {
 // for ( x = 0; x < 3; x += 1 ) {
 // color = imageData.data[ ptr ]; // get color
 // PS.color( x, y, color ); // assign to bead
 // ptr += 1; // point to next value
 // }
 // }
 // };

 PS.border( PS.ALL, PS.ALL, 0 ); // no borders

 // Load image in format 1

 // PS.imageLoad( "fish.bmp", myLoader, 1 );
 // PS.gridPlane(3);
 // PS.imageBlit( data, 0, 0);
 	PS.statusText( "Hover mouse over grid" );
};

/*
PS.touch ( x, y, data, options )
Called when the left mouse button is clicked over bead(x, y), or when bead(x, y) is touched.
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.touch() event handler:



PS.touch = function( h, k, data, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line
	// to inspect x/y parameters:
  // for( r = 1; r < G.height; r += 1 ){
  //   for()
  // };

 // var myLoader = function ( imageData ) {
 // data = imageData; // save data for later
 //
 // PS.debug( "Loaded " + data.source +
 // ":\nid = " + data.id +
 // "\nwidth = " + data.width +
 // "\nheight = " + data.height +
 // "\nformat = " + data.pixelSize + "\n" );
 //
 // // Calculate minimum x/y positions that will
 // // keep image on the grid
 //
 // xmin = 0 - ( data.width - G.width );
 // ymin = 0 - ( data.height - G.height );
 //
 // // Blit image to grid at center
 //
 // PS.imageBlit( data, 0, 0);
 };
  // PS.imageLoad( "fish.bmp", myLoader,1);
	// PS.debug( "PS.touch() @ " + h + ", " + k + "\n" );

	// Add code here for mouse clicks/touches
	// over a bead.
};



/*
PS.release ( x, y, data, options )
Called when the left mouse button is released, or when a touch is lifted, over bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.release() event handler:

/*

PS.release = function( x, y, data, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead.
};

*/

/*
PS.enter ( x, y, button, data, options )
Called when the mouse cursor/touch enters bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.enter() event handler:



PS.enter = function( x, y, data, options ) {
	"use strict"; // Do not remove this directive!
	G.move( x, y );
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead.
};



/*
PS.exit ( x, y, data, options )
Called when the mouse cursor/touch exits bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.exit() event handler:

/*

PS.exit = function( x, y, data, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead.
};

*/

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.exitGrid() event handler:

/*

PS.exitGrid = function( options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid.
};

*/

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.keyDown() event handler:

/*

PS.keyDown = function( key, shift, ctrl, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is pressed.
};

*/

/*
PS.keyUp ( key, shift, ctrl, options )
Called when a key on the keyboard is released.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.keyUp() event handler:

/*

PS.keyUp = function( key, shift, ctrl, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.
};

*/

/*
PS.input ( sensors, options )
Called when a supported input device event (other than those above) is detected.
This function doesn't have to do anything. Any value returned is ignored.
[sensors : Object] = A JavaScript object with properties indicating sensor status; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: Currently, only mouse wheel events are reported, and only when the mouse cursor is positioned directly over the grid.
*/

// UNCOMMENT the following code BLOCK to expose the PS.input() event handler:

/*

PS.input = function( sensors, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code lines to inspect first parameter:

//	 var device = sensors.wheel; // check for scroll wheel
//
//	 if ( device ) {
//	   PS.debug( "PS.input(): " + device + "\n" );
//	 }

	// Add code here for when an input event is detected.
};

*/

/*
PS.shutdown ( options )
Called when the browser window running Perlenspiel is about to close.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: This event is generally needed only by applications utilizing networked telemetry.
*/

// UNCOMMENT the following code BLOCK to expose the PS.shutdown() event handler:

/*

PS.shutdown = function( options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to verify operation:

	// PS.debug( "“Dave. My mind is going. I can feel it.”\n" );

	// Add code here to tidy up when Perlenspiel is about to close.
};

*/
