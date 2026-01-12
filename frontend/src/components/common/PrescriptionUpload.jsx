import { useState, useRef } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../config/firebase'
import { Upload, X, Loader2, FileText, CheckCircle2, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'
import api from '../../services/api'

const PrescriptionUpload = ({
    value,
    onChange,
    onVerificationComplete,
    className = ''
}) => {
    const [uploading, setUploading] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [error, setError] = useState(null)
    const [preview, setPreview] = useState(value || null)
    const [verificationStatus, setVerificationStatus] = useState(null) // 'valid' | 'invalid' | null
    const [verificationMessage, setVerificationMessage] = useState('')
    const fileInputRef = useRef(null)

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file')
            return
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Image must be less than 10MB')
            return
        }

        setError(null)
        setVerificationStatus(null)
        setVerificationMessage('')
        setUploading(true)

        try {
            // Create preview immediately
            const previewUrl = URL.createObjectURL(file)
            setPreview(previewUrl)

            // Convert to base64 for AI verification
            const base64 = await fileToBase64(file)

            setUploading(false)
            setVerifying(true)

            // Send to backend for AI verification
            const verifyResponse = await api.post('/blood-requests/verify-prescription', {
                imageBase64: base64,
                mimeType: file.type
            })

            if (verifyResponse.data.isValid) {
                // Upload to Firebase Storage only if valid
                const fileName = `prescriptions/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
                const storageRef = ref(storage, fileName)

                await uploadBytes(storageRef, file)
                const downloadUrl = await getDownloadURL(storageRef)

                setVerificationStatus('valid')
                setVerificationMessage(verifyResponse.data.message || 'Prescription verified successfully')
                onChange(downloadUrl)
                setPreview(downloadUrl)
                onVerificationComplete?.(true, downloadUrl)
            } else {
                setVerificationStatus('invalid')
                setVerificationMessage(verifyResponse.data.message || 'This does not appear to be a valid prescription')
                setPreview(null)
                onChange('')
                onVerificationComplete?.(false, null)
            }
        } catch (err) {
            console.error('Upload/verification error:', err)

            // Detect specific error types
            let errorMessage = 'Failed to verify prescription. Please try again.'

            if (err.response?.status === 413 || err.message?.includes('too large')) {
                errorMessage = 'Image is too large. Please use an image under 5MB.'
            } else if (err.response?.status === 400) {
                errorMessage = err.response?.data?.error || 'Invalid request. Please try a different image.'
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error
            }

            setError(errorMessage)
            setPreview(null)
            setVerificationStatus(null)
        } finally {
            setUploading(false)
            setVerifying(false)
        }
    }

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => {
                // Remove the data:image/...;base64, prefix
                const base64 = reader.result.split(',')[1]
                resolve(base64)
            }
            reader.onerror = error => reject(error)
        })
    }

    const handleRemove = (e) => {
        e.stopPropagation()
        setPreview(null)
        setVerificationStatus(null)
        setVerificationMessage('')
        setError(null)
        onChange('')
        onVerificationComplete?.(false, null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleClick = () => {
        if (!uploading && !verifying) {
            fileInputRef.current?.click()
        }
    }

    const isLoading = uploading || verifying

    return (
        <div className={cn("space-y-3", className)}>
            <div
                onClick={handleClick}
                className={cn(
                    "relative cursor-pointer border-2 border-dashed rounded-xl p-6 transition-all duration-300",
                    "hover:border-rose-400 hover:bg-rose-50/30",
                    preview ? 'border-solid' : 'border-slate-300 bg-slate-50',
                    verificationStatus === 'valid' && 'border-green-400 bg-green-50/30',
                    verificationStatus === 'invalid' && 'border-red-400 bg-red-50/30',
                    isLoading && 'pointer-events-none opacity-70'
                )}
            >
                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Prescription preview"
                            className="w-full h-48 object-contain rounded-lg bg-white"
                        />
                        {!isLoading && (
                            <button
                                onClick={handleRemove}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                        <FileText className="w-12 h-12 mb-3" />
                        <p className="text-sm font-medium text-slate-600">Upload Prescription Image</p>
                        <p className="text-xs text-slate-400 mt-1">Click to select a file</p>
                    </div>
                )}

                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-xl">
                        <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-2" />
                        <p className="text-sm font-medium text-slate-600">
                            {uploading ? 'Uploading...' : 'Verifying with AI...'}
                        </p>
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

            {/* Verification Status */}
            {verificationStatus && (
                <div className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium",
                    verificationStatus === 'valid' && 'bg-green-50 text-green-700 border border-green-200',
                    verificationStatus === 'invalid' && 'bg-red-50 text-red-700 border border-red-200'
                )}>
                    {verificationStatus === 'valid' ? (
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    ) : (
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span>{verificationMessage}</span>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-700 border border-red-200">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <p className="text-xs text-slate-500">
                Upload a clear image of your blood request prescription. The image will be verified by AI to ensure it's a valid medical document.
            </p>
        </div>
    )
}

export default PrescriptionUpload
