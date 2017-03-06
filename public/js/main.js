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


	$( '.connect' ).click(function() {
		var address = $( '.input-address' ).val();
		ws = new WebSocket( address )
		ws.onopen = function() {
			console.log( 'Welcome to the machine' );
			ws.onmessage = function( event ) {
				console.log( 'event message', event );
				// If is asking for password, send password
				if( event.data == 'Password: ' ) {
					ws.send( $( '.input-password' ).val() + '\n' )
				}
				// If WebREPL is connected, move to step 2
				if( event.data.indexOf( 'WebREPL connected' ) != -1 ) {
					$( '.connection-step-1' ).hide()
					$( '.connection-step-2' ).show()
				}
				// Anyway log it to the "terminal"
				console.log(event.data);
				$( '.code' ).append( event.data.replace( '\n', '<br>' ) );
			}
			ws.onclose = function( event ) {
				console.log( 'close message', event );
			}
		}
	})
	
	$( '.sendCommand' ).click( function() {
		ws.send( $( '.input-command' ).val() + '\r' );
	})

})
