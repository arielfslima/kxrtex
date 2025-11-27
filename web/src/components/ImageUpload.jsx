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
      alert('A imagem deve ter no maximo 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Apenas imagens sao permitidas');
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
        className={`relative border-2 border-dashed transition-all ${
          isDragging
            ? 'border-neon-red bg-neon-red/10'
            : 'border-dark-600 hover:border-dark-500'
        }`}
      >
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-void/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <div className="px-4 py-2 bg-neon-pink text-void font-bold font-mono text-sm uppercase tracking-wider hover:bg-neon-acid transition-colors">
                  Trocar Imagem
                </div>
              </label>
              {selectedFile && (
                <button
                  onClick={handleRemove}
                  className="px-4 py-2 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-wider hover:bg-chrome transition-colors"
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
            <div className="text-5xl font-display text-neon-red/50 mb-4">+</div>
            <div className="text-chrome font-display tracking-wider uppercase mb-2">
              {type === 'profile' ? 'Foto de Perfil' : 'Imagens do Portfolio'}
            </div>
            <div className="text-chrome/50 font-mono text-xs text-center px-4 uppercase">
              Clique para selecionar ou arraste uma imagem
            </div>
            <div className="text-chrome/30 font-mono text-xs mt-2 uppercase">
              Maximo 5MB - JPG, PNG ou WEBP
            </div>
          </label>
        )}
      </div>

      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={uploadMutation.isPending}
          className="w-full py-4 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-widest shadow-brutal hover:bg-neon-acid hover:shadow-brutal-acid transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadMutation.isPending ? 'Fazendo Upload...' : 'Salvar Imagem'}
        </button>
      )}

      {uploadMutation.error && (
        <div className="p-4 bg-neon-red/10 border-2 border-neon-red text-neon-red font-mono text-sm">
          {uploadMutation.error.response?.data?.message ||
           uploadMutation.error.response?.data?.error ||
           'Erro ao fazer upload. Tente novamente.'}
        </div>
      )}

      {uploadMutation.isSuccess && !selectedFile && (
        <div className="p-4 bg-neon-acid/10 border-2 border-neon-acid text-neon-acid font-mono text-sm uppercase">
          Imagem atualizada com sucesso!
        </div>
      )}
    </div>
  );
}
