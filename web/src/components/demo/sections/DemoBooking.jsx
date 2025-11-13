import { useState } from 'react';

const DemoBooking = () => {
  const [formData, setFormData] = useState({
    titulo: 'Festival Underground - Edição Verão',
    descricao: 'Grande festival de música eletrônica underground com público estimado de 2000 pessoas.',
    dataEvento: '2024-12-15',
    horario: '22:00',
    duracao: 4,
    localEvento: 'Parque Villa-Lobos',
    cidadeEvento: 'São Paulo',
    estadoEvento: 'SP',
  });

  const precoBase = 1500;
  const taxaPlataforma = precoBase * 0.07;
  const valorTotal = precoBase + taxaPlataforma;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in max-h-[70vh] overflow-y-auto pr-4">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Criar Booking</h2>
        <p className="text-gray-400 text-lg">
          Solicite um booking preenchendo os detalhes do evento
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-semibold text-white mb-4">
            Detalhes do Evento
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título do Evento *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className="w-full bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-vibrant"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição *
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={3}
              className="w-full bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-vibrant resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data do Evento *
              </label>
              <input
                type="date"
                name="dataEvento"
                value={formData.dataEvento}
                onChange={handleChange}
                className="w-full bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-vibrant"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Horário *
              </label>
              <input
                type="time"
                name="horario"
                value={formData.horario}
                onChange={handleChange}
                className="w-full bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-vibrant"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duração (horas) *
            </label>
            <input
              type="number"
              name="duracao"
              value={formData.duracao}
              onChange={handleChange}
              min="1"
              max="12"
              className="w-full bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-vibrant"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Local do Evento *
            </label>
            <input
              type="text"
              name="localEvento"
              value={formData.localEvento}
              onChange={handleChange}
              className="w-full bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-vibrant"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cidade *
              </label>
              <input
                type="text"
                name="cidadeEvento"
                value={formData.cidadeEvento}
                onChange={handleChange}
                className="w-full bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-vibrant"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estado *
              </label>
              <input
                type="text"
                name="estadoEvento"
                value={formData.estadoEvento}
                onChange={handleChange}
                maxLength="2"
                className="w-full bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-vibrant uppercase"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Resumo do Booking
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-red-vibrant to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎵</span>
                </div>
                <div>
                  <div className="font-semibold text-white">DJ Phoenix</div>
                  <div className="text-sm text-gray-400">Artista</div>
                  <div className="text-xs text-purple-400 font-medium">Plano PRO</div>
                </div>
              </div>

              <div className="border-t border-dark-600 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Preço Base</span>
                  <span className="text-white">
                    R$ {precoBase.toLocaleString('pt-BR')}/hora
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Duração</span>
                  <span className="text-white">{formData.duracao}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">
                    R$ {(precoBase * formData.duracao).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Taxa Plataforma (7%)</span>
                  <span className="text-white">
                    R$ {(taxaPlataforma * formData.duracao).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="border-t border-dark-600 pt-2 flex justify-between font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-red-vibrant text-lg">
                    R$ {(valorTotal * formData.duracao).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <span>ℹ️</span>
              Informações Importantes
            </h4>
            <ul className="text-sm text-blue-300 space-y-1">
              <li>• Pagamento retido até 48h após o evento</li>
              <li>• Distância &gt;200km requer 50% de adiantamento</li>
              <li>• Chat disponível após aceitação do booking</li>
            </ul>
          </div>

          <button className="w-full px-6 py-3 bg-gradient-to-r from-red-vibrant to-pink-600 text-white rounded-lg hover:scale-105 transition font-semibold text-lg shadow-lg shadow-red-vibrant/30">
            Enviar Solicitação
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoBooking;
