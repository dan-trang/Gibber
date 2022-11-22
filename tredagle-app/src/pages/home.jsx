import { Link } from "react-router-dom"
import NavbarProp from "../components/navbar"
import bg_image from "../assets/triangle-nature.png"

const Home = () => {
    return (
        <>
            <div class="flex justify-center">
                <img class="object-cover w-screen h-screen" src={bg_image}/>
                <div class="fixed top-0 w-screen">
                    <NavbarProp/>
                </div>
                <div class="fixed p-12 my-6 top-1/3 bg-slate-200 rounded-lg border-4 border-dashed border-black opacity-75 shadow-xl">
                    <h1 class = "py-4 text-center text-6xl md:text-8xl font-bold font-mono underline">Tredagle</h1>      
                    <div class="flex justify-center py-4">
                        <Link to="/chatroom">
                            <button class = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Join Chatroom</button>
                        </Link>
                    </div>
                    <p class="text-center text-black italic text-lg">"The button I wish I never pressed"</p>
                </div>
            </div>
        </>
    )
}

export default Home