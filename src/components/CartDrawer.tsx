"use client";
import React from 'react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { getOptimizedUrl } from '@/lib/cloudinary';
import { getWhatsAppLink } from '@/lib/whatsapp';
import { formatPrice } from '@/lib/format';
import { X, Trash2, ShoppingBag, MessageCircle, CreditCard } from 'lucide-react';
import styles from './CartDrawer.module.css';
import Script from 'next/script';

export default function CartDrawer() {
  const { cartItems, isCartOpen, closeCart, updateQuantity, removeFromCart, cartTotal, getEffectivePrice } = useCart();
  const { settings } = useSettings();
  const [isWompiLoading, setIsWompiLoading] = React.useState(false);

  const handleWhatsAppCheckout = () => {
    if (cartItems.length === 0) return;

    let itemsText = cartItems.map((item, index) => {
      const effectivePrice = getEffectivePrice(item);
      let text = `${index + 1}. ${item.quantity}x ${item.name} - $${formatPrice(effectivePrice * item.quantity)}`;
      if (item.customText) {
        text += `\n   Texto: "${item.customText}"`;
      }
      return text;
    }).join('\n\n');

    const message = `Hola, me gustaría realizar el siguiente pedido:\n\n${itemsText}\n\n*Total estimado:* $${formatPrice(cartTotal)}COP`;
    window.open(getWhatsAppLink(settings.contact.phone, message), "_blank");
  };

  const handleWompiCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsWompiLoading(true);

    try {
      const reference = `Luz-${Date.now()}`;
      
      // 1. Obtener la firma de integridad desde el backend
      const response = await fetch('/api/payments/wompi/integrity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cartTotal,
          reference
        })
      });

      const { signature, amountInCents, publicKey } = await response.json();

      // 2. Abrir el Widget de Wompi
      // @ts-ignore
      const checkout = new window.WidgetCheckout({
        currency: 'COP',
        amountInCents,
        reference,
        publicKey,
        signature,
        // redirectUrl: `${window.location.origin}/checkout/result` // Opcional
      });

      checkout.open((result: any) => {
        const transaction = result.transaction;
        if (transaction.status === 'APPROVED') {
          // Aquí podríamos limpiar el carrito o redirigir
          console.log('Pago aprobado!', transaction);
        }
      });
    } catch (error) {
      console.error('Error al iniciar pago con Wompi:', error);
      alert('Hubo un error al conectar con la pasarela de pagos.');
    } finally {
      setIsWompiLoading(false);
    }
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
              const effectivePrice = getEffectivePrice(item);
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {hasDiscount ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.85rem' }}>
                            ${formatPrice(item.unitPrice)}
                          </span>
                          <span className={styles.itemPrice} style={{ fontWeight: 600, color: 'var(--primary)' }}>
                            ${formatPrice(effectivePrice)}
                          </span>
                          <span style={{ fontSize: '0.75rem', background: '#e0ffe0', color: '#008000', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>
                            ¡Precio por Volumen!
                          </span>
                        </>
                      ) : (
                        <p className={styles.itemPrice}>
                          ${formatPrice(effectivePrice)}
                        </p>
                      )}
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
            <p className={styles.summaryValue}>${formatPrice(cartTotal)}</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {settings.wompiEnabled && (
              <button 
                className={styles.wompiBtn}
                onClick={handleWompiCheckout}
                disabled={cartItems.length === 0 || isWompiLoading}
              >
                <CreditCard size={20} />
                {isWompiLoading ? 'Cargando...' : 'Pagar con Wompi'}
              </button>
            )}

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
        <Script src="https://checkout.wompi.co/widget.js" strategy="lazyOnload" />
      </div>
    </>
  );
}
