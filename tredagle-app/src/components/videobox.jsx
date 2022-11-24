import { AgoraVideoPlayer } from 'agora-rtc-react'
import "../styles/vids.css"

function VideoBox ( {users, tracks} ) {

    
    // return (
    //     <>
    //     <div class="w-full h-full bg-black border-2 border-stone-900">

    //     </div>
    //     </>
    // )

    return (
        <div>
          <div id="videos">
            <AgoraVideoPlayer className='vid' videoTrack={tracks[1]} />
            { users.length > 0 &&
              users.map((user) => {
                if (user.videoTrack) {
                  return (
                    <AgoraVideoPlayer className='vid' videoTrack={user.videoTrack} key={user.uid} />
                  );
                } else return null;
              }) }
          </div>
        </div>
      );
} 

export default VideoBox