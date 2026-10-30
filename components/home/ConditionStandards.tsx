import React from 'react';
import { Ruler, ShieldCheck, RefreshCw } from 'lucide-react';

export default function ConditionStandards() {
  const standards = [
    {
      grade: 'Genesis Drop',
      label: 'Limited Numbered Release',
      desc: 'First-edition release commemorating major MST Blockchain milestones. Features woven genesis labeling and serialized packaging.',
      pillClass: 'vintage-pill-new',
    },
    {
      grade: 'Heavyweight Spec',
      label: '450+ GSM Organic Cotton',
      desc: 'Engineered for enduring wear. Custom double-knit ring-spun fleece with reinforced flatlock stitching that resists shrinking.',
      pillClass: 'vintage-pill-excellent',
    },
    {
      grade: 'Precision Hardware',
      label: 'Laser-Etched 304 Steel',
      desc: 'Double-wall vacuum drinkware and metal pins treated with scratch-resistant matte powder coats and laser-etched precision.',
      pillClass: 'vintage-pill-verygood',
    },
    {
      grade: 'Workspace Gear',
      label: 'Micro-Weave Neoprene',
      desc: 'Non-slip rubber desk pads and water-resistant laptop sleeves with cushioned velvet linings tailored for daily engineering.',
      pillClass: 'vintage-pill-good',
    },
    {
      grade: 'Die-Cut Collectibles',
      label: 'Weatherproof Vinyl',
      desc: 'High-opacity UV and scratch-proof vinyl sticker packs and die-struck hard enamel pins built to customize developer rigs.',
      pillClass: 'vintage-pill-fair',
    },
  ];

  return (
    <section id="standards" className="py-16 md:py-24 bg-[#F4EFEA] border-b border-[#E8E2D8]">
      <div className="max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-10 xl:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF2D2D]">
            The MST Quality Guarantee
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#1A1816]">
            Engineered Craftsmanship & Standards
          </h2>
          <p className="text-xs sm:text-sm text-[#5C564E] leading-relaxed">
            Every MST piece is custom-manufactured from high-grade raw materials.
            We provide exact flat garment measurements, technical specifications, and zero compromises on durability.
          </p>
        </div>

        {/* 5 Standards Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
          {standards.map(item => (
            <div
              key={item.grade}
              className="bg-[#FAF7F2] p-5 rounded-sm border border-[#E8E2D8] flex flex-col justify-between space-y-3 shadow-xs hover:border-[#FF2D2D] transition-colors"
            >
              <div>
                <span className={`editorial-badge ${item.pillClass} mb-2`}>
                  {item.grade}
                </span>
                <h3 className="font-serif-editorial text-sm font-semibold text-[#1A1816] mt-1">
                  {item.label}
                </h3>
                <p className="text-xs text-[#5C564E] mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#E8E2D8]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center shrink-0 text-[#FF2D2D]">
              <Ruler className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif-editorial text-base font-semibold text-[#1A1816]">
                True Garment Measurements
              </h4>
              <p className="text-xs text-[#5C564E] leading-relaxed">
                Chest, length, sleeve, and shoulder dimensions are verified and documented flat on every merchandise card.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center shrink-0 text-[#FF2D2D]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif-editorial text-base font-semibold text-[#1A1816]">
                Official Blockchain Authenticity
              </h4>
              <p className="text-xs text-[#5C564E] leading-relaxed">
                Official MST Blockchain merchandise authorized for contributors, community ambassadors, and ecosystem builders.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center shrink-0 text-[#FF2D2D]">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif-editorial text-base font-semibold text-[#1A1816]">
                7-Day Hassle-Free Returns
              </h4>
              <p className="text-xs text-[#5C564E] leading-relaxed">
                Need a different size or fit? Return or exchange any unworn merchandise item within 7 days in its original packaging.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
