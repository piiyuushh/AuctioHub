import React from 'react';
import { FaGavel, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className='bg-gradient-to-br from-[#393E46] to-[#2a2e35] text-[#F7F7F7] pt-12 pb-6'>
      <div className='container mx-auto px-4'>
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-8'>
          {/* About Section */}
          <div className='space-y-4'>
            <Image 
              src='/assets/header logo.png' 
              alt='AuctioHub Logo' 
              width={180} 
              height={72}
              className='mb-3'
            />
            <p className='text-sm text-[#EEEEEE] leading-relaxed'>
              Your trusted platform for online auctions. Bid smart, win big, and discover unique items from around the world.
            </p>
            <div className='flex items-center space-x-2 text-[#929AAB]'>
              <FaGavel className='text-lg' />
              <span className='text-sm font-medium'>Trusted by valid users</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='text-lg font-bold mb-4 text-white'>Quick Links</h3>
            <ul className='space-y-2'>
              <li>
                <Link href='/category' className='text-[#EEEEEE] hover:text-[#929AAB] transition-colors duration-200 text-sm flex items-center group'>
                  <span className='mr-2 opacity-0 group-hover:opacity-100 transition-opacity'>→</span>
                  Browse Auctions
                </Link>
              </li>
              <li>
                <Link href='https://docs-auctiohub.vercel.app/' target='_blank' rel='noopener noreferrer' className='text-[#EEEEEE] hover:text-[#929AAB] transition-colors duration-200 text-sm flex items-center group'>
                  <span className='mr-2 opacity-0 group-hover:opacity-100 transition-opacity'>→</span>
                  Documentation
                </Link>
              </li>
              <li>
                <Link href='/faq' className='text-[#EEEEEE] hover:text-[#929AAB] transition-colors duration-200 text-sm flex items-center group'>
                  <span className='mr-2 opacity-0 group-hover:opacity-100 transition-opacity'>→</span>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href='/contact' className='text-[#EEEEEE] hover:text-[#929AAB] transition-colors duration-200 text-sm flex items-center group'>
                  <span className='mr-2 opacity-0 group-hover:opacity-100 transition-opacity'>→</span>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className='text-lg font-bold mb-4 text-white'>Contact</h3>
            <ul className='space-y-3'>
              <li className='flex items-start space-x-3 text-sm text-[#EEEEEE]'>
                <FaMapMarkerAlt className='text-[#929AAB] mt-1 flex-shrink-0' />
                <span>Kathmandu, Nepal</span>
              </li>
              <li className='flex items-center space-x-3 text-sm text-[#EEEEEE]'>
                <FaEnvelope className='text-[#929AAB] flex-shrink-0' />
                <a href='mailto:piyushkarn76@gmail.com' className='hover:text-[#929AAB] transition-colors'>
                  Mail Here
                </a>
              </li>
              <li className='flex items-center space-x-3 text-sm text-[#EEEEEE]'>
                <FaPhone className='text-[#929AAB] flex-shrink-0' />
                <a href='tel:+9779812345678' className='hover:text-[#929AAB] transition-colors'>
                  +977 98-12345678
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className='border-t border-[#4a4e56] my-6'></div>

        {/* Bottom Bar */}
        <div className='flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
          <p className='text-sm text-[#929AAB]'>
            © {new Date().getFullYear()} AuctioHub. All rights reserved.
          </p>
          <div className='flex items-center space-x-6 text-sm text-[#929AAB]'>
            <Link href='/privacy' className='hover:text-[#F7F7F7] transition-colors'>
              Privacy Policy
            </Link>
            <Link href='/terms' className='hover:text-[#F7F7F7] transition-colors'>
              Terms of Service
            </Link>
            <a
              href='https://sajiloui.vercel.app/'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-[#F7F7F7] transition-colors'
            >
              Designed with Sajilo UI
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;