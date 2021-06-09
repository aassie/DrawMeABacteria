var fcheck = 0;
var sketchWidth;
var sketchHeight;
var buttonbox;
var bbtop;
var bbright
var bbbottom
var bbleft

function setup(){
  sketchWidth = document.getElementById("canvasContainer").offsetWidth;
  sketchHeight = document.getElementById("canvasContainer").offsetHeight;
  buttonbox = document.getElementById("buttonContainer");
  function getCoords(buttonbox) {
  let box = elem.getBoundingClientRect();
    const bbtop = box.top + window.pageYOffset;
    const bbright = box.right + window.pageXOffset;
    const bbbottom = box.bottom + window.pageYOffset;
    const bbleft = box.left + window.pageXOffset;
}
    let c=createCanvas(sketchWidth, sketchHeight);
    c.parent('canvasContainer');
    translate(sketchWidth/2, sketchHeight/2);
    button = createButton('redraw');
      button.position(bbtop, bbtop);
      button.mousePressed(bacteria);
      button.parent('buttonContainer');
    savebutton = createButton('save');
      savebutton.position(75, 0);
      savebutton.mousePressed(savef);
      savebutton.parent('buttonContainer');
    checkbox = createCheckbox('Flagella', false);
    checkbox.changed(flagella);
    checkbox.position(bbtop + 1000, bbtop + 100);
    checkbox.parent('buttonContainer');
  }

function bacteria(){
    clear()
    background(255,255,255,0);
    rotate(random(-PI/10,PI/10))
    //noLoop();
    const w = sketchWidth * 0.3;
    const r = sketchHeight/random(1.5,4) * 0.25;
    const b = r/2+random(-10,20);
    const c = r/3
    const cb = c + b
    const h = (cb + cb*random(0.8,2));
    const h1 = (h-0.02)+random(-10,20);
    const h2 = (h-0.05)+random(-10,20);
    const h3 = (h-0.15)+random(-10,20);
    const h4 = (h-0.05)+random(-10,20);
    const h5 = (h-0.15)+random(-10,20);
    const cf1 = random(100,255)
    const cf2 = random(100,200)
    const cf3 = random(0,255)

    if ( fcheck == 1) {
    beginShape();
     fill(cf1-40, cf2-40, cf3)
     noStroke();
     vertex(0, -h)
     bezierVertex(-(b*3), -h5, (b*3), -h4, 15, -(cb+(b*0.9)));
     vertex(-15, -(cb+(b*0.9)))
     bezierVertex((b*3), -h4,-(b*3), -h5, 0, -h);
    endShape();

    beginShape();
     fill(cf1-40, cf2-40, cf3)
     noStroke();
     vertex(0, h)
     bezierVertex((b*3), h2, -(b*3), h3, -15, (cb+(b*0.9)));
     vertex(15, (cb+(b*0.9)))
     bezierVertex(-(b*3), h3,(b*3), h2, 0, h);
    endShape();
    }

    noStroke();
    fill(cf1, cf2, cf3);

    beginShape();
      vertex(b,cb)
      vertex(b,-cb)
      quadraticVertex(b,-(cb+b),0,-(cb+b))
      quadraticVertex(-b,-(cb+b),-b,-cb)
      vertex(-b,-cb)
      vertex(-b,cb)
      quadraticVertex(-b,(cb+b),0,(cb+b))
      quadraticVertex(b,(cb+b),b,cb)
    endShape();


    for(let j=0; j < random(5,25); j++){
      noStroke()
      const partsize=random(5,15)
      fill(cf1-60, cf2-30, cf3-50)
      ellipse(random(-(b-(b/8)),b-(b/8)),random(-((cb+b)-(cb/6)),(cb+b)-(cb/6)),partsize,partsize)
    }

      stroke(cf1-40, cf2-40, cf3);
    strokeWeight(8);
    noFill();

    beginShape();
      vertex(b,cb)
      vertex(b,-cb)
      quadraticVertex(b,-(cb+b),0,-(cb+b))
      quadraticVertex(-b,-(cb+b),-b,-cb)
      vertex(-b,-cb)
      vertex(-b,cb)
      quadraticVertex(-b,(cb+b),0,(cb+b))
      quadraticVertex(b,(cb+b),b,cb)
    endShape();

    const t = random(-8,8)
    const t2 = random(-5,5)
    const t3 = random(-10,10)
    const t4 = random(-10,10)

    noStroke();
    fill(255,255,255,255);
    ellipse(0, 0, 80+t3, 50+t4);
    noStroke();
    fill((cf1+ 180) % 360, cf2, cf3);
    ellipse(t+0, t+0, 40+t3, 40+t4);
    fill(10);
    ellipse(t+0, t+0, 20+t3, 20+t4);
    fill(255,255,255);
    ellipse(t2, -(t2), 10, 10);

  }




function flagella(){
  if (this.checked()) {
      fcheck = 1;
      console.log(fcheck);
    } else {
      fcheck = 0;
      console.log(fcheck);
    }
    return fcheck;
}

function savef(){
  saveCanvas('Bacteria','png')
}
