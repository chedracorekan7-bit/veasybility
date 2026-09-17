import { useTranslation } from 'react-i18next';

const SEPARATOR = '✦';

function MarqueeTrack({ items, direction }) {
  const loop = [...items, ...items];

  return (
    <div
      className={`marquee-track flex w-max items-center ${
        direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
      }`}
      aria-hidden
    >
      {loop.map((label, index) => (
        <span key={`${label}-${index}`} className="flex shrink-0 items-center">
          <span className="whitespace-nowrap px-6 md:px-10 font-display text-2xl md:text-4xl lg:text-5xl font-normal uppercase tracking-wide text-foreground select-none">
            {label}
          </span>
          <span className="text-2xl md:text-3xl text-foreground/90 select-none" aria-hidden>
            {SEPARATOR}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function SkillsMarquee() {
  const { t } = useTranslation();

  const ROW_ONE = [
    t('marquee.communication'),
    'UI/UX Design',
    t('marquee.community'),
    'Motion Design',
    'Branding',
    'Ads & SEO',
    t('marquee.innovation'),
    t('marquee.video_editing'),
    t('marquee.digital_strategy'),
    t('marquee.performance'),
    t('marquee.accessibility'),
    t('marquee.ai_automation'),
  ];

  const ROW_TWO = [
    t('marquee.innovation'),
    'Product Strategy',
    t('marquee.mobile_app'),
    'Branding',
    'UI/UX',
    '3D Animation',
    t('marquee.web_dev'),
    t('marquee.business_automation'),
    t('marquee.video_production'),
    'Mass Marketing',
    t('marquee.creativity'),
    t('marquee.sales_funnels'),
  ];

  return (
    <section
      className="relative w-full overflow-hidden  bg-bg py-10 md:py-14 transition-colors duration-300"
      aria-label="Domaines d'expertise"
    >
      {/* Fondu sur les bords — effet premium */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 md:w-28 bg-gradient-to-r from-bg to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 md:w-28 bg-gradient-to-l from-bg to-transparent"
        aria-hidden
      />

      <div className="flex flex-col gap-4 md:gap-5">
        <div className="marquee-row overflow-hidden">
          <MarqueeTrack items={ROW_ONE} direction="left" />
        </div>
        <div className="marquee-row overflow-hidden">
          <MarqueeTrack items={ROW_TWO} direction="right" />
        </div>
      </div>
    </section>
  );
}
