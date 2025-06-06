import { Github, Linkedin, TwitterIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from '@formspree/react';
import Notification from '../comps/Notification';

interface FooterNavLink {
  label: string;
  link: string;
}


const footerNavLinks: FooterNavLink[] = [
  { label: 'Privacy Policy', link: '#privacy' },
  { label: 'Terms of Service', link: '#terms' },
  // Add more links here
];

const Footer: React.FC = () => {
  const [emailValue, setEmailValue] = useState('')
  const [state, submitForm, _ ] = useForm(import.meta.env.VITE_FORMSPREE_HASHID, {
    data: {
      subject: 'Someone joined the newsletter',
    }
  });
  const [showNotification, setShowNotification] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitForm(e)
    setEmailValue('')
    if (state.succeeded) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5500);
    }
  };

  return (
    <footer id="footer" className="bg-neutral-900 text-white pt-16 pb-8 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1500239038240-9b3b8bac73c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MzQ2fDB8MXxzZWFyY2h8MXx8bWluaW1hbCUyMHRlY2glMjBmb290ZXIlMjBkZXNpZ258ZW58MHx8fHwxNzQ1Mzc2OTE4fDA&ixlib=rb-4.0.3&q=80&w=1080"
          alt="Footer background"
          className="w-full h-full object-cover opacity-70"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-neutral-900/80"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Dcode DSA</h3>
            <p className="text-gray-400 mb-4">
              Personalized DSA learning platform to help you master algorithms and ace technical interviews.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="Twitter"
              >
                <TwitterIcon />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="GitHub"
              >
                <Github />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#waitlist-cta" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Join Waitlist
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Features
                </a>
              </li>
              <li>
                <a href="#dashboard-preview" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#faq" className="text-gray-400 hover:text-white transition-colors duration-300">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xl font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerNavLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.link} className="text-gray-400 hover:text-white transition-colors duration-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest updates and features.
            </p>
            <form id="newsletter-form" className="flex flex-col sm:flex-row gap-2" onSubmit={handleSubmit}>
              <input
                type="email"
                id='email'
                name='email'
                value={emailValue}
                onChange={e => setEmailValue(e.target.value)}
                placeholder="Your email"
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 cursor-pointer"
                disabled={state.submitting}
              >
                {state.submitting ? 'Submitting...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-800 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <img
              src="/dcodedsa_logo.jpg"
              alt="Dcode DSA"
              className="h-10 w-auto rounded-full"
              loading="lazy"
            />
          </div>
          <p className="text-gray-500 text-sm text-center md:text-right">
            © 2025 Dcode DSA. All rights reserved.
          </p>
        </div>
      </div>

      {/* Newsletter Success Notification */}
      {showNotification && (
        <Notification message="Thanks for subscribing!" />
      )}
    </footer>
  );
};

export default Footer;
