'use client';

import { useEffect, useState } from 'react';
import { useStore } from './context';
import type { Section } from '@/lib/types';

/**
 * Bloc d'accueil : grande bannière (bandeaux « hero »), cartes d'offre
 * (bandeaux « offer ») et bandeau d'avantages.
 */
export default function Hero({ section }: { section: Section }) {
  const { content, pick, money, t, runBanner } = useStore();

  const slides = content.banners.filter((banner) => banner.placement === 'hero');
  const offers = content.banners.filter((banner) => banner.placement === 'offer');
  const benefits = content.benefits.filter((benefit) => benefit.placement === 'hero');

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [paused, slides.length]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  const label = (value: number | null) => (value === null || value === undefined ? null : money(value));

  return (
    <section className="hero-area container" id={section.anchor || undefined}>
      <div className="hero-grid">
        <div className="slider" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          {slides.map((banner, position) => (
            <article
              key={banner.id}
              className={`slide${position === index ? ' active' : ''}`}
              style={{ backgroundImage: `url('${banner.imageUrl}')` }}
            >
              <div className="hero-content">
                {pick(banner.kickerAr, banner.kickerEn) ? (
                  <span className="kicker">
                    {banner.icon ? <i className={banner.icon} /> : null}
                    <span>{pick(banner.kickerAr, banner.kickerEn)}</span>
                  </span>
                ) : null}
                <h1>{pick(banner.titleAr, banner.titleEn)}</h1>
                <p>{pick(banner.bodyAr, banner.bodyEn)}</p>
                {banner.priceValue !== null || pick(banner.priceTextAr, banner.priceTextEn) ? (
                  <div className="hero-price">
                    {banner.priceValue !== null ? (
                      <>
                        <small>{pick(banner.priceTextAr, banner.priceTextEn)}</small>{' '}
                        <span>{label(banner.priceValue)}</span>
                      </>
                    ) : (
                      <span>{pick(banner.priceTextAr, banner.priceTextEn)}</span>
                    )}
                  </div>
                ) : null}
                {pick(banner.ctaAr, banner.ctaEn) ? (
                  <button className="btn" onClick={() => runBanner(banner)}>
                    <span>{pick(banner.ctaAr, banner.ctaEn)}</span>
                    <i className="fa-solid fa-arrow-left" />
                  </button>
                ) : null}
              </div>
            </article>
          ))}

          {slides.length > 1 ? (
            <div className="slider-controls">
              <div className="dots">
                {slides.map((banner, position) => (
                  <button
                    key={banner.id}
                    className={`dot${position === index ? ' active' : ''}`}
                    aria-label={`Slide ${position + 1}`}
                    onClick={() => setIndex(position)}
                  />
                ))}
              </div>
              <div className="arrows">
                <button
                  className="arrow"
                  aria-label="Précédent"
                  onClick={() => setIndex((index - 1 + slides.length) % slides.length)}
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
                <button
                  className="arrow"
                  aria-label="Suivant"
                  onClick={() => setIndex((index + 1) % slides.length)}
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {offers.length ? (
          <div className="hero-side">
            {offers.slice(0, 2).map((banner) => (
              <article
                key={banner.id}
                className="offer-card"
                style={{ backgroundImage: `url('${banner.imageUrl}')` }}
              >
                <div className="offer-content">
                  <small>{pick(banner.kickerAr, banner.kickerEn)}</small>
                  <h2>{pick(banner.titleAr, banner.titleEn)}</h2>
                  <strong>
                    {banner.priceValue !== null
                      ? label(banner.priceValue)
                      : pick(banner.priceTextAr, banner.priceTextEn)}
                  </strong>
                  {pick(banner.ctaAr, banner.ctaEn) ? (
                    <button onClick={() => runBanner(banner)}>{pick(banner.ctaAr, banner.ctaEn)}</button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      {benefits.length ? (
        <div className="benefits">
          {benefits.map((benefit) => (
            <div className="benefit" key={benefit.id}>
              <i className={benefit.icon} />
              <div>
                <strong>{pick(benefit.titleAr, benefit.titleEn)}</strong>
                <small>{pick(benefit.subtitleAr, benefit.subtitleEn)}</small>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
