

// var controls;
// var pause = true;




// // player player.motion parameters

// var player.motion = {
// 	airborne : false,
// 	flymode : false,
// 	position : new THREE.Vector3(), velocity : new THREE.Vector3(),
// 	rotation : new THREE.Vector2(), spinning : new THREE.Vector2()
// };

// player.motion.position.y = -2000;


// var world = {
// 	solids : [],
// 	gravity : 0.01
// };


// var player = {
// 	name : "Seph",

// 	runScalar : -0.15,
// 	powerSprintScalar : -0.8,
// 	isPowerSprinting : true,

// 	heightNormal : 3.0,
// 	heightCrouch : 2.0,
// 	isCrouched : false,

// 	currentGravity : world.gravity,

// 	preferences : {
// 		buttonTapSpeed : 200
// 	}
// };

// var emulation = {
// 	lastTimeStamp : 0
// }





// var height = 3.0;


// game systems code

var resetPlayer = function() {
	if( player.motion.position.y < -1000 ) {
		player.motion.position.set( -2, 7.7, 25 );
		player.motion.velocity.multiplyScalar( 0 );
	}
};

var keyboardControls = (function() {

	// var keys = { SP : 32, W : 87, A : 65, S : 83, D : 68, UP : 38, LT : 37, DN : 40, RT : 39 };
	var keys = { 
		CTRL : 17, 
		SHFT : 16, 
		SP : 32, 
		RT : 39, 
		FWD : 71, 
		BACK : 83, 
		SIDE_L : 68, 
		SIDE_R : 84,
		ROLL_L : 81,
		ROLL_R : 77,
		UP : 38, 
		LT : 37, 
		DN : 40, 
		RT : 39, 
		ESC : 27, 
		I : 85
	};

	var keysPressed = {};
	var keysUpdated = {};
	var keyTimes = {};

	//very clever Jochum Skoglund. - Seph
	(function( watchedKeyCodes ) {
		var handler = function( down ) {
			return function( e ) {
				var index = watchedKeyCodes.indexOf( e.keyCode );
				// console.log(e.keyCode);
				if( index >= 0 ) {
					if(keysPressed[watchedKeyCodes[index]] != down)  {
						keysUpdated[watchedKeyCodes[index]] = true;
					}
					keysPressed[watchedKeyCodes[index]] = down; e.preventDefault();
					
				}
				
			};
		};
		window.addEventListener( "keydown", handler( true ), false );
		window.addEventListener( "keyup", handler( false ), false );

		//init all keys
		for(var i = 0; i < watchedKeyCodes.length; i++) {
			keysUpdated[watchedKeyCodes[i]] = false;
			keysPressed[watchedKeyCodes[i]] = false;
		}

	})([
		keys.CTRL, keys.SHFT, keys.SP, keys.FWD, keys.SIDE_L, keys.BACK, keys.SIDE_R, keys.ROLL_L, keys.ROLL_R, keys.UP, keys.LT, keys.DN, keys.RT, keys.ESC, keys.I
	]);


	var forward = new THREE.Vector3();
	var sideways = new THREE.Vector3();

	return function() {

		// if(keysPressed[keys.ESC] && keysUpdated[keys.ESC]) {
		// 	pause = !pause;
		// 	keysUpdated[keys.ESC] = false;
		// }


		if(keysPressed[keys.I] && keysUpdated[keys.I]) {
			keysUpdated[keys.I] = false;
			player.motion.position.y = -2000;
		}


		if(!emulation.pause) {

			//shorthands
			var fwd = keysPressed[keys.FWD];
			var back = keysPressed[keys.BACK];
			var sideL = keysPressed[keys.SIDE_L];
			var sideR = keysPressed[keys.SIDE_R];


			// look around
			var sx = keysPressed[keys.UP] ? 0.03 : ( keysPressed[keys.DN] ? -0.03 : 0 );
			var sy = keysPressed[keys.LT] ? 0.03 : ( keysPressed[keys.RT] ? -0.03 : 0 );
			var sz = keysPressed[keys.ROLL_L] ? 0.03 : ( keysPressed[keys.ROLL_R] ? -0.03 : 0 );


			if( Math.abs( sx ) >= Math.abs( player.motion.spinning.x ) ) player.motion.spinning.x = sx;
			if( Math.abs( sy ) >= Math.abs( player.motion.spinning.y ) ) player.motion.spinning.y = sy;
			if( Math.abs( sz ) >= Math.abs( player.motion.spinning.z ) ) player.motion.spinning.z = sz;
			

			//SHIFT - SPRINT MODE
			player.isPowerSprinting = keysPressed[keys.SHFT];


			//SPACE BAR - UP MOVEMENT
			if(keysUpdated[keys.SP]) {
				keysUpdated[keys.SP] = false;

				if(keysPressed[keys.SP]) {

					// console.log(emulation.lastTimeStamp - keyTimes[keys.SP]);

					var passedTimeSinceLastPrees = emulation.lastTimeStamp - keyTimes[keys.SP];
					if(passedTimeSinceLastPrees <= player.preferences.buttonTapSpeed) {
						player.motion.flymode = !player.motion.flymode;  
					}
					else {
						player.motion.velocity.y +=  1.0;//keysPressed[keys.SHFT] ? 1.0: 0.5;	
					}

					
					keyTimes[keys.SP] = emulation.lastTimeStamp;
				}
			}

			if(player.motion.flymode) {
			 	if(keysPressed[keys.SP] != keysPressed[keys.CTRL]) { 
					if(keysPressed[keys.SP]) {
						// if(player.motion.velocity.y < 1.0) {
						// 	player.motion.velocity.y += 0.03;
						// }
						// else if(player.motion.velocity.y < 4.0) {
						// 	player.motion.velocity.y += 0.02;
						// }
						// else if(player.motion.velocity.y < 10.0) {
						// 	player.motion.velocity.y += 0.03;
						// }

						player.motion.velocity.y = 3.0;
					}


					if(keysPressed[keys.CTRL]) {
						if(player.motion.velocity.y > -0.2) {
							player.motion.velocity.y -= 0.03;
						}
						else if(player.motion.velocity.y > -0.8) {
							player.motion.velocity.y -= 0.02;
						}
						else if(player.motion.velocity.y > -1.0) {
							player.motion.velocity.y -= 0.03;
						}
					}
				}
				else {
					player.motion.velocity.y = 0.0;
				}

				// player.motion.velocity.y = keysPressed[keys.SP] ? 1.0 : 0.0;
			}


			//Move head to center whenever running
			if(!player.motion.flymode) {
				if(fwd || back || sideL || sideR) {
					player.motion.rotation.z *= 0.8;
				}
			}	


			// gravity = keysPressed[keys.CTRL] ? 0.1 : 0.01;

			//always able to look around.  Not able to control player.motion while in air unless in flymode.
			if(!player.motion.airborne || player.motion.flymode) {



				// move around
				forward.set( Math.sin( player.motion.rotation.y ), 0, Math.cos( player.motion.rotation.y ) );
				sideways.set( forward.z, 0, -forward.x );


				//strange AND UGLY logic.  If forward or backward, choose one if not the other.  If both, do nothing.
				//micro optimized for going forwards
				

				if(fwd == back) {
					forward.multiplyScalar(0);
				}
				else {
					forward.multiplyScalar(player.isPowerSprinting ? player.powerSprintScalar : player.runScalar);
					if(back) {
						forward.multiplyScalar(-1.0);	
					}
				}
				


				

				if(sideR == sideL) {
					sideways.multiplyScalar(0);
				}
				else {
					sideways.multiplyScalar(player.isPowerSprinting ? player.powerSprintScalar : player.runScalar);
					if(sideR) {
						sideways.multiplyScalar(-1.0);	
					}
				}
				

				var combined = forward.add( sideways );
				if( Math.abs( combined.x ) >= Math.abs( player.motion.velocity.x ) ) player.motion.velocity.x = combined.x;
				if( Math.abs( combined.y ) >= Math.abs( player.motion.velocity.y ) ) player.motion.velocity.y = combined.y;
				if( Math.abs( combined.z ) >= Math.abs( player.motion.velocity.z ) ) player.motion.velocity.z = combined.z;


				//one off presses
				if(keysPressed[keys.CTRL] && keysUpdated[keys.CTRL]) {
					keysUpdated[keys.CTRL] = false;
					player.isCrouched = !player.isCrouched;
				}

			}
			
		}
	};
})();





var renderer = new THREE.WebGLRenderer({ antialias : true });
renderer.setPixelRatio( window.devicePixelRatio );

var camera = new THREE.PerspectiveCamera( 60, 1, 0.1, 9000 );

controls = new THREE.PointerLockControls( camera );

var scene = new THREE.Scene();

scene.add( camera );
// scene.fog = new THREE.Fog( 0xf2f7ff, 1, 25000 );

var listener = new THREE.AudioListener();
camera.add( listener );






// start the game

var start = function( gameLoop, gameViewportSize ) {
	var resize = function() {
		var viewport = gameViewportSize();
		renderer.setSize( viewport.width, viewport.height );
		camera.aspect = viewport.width / viewport.height;
		camera.updateProjectionMatrix();
	};

	window.addEventListener( 'resize', resize, false );
	resize();

	var render = function( timeStamp ) {
		var timeElapsed = emulation.lastTimeStamp ? timeStamp - emulation.lastTimeStamp : 0; 
		emulation.lastTimeStamp = timeStamp;

		// call our game loop with the time elapsed since last rendering, in ms
		gameLoop( timeElapsed );

		renderer.render( scene, camera );
		requestAnimationFrame( render );
	};

	requestAnimationFrame( render );
};


var gameLoop = function( dt ) {
	keyboardControls();

	if(emulation.pause == false) {

		water.material.uniforms.time.value += 1.0 / 160.0;
		water.render();

		resetPlayer();
		// jumpPads();
		applyPhysics( dt );
		updateCamera();
		// rotateFloaties();

	}
};

var gameViewportSize = function() { return {
	width: window.innerWidth, height: window.innerHeight
}};







document.getElementById( 'container' ).appendChild( renderer.domElement );

start( gameLoop, gameViewportSize );







