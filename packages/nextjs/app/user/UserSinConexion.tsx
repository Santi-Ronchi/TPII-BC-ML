import { useRouter } from "next/navigation";
import "./user.css"

const UserSinConexion = () => {
    const router = useRouter();

    return (
        <section className="" style={{ backgroundColor: 'rgba(203, 207, 211, 0.5)' }}>
            <div className="h-full p-10">
                <div className="g-6 flex h-full flex-wrap items-center justify-center text-neutral-800 dark:text-neutral-200">
                    <div className="w-full">
                        <div className="block rounded-lg bg-white shadow-lg dark:bg-neutral-800">
                            <div className="g-0 lg:flex lg:flex-wrap">
                                {/* <!-- Left column container--> */}
                                <div className="px-4 md:px-0 lg:w-6/12">
                                    <br/>
                                    <br/>
                                    <br/>
                                    <h1 className="text-modern">¡Bienvenido!</h1>
                                    <br/>
                                    <br/>
                                    <br/>
                                    {/*<p className="text-darpa">
                                        Si ya perteneces a la familia Darpa inicia sesión para poder ver tu perfil!
                                    </p>
                                    */}
                                
                                    <div className="md:mx-6 md:p-12">
                                        {/* <!--Submit button--> */}
                                        <div className="mb-12 pb-1 pt-1 text-center">
                                            <button
                                                onClick={() => router.push("/loginPage")}
                                                className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                                                type="button"
                                                style={{ backgroundColor: '#8c376c' }}
                                            >
                                                Ingresa con tu mail y contraseña
                                            </button>

                                            <button
                                                onClick={() => router.push("/walletAuth")}
                                                className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                                                type="button"
                                                style={{ backgroundColor: '#8c376c' }}
                                            >
                                                Ingresa directamente con tu Wallet
                                            </button>
                                        </div>

                                        {/* <!--Register button--> */}
                                        <div className="flex items-center justify-between pb-6">
                                            <p className="">¿No tenes una cuenta? ¿Qué esperas?</p>
                                            <button
                                                onClick={() => router.push("/registerPage")}
                                                type="button"
                                                className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                                                style={{ backgroundColor: '#8c376c' }}
                                            >
                                                Registrate aca!
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* <!-- Right column container with background and description--> */}

                                <div
                                    className="flex items-center rounded-b-lg lg:w-6/12 lg:rounded-r-lg lg:rounded-bl-none"
                                    style={{
                                        backgroundImage: 'url(./habitacion.jpg)',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                    }}
                                >

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UserSinConexion;