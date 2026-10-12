'use client';

import { discountPercent } from '@/lib/format';
import { useStore } from './context';
import type { Product } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  const { pick, money, t, addToCart, quickView, wishlist, toggleWishlist, notify } = useStore();
  const discount = discountPercent(product.price, product.oldPrice);
  const isFavourite = wishlist.includes(product.id);
  const name = pick(product.nameAr, product.nameEn);

  // Toute la carte ouvre la fiche produit : les boutons internes stoppent
  // la propagation pour ne pas déclencher l'ouverture.
  const open = () => quickView(product.id);

  return (
    <article
      className="product"
      role="button"
      tabIndex={0}
      aria-label={name}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open();
        }
      }}
    >
      {discount > 0 ? <span className="discount">-{discount}%</span> : null}
      <span className="stock">{pick(product.stockAr, product.stockEn) || t('catalog.in_stock', 'En stock')}</span>
      <button
        className={`fav${isFavourite ? ' active' : ''}`}
        aria-label="Favori"
        onClick={(event) => {
          event.stopPropagation();
          toggleWishlist(product.id);
        }}
      >
        <i className={`${isFavourite ? 'fa-solid' : 'fa-regular'} fa-heart`} />
      </button>

      <div className="product-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" src={product.imageUrl} alt={name} />
      </div>

      <div className="product-info">
        <span className="brand">{product.brand}</span>
        <div className="product-title">{name}</div>
        <div className="rating">
          ★★★★★ <span>({product.rating})</span>
        </div>
        <div className="price-row">
          <span className="price">{money(product.price)}</span>
          {product.oldPrice && product.oldPrice > product.price ? (
            <span className="old">{money(product.oldPrice)}</span>
          ) : null}
        </div>
        <div className="card-actions">
          <button
            className="add"
            onClick={(event) => {
              event.stopPropagation();
              addToCart(product.id);
            }}
          >
            <i className="fa-solid fa-cart-plus" /> {t('catalog.add_to_cart', 'Ajouter au panier')}
          </button>
          <button
            className="compare"
            aria-label="Comparer"
            onClick={(event) => {
              event.stopPropagation();
              notify(t('compare.updated', 'Liste de comparaison mise à jour'));
            }}
          >
            <i className="fa-solid fa-code-compare" />
          </button>
        </div>
      </div>
    </article>
  );
}

/** Carrousel horizontal de produits, avec flèches de défilement. */
export function ProductCarousel({ products }: { products: Product[] }) {
  const scroll = (direction: number) => {
    const track = document.getElementById(`track-${products[0]?.id ?? 'empty'}`);
    track?.scrollBy({ left: direction * 450, behavior: 'smooth' });
  };

  if (!products.length) return null;

  return (
    <div className="carousel">
      <div className="track" id={`track-${products[0]?.id ?? 'empty'}`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <button className="carousel-btn prev" aria-label="Précédent" onClick={() => scroll(-1)}>
        <i className="fa-solid fa-chevron-left" />
      </button>
      <button className="carousel-btn next" aria-label="Suivant" onClick={() => scroll(1)}>
        <i className="fa-solid fa-chevron-right" />
      </button>
    </div>
  );
}
