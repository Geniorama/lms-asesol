"use client"

import { useState } from "react"

interface FileUploadProps {
  label: string
  accept?: string
  required?: boolean
  onChange: (file: File | null) => void
  hint?: string
  value?: File | null
}

export default function FileUpload({ 
  label, 
  accept = "image/*,.pdf", 
  required = false, 
  onChange,
  hint = "JPG, PNG o PDF (máx. 5MB)",
  value
}: FileUploadProps) {
  const [fileName, setFileName] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>("")

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setFileName("")
      setError("")
      onChange(null)
      return
    }

    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB en bytes
    if (file.size > maxSize) {
      setError("El archivo es muy grande. Máximo 5MB")
      return
    }

    setFileName(file.name)
    setError("")
    onChange(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleFileChange(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const removeFile = () => {
    handleFileChange(null)
  }

  const getFileIcon = () => {
    if (!fileName) return null
    
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    if (extension === 'pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h10l4 4v16H2v-1z"/>
        </svg>
      )
    }
    
    return (
      <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
      </svg>
    )
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : fileName
            ? "border-green-500 bg-green-50"
            : error
            ? "border-red-500 bg-red-50"
            : "border-gray-300 bg-white hover:border-gray-400"
        }`}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id={`file-upload-${label}`}
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          {fileName ? (
            // Archivo seleccionado
            <div className="w-full">
              <div className="flex items-center justify-center mb-2">
                {getFileIcon()}
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1 break-all">
                {fileName}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  removeFile()
                }}
                className="mt-2 px-3 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors cursor-pointer"
              >
                ✕ Eliminar archivo
              </button>
            </div>
          ) : (
            // Sin archivo
            <>
              <svg
                className="w-12 h-12 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {isDragging ? "¡Suelta el archivo aquí!" : "Arrastra un archivo o haz clic para seleccionar"}
              </p>
              <p className="text-xs text-gray-500">{hint}</p>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
