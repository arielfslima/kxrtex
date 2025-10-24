import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export default function PortfolioUpload({ currentPortfolio = [], limit = 5, onSuccess }) {
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (files) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('photos', file);
      });

      const response = await api.post('/upload/portfolio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['artist']);
      queryClient.invalidateQueries(['user']);
      onSuccess?.(data);
      setSelectedFiles([]);
      setPreviews([]);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (imageUrl) => {
      const response = await api.delete('/upload/portfolio', {
        data: { imageUrl }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['artist']);
      queryClient.invalidateQueries(['user']);
    }
  });

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);

    const totalImages = currentPortfolio.length + selectedFiles.length + fileArray.length;
    if (totalImages > limit) {
      alert(`Você atingiu o limite de ${limit} imagens para o seu plano`);
      return;
    }

    const validFiles = fileArray.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} é muito grande. Máximo 5MB`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} não é uma imagem válida`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, { file: file.name, url: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemovePreview = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExisting = (imageUrl) => {
    if (confirm('Tem certeza que deseja remover esta imagem do portfolio?')) {
      deleteMutation.mutate(imageUrl);
    }
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      uploadMutation.mutate(selectedFiles);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Portfolio */}
      {currentPortfolio.length > 0 && (
        <div>
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="text-xl">🎨</span>
            Portfolio Atual ({currentPortfolio.length}/{limit})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {currentPortfolio.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Portfolio ${index + 1}`}
                  className="w-full h-48 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <button
                    onClick={() => handleDeleteExisting(imageUrl)}
                    disabled={deleteMutation.isPending}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? '...' : 'Remover'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      {currentPortfolio.length < limit && (
        <div>
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="text-xl">📤</span>
            Adicionar Novas Imagens
          </h3>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-2xl transition-all ${
              isDragging
                ? 'border-red-vibrant bg-red-vibrant/10'
                : 'border-dark-700 hover:border-dark-600'
            }`}
          >
            <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
              <div className="text-6xl mb-4">📷</div>
              <div className="text-white font-bold mb-2">
                Adicionar Imagens ao Portfolio
              </div>
              <div className="text-gray-400 text-sm text-center px-4">
                Clique ou arraste múltiplas imagens
              </div>
              <div className="text-gray-500 text-xs mt-2">
                Máximo 5MB por imagem - JPG, PNG ou WEBP
              </div>
              <div className="text-gray-400 text-xs mt-1">
                Você pode adicionar até {limit - currentPortfolio.length} imagens
              </div>
            </label>
          </div>

          {/* Preview of Selected Files */}
          {previews.length > 0 && (
            <div className="mt-4">
              <h4 className="text-white font-semibold mb-3">
                Imagens Selecionadas ({previews.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <button
                        onClick={() => handleRemovePreview(index)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedFiles.length > 0 && (
            <button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="w-full mt-4 py-4 bg-gradient-to-r from-red-vibrant to-pink-600 text-white font-bold rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-red-vibrant/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {uploadMutation.isPending
                ? 'Fazendo Upload...'
                : `Adicionar ${selectedFiles.length} Imagem(ns)`}
            </button>
          )}
        </div>
      )}

      {/* Errors */}
      {(uploadMutation.error || deleteMutation.error) && (
        <div className="p-4 bg-red-vibrant/10 border border-red-vibrant/50 rounded-xl text-red-vibrant text-sm">
          {uploadMutation.error?.response?.data?.message ||
           deleteMutation.error?.response?.data?.message ||
           uploadMutation.error?.response?.data?.error ||
           deleteMutation.error?.response?.data?.error ||
           'Erro na operação. Tente novamente.'}
        </div>
      )}

      {/* Success */}
      {uploadMutation.isSuccess && selectedFiles.length === 0 && (
        <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 text-sm">
          Imagens adicionadas ao portfolio com sucesso!
        </div>
      )}

      {deleteMutation.isSuccess && (
        <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 text-sm">
          Imagem removida do portfolio com sucesso!
        </div>
      )}

      {/* Plan Limits Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="text-blue-400 text-sm">
          <div className="font-bold mb-2">Limites por Plano:</div>
          <div className="space-y-1 text-xs">
            <div>FREE: 5 imagens</div>
            <div>PLUS: 15 imagens</div>
            <div>PRO: Ilimitado</div>
          </div>
        </div>
      </div>
    </div>
  );
}
