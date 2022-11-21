import { Link } from "react-router-dom"
import NavbarProp from "../components/navbar"
import bg_image from "../assets/triangle-nature.png"

const Home = () => {
    return (
        <>
            <NavbarProp/>
            <div class="w-full h-full flex justify-center">
                <img src={bg_image} />
                <div class="fixed top-1/3">
                    <h1 class = "py-4 text-center text-black text-5xl font-bold underline">Tredagle</h1>      
                    <div class="flex justify-center py-4">
                        <Link to="/chatroom">
                            <button class = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Join Chatroom</button>
                        </Link>
                    </div>
                    <p class="text-center text-indigo-600 italic text-lg">"The button I wish I never pressed"</p>
                </div>
            </div>
        </>
    )
}

export default Home