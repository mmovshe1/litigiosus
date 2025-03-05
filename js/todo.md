TODO:

instead of having two separate maps, have single array:

myBoard.tileMap = new Array(WIDTH*HEIGHT)

Tile :
    placed: true | false //on board or in hand
    empty:  true | false //is a placeholder
    north:  true | false
    south:  true | false
    east:   true | false
    west:   true | false
    directions: [1,3,5,7] variation
    <!-- div:    reference to DOM element ? -->
    id:     0->(Size-1), then hand id's from SIZE -> inf.

given two tile ids, swap their Tiles in tileMap. 



location + NORTH
location + SOUTH
bitshifting 

directions? [-1,0] or [0,1]