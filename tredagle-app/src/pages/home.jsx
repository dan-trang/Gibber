import { Link } from "react-router-dom"
import NavbarProp from "../components/navbar"
import bg_image from "../assets/triangle-nature.png"

const Home = () => {
    return (
        <>
            <div class="flex justify-center">
                <div class="fixed top-0 w-screen">
                    <NavbarProp/>
                </div>
                <img class="object-cover w-screen h-screen" src={bg_image}/>
                <div class="hero-card">
                    <h1 class = "py-4 text-center text-6xl md:text-8xl font-bold font-mono underline">Tredagle</h1>      
                    <div class="flex justify-center py-4">
                        <Link to="/chatroom">
                            <button class = "btn-primary">Join Chatroom</button>
                        </Link>
                    </div>
                    <p class="text-center text-black italic text-lg">"The button I wish I never pressed"</p>
                </div>
            </div>
        </>
    )
}

export default Home