SRC=depthmesh.js binary.js

depthmesh.bin.js: ${SRC}
	python ${CLOSURE}/closure/bin/build/closurebuilder.py -c ${CLOSURE}/compiler.jar \
	-f --create_source_map=depthmesh.bin.js.map  -f --source_map_format=V3 \
	 --root ${CLOSURE}/closure --root ${CLOSURE}/third_party/closure  \
	${SRC} -i binary.js -o compiled -f --compilation_level=SIMPLE_OPTIMIZATIONS \
	-f --externs=../renderer/js/externs/three.js \
	-f --externs=../renderer/js/externs/jquery-1.9.js --output_file=depthmesh.bin.js
	echo "//# sourceMappingURL=renderer.js.map" >> depthmesh.bin.js

clean:
	rm -f depthmesh.bin.js
