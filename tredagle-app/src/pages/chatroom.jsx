import NavbarProp from "../components/navbar"
import VideoBox from "../components/videobox"
import Controls from "../components/controls"
import bg_chatroom from "../assets/gradient-1.jpg"
import { Link } from "react-router-dom"
import "../styles/vids.css"

import React, { useEffect, useState } from "react";
import {
  ClientConfig,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import {
  AgoraVideoPlayer,
  createClient,
  createMicrophoneAndCameraTracks,
} from "agora-rtc-react";

const config = { 
  mode: "rtc", codec: "vp8",
};

const appId = "74276218f4974bd293d59106662ab774"; //ENTER APP ID HERE
const token = "007eJxTYHDkUDhxt+J3PhcbY7rFZdUn9wrPbw7eUH7mXcskk5TaucwKDOYmRuZmRoYWaSaW5iZJKUaWximmloYGZmZmRolJ5uYmO0/UJzcEMjK0LQ1gYIRCEJ+bIT0/PyU3vygvMy+dgQEA5bEhdA==";

const useClient = createClient(config);
const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();

const Chatroom = () => {

    const [users, setUsers] = useState([]);
    const [start, setStart] = useState(false);
    const client = useClient();
    const { ready, tracks } = useMicrophoneAndCameraTracks();

    const [inCall, setInCall] = useState(false);
    const [channelName, setChannelName] = useState("goodmorning");

    useEffect(() => {
        // function to initialise the SDK
        let init = async (name) => {
          client.on("user-published", async (user, mediaType) => {
            await client.subscribe(user, mediaType);
            console.log("subscribe success");
            if (mediaType === "video") {
              setUsers((prevUsers) => {
                return [...prevUsers, user];
              });
            }
            if (mediaType === "audio") {
              user.audioTrack?.play();
            }
          });
    
          client.on("user-unpublished", (user, type) => {
            console.log("unpublished", user, type);
            if (type === "audio") {
              user.audioTrack?.stop();
            }
            if (type === "video") {
              setUsers((prevUsers) => {
                return prevUsers.filter((User) => User.uid !== user.uid);
              });
            }
          });
    
          client.on("user-left", (user) => {
            console.log("leaving", user);
            setUsers((prevUsers) => {
              return prevUsers.filter((User) => User.uid !== user.uid);
            });
          });
    
          await client.join(appId, name, token, null);
          if (tracks) await client.publish([tracks[0], tracks[1]]);
          setStart(true);
    
        };
    
        if (ready && tracks) {
          console.log("init ready");
          init(channelName);
        }
    
      }, [channelName, client, ready, tracks]);



    return(
        <>
            <div class="flex justify center">
                <div class="absolute top-0 w-screen">
                    <NavbarProp/>
                </div>
                <img class="object-cover w-screen h-screen" src={bg_chatroom} />
                <div class="fixed grid grid-cols-2 top-1/4 inset-x-0 mx-auto w-[50rem] h-[18rem] lg:w-[90rem] lg:h-[28rem] gap-x-4 gap-y-1 lg:gap-x-12 lg:gap-y-2">
                    {/* <VideoBox setInCall={setInCall} channelName={channelName} />
                    <VideoBox setInCall={setInCall} channelName={channelName} /> */}
                    <div className="App">
                        {ready && tracks && (
                        <Controls useClient={useClient} tracks={tracks} setStart={setStart} setInCall={setInCall} />)}
                        {start && tracks && <VideoBox users={users} tracks={tracks} />}
                    </div>
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