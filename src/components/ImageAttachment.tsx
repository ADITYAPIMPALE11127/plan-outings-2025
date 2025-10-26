import React, { useRef, useState } from 'react';

interface ImageAttachmentProps {
    onImageSelect: (imageUrl: string) => void;
}

const ImageAttachment: React.FC<ImageAttachmentProps> = ({ onImageSelect }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        setIsProcessing(true);

        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                onImageSelect(base64String);
                setIsProcessing(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Failed to process image');
            setIsProcessing(false);
        }
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            <button
                type="button"
                onClick={handleButtonClick}
                className="image-attach-button"
                title="Attach image"
                disabled={isProcessing}
            >
                <span className="image-icon">{isProcessing ? '⏳' : '📎'}</span>
            </button>
        </>
    );
};

export default ImageAttachment;
