function generateHeight( width, height ) {

	var SEED = 0.17;

	var size = width * height, data = new Uint8Array( size ),
	perlin = new ImprovedNoise(), quality = 1, z = SEED;

	for ( var j = 0; j < 4; j ++ ) {
		for ( var i = 0; i < size; i ++ ) {
			var x = i % width, y = ~~ ( i / width );
			data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
		}
		quality *= 5;
	}

	// var centerX = ~~(width/2);
	// var centerY = ~~(height/2);

	// for (var i = 0; i < size; i++) {
	// 	// data[i] += 10;

	// 	var x = i % width, y = ~~ ( i / width );
	// 	var offX = Math.abs(centerX-x);
	// 	var offY = Math.abs(centerY-y);
	// 	var dist = Math.sqrt((offX*offX)+(offY*offY));
	// 	dist = ~~dist;


	// 	var h = (data[i]-(0.1*(dist*dist)));
	// 	data[i] = h >= 0 ? ~~h : 0;
	// }



	return data;
}




function generateTerrain() {
	var worldWidth = 70, worldDepth = 70,
	worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;

	data = generateHeight( worldWidth, worldDepth );

	geometry = new THREE.PlaneBufferGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
	geometry.rotateX( - Math.PI / 2 );
	var vertices = geometry.attributes.position.array;
	for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
		vertices[ j + 1 ] = data[ i ] * 10;
	}
	geometry.computeVertexNormals();

	var maxAnisotropy = renderer.getMaxAnisotropy();
	var texture = THREE.ImageUtils.loadTexture( 'image_assets/textures/grass2.jpg' );
	texture.anisotropy = maxAnisotropy;
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1000, 1000 );

	// material = new THREE.MeshLambertMaterial( { color: 0x66ff66 } );
	material = new THREE.MeshPhongMaterial( { map: texture } );
	var hills = new THREE.Mesh( geometry, material );
	return hills;
}
	