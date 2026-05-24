"use client";

import React from "react";
import Header from "@/components/layout/Header";
import { ShieldCheck, Lock, Network, Scale, Phone } from "lucide-react";
import Image from "next/image";

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      
      <main className="pt-16 w-full min-h-screen flex flex-col md:flex-row bg-background">
        {/* Left Pane: Reporting Form (Children) */}
        <section className="flex-1 p-margin-mobile md:p-margin-desktop md:border-r border-outline-variant overflow-y-auto bg-surface-container-lowest">
          {children}
        </section>

        {/* Right Pane: Security & Privacy */}
        <aside className="w-full md:w-detail-panel-width p-margin-mobile md:p-margin-desktop bg-surface-container-low flex flex-col gap-stack-lg">
          
          {/* Encryption Guarantee Box */}
          <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-secondary">
              <ShieldCheck className="w-8 h-8" />
              <h3 className="text-headline-sm font-headline-sm font-semibold">Our Encryption Guarantee</h3>
            </div>

            <div className="space-y-stack-md">
              {/* AES-256 */}
              <div className="flex gap-4">
                <div className="mt-1 flex-shrink-0 text-primary">
                  <Lock className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="text-label-md font-bold text-primary">AES-256 Protocol</h4>
                  <p className="text-body-md text-on-surface-variant leading-tight">
                    Reports are sealed with military-grade 256-bit Advanced Encryption Standard before hitting our servers.
                  </p>
                </div>
              </div>

              {/* Blind Indexing */}
              <div className="flex gap-4">
                <div className="mt-1 flex-shrink-0 text-primary">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-label-md font-bold text-primary">Blind Indexing</h4>
                  <p className="text-body-md text-on-surface-variant leading-tight">
                    We use Blind Index Cryptographic Storage. Even our database administrators cannot link reports to IP addresses.
                  </p>
                </div>
              </div>

              {/* Legal Immunity */}
              <div className="flex gap-4">
                <div className="mt-1 flex-shrink-0 text-primary">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-label-md font-bold text-primary">Legal Immunity</h4>
                  <p className="text-body-md text-on-surface-variant leading-tight">
                    All submissions are handled under the Digital Protection Act of whistle-blower integrity protocols.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Status Panel */}
            <div className="pt-4 border-t border-outline-variant">
              <div className="flex items-center justify-between mb-4">
                <span className="text-label-sm font-bold text-on-surface-variant">SECURITY STATUS</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-secondary">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  ACTIVE PROTECTION
                </span>
              </div>
              <div className="relative w-full h-32 rounded-lg border border-outline-variant overflow-hidden mb-4 bg-surface-container-high">
                <Image
                  alt="Encryption Visualization"
                  fill
                  className="object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuApIu6RfnZh2SVtMCYmT5ConkHqRSoyh5CrNTggP2wQHMJ_EEdAyxjgUHnQ5OR5tPEUxWF7D3p6rWO5cVlgwKtQmBlxVmTIEs-jjs3M-Cr9lqaRreOjwrxz99QdSQIcRk376risiHu_Skosjt_X_n4LBElHxb1bpxkemAD2j8oetf5icJZznTjsd_oeoPEuWqMPOPZuEnNXTpoynwDCvE16Yl0Qty_I2z9fcTMWK1x_8p1Eprt1esiBiykWPMLtym4IGT6Qi3Z1yBI"
                  sizes="(max-width: 768px) 100vw, 320px"
                  priority
                />
              </div>
              <p className="text-[11px] text-on-surface-variant italic text-center">
                Connection is secured via End-to-End Tunneling
              </p>
            </div>
          </div>

          {/* Immediate Help Box */}
          <div className="bg-secondary/10 p-6 rounded-xl border border-secondary/20">
            <h4 className="text-label-md font-bold text-secondary mb-2">Need Immediate Help?</h4>
            <p className="text-body-md text-on-surface-variant mb-4">
              If you are in immediate physical danger, contact the campus emergency hotline.
            </p>
            <div className="flex items-center gap-2 text-secondary font-bold">
              <Phone className="w-5 h-5" />
              <span>999 (National)</span>
            </div>
          </div>

          {/* Statistics Info */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-3 bg-white rounded border border-outline-variant">
              <span className="text-label-sm text-on-surface-variant">Uptime</span>
              <span className="text-label-sm font-bold text-primary">99.98%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded border border-outline-variant">
              <span className="text-label-sm text-on-surface-variant">Last Audit</span>
              <span className="text-label-sm font-bold text-primary">Oct 2023</span>
            </div>
          </div>

        </aside>
      </main>
    </>
  );
}
