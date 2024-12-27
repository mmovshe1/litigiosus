# litigiosus

Simple grid-map system for building paths

1 2 3
5 7 11

13 17 19
23 29 31
37 41 47

141 cross

```
┣   ┳   ┻   ┫   ┛   ┏  ┗  ┓  ╋
118 124 100 110 69 101 77 93 141
alternitively:
TRB 1,5,7
RBL 3,5,7
LTR 1,3,5
BLT 1,3,7
TB  1,7
LR  3,5
LT  1,3
RB  5,7
TR  1,5
BL  3,7
TRBL  1,3,5,7
```

[1,5,7],[3,5,7],[1,3,5],[1,3,7], [1,3],[1,5],[3,7],[5,7], [1,7],[3,5], [1,3,5,7]

### How to generate a random path?

Each random path (RP) has a center.
There are `2*2*2*2` options for a RP
where each side is either one of {T,L,R,B}
or {E}.

Cntr= [0,0,0,0,1,0,0,0,0] //C 4

Top = [0,1,0,0,0,0,0,0,0] //T 1
Left =[0,0,0,1,0,0,0,0,0] //L 3
Right=[0,0,0,0,0,1,0,0,0] //R 5
Bot = [0,0,0,0,0,0,0,1,0] //B 7
Empty=[0,0,0,0,0,0,0,0,0] //E

```
function nextRandomValue() {
  return (new Date().getTime() % 10000) / 10000;
}
```

Pre-create the "demo copies" of the possible paths.
Then, make hard copies.
