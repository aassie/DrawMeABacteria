var fcheck = 0;
var sketchWidth;
var sketchHeight;
var buttonbox;
var bbtop;
var bbright
var bbbottom
var bbleft
let gui;
let button;

let controlpanel= function(cont){
  cont.setup = function(){
    controlWidth = document.getElementById("Control").offsetWidth;
    controlHeight = document.getElementById("Control").offsetHeight;
    cont.createCanvas(controlWidth, controlHeight);
    cont.background(255,255,255,0);
    button = cont.createButton('redraw');
    button.mousePressed(bacteria);
    savebutton = cont.createButton('save');
    checkbox = cont.createCheckbox('Flagella',  false);
    checkbox.changed(cont.flagellabox)
  }

  cont.flagellabox = function(){
    if (this.checked()) {
        console.log('Checking!');
      } else {
        console.log('Unchecking!');
      }
  }
}
new p5(controlpanel, 'Control');


sketch=function(p) {
  p.setup = function(){
  sketchWidth = document.getElementById("Bacteria").offsetWidth;
  sketchHeight = document.getElementById("Bacteria").offsetHeight;
  p.createCanvas(sketchWidth, sketchHeight);
  }

  p.draw = function(){
    p.translate(sketchWidth/2, sketchHeight/2);
    bacteria()
    p.noLoop()
  }

  bacteria = function(){
    p.clear()
    p.background(255,255,255,0);
    p.rotate(p.random(-p.PI/10,p.PI/10))
    //noLoop();
    const w = sketchWidth * 0.3;
    const r = sketchHeight/p.random(1.5,4) * 0.25;
    const b = r/2+p.random(-10,20);
    const c = r/3
    const cb = c + b
    const h = (cb + cb*p.random(0.8,2));
    const h1 = (h-0.02)+p.random(-10,20);
    const h2 = (h-0.05)+p.random(-10,20);
    const h3 = (h-0.15)+p.random(-10,20);
    const h4 = (h-0.05)+p.random(-10,20);
    const h5 = (h-0.15)+p.random(-10,20);
    const cf1 = p.random(100,255)
    const cf2 = p.random(100,200)
    const cf3 = p.random(0,255)


    p.beginShape();
     p.fill(cf1-40, cf2-40, cf3)
     p.noStroke();
     p.vertex(0, -h)
     p.bezierVertex(-(b*3), -h5, (b*3), -h4, 15, -(cb+(b*0.9)));
     p.vertex(-15, -(cb+(b*0.9)))
     p.bezierVertex((b*3), -h4,-(b*3), -h5, 0, -h);
    p.endShape();

    p.beginShape();
     p.fill(cf1-40, cf2-40, cf3)
     p.noStroke();
     p.vertex(0, h)
     p.bezierVertex((b*3), h2, -(b*3), h3, -15, (cb+(b*0.9)));
     p.vertex(15, (cb+(b*0.9)))
     p.bezierVertex(-(b*3), h3,(b*3), h2, 0, h);
    p.endShape();

    p.noStroke();
    p.fill(cf1, cf2, cf3);

    p.beginShape();
      p.vertex(b,cb)
      p.vertex(b,-cb)
      p.quadraticVertex(b,-(cb+b),0,-(cb+b))
      p.quadraticVertex(-b,-(cb+b),-b,-cb)
      p.vertex(-b,-cb)
      p.vertex(-b,cb)
      p.quadraticVertex(-b,(cb+b),0,(cb+b))
      p.quadraticVertex(b,(cb+b),b,cb)
    p.endShape();


    for(let j=0; j < p.random(5,25); j++){
      p.noStroke()
      const partsize=p.random(5,15)
      p.fill(cf1-60, cf2-30, cf3-50)
      p.ellipse(p.random(-(b-(b/8)),b-(b/8)),p.random(-((cb+b)-(cb/6)),(cb+b)-(cb/6)),partsize,partsize)
    }

      p.stroke(cf1-40, cf2-40, cf3);
    p.strokeWeight(8);
    p.noFill();

    p.beginShape();
      p.vertex(b,cb)
      p.vertex(b,-cb)
      p.quadraticVertex(b,-(cb+b),0,-(cb+b))
      p.quadraticVertex(-b,-(cb+b),-b,-cb)
      p.vertex(-b,-cb)
      p.vertex(-b,cb)
      p.quadraticVertex(-b,(cb+b),0,(cb+b))
      p.quadraticVertex(b,(cb+b),b,cb)
    p.endShape();

    const t = p.random(-8,8)
    const t2 = p.random(-5,5)
    const t3 = p.random(-10,10)
    const t4 = p.random(-10,10)

    p.noStroke();
    p.fill(255,255,255,255);
    p.ellipse(0, 0, 80+t3, 50+t4);
    p.noStroke();
    p.fill((cf1+ 180) % 360, cf2, cf3);
    p.ellipse(t+0, t+0, 40+t3, 40+t4);
    p.fill(10);
    p.ellipse(t+0, t+0, 20+t3, 20+t4);
    p.fill(255,255,255);
    p.ellipse(t2, -(t2), 10, 10);

  }
}
new p5(sketch, 'Bacteria');
