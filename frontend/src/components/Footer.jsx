import React from "react";
import { Link } from "react-router-dom";
import { FiGithub, FiTwitter, FiLinkedin, FiMail, FiHeart } from "react-icons/fi";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Problems", href: "/problems" },
      { name: "Contests", href: "/contests" },
      { name: "Leaderboard", href: "/ranks" },
      { name: "Discuss", href: "/discuss" },
    ],
    support: [
      { name: "Help Center", href: "#" },
      { name: "Contact Us", href: "#" },
      { name: "Bug Report", href: "#" },
      { name: "Feature Request", href: "#" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "Code of Conduct", href: "#" },
    ],
  };

  const socialLinks = [
    { name: "GitHub", icon: <FiGithub className="w-5 h-5" />, href: "#" },
    { name: "Twitter", icon: <FiTwitter className="w-5 h-5" />, href: "#" },
    { name: "LinkedIn", icon: <FiLinkedin className="w-5 h-5" />, href: "#" },
    { name: "Email", icon: <FiMail className="w-5 h-5" />, href: "mailto:contact@ojcodester.com" },
  ];

  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                <span className="text-white dark:text-gray-900 font-bold text-sm">OJ</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Codester
              </span>
            </Link>
            <p className="text-sm text-gray-500 mb-6 max-w-xs leading-relaxed">
              Built to accelerate your DSA journey with contests, practice, and instant verdicts. 
              Join thousands of developers improving their coding skills.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500">
            <span>© {currentYear} OJ Codester. All rights reserved.</span>
            <span className="flex items-center gap-1">
              Made with <FiHeart className="w-3.5 h-3.5 text-red-500" /> by the OJ Codester team
            </span>
            <span>Version 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
} 