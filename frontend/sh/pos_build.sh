#!/bin/bash

cd build

sed -i 's/\/static\/js/\/static\/js_react/g' index.html
sed -i 's/\/static\/css/\/static\/css_react/g' index.html
#sed -i 's/\/favicon.ico/\/static\/images\/favicon.ico/g' index.html

mv index.html template_react.html

sed -i 's/<body>/<body><script>{{corpo | safe }}<\/script>/g' template_react.html

# RENOMEAR AS PASTAS js e css para js_react e css_react
cd static 
mv js js_react
mv css css_react

cd ../.. 
# Removendo a js_react e css_react
rm -rf $1/js_react && rm -rf $1/css_react

cp -rf build/static/js_react $1
cp -rf build/static/css_react $1
cp -rf build/static/media $1

cp -rf build/*.html $2