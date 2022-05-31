"use strict";

var canvas = document.getElementById("canvas");
var cwidth = canvas.width = canvas.offsetWidth;
var cheight = canvas.height = canvas.offsetHeight;

var xmin = -2;
var xmax = 1;
var ymin = -1.2;
var ymax = 1.2;

var nmax = 1000;
var l = 4;
var frct = 11;
var cr = 0.28;
var ci = 0.01;

var d0,d1;

var coul=[];

function calCoul() {
    coul[0]=0;
    for (let i=1; i<nmax; i++){
        coul[i]=Math.floor(128*Math.log10(i));
    }
}
calCoul();

function coord(x, w, c) { // x[x, y], w[xmin, xmax, ymin, ymax], c[cwidth, cheight]
    let xs = (w[1]-w[0])/c[0];
    let ys = (w[3]-w[2])/c[1];
    return [w[0]+x[0]*xs, w[2]+x[1]*ys];
}

const gpu = new GPU();
gpu.addFunction(coord/*,{precision:'single', tactic:'precision'}*/);
var mandelbrotGPU = gpu.createKernel(function(xmin,xmax,ymin,ymax,nmax,cwidth,cheight) {
    let x = [0,0];
    x = coord([this.thread.x, this.thread.y], [xmin, xmax, ymin, ymax], [cwidth, cheight]);
    let cx = x[0];
    let cy = x[1];
    let x1 = cx;
    let y1 = cy;
    let out = false;
    let i = 0;
    for(;i<nmax;i++){
                let xx = x1**2;
                let yy = y1**2;
                if (xx+yy>4){out=true;break;}
                y1 = 2*x1*y1+cy;
                x1 = xx-yy+cx;
            }
    if (out){
        this.color(Math.log10(i)/2, i*2/256, i/256);
    } else {
        this.color(0, 0, 0);
    }
})
//   .setPrecision('single')
//   .setTactic('precision')
  .setLoopMaxIterations(10000)
  .setOutput([cwidth, cheight])
  .setGraphical(true);

function mandelGPU() {
mandelbrotGPU(xmin,xmax,ymin,ymax,nmax,cwidth,cheight);
document.getElementById('canvas').getContext('2d').drawImage(gpu.canvas, 0, 0);
}

function mandelbrot(){
    var context,img,r,v,b,a=255;
    context = canvas.getContext("2d");
    var xs = (xmax-xmin)/cwidth;
    var ys = (ymax-ymin)/cheight;
    img = context.createImageData(cwidth,cheight);
    for (var y=0,j=0;y<cheight;y++){
        var cy = ymax - y*ys;
        for (var x=0;x<cwidth;x++){
            var cx = xmin + x*xs;
            var x1 = cx;
            var y1 = cy;
            for(var i=0;i<nmax;i++){
                var xx = x1**2;
                var yy = y1**2;
                if (xx+yy>l){break;}
                y1 = 2*x1*y1+cy;
                x1 = xx-yy+cx;
            }
            if (i === nmax){
                r=v=b=0;
            } else {
                r=coul[i];
                v=i*2;
                b=i;
            }
            img.data[j++] = r;
            img.data[j++] = v;
            img.data[j++] = b;
            img.data[j++] = a;
        }
    }
    context.putImageData(img, 0, 0);
}

var juliaGPU = gpu.createKernel(function(xmin,xmax,ymin,ymax,nmax,cwidth,cheight,cr,ci) {
    let x = [0,0];
    x = coord([this.thread.x, this.thread.y], [xmin, xmax, ymin, ymax], [cwidth, cheight]);
    let cx = x[0];
    let cy = x[1];
    let x1 = cx;
    let y1 = cy;
    let out = false;
    let i = 0;
    for(;i<nmax;i++){
                let xx = x1**2;
                let yy = y1**2;
                if (xx+yy>4){out=true;break;}
                y1 = 2*x1*y1+ci;
                x1 = xx-yy+cr;
            }
    if (out){
        this.color(Math.log10(i)/2, i*2/256, i/256);
    } else {
        this.color(0, 0, 0);
    }
})
//   .setPrecision('single')
//   .setTactic('precision')
  .setLoopMaxIterations(10000)
  .setOutput([cwidth, cheight])
  .setGraphical(true);

function julGPU(cr,ci) {
juliaGPU(xmin,xmax,ymin,ymax,nmax,cwidth,cheight,cr,ci);
document.getElementById('canvas').getContext('2d').drawImage(gpu.canvas, 0, 0);
}

function julia(n){
    var context,img,r,v,b,a=255;
    context = canvas.getContext("2d");
    img = context.createImageData(cwidth,cheight);
    var xs = (xmax-xmin)/cwidth;
    var ys = (ymax-ymin)/cheight;
    for (var y=0,j=0;y<cheight;y++){
        var cy = ymax - y*ys;
        for (var x=0;x<cwidth;x++){
            var cr,ci;
            if (n === 1) {
                cr = 0.285;
                ci = 0.01;
            }else if (n === 2) {
                cr = 0.28;
                ci = -0.02;
            }else{
                cr = -0.15;
                ci = 1.03;
            }
            var cx = xmin + x*xs;
            var x1 = cx;
            var y1 = cy;
            for(var i=0;i<nmax;i++){
                var xx = x1**2;
                var yy = y1**2;
                if (xx+yy>l){break;}
                y1 = 2*x1*y1+ci;
                x1 = xx-yy+cr;
            }
            if (i === nmax){
                r=0;
                v=0;
                b=0;
            } else {
                r=Math.floor(128*Math.log(i)/Math.log(10));
                v=i*2;
                b=i;
            }
            img.data[j++] = r;
            img.data[j++] = v;
            img.data[j++] = b;
            img.data[j++] = a;
        }
    }
    context.putImageData(img, 0, 0);
}

var collGPU = gpu.createKernel(function(xmin,xmax,ymin,ymax,nmax,cwidth,cheight) {
    let x = [0,0];
    x = coord([this.thread.x, this.thread.y], [xmin, xmax, ymin, ymax], [cwidth, cheight]);
    let cx = x[0];
    let cy = x[1];
    let x1 = cx;
    let y1 = cy;
    let out = false;
    let i = 0;
    let norm=0;
    for(;i<1000;i++){
        let cosr = Math.cos(Math.PI*x1)*Math.cosh(Math.PI*y1);
        let cosi = Math.sin(Math.PI*x1)*Math.sinh(Math.PI*y1);
        let re = (2-(2+5*x1)*cosr+7*x1-5*y1*cosi)/4;
        let im = ((2+5*x1)*cosi+7*y1-5*y1*cosr)/4;
        x1 = re;
        y1 = im;
        norm = re*re+im*im;
        if (norm>nmax){out=true;break;}
    }
    if (out){
        let b=i*60;
        let v=(i-4)*80;
        let r=(i-4)*10;
        this.color(r/256, v/256, b/256);
    } else {
        this.color(0, 0, 0);
    }
})
//   .setPrecision('single')
//   .setTactic('precision')
  .setLoopMaxIterations(10000)
  .setOutput([cwidth, cheight])
  .setGraphical(true);

function collatzGPU() {
    collGPU(xmin,xmax,ymin,ymax,nmax,cwidth,cheight);
    document.getElementById('canvas').getContext('2d').drawImage(gpu.canvas, 0, 0);
}

function collatz() {
    var context,img,r,v,b,a=255;
    context = canvas.getContext("2d");
    var xs = (xmax-xmin)/cwidth;
    var ys = (ymax-ymin)/cheight;
    img = context.createImageData(cwidth,cheight);
    for (var y=0,j=0;y<cheight;y++){
        var cy = ymax - y*ys;
        for (var x=0;x<cwidth;x++){
            var cx = xmin + x*xs;
            var x1 = cx;
            var y1 = cy;
            for(var i=0;i<nmax;i++){
                let cosr = Math.cos(Math.PI*x1)*Math.cosh(Math.PI*y1);
                let cosi = Math.sin(Math.PI*x1)*Math.sinh(Math.PI*y1);
                let re = (2-(2+5*x1)*cosr+7*x1-5*y1*cosi)/4;
                let im = ((2+5*x1)*cosi+7*y1-5*y1*cosr)/4;
                x1 = re;
                y1 = im;
                if (re*re+im*im>10000){break;}
            }
            if (i === nmax){
                r=v=b=0;
            } else {
                b=i*60;//coul[i]*2;
                v=(i-4)*80;
                r=(i-4)*10;
                // r=v=b=i*10;
            }
            img.data[j++] = r;
            img.data[j++] = v;
            img.data[j++] = b;
            img.data[j++] = a;
        }
    }
    context.putImageData(img, 0, 0);  
}

var cosa = Math.cos(Math.PI/3);
var sina = Math.sin(Math.PI/3);
function koch(x1,y1,x2,y2,i,ctx){
    if ((i>=nmax)||(i>=9)){
        var xs = cwidth/(xmax-xmin);
        var ys = cheight/(ymax-ymin);
        var xa = (x1-xmin)*xs;
        var ya = (-y1+ymax)*ys;
        var xb = (x2-xmin)*xs;
        var yb = (-y2+ymax)*ys;
        ctx.lineJoin = "bevel";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xa,ya);
        ctx.lineTo(xb,yb);
        ctx.stroke();
    }else{
        var xa,ya,xb,yb,xc,yc;
        xa = x1+(x2-x1)/3;
        ya = y1+(y2-y1)/3;
        xc = x1+2*(x2-x1)/3;
        yc = y1+2*(y2-y1)/3;
        xb = cosa*(xc-xa) - sina*(yc-ya) + xa;
        yb = sina*(xc-xa) + cosa*(yc-ya) + ya;
        i++;
        koch(x1,y1,xa,ya,i,ctx);
        koch(xa,ya,xb,yb,i,ctx);
        koch(xb,yb,xc,yc,i,ctx);
        koch(xc,yc,x2,y2,i,ctx);
    }
}

function vankoch(){
    context = canvas.getContext("2d");
    if (nmax>9) {nmax = 9;document.getElementById("formiter").value=nmax;}
    context.strokeStyle = "#fff";
    koch(-1,1,1,1,0,context);
    koch(1,1,0,-0.732,0,context);
    koch(0,-0.732,-1,1,0,context);
}

function koch2(x1,y1,x2,y2,i,ctx){
    if ((i>=nmax)||(i>=5)){
        var xs = cwidth/(xmax-xmin);
        var ys = cheight/(ymax-ymin);
        var xa = (x1-xmin)*xs;
        var ya = (-y1+ymax)*ys;
        var xb = (x2-xmin)*xs;
        var yb = (-y2+ymax)*ys;
        ctx.lineJoin = "bevel";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xa,ya);
        ctx.lineTo(xb,yb);
        ctx.stroke();
    }else{
        var xa,ya,xb,yb,xc,yc,xd,yd,xe,ye,xf,yf,xg,yg;
        var xs = x2-x1;
        var ys = y2-y1;
        xa = x1+xs/4;
        ya = y1+ys/4;
        xd = x1+2*xs/4;
        yd = y1+2*ys/4;
        xg = x1+3*xs/4;
        yg = y1+3*ys/4;
        xb = xa-(yd-ya);
        yb = ya+(xd-xa);
        xc = xd-(yg-yd);
        yc = yd+(xg-xd);
        xe = xd-(xc-xd);
        ye = yd-(yc-yd);
        xf = xg-(yd-yg); 
        yf = yg+(xd-xg);
        i++;
        koch2(x1,y1,xa,ya,i,ctx);
        koch2(xa,ya,xb,yb,i,ctx);
        koch2(xb,yb,xc,yc,i,ctx);
        koch2(xc,yc,xd,yd,i,ctx);
        koch2(xd,yd,xe,ye,i,ctx);
        koch2(xe,ye,xf,yf,i,ctx);
        koch2(xf,yf,xg,yg,i,ctx);
        koch2(xg,yg,x2,y2,i,ctx);
    }
}

function vankoch2(){
    context = canvas.getContext("2d");
    if (nmax>5) {nmax = 5;document.getElementById("formiter").value=nmax;}
    context.strokeStyle = "#fff";
    koch2(-1,1,1,1,0,context);
    koch2(1,1,1,-1,0,context);
    koch2(1,-1,-1,-1,0,context);
    koch2(-1,-1,-1,1,0,context);
}

function sierp(x1,y1,x2,y2,x3,y3,i,ctx){
    if ((i>=nmax)||(i>=12)){
        var xs = cwidth/(xmax-xmin);
        var ys = cheight/(ymax-ymin);
        var xa = (x1-xmin)*xs;
        var ya = (-y1+ymax)*ys;
        var xb = (x2-xmin)*xs;
        var yb = (-y2+ymax)*ys;
        var xc = (x3-xmin)*xs;
        var yc = (-y3+ymax)*ys;
        ctx.lineJoin = "bevel";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xa,ya);
        ctx.lineTo(xb,yb);
        ctx.lineTo(xc,yc);
        ctx.closePath();
        ctx.fill();
    }else{
        var a = x1+(x3-x1)/4;
        var b = x1+2*(x3-x1)/4;
        var c = x1+3*(x3-x1)/4;
        var d = y1+(y2-y1)/2;
        i++;
        sierp(x1,y1,a,d,b,y1,i,ctx);
        sierp(a,d,x2,y2,c,d,i,ctx);
        sierp(b,y1,c,d,x3,y3,i,ctx);
    }
}

function sierpinski(){
    context = canvas.getContext("2d");
    if (nmax>12) {nmax = 12;document.getElementById("formiter").value=nmax;}
    context.fillStyle = "#eee";
    sierp(-1,-0.732,0,1,1,-0.732,0,context);
}

function dragon(x1,y1,x2,y2,i,ctx){
    if ((i>=nmax)||(i>=18)){
        var xs = cwidth/(xmax-xmin);
        var ys = cheight/(ymax-ymin);
        var xa = (x1-xmin)*xs;
        var ya = (-y1+ymax)*ys;
        var xb = (x2-xmin)*xs;
        var yb = (-y2+ymax)*ys;
        ctx.lineJoin = "bevel";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xa,ya);
        ctx.lineTo(xb,yb);
        ctx.stroke();
    }else{
        var xs = x2-x1;
        var ys = y2-y1;
        var x = x1+xs/2;
        var y = y1+ys/2;
        i++;
        x = (x2-x1)/2 + (y2-y1)/2 + x1;
        y = (y2-y1)/2 - (x2-x1)/2 + y1;
        dragon(x1,y1,x,y,i,ctx);
        dragon(x2,y2,x,y,i,ctx);
    }
}
function heightway(){
    context = canvas.getContext("2d");
    if (nmax>18) {nmax = 18;document.getElementById("formiter").value=nmax;}
    context.strokeStyle = "red";
    dragon(-1,0,1,0,0,context);
    context.strokeStyle = "green";
    dragon(1,0,-1,0,0,context);
    context.strokeStyle = "blue";
    dragon(1,0,3,0,0,context);
    context.strokeStyle = "purple";
    dragon(3,0,1,0,0,context);
}

function rotate(M, O, angle) {
    var xM, yM, x, y;
    angle *= Math.PI / 180;
    xM = M.x - O.x;
    yM = M.y - O.y;
    xM *= .67;yM *= .67;
    x = xM * Math.cos (angle) + yM * Math.sin (angle) + O.x;
    y = - xM * Math.sin (angle) + yM * Math.cos (angle) + O.y;
    return ({x:Math.round (x), y:Math.round (y)});
}

function tree() {
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = "brown";
    ctx.lineJoin = "bevel";
    ctx.lineWidth = 2;
    ctx.beginPath();
    let x1 = 0, y1 = -1, x2 = 0, y2 = -.3;
    let xs = cwidth/(xmax-xmin);
    let ys = cheight/(ymax-ymin);
    let xa = (x1-xmin)*xs;
    let ya = (-y1+ymax)*ys;
    let xb = (x2-xmin)*xs;
    let yb = (-y2+ymax)*ys;
    branch(xa, ya, xb, yb, 0, ctx);
}

function branch(x0, y0, x1, y1, i, ctx) {
    if ((i++>nmax) || (i>20)) return;
    if (i>5) ctx.strokeStyle = "Green";
    else ctx.strokeStyle = "SaddleBrown";
    ctx.beginPath();
    ctx.moveTo(x0,y0);
    ctx.lineTo(x1,y1);
    ctx.lineWidth = 9-i;
    ctx.stroke();
    let b1 = rotate({x:x0, y:y0}, {x:x1, y:y1}, -150)
    let b2 = rotate({x:x0, y:y0}, {x:x1, y:y1}, 130)
    branch(x1, y1, b1.x, b1.y, i, ctx);
    branch(x1, y1, b2.x, b2.y, i, ctx);
}

function draw(){
    cwidth = canvas.width = canvas.offsetWidth;
    cheight = canvas.height = canvas.offsetHeight;
    let ctx = canvas.getContext("2d");
    d0 = performance.now();
    window.requestAnimationFrame(fractale)
    fractale();
    d1 = performance.now();
    let d = (d1-d0)/1000; // durée d'execution en secondes
    document.getElementById("disp").innerHTML = "temps de calcul :<br>"+d.toFixed(5)+" sec";
}

function selectFract(f) {
    frct = parseInt(f);
    let iter = document.getElementById("formiter");
    switch(frct){
        case 1: // mandelbrot
        default:
        case 2: // julia 1
        case 3: // julia 2
        case 4: // julia 3
            iter.min = 100;
            iter.max = 10000;
            iter.step = 100;
            iter.value = 1000;
            break;
        case 11: // mandelbrot gpu
        case 12: // julia GPU
            iter.min = 1000;
            iter.max = 10000;
            iter.step = 1000;
            iter.value = 1000;
            break;
        case 10: // Collatz
            iter.min = 10;
            iter.max = 1000;
            iter.step = 10;
            iter.value = 100;
            break;
        case 20: // Collatz
            iter.min = 10;
            iter.max = 10000;
            iter.step = 10;
            iter.value = 10000;
            break;
        case 5: // Koch 1
            iter.min = 0;
            iter.max = 9;
            iter.step = 1;
            iter.value = 4;
            break;
        case 6: // koch 2
            iter.min = 0;
            iter.max = 5;
            iter.step = 1;
            iter.value = 3;
            break;
        case 7: // sierpinski
            iter.min = 0;
            iter.max = 12;
            iter.step = 1;
            iter.value = 5;
            break;
        case 8: // heighway
            iter.min = 0;
            iter.max = 18;
            iter.step = 1;
            iter.value = 15;
            break;
        case 9: // tree
            iter.min = 0;
            iter.max = 18;
            iter.step = 1;
            iter.value = 14;
            break;
    }
    nmax = parseInt(iter.value);
    document.getElementById("formiter2").value = iter.value;
    draw();
}
function fractale(){
    document.getElementById("juliacri").style="display:none;";
    switch(frct){
        case 1:
        default:
            mandelbrot();
            break;
        case 11:
            mandelGPU();
            break;
        case 10:
            collatz();
            break;
        case 20:
            collatzGPU();
            break;
        case 2:
            julia(1);
            break;
        case 12:
            document.getElementById("juliacri").style="display:block;";
            julGPU(cr,ci);
            break;
        case 3:
            julia(2);
            break;
        case 4:
            julia(3);
            break;
        case 5:
            vankoch();
            break;
        case 6:
            vankoch2();
            break;
        case 7:
            sierpinski();
            break;
        case 8:
            heightway();
            break;
        case 9:
            tree();
            break;
    }
}

var showParam = true;

function toggleParam() {
    if (showParam) document.getElementById("param").style.right="-250px";
    else document.getElementById("param").style.right="0px";
    showParam = !showParam;
}

function reinit(){
    xmin = -2;document.getElementById("formxmin").value=xmin;
    xmax = 1;document.getElementById("formxmax").value=xmax;
    ymin = -1.2;document.getElementById("formymin").value=ymin;
    ymax = 1.2;document.getElementById("formymax").value=ymax;
    draw();
}
function ratio(){
    var dx = xmax-xmin;
    var dy = dx*cheight/cwidth;
    var y0 = (ymin+ymax)/2;
    ymin = y0-(dy/2);document.getElementById("formymin").value=ymin;
    ymax = y0+(dy/2);document.getElementById("formymax").value=ymax;
    draw();
}

function handle(delta) {
    if (delta > 0){
        setZoom(.5);
    }else{
        setZoom(2);
    }
    draw();
}
function setZoom(f) {
    var dx = xmax-xmin;
    var dy = ymax-ymin;
    var xs = (xmax-xmin)/cwidth;
    var ys = (ymax-ymin)/cheight;
    var x = parseInt(m_x);
    var y = parseInt(m_y);
    console.log(x+" "+y);
    var cx = xmin + x*xs;
    var cy = ymax - y*ys;
    dx/=f;
    dy/=f;
    xmin = cx - dx/2;document.getElementById("formxmin").value=xmin;
    xmax = cx + dx/2;document.getElementById("formxmax").value=xmax;
    ymin = cy - dy/2;document.getElementById("formymin").value=ymin;
    ymax = cy + dy/2;document.getElementById("formymax").value=ymax;
}

function wheel(e){
    e.preventDefault();
    if (e.deltaY != 0) {
        m_x = e.pageX || e.targetTouches[0].pageX;
        m_y = e.pageY || e.targetTouches[0].pageY;    
        handle(e.deltaY);
    }
    return;
}

var context;
var img;
var mov=false;

var m_x = 0;
var m_y = 0;
var m_x0 = 0;
var m_y0 = 0;

var deltaZoom0 = 0; // distance des 2 doigts en pixels
var deltaZoom1 = 1; // % de rapprochement des doigts
function deltaZoom(e) {
    return Math.hypot(e.targetTouches[1].pageX-e.targetTouches[0].pageX, e.targetTouches[1].pageY-e.targetTouches[0].pageY)
}
var nbTouch=0;
function begin(e){
    nbTouch = 1;
    m_x = m_x0 = e.pageX || e.targetTouches[0].pageX;
    m_y = m_y0 = e.pageY || e.targetTouches[0].pageY;
    context = canvas.getContext("2d");
    img = context.getImageData(0, 0, cwidth, cheight);
    mov=true;
    if (e.targetTouches && e.targetTouches.length === 2) {
        deltaZoom0 = deltaZoom(e);
        deltaZoom1 = 1;
        nbTouch = 2;
    }
}

function move(e){
    e.preventDefault();
    if (!mov) return;
    var xs=(xmax-xmin)/cwidth;
    var ys=(ymax-ymin)/cheight;
    m_x = e.pageX || e.targetTouches[0].pageX;
    m_y = e.pageY || e.targetTouches[0].pageY;
    var mx=m_x-m_x0;
    var my=m_y-m_y0;
    var cx=- mx*xs;
    var cy=my*ys;
    document.getElementById("formxmin").value=xmin+cx;
    document.getElementById("formxmax").value=xmax+cx;
    document.getElementById("formymin").value=ymin+cy;
    document.getElementById("formymax").value=ymax+cy;
    context.clearRect(0,0,cwidth,cheight);
    context.putImageData(img,mx,my);
    if (e.targetTouches && e.targetTouches.length === 2) {
        deltaZoom1 = deltaZoom(e)/deltaZoom0;
        context.drawImage(canvas,0,0,cwidth,cheight,mx,my,cwidth*deltaZoom1,cheight*deltaZoom1);
    }
}
function end(){
    if (nbTouch === 0) return;
    if (nbTouch === 2) nbTouch = 0;
    mov=false;
    var xs = (xmax-xmin)/cwidth;
    var ys = (ymax-ymin)/cheight;
    var mx = m_x-m_x0;
    var my = m_y-m_y0;
    var cx = - mx*xs;
    var cy = my*ys;
    if (deltaZoom1 != 1) {
        m_x = cwidth/2+mx;
        m_y = cheight/2+my;
        setZoom(deltaZoom1);
    }
    // canvas.style.transform = "scale(1)";
    deltaZoom1 = 1;
    xmin+=cx;document.getElementById("formxmin").value=xmin;
    xmax+=cx;document.getElementById("formxmax").value=xmax;
    ymin+=cy;document.getElementById("formymin").value=ymin;
    ymax+=cy;document.getElementById("formymax").value=ymax;
    draw();
}

window.onresize = ratio;
canvas.addEventListener('wheel', wheel);

canvas.addEventListener('mousedown', begin);
canvas.addEventListener('mousemove', move);
canvas.addEventListener('mouseup', end);

canvas.addEventListener('touchstart', begin);
canvas.addEventListener('touchmove', move);
canvas.addEventListener('touchend', end);

ratio();
