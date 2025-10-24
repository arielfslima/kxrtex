import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export default function ImageUpload({ currentImage, onSuccess, type = 'profile' }) {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState(currentImage || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      if (type === 'profile') {
        formData.append('photo', file);
        const response = await api.post('/upload/profile-photo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else if (type === 'portfolio') {
        formData.append('photos', file);
        const response = await api.post('/upload/portfolio', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['user']);
      queryClient.invalidateQueries(['artist']);
      onSuccess?.(data);
      setSelectedFile(null);
    }
  });

  const handleFileSelect = (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Apenas imagens são permitidas');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(currentImage);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-2xl transition-all ${
          isDragging
            ? 'border-red-vibrant bg-red-vibrant/10'
            : 'border-dark-700 hover:border-dark-600'
        }`}
      >
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-2xl"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
                  Trocar Imagem
                </div>
              </label>
              {selectedFile && (
                <button
                  onClick={handleRemove}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-64 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            <div className="text-6xl mb-4">📷</div>
            <div className="text-white font-bold mb-2">
              {type === 'profile' ? 'Foto de Perfil' : 'Imagens do Portfolio'}
            </div>
            <div className="text-gray-400 text-sm text-center px-4">
              Clique para selecionar ou arraste uma imagem
            </div>
            <div className="text-gray-500 text-xs mt-2">
              Máximo 5MB - JPG, PNG ou WEBP
            </div>
          </label>
        )}
      </div>

      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={uploadMutation.isPending}
          className="w-full py-4 bg-gradient-to-r from-red-vibrant to-pink-600 text-white font-bold rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-red-vibrant/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {uploadMutation.isPending ? 'Fazendo Upload...' : 'Salvar Imagem'}
        </button>
      )}

      {uploadMutation.error && (
        <div className="p-4 bg-red-vibrant/10 border border-red-vibrant/50 rounded-xl text-red-vibrant text-sm">
          {uploadMutation.error.response?.data?.message ||
           uploadMutation.error.response?.data?.error ||
           'Erro ao fazer upload. Tente novamente.'}
        </div>
      )}

      {uploadMutation.isSuccess && !selectedFile && (
        <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 text-sm">
          Imagem atualizada com sucesso!
        </div>
      )}
    </div>
  );
}
