import React, { useEffect, useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { getProductImageUrl } from '../utils/productImages';

const ProductImage = ({ src, alt, containerClassName, imageClassName }) => {
  const [failed, setFailed] = useState(false);
  const imageUrl = getProductImageUrl(src);

  useEffect(() => setFailed(false), [imageUrl]);

  return (
    <div className={`flex items-center justify-center overflow-hidden bg-gray-100 ${containerClassName}`}>
      {imageUrl && !failed ? (
        <img src={imageUrl} alt={alt} className={imageClassName} onError={() => setFailed(true)} />
      ) : (
        <div role="img" aria-label={`No image available for ${alt}`} className="flex h-full w-full items-center justify-center">
          <PhotoIcon className="h-7 w-7 text-gray-400" />
        </div>
      )}
    </div>
  );
};

export default ProductImage;