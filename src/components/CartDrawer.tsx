"use client";
import React from 'react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { getOptimizedUrl } from '@/lib/cloudinary';
import { getWhatsAppLink } from '@/lib/whatsapp';
import { X, Trash2, ShoppingBag, MessageCircle } from 'lucide-react';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { cartItems, isCartOpen, closeCart, updateQuantity, removeFromCart, cartTotal, getEffectivePrice } = useCart();
  const { settings } = useSettings();

  const handleWhatsAppCheckout = () => {
    if (cartItems.length === 0) return;

    let itemsText = cartItems.map((item, index) => {
      const effectivePrice = getEffectivePrice(item.productId, item.unitPrice);
      let text = `${index + 1}. ${item.quantity}x ${item.name} - $${(effectivePrice * item.quantity).toLocaleString()}`;
      if (item.customText) {
        text += `\n   Texto: "${item.customText}"`;
      }
      return text;
    }).join('\n\n');

    const message = `Hola, me gustaría realizar el siguiente pedido:\n\n${itemsText}\n\n*Total estimado:* $${cartTotal.toLocaleString()}COP`;
    window.open(getWhatsAppLink(settings.contact.phone, message), "_blank");
  };

  return (
    <>
      <div 
        className={`${styles.overlay} ${isCartOpen ? styles.overlayOpen : ''}`} 
        onClick={closeCart}
      />
      <div className={`${styles.drawer} ${isCartOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.header}>
          <h2>Tu Carrito</h2>
          <button onClick={closeCart} className={styles.closeBtn} aria-label="Cerrar carrito">
            <X size={24} />
          </button>
        </div>

        <div className={styles.itemsContainer}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyState}>
              <ShoppingBag size={48} className={styles.emptyStateIcon} />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            cartItems.map((item) => {
              const effectivePrice = getEffectivePrice(item.productId, item.unitPrice);
              const hasDiscount = effectivePrice < item.unitPrice;

              return (
                <div key={item.id} className={styles.item}>
                  <img 
                    src={getOptimizedUrl(item.image, 150) || '/placeholder.png'} 
                    alt={item.name} 
                    className={styles.itemImage}
                  />
                  <div className={styles.itemDetails}>
                    <h4 className={styles.itemName}>{item.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <p className={styles.itemPrice} style={hasDiscount ? { fontWeight: 600, color: 'var(--primary)' } : {}}>
                        ${effectivePrice.toLocaleString()} {hasDiscount && <span style={{ fontSize: '0.75rem', background: '#e0ffe0', color: '#008000', padding: '0.1rem 0.3rem', borderRadius: '4px', marginLeft: '0.2rem' }}>¡Precio por Volumen!</span>}
                      </p>
                    </div>
                    
                    {item.customText && (
                      <span className={styles.itemText}>✍️ {item.customText}</span>
                    )}

                    <div className={styles.itemActions}>
                      <div className={styles.qtyControl}>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className={styles.qtyBtn}
                          disabled={item.quantity <= 1}
                        >-</button>
                        <span className={styles.qtyValue}>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className={styles.qtyBtn}
                        >+</button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className={styles.removeBtn}
                        aria-label="Eliminar producto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.summary}>
            <p className={styles.summaryTitle}>Total</p>
            <p className={styles.summaryValue}>${cartTotal.toLocaleString()}</p>
          </div>
          <button 
            className={styles.checkoutBtn}
            onClick={handleWhatsAppCheckout}
            disabled={cartItems.length === 0}
          >
            <MessageCircle size={20} />
            Finalizar por WhatsApp
          </button>
        </div>
      </div>
    </>
  );
}
