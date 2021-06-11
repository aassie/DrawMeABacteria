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
neyes=2;

let controlpanel= function(cont){
  cont.setup = function(){
    controlWidth = document.getElementById("Control").offsetWidth;
    controlHeight = document.getElementById("Control").offsetHeight;
    cont.createCanvas(controlWidth, controlHeight);
    cont.background(255,255,255,0);

    button = cont.createButton('redraw');
    button.mousePressed(drawB);

    savebutton = cont.createButton('save');
    savebutton.mousePressed(savePic);

    checkbox = cont.createCheckbox('Flagella',  false);
    checkbox.changed(cont.flagellabox)

    cont.textSize(18);
    cont.text("Eye(s)",10,10)

    eyesel = cont.createSelect();
    eyesel.option('1');
    eyesel.option('2');
    eyesel.selected('2');
    eyesel.changed(cont.eyeSelevent);

    bLslider = cont.createSlider(20, 100,50);
    bLslider.style('width', '80px');
  }
  cont.draw=function(){
    BLmodule = (bLslider.value()/100)
    cont.print(BLmodule)
    cont.noLoop()
  }

  cont.eyeSelevent = function(){
    neyes = eyesel.value();
  }

  cont.flagellabox = function(){
    if (this.checked()) {
        console.log('Checking!');
        fcheck=1
      } else {
        console.log('Unchecking!');
        fcheck=0
      }
  }
}
new p5(controlpanel, 'Control');


sketch=function(p) {
  p.setup = function(){
  sketchWidth = document.getElementById("Bacteria").offsetWidth;
  sketchHeight = document.getElementById("Bacteria").offsetHeight;
  c=p.createCanvas(sketchWidth, sketchHeight);
  constants(neyes)
  }

  p.draw = function(){
    p.clear()
    p.translate(sketchWidth/2, sketchHeight/2);
    p.rotate(rotation);
    flagella(fcheck)
    bacteria()
    eyes(neyes)
  }

  drawB = function(){
    p.clear()
    constants(neyes)
    flagella(fcheck)
    bacteria()
    eyes(neyes)
  }

  constants=function(eye){
    //colors
    cf1 = p.random(100,255)
    cf2 = p.random(100,200)
    cf3 = p.random(0,255)

    //general
    rotation=p.random(-p.PI/10,p.PI/10)
    p.print("Pivot")

    r = sketchHeight* 0.25;
    b = sketchHeight* 0.05;

    BWmodule = p.random(0.2,1)
    BWfinal = BWmodule*r
    BLmodule = p.random(0,1)
    BLfinal = BLmodule*r
    //flagella
    h = p.random((BLfinal+b)*1.2,controlHeight/3);
    h1 = (h*p.random(0.6,0.8));
    h2 = (h*p.random(0.8,0.9));
    h3 = (h2*p.random(1.1,1.2));
    h4 = (h*p.random(0.8,0.9));
    h5 = (h4*p.random(1.1,1.2));
    //eye
      if (eye == 1) {
        t2 = p.random(-5,5)
        tl = p.random(0.6,1.5)
        t3 = p.random(BWfinal*0.55,(BWfinal)*0.65)
        t3b = t3*tl
        t4 = p.random(t3*0.5,t3*0.8)
        t4b = t4*tl
        t5 = p.random(t4*0.5,t4*0.8)
        t5b= t5*tl*p.random(0.6,1.5)
        t = p.random(-t3/4,t3/4)
      }else {
        t2 = p.random(-5,5)
        tl = p.random(0.6,1.5)
        t3 = p.random(BWfinal*0.55,(BWfinal)*0.65)
        t3b = t3*tl
        t4 = p.random(t3*0.5,t3*0.8)
        t4b = t4*tl
        t5 = p.random(t4*0.5,t4*0.8)
        t5b= t5*tl*p.random(0.6,1.5)
        t = p.random(-t3/4,t3/4)
        }
      //Background decorations

      bdCall = backgroundDecoration()
  }

  bacteria=function() {
    //background
    p.noStroke();
    p.fill(cf1, cf2, cf3);
    p.beginShape();
    p.noStroke()
    p.vertex(BWfinal,BLfinal)
    p.vertex(BWfinal,-BLfinal)
    p.quadraticVertex(BWfinal,-(BLfinal+b),0,-(BLfinal+b))
    p.quadraticVertex(-BWfinal,-(BLfinal+b),-BWfinal,-BLfinal)
    p.vertex(-BWfinal,-BLfinal)
    p.vertex(-BWfinal,BLfinal)
    p.quadraticVertex(-BWfinal,(BLfinal+b),0,(BLfinal+b))
    p.quadraticVertex(BWfinal,(BLfinal+b),BWfinal,BLfinal)
    p.endShape();

    //Background decoration
    bdCall

    //Border
    p.beginShape();
        p.stroke(cf1-40, cf2-40, cf3);
        p.strokeWeight(8);
        p.noFill()
        p.vertex(BWfinal,BLfinal)
        p.vertex(BWfinal,-BLfinal)
        p.quadraticVertex(BWfinal,-(BLfinal+b),0,-(BLfinal+b))
        p.quadraticVertex(-BWfinal,-(BLfinal+b),-BWfinal,-BLfinal)
        p.vertex(-BWfinal,-BLfinal)
        p.vertex(-BWfinal,BLfinal)
        p.quadraticVertex(-BWfinal,(BLfinal+b),0,(BLfinal+b))
        p.quadraticVertex(BWfinal,(BLfinal+b),BWfinal,BLfinal)
    p.endShape();
  }

  backgroundDecoration=function(){
    for(let j=0; j < p.random(5,25); j++){
      p.print("Blob")
        p.noStroke()
        const partsize=p.random(5,15)
        p.fill(cf1-60, cf2-30, cf3-50)
        p.ellipse(p.random(-(BWfinal*0.9),BWfinal*0.9),p.random(-((BLfinal+b)*0.8),(BLfinal+b)*0.8),partsize,partsize)
      }
  }

  flagella=function(f){
      if (f == 1) {
        //top flagella
        p.beginShape();
        p.fill(cf1-40, cf2-40, cf3)
        p.noStroke();
        p.vertex(0, -h)
        p.bezierVertex(-(b*3), -h5, (b*3), -h4, 15, -(BLfinal+(b*0.9)));
        p.vertex(-15, -(BLfinal+(b*0.9)))
        p.bezierVertex((b*3), -h4,-(b*3), -h5, 0, -h);
        p.endShape();
        //bottom flagella
        p.beginShape();
        p.fill(cf1-40, cf2-40, cf3)
        p.noStroke();
        p.vertex(0, h)
        p.bezierVertex((b*3), h2, -(b*3), h3, -15, (BLfinal+(b*0.9)));
        p.vertex(15, (BLfinal+(b*0.9)))
        p.bezierVertex(-(b*3), h3,(b*3), h2, 0, h);
        p.endShape();
      }
  }

  eyes=function(n){
    if (n == 1) {
    //cyclope
      p.noStroke();
      p.fill(255,255,255,255);
      p.ellipse(0, 0, t3, t3b);
      p.fill((cf1+ 180) % 360, cf2, cf3);
      p.ellipse(t, t, t4, t4b);
      p.fill(10);
      p.ellipse(t, t, t5, t5b);
      p.fill(255,255,255);
      p.ellipse(t2, -(t2), 10, 10)
  } else {
    //left eye
      p.noStroke();
      p.fill(255,255,255,255);
      p.ellipse(-BWfinal/3, 0, t3, t3b);
      p.fill((cf1+ 180) % 360, cf2, cf3);
      p.ellipse(-BWfinal/3+t, t, t4, t4b);
      p.fill(10);
      p.ellipse(-BWfinal/3+t, t, t5, t5b);
      p.fill(255,255,255);
      p.ellipse(-BWfinal/3+t2, -(t2), 10, 10);
    //right eye
      p.noStroke();
      p.fill(255,255,255,255);
      p.ellipse(BWfinal/3, 0, t3, t3b);
      p.fill((cf1+ 180) % 360, cf2, cf3);
      p.ellipse(BWfinal/3+t, t, t4, t4b);
      p.fill(10);
      p.ellipse(BWfinal/3+t, t, t5, t5b);
      p.fill(255,255,255);
      p.ellipse(BWfinal/3+t2, -(t2), 10, 10);
    }
  }
  savePic = function(){
    p.saveCanvas(c, 'Bacteria', 'png');
  }
}

new p5(sketch, 'Bacteria');
