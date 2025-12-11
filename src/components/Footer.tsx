import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
const Footer: React.FC = () => {
  return (
    <footer className='bg-[#e0e0e0] text-[#606060] py-8'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-col md:flex-row justify-between items-center md:items-center space-y-6 md:space-y-0'>
          {/* Logo & Copyright */}
          <div className='text-center md:text-left mb-0 md:mb-0'>
            <Image src='/assets/header logo.png' className='mb-2 mx-auto md:mx-0' alt='AuctioHub Logo' width={200} height={80} />
            <p className='text-sm'>© {new Date().getFullYear()} AuctioHub. All rights reserved.</p>
          </div>

                {/* Nav Links */}
                <nav className='mb-0 md:mb-0'>
                <ul className='flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-6'>
                  <li>
                  <Link href='https://docs-auctiohub.vercel.app/' className='hover:underline' target='_blank' rel='noopener noreferrer'>Docs</Link>
                  </li>
                  <li>
                  <Link href='/category' className='hover:underline'>Browse</Link>
                  </li>
                  <li>
                  <Link href='/contact' className='hover:underline'>Contact</Link>
                  </li>
                  <li>
                  <Link href='/faq' className='hover:underline'>FAQ</Link>
                  </li>
                </ul>
                </nav>

                {/* Social Media Links */}
                <div className='flex items-center justify-center space-x-4 mb-0 md:mb-0'>
                <a href='https://www.instagram.com' className='hover:text-[#f52370]'>
                  <FaInstagram className='text-2xl' />
                </a>
                <a href='https://www.facebook.com' className='hover:text-[#234af5]'>
                  <FaFacebook className='text-2xl' />
                </a>
            <a href='https://www.twitter.com' className='hover:text-[#23c8f5]'>
              <FaTwitter className='text-2xl' />
            </a>
          </div>

          {/* Credits Section */}
          <div className='text-sm text-center md:text-right mt-0 md:mt-0'>
            Designed with care using 
            <a
              href='https://sajilo-ui.vercel.app/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-[#606060] hover:underline ml-1'
            >
              Sajilo UI
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;