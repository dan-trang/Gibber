import { Link } from "react-router-dom"
import NavbarProp from "../components/navbar"

const Home = () => {
    return (
        <>
            <NavbarProp/>
            <div class="w-screen h-screen bg-indigo-300">
                <div class="pt-10 pb-5">
                    <h1 class = "text-center text-3xl font-bold underline">Tredagle landing page</h1>      
                </div>
                <Link to="/chatroom">
                    <div class="flex justify-center py-2">
                        <button class = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Join Chatroom
                        </button>
                    </div>
                </Link>
                <p class="text-center">
                    "The button I wish I never pressed"
                </p>
            </div>
        </>
    )
}

export default Home