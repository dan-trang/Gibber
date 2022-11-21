import logo_image from '../assets/t_logo.png'

function NavbarProp() {
    return (
        <>
            <nav class="container flex items-center py-2 mt-2">
                <div class="px-2 mx-2 flex items-center flex-shrink-0">
                    <img class="h-6 w-6" src={logo_image} alt="" />
                    <div>Tredagle</div>
                </div>
                <ul class="hidden sm:flex flex-1 justify-end items-center gap-12 text-bookmark-blue uppercase text-xs">
                    <li>Stuff</li>
                    <li>Thing</li>
                    <li>Stuff</li>
                </ul>
            </nav>
        </>
    )
}

export default NavbarProp