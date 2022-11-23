import NavbarProp from "../components/navbar"
import VideoBox from "../components/videobox"
import bg_chatroom from "../assets/gradient-1.jpg"
import { Link } from "react-router-dom"

const Chatroom = () => {

    return(
        <>
            <div class="flex justify center">
                <div class="absolute top-0 w-screen">
                    <NavbarProp/>
                </div>
                <img class="object-cover w-screen h-screen" src={bg_chatroom} />
                <div class="fixed grid grid-cols-2 top-1/4 inset-x-0 mx-auto w-[50rem] h-[18rem] lg:w-[90rem] lg:h-[28rem] gap-x-4 gap-y-1 lg:gap-x-12 lg:gap-y-2">
                    <VideoBox/>
                    <VideoBox/>
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