#find ../.. -name '*.js' -o -name '*.vue' -exec  grep '$t(' '{}'  ';' | sed -e "s/.*$t[ ]*([ ]*[\'\`][ ]*\([\.a-zA-Z0-9_\-]*\)[ ]*[\'\`][ ]*.*/found: \1/g" |grep -v "found: " 

find ../.. -name '*.js' -o -name '*.vue' -exec  grep '$t(' '{}'  ';' | sed -e "s/.*$t[ ]*([ ]*[\'\`][ ]*\([\.a-zA-Z0-9_\-]*\)[ ]*[\'\`][ ]*.*/found: \1/g" |grep "found: " | sed "s/found: //g" |sort |uniq 
