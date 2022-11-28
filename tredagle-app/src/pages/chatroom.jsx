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
    let [userID, setUserID] = useState("");

    useEffect(()=> {
        var peer = new Peer();
        
        /////////// TESTING //////////////
        socket.on("remoteID", (data) => {
            var user2ID = data.remote;
            console.log('user2:' + user2ID)
            setRemoteID(user2ID)
            var call = peer.call(remoteID, localUserVideoRef.current.srcObject);
            call.on('stream', (remoteStream) => {
                remoteUserVideoRef.current.srcObject = remoteStream;
                remoteUserVideoRef.current.play();
            })
        })

        peer.on("open", (id)=> {
            setLocalID(id)
            socket.emit("userID", {data: id})
        });  
        
        socket.on('UID', (userID)=> {
            //generated using uuv4
            setUserID(userID.data)
        });

        //local user video stream
        var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;   
        getUserMedia({video: true, audio: true}, (stream)=> {
            localUserVideoRef.current.srcObject = stream;
            localUserVideoRef.current.play();
        });

        peer.on('call', (call) => {
            call.answer(localUserVideoRef.current.srcObject)
        })
        
        return () => {
            socket.off("remoteID");
            socket.off('userID');
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