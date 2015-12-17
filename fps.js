

var controls;

var solids = [];
var pause = true;

forwardScalar = -0.15;
// var gravity = 0.01



// player motion parameters

var motion = {
	airborne : false,
	flymode : false,
	position : new THREE.Vector3(), velocity : new THREE.Vector3(),
	rotation : new THREE.Vector2(), spinning : new THREE.Vector2()
};

motion.position.y = -2000;


var world = {
	solids : [],
	gravity : 0.01
};


var player = {
	name : "Seph",

	runScalar : -0.15,
	powerSprintScalar : -0.18,
	isPowerSprinting : true,

	heightNormal : 3.0,
	heightCrouch : 2.0,
	isCrouched : false,

	currentGravity : world.gravity,

	preferences : {
		buttonTapSpeed : 200
	}
};

var emulation = {
	lastTimeStamp : 0
}





// var height = 3.0;


// game systems code

var resetPlayer = function() {
	if( motion.position.y < -1000 ) {
		motion.position.set( -2, 7.7, 25 );
		motion.velocity.multiplyScalar( 0 );
	}
};

var keyboardControls = (function() {

	// var keys = { SP : 32, W : 87, A : 65, S : 83, D : 68, UP : 38, LT : 37, DN : 40, RT : 39 };
	var keys = { CTRL : 17, SHFT : 16, SP : 32, RT : 39, W : 71, A : 68, S : 83, D : 84, UP : 38, LT : 37, DN : 40, RT : 39 , ESC : 27, I : 85};

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
	})([
		keys.CTRL, keys.SHFT, keys.SP, keys.W, keys.A, keys.S, keys.D, keys.UP, keys.LT, keys.DN, keys.RT, keys.ESC, keys.I
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
			motion.position.y = -2000;
		}


		if(!pause) {

			// look around
			var sx = keysPressed[keys.UP] ? 0.03 : ( keysPressed[keys.DN] ? -0.03 : 0 );
			var sy = keysPressed[keys.LT] ? 0.03 : ( keysPressed[keys.RT] ? -0.03 : 0 );

			if( Math.abs( sx ) >= Math.abs( motion.spinning.x ) ) motion.spinning.x = sx;
			if( Math.abs( sy ) >= Math.abs( motion.spinning.y ) ) motion.spinning.y = sy;
			
			

			//SPACE BAR - UP MOVEMENT
			if(keysUpdated[keys.SP]) {
				keysUpdated[keys.SP] = false;

				if(keysPressed[keys.SP]) {

					// console.log(emulation.lastTimeStamp - keyTimes[keys.SP]);

					var passedTimeSinceLastPrees = emulation.lastTimeStamp - keyTimes[keys.SP];
					if(passedTimeSinceLastPrees <= player.preferences.buttonTapSpeed) {
						motion.flymode = !motion.flymode;  
					}
					
					motion.velocity.y += keysPressed[keys.SHFT] ? 1.0: 0.5;	

					
					keyTimes[keys.SP] = emulation.lastTimeStamp;
				}
				else {
					motion.velocity.y = 0;
				}
			}


			// gravity = keysPressed[keys.CTRL] ? 0.1 : 0.01;

			//always able to look around.  Not able to control motion while in air.
			if(!motion.airborne || motion.flymode) {

				// move around
				forward.set( Math.sin( motion.rotation.y ), 0, Math.cos( motion.rotation.y ) );
				sideways.set( forward.z, 0, -forward.x );

				forward.multiplyScalar( keysPressed[keys.W] ? forwardScalar : (keysPressed[keys.S] ? 0.1 : 0));
				sideways.multiplyScalar( keysPressed[keys.A] ? -0.1 : (keysPressed[keys.D] ? 0.1 : 0));

				var combined = forward.add( sideways );
				if( Math.abs( combined.x ) >= Math.abs( motion.velocity.x ) ) motion.velocity.x = combined.x;
				if( Math.abs( combined.y ) >= Math.abs( motion.velocity.y ) ) motion.velocity.y = combined.y;
				if( Math.abs( combined.z ) >= Math.abs( motion.velocity.z ) ) motion.velocity.z = combined.z;


				//one off presses
				if(keysPressed[keys.CTRL] && keysUpdated[keys.CTRL]) {
					keysUpdated[keys.CTRL] = false;

					if(motion.flymode) {
						motion.flymode = false;
					}
					else {
						player.isCrouched = !player.isCrouched;
					}
					
					
				}



				


				forwardScalar = keysPressed[keys.SHFT] ? -2.2 : -0.15;

			}
			
		}
	};
})();



var applyPhysics = (function() {
	var timeStep = 5;
	var timeLeft = timeStep + 1;

	var birdsEye = 3.0;
	var kneeDeep = 1.4;

	var raycaster = new THREE.Raycaster();
	raycaster.ray.direction.set( 0, -1, 0 );

	var angles = new THREE.Vector2();
	var displacement = new THREE.Vector3();

	return function( dt ) {
		// var platform = scene.getObjectByName( "platform", true );

		if(true ) {

			timeLeft += dt;

			// run several fixed-step iterations to approximate varying-step

			dt = 5;
			while( timeLeft >= dt ) {

				var vel_damping = 0.975;
				var time = 0.3, damping = 0.93, tau = 2 * Math.PI;

				raycaster.ray.origin.copy( motion.position );
				raycaster.ray.origin.y += birdsEye;

				var hits = raycaster.intersectObjects( solids );

				motion.airborne = true;

				// are we above, or at most knee deep in, the platform?
				var top_hit = hits[0];
				for(var i = 1; i < hits.length; i++) {
					if(hits[i].distance < top_hit.distance) {
						top_hit = hits[i];
					}
				}

				if( ( top_hit != null ) && ( top_hit.face.normal.y > 0 ) ) {
					var actualHeight = top_hit.distance - birdsEye;

					// collision: stick to the surface if landing on it

					if(actualHeight > -kneeDeep && actualHeight < 0) {
						motion.position.y -= actualHeight;
						// motion.velocity.y = 0;
						motion.airborne = false;
						flymode = false;
					}
				}

				if( motion.airborne && !motion.flymode) motion.velocity.y -= player.currentGravity;

				angles.copy( motion.spinning ).multiplyScalar( time );
				motion.spinning.multiplyScalar( damping );

				displacement.copy( motion.velocity ).multiplyScalar( time );
				if( !motion.airborne || motion.flymode) motion.velocity.multiplyScalar( vel_damping );

				motion.rotation.add( angles );
				motion.position.add( displacement );

				// limit the tilt at ±0.4 radians
				var halfPI = Math.PI/2.0;
				motion.rotation.x = Math.max( -halfPI + .1, Math.min ( Math.PI, motion.rotation.x ) );

				// wrap horizontal rotation to 0...2π

				motion.rotation.y += tau; motion.rotation.y %= tau;

				timeLeft -= dt;
			}
		}
	};
})();

var updateCamera = (function() {
	var euler = new THREE.Euler( 0, 0, 0, 'YXZ' );

	return function() {
		euler.x = motion.rotation.x;
		euler.y = motion.rotation.y;

		camera.quaternion.setFromEuler( euler );

		camera.position.copy( motion.position );
		
		// var height = 3.0;
		camera.position.y += player.isCrouched ? player.heightCrouch : player.heightNormal;
	};
})();


// init 3D stuff

function makeSkybox( urls, size ) {
	var skyboxCubemap = THREE.ImageUtils.loadTextureCube( urls );
	skyboxCubemap.format = THREE.RGBFormat;

	var skyboxShader = THREE.ShaderLib['cube'];
	skyboxShader.uniforms['tCube'].value = skyboxCubemap;

	return new THREE.Mesh(
		new THREE.BoxGeometry( size, size, size ),
		new THREE.ShaderMaterial({
			fragmentShader : skyboxShader.fragmentShader, vertexShader : skyboxShader.vertexShader,
			uniforms : skyboxShader.uniforms, depthWrite : false, side : THREE.BackSide
		})
	);
}

function makePlatform( jsonUrl, textureUrl, textureQuality ) {
	var placeholder = new THREE.Object3D();

	var texture = THREE.ImageUtils.loadTexture( textureUrl );
	texture.minFilter = THREE.LinearFilter;
	texture.anisotropy = textureQuality;

	var loader = new THREE.JSONLoader();
	loader.load( jsonUrl, function( geometry ) {

		geometry.computeFaceNormals();

		var platform = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({ map : texture }) );

		platform.name = "platform";

		placeholder.add( platform );
		solids.push(platform);
	});

	return placeholder;
}

var renderer = new THREE.WebGLRenderer({ antialias : true });
renderer.setPixelRatio( window.devicePixelRatio );

var camera = new THREE.PerspectiveCamera( 60, 1, 0.1, 9000 );

controls = new THREE.PointerLockControls( camera );

var scene = new THREE.Scene();

scene.add( camera );
scene.fog = new THREE.Fog( 0xf2f7ff, 1, 25000 );

scene.add( makeSkybox( [
	'textures/cube/skybox/px.jpg', // right
	'textures/cube/skybox/nx.jpg', // left
	'textures/cube/skybox/py.jpg', // top
	'textures/cube/skybox/ny.jpg', // bottom
	'textures/cube/skybox/pz.jpg', // back
	'textures/cube/skybox/nz.jpg'  // front
], 8000 ));


var plat = makePlatform(
	'models/platform/platform.json',
	'models/platform/platform.jpg',
	renderer.getMaxAnisotropy()
);
scene.add( plat );



var geometry = new THREE.SphereGeometry( 5, 16, 16 );
var material = new THREE.MeshNormalMaterial( );
material.wireframe = true;
var sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );



 geometry = new THREE.BoxGeometry( 100, 1, 10 );
 material = new THREE.MeshNormalMaterial(  );
var cube = new THREE.Mesh( geometry, material );
cube.name = "test";
cube.translateY(-10.0);
scene.add( cube );
solids.push(cube);






var hills = generateTerrain();
hills.name = "hills";
hills.translateY(-800.0);
scene.add( hills );
solids.push(hills);







var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
directionalLight.position.set( -1000, 1000, 1000 );
directionalLight.rotation.set(1, -1, -1);
scene.add( directionalLight );






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

	if(pause == false) {
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







