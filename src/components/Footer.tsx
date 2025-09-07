import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-brand-dark text-white">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div className="col-span-1 md:col-span-2">
                        <h4 className="text-xl font-bold mb-4">HiLink Adventure</h4>
                        <p className="text-gray-400">Penyedia jasa open trip dan sewa alat outdoor terpercaya untuk petualangan Anda. Jelajahi keindahan alam Indonesia bersama kami.</p>
                    </div>
                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Tautan</h4>
                        <ul className="space-y-2">
                            <li><Link href="/#trips" className="text-gray-400 hover:text-white transition">Paket Trip</Link></li>
                            <li><Link href="/#rental" className="text-gray-400 hover:text-white transition">Sewa Alat</Link></li>
                            <li><Link href="/blog" className="text-gray-400 hover:text-white transition">Blog</Link></li>
                            <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Kontak</Link></li>
                        </ul>
                    </div>
                    {/* Social Media */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Ikuti Kami</h4>
                        <div className="flex space-x-4">
                            {/* Icons can be replaced with actual icon components later */}
                            <a href="#" className="text-gray-400 hover:text-white transition">FB</a>
                            <a href="#" className="text-gray-400 hover:text-white transition">TW</a>
                            <a href="#" className="text-gray-400 hover:text-white transition">IG</a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} HiLink Adventure. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
