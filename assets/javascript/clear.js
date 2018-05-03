var w1200 = window.matchMedia('(min-width: 1200px)');
w1200.addListener(clearRows(w1200,5)); // >=1200px, 5 items per row

function clearRows(query, rowItems) {
    if (query.matches) {
        var checkInt = setInterval(clearCheck, 200);
        var clearCheck = function() {
            for (x=1;x<=15;x++) {
                if (x % rowItems == 0){
                    var clearNum = '$("'+'.clear'+(x+1)+'")';
                    var check = eval(clearNum);
                    check.attr('style', 'clear:both');
                }
                else {
                    var noClear = '$("'+'.clear'+(x+1)+'")';
                    var noClearEval = eval(noClear);
                    noClearEval.removeAttr('style');
                }
            }
            clearInterval(checkInt);
        };
    }
}