var stage, hero, queue, dogBone;
var menubg, playBtn, howBtn, muteBtn, how, mute=false;
var preloadText, preloadNum, loadingBar, loadingHeight=50, loadingWidth=300, loadingBarContainer;
var currentLevel=-1;
var keys = {
    right: false,
    left: false,
    space: false,
    up: false
};
var settings = {
    heroSpeed: 3,
    maxGravity: 5,
    resetJumpPower: 25,
    verticalSpeed: 2,
    borders:{
        left:150,
        right:600,
        top: 0,
        bottom: 260 //canvas.height-hero.height
    }
};
var heroSprite, boxSheet, enemySheet, branchSheet, helpSheet, enemyHelpSheet, doorSheet;
var boxArray=[], enemyArray=[], branchArray=[], helpArray=[],
enemyHelpArray=[], doorArray=[], bgArray=[];
var levelData, gameStarted=false;
var bg, bgBit, atm, coins;
var removedEnemies=0;
var bgMusic, ppc, introVideo, outroVideo, videoStopped=false;

function init() {
    stage = new createjs.Stage("gameCanvas");
    
    preloadText = new createjs.Text("Loading..", "40px Arial", "#000");
    preloadText.textBaseline="middle";
    preloadText.textAlign="center";
    preloadText.x = stage.canvas.width/2;
    preloadText.y = 290;
    stage.addChild(preloadText);
    
    loadingBarContainer = new createjs.Container();
    frame = new createjs.Shape();
    padding = 3;
    frame.graphics.setStrokeStyle(10).beginStroke("494949").drawRect(-padding/2, -padding/2, loadingWidth+padding, loadingHeight+padding);
    
    loadingBar = new createjs.Shape();
    loadingBar.graphics.beginFill("#42412c").drawRect(0, 0, 1, loadingHeight);
    
    loadingBarContainer.addChild(frame, loadingBar);
    loadingBarContainer.x = 350;
    loadingBarContainer.y = stage.canvas.height/2;
    stage.addChild(loadingBarContainer);
    
    preloadNum = new createjs.Text("Loading", "40px Arial", "#000");
    preloadNum.textBaseline="middle";
    preloadNum.textAlign="center";
    preloadNum.x = stage.canvas.width/2;
    preloadNum.y = 352;
    stage.addChild(preloadNum);
    
    queue = new createjs.LoadQueue(true);
    queue.installPlugin(createjs.Sound);
    queue.on("progress", progress);
    queue.on("complete", setupGame);
    
    queue.loadManifest([
        "img/bglevel1.png",
        "img/bglevel2.png",
        "img/bglevel3.png",
        "img/atm.png",
        "img/coins.png",
        "img/menu.png",
        "img/mute.png",
        "img/muted.png",
        "img/how.png",
        "img/howbtn.png",
        "img/play.png",
        "video/intro.mp4",
        "video/outro.mp4",
        {
            "id": "boxes",
            "src": "sprite/boxsprite.png"
        },
        {
            "id": "boxJSON",
            "src": "json/box.json"
        },
        {
            "id": "levels",
            "src": "json/levels.json"
        },
        {
            "id": "enemiesJSON",
            "src": "json/enemies.json"
        },
        {
            "id": "heroJSON",
            "src": "json/hero.json"
        },
        {
            "id": "branchJSON",
            "src": "json/branch.json"
        },
        {
            "id": "helpJSON",
            "src": "json/help.json"
        },
        {
            "id": "enemyhelpJSON",
            "src": "json/enemyhelp.json"
        },
        {
            "id": "doorJSON",
            "src": "json/doors.json"
        },
        {
            "id":"enemySound",
            "src":"sound/enemysound.wav"
        },
        {
            "id":"helpSound",
            "src":"sound/helpsound.wav"
        },
        {
            "id":"helpedSound",
            "src":"sound/enemyhelped.wav"
        },
        {
            "id":"coinSound",
            "src":"sound/coinssound.wav"
        },
        {
            "id":"bgSound",
            "src":"sound/bgsound.mp3"
        }
    ]);
}

function progress(e) {
    loadingBar.scaleX = e.progress * loadingWidth;
    preloadNum.text = Math.round(e.progress*100)+"%";
    stage.update();
}

function startPage() {
    //menu billedet bliver addet til stage
    menubg = new createjs.Bitmap(queue.getResult("img/menu.png"));
    stage.addChild(menubg);
    
    //de forskellige knapper tilføjes
    playBtn = new createjs.Bitmap(queue.getResult("img/play.png"));
    playBtn.x = 359;
    playBtn.y = 284;
    stage.addChild(playBtn);
    playBtn.addEventListener("click", playVideo);
    
    muteBtn = new createjs.Bitmap(queue.getResult("img/mute.png"));
    muteBtn.x = 358;
    muteBtn.y = 366;
    stage.addChild(muteBtn);
    
    mutedBtn = new createjs.Bitmap(queue.getResult("img/muted.png"));
    mutedBtn.x = muteBtn.x;
    mutedBtn.y = muteBtn.y;
    mutedBtn.visible=false;
    stage.addChild(mutedBtn);

    ppc = new createjs.PlayPropsConfig().set({loop: -1, volume: 0.2});
    bgMusic = createjs.Sound.play("bgSound", ppc);
    bgMusic.play(ppc);
    
    //hvis muteBtn bliver trykket på vies mutedBtn og mute bliver sat til true
    muteBtn.addEventListener("click", function(){
        mutedBtn.visible=true;
        bgMusic.stop();
        mute=true;
    });
    
    mutedBtn.addEventListener("click", function(){
        mutedBtn.visible=false;
        bgMusic.play(ppc);
        mute=false;
    });
    
    howBtn = new createjs.Bitmap(queue.getResult("img/howbtn.png"));
    howBtn.x = 359;
    howBtn.y = 451;
    stage.addChild(howBtn);
    
    how = new createjs.Bitmap(queue.getResult("img/how.png"));
    how.x = 160;
    how.y = 70;
    how.visible=false;
    stage.addChild(how);
    
    //howBtn viser taleboblen
    howBtn.addEventListener("click", function(){
        if (how.visible==false) {
            how.visible=true;
        } else {
            how.visible=false;
        }
    });
    
    stage.update();
}

function setupGame() {  
    window.onkeyup=keyUp;
    window.onkeydown=keyDown;

    startPage();
    
    //ticker sættes
    createjs.Ticker.setFPS(60);
    createjs.Ticker.on("tick", tock);
}

function playVideo() {
    //introvideon afspilles
    introVideo = document.createElement('video');
    introVideo.src = "video/intro.mp4";
    introVideo.autoplay = true;
    var video = new createjs.Bitmap(introVideo);
    stage.addChild(video);
    var skip = new createjs.Text("Click to skip", "20px Arial", "#515150");
    stage.addChild(skip);
    
    //ved click stoppes den og nextLevel bliver kaldt
    video.on("click", function(){
        introVideo.stop;
        nextLevel();
        videoStopped=true;
    });
    
    //når video er færdig kaldes nextLevel
    introVideo.onended = function(){
            if (videoStopped==false) {
                nextLevel();
            }
        };
}

function nextLevel() {
    gameStarted=true;    
    stage.removeAllChildren();
    currentLevel++;
    boxArray=[];
    enemyArray=[];
    branchArray=[];
    helpArray=[];
    enemyHelpArray=[];
    doorArray=[];
    removedEnemies=0;
    
    boxSheet = new createjs.SpriteSheet(queue.getResult("boxJSON"));
    enemySheet = new createjs.SpriteSheet(queue.getResult("enemiesJSON"));
    branchSheet = new createjs.SpriteSheet(queue.getResult("branchJSON"));
    helpSheet = new createjs.SpriteSheet(queue.getResult("helpJSON"));
    enemyHelpSheet = new createjs.SpriteSheet(queue.getResult("enemyhelpJSON"));
    doorSheet = new createjs.SpriteSheet(queue.getResult("doorJSON"));
    
    var i;
    var temp = queue.getResult('levels');
    levelData = temp.levels[currentLevel];
    
    //baggrundsbilledet hentes fra levels.json
    bg = levelData.bgIMG;
    bgBit = new createjs.Bitmap(queue.getResult(bg));
    bgBit.y = -650;
    bgBit.x = 0;
    stage.addChild(bgBit);
    
    //hvis det er level 3 placeres atm maskinen
    if (currentLevel==2) {
        atm = new createjs.Bitmap(queue.getResult("img/atm.png"));
        atm.x = 1400;
        atm.y = 270;
        atm.width=265;
        atm.height=189;
        stage.addChild(atm);
    }

    //looper igennem boxes, enemies, branches og help og placerer dem i forhold til det givne data fra levels.json
    for (i=0; i<levelData.branches.length; i++) {
        var t = new createjs.Sprite(branchSheet, levelData.branches[i].sprite);
        t.x = levelData.branches[i].x;
        t.y = levelData.branches[i].y;
        t.width = levelData.branches[i].width;
        t.height = levelData.branches[i].height;
        stage.addChild(t);
        branchArray.push(t);
    }
    
    for (i=0; i<levelData.enemies.length; i++) {
        var t = new createjs.Sprite(enemySheet, levelData.enemies[i].sprite);
        t.x = levelData.enemies[i].x;
        t.y = levelData.enemies[i].y;
        t.width = levelData.enemies[i].width;
        t.height = levelData.enemies[i].height;
        stage.addChild(t);
        enemyArray.push(t);
    }
    
    
    for (i=0; i<levelData.help.length; i++) {
        var t = new createjs.Sprite(helpSheet, levelData.help[i].sprite);
        t.x = levelData.help[i].x;
        t.y = levelData.help[i].y;
        t.width = levelData.help[i].width;
        t.height = levelData.help[i].height;
        stage.addChild(t);
        helpArray.push(t);
    }
    
    for (i=0; i<levelData.doors.length; i++) {
        var t = new createjs.Sprite(doorSheet, levelData.doors[i].sprite);
        t.x = levelData.doors[i].x;
        t.y = levelData.doors[i].y;
        t.width = levelData.doors[i].width;
        t.height = levelData.doors[i].height;
        stage.addChild(t);
        doorArray.push(t);
    }
    
    for(i=0; i<levelData.boxes.length; i++){
        var t = new createjs.Sprite(boxSheet, levelData.boxes[i].sprite);
        t.x = levelData.boxes[i].x;
        t.y = levelData.boxes[i].y;
        t.width = levelData.boxes[i].width;
        t.height = levelData.boxes[i].height;
        stage.addChild(t);
        boxArray.push(t);
    }
    
    createHero();
}

function createHero() {
    //hero bliver skabt
    heroSprite = new createjs.SpriteSheet(queue.getResult('heroJSON'));
    hero = new createjs.Sprite(heroSprite, 'standingRight');
    hero.x = 150;
    hero.y = 260;
    hero.height = 390;
    hero.width = 100;
    hero.jumpPower=0;
    hero.gravityEffect=0;
    hero.currentHelpObject=null;
    hero.nextX;
    hero.nextY;
    hero.helpObjects=0;
    hero.coins=0;
    stage.addChild(hero);
}

//tester om tasten holdes nede
function keyDown(e) {
    switch (e.keyCode) {
        case 32:
            keys.space=true;
            break;
        case 37:
            keys.left=true;
            break;
        case 38:
            keys.up=true;
            break;
        case 39:
            keys.right=true;
            break;
    }
}

//tjekker om tasten er sluppet
function keyUp(e) {
   switch (e.keyCode) {
        case 32:
            keys.space=false;
            break;
        case 37:
            keys.left=false;
            break;
        case 38:
            keys.up=false;
            break;
        case 39:
            keys.right=false;
            break;
    }
}
//almindelig hitTest
function hitTest(rect1, rect2) {
    if ( rect1.x >= rect2.x + rect2.width
        || rect1.x + rect1.width <= rect2.x
        || rect1.y >= rect2.y + rect2.height
        || rect1.y + rect1.height <= rect2.y) {
            
        return false;
    }
    return true;
}
//sørger for du ikke kan gå igennem kasserne
function predictHit(mrH, rect2) {
    if ( mrH.nextX >= rect2.x + rect2.width
        || mrH.nextX + mrH.width <= rect2.x
        || mrH.nextY >= rect2.y + rect2.height
        || mrH.nextY + mrH.height <= rect2.y) {
            
        return false;
    }
    return true;
}

//lander på en platform
function objectOnPlatform(moving, stationary) {
    if (moving.x < stationary.x + stationary.width
        && moving.x + moving.width > stationary.x
        && Math.abs((moving.y + moving.height)-
                    stationary.y)<3 ){
        moving.y = stationary.y-moving.height;
        return true;
    }
    return false;
}

//sørger for at baggrunden bevæger sig i forhold til hero
function moveWorld(dir) {
    var i;
    for(i=boxArray.length-1; i>=0; i--){
        if (dir=="left") {
            boxArray[i].x-=settings.heroSpeed; 
        } else if (dir=="right" && bgBit.x<=-2) {
            boxArray[i].x+=settings.heroSpeed;
        } else if (dir=="up") {
            boxArray[i].y-=settings.verticalSpeed;
        } else if (dir=="down") {
            boxArray[i].y+=settings.verticalSpeed;
        }
    }
    
    
    for(i=enemyArray.length-1; i>=0; i--){
        if (dir=="left") {
           enemyArray[i].x-=2;
            
        } else if (dir=="right" && bgBit.x<=-2) {
            enemyArray[i].x+=2;
        }else if (dir=="up") {
            enemyArray[i].y-=settings.verticalSpeed;
        } else if (dir=="down") {
            enemyArray[i].y+=settings.verticalSpeed; 
        }
    }
    
    for(i=enemyHelpArray.length-1; i>=0; i--){
        if (dir=="left") {
            enemyHelpArray[i].x-=2;
            
        } else if (dir=="right" && bgBit.x<=-2) {
            enemyHelpArray[i].x+=2;
        } else if (dir=="up") {
            enemyHelpArray[i].y-=settings.verticalSpeed;
        } else if (dir=="down") {
            enemyHelpArray[i].y+=settings.verticalSpeed;
        }
    }
    
    for (i=branchArray.length-1; i>=0; i--) {
        if (dir=="left") {
            branchArray[i].x-=2;
        } else if (dir=="right" && bgBit.x<=-2){
            branchArray[i].x+=2;
        } else if (dir=="up") {
            branchArray[i].y-=settings.verticalSpeed;
        } else if (dir=="down") {
            branchArray[i].y+=settings.verticalSpeed;
        }
    }
    
    for (i=helpArray.length-1; i>=0; i--) {
        if (dir=="left") {
            helpArray[i].x-=2;
        } else if (dir=="right" && bgBit.x<=-2) {
            helpArray[i].x+=2;
        } else if (dir=="up") {
            helpArray[i].y-=settings.verticalSpeed;
        } else if (dir=="down") {
            helpArray[i].y+=settings.verticalSpeed;
        }
    }
    
    for (i=doorArray.length-1; i>=0; i--) {
        if (dir=="left") {
            doorArray[i].x-=2;
        } else if (dir=="right" && bgBit.x<=-2){
            doorArray[i].x+=2;
        } else if (dir=="up") {
            doorArray[i].y-=settings.verticalSpeed;
        } else if (dir=="down") {
            doorArray[i].y+=settings.verticalSpeed;
        }
    }
    
    
        if (dir=="left") {
            bgBit.x-=2;
        } else if (dir=="right" && bgBit.x<=-2) {
            bgBit.x+=2;
        } else if (dir=="up") {
            bgBit.y-=settings.verticalSpeed;
        } else if (dir=="down") {
            bgBit.y+=settings.verticalSpeed;
        }
        
        if (currentLevel==2) {
            if (dir=="left") {
                atm.x-=2;
            } else if (dir=="right" && bgBit.x<=-2) {
                atm.x+=2;
            } else if (dir=="up") {
                atm.y-=settings.verticalSpeed;
            } else if (dir=="down") {
                atm.y+=settings.verticalSpeed;
            }
        }
    
}
function moveHero() {
    var i, standingOn=false;
    var canJump=false;
    
    //tjekker om objektet lander på en platform - standingOn stopper gravity
    for (i=0; i<boxArray.length; i++) {
        if (objectOnPlatform(hero, boxArray[i])) {
            standingOn=true;
            canJump=true;
        }
    }
    
    for (i=0; i<branchArray.length; i++) {
        if (objectOnPlatform(hero, branchArray[i])) {
            standingOn=true;
            canJump=true;
        }
    }
    
    //hero kan bevæge sig til højre og venstre
    if (keys.right) {
        var collisionRight = false;
        hero.nextY=hero.y;
        hero.nextX=hero.x+settings.heroSpeed
        //tjekker om der kommer bokse, sætter collisionRight=true
        for (i=0; i<boxArray.length; i++) {
            if (predictHit(hero, boxArray[i])) {
                collisionRight=true;
                break;
            }
        }
        //tjekker om der er enemies og om helpObjects er mindre end 0 = hero ikke forbi
        for (i=0; i<enemyArray.length; i++) {
            if (predictHit(hero, enemyArray[i])
                && hero.helpObjects<=0) {
                collisionRight=true;
                if (!mute) {
                    var error = createjs.Sound.play("enemySound");
                    error.setVolume(0.2);
                }   
            } else if (hitTest(hero, enemyArray[i])
                       && hero.helpObjects>0) {
                if (!mute) {
                    var helped = createjs.Sound.play("helpedSound");
                    helped.setVolume(0.1);
                }
                CollisionRight=false;
                stage.removeChild(enemyArray[i]);
                hero.helpObjects--;
                
                stage.removeChild(hero.currentHelpObject);
                
                    var t = new createjs.Sprite(enemyHelpSheet, levelData.enemyhelp[removedEnemies+i].sprite);
                    t.x = enemyArray[i].x;
                    t.y = enemyArray[i].y;
                    t.width = levelData.enemyhelp[removedEnemies+i].width;
                    t.height = levelData.enemyhelp[removedEnemies+i].height;
                    removedEnemies++;
                    stage.addChild(t);
                    enemyHelpArray.push(t);
                
                enemyArray.splice(i, 1);
                
                if (currentLevel==2) {
                    stage.removeChild(coins);
                }
                
            }
        }
        //hvis ingen collision bevæg hero til højre
        if (!collisionRight) {
            hero.x+=settings.heroSpeed;
            if (hero.x > settings.borders.right) {
                hero.x=settings.borders.right
            }
        }
        if (hero.currentAnimation!="right") {
            hero.gotoAndPlay("right");
        }
        
    }
    if (keys.left) {
        var collisionLeft = false;
        hero.nextY=hero.y;
        hero.nextX=hero.x-settings.heroSpeed
        for (i=0; i<boxArray.length; i++) {
            if (predictHit(hero, boxArray[i])) {
                collisionLeft=true;
                break;
            }
        }
        if (!collisionLeft) {
            hero.x-=settings.heroSpeed;
            if (hero.x < settings.borders.left) {
                hero.x=settings.borders.left
            }
        }
        if (hero.currentAnimation!="left") {
            hero.gotoAndPlay("left");
        }
    }
    //betingelser for om objekter skal rykkes left eller right
    if (hero.x >= settings.borders.right && keys.right && !collisionRight) {
        moveWorld("left");
    } else if (hero.x <= settings.borders.left && keys.left && !collisionLeft) {
        moveWorld("right");
    }
    
    
     
    //hero stopper animationen når han ikke bevæger sig
    if (!keys.left && !keys.right && hero.currentAnimation=="right") {
        hero.gotoAndStop("standingRight");
    }
    
    if (!keys.left && !keys.right && hero.currentAnimation=="left") {
        hero.gotoAndStop("standingLeft");
    }
    
    //gravity
    if (!standingOn) {
        hero.y+=hero.gravityEffect;
        hero.gravityEffect++;
        if (hero.gravityEffect>settings.maxGravity) {
            hero.gravityEffect=settings.maxGravity;
        }   
    }
    
    //hero kan ikke falde længere ned end canvas længde
    if (hero.y > stage.canvas.height-390 && bgBit.y<=-650 ) {
        hero.y = stage.canvas.height-hero.height;
        settings.verticalSpeed = -650-bgBit.y;
        moveWorld("down")
        canJump=true;
    };
    
    //jumping logic - så man kun kan hoppe en gang
    if (keys.space && canJump) {
        canJump=false;
        hero.jumpPower=settings.resetJumpPower;
    }
    //selve hoppet
    if (hero.jumpPower> 0){
        hero.y-=hero.jumpPower;
        hero.jumpPower--;
    }
    //betingelser for om baggrund kan bevæge sig op og ned
    if (hero.y > settings.borders.bottom) {
        settings.verticalSpeed=hero.y-settings.borders.bottom;
        hero.y=settings.borders.bottom;
        moveWorld("up");
    } else if (hero.y <= settings.borders.top) {
        settings.verticalSpeed=settings.borders.top-hero.y;
        hero.y=settings.borders.top;
        moveWorld("down");
    }
    
}

function checkForHit(){
    var i;
    //checkes for om hero rammer hjælpeobjekter, hvis lægges der en til hero.helpObjects
    for (i = helpArray.length-1; i>=0; i--) {
        if (hitTest(hero, helpArray[i])) {
            if (!mute) {
                var yay = createjs.Sound.play("helpSound");
                yay.setVolume(0.2);
            }
            createjs.Tween.get(helpArray[i]).to({y:0, x:100*hero.helpObjects}, 1500);
            hero.helpObjects++;
            hero.currentHelpObject=helpArray[i];
            helpArray.splice(i, 1);
        }
    }
    //hitTest på døre, og betingelser for at komme ind
    for (i = doorArray.length-1; i>=0; i--) {
        if (currentLevel==0 && hitTest(hero, doorArray[i]) && keys.up ) {
            nextLevel();
        }
        if (currentLevel==1 && hitTest(hero, doorArray[i]) && keys.up && hero.helpObjects==3) {
            nextLevel();
        }
        if (currentLevel==2 && hitTest(hero, doorArray[i]) && keys.up) {
            gameDone();
        }
    }
    //atm maskinens funktioner
    if (currentLevel==2) {
       if (hitTest(hero, atm) && keys.up && hero.coins==0){
            if (!mute) {
                var coinss = createjs.Sound.play("coinSound");
                //coinss.setVolume(0.2);
            }
            coins = new createjs.Bitmap(queue.getResult("img/coins.png"));
            coins.x = hero.x;
            coins.y = 400;
            stage.addChild(coins)
            createjs.Tween.get(coins).to({x:0, y:0}, 1500);
            hero.helpObjects++;
            hero.coins=1;
        } 
    }    
}

function gameDone() {
    //outro video afspilles
    outroVideo = document.createElement('video');
    outroVideo.src = "video/outro.mp4";
    outroVideo.autoplay = true;
    var video = new createjs.Bitmap(outroVideo);
    stage.addChild(video);
    
    outroVideo.onended = function(){
            bgMusic.stop();
        }; 
    
}

function tock(e) {
    if (gameStarted) {
        moveHero();
        checkForHit();
    }
    stage.update(e);
}