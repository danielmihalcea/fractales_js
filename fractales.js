"use strict";

const gpu = new GPU();
var canvas = document.getElementById("canvas");
var cwidth = canvas.width = canvas.offsetWidth;
var cheight = canvas.height = canvas.offsetHeight;

var xmin = -2;
var xmax = 1;
var ymin = -1.2;
var ymax = 1.2;

var nmax = 100;
var l = 4;
var frct = 1;

var d0,d1;

var coul=[];

function calCoul() {
    coul[0]=0;
    for (let i=1; i<nmax; i++){
        coul[i]=Math.floor(128*Math.log10(i));
    }
}
calCoul();

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
function julia(n){
    var context,img,r,v,b,a=255;
    context = canvas.getContext("2d");
    // document.canvas.width = cwidth;
    // document.canvas.height = cheight;
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
                var xx = x1*x1;
                var yy = y1*y1;
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
        // ctx.strokeStyle = '#fff'
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

function draw(){
    cwidth = canvas.width = canvas.offsetWidth;
    cheight = canvas.height = canvas.offsetHeight;
    // setTimeout("fractale()", 10);
    fractale();
}

function fractale(){
    document.getElementById("calc").style.display = "block";
    d0 = performance.now();
    switch(frct){
        case 1:
        default:
            mandelbrot();
            break;
        case 2:
            julia(1);
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
    }
    d1 = performance.now();
    let d = (d1-d0)/1000; // durée d'execution en secondes
    document.getElementById("disp").innerHTML = "temps de calcul :<br>"+d.toFixed(5)+" sec";
    document.getElementById("calc").style.display = "none";
}

function reinit(){
    cwidth = 1000;document.getElementById("formlarg").value=cwidth;
    cheight = 800;document.getElementById("formhaut").value=cheight;
    xmin = -2;document.getElementById("formxmin").value=xmin;
    xmax = 1;document.getElementById("formxmax").value=xmax;
    ymin = -1.2;document.getElementById("formymin").value=ymin;
    ymax = 1.2;document.getElementById("formymax").value=ymax;
    nmax = 100;document.getElementById("formiter").value=nmax;
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

var m_x = "0";
var m_y = "0";
var m_x0 = "0";
var m_y0 = "0";
function mousse_position (e) {
    m_x = e.pageX;
    m_y = e.pageY;
}

function handle(delta) {
    var dx = xmax-xmin;
    var dy = ymax-ymin;
    var xs = (xmax-xmin)/cwidth;
    var ys = (ymax-ymin)/cheight;
    var x = parseInt(m_x);
    var y = parseInt(m_y);
    var cx = xmin + x*xs;
    var cy = ymax - y*ys;
    
    if (delta < 0){
        dx*=2;
        dy*=2;
    }else{
        dx/=2;
        dy/=2;
    }
    xmin = cx - dx/2;document.getElementById("formxmin").value=xmin;
    xmax = cx + dx/2;document.getElementById("formxmax").value=xmax;
    ymin = cy - dy/2;document.getElementById("formymin").value=ymin;
    ymax = cy + dy/2;document.getElementById("formymax").value=ymax;
    draw();
}

function wheel(event){
    var delta = 0;
    if (!event)
            event = window.event;
    if (event.wheelDelta){
            delta = event.wheelDelta/120;
            if (window.opera)
                    delta = -delta;
    } else if (event.detail) {
            delta = -event.detail/3;
    }
    if (delta)
            handle(delta);
    if (event.preventDefault)
            event.preventDefault();
    event.returnValue = false;
}

var context;
var img;
var mov=false;
function begin(event){
    m_x0 = m_x;
    m_y0 = m_y;
    context = document.getElementById("canvas").getContext("2d");
    img = context.getImageData(0, 0, cwidth, cheight);
    mov=true;
}
function move(event){
    if (!mov) return;
    var xs=(xmax-xmin)/cwidth;
    var ys=(ymax-ymin)/cheight;
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
}
function end(event){
    mov=false;
    var xs = (xmax-xmin)/cwidth;
    var ys = (ymax-ymin)/cheight;
    var mx = m_x-m_x0;
    var my = m_y-m_y0;
    var cx = - mx*xs;
    var cy = my*ys;
    xmin+=cx;document.getElementById("formxmin").value=xmin;
    xmax+=cx;document.getElementById("formxmax").value=xmax;
    ymin+=cy;document.getElementById("formymin").value=ymin;
    ymax+=cy;document.getElementById("formymax").value=ymax;
    draw();
}

window.onresize = ratio;
window.onmousemove = mousse_position;
if (window.addEventListener)
    document.getElementById("canvas").addEventListener('DOMMouseScroll', wheel, false);
document.getElementById("canvas").onmousewheel = wheel;
document.getElementById("canvas").onmousedown = begin;
document.getElementById("canvas").onmousemove = move;
document.getElementById("canvas").onmouseup = end;
ratio();
