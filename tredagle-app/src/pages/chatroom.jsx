import NavbarProp from "../components/navbar"
import VideoBox from "../components/videobox"
import bg_chatroom from "../assets/gradient-1.jpg"
import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { Peer } from 'peerjs'

const Chatroom = ( {socket} ) => {
    const localUserVideoRef = useRef();
    const remoteUserVideoRef = useRef();
    const leaveButton = useRef();
    let [remoteID, setRemoteID ] = useState("");
    let [localID, setLocalID ] = useState("");
    let [dataConn, setDataConn] = useState(null);
    let [peerState, setPeer] = useState(null);
    //let [userID, setUserID] = useState("");

    useEffect(()=> {
        var peer = new Peer();
        setPeer(peer);

        var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;  

        /*                 LOCAL HOST                   */
        //Receive remoteID from socket.io server 
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
        
        //When we are assigned a peer id this event is triggered
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
        
        peer.on('error', (err)=> {
            console.log(`PEER ERROR EVENT: ${err}`)
        })


        /*                    REMOTE GUEST                    */
        //Local receives data signal from remote
        peer.on('connection', (conn)=> {
            console.log("CONNECTION");
            setDataConn(conn);
            // conn.on('data', (data)=> {
            //     //socket event to tell server to switch this person to active single room
            //     console.log("PEER RECEIVED DATA EVENT");
            //     if(data === 'leave') {
            //         console.log("PEER RECEIVED LEAVE EVENT");
            //         userID = localStorage.getItem('userID');
            //         socket.emit('remote left', {userID: userID});  
            //     }
            // });
        })
        peer.on('call', function(call) {
            getUserMedia({video: true, audio: true}, function(stream) {
            call.answer(stream); // Answer the call with an A/V stream.
            call.on('stream', function(remoteStream) {
                remoteUserVideoRef.current.srcObject = remoteStream;
                remoteUserVideoRef.current.play();
            });
            }, function(err) {
            console.log('Failed to get local stream' ,err);
            });
        });


        /*                           SHARED                      */
        socket.on('newUID', (userID)=> {
            //generated using uuv4
            console.log(`[LOCAL STORAGE RECEIVED]: ${userID.newUID}`)
            localStorage.setItem('userID', `${userID.newUID}`);
            console.log("SEt the LOCAL Storage")
            //setUserID(userID.data)
        });

        //local user video stream
        getUserMedia({video: true, audio: false}, (stream)=> {
            localUserVideoRef.current.srcObject = stream;
            localUserVideoRef.current.play();
        });
        /*  END SHARED  */
        
        return () => {
            socket.off("remoteID");
            socket.off('peerID');
            socket.off("UID");
        }

    }, []);

    ////// OUTSIDE useEffect loads every time state changes /////////    
    if(dataConn != null) {

        //if Successful data connection established between two Users
        dataConn.on('open', ()=> {
            console.log("Successsfully triggered open event");

            //if current User receives data
            dataConn.on('data',(data)=> {
                console.log("This is the data:" + data);
                if(data == 'leave'){
                    console.log("userID = " + localStorage.getItem('userID'))
                    //put me into active singles here
                    socket.emit('remote leave', {userId: localStorage.getItem('userID')})
                    //set remote peer to null, disconnect dataConnection
                }
            });

            //current User terminates the call by 'Leave' or closing browser
            //turn off media stream
        })
    }

    const leaveRoom = (dataConn)=>{
        console.log("i'm the leave button");
        dataConn.send('leave');
        //turn off media stream: video and audio
        localUserVideoRef.current.pause();
        localUserVideoRef.current.srcObject = null;
        localUserVideoRef.current.play();
    }

    const leaveEmptyRoom = ()=>{
        console.log("coming at you from an EMPTY room")
        localUserVideoRef.current.pause();
        localUserVideoRef.current.srcObject = null;
        localUserVideoRef.current.play();

        //Add to Active Singles list
        // socket.emit('remote leave');
    }

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
                        <Link class="h-fit" to="/" onClick={()=>{localUserVideoRef.current.stop()}}>
                            {dataConn && <button class="btn-leave" onClick={leaveRoom}>Leave</button>}
                            {(dataConn==null) && <button class="btn-leave" onClick={leaveEmptyRoom}>Leave</button>}
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