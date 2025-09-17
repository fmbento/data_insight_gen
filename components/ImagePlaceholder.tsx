
import React from 'react';
import type { VisualElement } from '../types';

interface ImagePlaceholderProps {
    element: VisualElement;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ element }) => {
    const isAnimated = element.type === 'animated_graphic';
    const imageUrl = `https://picsum.photos/seed/${element.visualization_of.replace(/\s/g, '')}/600/400`;
    
    return (
        <div className="rounded-lg border border-slate-200 overflow-hidden group">
            <div className="relative aspect-w-16 aspect-h-9 bg-slate-100">
                <img src={imageUrl} alt={element.visualization_of} className="w-full h-full object-cover" />
                {isAnimated && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                         <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                        </div>
                    </div>
                )}
                 <span className="absolute top-2 left-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {isAnimated ? 'Animated Graphic' : 'Image'}
                 </span>
            </div>
            <div className="p-4 bg-white">
                <p className="font-semibold text-slate-700">Visualizing: {element.visualization_of}</p>
                <p className="text-sm text-slate-500 mt-1">{element.description}</p>
            </div>
        </div>
    );
};


export default ImagePlaceholder;
