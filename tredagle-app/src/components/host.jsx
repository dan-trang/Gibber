

const host = (socket) => {
    socket.on("remoteID", (data) => {
        console.log("RemoteID sent")
        var remoteID = data.remote;
        console.log('user2 peerID:' + remoteID);
        setRemoteID(remoteID);
        //Set remote data connection to dataConn state
        let conn = peer.connect(remoteID);
        console.log("conn is " + conn)
        setDataConn(conn);
        //send local media stream to remoteID with audio
        getUserMedia({video: true, audio: true}, function(stream) {
        var call = peer.call(remoteID, stream);
        //once we receive the remote user stream we assign it to video container
        call.on('stream', function(remoteStream) {
            remoteUserVideoRef.current.srcObject = remoteStream;
            remoteUserVideoRef.current.play();
        });
        }, function(err) {
            console.log('Failed to get local stream' ,err);
        })

    }   )
}