

var applyPhysics = (function() {
	var timeStep = 5;
	var timeLeft = timeStep + 1;

	var birdsEye = 3.0;
	var kneeDeep = 1.4;

	var raycaster = new THREE.Raycaster();
	raycaster.ray.direction.set( 0, -1, 0 );

	var angles = new THREE.Vector3();
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

				raycaster.ray.origin.copy( player.motion.position );
				raycaster.ray.origin.y += birdsEye;

				var hits = raycaster.intersectObjects( world.solids );

				player.motion.airborne = true;

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
						player.motion.position.y -= actualHeight;
						// player.motion.velocity.y = 0;
						player.motion.airborne = false;
						player.motion.flymode = false;
					}
				}

				if( player.motion.airborne && !player.motion.flymode) player.motion.velocity.y -= player.currentGravity;

				angles.copy( player.motion.spinning ).multiplyScalar( time );
				player.motion.spinning.multiplyScalar( damping );

				displacement.copy( player.motion.velocity ).multiplyScalar( time );
				if( !player.motion.airborne || player.motion.flymode) player.motion.velocity.multiplyScalar( vel_damping );

				player.motion.rotation.add( angles );
				player.motion.position.add( displacement );

				// limit the tilt at ±0.4 radians
				var halfPI = Math.PI/2.0;
				player.motion.rotation.x = Math.max( -halfPI + .1, Math.min ( Math.PI, player.motion.rotation.x ) );

				// wrap horizontal rotation to 0...2π

				player.motion.rotation.y += tau; player.motion.rotation.y %= tau;

				timeLeft -= dt;
			}
		}
	};
})();

var updateCamera = (function() {
	var euler = new THREE.Euler( 0, 0, 0, 'YXZ' );

	return function() {
		euler.x = player.motion.rotation.x;
		euler.y = player.motion.rotation.y;
		euler.z = player.motion.rotation.z;

		camera.quaternion.setFromEuler( euler );

		camera.position.copy( player.motion.position );
		
		// var height = 3.0;
		camera.position.y += player.isCrouched ? player.heightCrouch : player.heightNormal;
	};
})();





