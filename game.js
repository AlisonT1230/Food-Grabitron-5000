var PRESETY = 500;	//Preset Y for player
var ANIMATE_COUNT = 50;	//Delay to animate player

var keyState = {};	//For key listeners

//Canvas
var c;
var ctx;

var FOOD_NUM = 19;	//number of kinds of food (to iterate for images)

//Window info
var winWidth;
var winHeight;

var MAX_LEADERBOARD = 5;	//max number of top scores

var score;

var gameOver;	//boolean for game over

//Images
var foodImages = [];
var pImg1 = new Image();
var pImg2 = new Image();
var pImgW1 = new Image();
var pImgW2 = new Image();
var pImgW3 = new Image();
var explosionImgs = [];
var  bombImg;
var exclamation;

//Sounds
var chews = [];
var jumpSound;
var bombSound;

window.addEventListener('keydown', function(e){
	keyState[e.keyCode || e.which] = true;
},true);
		
window.addEventListener('keyup', function(e){
	keyState[e.keyCode || e.which] = false;
},true);

//Objects and Arrays
var foods = [];
var dangers = [];
var explosions = [];

//LEADERBOARD
var leaderboard = [{name: "YOMAMA", score: 524}, {name:"ABC", score: 496}, {name: "EYY", score: 347}];

var player = {
	src: pImg1,
	x: 200,
	y: PRESETY,
	dy: 0,
	width: 100,
	height: 100,
	count: 0,
	flickerCount: 0	//counter to use for animation
};

var foodSpawner = {
	count: 0,
	spawnCount: 100	//spawns at this count value
}

var dangerSpawner = {
	count: 0,
	spawnCount: 500	//spawns at this count value
}

/*
The initialize function where things are loaded and the update function is called.
*/
function init(){
	c = document.getElementById("screen");
	ctx = c.getContext("2d");
	canvasSetup();
	
	pImg1.src = "Images/PlayerIdle.png";
	pImg2.src = "Images/PlayerIdle2.png"
	pImgW1.src = "Images/PlayerWalk.png";
	pImgW2.src = "Images/PlayerWalk2.png";
	pImgW3.src = "Images/PlayerWalk3.png";
	
	loadFood();
	loadSounds();
	loadDanger();
	score = 0;
	
	gameOver = false;
	
	update();
}

/*
If mobile, set the play area to the screen size
If not, set play area to 450x700
Default is 450x700
*/
function canvasSetup(){
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		ctx.canvas.width, winWidth = window.innerWidth;
		ctx.canvas.height, winHeight = window.innerHeight;
	}else{
		winWidth = 450;
		winHeight = 700;
	}
}

//Load functions

function loadFood(){
	for(var i = 1; i <= FOOD_NUM; i++){
		var currImg = new Image();
		currImg.src = "Images/f" + i + ".png";
		foodImages.push(currImg);
	}
}

function loadSounds(){
	for(var i = 1; i <= 3; i++){
		var currSound = document.createElement('audio');
		currSound.src = "Sound/Chew" + i + ".wav";
		chews.push(currSound);
	}
	jumpSound = document.createElement('audio');
	jumpSound.src = "Sound/Jump.wav";
	bombSound = document.createElement('audio');
	bombSound.src = "Sound/Bomb.wav";
}

function loadDanger(){
	bombImg = new Image();
	bombImg.src = "Images/Bomb.png";
	var explosionImg1 = new Image();
	explosionImg1.src = "Images/Explosion.png";
	var explosionImg2 = new Image();
	explosionImg2.src = "Images/Explosion2.png";
	explosionImgs.push(explosionImg1);
	explosionImgs.push(explosionImg2);
	exclamation1 = new Image();
	exclamation1.src = "Images/Exclamation.png";
	exclamation2 = new Image();
	exclamation2.src = "Images/Exclamation2.png";
}

//Collision

function isCollide(x1, y1, w1, h1, x2, y2, w2, h2){
	if((x1 > x2 && x1 < x2 + w2) || (x1 + w1 > x2 && x1 + w1 < x2 + w2)){
		if((y1 > y2 && y1 < y2 + h2) || (y1 + h1 > y2 && y1 + h1 < y2 + h2)){
			return true;
		}
	}
	return false;
}

//Update functions

function update(){
	if(gameOver){
		leaderboardWaitForProceed();
	}else{
		if(keyState[16]){
			gameOver = !gameOver;
		}
		
		updatePlayer();
		updateFoodSpawner();
		updateDangerSpawner();
		updateFoods();
		updateDangers();
		updateExplosions();
		clear();
		drawScene();
		drawPlayer();
		drawFoods();
		drawDangers();
		drawExplosions();
		drawScore();
		
	}setTimeout(update, 10);
}

function updatePlayer(){
	var move = false;
	if(player.count == ANIMATE_COUNT){
		player.count = 0;
	}else{
		player.count++;
	}
	
	if (keyState[37] && player.x > 0){
		player.x += -5;
		move = true;
	} else if (keyState[39] && player.x < winWidth - player.width){
		player.x += 5;
		move = true;
	}
	
	if (keyState[38] && player.y == 500){	//Jump!
		player.dy += -15;
		player.y += player.dy;
		jumpSound.play();
	}else{	//update falling
		if(player.y < 500){
			player.y += player.dy;
			player.dy += 0.5;
		}else{
			player.y = 500;
		}
	}
	
	if(move){
		if(player.count < ANIMATE_COUNT/3){
			player.src = pImgW1;
		}else if(player.count < ANIMATE_COUNT/3 * 2){
			player.src = pImgW2;
		}else{
			player.src = pImgW3;
		}
	}else{
		if(player.count < ANIMATE_COUNT/2){
			player.src = pImg1;
		}else{
			player.src = pImg2;
		}
	}
	
	if(player.flickerCount > 0){
		player.flickerCount--;
	}
}

function updateFoodSpawner(){
	if(foodSpawner.count == foodSpawner.spawnCount){
		foodSpawner.count = 0;
		spawnFood();
	}else{
		foodSpawner.count++;
	}
}

function updateDangerSpawner(){
	if(dangerSpawner.count == dangerSpawner.spawnCount){
		dangerSpawner.count = 0;
		spawnBomb();
	}else{
		dangerSpawner.count++;
	}
}

function updateFoods(){
	for(var i = 0; i < foods.length; i++){
		foods[i].y += foods[i].fallSpeed;
		var collided = isCollide(foods[i].x, foods[i].y, foods[i].width, foods[i].height, player.x, player.y, player. width, player.height);
		if(collided){
			score += 2 * foods[i].fallSpeed;
			chews[Math.round(Math.random() * 2)].play();
			foods.splice(i, 1);
		}else if(foods[i].y > 700){
			foods.splice(i, 1);
		}
	}
}

function updateDangers(){
	for(var i = 0; i < dangers.length; i++){
		dangers[i]. y += dangers[i].fallSpeed;
		var collided = isCollide(dangers[i].x, dangers[i].y, dangers[i].width, dangers[i].height, player.x, player.y, player. width, player.height);
		if(collided){
			score -= 2 * dangers[i].fallSpeed;
			bombSound.play();
			spawnExplosion(dangers[i].x, dangers[i].y, dangers[i].width, dangers[i].height);
			player.flickerCount = 100;
			dangers.splice(i, 1);
		}else if(dangers[i].y > 700){
			dangers.splice(i, 1);
		}
	}
}

function updateExplosions(){
	for(var i = 0; i < explosions.length; i++){
		if(explosions[i].countdown > 0){
			explosions[i].countdown--;
		}else{
			explosions.splice(i, 1);
		}
	}
}

//Spawn functions

function spawnFood(){
	var food = {
		src: foodImages[Math.floor(Math.random() * (18))],
		x: Math.random() * (winWidth - 40),
		y: -40,
		width: 40,
		height: 40,
		fallSpeed: Math.floor(Math.random() * (4) + 1)
	};
	foods.push(food);
}

function spawnBomb(){
	var newBomb = {
		src: bombImg,
		x: Math.random() * 400,
		y: 0,
		width: 50,
		height: 50,
		fallSpeed: Math.round(Math.random() * 4 + 1)
	};
	dangers.push(newBomb);
}

function spawnExplosion(x, y, w, h){
	var newExp = {
		src: explosionImgs[0],
		x: x,
		y: y,
		width: w,
		height: h,
		countdown: 50
	}
	explosions.push(newExp);
}

//Drawing functions

function clear(){
	ctx.clearRect(0,0,450,700);
}

function drawPlayer(){
	ctx.drawImage(player.src, player.x, player.y, player.width, player.height);
	if(player.flickerCount > 0){
		if(Math.round(player.flickerCount / 10) % 2 == 0){
			ctx.drawImage(exclamation1, player.x, player.y - player.height - 20, player.width, player.height);
		}else{
			ctx.drawImage(exclamation2, player.x + 5, player.y - player.height - 15, player.width, player.height);
		}
	}
}

function drawFoods(){
	for(var i = 0; i < foods.length; i++){
		/*
		console.log("Drawing food " + i);
		console.log("x: " + foods[i].x);
		console.log("y: " + foods[i].y);
		*/
		ctx.drawImage(foods[i].src, foods[i].x, foods[i].y, foods[i].width, foods[i].height);
	}
}

function drawDangers(){
	for(var i = 0; i < dangers.length; i++){
		ctx.drawImage(dangers[i].src, dangers[i].x, dangers[i].y, dangers[i].width, dangers[i].height);
	}
}

function drawExplosions(){
	for(var i = 0; i < explosions.length; i++){
		if(Math.round(explosions[i].countdown/10)%2 == 0 ){
			ctx.drawImage(explosionImgs[0], explosions[i].x - explosions[i].width/2, explosions[i].y - explosions[i].height/2, explosions[i].width * 2, explosions[i].height * 2);
		}else{
			ctx.drawImage(explosionImgs[1], explosions[i].x - explosions[i].width/2, explosions[i].y - explosions[i].height/2, explosions[i].width * 2, explosions[i].height * 2);
		}
	}
}

function drawScene(){
	ctx.beginPath();
	ctx.fillStyle = 'rgb(100, 200, 255)';
	ctx.fillRect(0, 0, winWidth, winHeight);
	ctx.stroke();
	ctx.beginPath();
	ctx.fillStyle='rgb(50,255,50)';
	ctx.fillRect(0, winHeight - 100, winWidth, 100);
	ctx.stroke();
}

function drawScore(){
	ctx.font = "40px VT323";
	ctx.fillStyle = "black";
	ctx.fillText(score, 15, 40);
}

function drawLeaderboard(){
	ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
	ctx.fillRect(50, 50, winWidth-50-50, winHeight-300);
	ctx.stroke();
	ctx.fillStyle = "red";
	
	ctx.fillText("LEADERBOARD", winWidth/2 - 100, winHeight/2 - 200);
	
	for(var i = 0; i < leaderboard.length; i++){
		ctx.fillText(leaderboard[i].name + " - " + leaderboard[i].score, winWidth/2 - 100, winHeight/2 - 100 + i*40);
	}
}

//Leaderboard

var enterFlicker = 0;
function leaderboardWaitForProceed(){
	drawLeaderboard();
	if(enterFlicker == 200){
		enterFlicker = 0;
	}
	else if(enterFlicker > 100){
		ctx.fillStyle = "rgb(150, 0, 0)";
		enterFlicker++;
	}else{
		ctx.fillStyle = "red";
		enterFlicker++;
	}
	ctx.fillText("Enter", winWidth/2 - 50, winHeight/2 + 50);
	
	if (keyState[13]){
		gameOver = false;
		clearAll();
	}
}

//Restart

function clearAll(){
	dangers = [];
	explosions = [];
	foods = [];
	player.x = 200;
	player.y = PRESETY;
	player.dy = 0;
	score = 0;
}


//Initialize
init();