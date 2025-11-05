// components/MetadataHead.js
'use client';

import { useEffect } from 'react';
import { useServerMetadata } from '@/hooks/useServerMetadata';

const MetadataHead = ({ page, customMetadata = {} }) => {
  const { metadata, loading } = useServerMetadata(page);
  
  useEffect(() => {
    if (loading || !metadata) return;

    // Update title
    if (metadata.title) {
      document.title = metadata.title;
    }

    // Update meta tags
    const updateMetaTag = (name, content) => {
      if (!content) return;
      
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.querySelector(`meta[property="${name}"]`);
      }
      
      if (tag) {
        tag.setAttribute('content', content);
      } else {
        // Create new meta tag if it doesn't exist
        tag = document.createElement('meta');
        if (name.startsWith('og:')) {
          tag.setAttribute('property', name);
        } else {
          tag.setAttribute('name', name);
        }
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
      }
    };

    // Update description
    updateMetaTag('description', metadata.description);
    updateMetaTag('keywords', metadata.keywords);

    // Update Open Graph tags
    updateMetaTag('og:title', metadata.title);
    updateMetaTag('og:description', metadata.description);
    updateMetaTag('og:type', 'website');

    // Update Twitter tags
    updateMetaTag('twitter:title', metadata.title);
    updateMetaTag('twitter:description', metadata.description);

  }, [metadata, loading]);

  // This component doesn't render anything to avoid hydration issues
  return null;
};

export default MetadataHead;