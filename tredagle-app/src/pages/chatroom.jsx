import NavbarProp from "../components/navbar"
import VideoBox from "../components/videobox"
import bg_chatroom from "../assets/gradient-1.jpg"
import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { Peer } from 'peerjs'

const Chatroom = ( {socket} ) => {
    const localUserVideoRef = useRef();
    const remoteUserVideoRef = useRef();
    let [remoteID, setRemoteID ] = useState("");
    let [localID, setLocalID ] = useState("");
    //let [userID, setUserID] = useState("");

    useEffect(()=> {
        var peer = new Peer();
        var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;  
        /////////// TESTING //////////////
        socket.on("remoteID", (data) => {
            console.log("RemoteID sent")
            var user2ID = data.remote;
            console.log('user2 peerID:' + user2ID);
            setRemoteID(user2ID);
             
            // var call = peer.call(user2ID, localUserVideoRef.current.srcObject);
            // console.log("Call was sent by user1")
            // console.log("SENT: " + localUserVideoRef.current.srcObject)
            // call.on('stream', async (remoteStream) => {
            //     remoteUserVideoRef.current.srcObject = remoteStream;
            //     await remoteUserVideoRef.current.play();
            // })
            getUserMedia({video: true, audio: true}, function(stream) {
            var call = peer.call(user2ID, stream);
            call.on('stream', function(remoteStream) {
                remoteUserVideoRef.current.srcObject = remoteStream;
                remoteUserVideoRef.current.play();
            });
            }, function(err) {
                console.log('Failed to get local stream' ,err);
            })

        }   )

        peer.on("open", (id)=> {
            setLocalID(id)
            //check local cache
            let userID = localStorage.getItem('userID');
            console.log(`user ID from local storage ${userID}`)
            socket.emit("peerID", {
                peerID: id,
                userID: userID
            })
        });  
        
        socket.on('newUID', (userID)=> {
            //generated using uuv4
            console.log(`[LOCAL STORAGE RECEIVED]: ${userID.newUID}`)
            localStorage.setItem('userID', `${userID.newUID}`);
            console.log("SEt the LOCAL Storage")
            //setUserID(userID.data)
        });

        //local user video stream
        getUserMedia({video: true, audio: true}, (stream)=> {
            localUserVideoRef.current.srcObject = stream;
            localUserVideoRef.current.play();
        });
        
        peer.on('call', function(call) {
            getUserMedia({video: true, audio: true}, function(stream) {
              call.answer(stream); // Answer the call with an A/V stream.
              call.on('stream', function(remoteStream) {
                  remoteUserVideoRef.current.srcObject = remoteStream;
                  localUserVideoRef.current.play();
              });
            }, function(err) {
              console.log('Failed to get local stream' ,err);
            });
        });
        // peer.on('call', (call) => {
        //     console.log("CALL WAS RECEIVED BY PEER2")
        //     call.answer(localUserVideoRef.current.srcObject)
        // })
        
        return () => {
            socket.off("remoteID");
            socket.off('peerID');
            socket.off("UID");
        }

    }, []);
    
    

    return(
        <>
            <div class="flex justify center">
                <div class="absolute top-0 w-screen">
                    <NavbarProp/>
                </div>
                <img class="object-cover w-screen h-screen" src={bg_chatroom} />
                <div class="fixed grid grid-cols-2 top-1/4 inset-x-0 mx-auto w-[50rem] h-[18rem] lg:w-[90rem] lg:h-[28rem] gap-x-4 gap-y-1 lg:gap-x-12 lg:gap-y-2">
                <video id="LOCAL" ref={localUserVideoRef} class="w-full h-full bg-black border-2 border-stone-900"></video>
                <video ref={remoteUserVideoRef} class="w-full h-full bg-black border-2 border-stone-900"></video>
                    <div class="flex justify-center">
                        <Link class="h-fit" to="/">
                            <button class="btn-leave">Leave</button>
                        </Link>
                    </div>
                    <div class="flex justify-around">
                        <div>
                            <Link class="h-fit" to="/">
                                <button class="btn-callback">Call Back</button>
                            </Link>
                        </div>
                        <div>
                            <Link class="h-fit" to="/">
                                <button class="btn-skip w-32">Skip</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Chatroom