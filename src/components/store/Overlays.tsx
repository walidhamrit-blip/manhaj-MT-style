'use client';

import { useEffect, useState } from 'react';
import { useStore } from './context';
import { makeReference } from '@/lib/format';
import type { Order } from '@/lib/types';

/**
 * Éléments flottants : panier, fenêtre modale, notifications, boutons
 * WhatsApp / retour en haut, et voile de fermeture.
 */
export default function Overlays() {
  const {
    content, lang, t, pick, money, cartItems, cartCount, subtotal, deliveryFee, total, cartOpen, setCartOpen,
    changeQty, removeFromCart, clearCart, modal, closeModal, toasts, notify, drawerOpen, setDrawerOpen,
    megaOpen, setMegaOpen, openModal,
  } = useStore();

  const [showBack, setShowBack] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBack(window.scrollY > 600);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCartOpen(false);
        setDrawerOpen(false);
        setMegaOpen(false);
        closeModal();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeModal, setCartOpen, setDrawerOpen, setMegaOpen]);

  const overlayActive = cartOpen || drawerOpen || megaOpen;
  const whatsapp = String(content.settings['contact.whatsapp'] ?? '');

  const openCheckout = () => {
    if (!cartItems.length) {
      notify(t('cart.empty_toast', 'Votre panier est vide'));
      return;
    }
    setCartOpen(false);

    openModal(
      t('checkout.title', 'Finaliser la commande'),
      <form
        className="form-grid"
        onSubmit={async (event) => {
          event.preventDefault();
          if (checkoutBusy) return;
          setCheckoutBusy(true);
          const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
          try {
            const response = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...data,
                reference: makeReference(),
                lang,
                items: cartItems.map((line) => ({ id: line.product.id, qty: line.qty })),
              }),
            });
            const payload = (await response.json()) as { order?: Order; error?: string };
            if (!response.ok || !payload.order) throw new Error(payload.error ?? 'failed');
            clearCart();
            openModal(
              t('checkout.success_title', 'Commande reçue'),
              <div className="empty">
                <div>
                  <i className="fa-solid fa-circle-check" style={{ color: '#22a85a' }} />
                  <h2>{t('checkout.success_title', 'Commande reçue')}</h2>
                  <p>{t('checkout.success_body', 'Nous vous contactons rapidement')}</p>
                  <p style={{ marginTop: 12 }}>
                    <strong>{payload.order.reference}</strong>
                  </p>
                </div>
              </div>,
            );
          } catch (error) {
            notify(error instanceof Error && error.message !== 'failed'
              ? error.message
              : t('checkout.failed', 'Échec de l’envoi'));
          } finally {
            setCheckoutBusy(false);
          }
        }}
      >
        <div className="field">
          <label>{t('checkout.name', 'Nom complet')}</label>
          <input name="customerName" required />
        </div>
        <div className="field">
          <label>{t('checkout.phone', 'Téléphone')}</label>
          <input name="phone" required />
        </div>
        <div className="field full">
          <label>{t('checkout.address', 'Adresse de livraison')}</label>
          <input name="address" required />
        </div>
        <div className="field">
          <label>{t('checkout.city', 'Ville')}</label>
          <input name="city" defaultValue={t('checkout.city_default', 'Tripoli')} />
        </div>
        <div className="field">
          <label>{t('checkout.payment', 'Mode de paiement')}</label>
          <select name="paymentMethod">
            <option value="cod">{t('checkout.cod', 'Paiement à la livraison')}</option>
            <option value="card">{t('checkout.card', 'Carte bancaire')}</option>
          </select>
        </div>
        <div className="field full">
          <label>{t('checkout.note', 'Remarques (optionnel)')}</label>
          <input name="note" />
        </div>
        <div className="field full">
          <div style={{ marginBottom: 10, fontSize: 12, color: '#68757d' }}>
            {cartCount} × {t('cart.total', 'Total')} : <strong>{money(total)}</strong>
          </div>
          <button className="submit" disabled={checkoutBusy}>
            {t('checkout.submit', 'CONFIRMER LA COMMANDE')}
          </button>
        </div>
      </form>,
    );
  };

  return (
    <>
      <div
        className={`overlay${overlayActive ? ' active' : ''}`}
        onClick={() => {
          setCartOpen(false);
          setDrawerOpen(false);
          setMegaOpen(false);
        }}
      />

      {/* Panier */}
      <aside className={`cart${cartOpen ? ' open' : ''}`}>
        <div className="cart-head">
          <h2>{t('cart.title', 'Panier')}</h2>
          <button className="close" aria-label="Fermer" onClick={() => setCartOpen(false)}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty">
              <div>
                <i className="fa-solid fa-cart-shopping" />
                <strong>{t('cart.empty_title', 'Votre panier est vide')}</strong>
                <p>{t('cart.empty_hint', 'Ajoutez vos fournitures préférées')}</p>
              </div>
            </div>
          ) : (
            cartItems.map((line) => (
              <div className="cart-item" key={line.product.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={line.product.imageUrl} alt="" />
                <div>
                  <h4>{pick(line.product.nameAr, line.product.nameEn)}</h4>
                  <strong>{money(line.product.price)}</strong>
                  <div className="qty">
                    <button onClick={() => changeQty(line.product.id, -1)}>−</button>
                    <span>{line.qty}</span>
                    <button onClick={() => changeQty(line.product.id, 1)}>+</button>
                  </div>
                </div>
                <button className="remove" aria-label="Retirer" onClick={() => removeFromCart(line.product.id)}>
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="cart-footer">
          {deliveryFee > 0 ? (
            <div className="total" style={{ fontSize: 12 }}>
              <span>{t('cart.delivery', 'Livraison')}</span>
              <strong style={{ fontSize: 15 }}>{money(deliveryFee)}</strong>
            </div>
          ) : null}
          <div className="total">
            <span>{t('cart.total', 'Total')}</span>
            <strong>{money(total)}</strong>
          </div>
          <button className="checkout" onClick={openCheckout}>
            {t('cart.checkout', 'FINALISER')}
          </button>
        </div>
      </aside>

      {/* Fenêtre modale */}
      <div
        className={`modal-layer${modal ? ' active' : ''}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}
      >
        <div className="modal">
          <div className="modal-head">
            <h2>{modal?.title}</h2>
            <button className="close" aria-label="Fermer" onClick={closeModal}>
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
          <div className="modal-body">{modal?.body}</div>
        </div>
      </div>

      {/* Notifications */}
      <div className="toasts">
        {toasts.map((toast) => (
          <div className="toast" key={toast.id}>
            <i className="fa-solid fa-circle-check" /> {toast.message}
          </div>
        ))}
      </div>

      {/* Boutons flottants */}
      <div className="floating">
        {whatsapp ? (
          <a
            className="float"
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
          >
            <i className="fa-brands fa-whatsapp" />
          </a>
        ) : null}
        <button
          className={`float back${showBack ? ' show' : ''}`}
          aria-label="Haut de page"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <i className="fa-solid fa-chevron-up" />
        </button>
      </div>
    </>
  );
}
