import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getOptimizedUrl } from '@/lib/cloudinary';
import { formatPrice } from '@/lib/format';
import styles from './SearchBar.module.css';

export default function SearchBar() {
  const { products, collections } = useSettings();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCategoryName = (categoryId: string) => {
    const col = collections.find((c: any) => c.id === categoryId);
    return col ? col.name.toLowerCase() : '';
  };

  const filteredProducts = query.trim() === '' 
    ? [] 
    : products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || getCategoryName(p.collectionId || '').includes(query.toLowerCase())).slice(0, 5); // Limit to 5 results

  const handleSelectProduct = (id: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/personalizar/${id}`);
  };

  return (
    <div className={styles.searchWrapper} ref={wrapperRef}>
      <div className={styles.inputContainer}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Buscar un producto..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={styles.searchInput}
        />
      </div>

      {isOpen && query.trim() !== '' && (
        <div className={styles.dropdownMenu}>
          {filteredProducts.length > 0 ? (
            <ul className={styles.resultList}>
              {filteredProducts.map(product => (
                <li key={product.id} className={styles.resultItem} onClick={() => handleSelectProduct(product.id)}>
                  <img src={getOptimizedUrl(product.image, 100) || '/placeholder.png'} alt={product.name} className={styles.resultImage} />
                  <div className={styles.resultInfo}>
                    <p className={styles.resultName}>{product.name}</p>
                    <p className={styles.resultPrice}>${formatPrice(product.price)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.noResults}>
              <p>No se encontraron productos.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
