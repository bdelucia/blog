export default function Footer() {
    return (
        <footer className="bg-black text-white py-8 px-4 mt-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 md:space-x-8">
                    {/* Left side - Logo */}
                    <div>
                        <img
                            src="/pets.jpg"
                            alt="Picture of my pets"
                            className="h-[200px] w-auto object-contain"
                        />
                    </div>

                    {/* Right side - Contact Info */}
                    <div className="text-center md:text-right">
                        <h3 className="text-lg font-semibold mb-3 text-gray-100">
                            Contact Me 👇
                        </h3>
                        <div className="space-y-2 text-gray-300">
                            <p className="hover:text-white transition-colors duration-200">
                                Bobby DeLucia
                            </p>
                            <p className="hover:text-white transition-colors duration-200">
                                <a
                                    href={`mailto:bdelucia@asu.edu`}
                                    className="hover:underline"
                                >
                                    bdelucia@asu.edu
                                </a>
                            </p>
                            <p className="hover:text-white transition-colors duration-200">
                                <a
                                    href={`tel:623-282-5327`}
                                    className="hover:underline"
                                >
                                    623-282-5327
                                </a>
                            </p>
                            <p className="text-sm hover:text-white transition-colors duration-200">
                                Glendale, AZ
                            </p>
                        </div>
                    </div>
                </div>

                {/* Optional bottom border/divider */}
                <div className="mt-6 pt-6 border-t border-gray-700 text-center">
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} bobbeh.io. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
