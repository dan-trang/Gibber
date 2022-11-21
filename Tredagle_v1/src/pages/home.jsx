import { Link } from "react-router-dom"

const Home = () => {
    return (
        <>
            <div>
                <h1 class = "text-3xl font-bold underline">Tredagle landing page</h1>      
            </div>
            <Link to="/chatroom">
                <button class = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Join Chatroom
                </button>
            </Link>
            <p>
                "The button I wish I never pressed"
            </p>
        </>
    )
}

export default Home