
dir=/run/media/birkbeck/b6312fc2-943d-4780-a126-1661724d8a55/bucklake/raid0/birkbeck/stereo_time_old/

near=2
far=6
./convert_obj_to_depthmesh --image ${dir}/0/image-%04d.tga \
    --clb ${dir}/0/calib.clb --geom ${dir}/geom-%04d.obj \
    --numImages 100 --near=${near} --far=${far}

for i in `seq 0 99`; 
do 
    img=`printf %04d $i`;
    
    convert ${dir}/0/image-${img}.tga /tmp/image-${img}.png
    convert -append /tmp/image-${img}.png /tmp/depth-${img}.png \
        /tmp/out-${img}.png; 
done


ffmpeg -i /tmp/out-%04d.png -vb 10M /tmp/video.webm
