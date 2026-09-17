import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import { useTranslation } from 'react-i18next';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

// Import local images
import bgchado from '../assets/images/projects/bgchado.avif';
import bgmv from '../assets/images/projects/bgmv.avif';
import bg3 from '../assets/images/projects/bg3.avif';
import bg4 from '../assets/images/projects/rose.avif';
import brunel from '../assets/images/projects/brunel.avif';
import coachella from '../assets/images/projects/coachella.avif';

// roleKey = clé i18n pointant vers team.role_*
const MEMBERS = [
  { id: 1, img: bgchado, name: 'Rachade OREKAN',  roleKey: 'team.role_web_dev'   },
  { id: 2, img: bgmv,    name: 'Morvan FIOSSI',   roleKey: 'team.role_designer'  },
  { id: 3, img: bg3,     name: 'Edson LAWSON',    roleKey: 'team.role_web_dev'   },
  { id: 4, img: bg4,     name: 'Roseline DAKO',   roleKey: 'team.role_graphiste' },
  { id: 5, img: coachella,    name: 'Jean-Claude TOGNIBO',   roleKey: 'team.role_web_dev'},
  { id: 6, img: brunel,     name: 'Brunel KOUKPONOU',   roleKey: 'team.role_content'   },
];

export default function TeamSlider() {
  const { t } = useTranslation();

  return (
    <section className="py-24 relative overflow-hidden bg-bg select-none">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
         <h2 className="font-display text-3xl md:text-4xl font-normal uppercase tracking-wide text-foreground">
            {t('about.team_title')}
         </h2>
      </div>

      <div className="w-full relative">
        <style>
          {`
            .team-swiper {
              width: 100%;
              padding-top: 50px;
              padding-bottom: 50px;
            }
            .team-swiper .swiper-slide {
              background-position: center;
              background-size: cover;
              width: 280px;
              height: 350px;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 15px 35px rgba(0,0,0,0.2);
              opacity: 1;
              transition: all 0.3s ease;
              position: relative;
            }
            
            }
            @media (min-width: 1024px) {
              .team-swiper .swiper-slide {
                opacity: 0.4;
              }
              .team-swiper .swiper-slide-active {
                opacity: 1;
                transform: scale(1);
              }
            }
            .team-swiper .swiper-slide img {
              display: block;
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .slide-info {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              padding: 20px;
              background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
              color: white;
              transform: translateY(100%);
              opacity: 1;
              transition: transform 0.5s ease, opacity 0.5s ease;
              border-radius: 0 0 16px 16px;
            }
            .team-swiper .swiper-slide-active .slide-info {
              transform: translateY(0);
              opacity: 1;
            }
            .slide-name {
              font-family: 'Michroma', sans-serif;
              font-weight: 600;
              font-size: 1.1rem;
              margin-bottom: 4px;
            }
            .slide-role {
              font-family: 'Montserrat', sans-serif;
              font-weight: 400;
              font-size: 0.9rem;
              opacity: 0.9;
            }
            @media (min-width: 640px) {
              .team-swiper .swiper-slide {
                width: 320px;
                height: 400px;
              }
            }
            @media (min-width: 768px) {
              .team-swiper .swiper-slide {
                width: 350px;
                height: 450px;
              }
            }
            @media (min-width: 1024px) {
              .team-swiper .swiper-slide {
                width: 400px;
                height: 500px;
              }
            }
          `}
        </style>
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          spaceBetween={80}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          
          loop
          modules={[EffectCoverflow, Pagination]}
          className="team-swiper"
          breakpoints={{
            0: {
              coverflowEffect: {
                rotate: 0,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              },
              spaceBetween: 40,
            },
            1024: {
              coverflowEffect: {
                rotate: 30,
                stretch: 0,
                depth: 200,
                modifier: 1,
                slideShadows: true,
              },
              spaceBetween: 80,
            }
          }}
        >
          {MEMBERS.map((slide, index) => (
            <SwiperSlide key={index}>
              <img src={slide.img} alt={`Slide ${index + 1}`} />
              <div className="slide-info">
                <div className="slide-name">{slide.name}</div>
                <div className="slide-role">{t(slide.roleKey)}</div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
