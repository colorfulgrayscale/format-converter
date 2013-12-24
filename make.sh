#!/bin/bash


FILE_LOCATION="./bin/Format-Converter.app/Contents/Resources/app.nw"

rm -rf  $FILE_LOCATION

zip -r9 $FILE_LOCATION * --exclude=*.app* && open ./bin/Format-Converter.app