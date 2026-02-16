"use client";
import { FaYoutube, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-white p-6 flex flex-col md:flex-row justify-between items-center text-sm text-black">
            <span className="mb-2 md:mb-0">© 2025 WeCureIT.</span>
            <div className="flex space-x-4">
                <FaTwitter className="hover:text-black cursor-pointer" size={20} />
                <FaInstagram className="hover:text-black cursor-pointer" size={20} />
                <FaYoutube className="hover:text-black cursor-pointer" size={20} />
                <FaLinkedin className="hover:text-black cursor-pointer" size={20} />
            </div>
        </footer>
    );
}
