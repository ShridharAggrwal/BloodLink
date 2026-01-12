import { useState, useRef, useEffect } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../config/firebase'
import { Upload, X, Loader2, User } from 'lucide-react'
import { cn } from '../../lib/utils'

const ImageUpload = ({
    value,
    onChange,
    folder = 'profiles',
    className = '',
    size = 'md',
    shape = 'circle',
    placeholder = null
}) => {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)
    const [preview, setPreview] = useState(value || null)
    const fileInputRef = useRef(null)

    // Sync preview with value prop (for when profile loads from API)
    useEffect(() => {
        if (value && value !== preview) {
            setPreview(value)
        }
    }, [value])


    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
        xl: 'w-40 h-40'
    }

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB')
            return
        }

        setError(null)
        setUploading(true)

        try {
            // Create preview immediately
            const previewUrl = URL.createObjectURL(file)
            setPreview(previewUrl)

            // Upload to Firebase Storage
            const fileName = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
            const storageRef = ref(storage, fileName)

            await uploadBytes(storageRef, file)
            const downloadUrl = await getDownloadURL(storageRef)

            // Call onChange with the download URL
            onChange(downloadUrl)
            setPreview(downloadUrl)
        } catch (err) {
            console.error('Upload error:', err)

            // Provide specific error messages based on error type
            let errorMessage = 'Failed to upload image.'

            if (err.code === 'storage/unauthorized') {
                errorMessage = 'Upload not authorized. Please check Firebase Storage rules.'
            } else if (err.code === 'storage/canceled') {
                errorMessage = 'Upload was cancelled.'
            } else if (err.code === 'storage/quota-exceeded') {
                errorMessage = 'Storage quota exceeded. Please contact support.'
            } else if (err.code === 'storage/invalid-checksum') {
                errorMessage = 'File corrupted during upload. Please try again.'
            } else if (err.code === 'storage/retry-limit-exceeded') {
                errorMessage = 'Upload timed out. Please check your internet connection.'
            } else if (err.code === 'storage/unknown') {
                errorMessage = 'Image too large or network error. Try a smaller image.'
            } else if (err.message?.includes('network')) {
                errorMessage = 'Network error. Please check your internet connection.'
            } else if (err.message?.includes('Firebase')) {
                errorMessage = 'Firebase not configured. Check your environment variables.'
            } else if (file.size > 3 * 1024 * 1024) {
                errorMessage = `Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Try an image under 3MB.`
            }

            setError(errorMessage)
            setPreview(value || null)
        } finally {
            setUploading(false)
        }
    }


    const handleRemove = (e) => {
        e.stopPropagation()
        setPreview(null)
        onChange('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleClick = () => {
        if (!uploading) {
            fileInputRef.current?.click()
        }
    }

    return (
        <div className={cn("flex flex-col items-center gap-2", className)}>
            <div
                onClick={handleClick}
                className={cn(
                    "relative cursor-pointer overflow-hidden border-2 border-dashed transition-all duration-300",
                    "hover:border-rose-400 hover:bg-rose-50/30",
                    shape === 'circle' ? 'rounded-full' : 'rounded-xl',
                    sizeClasses[size],
                    preview ? 'border-solid border-slate-200' : 'border-slate-300 bg-slate-50',
                    uploading && 'pointer-events-none opacity-70'
                )}
            >
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Upload preview"
                            className="w-full h-full object-cover"
                        />
                        {!uploading && (
                            <button
                                onClick={handleRemove}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        {placeholder || <User className="w-8 h-8" />}
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                )}

                {/* Hover overlay */}
                {!uploading && !preview && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 hover:opacity-100 bg-slate-900/20 transition-opacity">
                        <Upload className="w-5 h-5 text-slate-600" />
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {error && (
                <p className="text-xs text-red-500 text-center max-w-[200px]">{error}</p>
            )}

            <button
                type="button"
                onClick={handleClick}
                disabled={uploading}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium disabled:opacity-50"
            >
                {uploading ? 'Uploading...' : preview ? 'Change Photo' : 'Upload Photo'}
            </button>
        </div>
    )
}

export default ImageUpload
