
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
		world.solids.push(platform);
	});

	return placeholder;
}

// var renderer = new THREE.WebGLRenderer({ antialias : true });
// renderer.setPixelRatio( window.devicePixelRatio );

// var camera = new THREE.PerspectiveCamera( 60, 1, 0.1, 9000 );

// controls = new THREE.PointerLockControls( camera );

// var scene = new THREE.Scene();

// scene.add( camera );
// scene.fog = new THREE.Fog( 0xf2f7ff, 1, 25000 );

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
world.solids.push(cube);




geometry = new THREE.BoxGeometry( 10000, 100, 10000 );
 material = new THREE.MeshPhongMaterial({color: 0x6666FF} );
cube = new THREE.Mesh( geometry, material );
cube.name = "water";
cube.translateY(-650.0);
scene.add( cube );
world.solids.push(cube);






















var hills = generateTerrain();
hills.name = "hills";
hills.translateY(-800.0);
// hills.receiveShadow = true;
scene.add( hills );
world.solids.push(hills);




//LIGHTS
// LIGHTS

				var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
				hemiLight.color.setHSL( 0.6, 1, 0.6 );
				hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
				hemiLight.position.set( 0, 500, 0 );
				// scene.add( hemiLight );

				//

				var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
				dirLight.color.setHSL( 0.1, 1, 0.95 );
				// dirLight.position.set( -1, 1.75, 1 );
				dirLight.position.set( -10, 6, 10 );
				dirLight.position.multiplyScalar( 100 );
				scene.add( dirLight );

				dirLight.castShadow = true;

				dirLight.shadowMapWidth = 2048;
				dirLight.shadowMapHeight = 2048;

				var d = 5000;

				dirLight.shadowCameraLeft = -d;
				dirLight.shadowCameraRight = d;
				dirLight.shadowCameraTop = d;
				dirLight.shadowCameraBottom = -d;

				dirLight.shadowCameraFar = 3500;
				dirLight.shadowBias = -0.0001;
				dirLight.shadowCameraVisible = true;


				// var pointLight = new THREE.pointLight( 0xffffff, 1 );
				// pointLight.position.set( -10, 4, 10 );
				// pointLight.position.multiplyScalar( 100 );
				// scene.add(pointLight);



renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

// var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
// directionalLight.position.set( -1000, 1000, 1000 );
// directionalLight.rotation.set(1, -1, -1);
// scene.add( directionalLight );









// var waterNormals = new THREE.ImageUtils.loadTexture( 'textures/waternormals.jpg' );
// waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

// var water = new THREE.Water( renderer, camera, scene, {
// 	textureWidth: 512,
// 	textureHeight: 512,
// 	waterNormals: waterNormals,
// 	alpha: 	1.0,
// 	sunDirection: dirLight.position.clone().normalize(),
// 	sunColor: 0xffffff,
// 	waterColor: 0x001e0f,
// 	distortionScale: 50.0,
// } );

// var waterPlane = new THREE.PlaneGeometry( 10000, 10000 );
// waterPlane.translate(0, 0, -580);


// var mirrorMesh = new THREE.Mesh(waterPlane, water.material);

// mirrorMesh.add( water );
// mirrorMesh.rotation.x = - Math.PI * 0.5;
// scene.add( mirrorMesh );




