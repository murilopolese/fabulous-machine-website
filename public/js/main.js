paper.install(window);
$( document ).ready(function() {
	var canvas = document.getElementById( 'canvas' );
	paper.setup( canvas );
	var path = new Path();
	path.strokeColor = new Color( 0, 0, 0 );
	path.strokeWidth = 2;

	var tool = new Tool();
	tool.minDistance = 10;

	tool.onMouseDrag = function( event ) {
		path.add(event.point);
	}

	tool.onMouseUp = function( event ) {
		path.add(event.point);
	}

	var saveDrawing = function( surprise ) {
		var rawPoints = [];
		var points = [];

		path.segments.forEach( function( segment, i ) {
			rawPoints.push([
				segment.point.x,
				segment.point.y
			]);
			if( i != 0 ) {
				points.push([
					segment.point.x - path.segments[i-1].point.x,
					-( segment.point.y - path.segments[i-1].point.y )
				]);
			}
		})

		$.ajax({
			type: 'POST',
			url: '/save',
			data: {
				rawPoints: rawPoints,
				points: points,
				surprise: surprise,
				title: $( '.input-title' ).val(),
				author: $( '.input-author' ).val()
			}
		})
		.done( function( data ) {
			if( data.success ) {
				window.location = "/drawing/" + data.drawing._id
			}
		})
		.fail( function( err ) {
			$('.message').html( "Something wrong happened, please try again with more love." );
		});
	}

	$( '.saveDrawing' ).click(function() {
		var surprise = false;
		saveDrawing( surprise );
		return false;
	})
	$( '.surpriseDrawing' ).click(function() {
		var surprise = true;
		saveDrawing( surprise );
		return false;
	})
	$( '.getCode' ).click(function() {
		$( '.code' ).slideDown();
		return false;
	})

})
