// Pass in a video stream to the model to detect poses.
const video = document.getElementById('video');


let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

function drawCircle(x, y, r, c, options, arc, start) {

  if (!options)
    options = {};

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, start || 0, arc || 2 * Math.PI, false);
    ctx.fillStyle = c || 'red';
    ctx.globalAlpha = options.alpha || 1;
    if (options.glow)
      ctx.shadowBlur = options.glowWidth || 100;
    if (options.glowColor)
    ctx.shadowColor = options.glowColor || 'aqua';
  if (options.fill || options.fill == undefined)
      ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = options.outlineWidth || 1;
    ctx.strokeStyle = options.outlineColor || 'black';
    if (options.outline)
      ctx.stroke();
    ctx.closePath();
    ctx.restore();
}

function drawLine(x1, y1, x2, y2, color, thickness, cap, alpha) {

	ctx.beginPath();
	ctx.lineWidth = thickness;
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.globalAlpha = alpha || 1;
	ctx.strokeStyle = color || "black";
	ctx.lineCap = cap || "default";
	ctx.stroke();
	ctx.globalAlpha = 1;
	ctx.closePath();
}

function drawRectangle(x, y, w, h, c, options) {

	if (!options)
		options = {};

	ctx.save();
	ctx.translate(x, y);
	ctx.beginPath();
	ctx.rect(0, 0, w, h);
	ctx.fillStyle = c || 'black';
	ctx.globalAlpha = options.alpha || 1;
	if (options.fill == undefined || options.fill)
		ctx.fill();
	ctx.strokeStyle = options.outlineColor || "black";
	ctx.lineWidth = options.outlineWidth || 1;
	if (options.outline)
		ctx.stroke();
	ctx.closePath();
	ctx.restore();
}

function drawText(text, x, y, font, color, align, baseline, alpha) {

	let options = {};
	if (font instanceof Object) {
		options = font;
	}
	ctx.beginPath();
	ctx.font = options.font || font || "20px Arial";
	ctx.fillStyle = options.color || color || "red";
	ctx.textAlign = options.align || align || "default";
	ctx.globalAlpha = alpha || 1;
	ctx.textBaseline = options.baseline || baseline || "default";
	ctx.fillText(text, x, y);
	ctx.globalAlpha = 1;
	ctx.closePath();
}

function linearRegression(x, y){
        var lr = {};
        var n = y.length;
        var sum_x = 0;
        var sum_y = 0;
        var sum_xy = 0;
        var sum_xx = 0;
        var sum_yy = 0;

        for (var i = 0; i < y.length; i++) {

            sum_x += x[i];
            sum_y += y[i];
            sum_xy += (x[i]*y[i]);
            sum_xx += (x[i]*x[i]);
            sum_yy += (y[i]*y[i]);
        } 

        lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
        lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
        lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

        return lr;
}