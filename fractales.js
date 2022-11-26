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

var t0,t1;

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
gpu.addFunction(coord);
gpu.addFunction(mod_cc);
gpu.addFunction(mod2_cc);
gpu.addFunction(add_cc);
gpu.addFunction(sub_cc);
gpu.addFunction(mul_cc);
gpu.addFunction(div_cc);

function mandelbrot(){
    let context,img,r,v,b,a=255;
    context = canvas.getContext("2d");
    let xs = (xmax-xmin)/cwidth;
    let ys = (ymax-ymin)/cheight;
    img = context.createImageData(cwidth,cheight);
    for (let y=0,j=0;y<cheight;y++){
        let cy = ymax - y*ys;
        for (let x=0;x<cwidth;x++){
            let cx = xmin + x*xs;
            let x1 = cx;
            let y1 = cy;
            let xx = x1**2;
            let yy = y1**2;
            let i = 0;
            for(;i<nmax && xx+yy<=l;i++){
                xx = x1**2;
                yy = y1**2;
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

var mandelbrotGPU = gpu.createKernel(function(xmin,xmax,ymin,ymax,nmax,cwidth,cheight) {
    let x = [0,0];
    x = coord([this.thread.x, this.thread.y], [xmin, xmax, ymin, ymax], [cwidth, cheight]);
    let cx = x[0];
    let cy = x[1];
    let x1 = cx;
    let y1 = cy;
    let xx = x1**2;
    let yy = y1**2;
    let i = 0;
    for(;i<nmax && xx+yy<=4;i++){
                xx = x1**2;
                yy = y1**2;
                y1 = 2*x1*y1+cy;
                x1 = xx-yy+cx;
            }
    if (i !== nmax){
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

function burnShip(){
    let context,img,r,v,b,a=255;
    context = canvas.getContext("2d");
    let xs = (xmax-xmin)/cwidth;
    let ys = (ymax-ymin)/cheight;
    img = context.createImageData(cwidth,cheight);
    for (let y=0,j=0;y<cheight;y++){
        let cy = y*ys - ymax; // invert y axis to see the ship
        for (let x=0;x<cwidth;x++){
            let cx = xmin + x*xs;
            let x1 = cx;
            let y1 = cy;
            for(let i=0;i<nmax;i++){
                let xx = x1**2;
                let yy = y1**2;
                if (xx+yy>l){break;}
                y1 = Math.abs(2*x1*y1)+cy;
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

var burningShipGPU = gpu.createKernel(function(xmin,xmax,ymin,ymax,nmax,cwidth,cheight) {
    let x = [0,0];
    x = coord([this.thread.x, this.thread.y], [xmin, xmax, ymin, ymax], [cwidth, cheight]);
    let cx = x[0];
    let cy = -x[1];
    let x1 = cx;
    let y1 = cy;
    let out = false;
    let i = 0;
    for(;i<nmax;i++){
                let xx = x1**2;
                let yy = y1**2;
                if (xx+yy>4){out=true;break;}
                y1 = Math.abs(2*x1*y1)+cy;
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

function julia(n){
    let context,img,r,v,b,a=255;
    context = canvas.getContext("2d");
    img = context.createImageData(cwidth,cheight);
    let xs = (xmax-xmin)/cwidth;
    let ys = (ymax-ymin)/cheight;
    for (let y=0,j=0;y<cheight;y++){
        let cy = ymax - y*ys;
        for (let x=0;x<cwidth;x++){
            let cr,ci;
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
            let cx = xmin + x*xs;
            let x1 = cx;
            let y1 = cy;
            let i=0
            for(;i<nmax;i++){
                let xx = x1**2;
                let yy = y1**2;
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

function collatz() {
    let context,img,r,v,b,a=255;
    context = canvas.getContext("2d");
    let xs = (xmax-xmin)/cwidth;
    let ys = (ymax-ymin)/cheight;
    img = context.createImageData(cwidth,cheight);
    for (let y=0,j=0;y<cheight;y++){
        let cy = ymax - y*ys;
        for (let x=0;x<cwidth;x++){
            let cx = xmin + x*xs;
            let x1 = cx;
            let y1 = cy;
            let i=0
            let norm = 0;
            for(;i<nmax && norm<10000;i++){
                let cosr = Math.cos(Math.PI*x1)*Math.cosh(Math.PI*y1);
                let cosi = Math.sin(Math.PI*x1)*Math.sinh(Math.PI*y1);
                let re = (2-(2+5*x1)*cosr+7*x1-5*y1*cosi)/4;
                let im = ((2+5*x1)*cosi+7*y1-5*y1*cosr)/4;
                // let re = (1-(1+2*x1)*cosr+4*x1-2*y1*cosi)/4;
                // let im = ((1+2*x1)*cosi+4*y1-2*y1*cosr)/4;
                x1 = re;
                y1 = im;
                norm = re*re+im*im;
                // if (){break;}
            }
            if (i === nmax){
                r=v=b=0;
            } else {
                b=i*60;
                v=(i-4)*80;
                r=(i-4)*10;
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
    let i = 0;
    let norm=0;
    for(;i<nmax && norm<10000;i++){
        let cosr = Math.cos(Math.PI*x1)*Math.cosh(Math.PI*y1);
        let cosi = Math.sin(Math.PI*x1)*Math.sinh(Math.PI*y1);
        let re = (2-(2+5*x1)*cosr+7*x1-5*y1*cosi)/4;
        let im = ((2+5*x1)*cosi+7*y1-5*y1*cosr)/4;
        x1 = re;
        y1 = im;
        norm = re*re+im*im;
    }
    if (i === nmax){
        this.color(0, 0, 0);
    } else {
        let b=.234*i;
        let v=.313*(i-4);
        let r=.039*(i-4);
        this.color(r, v, b);        
    }
})
//   .setPrecision('single')
//   .setTactic('precision')
//   .setFixIntegerDivisionAccuracy(true)
  .setLoopMaxIterations(10000)
  .setOutput([cwidth, cheight])
  .setGraphical(true);

var coll2GPU = gpu.createKernel(function(xmin,xmax,ymin,ymax,nmax,cwidth,cheight) {
    let x = [0,0];
    x = coord([this.thread.x, this.thread.y], [xmin, xmax, ymin, ymax], [cwidth, cheight]);
    let cx = x[0];
    let cy = x[1];
    let x1 = cx;
    let y1 = cy;
    let i = 0;
    let norm=0;
    for(;i<nmax && norm<10000;i++){
        let cosr = Math.cos(Math.PI*x1)*Math.cosh(Math.PI*y1);
        let cosi = Math.sin(Math.PI*x1)*Math.sinh(Math.PI*y1);
        let re = (1-(1+2*x1)*cosr+4*x1-2*y1*cosi)/4;
        let im = ((1+2*x1)*cosi+4*y1-2*y1*cosr)/4;
        x1 = re;
        y1 = im;
        norm = re*re+im*im;
    }
    if (i === nmax){
        this.color(0, 0, 0);
    } else {
        let b=.234*i;
        let v=.313*(i-4);
        let r=.039*(i-4);
        this.color(r, v, b);        
    }
})
//   .setPrecision('single')
//   .setTactic('precision')
//   .setFixIntegerDivisionAccuracy(true)
  .setLoopMaxIterations(10000)
  .setOutput([cwidth, cheight])
  .setGraphical(true);


function add_c(a, b) {
    return {r: a.r+b.r, i: a.i+b.i};
}
function sub_c(a, b) {
    return {r: a.r-b.r, i: a.i-b.i};
}
function mul_c(a, b) {
    return {r:a.r*b.r-a.i*b.i, i:a.r*b.i+a.i*b.r};
}
function div_c(a, b) {
    let mod2 = mod2_c(b);
    if (mod2 === 0) // division par zéro
        return {r:0, i:0};
    return {r:(a.r*b.r+a.i*b.i)/mod2, i:(a.i*b.r-a.r*b.i)/mod2};
}
function mod_c(a){
    return Math.sqrt(a.r*a.r+a.i*a.i);
}
function mod2_c(a){
    return a.r*a.r+a.i*a.i;
}
function newton () {
    let context,img,r,v,b,a=255;
    context = canvas.getContext("2d");
    let xs = (xmax-xmin)/cwidth;
    let ys = (ymax-ymin)/cheight;
    let p1 = {r: 1,   i: 0}, // les 3 racines
        p2 = {r: -.5, i: Math.sqrt(3)/2},
        p3 = {r:-.5,  i: -Math.sqrt(3)/2};
        let threshold = .001;
    img = context.createImageData(cwidth,cheight);
    for (let y=0,j=0;y<cheight;y++){
        let cy = ymax - y*ys;
        for (let x=0;x<cwidth;x++){
            let cx = xmin + x*xs;
            let z = {r:cx, i:cy};
            let d1 = mod_c(p1);
            let d2 = mod_c(p2);
            let d3 = mod_c(p3);
            let dmin = Math.min(Math.min(d1,d2),d3);
            // nmax = 100;
            let i=0;
            for(;i<nmax && dmin>threshold;i++){
                let num = mul_c(mul_c(sub_c(z, p1),sub_c(z, p2)), sub_c(z, p3));
                let den = add_c(add_c(mul_c(sub_c(z, p2), sub_c(z, p3)), mul_c(sub_c(z, p1), sub_c(z, p3))), mul_c(sub_c(z, p1), sub_c(z, p2)));
                z = sub_c(z, div_c(num, den));
                d1 = mod_c(sub_c(z, p1));
                d2 = mod_c(sub_c(z, p2));
                d3 = mod_c(sub_c(z, p3));
                dmin = Math.min(Math.min(d1,d2),d3);
            }
            let coul = 153 + 102*Math.cos(.25* (i - Math.log2(Math.log(dmin) / Math.log(threshold))));
            // let coul = 153 + 102*Math.cos(.25*i);
            // let coul = 153 + 10*i;
            if (i === nmax){
                r=v=b=0;
            } else if (d1<d2 && d1<d3) { // on converge vers d1
                r=coul;
                v=0;
                b=.3*coul;
            } else if (d2<d1 && d2<d3) { // on converge vers d2
                r=0;
                v=coul;
                b=.3*coul;
            } else { // on converge vers d3
                r=0;
                v=.3*coul;
                b=coul;
            }
            img.data[j++] = r;
            img.data[j++] = v;
            img.data[j++] = b;
            img.data[j++] = a;
        }
    }
    context.putImageData(img, 0, 0);
}

function mod_cc(a){
    return Math.sqrt(a[0]*a[0]+a[1]*a[1]);
}
function mod2_cc(a){
    return a[0]*a[0]+a[1]*a[1];
}
function add_cc(a, b) {
    return [a[0]+b[0], a[1]+b[1]];
}
function sub_cc(a, b) {
    return [a[0]-b[0], a[1]-b[1]];
}
function mul_cc(a, b) {
    return [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]];
}
function div_cc(a, b) {
    let mod2 = mod2_cc(b);
    if (mod2 === 0) // division par zéro
        return [0, 0];
    return [(a[0]*b[0]+a[1]*b[1])/mod2, (a[1]*b[0]-a[0]*b[1])/mod2];
}
var newtonGPU = gpu.createKernel(function(xmin,xmax,ymin,ymax,nmax,cwidth,cheight) {
    let x = [0,0];
    x = coord([this.thread.x, this.thread.y], [xmin, xmax, ymin, ymax], [cwidth, cheight]);
    let z = [x[0], x[1]];
    let p1 = [1,   0], // les 3 racines
        p2 = [-.5, Math.sqrt(3)/2],
        p3 = [-.5, -Math.sqrt(3)/2];
    let threshold = .001;
    let d1 = mod_cc(p1);
    let d2 = mod_cc(p2);
    let d3 = mod_cc(p3);
    let dmin = Math.min(Math.min(d1,d2),d3)
    let i = 0;
    for(;i<nmax && dmin>threshold;i++){
        let num = mul_cc(mul_cc(sub_cc(z, p1),sub_cc(z, p2)), sub_cc(z, p3));
        let den = add_cc(add_cc(mul_cc(sub_cc(z, p2), sub_cc(z, p3)), mul_cc(sub_cc(z, p1), sub_cc(z, p3))), mul_cc(sub_cc(z, p1), sub_cc(z, p2)));
        z = sub_cc(z, div_cc(num, den));
        d1 = mod_cc(sub_cc(z, p1));
        d2 = mod_cc(sub_cc(z, p2));
        d3 = mod_cc(sub_cc(z, p3));
        dmin = Math.min(Math.min(d1,d2),d3);
    }
    let vc = .24*(Math.log2(Math.log(dmin) / Math.log(threshold)));
    let coul = .6 + .4*Math.cos(.25*i-vc);
    if (i===nmax){
        this.color(0, 1, 0);
    } else {
        let r=0, v=0, b=0;
        if (d1<d2 && d1<d3) { // on converge vers d1
            r=coul;
            b=.3*coul;
        } else if (d2<d1 && d2<d3) { // on converge vers d2
            v=coul;
            b=.3*coul;
        } else { // on converge vers d3
            v=.3*coul;
            b=coul;
        }
        this.color(r, v, b);
    }
})
//   .setPrecision('single')
//   .setTactic('precision')
.setLoopMaxIterations(10000)
.setOutput([cwidth, cheight])
.setGraphical(true);

var cosa = Math.cos(Math.PI/3);
var sina = Math.sin(Math.PI/3);
function koch(x1,y1,x2,y2,i,ctx){
    if ((i>=nmax)||(i>=9)){
        let xs = cwidth/(xmax-xmin);
        let ys = cheight/(ymax-ymin);
        let xa = (x1-xmin)*xs;
        let ya = (-y1+ymax)*ys;
        let xb = (x2-xmin)*xs;
        let yb = (-y2+ymax)*ys;
        ctx.lineJoin = "bevel";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xa,ya);
        ctx.lineTo(xb,yb);
        ctx.stroke();
    }else{
        let xa = x1+(x2-x1)/3;
        let ya = y1+(y2-y1)/3;
        let xc = x1+2*(x2-x1)/3;
        let yc = y1+2*(y2-y1)/3;
        let xb = cosa*(xc-xa) - sina*(yc-ya) + xa;
        let yb = sina*(xc-xa) + cosa*(yc-ya) + ya;
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
        let xs = cwidth/(xmax-xmin);
        let ys = cheight/(ymax-ymin);
        let xa = (x1-xmin)*xs;
        let ya = (-y1+ymax)*ys;
        let xb = (x2-xmin)*xs;
        let yb = (-y2+ymax)*ys;
        ctx.lineJoin = "bevel";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xa,ya);
        ctx.lineTo(xb,yb);
        ctx.stroke();
    }else{
        let xs = x2-x1;
        let ys = y2-y1;
        let xa = x1+xs/4;
        let ya = y1+ys/4;
        let xd = x1+2*xs/4;
        let yd = y1+2*ys/4;
        let xg = x1+3*xs/4;
        let yg = y1+3*ys/4;
        let xb = xa-(yd-ya);
        let yb = ya+(xd-xa);
        let xc = xd-(yg-yd);
        let yc = yd+(xg-xd);
        let xe = xd-(xc-xd);
        let ye = yd-(yc-yd);
        let xf = xg-(yd-yg); 
        let yf = yg+(xd-xg);
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
        let xs = cwidth/(xmax-xmin);
        let ys = cheight/(ymax-ymin);
        let xa = (x1-xmin)*xs;
        let ya = (-y1+ymax)*ys;
        let xb = (x2-xmin)*xs;
        let yb = (-y2+ymax)*ys;
        let xc = (x3-xmin)*xs;
        let yc = (-y3+ymax)*ys;
        ctx.lineJoin = "bevel";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xa,ya);
        ctx.lineTo(xb,yb);
        ctx.lineTo(xc,yc);
        ctx.closePath();
        ctx.fill();
    }else{
        let a = x1+(x3-x1)/4;
        let b = x1+2*(x3-x1)/4;
        let c = x1+3*(x3-x1)/4;
        let d = y1+(y2-y1)/2;
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
        let xs = cwidth/(xmax-xmin);
        let ys = cheight/(ymax-ymin);
        let xa = (x1-xmin)*xs;
        let ya = (-y1+ymax)*ys;
        let xb = (x2-xmin)*xs;
        let yb = (-y2+ymax)*ys;
        ctx.lineJoin = "bevel";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xa,ya);
        ctx.lineTo(xb,yb);
        ctx.stroke();
    }else{
        let xs = x2-x1;
        let ys = y2-y1;
        let x = x1+xs/2;
        let y = y1+ys/2;
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

function rotate(M, O, angle, h=.67) {
    let xM, yM, x, y;
    angle *= Math.PI / 180;
    xM = M.x - O.x;
    yM = M.y - O.y;
    xM *= h;yM *= h;
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

function fern() {
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
    leaf(xa, ya, xb, yb, 0, ctx);
}

function leaf(x0, y0, x1, y1, i, ctx) {
    if ((i++>nmax) || (i>11)) return;
    if (i>1) ctx.strokeStyle = "Green";
    else ctx.strokeStyle = "SaddleBrown";
    ctx.beginPath();
    ctx.moveTo(x0,y0);
    ctx.lineTo(x1,y1);
    ctx.lineWidth = 9-i;
    ctx.stroke();
    let b1 = rotate({x:x0, y:y0}, {x:x1, y:y1}, -118,.35)
    let b2 = rotate({x:x0, y:y0}, {x:x1, y:y1}, 108,.25)
    let b3 = rotate({x:x0, y:y0}, {x:x1, y:y1}, 175,.85)
    leaf(x1, y1, b1.x, b1.y, i, ctx);
    leaf(x1, y1, b2.x, b2.y, i, ctx);
    leaf(x1, y1, b3.x, b3.y, i, ctx);
}

function draw(){
    cwidth = canvas.width = canvas.offsetWidth;
    cheight = canvas.height = canvas.offsetHeight;
    t0 = performance.now();
    fractale();
    t1 = performance.now();
    let d = (t1-t0)/1000; // durée d'execution en secondes
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
        case 13: // burning ship
        case 16: // newton
            iter.min = 100;
            iter.max = 10000;
            iter.step = 100;
            iter.value = 1000;
            break;
        case 11: // mandelbrot GPU
        case 12: // julia GPU
        case 14: // burning ship GPU
        case 17: // newton GPU
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
        case 20: // Collatz GPU
        case 21: // Collatz 2 GPU
            iter.min = 10;
            iter.max = 1000;
            iter.step = 10;
            iter.value = 100;
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
        case 15: // fern
            iter.min = 0;
            iter.max = 12;
            iter.step = 1;
            iter.value = 10;
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
            mandelbrotGPU(xmin,xmax,ymin,ymax,nmax,cwidth,cheight);
            document.getElementById('canvas').getContext('2d').drawImage(gpu.canvas, 0, 0);
            break;
        case 10:
            collatz();
            break;
        case 20:
            collGPU(xmin,xmax,ymin,ymax,nmax,cwidth,cheight);
            document.getElementById('canvas').getContext('2d').drawImage(gpu.canvas, 0, 0);
            break;
        case 21:
            coll2GPU(xmin,xmax,ymin,ymax,nmax,cwidth,cheight);
            document.getElementById('canvas').getContext('2d').drawImage(gpu.canvas, 0, 0);
            break;
        case 13:
            burnShip();
            break;
        case 14:
            burningShipGPU(xmin,xmax,ymin,ymax,nmax,cwidth,cheight);
            document.getElementById('canvas').getContext('2d').drawImage(gpu.canvas, 0, 0);
            break;
        case 2:
            julia(1);
            break;
        case 16:
            newton();
            break;
        case 17:
            newtonGPU(xmin,xmax,ymin,ymax,nmax,cwidth,cheight);
            document.getElementById('canvas').getContext('2d').drawImage(gpu.canvas, 0, 0);
            break;
        case 12:
            document.getElementById("juliacri").style="display:block;";
            juliaGPU(xmin,xmax,ymin,ymax,nmax,cwidth,cheight,cr,ci);
            document.getElementById('canvas').getContext('2d').drawImage(gpu.canvas, 0, 0);
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
        case 15:
            fern();
            break;
    }
}

var showParam = true;

function toggleParam(a) {
    if (showParam) {
        document.getElementById("param").style.width="0px";
        document.getElementById("param").style.padding="0px";
        a.value="👈";
    } else {
        document.getElementById("param").style.width="230px";
        document.getElementById("param").style.padding="10px";
        a.value="👉";
    }
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
    let dx = xmax-xmin;
    let dy = dx*cheight/cwidth;
    let y0 = (ymin+ymax)/2;
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
    let dx = xmax-xmin;
    let dy = ymax-ymin;
    let xs = (xmax-xmin)/cwidth;
    let ys = (ymax-ymin)/cheight;
    let x = parseInt(m_x);
    let y = parseInt(m_y);
    let cx = xmin + x*xs;
    let cy = ymax - y*ys;
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
    let xs=(xmax-xmin)/cwidth;
    let ys=(ymax-ymin)/cheight;
    m_x = e.pageX || e.targetTouches[0].pageX;
    m_y = e.pageY || e.targetTouches[0].pageY;
    let mx=m_x-m_x0;
    let my=m_y-m_y0;
    let cx=- mx*xs;
    let cy=my*ys;
    document.getElementById("formxmin").value=xmin+cx;
    document.getElementById("formxmax").value=xmax+cx;
    document.getElementById("formymin").value=ymin+cy;
    document.getElementById("formymax").value=ymax+cy;
    context.clearRect(0,0,cwidth,cheight);
    if (nbTouch < 2) {
        context.putImageData(img,mx,my);
    } else if (e.targetTouches && e.targetTouches.length === 2) {
        context.putImageData(img,mx/deltaZoom1,my/deltaZoom1);
        deltaZoom1 = deltaZoom(e)/deltaZoom0;
        context.drawImage(canvas,0,0,cwidth,cheight,mx*deltaZoom1*0,my*deltaZoom1*0,cwidth*deltaZoom1,cheight*deltaZoom1);
    }
}
function end(){
    if (nbTouch === 0) return;
    if (nbTouch === 2) nbTouch = 0;
    mov=false;
    let xs = (xmax-xmin)/cwidth;
    let ys = (ymax-ymin)/cheight;
    let mx = m_x-m_x0;
    let my = m_y-m_y0;
    let cx = - mx*xs;
    let cy = my*ys;
    if (deltaZoom1 != 1) {
        m_x = cwidth/2-mx;
        m_y = cheight/2-my;
        setZoom(deltaZoom1);
        deltaZoom1 = 1;
    } else {
        xmin+=cx;document.getElementById("formxmin").value=xmin;
        xmax+=cx;document.getElementById("formxmax").value=xmax;
        ymin+=cy;document.getElementById("formymin").value=ymin;
        ymax+=cy;document.getElementById("formymax").value=ymax;    
    }
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
