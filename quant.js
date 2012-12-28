var stdLuminanceQuantTbl = [
        16,  11,  10,  16,  24,  40,  51,  61,
	12,  12,  14,  19,  26,  58,  60,  55,
	14,  13,  16,  24,  40,  57,  69,  56,
	14,  17,  22,  29,  51,  87,  80,  62,
	18,  22,  37,  56,  68, 109, 103,  77,
	24,  35,  55,  64,  81, 104, 113,  92,
	49,  64,  78,  87, 103, 121, 120, 101,
        72,  92,  95,  98, 112, 100, 103,  99];


var stdChrominanceQuantTbl = [
	17,  18,  24,  47,  99,  99,  99,  99,
	18,  21,  26,  66,  99,  99,  99,  99,
	24,  26,  56,  99,  99,  99,  99,  99,
	47,  66,  99,  99,  99,  99,  99,  99,
	99,  99,  99,  99,  99,  99,  99,  99,
	99,  99,  99,  99,  99,  99,  99,  99,
	99,  99,  99,  99,  99,  99,  99,  99,
	99,  99,  99,  99,  99,  99,  99,  99
];

var DCTSIZE2 = 64;
function scaleQuantTbl(basicTable, scaleFactor) {
	var quantTable = [];
	var forceBaseline = false;
	for (var i = 0; i < DCTSIZE2; i++) {
		var temp = (basicTable[i] * scaleFactor + 50) / 100 | 0;
		/* limit the values to the valid range */
		if (temp <= 0) temp = 1;
		if (temp > 32767) temp = 32767; /* max quantizer needed for 12 bits */
		if (forceBaseline && temp > 255)
			temp = 255;              /* limit to baseline range if requested */
		quantTable[i] = temp;
	}
	return quantTable;
}


function tblsAreSame(tbl1, tbl2) {
	for (var i = 0; i <= DCTSIZE2; i++) {
		if (tbl1[i] != tbl2[i])
			return false;
	}
	return true;
}

function jpegQualityScaling(quality)
{
	/* Safety limit on quality factor.  Convert 0 to 1 to avoid zero divide. */
	if (quality <= 0) quality = 1;
	if (quality > 100) quality = 100;

        /* The basic table is used as-is (scaling 100) for a quality of 50.
	 * Qualities 50..100 are converted to scaling percentage 200 - 2*Q;
	 * note that at Q=100 the scaling is 0, which will cause jpeg_add_quant_table
	 * to make all the table entries 1 (hence, minimum quantization loss).
	 * Qualities 1..50 are converted to scaling percentage 5000/Q.
	 */
	if (quality < 50)
		quality = 5000 / quality;
	else
		quality = 200 - quality*2;

	return quality;
}



function findMatchingQuality(tbl) {
	for (var quality = 0; quality <= 100; quality++) {
		if (tblsAreSame(tbl, scaleQuantTbl(stdLuminanceQuantTbl, jpegQualityScaling(quality))))
			return quality;
		if (tblsAreSame(tbl, scaleQuantTbl(stdChrominanceQuantTbl, jpegQualityScaling(quality))))
			return quality;
	}
	return false;
}


