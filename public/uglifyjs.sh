#!/bin/bash
cd dist/scripts/

NAME=`ls *.all.js`

cp $NAME all.js
uglifyjs all.js  -o $NAME -m -c