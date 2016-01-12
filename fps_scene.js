
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


var skybox =  makeSkybox( [
	'image_assets/skybox/in_the_clouds/px.jpg', // right
	'image_assets/skybox/in_the_clouds/nx.jpg', // left
	'image_assets/skybox/in_the_clouds/py.jpg', // top
	'image_assets/skybox/in_the_clouds/ny.jpg', // bottom
	'image_assets/skybox/in_the_clouds/pz.jpg', // back
	'image_assets/skybox/in_the_clouds/nz.jpg'  // front
], 8000 );

scene.add(skybox)





// load skybox

// var cubeMap = new THREE.CubeTexture( [] );
// cubeMap.format = THREE.RGBFormat;

// var loader = new THREE.ImageLoader();
// loader.load( 'image_assets/skybox/sunny_day_horizon/cubeflat.png', function ( image ) {

// 	var getSide = function ( x, y ) {

// 		var size = 1024;

// 		var canvas = document.createElement( 'canvas' );
// 		canvas.width = size;
// 		canvas.height = size;

// 		var context = canvas.getContext( '2d' );
// 		context.drawImage( image, - x * size, - y * size );

// 		return canvas;

// 	};

// 	cubeMap.images[ 0 ] = getSide( 2, 1 ); // px
// 	cubeMap.images[ 1 ] = getSide( 0, 1 ); // nx
// 	cubeMap.images[ 2 ] = getSide( 1, 0 ); // py
// 	cubeMap.images[ 3 ] = getSide( 1, 2 ); // ny
// 	cubeMap.images[ 4 ] = getSide( 1, 1 ); // pz
// 	cubeMap.images[ 5 ] = getSide( 3, 1 ); // nz
// 	cubeMap.needsUpdate = true;

// } );

// var cubeShader = THREE.ShaderLib[ 'cube' ];
// cubeShader.uniforms[ 'tCube' ].value = cubeMap;

// var skyBoxMaterial = new THREE.ShaderMaterial( {
// 	fragmentShader: cubeShader.fragmentShader,
// 	vertexShader: cubeShader.vertexShader,
// 	uniforms: cubeShader.uniforms,
// 	depthWrite: false,
// 	side: THREE.BackSide
// } );

// var skyBox = new THREE.Mesh(
// 	new THREE.BoxGeometry( 5000, 5000, 5000 ),
// 	skyBoxMaterial
// );

// scene.add( skyBox );












var sound1 = new THREE.Audio( listener );
sound1.load( 'sounds/tracks/wind_and_chimes.mp3' );
sound1.setRefDistance( 200 );
sound1.autoplay = true;
skybox.add( sound1 );



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




// geometry = new THREE.BoxGeometry( 10000, 100, 10000 );
// material = new THREE.MeshPhongMaterial({color: 0x6666FF, refractionRatio: 0.5, opacity: 0.5, transparent: true } );
// // material = new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5 } )
// cube = new THREE.Mesh( geometry, material );
// cube.name = "water";
// cube.translateY(-650.5);
// scene.add( cube );
// world.solids.push(cube);

// cube.fog = new THREE.Fog( 0xf2f7ff, 1, 5000 );










var hills = generateTerrain();
hills.name = "hills";
hills.translateY(-800.0);
// hills.receiveShadow = true;
scene.add( hills );
world.solids.push(hills);









geometry = new THREE.Geometry();
var sprite = THREE.ImageUtils.loadTexture( "image_assets/sprites/tree.png" );
for ( i = 0; i < 100; i ++ ) {

	var vertex = new THREE.Vector3();
	vertex.x = Math.random() * 2000 - 1000;
	// vertex.y = Math.random() * 2000 - 1000;
	vertex.z = Math.random() * 2000 - 1000;
	vertex.y = 1000;



	var raycaster = new THREE.Raycaster();
	raycaster.ray.direction.set( 0, -1, 0 );
	raycaster.ray.origin = vertex;

	var hits = raycaster.intersectObject( hills );

	if( hits.length != 0 && ( hits[0].face.normal.y > 0 ) ) {
		// var actualHeight = top_hit.distance - birdsEye;
		vertex.y -= hits[0].distance;
		vertex.y -= 780;
	}


	geometry.vertices.push( vertex );

}
// var parameters = [
// 	// [ [1.0, 0.2, 0.5], sprite2, 20 ],
// 	// [ [0.95, 0.1, 0.5], sprite3, 15 ],
// 	[ [0.90, 0.9, 0.5], sprite, 100 ]
// 	// [ [0.85, 0, 0.5], sprite5, 8 ],
// 	// [ [0.80, 0, 0.5], sprite4, 5 ]
// ];


var color, size = 100, particles, materials = [];
// for ( i = 0; i < parameters.length; i ++ ) {

	// color  = parameters[i][0];
	// sprite = parameters[i][1];
	// size   = parameters[i][2];

	material = new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: true, transparent : true, opacity: 1.0 } );
	// materials[i].color.setHSL( color[0], color[1], color[2] );

	particles = new THREE.Points( geometry, material );

	// particles.rotation.x = Math.random() * 6;
	// particles.rotation.y = Math.random() * 6;
	// particles.rotation.z = Math.random() * 6;

	scene.add( particles );

// }



















//LIGHTS
// LIGHTS

				var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.3 );
				hemiLight.color.setHSL( 0.6, 1, 0.6 );
				hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
				// hemiLight.position.set( 0, 500, 0 );
				hemiLight.position.set( -10, 6, 10 );
				hemiLight.position.multiplyScalar( 100 );
				scene.add( hemiLight );

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



// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFShadowMap;

// var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
// directionalLight.position.set( -1000, 1000, 1000 );
// directionalLight.rotation.set(1, -1, -1);
// scene.add( directionalLight );






var parameters = {
	width: 2000,
	height: 2000,
	widthSegments: 250,
	heightSegments: 250,
	depth: 1500,
	param: 4,
	filterparam: 1
};



var waterNormals = new THREE.ImageUtils.loadTexture( 'image_assets/normalmaps/waternormals.jpg' );
waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

water = new THREE.Water( renderer, camera, scene, {
	textureWidth: 512,
	textureHeight: 512,
	waterNormals: waterNormals,
	alpha: 	0.9,
	sunDirection: dirLight.position.clone().normalize(),
	sunColor: 0xffffff,
	waterColor: 0x001e0f,
	distortionScale: 50.0,
} );


mirrorMesh = new THREE.Mesh(
	new THREE.PlaneBufferGeometry( parameters.width * 500, parameters.height * 500 ),
	water.material
);

mirrorMesh.add( water );
mirrorMesh.rotation.x = - Math.PI * 0.5;
// mirrorMesh.position.y = 2;
scene.add( mirrorMesh );




