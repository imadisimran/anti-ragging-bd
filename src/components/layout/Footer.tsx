import React from "react";
import { Mail, Phone } from "lucide-react";
import { FacebookIcon } from "../icons/FacebookIcon";
import { TwitterIcon } from "../icons/TwitterIcon";
import { InstagramIcon } from "../icons/InstagramIcon";
import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="mt-12 pt-12 pb-24 md:pb-8 border-t border-base-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-10">
        {/* Brand Section */}
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Image
              src="/logo.png"
              alt="Anti-Ragging BD Logo"
              width={36}
              height={36}
              className="w-9 h-9 object-contain rounded-md"
            />
            <span className="text-xl font-black tracking-tighter text-primary">
              Anti-Ragging BD
            </span>
          </Link>
          <p className="text-sm text-base-content/60 leading-relaxed">
            We are committed to creating a safe and inclusive campus
            environment for every student. Report incidents anonymously and
            get the support you need.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="p-2 bg-base-100 border border-base-300 rounded-lg text-base-content/60 hover:text-primary hover:border-primary transition-all"
            >
              <FacebookIcon className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 bg-base-100 border border-base-300 rounded-lg text-base-content/60 hover:text-primary hover:border-primary transition-all"
            >
              <TwitterIcon className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 bg-base-100 border border-base-300 rounded-lg text-base-content/60 hover:text-primary hover:border-primary transition-all"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-base-content/40">
            Navigation
          </h4>
          <ul className="space-y-3">
            <li>
              <a
                href="#"
                className="text-sm font-medium text-base-content/70 hover:text-primary transition-colors"
              >
                Home Feed
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm font-medium text-base-content/70 hover:text-primary transition-colors"
              >
                My Complaints
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm font-medium text-base-content/70 hover:text-primary transition-colors"
              >
                University Policies
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm font-medium text-base-content/70 hover:text-primary transition-colors"
              >
                Legal Resources
              </a>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-base-content/40">
            Support
          </h4>
          <ul className="space-y-3">
            <li>
              <a
                href="#"
                className="text-sm font-medium text-base-content/70 hover:text-primary transition-colors"
              >
                Emergency Contacts
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm font-medium text-base-content/70 hover:text-primary transition-colors"
              >
                Counseling Services
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm font-medium text-base-content/70 hover:text-primary transition-colors"
              >
                FAQs
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm font-medium text-base-content/70 hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-base-content/40">
            Contact Us
          </h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-base-content">
                  Email Support
                </p>
                <p className="text-xs text-base-content/60">
                  support@antiragging.bd
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-base-content">
                  24/7 Helpline
                </p>
                <p className="text-xs text-base-content/60">
                  0800-SAFE-CAMPUS
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-base-300 flex flex-col md:flex-row justify-between items-center gap-4 px-10">
        <p className="text-xs font-medium text-base-content/40">
          &copy; {new Date().getFullYear()} Anti-Ragging BD. All rights
          reserved.
        </p>
        <div className="flex gap-6">
          <a
            href="#"
            className="text-xs font-medium text-base-content/40 hover:text-primary transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-xs font-medium text-base-content/40 hover:text-primary transition-colors"
          >
            Cookie Policy
          </a>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
